# MOZHI Machine Learning Pipeline: Manglish Whisper Fine-Tuning

This module contains the end-to-end dataset preparation, feature extraction, fine-tuning, and evaluation pipeline for training **OpenAI Whisper Small** (`openai/whisper-small`, multilingual) on code-switched Manglish speech to produce Romanized Manglish text transcripts.

---

## 📂 Directory Structure

```
ml/
├── dataset/
│   ├── raw/             # Raw audio files and transcripts (git-ignored)
│   ├── processed/       # Resampled 16 kHz mono WAVs and manifests
│   ├── train/           # Training split manifest & audios
│   ├── validation/      # Validation split manifest & audios
│   └── test/            # Held-out speaker-isolated test split
├── preprocessing/
│   ├── audio.py         # 16 kHz resampling, mono conversion, duration clipping
│   └── text_normalizer.py # Romanized Manglish text normalization
├── training/
│   ├── config.py        # Hyperparameters, paths, and Hugging Face training arguments
│   ├── train.py         # PyTorch / HF Seq2SeqTrainer fine-tuning script
│   └── evaluate.py      # Pre- vs post-fine-tuning JiWER (WER & CER) benchmark
├── experiments/         # Checkpoints, training loss logs, and evaluation reports
└── README.md
```

---

## 🔬 Scientific Methodology

1. **Model Backbone:** `openai/whisper-small` (Multilingual, 244M parameters).
   - Audio Feature Extractor: 80-channel Log-Mel spectrogram computed on 25ms windows with 10ms hops.
   - Text Tokenizer: Multilingual Byte-Pair Encoding (BPE).
2. **Target Format:** Romanized Manglish (Malayalam written in Latin alphabet with code-switched English words).
3. **Data Preprocessing:**
   - All audio resampled to 16,000 Hz single-channel (mono) PCM.
   - Max audio length: 30.0 seconds.
   - Text normalized: uniform lowercasing, consistent affix hyphenation, removal of non-standard symbols.
4. **Speaker Splitting:**
   - Train, Validation, and Test sets are partitioned strictly by **Speaker ID** to prevent speaker memorization and guarantee evaluation of true out-of-speaker generalization.
5. **Evaluation Protocol:**
   - Word Error Rate (WER) and Character Error Rate (CER) computed with `jiwer`.
   - Comparative evaluation: **Pretrained Whisper Small (Baseline)** vs **Fine-Tuned MOZHI Model** on the exact same held-out test split.

---

## 💻 Running the ML Pipeline

### 1. Requirements
Install ML dependencies:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers datasets evaluate jiwer librosa soundfile accelerate
```

### 2. Audio & Text Preprocessing
```bash
python ml/preprocessing/audio.py --input_dir ml/dataset/raw --output_dir ml/dataset/processed
python ml/preprocessing/text_normalizer.py
```

### 3. Fine-Tuning
```bash
python ml/training/train.py --config ml/training/config.py
```

### 4. Evaluation
```bash
python ml/training/evaluate.py --model_path models/mozhi-whisper-small --test_manifest ml/dataset/test/manifest.json
```
