from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    TranslateRequest,
    TranslateResponse,
    PolishRequest,
    PolishResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.translation_service import translation_service

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/translate", response_model=TranslateResponse)
def translate_manglish(
    req: TranslateRequest,
    current_user: User = Depends(get_current_user)
):
    translated = translation_service.translate_to_english(req.manglish_text)
    return {
        "original_text": req.manglish_text,
        "english_translation": translated
    }


@router.post("/polish", response_model=PolishResponse)
def polish_entry(
    req: PolishRequest,
    current_user: User = Depends(get_current_user)
):
    polished = translation_service.polish_journal_entry(req.manglish_text, tone=req.tone)
    return {
        "original_text": req.manglish_text,
        "polished_entry": polished
    }


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_entry(
    req: SummarizeRequest,
    current_user: User = Depends(get_current_user)
):
    summary, topics = translation_service.summarize(req.text)
    return {
        "summary": summary,
        "key_topics": topics
    }
