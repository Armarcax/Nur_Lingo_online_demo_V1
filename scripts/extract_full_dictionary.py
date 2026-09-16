#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 NUR Lingo – Extract Full Dictionary from database.ts
=========================================================
Extracts ALL vocabulary, phrases, and dialogue turns
and assigns sequential numeric IDs.

USAGE:
    python scripts/extract_full_dictionary.py

OUTPUT:
    data/dictionaries/full-dictionary.json
"""

import os
import re
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH = PROJECT_ROOT / "src" / "lib" / "content" / "database.ts"
OUTPUT_PATH = PROJECT_ROOT / "data" / "dictionaries" / "full-dictionary.json"

def extract_all_entries(db_path):
    """Extract all v(), p(), t() calls in order of appearance."""
    with open(db_path, "r", encoding="utf-8") as f:
        content = f.read()

    # We'll collect entries with their original ID and type
    # We'll parse sequentially, but simpler: find all matches and sort by position.
    # We'll use regex with positions.
    entries = []

    # v() calls: v("id", "hy", "en", "ru")
    v_pattern = re.compile(
        r'v\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']\s*\)',
        re.DOTALL
    )
    for match in v_pattern.finditer(content):
        id_val, hy, en, ru = match.groups()
        entries.append({
            "pos": match.start(),
            "original_id": id_val,
            "hy": hy.strip(),
            "en": en.strip(),
            "ru": ru.strip(),
            "type": "vocab"
        })

    # p() calls: p("id", "hy", "en", "ru", ...)
    p_pattern = re.compile(
        r'p\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']',
        re.DOTALL
    )
    for match in p_pattern.finditer(content):
        id_val, hy, en, ru = match.groups()
        entries.append({
            "pos": match.start(),
            "original_id": id_val,
            "hy": hy.strip(),
            "en": en.strip(),
            "ru": ru.strip(),
            "type": "phrase"
        })

    # t() calls: t("speaker", "hy", "en", "ru")
    t_pattern = re.compile(
        r't\s*\(\s*["\'](nurik|user)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']\s*,\s*["\']([^"\']*?)["\']\s*\)',
        re.DOTALL
    )
    for match in t_pattern.finditer(content):
        speaker, hy, en, ru = match.groups()
        entries.append({
            "pos": match.start(),
            "original_id": f"{speaker}_{len(entries)}",
            "hy": hy.strip(),
            "en": en.strip(),
            "ru": ru.strip(),
            "type": "dialogue"
        })

    # Sort by position in file
    entries.sort(key=lambda x: x["pos"])

    # Remove duplicates? We'll keep all, but if same text appears multiple times, we might want to deduplicate.
    # For now, keep all (they might have different contexts).
    # But we want unique entries? The user wants 2250 files, so they want all occurrences.
    return entries

def assign_numeric_ids(entries):
    """Assign sequential 6-digit IDs to each entry."""
    new_entries = []
    for idx, entry in enumerate(entries, 1):
        new_id = f"{idx:06d}"
        new_entries.append({
            "id": new_id,
            "hy": entry["hy"],
            "en": entry["en"],
            "ru": entry["ru"],
            "type": entry["type"],
            # Keep original ID for reference
            "original_id": entry["original_id"],
        })
    return new_entries

def main():
    print("🔍 Extracting full dictionary from database.ts...")
    entries = extract_all_entries(DB_PATH)
    print(f"📚 Found {len(entries)} entries (vocab, phrases, dialogues)")

    # Assign numeric IDs
    full_dict = assign_numeric_ids(entries)

    # Add audio paths placeholder (will be generated later)
    for entry in full_dict:
        entry["audio"] = {
            "hy": f"/audio/hy/{entry['id']}.mp3",
            "en": f"/audio/en/{entry['id']}.mp3",
            "ru": f"/audio/ru/{entry['id']}.mp3"
        }

    # Write output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(full_dict, f, indent=2, ensure_ascii=False)

    print(f"✅ Full dictionary saved to: {OUTPUT_PATH}")
    print(f"   Total entries: {len(full_dict)}")
    print(f"   First entry: {full_dict[0] if full_dict else 'None'}")

    # Also print stats by type
    types = {}
    for entry in full_dict:
        t = entry["type"]
        types[t] = types.get(t, 0) + 1
    print("   Breakdown:")
    for t, count in types.items():
        print(f"      {t}: {count}")

if __name__ == "__main__":
    main()