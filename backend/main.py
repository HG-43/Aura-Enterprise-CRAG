import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.settings import FRONTEND_URL
from backend.database import Base, engine
from backend.routers import auth, chats

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aura Intelligence API",
    description="CRAG-powered AI SaaS backend",
    version="1.0.0",
)

# Make sure to replace this placeholder string with your real live Vercel domain!
VERCEL_FRONTEND_URL = "https://aura-intelligence-ui.vercel.app" 

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,          # Keeps your local development setup working
        VERCEL_FRONTEND_URL    # Authorizes your live production Vercel frontend
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chats.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "aura-intelligence"}