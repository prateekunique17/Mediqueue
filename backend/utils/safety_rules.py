from typing import Optional, Tuple
from config import settings
from utils.logger import logger

def evaluate_safety_rules(symptoms: str) -> Tuple[bool, Optional[str]]:
    """
    Checks for high-risk symptoms that require immediate escalation.
    Returns (is_emergency, message)
    """
    if not symptoms:
        return False, None

    symptoms_lower = symptoms.lower()
    
    for critical_symptom in settings.EMERGENCY_SYMPTOMS:
        if critical_symptom in symptoms_lower:
            logger.warning(f"SAFETY RULE TRIGGERED: Detected '{critical_symptom}' in symptoms.")
            return True, f"Emergency protocol triggered due to detection of high-risk symptom: {critical_symptom}"

    return False, None
