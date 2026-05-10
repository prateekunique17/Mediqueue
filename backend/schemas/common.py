from pydantic import BaseModel, Field
from typing import Optional, Any, List, Generic, TypeVar

T = TypeVar('T')

class ErrorDetail(BaseModel):
    code: str
    message: str

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    request_id: str
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None

class AIResponseBase(BaseModel):
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
