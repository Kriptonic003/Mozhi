"""
MLENSPEECH Dataset Loader for MOZHI.

Dataset structure (from Malayalam-English-Speech-Dataset-main):
  MLENSPEECH/
    Spk1/   1_AudioSampleXXX.wav
    Spk2/   2_AudioSampleXXX.wav
    Spk3/   3_AudioSampleXXX.wav
    Spk4/   4_AudioSampleXXX.wav
    Spk5/   5_AudioSampleXXX.wav
    transcriptions.txt  →  "1_AudioSample001 <Malayalam Unicode transcript>"

The transcripts are in Malayalam Unicode script. Since we cannot automatically
produce perfect Romanized Manglish from Unicode Malayalam (it requires human review),
this loader generates two things:
  1. A manifest JSON with the raw Malayalam Unicode transcripts (for reference).
  2. A separate file listing entries that need manual Romanization review.

Run this script ONCE to parse and organize the dataset.
"""

import json
import re
import csv
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).resolve().parent
ML_DIR       = SCRIPT_DIR.parent.parent          # ml/
RAW_DIR      = ML_DIR / "dataset" / "raw" / "mlenspeech" / "Malayalam-English-Speech-Dataset-main" / "MLENSPEECH"
PROCESSED_DIR = ML_DIR / "dataset" / "processed" / "mlenspeech"
MANIFEST_DIR  = ML_DIR / "dataset"

TRANSCRIPT_FILE = RAW_DIR / "transcriptions.txt"

SPEAKER_MAP = {
    "1": "SPK001",
    "2": "SPK002",
    "3": "SPK003",
    "4": "SPK004",
    "5": "SPK005",
}


def parse_transcriptions(transcript_path: Path) -> dict:
    """
    Parse transcriptions.txt.
    Format per line: "1_AudioSample001 <transcript text>"
    Returns: { "1_AudioSample001": "transcript text", ... }
    """
    entries = {}
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Split on first whitespace only
            parts = line.split(None, 1)
            if len(parts) == 2:
                file_id, transcript = parts
                entries[file_id.strip()] = transcript.strip()
            elif len(parts) == 1:
                # No transcript — file ID only
                entries[parts[0].strip()] = ""
    return entries


def has_latin_content(text: str) -> bool:
    """Check if text has at least some Latin (English) characters mixed in."""
    latin_chars = sum(1 for c in text if "\u0000" <= c <= "\u024F")
    return latin_chars > 0


def load_mlenspeech():
    """
    Walk through all 5 speaker folders, match each audio file to its transcript,
    and return a list of dataset entries.
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[MLENSPEECH] Reading transcriptions from: {TRANSCRIPT_FILE}")
    transcripts = parse_transcriptions(TRANSCRIPT_FILE)
    print(f"[MLENSPEECH] Loaded {len(transcripts)} transcript entries")

    entries = []
    missing_transcripts = []

    for spk_num in range(1, 6):
        spk_dir = RAW_DIR / f"Spk{spk_num}"
        speaker_id = SPEAKER_MAP[str(spk_num)]

        if not spk_dir.exists():
            print(f"  [WARN] Speaker folder not found: {spk_dir}")
            continue

        wav_files = sorted(spk_dir.glob("*.wav"))
        print(f"  Spk{spk_num} ({speaker_id}): {len(wav_files)} wav files")

        for wav_path in wav_files:
            # file_id is the stem: "1_AudioSample001"
            file_id = wav_path.stem

            transcript = transcripts.get(file_id, None)
            if transcript is None:
                missing_transcripts.append(file_id)
                transcript = ""

            entry = {
                "audio_path": str(wav_path),
                "file_id": file_id,
                "speaker_id": speaker_id,
                "transcript_unicode": transcript,       # original Malayalam Unicode
                "transcript_romanized": "",             # to be filled by human reviewer
                "has_english_mix": has_latin_content(transcript),
                "needs_romanization": True,             # all need review
            }
            entries.append(entry)

    print(f"\n[MLENSPEECH] Total entries: {len(entries)}")
    print(f"[MLENSPEECH] Missing transcripts: {len(missing_transcripts)}")
    print(f"[MLENSPEECH] Has English mix: {sum(1 for e in entries if e['has_english_mix'])}")

    return entries


def save_manifest(entries: list, output_path: Path):
    with open(output_path, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"[MLENSPEECH] Saved manifest: {output_path} ({len(entries)} entries)")


def save_romanization_csv(entries: list, output_path: Path):
    """
    Save a CSV for human reviewers to fill in the 'transcript_romanized' column.
    Format: file_id | speaker_id | transcript_unicode | transcript_romanized (empty)
    """
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "file_id", "speaker_id", "transcript_unicode", "transcript_romanized", "audio_path"
        ])
        writer.writeheader()
        for e in entries:
            writer.writerow({
                "file_id": e["file_id"],
                "speaker_id": e["speaker_id"],
                "transcript_unicode": e["transcript_unicode"],
                "transcript_romanized": e["transcript_romanized"],
                "audio_path": e["audio_path"],
            })
    print(f"[MLENSPEECH] Saved romanization CSV: {output_path}")


if __name__ == "__main__":
    entries = load_mlenspeech()

    # Save full manifest (with Unicode transcripts)
    save_manifest(entries, MANIFEST_DIR / "mlenspeech_raw_manifest.jsonl")

    # Save CSV for human Romanization annotation
    save_romanization_csv(entries, MANIFEST_DIR / "mlenspeech_to_romanize.csv")

    print("\n── Next Step ──────────────────────────────────────────────")
    print("Open ml/dataset/mlenspeech_to_romanize.csv")
    print("Fill in the 'transcript_romanized' column for each row.")
    print("Example: 'ഞാൻ ഇന്ന് college-il poyi' → 'Njan innu college-il poyi'")
    print("Then run: python ml/dataset/loaders/split_generator.py")
    print("───────────────────────────────────────────────────────────")
