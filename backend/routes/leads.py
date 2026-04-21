import csv
import io

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database.db import SessionLocal, get_db
from models.lead import Lead
from schemas.lead_schema import LeadCreateRequest, LeadResponse, StageUpdateRequest
from services.message_service import MessageService
from services.scoring_service import ScoringService


router = APIRouter(prefix="/leads", tags=["Leads"])
VALID_STAGES = {"New", "Contacted", "Replied", "Converted"}
VALID_BUDGETS = {"low", "medium", "high"}
VALID_INTENTS = {"exploring", "interested", "urgent"}


def process_portal_lead_messages(lead_id: int) -> None:
    db = SessionLocal()
    try:
        lead = db.get(Lead, lead_id)
        if not lead:
            return

        message_service = MessageService()
        email_message, linkedin_message = message_service.generate_outreach(lead)
        lead.email_message = email_message
        lead.linkedin_message = linkedin_message
        lead.stage = "Contacted"
        db.commit()
        db.refresh(lead)

        lead.followup_message = message_service.generate_followup(lead)
        db.commit()
    finally:
        db.close()


@router.post("/upload")
async def upload_leads(file: UploadFile = File(...), db: Session = Depends(get_db)) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    content = await file.read()
    try:
        text_stream = io.StringIO(content.decode("utf-8-sig"))
        reader = csv.DictReader(text_stream)
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV file must be UTF-8 encoded.") from exc

    created = 0
    for row in reader:
        name = (row.get("name") or "").strip()
        email = (row.get("email") or "").strip()
        if not name or not email:
            continue

        lead = Lead(
            name=name,
            email=email,
            company=(row.get("company") or "").strip(),
            role=(row.get("role") or "").strip(),
            website=(row.get("website") or "").strip(),
        )
        db.add(lead)
        created += 1

    db.commit()
    return {"message": f"Uploaded {created} leads successfully.", "count": created}


@router.get("", response_model=list[LeadResponse])
def get_leads(db: Session = Depends(get_db)) -> list[Lead]:
    return db.query(Lead).order_by(Lead.created_at.desc(), Lead.id.desc()).all()


@router.post("/create", response_model=LeadResponse)
def create_lead(
    payload: LeadCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Lead:
    budget = payload.budget.lower() if payload.budget else None
    intent = payload.intent.lower() if payload.intent else None
    if budget and budget not in VALID_BUDGETS:
        raise HTTPException(status_code=400, detail="Invalid budget.")
    if intent and intent not in VALID_INTENTS:
        raise HTTPException(status_code=400, detail="Invalid intent.")

    lead = Lead(
        name=payload.name.strip(),
        email=payload.email.strip(),
        phone=(payload.phone or "").strip() or None,
        company=payload.company.strip(),
        role=payload.role.strip(),
        website=payload.website.strip(),
        budget=budget,
        intent=intent,
        source="portal",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    score, reason = ScoringService().score_lead(lead)
    lead.score = score
    lead.score_reason = reason
    db.commit()
    db.refresh(lead)
    background_tasks.add_task(process_portal_lead_messages, lead.id)
    return lead


@router.patch("/{lead_id}/stage", response_model=LeadResponse)
def update_stage(lead_id: int, payload: StageUpdateRequest, db: Session = Depends(get_db)) -> Lead:
    if payload.stage not in VALID_STAGES:
        raise HTTPException(status_code=400, detail="Invalid stage.")

    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    lead.stage = payload.stage
    db.commit()
    db.refresh(lead)
    return lead
