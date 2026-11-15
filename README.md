# MOZHI

> **Your voice. Your words. Your story.**

MOZHI is an AI-powered Manglish voice journaling platform that enables users to record their daily thoughts and experiences in natural **Manglish** (Malayalam + English code-switched speech).

The primary research and engineering contribution of MOZHI is an end-to-end speech recognition pipeline that fine-tunes a pretrained multilingual **OpenAI Whisper Small** model to accurately recognize natural Manglish speech and transcribe it directly into **Romanized Manglish** (Malayalam written in the Latin alphabet).

---

## 🌟 Key Features

- **Manglish Voice Journaling:** Speak naturally in conversational Manglish ("Njan innu college-il poyi, pinne friends-ine kandu").
- **Fine-Tuned Whisper ASR:** Multilingual Whisper Small fine-tuned on code-switched Malayalam-English audio for Romanized Manglish transcription.
- **Audio Recording & Upload:** Record via the browser using the Web Audio API or upload pre-recorded audio files.
- **Transcript Editor:** Review and refine model transcripts while preserving the original model-generated text.
- **Journal Management:** Organize, search, and revisit daily voice reflections.
- **Optional AI Intelligence:** Journal polishing, daily summaries, topic extraction, and English translation via LLMs (Gemini API / IndicTrans2).

---

## 📁 Repository Structure

```
MOZHI/
│
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Reusable UI components (AudioRecorder, Navbar, etc.)
│   │   ├── pages/                # Page views (Dashboard, Journal, Record, Auth)
│   │   ├── layouts/              # App layouts (MainLayout, AuthLayout)
│   │   ├── hooks/                # Custom React hooks (useAudioRecorder, useAuth)
│   │   ├── services/             # API client services (api, auth, journal, transcription)
│   │   ├── types/                # TypeScript interface definitions
│   │   ├── assets/               # Static assets & styles
│   │   ├── App.tsx               # Root component with routing
│   │   └── main.tsx              # Application entry point
│   ├── public/                   # Public assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration with backend proxy
│   └── tailwind.config.js        # Design system tokens (lavender, cream, warm tones)
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # API endpoints and dependency injection
│   │   │   ├── routes/           # Auth, Journals, Transcription, AI, Health routes
│   │   │   └── deps.py           # Database & JWT auth dependencies
│   │   ├── core/                 # App configuration & security (JWT, hashing)
│   │   ├── database/             # SQLAlchemy engine, session, and declarative base
│   │   ├── models/               # Database models (User, JournalEntry)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Core business logic
│   │   │   ├── whisper_service.py      # Whisper model loader & inference pipeline
│   │   │   ├── translation_service.py  # Translation service
│   │   │   └── journal_service.py      # Journal CRUD logic
│   │   └── main.py               # FastAPI application factory & middleware
│   ├── uploads/                  # Secure local audio storage (git-ignored)
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Backend environment template
│   └── README.md
│
├── ml/                           # ML Training, Dataset & Evaluation Pipeline
│   ├── dataset/                  # Dataset splits and raw audio
│   │   ├── raw/                  # Downloaded raw audio and transcripts
│   │   ├── processed/            # 16kHz resampled audio and normalized text
│   │   ├── train/                # Training set manifest & audio
│   │   ├── validation/           # Validation set manifest & audio
│   │   └── test/                 # Test set manifest & audio
│   ├── preprocessing/            # Audio resampling & Romanized text normalization
│   ├── training/                 # Model fine-tuning & evaluation scripts
│   │   ├── config.py             # Hyperparameters, paths & training configs
│   │   ├── train.py              # Hugging Face Seq2SeqTrainer fine-tuning script
│   │   └── evaluate.py           # WER / CER evaluation against baseline
│   ├── experiments/              # Experiment logs, metrics, and training reports
│   └── README.md
│
├── models/                       # Local directory for saved fine-tuned checkpoints
├── docs/                         # Architecture, dataset notes, and API documentation
│   ├── architecture.md
│   ├── datasets.md
│   └── api_spec.md
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Web Audio API |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, PostgreSQL (with SQLite auto-fallback), Uvicorn, Python-Jose (JWT), Passlib |
| **Machine Learning** | PyTorch, Hugging Face Transformers, Hugging Face Datasets, OpenAI Whisper Small (`openai/whisper-small`), Librosa, SoundFile, JiWER, Accelerate |
| **AI Enhancements** | Google Gemini API (summarization & journal polishing), IndicTrans2 (translation) |

---

## 🚀 Getting Started (Phase 1)

### 1. Prerequisites
- **Node.js** >= 18 (Tested with v22.16)
- **Python** >= 3.10 (Tested with 3.10.9)
- **PostgreSQL** (Optional for local dev; SQLite fallback is supported out of the box)

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run FastAPI backend
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```
Frontend will be live at: [http://localhost:5173](http://localhost:5173)

---

## 📊 Implementation Roadmap

- [x] **Phase 1: Project Setup & Core Scaffolding** (Folder structure, FastAPI, React + TS + Tailwind, Database & Auth models, API proxy)
- [ ] **Phase 2: ML Pipeline & Whisper Fine-Tuning** (Dataset preparation, 16kHz resampling, Romanized transliteration normalization, baseline WER/CER, Hugging Face Whisper fine-tuning)
- [ ] **Phase 3: Backend Integration** (Audio upload endpoints, Whisper inference service, Journal CRUD, JWT auth)
- [ ] **Phase 4: Frontend Development** (Warm digital-diary UI, Web Audio microphone recorder, transcript review & edit, journal history)
- [ ] **Phase 5: Optional AI Features** (Gemini journal polishing, short summaries, English translation)
- [ ] **Phase 6: Verification, Testing & Deployment** (End-to-end testing, error handling, Dockerization & documentation)
