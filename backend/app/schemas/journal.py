from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class JournalEntryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    audio_path: Optional[str] = None
    original_transcript: str
    edited_transcript: str
    english_translation: Optional[str] = None
    polished_entry: Optional[str] = None
    summary: Optional[str] = None


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    edited_transcript: Optional[str] = None
    english_translation: Optional[str] = None
    polished_entry: Optional[str] = None
    summary: Optional[str] = None


class JournalEntryResponse(JournalEntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalListResponse(BaseModel):
    items: List[JournalEntryResponse]
    total: int
    page: int
    limit: int
