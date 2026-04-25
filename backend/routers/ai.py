import asyncio
from fastapi import APIRouter, HTTPException
import os
import json
import httpx
from database import supabase
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY", "").strip()

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.get("/diagnostic/models")
async def list_available_models():
    """Diagnostic tool to see exactly what models this key can use."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

async def call_ai(prompt: str):
    # If 2.5 and 2.0 are busy, we will try the most common stable names
    models_to_try = [
        "gemini-2.5-flash", 
        "gemini-2.0-flash", 
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b", # 8B is often more available
        "gemini-pro"
    ]
    
    last_error = ""
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        # Increased retries for 503
        for attempt in range(3):
            async with httpx.AsyncClient(timeout=40.0) as client:
                try:
                    print(f"[AI] Trying {model_name} (Attempt {attempt+1})...")
                    response = await client.post(url, json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": { "response_mime_type": "application/json" }
                    })
                    
                    if response.status_code in [503, 429]:
                        print(f"[-] {model_name} busy. Waiting 3s...")
                        await asyncio.sleep(3)
                        continue 
                    
                    if response.status_code == 404:
                        break # Try next model
                        
                    if response.status_code != 200:
                        print(f"[!] {model_name} error {response.status_code}: {response.text}")
                        break
                        
                    data = response.json()
                    print(f"[+] SUCCESS! Using {model_name}")
                    return data['candidates'][0]['content']['parts'][0]['text']
                except Exception as e:
                    break

    raise Exception("All models are currently overloaded by Google. Please try again in 1 minute.")

@router.post("/generate-form")
async def generate_form(data: dict):
    symptoms = data.get("symptoms", "General")
    prompt = f"""
    A patient reports these symptoms: "{symptoms}". Generate 5 follow-up diagnostic questions.
    
    STRICT RULES:
    1. Return ONLY a valid JSON object.
    2. Types allowed: "yesno", "severity" (scale 1-5), or "checkbox".
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
        return json.loads(raw_json)
    except Exception as e:
        print(f"[ERROR] generate-form failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ... rest of the code stays the same ...

@router.post("/analyze-triage")
async def analyze_triage(data: dict):
    prob = data.get("primaryProblem", "Unknown")
    ans = data.get("answers", {})
    prompt = f"Analyze: {prob} with answers: {json.dumps(ans)}. Return JSON: urgency, doctorType, summary (array)."
    try:
        raw_json = await call_ai(prompt)
        report = json.loads(raw_json)
        if isinstance(report.get("summary"), str): report["summary"] = [report["summary"]]
        return report
    except Exception as e:
        print(f"[ERROR] analyze-triage failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import uuid

@router.post("/save-triage")
async def save_triage(data: dict):
    if not supabase: return {"status": "skipped"}
    
    # Ensure patient_id is a valid UUID if it's a guest
    p_id = data.get("patient_id")
    
    if p_id == "guest_user" or not p_id:
        # Instead of faking a user, let's find an ALREADY VALID user in your database 
        # (like your admin or hospital account) to attach this test triage to.
        try:
            existing_users = supabase.table("users").select("uid").execute()
            if existing_users.data and len(existing_users.data) > 0:
                p_id = existing_users.data[0]["uid"]
            else:
                p_id = str(uuid.uuid4()) # Fallback
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
        # MiniSupabase insert() already executes the request
        response = supabase.table("triage_requests").insert(payload)
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"SAVE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
