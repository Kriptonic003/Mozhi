# MOZHI System Architecture

## Overview
MOZHI is an AI-powered voice journaling platform designed specifically for natural Manglish (Malayalam + English code-switched speech). The application allows users to record their voice or upload audio, transcribes it into Romanized Manglish using a fine-tuned Whisper model, and organizes journal reflections with optional AI-driven polishing, summarization, and English translation.

```mermaid
flowchart TD
    subgraph Client["Frontend (React + TypeScript + Vite)"]
        UI[Diary UI / Tailwind CSS]
        Recorder[Web Audio API Recorder]
        Editor[Transcript Editor]
        AuthClient[JWT Auth Store]
    end

    subgraph Server["Backend (FastAPI)"]
        Router[FastAPI API Router]
        AuthService[Auth & JWT Service]
        JournalService[Journal Management Service]
        WhisperService[Whisper Inference Service]
        AIService[Gemini / IndicTrans2 Service]
    end

    subgraph Storage["Data & File Persistence"]
        DB[(PostgreSQL / SQLite)]
        AudioStore[Local Audio Storage /uploads]
    end

    subgraph ML_Subsystem["Machine Learning Subsystem"]
        WhisperBase[openai/whisper-small]
        Trainer[Hugging Face Seq2SeqTrainer]
        FineTunedModel[(Fine-Tuned Manglish Weights)]
        Evaluator[JiWER WER / CER Evaluation]
    end

    Recorder -->|Audio Stream/Blob| UI
    UI -->|POST /api/transcription/transcribe| Router
    UI -->|CRUD /api/journals| Router
    UI -->|POST /api/auth/*| Router
    UI -->|POST /api/ai/*| Router

    Router --> AuthService
    Router --> JournalService
    Router --> WhisperService
    Router --> AIService

    AuthService --> DB
    JournalService --> DB
    JournalService --> AudioStore
    WhisperService --> FineTunedModel
    WhisperService --> AudioStore

    Trainer -->|Fine-tunes| WhisperBase
    Trainer -->|Saves Checkpoints| FineTunedModel
    Evaluator -->|Evaluates| FineTunedModel
```

## Core Subsystems

### 1. Frontend Subsystem
- **Framework:** React 18 with TypeScript and Vite for near-instant HMR.
- **Styling:** Tailwind CSS with a warm, personal diary aesthetic (soft creams, muted lavenders, deep warm neutrals).
- **Audio Capture:** HTML5 `MediaRecorder` API with fallback to `AudioContext` for real-time waveform visualization, pause/resume, and duration tracking.
- **State & Communication:** Axios with interceptors for automatic JWT token injection and refresh.

### 2. Backend Subsystem
- **Framework:** FastAPI for high-throughput asynchronous execution.
- **Data Layer:** SQLAlchemy 2.0 with PostgreSQL as production DBMS and automatic SQLite fallback for rapid local development.
- **Security:** Password hashing using bcrypt / argon2 via Passlib; stateless JWT tokens with configurable expiration.
- **File Ingestion:** Uploaded audio is validated for format (WAV, MP3, M4A, WebM), hashed for idempotency, and stored in a designated, git-ignored directory (`backend/uploads/`).

### 3. Machine Learning Subsystem
- **Model Architecture:** Multilingual `openai/whisper-small` (244M parameters) consisting of an audio encoder and text decoder.
- **Audio Preprocessing:** Resampling to 16,000 Hz, mono channel, Log-Mel spectrogram feature extraction (80 bins).
- **Target Representation:** Romanized Manglish (Latin-script phonetic Malayalam code-switched with English).
- **Evaluation Metric:** JiWER-based Word Error Rate (WER) and Character Error Rate (CER), comparing fine-tuned checkpoints against base Whisper Small.
