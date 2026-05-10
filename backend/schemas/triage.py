from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from schemas.common import AIResponseBase

class UrgencyLevel(str, Enum):
    EMERGENCY = "EMERGENCY"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    ROUTINE = "ROUTINE"

class TriageReportSchema(AIResponseBase):
    urgency: UrgencyLevel
    doctorType: str
    summary: List[str]
    safety_override: bool = False
    safety_message: Optional[str] = None
