#!/usr/bin/env python3
"""
NUR Lingo — Driving Exam Database Generator v5

Fixes over v4:
- Content-hash based image deduplication (same image = same file)
- Filename includes question number + hash for uniqueness
- Added `imageHash` and `sharedByQuestions` fields to JSON
- Cross-question sharing detection within each test

Reads:  public/drive_test/{hy_drive,en_drive,ru_drive}/1.pdf ... 10.pdf
Writes: public/drive_test/data/test-01.json ... test-10.json
        public/drive_test/data/images/test-XX/q-NNN-hash8.{ext}
        public/drive_test/data/index.json
        public/drive_test/data/all-questions.json

Usage: python scripts/generate-driving-db.py
"""

import pymupdf
import re
import json
import sys
import hashlib
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

MIN_IMAGE_BYTES = 3000
MIN_IMAGE_DIM = 50

# ─── REGEX ─────────────────────────────────────────────────────────

NUM_LINE_RE = re.compile(r"^(\d{1,3})\.\s*(.*)$")

ANS_RE = {
    "hy": re.compile(r"^Պատ\.?\s*[՝:]?\s*(\d+)"),
    "en": re.compile(r"^(?:Ans\.?|Answer)\s*[:\-]?\s*(\d+)", re.IGNORECASE),
    "ru": re.compile(r"^(?:отв\.?|Ответ)\s*[:\-]?\s*(\d+)", re.IGNORECASE),
}

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

# ─── HELPERS ───────────────────────────────────────────────────────

def image_hash(img_bytes: bytes) -> str:
    """8-char hex hash of image content (md5)."""
    return hashlib.md5(img_bytes).hexdigest()[:8]


def detect_language(text: str) -> str:
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
    "speed_limits": ["արագություն", "արագ", "speed", "скорост"],
    "penalties": ["տուգանք", "պատիժ", "իրավունք", "fine", "penalt", "штраф", "наказан"],
    "yards": ["բակ", "մերձակա", "տարածք", "yard", "двор", "прилегающ", "բակից", "բակի"],
    "visibility": [
        "տեսանելիություն", "տեսանելի", "visibility", "видимост",
        "100 մ", "150 մ", "300 մ", "100 м", "150 м", "300 м",
    ],
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

# ─── PAGE ITEM EXTRACTION ──────────────────────────────────────────

def extract_page_items(page):
    items = []
    page_dict = page.get_text("dict")

    for block in page_dict.get("blocks", []):
        bbox = block.get("bbox", (0, 0, 0, 0))
        y0 = bbox[1]
        x0 = bbox[0]
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]

        if block.get("type") == 1:  # image
            img_bytes = block.get("image", b"")
            if not img_bytes or len(img_bytes) < MIN_IMAGE_BYTES:
                continue
            if w < MIN_IMAGE_DIM or h < MIN_IMAGE_DIM:
                continue
            items.append({
                "type": "image",
                "bytes": img_bytes,
                "ext": block.get("ext", "png"),
                "y": y0,
                "x": x0,
                "w": w,
                "h": h,
            })
        else:
            for line in block.get("lines", []):
                line_bbox = line.get("bbox", bbox)
                line_y = line_bbox[1]
                line_x = line_bbox[0]
                line_text = " ".join(
                    span.get("text", "") for span in line.get("spans", [])
                ).strip()
                if line_text:
                    items.append({
                        "type": "text",
                        "text": line_text,
                        "y": line_y,
                        "x": line_x,
                    })

    items.sort(key=lambda it: (it["y"], it.get("x", 0)))
    return items

# ─── PARSE PDF ─────────────────────────────────────────────────────

