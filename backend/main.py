import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.db import Base, engine, ensure_leads_table_columns, ensure_services_table_indexes
from routes import followup, leads, outreach, scoring, services


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")
SERVICE_IMAGE_DIR = Path(
    os.getenv("SERVICE_IMAGE_DIR", "D:/LinkedINAIAgent/ai-lead-agent/service-assets")
).resolve()
SERVICE_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

Base.metadata.create_all(bind=engine)
ensure_leads_table_columns()
ensure_services_table_indexes()

app = FastAPI(
    title="AI Lead Agent",
    description="AI-powered lead qualification and outreach MVP.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(scoring.router)
app.include_router(outreach.router)
app.include_router(followup.router)
app.include_router(services.router)
app.mount("/service-media", StaticFiles(directory=SERVICE_IMAGE_DIR), name="service-media")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "AI Lead Agent backend is running."}
