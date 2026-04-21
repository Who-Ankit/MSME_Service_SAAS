from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.lead import Lead
from schemas.lead_schema import FollowUpResponse, LeadActionRequest
from services.message_service import MessageService


router = APIRouter(prefix="/followup", tags=["Follow-up"])


@router.post("/generate", response_model=FollowUpResponse)
def generate_followup(payload: LeadActionRequest, db: Session = Depends(get_db)) -> FollowUpResponse:
    lead = db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    followup_message = MessageService().generate_followup(lead)
    lead.followup_message = followup_message
    db.commit()
    db.refresh(lead)

    return FollowUpResponse(lead_id=lead.id, followup_message=followup_message)
