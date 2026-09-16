#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 Fix Missing Audio Files
===========================
Ստուգում է, թե որ ID-ների համար են բացակայում աուդիոֆայլերը en/ և ru/ պանակներում
և գեներացնում է միայն բացակայողները (Edge TTS):
"""

import os
import sys
import json
import asyncio
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("❌ edge-tts is not installed. Run: python -m pip install edge-tts")
    sys.exit(1)

# ─── Կարգավորումներ ────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"
DICT_PATH = PROJECT_ROOT / "data" / "dictionaries" / "unified-dictionary_clean_sorted.json"

VOICES = {
    "en": "en-US-JennyNeural",
    "ru": "ru-RU-SvetlanaNeural"
}

def get_entry_text(entry, lang):
    return entry.get(lang, "").strip()

def clean_text(text):
    import re
    if not text:
        return ""
    text = re.sub(r'\(.*?\)', '', text)
    text = re.sub(r'[/\-–—]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

async def generate_audio(text, voice, output_path):
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True
        return False
    except Exception as e:
        print(f"   ⚠️ Error: {e}")
        return False

async def main():
    # ─── Բեռնել բառարանը ─────────────────────────────────────────────────────
    if not DICT_PATH.exists():
        print(f"❌ Dictionary not found: {DICT_PATH}")
        print("💡 Make sure the dictionary exists.")
        return

    with open(DICT_PATH, "r", encoding="utf-8") as f:
        entries = json.load(f)

    print(f"📚 Loaded {len(entries)} entries from {DICT_PATH.name}")

    # ─── Բեռնել manifest-ը ──────────────────────────────────────────────────
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    # ─── Ստուգել և գեներացնել բացակայողները ────────────────────────────────
    for lang, voice in VOICES.items():
        lang_dir = AUDIO_BASE / lang
        lang_dir.mkdir(parents=True, exist_ok=True)

        missing = []
        present = 0

        print(f"\n🔍 Checking {lang.upper()} audio files...")

        for entry in entries:
            entry_id = entry.get("id", "").strip().zfill(6)
            if not entry_id:
                continue

            file_path = lang_dir / f"{entry_id}.mp3"
            if file_path.exists() and file_path.stat().st_size > 1000:
                present += 1
            else:
                missing.append((entry_id, entry))

        print(f"   ✅ Existing files: {present}")
        print(f"   ❌ Missing files: {len(missing)}")

        if not missing:
            print(f"   🎉 All {lang.upper()} files are present.")
            continue

        print(f"   🎤 Generating {len(missing)} missing files...")

        for entry_id, entry in missing:
            text = get_entry_text(entry, lang)
            if not text:
                print(f"   ⚠️ {entry_id}: No text for {lang}")
                continue

            clean = clean_text(text)
            if not clean:
                print(f"   ⚠️ {entry_id}: Empty after cleaning")
                continue

            output_path = lang_dir / f"{entry_id}.mp3"
            print(f"   ⏳ {entry_id}: generating...")

            ok = await generate_audio(clean, voice, output_path)
            if ok:
                # Update manifest
                if entry_id not in manifest:
                    manifest[entry_id] = {}
                manifest[entry_id][lang] = f"/audio/{lang}/{entry_id}.mp3"
                print(f"   ✅ {entry_id}: done")
            else:
                print(f"   ❌ {entry_id}: failed")

        # ─── Պահպանել manifest-ը ──────────────────────────────────────────
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n🎉 All missing audio files have been generated!")
    print(f"📄 Manifest updated: {MANIFEST_PATH}")

if __name__ == "__main__":
    asyncio.run(main())