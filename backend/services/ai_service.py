from typing import Dict, Any, List
import uuid
from prompts.manager import PromptManager
from services.lmstudio_client import ai_client
from schemas.forms import GeneratedFormSchema
from schemas.triage import TriageReportSchema, UrgencyLevel
from utils.safety_rules import evaluate_safety_rules
from utils.logger import logger

class AIService:
    @staticmethod
    async def generate_diagnostic_form(symptoms: str, request_id: str) -> GeneratedFormSchema:
        """Orchestrates diagnostic form generation with validation."""
        prompt = PromptManager.get_diagnostic_form_prompt(symptoms)
        raw_data = await ai_client.call_ai(prompt, request_id)
        
        # Pydantic validation
        return GeneratedFormSchema(**raw_data)

    @staticmethod
    async def analyze_clinical_triage(symptoms: str, answers: Dict[str, Any], request_id: str) -> TriageReportSchema:
        """Orchestrates triage analysis with medical safety overrides."""
        
        # 1. Check deterministic safety rules first
        is_emergency, safety_msg = evaluate_safety_rules(symptoms)
        
        if is_emergency:
            logger.info(f"[{request_id}] SAFETY OVERRIDE TRIGGERED - Forcing EMERGENCY status.")
            return TriageReportSchema(
                urgency=UrgencyLevel.EMERGENCY,
                doctorType="Emergency Physician",
                summary=[safety_msg or "Critical symptoms detected. Immediate evaluation required."],
                confidence=1.0,
                safety_override=True,
                safety_message=safety_msg
            )

        # 2. Proceed with AI analysis if no deterministic safety trigger
        prompt = PromptManager.get_triage_analysis_prompt(symptoms, answers)
        raw_data = await ai_client.call_ai(prompt, request_id)
        
        # Pydantic validation
        return TriageReportSchema(**raw_data)
