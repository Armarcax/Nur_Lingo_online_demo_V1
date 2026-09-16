#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔁 NUR Lingo – Correctly Reorder JSON Dictionaries to Match Page Order
========================================================================
Extracts vocabulary IDs from CONTENT_LESSONS in the exact order they appear
in the dictionary page (by lesson order, then vocabulary order).
"""

import os
import re
import json
import shutil
import argparse
from pathlib import Path
from collections import OrderedDict

PROJECT_ROOT = Path.cwd()
DB_PATH = PROJECT_ROOT / "src" / "lib" / "content" / "database.ts"
DICT_JSON_PATH = PROJECT_ROOT / "data" / "dictionaries" / "dictionary.json"
MASTER_DICT_PATH = PROJECT_ROOT / "data" / "dictionaries" / "master-dictionary.json"

parser = argparse.ArgumentParser(description="Correctly reorder JSON dictionaries to match page order")
parser.add_argument("--dry-run", action="store_true", help="Show what would be done without writing")
parser.add_argument("--backup", action="store_true", help="Create backup of original JSON files")
args = parser.parse_args()

def extract_vocab_order_from_lessons(db_path):
    """Extract vocabulary IDs in the order they appear within CONTENT_LESSONS"""
    with open(db_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the CONTENT_LESSONS array (it's a large array)
    # We'll look for "export const CONTENT_LESSONS: ContentLesson[] = [" and then find the matching closing bracket.
    start_pattern = r'export\s+const\s+CONTENT_LESSONS\s*:\s*ContentLesson\[\]\s*=\s*\['
    start_match = re.search(start_pattern, content, re.DOTALL)
    if not start_match:
        print("❌ Could not find CONTENT_LESSONS array in database.ts")
        return []

    start_pos = start_match.end()
    # Find the matching closing bracket. We need to count brackets.
    depth = 0
    end_pos = None
    for i in range(start_pos, len(content)):
        ch = content[i]
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                end_pos = i + 1
                break
    if end_pos is None:
        print("❌ Could not find matching closing bracket for CONTENT_LESSONS")
        return []

    lessons_content = content[start_pos:end_pos]

    # Now find all v() calls within this block
    # We need to find v("id", ...) pattern
    pattern = re.compile(
        r'v\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\'][^"\']*["\']\s*,\s*["\'][^"\']*["\']\s*,\s*["\'][^"\']*["\']\s*\)'
    )
    matches = pattern.findall(lessons_content)

    # Collect IDs in order, removing duplicates
    ids_in_order = []
    seen = set()
    for id_val in matches:
        if id_val not in seen:
            ids_in_order.append(id_val)
            seen.add(id_val)

    print(f"📚 Found {len(ids_in_order)} unique vocabulary IDs in CONTENT_LESSONS order")
    if ids_in_order:
        print(f"   First 10: {ids_in_order[:10]}")
    return ids_in_order

def reorder_json_file(json_path, id_order, backup=False, dry_run=False):
    if not json_path.exists():
        print(f"⚠️  {json_path.name} not found, skipping")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    is_list = isinstance(data, list)
    is_dict = isinstance(data, dict)

    if not is_list and not is_dict:
        print(f"⚠️  {json_path.name} unsupported format")
        return

    # Build mapping from id to entry
    id_to_entry = {}
    if is_list:
        for entry in data:
            entry_id = entry.get("id") or entry.get("en", "").lower()
            if entry_id:
                id_to_entry[entry_id] = entry
    elif is_dict:
        for key, entry in data.items():
            entry_id = entry.get("id", key)
            id_to_entry[entry_id] = entry

    # Reorder
    reordered = []
    missing_ids = []
    for id_val in id_order:
        if id_val in id_to_entry:
            reordered.append(id_to_entry[id_val])
        else:
            missing_ids.append(id_val)

    # Append remaining entries not in order
    for entry_id, entry in id_to_entry.items():
        if entry_id not in id_order:
            reordered.append(entry)

    if missing_ids:
        print(f"   ⚠️  {len(missing_ids)} IDs not found in {json_path.name} (first 5: {missing_ids[:5]})")

    if is_dict:
        new_dict = OrderedDict()
        for entry in reordered:
            key = entry.get("en") or entry.get("id") or str(len(new_dict))
            new_dict[key] = entry
        reordered_data = new_dict
    else:
        reordered_data = reordered

    if dry_run:
        print(f"   📋 Would reorder {json_path.name} to {len(reordered)} entries")
        return

    if backup and json_path.exists():
        backup_path = json_path.with_suffix(".json.bak2")
        shutil.copy2(json_path, backup_path)
        print(f"   💾 Backup saved: {backup_path}")

    with open(json_path, "w", encoding="utf-8") as f:
        if is_dict:
            json.dump(reordered_data, f, indent=2, ensure_ascii=False)
        else:
            json.dump(reordered_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Reordered {json_path.name} ({len(reordered)} entries)")

def main():
    print("🔁 NUR Lingo – Correctly Reorder JSON Dictionaries")
    print("=" * 60)

    id_order = extract_vocab_order_from_lessons(DB_PATH)
    if not id_order:
        print("❌ No vocabulary IDs found. Exiting.")
        sys.exit(1)

    print(f"\n📋 Order: {id_order[:10]}{'...' if len(id_order)>10 else ''}\n")

    for json_path in [MASTER_DICT_PATH, DICT_JSON_PATH]:
        if args.dry_run:
            print(f"🔍 Dry run for {json_path.name}:")
            reorder_json_file(json_path, id_order, backup=args.backup, dry_run=True)
        else:
            print(f"🔄 Processing {json_path.name}:")
            reorder_json_file(json_path, id_order, backup=args.backup, dry_run=False)

    print("\n" + "=" * 60)
    if args.dry_run:
        print("✅ Dry run complete. Remove --dry-run to apply.")
    else:
        print("✅ JSON files reordered correctly!")
        print(f"   First ID in JSON will be: {id_order[0] if id_order else 'N/A'}")
        print("   This now matches the dictionary page order.")

if __name__ == "__main__":
    main()