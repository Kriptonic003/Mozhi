# MOZHI REST API Specification

Base URL: `http://localhost:8000/api`

## Authentication (`/api/auth`)

### 1. `POST /api/auth/register`
Register a new user.
- **Request Body:**
  ```json
  {
    "username": "peeter",
    "email": "peeter@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "username": "peeter",
    "email": "peeter@example.com",
    "created_at": "2026-11-14T11:00:00Z"
  }
  ```

### 2. `POST /api/auth/login`
Authenticate user and obtain JWT access token.
- **Request Body (OAuth2 Form or JSON):**
  ```json
  {
    "username": "peeter@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "username": "peeter",
      "email": "peeter@example.com"
    }
  }
  ```

### 3. `GET /api/auth/me`
Retrieve currently logged-in user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "username": "peeter",
    "email": "peeter@example.com",
    "created_at": "2026-11-14T11:00:00Z"
  }
  ```

---

## Transcription (`/api/transcription`)

### 1. `POST /api/transcription/transcribe`
Submit audio for Romanized Manglish transcription using the fine-tuned Whisper model.
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `audio`: File (WAV, MP3, M4A, WebM)
  - `language`: string (default: `"ml"`)
- **Response (200 OK):**
  ```json
  {
    "audio_path": "uploads/user_1_audio_20261114_112030.wav",
    "original_transcript": "Njan innu college-il poyi, pinne friends-ine kandu.",
    "duration_seconds": 4.82,
    "model_name": "mozhi-whisper-small-manglish",
    "confidence_score": 0.94
  }
  ```

---

## Journal Entries (`/api/journals`)

### 1. `POST /api/journals`
Create a new journal entry.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "College Day Reflection",
    "audio_path": "uploads/user_1_audio_20261114_112030.wav",
    "original_transcript": "Njan innu college-il poyi, pinne friends-ine kandu.",
    "edited_transcript": "Njan innu college-il poyi, pinne friends-ine kandu.",
    "english_translation": null,
    "polished_entry": null,
    "summary": null
  }
  ```
- **Response (201 Created):** Journal Entry Object

### 2. `GET /api/journals`
List all journal entries for authenticated user with pagination and keyword search.
- **Query Parameters:** `page=1&limit=20&search=college`
- **Response (200 OK):** List of Journal Entry Objects

### 3. `GET /api/journals/{id}`
Retrieve a specific journal entry.

### 4. `PUT /api/journals/{id}`
Update an existing journal entry (e.g. edited transcript or AI enhancements).

### 5. `DELETE /api/journals/{id}`
Delete a journal entry and its associated audio file.

---

## Optional AI Features (`/api/ai`)

### 1. `POST /api/ai/translate`
Translate Romanized Manglish to English.

### 2. `POST /api/ai/polish`
Generate a well-written, reflective personal diary passage from the spoken notes.

### 3. `POST /api/ai/summarize`
Generate concise 2-sentence summary and extract top topics.
