from pydantic import BaseModel, Field
from typing import List, Optional
from schemas.common import AIResponseBase

class QuestionOption(BaseModel):
    id: str
    text: str

class DiagnosticQuestion(BaseModel):
    id: str
    text: str
    type: str  # yesno, severity, checkbox
    options: Optional[List[str]] = None

class GeneratedFormSchema(AIResponseBase):
    questions: List[DiagnosticQuestion]
