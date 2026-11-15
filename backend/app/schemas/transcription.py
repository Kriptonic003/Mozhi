from pydantic import BaseModel, ConfigDict
from typing import Optional


class TranscriptionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    audio_path: str
    original_transcript: str
    duration_seconds: float
    model_name: str
    language: str = "Manglish (ml-en)"


class TranscriptionStatus(BaseModel):
    status: str
    message: Optional[str] = None
