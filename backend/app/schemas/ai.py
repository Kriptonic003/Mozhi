from typing import List, Optional
from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    manglish_text: str = Field(..., min_length=1)


class TranslateResponse(BaseModel):
    original_text: str
    english_translation: str


class PolishRequest(BaseModel):
    manglish_text: str = Field(..., min_length=1)
    tone: str = "reflective"  # reflective, formal, poetic


class PolishResponse(BaseModel):
    original_text: str
    polished_entry: str


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SummarizeResponse(BaseModel):
    summary: str
    key_topics: List[str]
