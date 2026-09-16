#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎙️ NUR Lingo — Armenian Audio Generator (SpeechGen.io API)
=============================================================
USAGE:
    python generate_hy_audio_speechgen.py
    python generate_hy_audio_speechgen.py --skip-existing
    python generate_hy_audio_speechgen.py --limit 10
    python generate_hy_audio_speechgen.py --voice Venera
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"

# SpeechGen.io API credentials (Ձեր տվյալները)
SPEECHGEN_EMAIL = "arcaxa305@gmail.com"
SPEECHGEN_TOKEN = "eb701976-e5f1-47c0-9b3a-564033500f8e"
SPEECHGEN_API_URL = "https://speechgen.io/index.php?r=api/text"  # Կարճ տեքստերի համար

# ─── ARGUMENTS ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo Armenian Audio Generator (SpeechGen.io)")
parser.add_argument("--dict", "-d", type=str,
                    default="data/dictionaries/unified-dictionary.json",
                    help="Path to dictionary JSON")
parser.add_argument("--skip-existing", "-s", action="store_true",
                    help="Skip already generated files")
parser.add_argument("--force", "-f", action="store_true",
                    help="Force regenerate all files")
parser.add_argument("--limit", "-l", type=int, default=0,
                    help="Generate only first N entries")
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
    """Get Armenian text from entry"""
    for key in [lang, "hy"]:
        val = entry.get(key, "")
        if val and isinstance(val, str):
            return val.strip()
    return ""

def get_audio_id(entry):
    """Extract audio ID from entry"""
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
    """Clean text for TTS"""
    import re
    # Remove content in parentheses
    text = re.sub(r'\(.*?\)', '', text)
    # Replace slashes/dashes with space
    text = re.sub(r'[/\-–—]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_speechgen(text, voice, output_path, fmt="mp3"):
    """Generate audio using SpeechGen.io API (Method 1 - short text)"""
    try:
        # API-ն ընդունում է application/x-www-form-urlencoded[reference:1]
        params = {
            "token": SPEECHGEN_TOKEN,
            "email": SPEECHGEN_EMAIL,
            "voice": voice,
            "text": text,
            "format": fmt,
            "speed": 1.0,      # խոսքի արագություն[reference:2]
            "pitch": 0,        # բարձրություն[reference:3]
        }
        
        response = requests.post(SPEECHGEN_API_URL, data=params, timeout=60)
        
        if response.status_code == 200:
            # Ստուգենք՝ արդյոք պատասխանը JSON է (սխալ) թե binary (հաջողություն)
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                error_data = response.json()
                if "error" in error_data:
                    return False, f"API Error: {error_data['error']}"
                return False, f"Unknown API response: {error_data}"
            else:
                # Binary response - պահենք որպես աուդիո ֆայլ
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                # Ստուգենք ֆայլի չափը
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

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
def main():
    print(f"\n🎙️ NUR Lingo — Armenian Audio Generator (SpeechGen.io)")
    print(f"   Dictionary: {DICT_PATH.name}")
    print(f"   Voice: {args.voice}")
    print(f"   Format: {args.format}")
    print(f"   Skip existing: {args.skip_existing}")
    print(f"   Limit: {args.limit or 'all'}")
    print("=" * 60)
    
    # Filter entries
    target_entries = entries[:args.limit] if args.limit > 0 else entries
    
    # Load manifest
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    
    success = 0
    fail = 0
    skipped = 0
    
    print(f"\n🎤 Generating Armenian audio ({len(target_entries)} entries)...\n")
    
    for idx, entry in enumerate(target_entries, 1):
        entry_id = get_audio_id(entry)
        if not entry_id:
            print(f"   [{idx}/{len(target_entries)}] ⚠️ No ID")
            fail += 1
            continue
        
        hy_text = get_entry_text(entry, "hy")
        if not hy_text:
            print(f"   [{idx}/{len(target_entries)}] ⚠️ {entry_id}: Empty text")
            fail += 1
            continue
        
        clean = clean_text(hy_text)
        if not clean:
            print(f"   [{idx}/{len(target_entries)}] ⚠️ {entry_id}: Empty after cleaning")
            fail += 1
            continue
        
        output_path = AUDIO_BASE / "hy" / f"{entry_id}.{args.format}"
        
        # Check if already exists
        if not args.force and args.skip_existing and output_path.exists() and output_path.stat().st_size > 1000:
            skipped += 1
            if args.verbose:
                print(f"   [{idx}/{len(target_entries)}] ⏭️ {entry_id} (exists)")
            continue
        
        # Generate audio
        ok, err = generate_speechgen(clean, args.voice, output_path, args.format)
        
        if ok:
            success += 1
            # Update manifest
            if entry_id not in manifest:
                manifest[entry_id] = {}
            manifest[entry_id]["hy"] = f"/audio/hy/{entry_id}.{args.format}"
            print(f"   [{idx}/{len(target_entries)}] ✅ {entry_id}: {clean[:30]}")
        else:
            fail += 1
            print(f"   [{idx}/{len(target_entries)}] ❌ {entry_id}: {err}")
        
        # Save manifest every 10 files
        if idx % 10 == 0 or idx == len(target_entries):
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        # Rate limiting - wait between requests (SpeechGen-ը խորհուրդ է տալիս 30-60 վայրկյան[reference:4], բայց կարճ տեքստերի համար 1-2 վայրկյանը բավական է)
        time.sleep(1.5)
    
    # Final manifest save
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n🏁 GENERATION COMPLETE")
    print(f"   ✅ Generated: {success}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Failed: {fail}")
    print(f"   📄 Manifest: {MANIFEST_PATH} ({len(manifest)} entries)")
    print("=" * 60)
    
    if fail == 0:
        print("\n✅ ALL DONE!")
    else:
        print(f"\n⚠️ COMPLETED WITH {fail} ERRORS")

if __name__ == "__main__":
    main()