#!/usr/bin/env python3
"""
NUR Lingo — Driving Exam Database Generator v3

Reads:  public/drive_test/{hy_drive,en_drive,ru_drive}/1.pdf ... 10.pdf
Writes: public/drive_test/data/test-01.json ... test-10.json
        public/drive_test/data/images/test-XX/*.png
        public/drive_test/data/index.json
        public/drive_test/data/all-questions.json

v3 fixes:
- Language auto-detection from content (not folder name)
- Handles options on same line as number
- Extended category keywords

Usage: python scripts/generate-driving-db.py
"""

import pymupdf
import re
import json
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# ─── CONFIG ────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent
DRIVE_TEST = ROOT / "public" / "drive_test"
LANG_DIRS = {
    "hy": DRIVE_TEST / "hy_drive",
    "en": DRIVE_TEST / "en_drive",
    "ru": DRIVE_TEST / "ru_drive",
}
OUTPUT_DATA = DRIVE_TEST / "data"
OUTPUT_IMAGES = OUTPUT_DATA / "images"
IMAGE_BASE_URL = "/drive_test/data/images"

# Skip tiny decorative icons
MIN_IMAGE_BYTES = 3000

# ─── REGEX ─────────────────────────────────────────────────────────

# Number + optional inline text: "1." or "1. Option text"
NUM_LINE_RE = re.compile(r"^(\d{1,3})\.\s*(.*)$")

# Answer line per language
ANS_RE = {
    "hy": re.compile(r"^Պատ\.?\s*[՝:]?\s*(\d+)"),
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

# ─── LANGUAGE DETECTION ────────────────────────────────────────────

def detect_language(text: str) -> str:
    """Auto-detect language from text content."""
    sample = text[:5000]
    if re.search(r"[ա-ֆԱ-Ֆ]", sample):
        return "hy"
    if re.search(r"[а-яА-Я]", sample):
        return "ru"
    return "en"


# ─── CATEGORIZATION ────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "road_signs": [
        "նշան", "գծանշում", "նշաններ", "նշաններով", "նշանը",
        "sign", "marking", "знак", "разметк",
        "լուսացույց", "ազդանշան", "traffic light", "светофор",
    ],
    "right_of_way": [
        "զիջ", "առաջնահերթ", "առավելություն", "առաջին", "առաջնությունը",
        "yield", "give way", "priority", "right of way",
        "уступ", "преимуществ", "приоритет",
    ],
    "maneuvers": [
        "հետադարձ", "շրջադարձ", "վերադասավորվ", "մանևր", "շրջանց",
        "վազանց", "շրջադարձը", "turn", "u-turn", "overtak", "maneuver",
        "разворот", "поворот", "обгон", "перестро",
    ],
    "parking": [
        "կանգառ", "կայան", "park", "stop", "стоянк", "остановк",
        "կայանել", "կայանատեղի",
    ],
    "speed_limits": [
        "արագություն", "արագ", "speed", "скорост",
    ],
    "penalties": [
        "տուգանք", "պատիժ", "իրավունք", "fine", "penalt",
        "штраф", "наказан",
    ],
    "yards": [
        "բակ", "մերձակա", "տարածք", "yard", "двор", "прилегающ",
        "բակից", "բակի",
    ],
    "visibility": [
        "տեսանելիություն", "տեսանելի", "visibility", "видимост",
        "100 մ", "150 մ", "300 մ", "100 м", "150 м", "300 м",
    ],
    "railway": [
        "երկաթուղ", "երկաթուղային", "գնացք", "railway", "train",
        "железнодорож", "поезд",
    ],
    "bridge_tunnel": [
        "կամուրջ", "թունել", "ուղեկամուրջ", "էստակադ",
        "bridge", "tunnel", "мост", "тоннел", "эстакад",
    ],
    "tram": [
        "տրամվայ", "tram", "трамва",
    ],
    "bus_stop": [
        "կանգառի", "ավտոբուս", "երթուղային",
        "bus stop", "остановк", "автобус", "маршрут",
    ],
}


def categorize(text: str) -> str:
    lower = text.lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in lower:
                return cat
    return "other"


# ─── PARSE PDF ─────────────────────────────────────────────────────

