# Manglish Speech Recognition Datasets & Methodology

## 1. Objective
Train and evaluate OpenAI Whisper Small (`openai/whisper-small`, multilingual) to accurately transcribe natural spoken Manglish into **Romanized Manglish text** (e.g., `"Njan innu college-il poyi, pinne friends-ine kandu"`).

---

## 2. Dataset Candidates & Characteristics

### A. MLENSPEECH — Malayalam-English Code-Switched Speech
- **Audio Duration:** ~3 hours 20 minutes (~200 minutes).
- **Utterances:** ~2,883 recorded utterances.
- **Speakers:** 5 bilingual speakers.
- **Nature of Data:** Spontaneous and read Malayalam-English code-switched conversational speech.
- **Relevance:** Primary initial resource for conversational code-switching patterns.
- **Speaker Splitting:** Crucial to isolate speakers (e.g. 3 speakers for train, 1 for validation, 1 for test) to prevent data leakage and measure cross-speaker generalization.

### B. Malayalam ASR Corpus (Hugging Face)
- **Samples:** ~86,000 samples.
- **Nature of Data:** Pure Malayalam speech paired with native Malayalam script transcripts.
- **Relevance:** Useful for domain adaptation of the Whisper encoder to acoustic variations of Malayalam phonetics.
- **Transliteration Note:** Native Malayalam text requires rule-based/statistical transliteration (e.g. via `indic-transliteration` or `ML2Manglish` mappings) into Romanized format. Requires manual quality verification before use to avoid synthetic transliteration artifacts.

### C. Malayalam ASR 5K (ICFOSS)
- **Samples:** ~5,225 manually verified pairs.
- **Duration:** ~7.1 hours.
- **Speakers:** 18 distinct speakers.
- **Relevance:** High acoustic quality for Malayalam speech.
- **License / Verification:** Check institutional licensing and attribution guidelines prior to model weight redistribution.

### D. SeLLaI Mal-Eng Text Corpus
- **Size:** ~22,400 Manglish / code-mixed text sentences.
- **Nature of Data:** Text-only corpus.
- **Relevance:** Used to build language model tokenization priors, evaluate common Romanized spelling conventions, and fine-tune text decoders or prompt templates.
- **Constraint:** **Not** an audio dataset; cannot be used directly for acoustic training.

### E. Volunteer Manglish Collection
- **Protocol:** Standardized recording prompt protocol.
- **Consent:** Explicit written informed consent for research and open-source model training.
- **Privacy:** Strict isolation between volunteer training data and private end-user journal entries. Private journal entries must **never** enter training sets.

---

## 3. Romanized Manglish Normalization Conventions

To ensure consistent WER/CER evaluation and model convergence, transcripts are normalized according to explicit phonetic rules:
1. **Case:** Lowercase normalization for evaluation, with standard title casing restored for UI presentation.
2. **Punctuation:** Standardized punctuation preservation (commas, periods, hyphens for compound suffixes like `-il`, `-ine`, `-kku`).
3. **Suffix Hyphenation:** Consistency in Malayalam agglutinative suffixes attached to English roots (e.g., `college-il` vs `collegeil`).
4. **Numeral Expansion:** Spoken numeral normalization (e.g., "randu" instead of "2" unless dates).
