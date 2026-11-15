"""
Translation, journal polishing, and summarization service.
Utilizes Google GenAI when configured for contextual Romanized Manglish understanding.
"""
from typing import List, Tuple
from app.core.config import settings


class TranslationService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self._client = None
        if self.api_key:
            try:
                # Prefer modern google-genai SDK if available
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                self._sdk_type = "google-genai"
            except ImportError:
                try:
                    import google.generativeai as legacy_genai
                    legacy_genai.configure(api_key=self.api_key)
                    self._client = legacy_genai.GenerativeModel("gemini-1.5-flash")
                    self._sdk_type = "legacy"
                except Exception as e:
                    print(f"[WARN] Failed to configure Gemini: {e}")
            except Exception as e:
                print(f"[WARN] Failed to configure GenAI client: {e}")

    def _generate_text(self, prompt: str) -> str:
        if not self._client:
            return ""
        try:
            if getattr(self, "_sdk_type", "") == "google-genai":
                response = self._client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text.strip() if response.text else ""
            else:
                response = self._client.generate_content(prompt)
                return response.text.strip() if response.text else ""
        except Exception as e:
            print(f"[TranslationService] AI generation error: {e}")
            return ""

    def translate_to_english(self, manglish_text: str) -> str:
        """
        Translates Romanized Manglish text into natural English.
        """
        if not manglish_text.strip():
            return ""

        if self._client:
            prompt = (
                "You are an expert bilingual linguist in Malayalam and English. "
                "Translate the following Romanized Manglish (Malayalam written in Latin script with English code-switching) "
                "into clear, natural English. Provide only the translated English sentence without commentary.\n\n"
                f"Manglish: \"{manglish_text}\"\n"
                "English:"
            )
            result = self._generate_text(prompt)
            if result:
                return result

        # Fallback explanation if no LLM key configured
        return f"[Translation: {manglish_text}] (Add GEMINI_API_KEY in backend/.env for AI translation)"

    def polish_journal_entry(self, manglish_text: str, tone: str = "reflective") -> str:
        """
        Refines a spoken Manglish journal entry into an evocative, beautifully written personal diary entry.
        """
        if not manglish_text.strip():
            return ""

        if self._client:
            prompt = (
                f"The following is a personal spoken diary thought recorded in Romanized Manglish: \"{manglish_text}\". "
                f"Rewrite this into a thoughtful, personal {tone} journal passage in English that captures the genuine emotion, "
                "warmth, and meaning of what the person felt, while preserving their unique voice. "
                "Output only the polished journal paragraph."
            )
            result = self._generate_text(prompt)
            if result:
                return result

        return (
            f"Today was marked by this reflection: \"{manglish_text}\". "
            "A moment paused in time to capture thoughts as they flowed naturally."
        )

    def summarize(self, text: str) -> Tuple[str, List[str]]:
        """
        Generates a 1-2 sentence reflection summary and extracts 2-4 keywords/topics.
        """
        if not text.strip():
            return "", []

        if self._client:
            prompt = (
                f"Summarize the following journal reflection into 1-2 warm, introspective sentences and extract 3 key topic tags.\n"
                f"Text: \"{text}\"\n"
                "Format output as:\nSummary: <summary>\nTags: <tag1>, <tag2>, <tag3>"
            )
            result = self._generate_text(prompt)
            if result:
                lines = result.split("\n")
                summary = ""
                tags = []
                for line in lines:
                    if line.lower().startswith("summary:"):
                        summary = line[8:].strip()
                    elif line.lower().startswith("tags:"):
                        tags = [t.strip().strip("#") for t in line[5:].split(",") if t.strip()]
                return summary or result, tags

        words = text.split()
        summary = text[:150] + "..." if len(text) > 150 else text
        tags = [w.lower() for w in words if len(w) > 4][:3]
        return summary, tags


translation_service = TranslationService()
