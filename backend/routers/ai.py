import uuid
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any

from database import supabase
from config import settings
from utils.logger import logger
from schemas.common import ApiResponse, ErrorDetail
from schemas.forms import GeneratedFormSchema
from schemas.triage import TriageReportSchema
from services.ai_service import AIService
from services.triage_service import TriageService

router = APIRouter(prefix="/api/ai", tags=["AI"])

def create_error_response(request_id: str, code: str, message: str) -> ApiResponse:
    return ApiResponse(
        success=False,
        request_id=request_id,
        error=ErrorDetail(code=code, message=message)
    )

@router.post("/generate-form", response_model=ApiResponse[GeneratedFormSchema])
async def generate_form(data: dict, request: Request):
    request_id = str(uuid.uuid4())
    symptoms = data.get("symptoms", "General")
    
    logger.info(f"[{request_id}] START generate-form for symptoms: {symptoms[:50]}...")
    
    try:
        result = await AIService.generate_diagnostic_form(symptoms, request_id)
        return ApiResponse(
            success=True,
            request_id=request_id,
            data=result
        )
    except Exception as e:
        logger.error(f"[{request_id}] generate-form FAILED: {str(e)}")
        return create_error_response(request_id, "AI_GENERATION_FAILED", "Failed to generate diagnostic form.")

@router.post("/analyze-triage", response_model=ApiResponse[TriageReportSchema])
async def analyze_triage(data: dict):
    request_id = str(uuid.uuid4())
    prob = data.get("primaryProblem", "Unknown")
    ans = data.get("answers", {})
    
    logger.info(f"[{request_id}] START analyze-triage for problem: {prob[:50]}...")
    
    try:
        report = await AIService.analyze_clinical_triage(prob, ans, request_id)
        return ApiResponse(
            success=True,
            request_id=request_id,
            data=report
        )
    except Exception as e:
        logger.error(f"[{request_id}] analyze-triage FAILED: {str(e)}")
        return create_error_response(request_id, "TRIAGE_ANALYSIS_FAILED", "Failed to process triage analysis.")

@router.post("/save-triage", response_model=ApiResponse[Dict[str, Any]])
async def save_triage(data: dict):
    request_id = str(uuid.uuid4())
    logger.info(f"[{request_id}] START save-triage")
    
    try:
        result = await TriageService.save_triage_request(data, request_id)
        return ApiResponse(
            success=True,
            request_id=request_id,
            data=result
        )
    except Exception as e:
        logger.error(f"[{request_id}] save-triage FAILED: {str(e)}")
        return create_error_response(request_id, "DATABASE_SAVE_FAILED", "Failed to persist triage record.")
