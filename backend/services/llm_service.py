import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from openai import OpenAI


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class LLMService:
    def __init__(self) -> None:
        self.provider = os.getenv("LLM_PROVIDER", "openai").strip().lower()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = self._resolve_model()
        self.client = self._build_openai_client()

    def is_configured(self) -> bool:
        if self.provider == "gemini":
            return bool(self.gemini_api_key and self.gemini_api_key != "your_key")
        return self.client is not None

    def _resolve_model(self) -> str:
        if self.provider == "gemini":
            model = os.getenv("LLM_MODEL") or os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
            return self._normalize_gemini_model(model.strip())
        return (os.getenv("LLM_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-4o-mini").strip()

    def _build_openai_client(self) -> OpenAI | None:
        if self.provider != "openai":
            return None
        if not self.openai_api_key or self.openai_api_key == "your_key":
            return None
        return OpenAI(api_key=self.openai_api_key)

    @staticmethod
    def _normalize_gemini_model(model: str) -> str:
        if model.startswith("models/"):
            return model.removeprefix("models/")
        if model.startswith("model/"):
            return model.removeprefix("model/")
        return model

    @staticmethod
    def _strip_code_fences(text: str) -> str:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()
        return cleaned

    @staticmethod
    def _extract_gemini_text(payload: dict) -> str:
        candidates = payload.get("candidates") or []
        if not candidates:
            prompt_feedback = payload.get("promptFeedback")
            raise RuntimeError(f"Gemini returned no candidates. Feedback: {prompt_feedback}")

        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts).strip()
        if not text:
            raise RuntimeError("Gemini returned an empty response.")
        return text

    def _gemini_generate(self, system_prompt: str, user_prompt: str, expect_json: bool) -> str:
        if not self.is_configured():
            raise RuntimeError("Gemini client is not configured.")

        response = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent",
            headers={
                "x-goog-api-key": self.gemini_api_key,
                "Content-Type": "application/json",
            },
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": f"{system_prompt}\n\n{user_prompt}".strip(),
                            }
                        ]
                    }
                ],
                "generationConfig": {"responseMimeType": "application/json"} if expect_json else {},
            },
            timeout=60.0,
        )
        response.raise_for_status()
        return self._extract_gemini_text(response.json())

    def generate_json(self, prompt: str) -> dict:
        system_prompt = "You are a precise B2B sales assistant. Always return valid JSON."
        if self.provider == "gemini":
            content = self._gemini_generate(system_prompt, prompt, expect_json=True)
            return json.loads(self._strip_code_fences(content) or "{}")

        if not self.client:
            raise RuntimeError("OpenAI client is not configured.")

        response = self.client.chat.completions.create(
            model=self.model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)

    def generate_text(self, prompt: str) -> str:
        system_prompt = "You write concise, personalized sales copy with a professional tone."
        if self.provider == "gemini":
            return self._gemini_generate(system_prompt, prompt, expect_json=False).strip()

        if not self.client:
            raise RuntimeError("OpenAI client is not configured.")

        response = self.client.chat.completions.create(
            model=self.model,
            temperature=0.7,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return (response.choices[0].message.content or "").strip()