def parse_pdf(pdf_path: Path, lang: str):
    """Returns (questions_list, page_images_dict)."""
    doc = pymupdf.open(str(pdf_path))

    # ✅ Auto-detect real language from content
    first_page_text = doc[0].get_text("text") if len(doc) > 0 else ""
    detected = detect_language(first_page_text)
    if detected != lang:
        print(f"⚠️  {pdf_path.name}: expected {lang}, found {detected}", end=" ")
        lang = detected

    # Build global line list with page info
    all_lines: list[tuple[int, str]] = []
    for page_num in range(len(doc)):
        text = doc[page_num].get_text("text")
        for line in text.split("\n"):
            all_lines.append((page_num + 1, line.strip()))

    # Extract images per page (only large ones)
    page_images: dict[int, list] = defaultdict(list)
    for page_num in range(len(doc)):
        page = doc[page_num]
        for idx, img in enumerate(page.get_images(full=True)):
            try:
                xref = img[0]
                base = doc.extract_image(xref)
                if base["size"] < MIN_IMAGE_BYTES:
                    continue
                page_images[page_num + 1].append({
                    "index": idx,
                    "ext": base["ext"],
                    "bytes": base["image"],
                    "size": base["size"],
                })
            except Exception:
                continue

    # ─── STATE MACHINE ───
    questions: list[dict] = []
    state = "idle"  # idle | question | option
    current: dict | None = None

    for page_num, line in all_lines:
        if not line:
            continue
        if NOISE_RE.match(line):
            continue

        # Answer?
        m = ANS_RE[lang].match(line)
        if m and current is not None:
            current["correctIndex"] = int(m.group(1)) - 1
            questions.append(current)
            current = None
            state = "idle"
            continue

        # Number line (with optional inline text)?
        m = NUM_LINE_RE.match(line)
        if m:
            num = int(m.group(1))
            inline = m.group(2).strip()  # text after "N." on same line

            if state == "idle":
                current = {
                    "sourceQuestionNumber": num,
                    "page": page_num,
                    "prompt_lines": [inline] if inline else [],
                    "options_raw": [],
                    "correctIndex": 0,
                }
                state = "question"
            elif state == "question":
                current["options_raw"].append({
                    "num": num,
                    "lines": [inline] if inline else [],
                })
                state = "option"
            elif state == "option":
                current["options_raw"].append({
                    "num": num,
                    "lines": [inline] if inline else [],
                })
            continue

        # Regular text
        if state == "question" and current is not None:
            current["prompt_lines"].append(line)
        elif state == "option" and current is not None and current["options_raw"]:
            current["options_raw"][-1]["lines"].append(line)

    # Finalize questions
    finalized = []
    for q in questions:
        prompt = " ".join(q["prompt_lines"]).strip()
        options = [" ".join(o["lines"]).strip() for o in q["options_raw"]]
        options = [o for o in options if o]

        if not prompt or len(options) < 2:
            continue

        finalized.append({
            "sourceQuestionNumber": q["sourceQuestionNumber"],
            "page": q["page"],
            "prompt": prompt,
            "options": options,
            "correctIndex": q["correctIndex"],
            "category": categorize(prompt + " " + " ".join(options)),
        })

    doc.close()
    return finalized, dict(page_images)


# ─── MERGE 3 LANGUAGES + SAVE IMAGES ───────────────────────────────

def merge_languages(
    hy_qs: list,
    en_qs: list,
    ru_qs: list,
    test_num: int,
    page_images: dict,
):
    """Merge by question number, save images to disk."""
    en_by_num = {q["sourceQuestionNumber"]: q for q in en_qs}
    ru_by_num = {q["sourceQuestionNumber"]: q for q in ru_qs}

    # Create output image dir
    test_img_dir = OUTPUT_IMAGES / f"test-{test_num:02d}"
    test_img_dir.mkdir(parents=True, exist_ok=True)

    # Group questions by page (from hy)
    qs_by_page: dict[int, list] = defaultdict(list)
    for q in hy_qs:
        qs_by_page[q["page"]].append(q)

    # Assign images in order per page
    image_for_qnum: dict[int, str] = {}
    saved_count = 0

    for page_num, qs in qs_by_page.items():
        page_imgs = page_images.get(page_num, [])
        qs_sorted = sorted(qs, key=lambda x: x["sourceQuestionNumber"])

        for i, q in enumerate(qs_sorted):
            if i < len(page_imgs):
                img = page_imgs[i]
                filename = f"page-{page_num:02d}-img-{i + 1:02d}.{img['ext']}"
                (test_img_dir / filename).write_bytes(img["bytes"])
                image_for_qnum[q["sourceQuestionNumber"]] = filename
                saved_count += 1

    # Build merged list
    merged = []
    for hy_q in hy_qs:
        num = hy_q["sourceQuestionNumber"]
        en_q = en_by_num.get(num, {})
        ru_q = ru_by_num.get(num, {})
        img_filename = image_for_qnum.get(num)

        merged.append({
            "id": f"drv_t{test_num:02d}_q{num:03d}",
            "testNumber": test_num,
            "sourceQuestionNumber": num,
            "category": hy_q["category"],
            "prompt": {
                "hy": hy_q["prompt"],
                "en": en_q.get("prompt", ""),
                "ru": ru_q.get("prompt", ""),
            },
            "options": {
                "hy": hy_q["options"],
                "en": en_q.get("options", []),
                "ru": ru_q.get("options", []),
            },
            "correctIndex": hy_q["correctIndex"],
            "imageUrl": (
                f"{IMAGE_BASE_URL}/test-{test_num:02d}/{img_filename}"
                if img_filename else None
            ),
            "imageFilename": img_filename,
            "page": hy_q["page"],
        })

    return merged, saved_count


