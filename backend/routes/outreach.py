import smtplib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.lead import Lead
from schemas.lead_schema import EmailSendResponse, LeadActionRequest, OutreachResponse
from services.email_service import EmailService
from services.message_service import MessageService


router = APIRouter(prefix="/outreach", tags=["Outreach"])


@router.post("/generate", response_model=OutreachResponse)
def generate_outreach(payload: LeadActionRequest, db: Session = Depends(get_db)) -> OutreachResponse:
    lead = db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    email_message, linkedin_message = MessageService().generate_outreach(lead)
    lead.email_message = email_message
    lead.linkedin_message = linkedin_message
    lead.stage = "Contacted"
    db.commit()
    db.refresh(lead)

    return OutreachResponse(
        lead_id=lead.id,
        email_message=email_message,
        linkedin_message=linkedin_message,
        stage=lead.stage,
    )


@router.post("/send", response_model=EmailSendResponse)
def send_outreach_email(payload: LeadActionRequest, db: Session = Depends(get_db)) -> EmailSendResponse:
    lead = db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    try:
        recipient, subject = EmailService().send_outreach_email(lead)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except smtplib.SMTPException as exc:
        raise HTTPException(status_code=502, detail=f"SMTP send failed: {exc}") from exc

    lead.stage = "Contacted"
    db.commit()
    db.refresh(lead)

    return EmailSendResponse(
        lead_id=lead.id,
        recipient=recipient,
        subject=subject,
        status="sent",
    )
