from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.lead import Lead
from schemas.lead_schema import LeadActionRequest, LeadScoreResponse
from services.scoring_service import ScoringService


router = APIRouter(tags=["Scoring"])


@router.post("/leads/score", response_model=LeadScoreResponse)
def score_lead(payload: LeadActionRequest, db: Session = Depends(get_db)) -> LeadScoreResponse:
    lead = db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")

    score, reason = ScoringService().score_lead(lead)
    lead.score = score
    lead.score_reason = reason
    db.commit()
    db.refresh(lead)

    return LeadScoreResponse(lead_id=lead.id, score=score, reason=reason)
