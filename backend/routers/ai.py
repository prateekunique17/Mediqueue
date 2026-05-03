import asyncio
from fastapi import APIRouter, HTTPException
import os
import json
import httpx
import uuid
from database import supabase
from dotenv import load_dotenv

load_dotenv(override=True)
LM_STUDIO_URL = os.getenv("LM_STUDIO_URL", "http://127.0.0.1:1234").strip()
LM_STUDIO_MODEL = os.getenv("LM_STUDIO_MODEL", "").strip()

router = APIRouter(prefix="/api/ai", tags=["AI"])

async def call_ai(prompt: str):
    """Exclusively calls LM Studio for AI processing."""
    url = f"{LM_STUDIO_URL}/v1/completions"
    
    payload = {
        "model": LM_STUDIO_MODEL,
        "prompt": prompt,
        "max_tokens": 1024,
        "temperature": 0.7,
        "stream": False
    }

    try:
        print(f"[AI] Calling Local LM Studio (Gemma-4-e4b)...")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code != 200:
                print(f"[!] LM Studio Error: {response.text}")
                raise HTTPException(status_code=503, detail="LM Studio Service Error")

            data = response.json()
            text = data['choices'][0]['text'].strip()
            
            # Clean up potential markdown formatting if model returns it
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            print(f"[+] Success from LM Studio")
            return text
            
    except Exception as e:
        print(f"[!] AI Connection Failed: {e}")
        raise HTTPException(status_code=503, detail="Local AI Server is down. Please start LM Studio.")

@router.post("/generate-form")
async def generate_form(data: dict):
    symptoms = data.get("symptoms", "General")
    prompt = f"""
    A patient reports these symptoms: "{symptoms}". Generate 5 follow-up diagnostic questions.
    
    STRICT RULES:
    1. Return ONLY a valid JSON object.
    2. Types allowed: "yesno", "severity" (scale 1-10), or "checkbox".
    3. If type is "checkbox", you MUST include an "options" key with a list of 4 relevant strings.
    
    JSON Schema:
    {{ 
      "questions": [ 
        {{ "id": "q1", "text": "...", "type": "yesno|severity|checkbox", "options": ["opt1", "opt2"] }} 
      ] 
    }}
    """
    try:
        raw_json = await call_ai(prompt)
        # Handle cases where model adds leading/trailing text
        start = raw_json.find('{')
        end = raw_json.rfind('}') + 1
        if start != -1 and end != -1:
            raw_json = raw_json[start:end]
            
        return json.loads(raw_json)
    except Exception as e:
        print(f"[ERROR] generate-form failed: {e}")
        raise HTTPException(status_code=500, detail="AI failed to generate clinical form.")

@router.post("/analyze-triage")
async def analyze_triage(data: dict):
    prob = data.get("primaryProblem", "Unknown")
    ans = data.get("answers", {})
    prompt = f"""
    Analyze the following patient data:
    Primary Complaint: {prob}
    Detailed Answers: {json.dumps(ans)}
    
    Return a clinical triage report in JSON format.
    Fields: 
    - urgency: (EMERGENCY, HIGH, MODERATE, ROUTINE)
    - doctorType: (e.g. Cardiologist, General Physician)
    - summary: (An array of 3-4 medical observations)
    
    Format:
    {{
      "urgency": "...",
      "doctorType": "...",
      "summary": ["...", "...", "..."]
    }}
    """
    try:
        raw_json = await call_ai(prompt)
        # Handle cases where model adds leading/trailing text
        start = raw_json.find('{')
        end = raw_json.rfind('}') + 1
        if start != -1 and end != -1:
            raw_json = raw_json[start:end]
            
        report = json.loads(raw_json)
        if isinstance(report.get("summary"), str): report["summary"] = [report["summary"]]
        return report
    except Exception as e:
        print(f"[ERROR] analyze-triage failed: {e}")
        raise HTTPException(status_code=500, detail="AI failed to process triage analysis.")

@router.post("/save-triage")
async def save_triage(data: dict):
    if not supabase: return {"status": "skipped"}
    
    p_id = data.get("patient_id")
    if p_id == "guest_user" or not p_id:
        try:
            existing_users = supabase.table("users").select("uid").execute()
            if existing_users.data:
                p_id = existing_users.data[0]["uid"]
            else:
                p_id = str(uuid.uuid4())
        except:
            p_id = str(uuid.uuid4()) 

    payload = {
        "patientId": p_id,
        "primaryProblem": data.get("symptoms"),
        "answers": data.get("answers"),
        "status": "PENDING",
        "triage": {
            "urgency": data.get("urgency"),
            "doctorType": data.get("doctor_type"),
            "summary": data.get("summary")
        }
    }
    try:
        supabase.table("triage_requests").insert(payload)
        return {"status": "success"}
    except Exception as e:
        print(f"SAVE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to persist triage record.")
