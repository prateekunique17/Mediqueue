import httpx
import asyncio
import time
from typing import Optional
from config import settings
from utils.logger import logger
from utils.json_parser import clean_and_parse_json

class LMStudioClient:
    def __init__(self):
        self.url = f"{settings.LM_STUDIO_URL}/v1/completions"
        self.model = settings.LM_STUDIO_MODEL
        self.client = httpx.AsyncClient(timeout=settings.AI_TIMEOUT)

    async def call_ai(self, prompt: str, request_id: str) -> dict:
        """
        Executes AI request with built-in retries, timeout handling, and JSON parsing.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "max_tokens": 1024,
            "temperature": 0.3, # Lower temperature for better structural reliability
            "stream": False
        }

        last_error = None
        for attempt in range(settings.MAX_RETRIES):
            try:
                start_time = time.time()
                logger.info(f"[{request_id}] AI CALL - Attempt {attempt + 1}/{settings.MAX_RETRIES}")
                
                response = await self.client.post(self.url, json=payload)
                latency = time.time() - start_time
                
                if response.status_code != 200:
                    logger.error(f"[{request_id}] LM Studio Error ({response.status_code}): {response.text}")
                    raise Exception(f"AI Service error: {response.status_code}")

                data = response.json()
                raw_text = data['choices'][0]['text'].strip()
                
                logger.info(f"[{request_id}] AI SUCCESS - Latency: {latency:.2f}s")
                
                # Parse structured JSON from response
                parsed_data = clean_and_parse_json(raw_text)
                return parsed_data

            except Exception as e:
                last_error = e
                logger.warning(f"[{request_id}] AI ATTEMPT {attempt + 1} FAILED: {str(e)}")
                if attempt < settings.MAX_RETRIES - 1:
                    wait_time = (attempt + 1) * 2 # Simple backoff
                    await asyncio.sleep(wait_time)
                continue

        logger.error(f"[{request_id}] AI CALL EXHAUSTED ALL RETRIES")
        raise last_error

# Singleton instance
ai_client = LMStudioClient()
