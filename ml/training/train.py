"""
Fine-tuning pipeline for OpenAI Whisper Small on Manglish speech data.
Uses Hugging Face Transformers Seq2SeqTrainer with mixed precision,
gradient checkpointing, and WER/CER metric evaluation.
"""
import os
import json
from dataclasses import dataclass
from typing import Any, Dict, List, Union
from pathlib import Path
import torch
from datasets import Dataset, Audio
from transformers import (
    WhisperFeatureExtractor,
    WhisperTokenizer,
    WhisperProcessor,
    WhisperForConditionalGeneration,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
)
import evaluate
from ml.training.config import ModelConfig, TrainingConfig
from ml.preprocessing.text_normalizer import normalize_manglish_text


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    """
    Data collator that dynamically pads input features and labels for Whisper.
    """
    processor: Any

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        # Split inputs and labels
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        label_features = [{"input_ids": feature["labels"]} for feature in features]

        # Pad audio input features to 3000 max length
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        # Pad label token sequences
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # Replace padding with -100 to ignore in cross-entropy loss computation
        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

        # If bos token is prepended, strip it if needed
        if (labels[:, 0] == self.processor.tokenizer.bos_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


def load_manifest(manifest_path: Path, base_dir: Path = None) -> Dataset:
    """
    Load a JSON or JSONL manifest file containing audio_path, transcript, and speaker_id.
    Resolves relative audio paths against base_dir.
    """
    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")

    if base_dir is None:
        base_dir = manifest_path.resolve().parents[2]

    with open(manifest_path, "r", encoding="utf-8") as f:
        content = f.read().strip()
        if content.startswith("["):
            data = json.loads(content)
        else:
            data = [json.loads(line) for line in content.splitlines() if line.strip()]

    # Validate and resolve audio paths
    for entry in data:
        entry["normalized_text"] = normalize_manglish_text(entry.get("transcript", ""))
        audio_p = Path(entry["audio_path"])
        if not audio_p.is_absolute():
            entry["audio_path"] = str((base_dir / audio_p).resolve())
        else:
            entry["audio_path"] = str(audio_p)

    dataset = Dataset.from_list(data)
    dataset = dataset.cast_column("audio_path", Audio(sampling_rate=16000))
    return dataset


def train():
    model_cfg = ModelConfig()
    train_cfg = TrainingConfig()

    print(f"Loading processor and model: {model_cfg.pretrained_model_name}")
    feature_extractor = WhisperFeatureExtractor.from_pretrained(model_cfg.pretrained_model_name)
    tokenizer = WhisperTokenizer.from_pretrained(
        model_cfg.pretrained_model_name,
        language=model_cfg.language,
        task=model_cfg.task
    )
    processor = WhisperProcessor.from_pretrained(
        model_cfg.pretrained_model_name,
        language=model_cfg.language,
        task=model_cfg.task
    )
    model = WhisperForConditionalGeneration.from_pretrained(model_cfg.pretrained_model_name)

    # Disable cache for gradient checkpointing compatibility
    model.config.use_cache = False
    model.config.forced_decoder_ids = None
    model.config.suppress_tokens = []

    print("Loading datasets...")
    train_dataset = load_manifest(train_cfg.train_manifest)
    val_dataset = load_manifest(train_cfg.val_manifest)

    def prepare_dataset(batch):
        audio = batch["audio_path"]
        # Extract Log-Mel spectrogram (80 channels)
        batch["input_features"] = feature_extractor(
            audio["array"],
            sampling_rate=audio["sampling_rate"]
        ).input_features[0]
        # Encode target text tokens
        batch["labels"] = tokenizer(batch["normalized_text"]).input_ids
        return batch

    print("Mapping feature extraction and tokenization...")
    train_dataset = train_dataset.map(
        prepare_dataset,
        remove_columns=train_dataset.column_names,
        num_proc=train_cfg.dataloader_num_workers
    )
    val_dataset = val_dataset.map(
        prepare_dataset,
        remove_columns=val_dataset.column_names,
        num_proc=train_cfg.dataloader_num_workers
    )

    data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor)

    # Metrics
    wer_metric = evaluate.load("wer")
    cer_metric = evaluate.load("cer")

    def compute_metrics(pred):
        pred_ids = pred.predictions
        label_ids = pred.label_ids

        # Replace -100 with the pad_token_id
        label_ids[label_ids == -100] = tokenizer.pad_token_id

        # Decode tokens to strings
        pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = tokenizer.batch_decode(label_ids, skip_special_tokens=True)

        wer = 100 * wer_metric.compute(predictions=pred_str, references=label_str)
        cer = 100 * cer_metric.compute(predictions=pred_str, references=label_str)

        return {"wer": wer, "cer": cer}

    training_args = Seq2SeqTrainingArguments(
        output_dir=str(train_cfg.output_dir),
        per_device_train_batch_size=train_cfg.per_device_train_batch_size,
        gradient_accumulation_steps=train_cfg.gradient_accumulation_steps,
        learning_rate=train_cfg.learning_rate,
        warmup_steps=train_cfg.warmup_steps,
        max_steps=train_cfg.max_steps,
        gradient_checkpointing=train_cfg.gradient_checkpointing,
        fp16=train_cfg.fp16 and torch.cuda.is_available(),
        evaluation_strategy=train_cfg.evaluation_strategy,
        per_device_eval_batch_size=train_cfg.per_device_eval_batch_size,
        predict_with_generate=True,
        generation_max_length=225,
        save_steps=train_cfg.save_steps,
        eval_steps=train_cfg.eval_steps,
        logging_steps=50,
        report_to=["tensorboard"],
        load_best_model_at_end=True,
        metric_for_best_model=train_cfg.metric_for_best_model,
        greater_is_better=train_cfg.greater_is_better,
        save_total_limit=train_cfg.save_total_limit,
    )

    trainer = Seq2SeqTrainer(
        args=training_args,
        model=model,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
        tokenizer=processor.feature_extractor,
    )

    print("Starting fine-tuning...")
    trainer.train()

    print(f"Saving fine-tuned model to: {train_cfg.output_dir}")
    model.save_pretrained(train_cfg.output_dir)
    processor.save_pretrained(train_cfg.output_dir)
    print("Fine-tuning completed successfully!")


if __name__ == "__main__":
    train()
