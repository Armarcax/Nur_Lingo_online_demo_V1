#!/usr/bin/env python3
"""
NUR Lingo — QP Test Database Generator (From Images)
Extracts questions from public/qp_test/1.png ... 32.png using OCR.
Uses the same logic and category keywords as the driving DB generator.

Requirements:
    pip install pytesseract pillow
    Tesseract OCR installed with Armenian (hye) language data.
"""

import re
import json
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import pytesseract
from PIL import Image

# ─── CONFIG ────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent
IMAGES_DIR = ROOT / "public" / "qp_test"
OUTPUT_DATA = IMAGES_DIR / "data"
OUTPUT_FILE = OUTPUT_DATA / "all-questions.json"

# ✅ Tesseract-ի ուղին (եթե այլ տեղ է տեղադրվել, փոխիր այստեղ)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ─── REGEX (FROM ORIGINAL SCRIPT) ──────────────────────────────────

NUM_LINE_RE = re.compile(r"^(\d{1,3})\.\s*(.*)$")

# Answer line (Armenian)
ANS_RE = {
    "hy": re.compile(r"^Պատ\.?\s*[՝:]?\s*(\d+)", re.IGNORECASE),
    "en": re.compile(r"^(?:Ans\.?|Answer)\s*[:\-]?\s*(\d+)", re.IGNORECASE),
    "ru": re.compile(r"^(?:отв\.?|Ответ)\s*[:\-]?\s*(\d+)", re.IGNORECASE),
}

# Noise: headers, footers, page numbers
NOISE_RE = re.compile(
    r"^(ԽՈՒՄԲ\s*\d|"
    r"ABC կարգեր|"
    r"տեսական հարցաշար|"
    r"^\d+\s*հարց\s*$|"
    r"էջ\s*\d+\s*/\s*\d+|"
    r"GROUP\s*\d|"
    r"Group\s*\d|"
    r"страниц\s*\d+|"
    r"стр\.\s*\d+|"
    r"Page\s*\d+|"
    r"^\s*)$",
    re.IGNORECASE,
)

# ─── CATEGORIZATION (FROM ORIGINAL SCRIPT) ─────────────────────────

CATEGORY_KEYWORDS = {
    "road_signs": ["նշան", "գծանշում", "նշաններ", "նշաններով", "նշանը", "sign", "marking", "знак", "разметк", "լուսացույց", "ազդանշան", "traffic light", "светофор"],
    "right_of_way": ["զիջ", "առաջնահերթ", "առավելություն", "առաջին", "առաջնությունը", "yield", "give way", "priority", "right of way", "уступ", "преимуществ", "приоритет"],
    "maneuvers": ["հետադարձ", "շրջադարձ", "վերադասավորվ", "մանևր", "շրջանց", "վազանց", "շրջադարձը", "turn", "u-turn", "overtak", "maneuver", "разворот", "поворот", "обгон", "перестро"],
    "parking": ["կանգառ", "կայան", "park", "stop", "стоянк", "остановк", "կայանել", "կայանատեղի"],
    "speed_limits": ["արագություն", "արագ", "speed", "скорост"],
    "penalties": ["տուգանք", "պատիժ", "իրավունք", "fine", "penalt", "штраф", "наказан"],
    "yards": ["բակ", "մերձակա", "տարածք", "yard", "двор", "прилегающ", "բակից", "բակի"],
    "visibility": ["տեսանելիություն", "տեսանելի", "visibility", "видимост", "100 մ", "150 մ", "300 մ", "100 м", "150 м", "300 м"],
    "railway": ["երկաթուղ", "երկաթուղային", "գնացք", "railway", "train", "железнодорож", "поезд"],
    "bridge_tunnel": ["կամուրջ", "թունել", "ուղեկամուրջ", "էստակադ", "bridge", "tunnel", "мост", "тоннел", "эстакад"],
    "tram": ["տրամվայ", "tram", "трамва"],
    "bus_stop": ["կանգառի", "ավտոբուս", "երթուղային", "bus stop", "остановк", "автобус", "маршрут"],
}

def categorize(text: str) -> str:
    lower = text.lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in lower:
                return cat
    return "other"

# ─── OCR & PARSER ──────────────────────────────────────────────────

def extract_text_from_image(image_path: Path) -> str:
    """Extract text from image using OCR."""
    try:
        img = Image.open(image_path)
        # Convert to grayscale for better OCR
        img = img.convert('L')
        # Use Armenian and English for numbers/letters
        text = pytesseract.image_to_string(img, lang='hye+eng', config='--psm 6')
        return text
    except Exception as e:
        print(f"❌ OCR Error on {image_path.name}: {e}")
        return ""

