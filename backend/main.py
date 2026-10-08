from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys
from dotenv import load_dotenv
from services.ai_service import analyze_message, AnalysisResult

load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("ERROR: GROQ_API_KEY environment variable is missing.", file=sys.stderr)
    sys.exit(1)
if not api_key.startswith("gsk_"):
    print("ERROR: GROQ_API_KEY appears to be invalid. Expected a standard Groq API key starting with 'gsk_'.", file=sys.stderr)
    sys.exit(1)

app = FastAPI()

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
# Remove duplicates
origins = list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    message: str
    action: Optional[str] = None
    context: Optional[str] = None
    recipient: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze(request: AnalyzeRequest):
    return await analyze_message(
        message=request.message,
        action=request.action,
        context=request.context,
        recipient=request.recipient
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
