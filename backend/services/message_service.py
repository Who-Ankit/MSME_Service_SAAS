from models.lead import Lead
from services.llm_service import LLMService


class MessageService:
    def __init__(self) -> None:
        self.llm_service = LLMService()

    @staticmethod
    def _fallback_outreach(lead: Lead) -> tuple[str, str]:
        email_message = (
            f"Hi {lead.name}, I noticed your work as {lead.role or 'a leader'} at {lead.company or 'your company'}. "
            f"We help teams turn outbound into a more repeatable pipeline without adding manual busywork. "
            "If improving lead qualification or outreach efficiency is a priority, I'd be glad to share a few ideas."
        )
        linkedin_message = (
            f"Hi {lead.name}, your role at {lead.company or 'your team'} stood out. "
            "I'd love to connect and share a quick idea on making lead outreach more efficient."
        )
        return email_message, linkedin_message

    @staticmethod
    def _fallback_followup(lead: Lead) -> str:
        return (
            f"Hi {lead.name}, just circling back in case my last note got buried. "
            f"If improving outreach for {lead.company or 'your team'} is on your radar, "
            "I'm happy to send over a few tailored ideas."
        )

    def generate_outreach(self, lead: Lead) -> tuple[str, str]:
        email_prompt = f"""
Write a personalized cold email under 120 words for this lead.

Name: {lead.name}
Company: {lead.company}
Role: {lead.role}
Website: {lead.website}
Budget: {lead.budget or "unknown"}
Intent: {lead.intent or "unknown"}

Keep it specific, concise, and avoid generic phrases.
"""
        linkedin_prompt = f"""
Write a short personalized LinkedIn outreach message for this lead.

Name: {lead.name}
Company: {lead.company}
Role: {lead.role}
Website: {lead.website}
Budget: {lead.budget or "unknown"}
Intent: {lead.intent or "unknown"}

Keep it under 60 words and professional.
"""
        if self.llm_service.is_configured():
            try:
                return self.llm_service.generate_text(email_prompt), self.llm_service.generate_text(linkedin_prompt)
            except Exception:
                pass

        return self._fallback_outreach(lead)

    def generate_followup(self, lead: Lead) -> str:
        prompt = f"""
Write a polite follow-up message for this lead.

Name: {lead.name}
Company: {lead.company}
Role: {lead.role}
Previous email:
{lead.email_message or "No prior email available."}

Tone: polite, slightly persuasive
Length: short
"""
        if self.llm_service.is_configured():
            try:
                return self.llm_service.generate_text(prompt)
            except Exception:
                pass

        return self._fallback_followup(lead)
