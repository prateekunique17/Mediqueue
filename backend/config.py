import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mediqueue Production AI"
    VERSION: str = "6.0.0"
    
    # AI CONFIG
    LM_STUDIO_URL: str = os.getenv("LM_STUDIO_URL", "http://127.0.0.1:1234").strip()
    LM_STUDIO_MODEL: str = os.getenv("LM_STUDIO_MODEL", "gemma-2-9b").strip()
    AI_TIMEOUT: float = 60.0
    MAX_RETRIES: int = 3
    
    # DATABASE
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # SAFETY RULES
    SAFETY_RULES_ENABLED: bool = True
    EMERGENCY_SYMPTOMS: list = [
        "chest pain", "breathing difficulty", "stroke", "unconscious", 
        "severe bleeding", "heart attack", "choking", "poisoning"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
