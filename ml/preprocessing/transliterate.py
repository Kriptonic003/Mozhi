"""
Malayalam Unicode to Romanized Manglish Transliteration Engine.
Translates Malayalam script into natural, readable Romanized Manglish,
while preserving English words and acronyms intact.
"""
import re
import unicodedata

# Independent vowels
SWARAS = {
    'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
    'ഋ': 'ri', 'എ': 'e', 'ഏ': 'e', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'o',
    'ഔ': 'au', 'അം': 'am', 'അഃ': 'ah'
}

# Vowel signs (Matras)
MATRAS = {
    'ാ': 'aa', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
    'ൃ': 'ri', 'െ': 'e', 'േ': 'e', 'ൈ': 'ai', 'ൊ': 'o',
    'ോ': 'o', 'ൌ': 'au', 'ൗ': 'au', 'ം': 'm', 'ഃ': 'h'
}

# Consonants with inherent 'a'
CONSONANTS = {
    'ക': 'k', 'ഖ': 'kh', 'ഗ': 'g', 'ഘ': 'gh', 'ങ': 'ng',
    'ച': 'ch', 'ഛ': 'chh', 'ജ': 'j', 'ഝ': 'jh', 'ഞ': 'nj',
    'ട': 't', 'ഠ': 'th', 'ഡ': 'd', 'ഢ': 'dh', 'ണ': 'n',
    'ത': 'th', 'ഥ': 'th', 'ദ': 'd', 'ധ': 'dh', 'ന': 'n',
    'പ': 'p', 'ഫ': 'f', 'ബ': 'b', 'ഭ': 'bh', 'മ': 'm',
    'യ': 'y', 'ര': 'r', 'ല': 'l', 'വ': 'v', 'ശ': 'sh',
    'ഷ': 'sh', 'സ': 's', 'ഹ': 'h', 'ള': 'l', 'ഴ': 'zh',
    'റ': 'r'
}

# Chillu characters (pure consonants without vowel)
CHILLUS = {
    'ൽ': 'l', 'ൾ': 'l', 'ൺ': 'n', 'ൻ': 'n', 'ർ': 'r', 'ൿ': 'k',
    'ൔ': 'n', 'ൕ': 'n', 'ൖ': 'l'
}

VIRAMA = '്'

# Common conjunct overrides for natural Manglish
CONJUNCTS = {
    'റ്റ': 'tt',
    'ന്റ': 'nt',
    'ങ്ക': 'nk',
    'ഞ്ച': 'nch',
    'ണ്ട': 'nd',
    'ന്ത': 'nth',
    'മ്പ': 'mp',
    'ബ്ബ': 'bb',
    'മ്മ': 'mm',
    'യ്യ': 'yy',
    'ല്ല': 'll',
    'ള്ള': 'll',
    'വ്വ': 'vv',
    'ശ്ശ': 'sh',
    'സ്സ': 'ss',
    'ണ്ണ': 'nn',
    'ങ്ങ': 'ng',
    'ച്ച': 'ch',
    'ക്ക': 'kk',
    'ത്ത': 'th',
    'പ്പ': 'pp',
    'ഞ്ഞ': 'nj',
    'ജ്ഞ': 'jn',
    'ക്ഷ': 'ksh',
}

def transliterate_malayalam_word(word: str) -> str:
    """Transliterate a single Malayalam or hybrid word."""
    if not word:
        return ""
    # If the word is entirely ASCII/Latin, keep as is
    if all(ord(c) < 128 for c in word):
        return word

    word = unicodedata.normalize('NFC', word)

    # Check for English root with Malayalam suffix (e.g., companyക്ക് -> company-kku, standardsാണ് -> standards-aanu)
    hybrid_match = re.match(r"^([A-Za-z0-9_-]+)([\u0D00-\u0D7F]+)$", word)
    if hybrid_match:
        eng_part = hybrid_match.group(1)
        mal_part = hybrid_match.group(2)
        trans_mal = transliterate_malayalam_word(mal_part)
        return f"{eng_part}-{trans_mal}"

    # Replace known conjuncts first
    for conj, repl in CONJUNCTS.items():
        word = word.replace(conj, repl)

    result = []
    i = 0
    n = len(word)

    while i < n:
        c = word[i]

        # 1. Chillu letters
        if c in CHILLUS:
            result.append(CHILLUS[c])
            i += 1
            # Skip optional following virama on chillu (e.g. ൽ + ്)
            if i < n and word[i] == VIRAMA:
                i += 1
            continue

        # 2. Independent Swaras
        if c in SWARAS:
            result.append(SWARAS[c])
            i += 1
            continue

        # 3. Consonants
        if c in CONSONANTS:
            base = CONSONANTS[c]
            if i + 1 < n:
                next_c = word[i + 1]
                if next_c == VIRAMA:
                    if i + 2 < n:
                        next_next = word[i + 2]
                        if next_next in CONSONANTS or next_next in CHILLUS:
                            result.append(base)
                            i += 2
                            continue
                        else:
                            result.append(base + 'u')
                            i += 2
                            continue
                    else:
                        result.append(base + 'u')
                        i += 2
                        continue
                elif next_c in MATRAS:
                    result.append(base + MATRAS[next_c])
                    i += 2
                    continue
                elif next_c in CHILLUS:
                    result.append(base + 'a')
                    i += 1
                    continue
                else:
                    result.append(base + 'a')
                    i += 1
                    continue
            else:
                result.append(base + 'a')
                i += 1
                continue

        # 4. Standalone Matra
        if c in MATRAS:
            result.append(MATRAS[c])
            i += 1
            continue

        # 5. Virama alone
        if c == VIRAMA:
            result.append('u')
            i += 1
            continue

        # Other chars
        result.append(c)
        i += 1

    trans = "".join(result)

    # Post-processing cleanup for natural Manglish
    trans = re.sub(r'aannu$', 'aanu', trans)
    trans = re.sub(r'aann$', 'aanu', trans)
    trans = re.sub(r'aaanu', 'aanu', trans)
    trans = re.sub(r'aanoo$', 'aano', trans)
    trans = re.sub(r'ennu$', 'ennu', trans)
    trans = re.sub(r'njnja', 'nja', trans)
    trans = re.sub(r'njnju', 'nju', trans)
    trans = re.sub(r'aalu$', 'aal', trans)
    trans = re.sub(r'bhaagm', 'bhaagam', trans)

    return trans


def transliterate_text(text: str) -> str:
    """Transliterate a full mixed sentence into Romanized Manglish."""
    tokens = re.split(r'(\s+|[.,!?;:()"-])', text)
    out_tokens = []
    for token in tokens:
        if not token or token.isspace() or re.match(r'^[.,!?;:()"-]+$', token):
            out_tokens.append(token)
        else:
            out_tokens.append(transliterate_malayalam_word(token))

    res = "".join(out_tokens)
    res = re.sub(r'\s+', ' ', res).strip()
    return res
