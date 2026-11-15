"""
Comparative Evaluation Script: Pretrained Baseline vs Fine-Tuned Whisper Small.
Computes Word Error Rate (WER) and Character Error Rate (CER) on held-out test splits.
"""
import argparse
import json
from pathlib import Path
import torch
from datasets import Dataset, Audio
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from jiwer import wer, cer
from ml.preprocessing.text_normalizer import normalize_manglish_text


def evaluate_model(model_name_or_path: str, test_manifest: Path, device: str = "cuda" if torch.cuda.is_available() else "cpu"):
    print(f"\n==========================================")
    print(f"Evaluating Model: {model_name_or_path}")
    print(f"Device: {device}")
    print(f"Test Manifest: {test_manifest}")
    print(f"==========================================")

    processor = WhisperProcessor.from_pretrained(model_name_or_path)
    model = WhisperForConditionalGeneration.from_pretrained(model_name_or_path).to(device)
    model.eval()

    with open(test_manifest, "r", encoding="utf-8") as f:
        samples = json.load(f)

    dataset = Dataset.from_list(samples)
    dataset = dataset.cast_column("audio_path", Audio(sampling_rate=16000))

    predictions = []
    references = []

    for i, item in enumerate(dataset):
        audio_array = item["audio_path"]["array"]
        ref_text = normalize_manglish_text(item["transcript"])

        # Feature extraction
        inputs = processor(audio_array, sampling_rate=16000, return_tensors="pt").to(device)

        with torch.no_grad():
            forced_decoder_ids = processor.get_decoder_prompt_ids(language="malayalam", task="transcribe")
            predicted_ids = model.generate(inputs.input_features, forced_decoder_ids=forced_decoder_ids)

        pred_text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        norm_pred = normalize_manglish_text(pred_text)

        predictions.append(norm_pred)
        references.append(ref_text)

        if i < 5:
            print(f"Sample #{i+1}:")
            print(f"  Reference : {ref_text}")
            print(f"  Prediction: {norm_pred}")

    # Compute JiWER metrics
    calc_wer = wer(references, predictions) * 100.0
    calc_cer = cer(references, predictions) * 100.0

    print(f"\nResults for {model_name_or_path}:")
    print(f"  Word Error Rate (WER)     : {calc_wer:.2f}%")
    print(f"  Character Error Rate (CER): {calc_cer:.2f}%")

    return {
        "model": str(model_name_or_path),
        "wer": calc_wer,
        "cer": calc_cer,
        "samples_evaluated": len(references)
    }


def main():
    parser = argparse.ArgumentParser(description="Evaluate Whisper on Manglish test split")
    parser.add_argument("--baseline", type=str, default="openai/whisper-small")
    parser.add_argument("--fine_tuned", type=str, default="models/mozhi-whisper-small")
    parser.add_argument("--test_manifest", type=Path, default=Path("ml/dataset/test/manifest.json"))
    parser.add_argument("--output_report", type=Path, default=Path("ml/experiments/evaluation_report.json"))
    args = parser.parse_args()

    results = {}
    if args.test_manifest.exists():
        # Evaluate baseline
        baseline_results = evaluate_model(args.baseline, args.test_manifest)
        results["baseline"] = baseline_results

        # Evaluate fine-tuned if available
        if Path(args.fine_tuned).exists():
            finetuned_results = evaluate_model(args.fine_tuned, args.test_manifest)
            results["fine_tuned"] = finetuned_results
            wer_diff = baseline_results["wer"] - finetuned_results["wer"]
            cer_diff = baseline_results["cer"] - finetuned_results["cer"]
            print(f"\nImprovement:")
            print(f"  WER Delta: {wer_diff:+.2f}%")
            print(f"  CER Delta: {cer_diff:+.2f}%")
        else:
            print(f"\nFine-tuned model not found at {args.fine_tuned}. Baseline benchmark complete.")

        args.output_report.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output_report, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"Saved evaluation report to: {args.output_report}")
    else:
        print(f"Test manifest not found at {args.test_manifest}.")


if __name__ == "__main__":
    main()
