#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔁 NUR Lingo – Reorder JSON Dictionaries to Match Dictionary Page Order
========================================================================
This script reads vocabulary IDs from database.ts (in the order they appear
in CONTENT_LESSONS) and reorders master-dictionary.json and dictionary.json
to match that order.

USAGE:
    python scripts/reorder_jsons_by_page_order.py

    # Dry run (show what would change)
    python scripts/reorder_jsons_by_page_order.py --dry-run

    # Backup original files before overwriting
    python scripts/reorder_jsons_by_page_order.py --backup
"""

import os
import sys
import re
import json
import shutil
import argparse
from pathlib import Path
from collections import OrderedDict

SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
DB_PATH = PROJECT_ROOT / "src" / "lib" / "content" / "database.ts"
DICT_JSON_PATH = PROJECT_ROOT / "data" / "dictionaries" / "dictionary.json"
MASTER_DICT_PATH = PROJECT_ROOT / "data" / "dictionaries" / "master-dictionary.json"

parser = argparse.ArgumentParser(description="Reorder JSON dictionaries to match dictionary page order")
parser.add_argument("--dry-run", action="store_true", help="Show what would be done without writing")
parser.add_argument("--backup", action="store_true", help="Create backup of original JSON files")
args = parser.parse_args()

# ─── Extract IDs from database.ts ─────────────────────────────────────────────
def extract_vocab_order_from_db(db_path):
    """Extract vocabulary IDs in the order they appear in CONTENT_LESSONS"""
    if not db_path.exists():
        print(f"❌ Database not found: {db_path}")
        return []

    with open(db_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all v() calls: v("id", "hy", "en", "ru")
    pattern = re.compile(
        r'v\s*\(\s*["\']([^"\']+)["\']\s*,\s*["\'][^"\']*["\']\s*,\s*["\'][^"\']*["\']\s*,\s*["\'][^"\']*["\']\s*\)'
    )
    matches = pattern.findall(content)

    # Collect IDs in order of appearance
    ids_in_order = []
    seen = set()
    for id_val in matches:
        if id_val not in seen:
            ids_in_order.append(id_val)
            seen.add(id_val)

    print(f"📚 Found {len(ids_in_order)} unique vocabulary IDs in database order")
    return ids_in_order

# ─── Reorder JSON file ────────────────────────────────────────────────────────
def reorder_json_file(json_path, id_order, backup=False, dry_run=False):
    """Reorder a JSON dictionary file by id_order"""
    if not json_path.exists():
        print(f"⚠️  {json_path.name} not found, skipping")
        return

    # Load JSON
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Determine format: list or dict
    is_list = isinstance(data, list)
    is_dict = isinstance(data, dict)

    if not is_list and not is_dict:
        print(f"⚠️  {json_path.name} has unsupported format (neither list nor dict)")
        return

    # Build mapping from id to entry
    id_to_entry = {}
    if is_list:
        for entry in data:
            entry_id = entry.get("id") or entry.get("en", "").lower()
            if entry_id:
                id_to_entry[entry_id] = entry
    elif is_dict:
        # dictionary.json is keyed by word, e.g. "the": {...}
        # We need to map by id or by word
        # We'll try to use the id field if present, otherwise use the key
        for key, entry in data.items():
            entry_id = entry.get("id", key)
            id_to_entry[entry_id] = entry

    # Reorder according to id_order
    reordered = []
    missing_ids = []
    for id_val in id_order:
        if id_val in id_to_entry:
            reordered.append(id_to_entry[id_val])
        else:
            missing_ids.append(id_val)

    # If there are entries not in id_order, append them at the end (optional)
    for entry_id, entry in id_to_entry.items():
        if entry_id not in id_order:
            reordered.append(entry)

    if missing_ids:
        print(f"   ⚠️  {len(missing_ids)} IDs not found in {json_path.name} (first 5: {missing_ids[:5]})")

    # If original was a dict, we need to convert back to dict format
    # But dictionary.json is originally a dict, master-dictionary.json is a list.
    # We'll keep the same format as the original.

    if is_dict:
        # Convert list back to dict: key is the word (en) or id
        # We'll use the 'en' field as key if present, otherwise id
        new_dict = OrderedDict()
        for entry in reordered:
            # For dictionary.json, keys are words like "the", "be", etc.
            if "en" in entry:
                key = entry["en"]
            elif "id" in entry:
                key = entry["id"]
            else:
                key = str(len(new_dict))
            new_dict[key] = entry
        reordered_data = new_dict
    else:
        reordered_data = reordered

    if dry_run:
        print(f"   📋 Would reorder {json_path.name} to {len(reordered)} entries")
        return

    # Backup
    if backup and json_path.exists():
        backup_path = json_path.with_suffix(".json.bak")
        shutil.copy2(json_path, backup_path)
        print(f"   💾 Backup saved: {backup_path}")

    # Write
    with open(json_path, "w", encoding="utf-8") as f:
        if is_dict:
            json.dump(reordered_data, f, indent=2, ensure_ascii=False)
        else:
            json.dump(reordered_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Reordered {json_path.name} ({len(reordered)} entries)")

# ─── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("🔁 NUR Lingo – Reorder JSON Dictionaries to Match Page Order")
    print("=" * 60)

    # 1. Extract order from database
    id_order = extract_vocab_order_from_db(DB_PATH)
    if not id_order:
        print("❌ No vocabulary IDs found. Check database.ts")
        sys.exit(1)

    print(f"\n📋 Order: {id_order[:10]}{'...' if len(id_order)>10 else ''}\n")

    # 2. Reorder files
    for json_path in [MASTER_DICT_PATH, DICT_JSON_PATH]:
        if args.dry_run:
            print(f"🔍 Dry run for {json_path.name}:")
            reorder_json_file(json_path, id_order, backup=args.backup, dry_run=True)
        else:
            print(f"🔄 Processing {json_path.name}:")
            reorder_json_file(json_path, id_order, backup=args.backup, dry_run=False)

    print("\n" + "=" * 60)
    if args.dry_run:
        print("✅ Dry run complete. No files were modified.")
        print("   Remove --dry-run to apply changes.")
    else:
        print("✅ JSON files reordered successfully!")
        if args.backup:
            print("   Backups saved as .json.bak")
        print("\n📌 Now the JSON dictionaries will start with:", id_order[0] if id_order else "N/A")
        print("   This matches the dictionary page order.")

if __name__ == "__main__":
    main()