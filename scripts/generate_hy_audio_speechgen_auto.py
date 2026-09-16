#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎙️ NUR Lingo — Armenian Audio Generator (SpeechGen.io)
Ավտոմատացված խմբաքանակային գեներացիա՝ օրական 3000 նիշ սահմանաչափով
=============================================================
USAGE:
    python generate_hy_audio_speechgen_auto.py
    python generate_hy_audio_speechgen_auto.py --skip-existing
    python generate_hy_audio_speechgen_auto.py --limit 5000
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path
from datetime import datetime

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"
PROGRESS_PATH = SCRIPT_DIR / "progress.json"

# SpeechGen.io API credentials (Ձեր տվյալները)
SPEECHGEN_EMAIL = "arcaxa305@gmail.com"
SPEECHGEN_TOKEN = "eb701976-e5f1-47c0-9b3a-564033500f8e"
SPEECHGEN_API_URL = "https://speechgen.io/index.php?r=api/text"

# Daily free limit (characters)
DAILY_LIMIT = 3000

# ─── ARGUMENTS ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo Armenian Audio Generator (SpeechGen.io)")
parser.add_argument("--dict", "-d", type=str,
                    default="data/dictionaries/unified-dictionary.json",
                    help="Path to dictionary JSON")
parser.add_argument("--skip-existing", "-s", action="store_true",
                    help="Skip already generated files")
parser.add_argument("--force", "-f", action="store_true",
                    help="Force regenerate all files (ignore existing)")
parser.add_argument("--limit", "-l", type=int, default=DAILY_LIMIT,
                    help=f"Daily character limit (default: {DAILY_LIMIT})")
parser.add_argument("--voice", "-v", type=str, default="Venera",
                    help="Voice name (default: Venera)")
parser.add_argument("--format", choices=["mp3", "wav"], default="mp3",
                    help="Output format (default: mp3)")
parser.add_argument("--verbose", action="store_true",
                    help="Verbose logging")
args = parser.parse_args()

# ─── SETUP DIRECTORIES ─────────────────────────────────────────────────────────
(AUDIO_BASE / "hy").mkdir(parents=True, exist_ok=True)

# ─── LOAD DATA ─────────────────────────────────────────────────────────────────
DICT_PATH = PROJECT_ROOT / args.dict
if not DICT_PATH.exists():
    print(f"❌ Dictionary not found: {DICT_PATH}")
    sys.exit(1)

with open(DICT_PATH, "r", encoding="utf-8") as f:
    dict_data = json.load(f)

if isinstance(dict_data, dict):
    entries = list(dict_data.values())
else:
    entries = dict_data

print(f"📚 Loaded {len(entries)} entries from {DICT_PATH.name}")

# ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
def get_entry_text(entry, lang="hy"):
    for key in [lang, "hy"]:
        val = entry.get(key, "")
        if val and isinstance(val, str):
            return val.strip()
    return ""

def get_audio_id(entry):
    audio = entry.get("audio", {})
    for lang in ["hy", "en", "ru"]:
        path = audio.get(lang, "")
        if path:
            stem = Path(path).stem
            if stem.isdigit():
                return stem.zfill(6)
    entry_id = entry.get("id", "")
    if entry_id:
        return str(entry_id).zfill(6)
    return None

