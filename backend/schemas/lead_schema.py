from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LeadBase(BaseModel):
    name: str
    email: str
    phone: str | None = None
    company: str = ""
    role: str = ""
    website: str = ""
    budget: str | None = None
    intent: str | None = None
    source: str | None = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    score: int | None = None
    score_reason: str | None = None
    stage: str
    email_message: str | None = None
    linkedin_message: str | None = None
    followup_message: str | None = None
    created_at: datetime


class LeadActionRequest(BaseModel):
    lead_id: int = Field(..., gt=0)


class LeadCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    phone: str | None = None
    company: str = ""
    role: str = ""
    website: str = ""
    budget: str | None = None
    intent: str | None = None


class LeadScoreResponse(BaseModel):
    lead_id: int
    score: int
    reason: str


class OutreachResponse(BaseModel):
    lead_id: int
    email_message: str
    linkedin_message: str
    stage: str


class FollowUpResponse(BaseModel):
    lead_id: int
    followup_message: str


class EmailSendResponse(BaseModel):
    lead_id: int
    recipient: str
    subject: str
    status: str


class StageUpdateRequest(BaseModel):
    stage: str