def parse_pdf(pdf_path: Path, lang: str):
    doc = pymupdf.open(str(pdf_path))

    first_page_text = doc[0].get_text("text") if len(doc) > 0 else ""
    detected = detect_language(first_page_text)
    if detected != lang:
        print(f"⚠️  {pdf_path.name}: expected {lang}, found {detected}", end=" ")
        lang = detected

    questions: list[dict] = []
    state = "idle"
    current: dict | None = None
    pending_images: list[dict] = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        items = extract_page_items(page)

        for item in items:
            if item["type"] == "image":
                img_rec = {
                    "ext": item["ext"],
                    "bytes": item["bytes"],
                    "page": page_num + 1,
                    "y": item["y"],
                }
                if current is not None:
                    current.setdefault("images", []).append(img_rec)
                else:
                    pending_images.append(img_rec)
                continue

            line = item["text"]
            if not line:
                continue
            if NOISE_RE.match(line):
                continue

            m = ANS_RE[lang].match(line)
            if m and current is not None:
                current["correctIndex"] = int(m.group(1)) - 1
                questions.append(current)
                current = None
                state = "idle"
                continue

            m = NUM_LINE_RE.match(line)
            if m:
                num = int(m.group(1))
                inline = m.group(2).strip()

                if state == "idle":
                    current = {
                        "sourceQuestionNumber": num,
                        "page": page_num + 1,
                        "prompt_lines": [inline] if inline else [],
                        "options_raw": [],
                        "correctIndex": 0,
                        "images": list(pending_images),
                    }
                    pending_images = []
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

            if state == "question" and current is not None:
                current["prompt_lines"].append(line)
            elif state == "option" and current is not None and current["options_raw"]:
                current["options_raw"][-1]["lines"].append(line)

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
            "images": q.get("images", []),
        })

    doc.close()
    return finalized

# ─── SAVE IMAGES WITH HASH DEDUP ───────────────────────────────────

def save_question_images(questions, test_num):
    """
    Save images to public/drive_test/data/images/test-XX/

    Filename: q-{qnum:03d}-{hash8}.{ext}
    - qnum = lowest question number that uses this image
    - hash8 = first 8 chars of md5

    Dedup: same image bytes → same file

    Returns:
      filename_for_qnum: dict {sourceQuestionNumber: filename}
      hash_for_qnum:     dict {sourceQuestionNumber: hash8}
      shared_map:        dict {hash8: [question numbers using it]}
    """
    test_img_dir = OUTPUT_IMAGES / f"test-{test_num:02d}"
    test_img_dir.mkdir(parents=True, exist_ok=True)

    # Clean stale files
    for old in test_img_dir.glob("*"):
        try:
            old.unlink()
        except Exception:
            pass

    filename_for_qnum: dict[int, str] = {}
    hash_for_qnum: dict[int, str] = {}
    shared_map: dict[str, list[int]] = defaultdict(list)

    # First pass: group by hash
    hash_to_questions: dict[str, list[tuple[int, dict]]] = defaultdict(list)

    for q in questions:
        imgs = q.get("images", [])
        if not imgs:
            continue

        # Pick largest image
        img = max(imgs, key=lambda i: len(i["bytes"]))
        h = image_hash(img["bytes"])
        qnum = q["sourceQuestionNumber"]
        hash_to_questions[h].append((qnum, img))

    # Second pass: save unique images, assign filenames
    for h, entries in hash_to_questions.items():
        # Sort by question number
        entries.sort(key=lambda e: e[0])
        first_qnum, first_img = entries[0]

        ext = first_img["ext"] or "png"
        filename = f"q-{first_qnum:03d}-{h}.{ext}"
        filepath = test_img_dir / filename
        filepath.write_bytes(first_img["bytes"])

        for qnum, _ in entries:
            filename_for_qnum[qnum] = filename
            hash_for_qnum[qnum] = h

        shared_map[h] = [e[0] for e in entries]

    return filename_for_qnum, hash_for_qnum, dict(shared_map)

# ─── MERGE LANGUAGES ───────────────────────────────────────────────

def merge_languages(
    hy_qs, en_qs, ru_qs, test_num,
    filename_for_qnum, hash_for_qnum, shared_map,
):
    en_by_num = {q["sourceQuestionNumber"]: q for q in en_qs}
    ru_by_num = {q["sourceQuestionNumber"]: q for q in ru_qs}

    merged = []
    for hy_q in hy_qs:
        num = hy_q["sourceQuestionNumber"]
        en_q = en_by_num.get(num, {})
        ru_q = ru_by_num.get(num, {})
        img_filename = filename_for_qnum.get(num)
        img_hash = hash_for_qnum.get(num)

        # Shared questions (only if >1)
        shared_with = []
        if img_hash and len(shared_map.get(img_hash, [])) > 1:
            shared_with = [n for n in shared_map[img_hash] if n != num]

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
            "imageHash": img_hash,
            "sharedByQuestions": shared_with,
            "page": hy_q["page"],
        })

    return merged

