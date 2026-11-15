from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.api.routes import (
    auth_router,
    journals_router,
    transcription_router,
    ai_router,
    health_router,
)

# Auto-create tables on startup (in production, migrations with Alembic can be used)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.APP_NAME} Backend API",
    description="Manglish Voice Journaling Speech Recognition & Reflection Platform",
    version="1.0.0",
    debug=settings.DEBUG,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount audio uploads as static directory for playback
settings.upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")

# Mount API Routers
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(journals_router, prefix=settings.API_V1_PREFIX)
app.include_router(transcription_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to MOZHI API",
        "tagline": "Your voice. Your words. Your story.",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }
