class PromptManager:
    @staticmethod
    def get_diagnostic_form_prompt(symptoms: str) -> str:
        return f"""
        A patient reports these symptoms: "{symptoms}". 
        Generate 5 specific follow-up diagnostic questions to better understand the clinical situation.
        
        STRICT RULES:
        1. Return ONLY a valid JSON object.
        2. Types allowed: "yesno", "severity" (scale 1-10), or "checkbox".
        3. If type is "checkbox", you MUST include an "options" key with a list of 4 relevant strings.
        4. Include a "confidence" field (0.0 to 1.0) based on how well the symptoms map to standard medical inquiries.
        
        JSON Schema:
        {{ 
          "confidence": 0.95,
          "questions": [ 
            {{ "id": "q1", "text": "...", "type": "yesno|severity|checkbox", "options": ["opt1", "opt2"] }} 
          ] 
        }}
        """

    @staticmethod
    def get_triage_analysis_prompt(primary_problem: str, answers: dict) -> str:
        return f"""
        Analyze the following clinical data:
        Primary Complaint: {primary_problem}
        Patient Detailed Responses: {answers}
        
        Generate a professional triage report.
        
        STRICT JSON SCHEMA:
        {{
          "urgency": "EMERGENCY | HIGH | MODERATE | ROUTINE",
          "doctorType": "Recommended Specialist (e.g., Cardiologist)",
          "summary": ["Observation 1", "Observation 2", "Observation 3"],
          "confidence": 0.85
        }}
        
        STRICT RULES:
        1. Return ONLY valid JSON.
        2. 'urgency' must be exactly one of the 4 levels above.
        3. 'summary' must be an array of strings.
        """