def parse_text(text: str, image_name: str) -> list[dict]:
    """State machine parser (same logic as PDF script)."""
    questions = []
    state = "idle"
    current = None

    lines = text.split("\n")

    for line in lines:
        line = line.strip()
        if not line or NOISE_RE.match(line):
            continue

        # Detect Answer
        m_ans = ANS_RE["hy"].match(line)
        if m_ans and current is not None:
            current["correctIndex"] = int(m_ans.group(1)) - 1
            questions.append(current)
            current = None
            state = "idle"
            continue

        # Detect Number (Question or Option)
        m_num = NUM_LINE_RE.match(line)
        if m_num:
            num = int(m_num.group(1))
            inline = m_num.group(2).strip()

            if state == "idle":
                # Start new question
                current = {
                    "sourceQuestionNumber": num,
                    "prompt_lines": [inline] if inline else [],
                    "options_raw": [],
                    "correctIndex": 0,
                }
                state = "question"
            elif state in ("question", "option"):
                # Start new option
                current["options_raw"].append({
                    "num": num,
                    "lines": [inline] if inline else [],
                })
                state = "option"
            continue

        # Regular text lines
        if state == "question" and current is not None:
            current["prompt_lines"].append(line)
        elif state == "option" and current is not None and current["options_raw"]:
            current["options_raw"][-1]["lines"].append(line)

    # Finalize
    finalized = []
    for q in questions:
        prompt = " ".join(q["prompt_lines"]).strip()
        # Clean up prompt (remove weird OCR artifacts)
        prompt = re.sub(r'\s+', ' ', prompt)
        
        options = [" ".join(o["lines"]).strip() for o in q["options_raw"]]
        options = [re.sub(r'\s+', ' ', o) for o in options if o]

        if not prompt or len(options) < 2:
            continue

        finalized.append({
            "sourceQuestionNumber": q["sourceQuestionNumber"],
            "prompt": prompt,
            "options": options,
            "correctIndex": q["correctIndex"],
            "category": categorize(prompt + " " + " ".join(options)),
            "imageFilename": image_name
        })

    return finalized

# ─── MAIN ──────────────────────────────────────────────────────────

def main():
    print(f"\n{'=' * 65}")
    print("🚗 NUR Lingo — QP Image Extractor (v1.0)")
    print(f"{'=' * 65}")

    if not IMAGES_DIR.exists():
        print(f"❌ Missing folder: {IMAGES_DIR}")
        sys.exit(1)

    OUTPUT_DATA.mkdir(parents=True, exist_ok=True)

    all_questions = []
    grand_total = 0
    cat_counts = defaultdict(int)

    # Iterate 1.png to 32.png
    for i in range(1, 33):
        image_name = f"{i}.png"
        image_path = IMAGES_DIR / image_name

        if not image_path.exists():
            print(f"⚠️  {image_name} not found, skipping.")
            continue

        print(f"📖 Processing {image_name}...", end=" ", flush=True)
        
        raw_text = extract_text_from_image(image_path)
        parsed_qs = parse_text(raw_text, image_name)

        if not parsed_qs:
            print(f"⚠️ No questions parsed (OCR issue?)")
            # Save raw text for debugging if parsing fails
            debug_file = OUTPUT_DATA / f"debug_{image_name}.txt"
            debug_file.write_text(raw_text, encoding="utf-8")
            continue

        print(f"✅ {len(parsed_qs)} Q")

        for q in parsed_qs:
            grand_total += 1
            cat_counts[q["category"]] += 1
            
            # Format to match existing JSON structure
            all_questions.append({
                "id": f"qp_t01_q{grand_total:03d}",
                "testNumber": 1, # Assuming all are from one test set
                "sourceQuestionNumber": q["sourceQuestionNumber"],
                "category": q["category"],
                "prompt": {
                    "hy": q["prompt"],
                    "en": "", # Fallback
                    "ru": "", # Fallback
                },
                "options": {
                    "hy": q["options"],
                    "en": [],
                    "ru": [],
                },
                "correctIndex": q["correctIndex"],
                "imageUrl": f"/qp_test/{image_name}",
                "imageFilename": image_name,
                "page": i
            })

    # Save output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 65}")
    print("🎉 DONE")
    print(f"{'=' * 65}")
    print(f"📊 Total Questions: {grand_total}")
    print(f"\n📊 By category:")
    for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat:20s} {cnt}")
    print(f"\n📁 Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()