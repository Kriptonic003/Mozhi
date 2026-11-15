"""
Dataset Statistics and Reporting Utility for MOZHI.
Computes audio duration, vocabulary size, speaker breakdown, and vocabulary metrics.
"""
import json
from pathlib import Path
from collections import Counter

ROOT_DIR = Path(__file__).resolve().parents[2]

def compute_split_stats(manifest_path: Path):
    if not manifest_path.exists():
        return None

    with open(manifest_path, "r", encoding="utf-8") as f:
        samples = [json.loads(line) for line in f if line.strip()]

    total_duration = sum(s.get("duration", 0.0) for s in samples)
    speakers = Counter(s.get("speaker_id") for s in samples)

    all_words = []
    for s in samples:
        all_words.extend(s.get("transcript", "").split())

    vocab = set(all_words)

    return {
        "num_samples": len(samples),
        "total_duration_hours": round(total_duration / 3600.0, 2),
        "total_duration_minutes": round(total_duration / 60.0, 1),
        "speakers": dict(speakers),
        "total_words": len(all_words),
        "vocab_size": len(vocab),
        "avg_duration_sec": round(total_duration / max(1, len(samples)), 2),
    }

def print_report():
    splits = {
        "Train Split": ROOT_DIR / "ml" / "dataset" / "train" / "manifest.json",
        "Validation Split": ROOT_DIR / "ml" / "dataset" / "validation" / "manifest.json",
        "Test Split": ROOT_DIR / "ml" / "dataset" / "test" / "manifest.json",
    }

    print("=" * 65)
    print("MOZHI DATASET STATISTICS REPORT — MLENSPEECH")
    print("=" * 65)

    grand_total_samples = 0
    grand_total_hours = 0.0

    for name, path in splits.items():
        stats = compute_split_stats(path)
        if not stats:
            print(f"[{name}] Manifest not found: {path}")
            continue

        grand_total_samples += stats["num_samples"]
        grand_total_hours += stats["total_duration_hours"]

        print(f"\n📁 {name}:")
        print(f"   Utterances (samples) : {stats['num_samples']}")
        print(f"   Audio Duration       : {stats['total_duration_hours']} hours ({stats['total_duration_minutes']} mins)")
        print(f"   Average Sample Length: {stats['avg_duration_sec']} seconds")
        print(f"   Speaker Breakdown    : {stats['speakers']}")
        print(f"   Total Words          : {stats['total_words']}")
        print(f"   Unique Vocabulary    : {stats['vocab_size']} words")

    print("\n" + "=" * 65)
    print(f"GRAND TOTAL: {grand_total_samples} samples | ~{grand_total_hours:.2f} hours of code-switched audio")
    print("=" * 65)

if __name__ == "__main__":
    print_report()
