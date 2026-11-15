import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.transcription import TranscriptionResponse
from app.services.whisper_service import whisper_service

router = APIRouter(prefix="/transcription", tags=["Transcription"])

ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac"}


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate file extension
    file_ext = Path(audio.filename or "recording.wav").suffix.lower()
    if file_ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format: '{file_ext}'. Supported formats: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}"
        )

    # Read audio content and validate size
    content = await audio.read()
    max_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_MB} MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty."
        )

    # Save to uploads directory
    unique_filename = f"user_{current_user.id}_{uuid.uuid4().hex[:10]}{file_ext}"
    destination = settings.upload_path / unique_filename

    with open(destination, "wb") as f:
        f.write(content)

    print(f"[Transcription] Saved audio: {unique_filename} ({len(content)} bytes)")

    # Run Whisper inference
    try:
        transcript, duration = whisper_service.transcribe(destination)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[ERROR] Whisper transcription error:\n{tb}")
        # Return the actual error message so the user sees it in the UI
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e) or repr(e)}"
        )

    return {
        "audio_path": f"{settings.UPLOAD_DIR}/{unique_filename}",
        "original_transcript": transcript,
        "duration_seconds": duration,
        "model_name": whisper_service.model_identifier,
        "language": "Manglish (ml-en)"
    }
