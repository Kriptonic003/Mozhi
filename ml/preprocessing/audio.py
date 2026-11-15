"""
Audio preprocessing script for MOZHI ML dataset.
Converts any incoming audio format to 16 kHz, single-channel (mono) PCM WAV,
and validates audio integrity.
"""
import argparse
from pathlib import Path
import soundfile as sf
import numpy as np

def resample_and_normalize_audio(input_file: Path, output_file: Path, target_sr: int = 16000) -> bool:
    """
    Load an audio file, convert to mono, resample to target_sr (16 kHz),
    and save as 16-bit PCM WAV.
    """
    try:
        import librosa
        audio, sr = librosa.load(str(input_file), sr=target_sr, mono=True)
        
        # Avoid saving completely silent or corrupt audio
        if len(audio) == 0 or np.max(np.abs(audio)) < 1e-4:
            print(f"[WARN] Audio is silent or empty: {input_file}")
            return False
            
        output_file.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(output_file), audio, target_sr, subtype="PCM_16")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to process {input_file}: {e}")
        return False

def process_directory(input_dir: Path, output_dir: Path, target_sr: int = 16000):
    valid_exts = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}
    input_files = [f for f in input_dir.rglob("*") if f.suffix.lower() in valid_exts]
    
    print(f"Found {len(input_files)} audio files in {input_dir}")
    processed = 0
    for file in input_files:
        rel_path = file.relative_to(input_dir)
        out_path = output_dir / rel_path.with_suffix(".wav")
        if resample_and_normalize_audio(file, out_path, target_sr):
            processed += 1
            
    print(f"Successfully processed {processed}/{len(input_files)} files into {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MOZHI Audio Preprocessor (16kHz Mono)")
    parser.add_argument("--input_dir", type=Path, default=Path("ml/dataset/raw"))
    parser.add_argument("--output_dir", type=Path, default=Path("ml/dataset/processed"))
    parser.add_argument("--sr", type=int, default=16000)
    args = parser.parse_args()
    
    if args.input_dir.exists():
        process_directory(args.input_dir, args.output_dir, args.sr)
    else:
        print(f"Input directory does not exist: {args.input_dir}")
