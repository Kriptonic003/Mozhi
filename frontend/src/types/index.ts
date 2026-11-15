export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface JournalEntry {
  id: number;
  user_id: number;
  title: string;
  audio_path: string | null;
  original_transcript: string;
  edited_transcript: string;
  english_translation: string | null;
  polished_entry: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalListResponse {
  items: JournalEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface TranscriptionResponse {
  audio_path: string;
  original_transcript: string;
  duration_seconds: number;
  model_name: string;
  language: string;
}

export interface TranslateResponse {
  original_text: string;
  english_translation: string;
}

export interface PolishResponse {
  original_text: string;
  polished_entry: string;
}

export interface SummarizeResponse {
  summary: string;
  key_topics: string[];
}
