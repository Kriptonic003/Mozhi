# 🎙️ MOZHI — Phase 2: ML Pipeline & Fine-Tuning Execution Guide

## Current Status: Dataset Preparation COMPLETE ✅

Your uploaded **MLENSPEECH** dataset has been parsed, verified, transliterated, and split into speaker-isolated training, validation, and testing sets.

---

## 📊 Dataset Statistics Summary

| Split | Speakers | Samples (Utterances) | Duration | Total Words | Unique Vocab |
|---|---|---|---|---|---|
| **Train Set** | `SPK001`, `SPK002`, `SPK003` | **1,856** | 2.03 hours | 15,755 words | 5,118 words |
| **Validation Set** | `SPK005` | **455** | 0.55 hours | 4,277 words | 1,716 words |
| **Test Set** | `SPK004` | **572** | 0.75 hours | 5,382 words | 2,116 words |
| **TOTAL** | **5 Speakers** | **2,883** | **~3.33 hours** | **25,414 words** | — |

> [!IMPORTANT]
> **Strict Speaker Isolation:** No speaker in the training set appears in validation or testing splits. This guarantees research-grade integrity for Word Error Rate (WER) and Character Error Rate (CER) benchmarking.

---

## 🛠️ Files Created in this Step

1. **`ml/preprocessing/transliterate.py`**
   - Automated phonetic Malayalam-to-Romanized Manglish engine.
   - Preserves English loanwords (`segment reporting`, `standards`, `company`, `produce`) in Latin script.
   - Converts Malayalam conjuncts and matras into natural Manglish spelling conventions (`-kku`, `-aanu`, `-il`).

2. **`ml/dataset/loaders/split_generator.py`**
   - Automatically builds `train/manifest.json`, `validation/manifest.json`, and `test/manifest.json`.
   - Stores portable, relative audio paths ready for Google Colab or local GPU execution.

3. **`ml/dataset/stats.py`**
   - Generates comprehensive audio duration, word count, and speaker distribution metrics.

4. **`notebooks/mozhi_whisper_finetuning.ipynb`**
   - Complete, self-contained Google Colab notebook for fine-tuning `openai/whisper-small`.
   - Includes data collation, mixed-precision FP16 training, evaluation metrics, and comparative baseline vs fine-tuned evaluation.

---

## 🚀 How to Run Fine-Tuning on Google Colab (Step-by-Step)

### Step 1: Upload Data to Google Drive
Upload your `Mozhi` folder to Google Drive:
- Or at minimum: upload the `MOZHI/ml` folder and `MOZHI/notebooks/mozhi_whisper_finetuning.ipynb` to `MyDrive/MOZHI`.

### Step 2: Open Google Colab
1. Go to [https://colab.research.google.com](https://colab.research.google.com).
2. Click **Upload** and upload `notebooks/mozhi_whisper_finetuning.ipynb`.
3. In Colab, go to **Runtime → Change runtime type** → select **T4 GPU** (free tier) or **A100** (Colab Pro).

### Step 3: Run the Notebook Cells
1. **Cell 1 & 2:** Verifies GPU and installs dependencies (`transformers`, `datasets`, `evaluate`, `jiwer`, `accelerate`, etc.).
2. **Cell 3:** Mounts your Google Drive.
3. **Cell 4:** Loads the pre-generated `train/manifest.json`, `validation/manifest.json`, and `test/manifest.json`.
4. **Cell 5 & 6:** Extracts 80-channel log-Mel spectrograms and tokenizes target Romanized Manglish text.
5. **Cell 7 & 8:** Starts `Seq2SeqTrainer` fine-tuning on `openai/whisper-small` with gradient checkpointing and mixed precision.
6. **Cell 9:** Automatically evaluates both **Pretrained Baseline Whisper** vs **Fine-Tuned MOZHI Model** on held-out Speaker `SPK004` and outputs the comparison table + WER/CER scores.

---

## 🎯 Bringing the Fine-Tuned Model Back to Local MOZHI

Once Colab finishes training:
1. Download the exported `mozhi-whisper-small` folder from your Google Drive.
2. Place it in:
   ```
   MOZHI/
   └── models/
       └── mozhi-whisper-small/
           ├── config.json
           ├── model.safetensors
           ├── tokenizer.json
           └── ...
   ```
3. Restart your local backend:
   ```powershell
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will immediately print:
   ```
   [WhisperService] Loading FINE-TUNED Manglish model from: models/mozhi-whisper-small
   ```
   And your voice journal will now transcribe natural Manglish directly into Romanized Latin text!
