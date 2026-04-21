from models.lead import Lead
from services.llm_service import LLMService


class ScoringService:
    def __init__(self) -> None:
        self.llm_service = LLMService()

    @staticmethod
    def _fallback_score(lead: Lead) -> tuple[int, str]:
        score = 45
        reasons = []
        if lead.role:
            role_lower = lead.role.lower()
            if any(keyword in role_lower for keyword in ["founder", "chief", "head", "director", "manager"]):
                score += 25
                reasons.append("Decision-making role suggests strong buying influence.")
            elif any(keyword in role_lower for keyword in ["lead", "senior", "vp"]):
                score += 15
                reasons.append("Role signals meaningful influence in the buying process.")
        if lead.website:
            score += 10
            reasons.append("An active website suggests an established company presence.")
        if lead.company:
            score += 10
            reasons.append("Company information is available for personalization.")
        if lead.intent == "urgent":
            score += 10
            reasons.append("Urgent intent suggests near-term buying interest.")
        elif lead.intent == "interested":
            score += 5
            reasons.append("Interested intent indicates qualified curiosity.")
        if lead.budget == "high":
            score += 10
            reasons.append("Higher budget suggests stronger purchase readiness.")
        elif lead.budget == "medium":
            score += 5
            reasons.append("Medium budget indicates realistic evaluation capacity.")
        reason = " ".join(reasons) or "Lead contains limited context, so the score is conservative."
        return min(score, 100), reason

    def score_lead(self, lead: Lead) -> tuple[int, str]:
        prompt = f"""
Analyze this lead and give a score (0-100) with reason.

Name: {lead.name}
Company: {lead.company}
Role: {lead.role}
Website: {lead.website}
Budget: {lead.budget or "unknown"}
Intent: {lead.intent or "unknown"}

Return JSON:
{{
  "score": number,
  "reason": "string"
}}
"""
        if self.llm_service.is_configured():
            try:
                result = self.llm_service.generate_json(prompt)
                score = int(max(0, min(100, result.get("score", 50))))
                reason = str(result.get("reason", "Scored by AI analysis."))
                return score, reason
            except Exception:
                pass

        return self._fallback_score(lead)
