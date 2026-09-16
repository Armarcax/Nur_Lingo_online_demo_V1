#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 NUR Lingo — Dictionary ↔ Audio Mapping Checker & Fixer
===========================================================
Checks if audio files match the dictionary IDs.

USAGE:
    # Show differences only
    python scripts/check_and_fix_mapping.py

    # Also delete orphaned audio files (not in dictionary)
    python scripts/check_and_fix_mapping.py --clean-orphans

    # Force regenerate manifest based on existing files
    python scripts/check_and_fix_mapping.py --fix-manifest
"""

import os
import sys
import json
import argparse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"
DICT_PATH = PROJECT_ROOT / "data" / "dictionaries" / "master-dictionary.json"

parser = argparse.ArgumentParser(description="Check and fix dictionary-audio mapping")
parser.add_argument("--clean-orphans", action="store_true",
                    help="Delete audio files that are not in the dictionary")
parser.add_argument("--fix-manifest", action="store_true",
                    help="Rebuild manifest.json from existing files")
args = parser.parse_args()

# ─── Load dictionary IDs ──────────────────────────────────────────────────────
def get_dictionary_ids():
    """Extract all expected IDs from master-dictionary.json or database.ts"""
    ids = set()
    
    # Try master-dictionary.json first
    if DICT_PATH.exists():
        with open(DICT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            entries = data
        elif isinstance(data, dict):
            entries = list(data.values())
        else:
            entries = []
        
        for entry in entries:
            # Get ID from audio path
            audio = entry.get("audio", {})
            hy_path = audio.get("hy", "")
            if hy_path:
                id_val = Path(hy_path).stem
            else:
                id_val = entry.get("id", "")
            if id_val:
                ids.add(id_val.zfill(6))
        return ids

    # Fallback: extract from database.ts
    db_path = PROJECT_ROOT / "src" / "lib" / "content" / "database.ts"
    if db_path.exists():
        import re
        with open(db_path, "r", encoding="utf-8") as f:
            content = f.read()
        pattern = re.compile(r"v\s*\(\s*[\"'](\d{6})[\"']")
        matches = pattern.findall(content)
        if matches:
            return set(matches)

    print("❌ No dictionary or database.ts found!")
    return set()

# ─── Scan audio files ──────────────────────────────────────────────────────
def get_audio_files(lang="hy"):
    """Get all valid MP3 files in language folder"""
    lang_dir = AUDIO_BASE / lang
    if not lang_dir.exists():
        return set()
    return {f.stem for f in lang_dir.glob("*.mp3") if f.stat().st_size > 1000}

# ─── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("🔍 NUR Lingo — Dictionary ↔ Audio Mapping Checker")
    print("=" * 60)

    # 1. Get dictionary IDs
    dict_ids = get_dictionary_ids()
    if not dict_ids:
        print("❌ No IDs found in dictionary!")
        print("   Please check data/dictionaries/master-dictionary.json")
        sys.exit(1)
    print(f"📚 Dictionary entries: {len(dict_ids)}")

    # 2. Get audio files
    audio_ids = get_audio_files("hy")
    print(f"🎵 Audio files (HY): {len(audio_ids)}")

    # 3. Compare
    missing = dict_ids - audio_ids          # In dictionary, not in audio
    orphans = audio_ids - dict_ids          # In audio, not in dictionary
    match = dict_ids & audio_ids            # Correctly matched

    print(f"\n📊 Comparison Results:")
    print(f"   ✅ Correctly matched: {len(match)}")
    print(f"   ❌ Missing (need generation): {len(missing)}")
    print(f"   ⚠️  Orphaned (not in dictionary): {len(orphans)}")

    if missing:
        print(f"\n❌ Missing IDs: {sorted(missing)[:20]}")
        if len(missing) > 20:
            print(f"   ... and {len(missing)-20} more")

    if orphans:
        print(f"\n⚠️  Orphaned IDs: {sorted(orphans)[:20]}")
        if len(orphans) > 20:
            print(f"   ... and {len(orphans)-20} more")

    # 4. Fix manifest
    if args.fix_manifest:
        print("\n🛠️ Rebuilding manifest.json...")
        manifest = {}
        for file_id in audio_ids:
            manifest[file_id] = {
                "hy": f"/audio/hy/{file_id}.mp3",
                "en": f"/audio/en/{file_id}.mp3",
                "ru": f"/audio/ru/{file_id}.mp3",
            }
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        print(f"✅ Manifest updated: {len(manifest)} entries → {MANIFEST_PATH}")

    # 5. Clean orphans
    if args.clean_orphans and orphans:
        print("\n🗑️ Deleting orphaned files...")
        deleted = 0
        for file_id in orphans:
            file_path = AUDIO_BASE / "hy" / f"{file_id}.mp3"
            if file_path.exists():
                file_path.unlink()
                deleted += 1
        print(f"✅ Deleted {deleted} orphaned files")

    # 6. Summary
    if missing and not args.clean_orphans:
        print("\n💡 Recommendation:")
        print(f"   Generate {len(missing)} missing files:")
        print(f"   python scripts/generate_audio_unified.py --skip-existing --lang hy")
    elif missing and args.clean_orphans:
        print("\n🧹 After cleaning orphans, you need to generate missing files:")
        print(f"   python scripts/generate_audio_unified.py --skip-existing --lang hy")
    elif orphans and not args.clean_orphans:
        print("\n💡 To remove orphaned files (not in dictionary):")
        print(f"   python scripts/check_and_fix_mapping.py --clean-orphans")
    else:
        print("\n✅ All audio files match the dictionary!")

    print("=" * 60)

if __name__ == "__main__":
    main()