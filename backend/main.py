from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai, hospital
import uvicorn

# VERSION 5.0 - TOTAL CLEANUP
app = FastAPI(title="Mediqueue MASTER")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(hospital.router)

@app.get("/")
async def root():
    # THIS PROVES THE NEW CODE IS RUNNING
    return {
        "version": "5.0",
        "status": "online",
        "message": "Welcome to the Mediqueue Master Backend"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
