import json
import re
from .logger import logger

def clean_and_parse_json(raw_text: str) -> dict:
    """
    Robustly extracts and parses JSON from AI responses.
    Handles markdown, trailing text, and common malformations.
    """
    if not raw_text:
        raise ValueError("Empty AI response")

    # 1. Try direct parsing first
    try:
        return json.loads(raw_text.strip())
    except json.JSONDecodeError:
        pass

    # 2. Try to find JSON within code blocks
    json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Last ditch effort: find the first '{' and last '}'
    start_index = raw_text.find('{')
    end_index = raw_text.rfind('}') + 1
    
    if start_index != -1 and end_index != -1:
        json_str = raw_text[start_index:end_index]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parsing failed after extraction: {e}")
            # Try to fix common issues like trailing commas
            json_str = re.sub(r',\s*}', '}', json_str)
            try:
                return json.loads(json_str)
            except:
                raise ValueError("Could not extract valid JSON from AI response")
    
    raise ValueError("No JSON structure found in AI response")