# ─── MAIN ──────────────────────────────────────────────────────────

def main():
    print(f"\n{'=' * 65}")
    print("🚗 NUR Lingo — Driving Exam DB Generator v3")
    print(f"{'=' * 65}")

    for lang, d in LANG_DIRS.items():
        if not d.exists():
            print(f"❌ Missing folder: {d}")
            sys.exit(1)

    OUTPUT_DATA.mkdir(parents=True, exist_ok=True)
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)

    all_tests = []
    grand_total = 0
    cat_counts: dict[str, int] = defaultdict(int)

    for test_num in range(1, 11):
        print(f"\n{'─' * 65}")
        print(f"📚 TEST {test_num:02d}")
        print(f"{'─' * 65}")

        lang_qs: dict[str, list] = {}
        page_images: dict[str, dict] = {}

        for lang, d in LANG_DIRS.items():
            pdf = d / f"{test_num}.pdf"
            if not pdf.exists():
                print(f"  ⚠️  {lang}: {pdf.name} not found")
                lang_qs[lang] = []
                page_images[lang] = {}
                continue

            print(f"  📖 {lang}: {pdf.name}...", end=" ", flush=True)
            try:
                qs, imgs = parse_pdf(pdf, lang)
                lang_qs[lang] = qs
                page_images[lang] = imgs
                total_imgs = sum(len(v) for v in imgs.values())
                print(f"✅ {len(qs)} Q, {total_imgs} img")
            except Exception as e:
                print(f"❌ {e}")
                lang_qs[lang] = []
                page_images[lang] = {}

        hy_qs = lang_qs.get("hy", [])
        if not hy_qs:
            print(f"  ⚠️  No Armenian questions for test {test_num}, skipping")
            continue

        merged, saved = merge_languages(
            hy_qs,
            lang_qs.get("en", []),
            lang_qs.get("ru", []),
            test_num,
            page_images.get("hy", {}),
        )

        test_file = OUTPUT_DATA / f"test-{test_num:02d}.json"
        with open(test_file, "w", encoding="utf-8") as f:
            json.dump({
                "testNumber": test_num,
                "totalQuestions": len(merged),
                "questions": merged,
            }, f, ensure_ascii=False, indent=2)

        grand_total += len(merged)
        for q in merged:
            cat_counts[q["category"]] += 1

        all_tests.append({
            "testNumber": test_num,
            "questionCount": len(merged),
            "imageCount": saved,
            "file": f"test-{test_num:02d}.json",
        })

        print(f"  ✅ Merged: {len(merged)} Q, {saved} img")

    # index.json
    with open(OUTPUT_DATA / "index.json", "w", encoding="utf-8") as f:
        json.dump({
            "version": "3.0",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "totalTests": len(all_tests),
            "totalQuestions": grand_total,
            "byCategory": dict(cat_counts),
            "tests": all_tests,
        }, f, ensure_ascii=False, indent=2)

    # all-questions.json
    all_qs = []
    for t in all_tests:
        data = json.loads((OUTPUT_DATA / t["file"]).read_text(encoding="utf-8"))
        all_qs.extend(data["questions"])
    with open(OUTPUT_DATA / "all-questions.json", "w", encoding="utf-8") as f:
        json.dump(all_qs, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n{'=' * 65}")
    print("🎉 DONE")
    print(f"{'=' * 65}")
    print(f"📊 Tests:      {len(all_tests)}")
    print(f"📊 Questions:  {grand_total}")
    print(f"\n📊 By category:")
    for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat:20s} {cnt}")
    print(f"\n📁 Data:   {OUTPUT_DATA}")
    print(f"📁 Images: {OUTPUT_IMAGES}")


if __name__ == "__main__":
    main()