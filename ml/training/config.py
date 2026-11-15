"""
Configuration parameters for MOZHI Whisper Small fine-tuning on Manglish.
"""
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ModelConfig:
    pretrained_model_name: str = "openai/whisper-small"
    language: str = "Malayalam"
    task: str = "transcribe"
    sampling_rate: int = 16000
    max_duration_seconds: float = 30.0

@dataclass
class TrainingConfig:
    output_dir: Path = Path("models/mozhi-whisper-small")
    train_manifest: Path = Path("ml/dataset/train/manifest.json")
    val_manifest: Path = Path("ml/dataset/validation/manifest.json")
    test_manifest: Path = Path("ml/dataset/test/manifest.json")
    
    # Hyperparameters
    per_device_train_batch_size: int = 8
    per_device_eval_batch_size: int = 8
    gradient_accumulation_steps: int = 2
    learning_rate: float = 1e-5
    warmup_steps: int = 500
    max_steps: int = 5000
    gradient_checkpointing: bool = True
    fp16: bool = True  # Set to False if running on CPU
    evaluation_strategy: str = "steps"
    eval_steps: int = 500
    save_steps: int = 500
    save_total_limit: int = 2
    metric_for_best_model: str = "wer"
    greater_is_better: bool = False
    dataloader_num_workers: int = 2

@dataclass
class EvaluationConfig:
    baseline_model: str = "openai/whisper-small"
    fine_tuned_model: Path = Path("models/mozhi-whisper-small")
    results_dir: Path = Path("ml/experiments")
