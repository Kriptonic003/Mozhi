"""
MOZHI Transcription Diagnostic Script
Run this from the backend/ directory to test your Whisper setup step by step.

Usage:
    cd backend
    python diagnose.py
"""
import sys
import os

print("=" * 60)
print("MOZHI Transcription Diagnostic")
print("=" * 60)
print(f"Python: {sys.version}")
print()

# 1. Check soundfile
print("[1] Checking soundfile...")
try:
    import soundfile as sf
    print(f"    ✅ soundfile {sf.__version__} installed")
except ImportError:
    print("    ❌ soundfile NOT installed — run: pip install soundfile")
    print("    (This is required for WAV audio loading)")

# 2. Check librosa
print("[2] Checking librosa...")
try:
    import librosa
    print(f"    ✅ librosa {librosa.__version__} installed")
except ImportError:
    print("    ❌ librosa NOT installed — run: pip install librosa")

# 3. Check torch
print("[3] Checking PyTorch...")
try:
    import torch
    print(f"    ✅ torch {torch.__version__}")
    print(f"    CUDA available: {torch.cuda.is_available()}")
except ImportError:
    print("    ❌ torch NOT installed")

# 4. Check transformers
print("[4] Checking transformers...")
try:
    import transformers
    print(f"    ✅ transformers {transformers.__version__}")
except ImportError:
    print("    ❌ transformers NOT installed")

# 5. Check numpy
print("[5] Checking numpy...")
try:
    import numpy as np
    print(f"    ✅ numpy {np.__version__}")
except ImportError:
    print("    ❌ numpy NOT installed")

# 6. Try loading Whisper model (small)
print()
print("[6] Loading Whisper model (openai/whisper-small)...")
print("    This may take a few minutes if the model is not cached (~960 MB download).")
try:
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    processor = WhisperProcessor.from_pretrained("openai/whisper-small")
    model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")
    model.eval()
    print("    ✅ Whisper model loaded successfully!")
except Exception as e:
    print(f"    ❌ Failed to load Whisper model: {e}")
    print("    Make sure you have internet access and transformers is installed.")
    sys.exit(1)

# 7. Create a synthetic audio test (440 Hz tone, 3 seconds)
print()
print("[7] Running synthetic audio transcription test (440 Hz tone)...")
print("    (This won't produce meaningful text, just tests the pipeline works)")
try:
    import numpy as np
    import torch

    sample_rate = 16000
    duration = 3  # seconds
    t = np.linspace(0, duration, sample_rate * duration, dtype=np.float32)
    audio = 0.3 * np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave

    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")

    with torch.no_grad():
        try:
            predicted_ids = model.generate(
                inputs.input_features,
                language="english",
                task="transcribe",
                max_new_tokens=50,
            )
        except TypeError:
            forced_decoder_ids = processor.get_decoder_prompt_ids(
                language="english", task="transcribe"
            )
            predicted_ids = model.generate(
                inputs.input_features,
                forced_decoder_ids=forced_decoder_ids,
                max_new_tokens=50,
            )

    text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()
    print(f"    ✅ Pipeline works! Output for 440Hz tone: {repr(text)}")
    print("    (Garbage output is expected for a pure tone — this just confirms the pipeline runs)")
except Exception as e:
    import traceback
    print(f"    ❌ Transcription pipeline failed: {e}")
    traceback.print_exc()

# 8. Check for uploaded WAV files to test with
print()
print("[8] Looking for real WAV files in uploads/...")
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if os.path.exists(uploads_dir):
    wav_files = [f for f in os.listdir(uploads_dir) if f.endswith(".wav")]
    if wav_files:
        # Test with the most recent WAV
        test_file = os.path.join(uploads_dir, sorted(wav_files)[-1])
        print(f"    Found: {os.path.basename(test_file)}")
        try:
            import soundfile as sf
            data, sr = sf.read(test_file, dtype="float32")
            if data.ndim > 1:
                data = np.mean(data, axis=1)
            if sr != 16000:
                data = librosa.resample(data, orig_sr=sr, target_sr=16000)
            print(f"    Audio: {len(data)/16000:.2f}s, {sr}Hz -> resampled to 16kHz")

            inputs = processor(data, sampling_rate=16000, return_tensors="pt")
            with torch.no_grad():
                try:
                    predicted_ids = model.generate(
                        inputs.input_features,
                        language="english",
                        task="transcribe",
                        max_new_tokens=225,
                    )
                except TypeError:
                    forced_decoder_ids = processor.get_decoder_prompt_ids(
                        language="english", task="transcribe"
                    )
                    predicted_ids = model.generate(
                        inputs.input_features,
                        forced_decoder_ids=forced_decoder_ids,
                        max_new_tokens=225,
                    )
            text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()
            import re
            cleaned = re.sub(r"[^\x00-\x024F\s]", "", text).strip()
            print(f"    Raw output:     {repr(text[:200])}")
            print(f"    Cleaned output: {repr(cleaned[:200])}")
        except Exception as e:
            import traceback
            print(f"    ❌ Failed to transcribe real audio: {e}")
            traceback.print_exc()
    else:
        print("    No WAV files in uploads/ yet. Record something from the app first.")
else:
    print("    uploads/ directory does not exist yet.")

print()
print("=" * 60)
print("Diagnostic complete.")
print("=" * 60)
