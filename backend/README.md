# MOZHI Backend Service

FastAPI-powered asynchronous backend for the MOZHI Manglish voice journaling platform.

## Features
- **Manglish Whisper Inference:** Dedicated service loading fine-tuned Whisper Small model weights for Romanized Manglish speech.
- **Audio Ingestion & Validation:** Handles WAV, MP3, M4A, WebM uploads with size limits and static audio serving for diary playback.
- **Journal CRUD:** Full persistence of voice entries with separation of original vs edited transcripts and AI reflections.
- **Security:** Stateless JWT authentication with bcrypt password hashing.
- **Flexible DBMS:** Configured for PostgreSQL in production and SQLite for rapid local testing.

## Running Locally

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate   # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Explore interactive Swagger documentation:
   Open [http://localhost:8000/docs](http://localhost:8000/docs)