def clean_text(text):
    import re
    text = re.sub(r'\(.*?\)', '', text)
    text = re.sub(r'[/\-–—]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def char_count(text):
    return len(text)

def generate_speechgen(text, voice, output_path, fmt="mp3"):
    try:
        params = {
            "token": "eb701976-e5f1-47c0-9b3a-564033500f8e",
            "email": arcaxa305@gmail.com,
            "voice": voice,
            "text": text,
            "format": fmt,
            "speed": 1.0,
            "pitch": 0,
        }
        response = requests.post(SPEECHGEN_API_URL, data=params, timeout=60)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                error_data = response.json()
                if "error" in error_data:
                    return False, f"API Error: {error_data['error']}"
                return False, f"Unknown API response: {error_data}"
            else:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                if output_path.exists() and output_path.stat().st_size > 1000:
                    return True, None
                output_path.unlink(missing_ok=True)
                return False, "File too small (0B or corrupted)"
        else:
            return False, f"HTTP {response.status_code}"
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except Exception as e:
        return False, str(e)

# ─── PROGRESS MANAGEMENT ──────────────────────────────────────────────────────
def load_progress():
    if PROGRESS_PATH.exists():
        with open(PROGRESS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"last_index": 0, "today_chars": 0, "date": datetime.now().strftime("%Y-%m-%d")}

def save_progress(progress):
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
def main():
    print(f"\n🎙️ NUR Lingo — Armenian Audio Generator (SpeechGen.io)")
    print(f"   Dictionary: {DICT_PATH.name}")
    print(f"   Voice: {args.voice}")
    print(f"   Format: {args.format}")
    print(f"   Daily limit: {args.limit} characters")
    print(f"   Skip existing: {args.skip_existing}")
    print("=" * 60)

    # Load progress
    progress = load_progress()
    today = datetime.now().strftime("%Y-%m-%d")
    if progress["date"] != today:
        # New day: reset character counter
        progress["today_chars"] = 0
        progress["date"] = today
    start_index = progress["last_index"]
    used_chars_today = progress["today_chars"]

    # Prepare list of entries to process
    target_entries = entries[start_index:]
    if args.limit > 0 and args.limit < DAILY_LIMIT:
        daily_limit = args.limit
    else:
        daily_limit = DAILY_LIMIT

    # Count remaining characters
    remaining_chars = 0
    entries_to_process = []
    for entry in target_entries:
        entry_id = get_audio_id(entry)
        if not entry_id:
            continue
        hy_text = get_entry_text(entry, "hy")
        if not hy_text:
            continue
        clean = clean_text(hy_text)
        if not clean:
            continue
        # Check if already exists (if skip-existing is True and not force)
        output_path = AUDIO_BASE / "hy" / f"{entry_id}.{args.format}"
        if args.skip_existing and not args.force and output_path.exists() and output_path.stat().st_size > 1000:
            continue
        char_len = char_count(clean)
        remaining_chars += char_len
        entries_to_process.append((entry, entry_id, clean, char_len))

    print(f"📊 Remaining entries to generate: {len(entries_to_process)}")
    print(f"📝 Remaining characters: {remaining_chars}")
    print(f"⏳ Today's used characters: {used_chars_today} / {daily_limit}")
    if remaining_chars == 0:
        print("✅ All entries already generated. Nothing to do.")
        return

    # Load manifest
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    success = 0
    fail = 0
    skipped = 0
    chars_used = 0

    print(f"\n🎤 Generating...\n")

    for idx, (entry, entry_id, clean_text_str, char_len) in enumerate(entries_to_process, start=start_index + 1):
        # Check daily limit
        if used_chars_today + chars_used >= daily_limit:
            print(f"\n⏸️ Daily character limit reached ({daily_limit}).")
            print(f"   Used today: {used_chars_today + chars_used} chars")
            print(f"   Next word: {clean_text_str[:30]}... (ID: {entry_id})")
            print("   Run this script again tomorrow to continue.")
            break

        output_path = AUDIO_BASE / "hy" / f"{entry_id}.{args.format}"

        # Check if already exists (skip-existing)
        if not args.force and args.skip_existing and output_path.exists() and output_path.stat().st_size > 1000:
            skipped += 1
            if args.verbose:
                print(f"   [{idx}/{len(entries)}] ⏭️ {entry_id} (exists)")
            continue

        # Generate
        ok, err = generate_speechgen(clean_text_str, args.voice, output_path, args.format)
        if ok:
            success += 1
            chars_used += char_len
            if entry_id not in manifest:
                manifest[entry_id] = {}
            manifest[entry_id]["hy"] = f"/audio/hy/{entry_id}.{args.format}"
            print(f"   [{idx}/{len(entries)}] ✅ {entry_id}: {clean_text_str[:30]} ({char_len} chars)")
        else:
            fail += 1
            print(f"   [{idx}/{len(entries)}] ❌ {entry_id}: {err}")

        # Update progress after each successful generation
        if ok:
            progress["last_index"] = idx
            progress["today_chars"] = used_chars_today + chars_used
            progress["date"] = today
            save_progress(progress)

        # Save manifest every 10 files
        if idx % 10 == 0 or idx == len(entries):
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)

        # Rate limiting (1.5 sec between requests)
        time.sleep(1.5)

    # Final manifest save
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # Final progress save
    save_progress(progress)

    print(f"\n🏁 GENERATION SESSION COMPLETE")
    print(f"   ✅ Generated: {success}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Failed: {fail}")
    print(f"   📊 Characters used today: {used_chars_today + chars_used} / {daily_limit}")
    print(f"   📄 Manifest: {MANIFEST_PATH} ({len(manifest)} entries)")
    print(f"   📍 Next start index: {progress['last_index']}")
    print("=" * 60)

    if fail == 0:
        print("\n✅ SESSION DONE!")
    else:
        print(f"\n⚠️ SESSION COMPLETED WITH {fail} ERRORS")

    print("\n💡 To continue tomorrow, simply run the same command again.")

if __name__ == "__main__":
    main()