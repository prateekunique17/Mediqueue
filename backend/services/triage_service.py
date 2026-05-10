from typing import Dict, Any
import uuid
from database import supabase
from utils.logger import logger
from schemas.triage import TriageReportSchema

class TriageService:
    @staticmethod
    async def save_triage_request(data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """
        Handles database persistence for clinical triage reports.
        """
        if not supabase:
            logger.warning(f"[{request_id}] Supabase not initialized. Skipping save.")
            return {"status": "skipped"}

        # Extract patient ID with fallback
        patient_id = data.get("patient_id")
        if patient_id == "guest_user" or not patient_id:
            try:
                existing_users = supabase.table("users").select("uid").execute()
                patient_id = existing_users.data[0]["uid"] if existing_users.data else str(uuid.uuid4())
            except Exception as e:
                logger.error(f"[{request_id}] Error fetching fallback user: {e}")
                patient_id = str(uuid.uuid4())

        # Build production payload
        payload = {
            "patientId": patient_id,
            "primaryProblem": data.get("symptoms"),
            "answers": data.get("answers"),
            "status": "PENDING",
            "triage": {
                "urgency": data.get("urgency"),
                "doctorType": data.get("doctor_type"),
                "summary": data.get("summary"),
                "hospital_id": data.get("hospital_id"),
                "request_id": request_id
            }
        }

        try:
            logger.info(f"[{request_id}] DB_INSERT - Triage record for patient: {patient_id}")
            response = supabase.table("triage_requests").insert(payload)
            return {"status": "success", "id": patient_id}
        except Exception as e:
            logger.error(f"[{request_id}] DB_ERROR - Failed to save triage: {str(e)}")
            raise e
