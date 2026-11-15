from app.api.routes.auth import router as auth_router
from app.api.routes.journals import router as journals_router
from app.api.routes.transcription import router as transcription_router
from app.api.routes.ai import router as ai_router
from app.api.routes.health import router as health_router

__all__ = [
    "auth_router",
    "journals_router",
    "transcription_router",
    "ai_router",
    "health_router",
]
