"""
Text normalization utilities for Romanized Manglish transcripts.
Handles lowercasing, punctuation normalization, hyphenated suffix standardization,
and whitespace cleanup.
"""
import re
import unicodedata

# Common Manglish grammatical suffixes attached to words
COMMON_SUFFIXES = [
    r"-il", r"-ine", r"-kku", r"-um", r"-nte", r"-ode", r"-aan", r"-aayi", r"-illa"
]

def normalize_manglish_text(text: str) -> str:
    """
    Standardize Romanized Manglish text for consistent Whisper training and WER/CER evaluation.
    
    Example:
        Input: "  Njan  innu College-il POYI! "
        Output: "njan innu college-il poyi"
    """
    if not text:
        return ""
    
    # 1. Unicode normalization (NFC)
    text = unicodedata.normalize("NFC", text)
    
    # 2. Lowercase
    text = text.lower()
    
    # 3. Standardize hyphens (en-dash, em-dash to regular hyphen)
    text = re.sub(r"[—–−]", "-", text)
    
    # 4. Remove unwanted special characters while preserving apostrophes and hyphens
    text = re.sub(r"[^\w\s\'-]", " ", text)
    
    # 5. Remove multiple hyphens or standalone hyphens
    text = re.sub(r"\s+-\s+", " ", text)
    text = re.sub(r"-{2,}", "-", text)
    
    # 6. Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    
    return text

if __name__ == "__main__":
    test_cases = [
        ("Njan innu College-il POYI!", "njan innu college-il poyi"),
        ("Pinne friends-ine kandu, chaya kudichu...", "pinne friends-ine kandu chaya kudichu"),
        ("Exam easy aayirunno? Atho tough aano??", "exam easy aayirunno atho tough aano"),
    ]
    for raw, expected in test_cases:
        res = normalize_manglish_text(raw)
        assert res == expected, f"Expected '{expected}', got '{res}'"
    print("All Manglish normalization unit tests passed!")