# ─── MAIN ──────────────────────────────────────────────────────────

def main():
    print(f"\n{'=' * 65}")
    print("🚗 NUR Lingo — Driving Exam DB Generator v5")
    print(f"{'=' * 65}")

    for lang, d in LANG_DIRS.items():
        if not d.exists():
            print(f"❌ Missing folder: {d}")
            sys.exit(1)

    OUTPUT_DATA.mkdir(parents=True, exist_ok=True)
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)

    all_tests = []
    grand_total = 0
    grand_unique_imgs = 0
    grand_raw_imgs = 0
    cat_counts: dict[str, int] = defaultdict(int)

    for test_num in range(1, 11):
        print(f"\n{'─' * 65}")
        print(f"📚 TEST {test_num:02d}")
        print(f"{'─' * 65}")

        lang_qs: dict[str, list] = {}

        for lang, d in LANG_DIRS.items():
            pdf = d / f"{test_num}.pdf"
            if not pdf.exists():
                print(f"  ⚠️  {lang}: {pdf.name} not found")
                lang_qs[lang] = []
                continue

            print(f"  📖 {lang}: {pdf.name}...", end=" ", flush=True)
            try:
                qs = parse_pdf(pdf, lang)
                lang_qs[lang] = qs
                with_img = sum(1 for q in qs if q.get("images"))
                print(f"✅ {len(qs)} Q ({with_img} w/ images)")
            except Exception as e:
                print(f"❌ {e}")
                lang_qs[lang] = []

        hy_qs = lang_qs.get("hy", [])
        if not hy_qs:
            print(f"  ⚠️  No Armenian questions for test {test_num}, skipping")
            continue

        # Save unique images
        filename_for_qnum, hash_for_qnum, shared_map = save_question_images(
            hy_qs, test_num
        )

        merged = merge_languages(
            hy_qs,
            lang_qs.get("en", []),
            lang_qs.get("ru", []),
            test_num,
            filename_for_qnum,
            hash_for_qnum,
            shared_map,
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

        unique_count = len(set(filename_for_qnum.values()))
        raw_count = len(filename_for_qnum)
        grand_unique_imgs += unique_count
        grand_raw_imgs += raw_count

        all_tests.append({
            "testNumber": test_num,
            "questionCount": len(merged),
            "imageCount": unique_count,
            "file": f"test-{test_num:02d}.json",
        })

        print(f"  ✅ Merged: {len(merged)} Q, "
              f"{raw_count} Q with images → {unique_count} unique files")
        if raw_count > unique_count:
            print(f"     💡 Dedup saved {raw_count - unique_count} duplicate files")

    # index.json
    with open(OUTPUT_DATA / "index.json", "w", encoding="utf-8") as f:
        json.dump({
            "version": "5.0",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "totalTests": len(all_tests),
            "totalQuestions": grand_total,
            "totalImages": grand_unique_imgs,
            "rawImageCount": grand_raw_imgs,
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

    print(f"\n{'=' * 65}")
    print("🎉 DONE")
    print(f"{'=' * 65}")
    print(f"📊 Tests:            {len(all_tests)}")
    print(f"📊 Questions:        {grand_total}")
    print(f"📊 Unique images:    {grand_unique_imgs}")
    print(f"📊 Raw image refs:   {grand_raw_imgs}")
    print(f"📊 Saved by dedup:   {grand_raw_imgs - grand_unique_imgs}")
    print(f"\n📊 By category:")
    for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat:20s} {cnt}")
    print(f"\n📁 Data:   {OUTPUT_DATA}")
    print(f"📁 Images: {OUTPUT_IMAGES}")


if __name__ == "__main__":
    main()