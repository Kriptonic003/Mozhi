"""
Speaker-Isolated Dataset Split Generator for MOZHI.

Ensures ZERO speaker overlap between Train, Validation, and Test sets:
- Train: SPK001, SPK002, SPK003 (1,856 utterances)
- Validation: SPK005 (455 utterances)
- Test: SPK004 (572 utterances)

Generates:
  ml/dataset/train/manifest.json
  ml/dataset/validation/manifest.json
  ml/dataset/test/manifest.json
"""
import json
import soundfile as sf
from pathlib import Path
from tqdm import tqdm
import sys

# Ensure project root directory is in python path
ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

from ml.preprocessing.transliterate import transliterate_text
from ml.preprocessing.text_normalizer import normalize_manglish_text

RAW_MANIFEST = ROOT_DIR / "ml" / "dataset" / "mlenspeech_raw_manifest.jsonl"
DATASET_DIR = ROOT_DIR / "ml" / "dataset"

TRAIN_SPEAKERS = {"SPK001", "SPK002", "SPK003"}
VAL_SPEAKERS = {"SPK005"}
TEST_SPEAKERS = {"SPK004"}


def generate_splits():
    if not RAW_MANIFEST.exists():
        print(f"[ERROR] Raw manifest not found: {RAW_MANIFEST}")
        print("Run ml/dataset/loaders/mlenspeech_loader.py first.")
        return

    train_dir = DATASET_DIR / "train"
    val_dir = DATASET_DIR / "validation"
    test_dir = DATASET_DIR / "test"

    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)
    test_dir.mkdir(parents=True, exist_ok=True)

    train_manifest = train_dir / "manifest.json"
    val_manifest = val_dir / "manifest.json"
    test_manifest = test_dir / "manifest.json"

    print(f"[SplitGenerator] Reading from {RAW_MANIFEST}...")

    train_entries = []
    val_entries = []
    test_entries = []

    with open(RAW_MANIFEST, "r", encoding="utf-8") as f:
        lines = f.readlines()

    print(f"[SplitGenerator] Processing {len(lines)} audio samples...")

    for line in tqdm(lines, desc="Processing samples"):
        item = json.loads(line)
        spk = item["speaker_id"]
        wav_path = Path(item["audio_path"])

        if not wav_path.exists():
            continue

        # Get audio duration
        try:
            info = sf.info(str(wav_path))
            duration = round(float(info.duration), 2)
        except Exception:
            duration = 0.0

        # Transliterate to Romanized Manglish & normalize
        unicode_txt = item.get("transcript_unicode", "")
        romanized_txt = transliterate_text(unicode_txt)
        normalized_txt = normalize_manglish_text(romanized_txt)

        # Compute path relative to project root for portability (Colab / Windows / Linux)
        try:
            rel_audio_path = wav_path.relative_to(ROOT_DIR).as_posix()
        except ValueError:
            rel_audio_path = wav_path.as_posix()

        manifest_entry = {
            "audio_path": rel_audio_path,
            "file_id": item["file_id"],
            "speaker_id": spk,
            "transcript": normalized_txt,
            "transcript_original": unicode_txt,
            "duration": duration,
        }

        if spk in TRAIN_SPEAKERS:
            train_entries.append(manifest_entry)
        elif spk in VAL_SPEAKERS:
            val_entries.append(manifest_entry)
        elif spk in TEST_SPEAKERS:
            test_entries.append(manifest_entry)

    def write_jsonl(entries, path):
        with open(path, "w", encoding="utf-8") as out_f:
            for e in entries:
                out_f.write(json.dumps(e, ensure_ascii=False) + "\n")

    write_jsonl(train_entries, train_manifest)
    write_jsonl(val_entries, val_manifest)
    write_jsonl(test_entries, test_manifest)

    print("\n" + "=" * 60)
    print("Speaker-Isolated Splits Summary:")
    print("=" * 60)
    print(f"Train set:       {len(train_entries)} samples (Speakers: {sorted(list(TRAIN_SPEAKERS))})")
    print(f"Validation set:  {len(val_entries)} samples (Speakers: {sorted(list(VAL_SPEAKERS))})")
    print(f"Test set:        {len(test_entries)} samples (Speakers: {sorted(list(TEST_SPEAKERS))})")
    print(f"Total processed: {len(train_entries) + len(val_entries) + len(test_entries)} samples")
    print("\nManifests created:")
    print(f"  - {train_manifest}")
    print(f"  - {val_manifest}")
    print(f"  - {test_manifest}")
    print("=" * 60)


if __name__ == "__main__":
    generate_splits()
