from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai, hospital
from config import settings
from utils.logger import logger
import uvicorn

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(ai.router)
app.include_router(hospital.router)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"AI Model: {settings.LM_STUDIO_MODEL}")

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "message": "Clinical AI Workflow Engine Active"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    logger.info(f"Manual startup triggered on port 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
