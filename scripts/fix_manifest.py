#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📝 NUR Lingo — Generate manifest.json directly from audio files
================================================================
Scans public/audio/hy, public/audio/en, public/audio/ru folders
and creates manifest.json with all existing valid MP3 files.

USAGE:
    python scripts/make_manifest_from_audio.py
"""

import json
import sys
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"

def main():
    print("📝 Generating manifest from existing audio files...")
    print("=" * 60)

    if not AUDIO_BASE.exists():
        print(f"❌ Audio folder not found: {AUDIO_BASE}")
        sys.exit(1)

    # Scan all language folders
    lang_folders = ["hy", "en", "ru"]
    manifest = {}
    total_files = 0

    for lang in lang_folders:
        lang_dir = AUDIO_BASE / lang
        if not lang_dir.exists():
            print(f"   ⚠️  {lang.upper()} folder does not exist")
            continue

        # Find all valid MP3 files (size > 1000 bytes)
        mp3_files = [f for f in lang_dir.glob("*.mp3") if f.stat().st_size > 1000]
        count = len(mp3_files)

        for mp3_file in mp3_files:
            file_id = mp3_file.stem  # e.g., "000001"
            if file_id not in manifest:
                manifest[file_id] = {}
            manifest[file_id][lang] = f"/audio/{lang}/{file_id}.mp3"

        print(f"   {lang.upper()}: {count} valid files")
        total_files += count

    if not manifest:
        print("❌ No valid audio files found!")
        sys.exit(1)

    # Write manifest
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Manifest created successfully!")
    print(f"   📄 {MANIFEST_PATH}")
    print(f"   📊 Total entries: {len(manifest)}")
    print(f"   📁 Total files: {total_files}")
    print("=" * 60)

if __name__ == "__main__":
    main()