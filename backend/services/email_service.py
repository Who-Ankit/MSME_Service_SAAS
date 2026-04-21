import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv

from models.lead import Lead


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class EmailService:
    def __init__(self) -> None:
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
        self.smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
        self.smtp_username = os.getenv("SMTP_USERNAME", "").strip()
        self.smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username).strip()

    def is_configured(self) -> bool:
        return all(
            [
                self.smtp_host,
                self.smtp_port,
                self.smtp_username and self.smtp_username != "your_email@gmail.com",
                self.smtp_password and self.smtp_password != "your_app_password",
                self.from_email,
            ]
        )

    @staticmethod
    def build_subject(lead: Lead) -> str:
        company = lead.company or "your team"
        return f"Quick idea for {company}"

    def send_outreach_email(self, lead: Lead) -> tuple[str, str]:
        if not self.is_configured():
            raise RuntimeError("SMTP is not configured. Set SMTP_USERNAME, SMTP_PASSWORD, and FROM_EMAIL in .env.")
        if not lead.email_message:
            raise RuntimeError("Generate outreach before sending an email.")
        if not lead.email:
            raise RuntimeError("Lead does not have an email address.")

        subject = self.build_subject(lead)
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = self.from_email
        message["To"] = lead.email
        message.set_content(lead.email_message)

        with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(message)

        return lead.email, subject
