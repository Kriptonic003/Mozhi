"""
Whisper Inference Service for Romanized Manglish Speech Recognition.

IMPORTANT — Baseline vs Fine-Tuned Behavior:
- BASELINE (openai/whisper-small): The pretrained model outputs in whatever script
  it detects (Malayalam Unicode, Devanagari, or garbage Unicode). This is expected.
  The model has never been trained to output ROMANIZED Manglish.
- FINE-TUNED (Phase 2 output): After fine-tuning on MLENSPEECH with Romanized
  Manglish transcripts, the model will output Latin-script Romanized Manglish.

For the baseline, we use English forced-decoding as the best available approximation.
This gives partially intelligible phonetic Latin output rather than native script garbage.
"""
import re
from pathlib import Path
from typing import Tuple
from app.core.config import settings


def _strip_non_latin_hallucinations(text: str) -> str:
    """
    For the baseline model, strip out Unicode characters outside the Latin extended
    range (U+0000-U+024F). This catches Devanagari, Malayalam script, and
    hallucinated Unicode superscripts/subscripts that the untuned model emits.

    NOTE: Use a non-raw string so that \\u escapes are interpreted as Unicode code points.
    In raw strings (r""), \\x024F is parsed as \\x02 + literal '4F', breaking the range.
    """
    # Non-raw string: \u escapes are real Unicode here
    cleaned = re.sub("[\u0250-\uD7FF\uE000-\uFFFF]", "", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def _truncate_repetition_loops(text: str) -> str:
    """
    Detect and truncate repetition-loop hallucinations from Whisper output.

    Whisper (especially with limited fine-tuning) can fall into loops where it
    repeats a short substring endlessly, e.g.:
      "njaan ippo samsaarikkunnu ... nmummummumumumumumumumum..."

    Strategy:
    1. Detect any substring of 2-6 chars that repeats 3+ times consecutively.
    2. Truncate at the start of the first repetition loop.
    3. Also detect full-word repetitions (same word 3+ times in a row).
    """
    if not text or len(text) < 10:
        return text

    # Pattern 1: Short substring (2-6 chars) repeating 3+ times consecutively
    # This catches "mumumumum", "nanana", "ththth" etc.
    match = re.search(r'(.{2,6}?)\1{2,}', text)
    if match:
        loop_start = match.start()
        # Keep everything before the loop, plus one instance of the repeated unit
        before_loop = text[:loop_start].rstrip()
        if before_loop:
            text = before_loop
            print(f"[WhisperService] Truncated repetition loop at position {loop_start}")
        # If loop is at the very start, keep one instance
        else:
            text = match.group(1)

    # Pattern 2: Same word repeating 3+ times in a row
    # This catches "hello hello hello hello" → "hello"
    text = re.sub(r'\b(\w+)(\s+\1){2,}\b', r'\1', text)

    return text.strip()


class WhisperService:
    _instance = None
    _model = None
    _processor = None
    _device = None
    _is_fine_tuned = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._device = settings.DEVICE

    def _load_model(self):
        """
        Lazily load the Whisper model and processor on first inference call.
        Checks for a local fine-tuned checkpoint first, falls back to
        openai/whisper-small from local HuggingFace cache.
        """
        if self._model is not None and self._processor is not None:
            return

        import torch
        from transformers import WhisperProcessor, WhisperForConditionalGeneration

        if self._device == "cuda" and not torch.cuda.is_available():
            self._device = "cpu"

        # Check if a local fine-tuned model exists in models/ directory (root or backend)
        model_path = settings.WHISPER_MODEL_NAME_OR_PATH
        local_ft_candidates = [
            settings.BASE_DIR.parent / "models" / "mozhi-whisper-small",
            settings.BASE_DIR / "models" / "mozhi-whisper-small",
        ]
        local_ft_path = None
        for candidate in local_ft_candidates:
            if candidate.exists() and any(candidate.iterdir()):
                local_ft_path = candidate
                break

        local_files_only = False
        if local_ft_path is not None:
            model_path = str(local_ft_path)
            self._is_fine_tuned = True
            local_files_only = True
            print(f"[WhisperService] Loading FINE-TUNED Manglish model from: {model_path}")
        else:
            self._is_fine_tuned = False
            print(f"[WhisperService] BASELINE model ({model_path}) — not fine-tuned on Manglish yet.")
            print("[WhisperService] Output will be approximate phonetic Latin, not true Romanized Manglish.")

        self._processor = WhisperProcessor.from_pretrained(model_path, local_files_only=local_files_only)
        self._model = WhisperForConditionalGeneration.from_pretrained(
            model_path, local_files_only=local_files_only
        ).to(self._device)
        self._model.eval()
        print(f"[WhisperService] Model loaded on {self._device}.")

    def transcribe(self, audio_path: Path) -> Tuple[str, float]:
        """
        Transcribe an audio file.
        - Fine-tuned model: outputs true Romanized Manglish (e.g. "Njan innu college-il poyi").
        - Baseline model: attempts phonetic Latin approximation with English decoding.

        Returns: (transcribed_text, duration_seconds)
        """
        import torch
        import numpy as np

        self._load_model()

        # --- Audio Loading: prefer soundfile for WAV (no FFmpeg), fallback to librosa ---
        speech_array = None
        try:
            import soundfile as sf
            speech_array, sr = sf.read(str(audio_path), dtype="float32")
            if speech_array.ndim > 1:
                speech_array = np.mean(speech_array, axis=1)  # stereo -> mono
            if sr != 16000:
                import librosa
                speech_array = librosa.resample(speech_array, orig_sr=sr, target_sr=16000)
        except Exception as e:
            print(f"[WhisperService] soundfile read failed ({e}), trying librosa...")
            try:
                import librosa
                speech_array, _ = librosa.load(str(audio_path), sr=16000, mono=True)
            except Exception as e2:
                raise RuntimeError(
                    f"Could not read audio file '{audio_path.name}'. "
                    f"soundfile error: {e} | librosa error: {e2}. "
                    "Make sure the file is a valid WAV/MP3/FLAC and that soundfile+librosa are installed."
                )

        if speech_array is None or len(speech_array) == 0:
            raise RuntimeError("Audio file appears to be empty or could not be decoded.")

        duration_seconds = float(len(speech_array) / 16000.0)
        print(f"[WhisperService] Audio loaded: {duration_seconds:.2f}s, {len(speech_array)} samples")

        # --- Feature Extraction ---
        inputs = self._processor(
            speech_array,
            sampling_rate=16000,
            return_tensors="pt"
        ).to(self._device)

        # --- Decoding Strategy ---
        # Use forced_decoder_ids — works reliably across Transformers 4.x and 5.x
        lang = "malayalam" if self._is_fine_tuned else "english"
        with torch.no_grad():
            try:
                forced_decoder_ids = self._processor.get_decoder_prompt_ids(
                    language=lang, task="transcribe"
                )
            except Exception:
                forced_decoder_ids = None

            predicted_ids = self._model.generate(
                inputs.input_features,
                forced_decoder_ids=forced_decoder_ids,
                max_new_tokens=225,
                repetition_penalty=1.3,
                no_repeat_ngram_size=4,
            )

        # --- Decode and clean ---
        transcription = self._processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        transcription = transcription.strip()
        print(f"[WhisperService] Raw output: {repr(transcription[:200])}")

        # Post-process: truncate any repetition-loop hallucinations
        transcription = _truncate_repetition_loops(transcription)

        # For baseline model: attempt to strip non-Latin hallucinations,
        # but fall back to raw output if stripping produces an empty string.
        if not self._is_fine_tuned:
            cleaned = _strip_non_latin_hallucinations(transcription)
            if cleaned.strip():
                transcription = cleaned
                print(f"[WhisperService] Cleaned output: {repr(transcription[:200])}")
            else:
                # Stripping removed everything — the model produced pure non-Latin script.
                # Return a helpful placeholder so the UI shows something meaningful.
                print(f"[WhisperService] Strip removed all content. Raw was: {repr(transcription[:200])}")
                transcription = "[Baseline model output is in native script — fine-tuning required for Romanized Manglish]"

        return transcription, round(duration_seconds, 2)

    @property
    def model_identifier(self) -> str:
        if self._is_fine_tuned:
            return "mozhi-whisper-small-manglish (fine-tuned)"
        return f"{settings.WHISPER_MODEL_NAME_OR_PATH} (baseline — pre fine-tuning)"


whisper_service = WhisperService.get_instance()
