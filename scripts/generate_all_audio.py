#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎙️ NUR Lingo — Armenian Audio Generator (Edge TTS)
===================================================
Գեներացնում է հայերեն MP3 աուդիոֆայլեր unified-dictionary.json-ից:
Օգտագործում է Microsoft Edge TTS (hy-AM)՝ Արևելահայերեն:

USAGE:
    python scripts/generate_hy_audio.py
    python scripts/generate_hy_audio.py --skip-existing
    python scripts/generate_hy_audio.py --limit 10
"""

import os
import sys
import json
import asyncio
import argparse
from pathlib import Path

# ─── ARGUMENTS ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo Armenian Audio Generator")
parser.add_argument("--dict", "-d", type=str,
                    default="data/dictionaries/unified-dictionary.json",
                    help="Path to dictionary JSON")
parser.add_argument("--out", "-o", type=str,
                    default="public/audio/hy",
                    help="Output directory for MP3 files")
parser.add_argument("--skip-existing", "-s", action="store_true",
                    help="Skip already generated files")
parser.add_argument("--force", "-f", action="store_true",
                    help="Force regenerate all files")
parser.add_argument("--limit", "-l", type=int, default=0,
                    help="Generate only first N entries (for testing)")
parser.add_argument("--verbose", "-v", action="store_true",
                    help="Verbose logging")
args = parser.parse_args()

# ─── SETUP ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent

DICT_PATH = PROJECT_ROOT / args.dict
OUT_DIR = PROJECT_ROOT / args.out
MANIFEST_PATH = PROJECT_ROOT / "public/audio/manifest.json"

# Create output directory
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ─── LOAD DATA ─────────────────────────────────────────────────────────────────
if not DICT_PATH.exists():
    print(f"❌ Dictionary not found: {DICT_PATH}")
    sys.exit(1)

print(f"📚 Loading dictionary from {DICT_PATH.name}...")
with open(DICT_PATH, "r", encoding="utf-8") as f:
    dict_data = json.load(f)

# Convert to list if needed
if isinstance(dict_data, dict):
    entries = list(dict_data.values())
else:
    entries = dict_data

print(f"✅ Loaded {len(entries)} entries")

# ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
def get_entry_text(entry, lang="hy"):
    """Get text for language, handling keys with trailing spaces"""
    # Try exact key first
    val = entry.get(lang, "")
    if val and isinstance(val, str) and val.strip():
        return val.strip()
    
    # Try with trailing space (for malformed JSON)
    val = entry.get(f"{lang} ", "")
    if val and isinstance(val, str) and val.strip():
        return val.strip()
    
    return ""

def get_audio_id(entry):
    """Extract audio ID from entry"""
    # Try from audio path
    audio = entry.get("audio", {})
    if isinstance(audio, dict):
        path = audio.get("hy", "") or audio.get("hy ", "")
        if path:
            stem = Path(path).stem
            if stem.isdigit():
                return stem.zfill(6)
    
    # Try from id field
    entry_id = entry.get("id", "") or entry.get("id ", "")
    if entry_id:
        return entry_id.strip().zfill(6)
    
    return None

def clean_text(text):
    """Clean text for TTS"""
    import re
    # Remove content in parentheses
    text = re.sub(r'\(.*?\)', '', text)
    # Replace slashes/dashes with space
    text = re.sub(r'[/\-–—]', ' ', text)
    # Keep only Armenian letters, spaces, and basic punctuation
    text = re.sub(r'[^\u0531-\u058F\s,.]', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ─── EDGE TTS GENERATOR ────────────────────────────────────────────────────────
async def generate_audio_edge(text, output_path, voice="hy-AM"):
    """Generate Armenian audio using Microsoft Edge TTS"""
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, None
        else:
            output_path.unlink(missing_ok=True)
            return False, "0B file"
    except Exception as e:
        output_path.unlink(missing_ok=True)
        return False, str(e)

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
async def main():
    print(f"\n🎙️ NUR Lingo — Armenian Audio Generator (Edge TTS)")
    print(f"   Dictionary: {DICT_PATH.name}")
    print(f"   Output: {OUT_DIR}")
    print(f"   Voice: hy-AM (Eastern Armenian)")
    print(f"   Skip existing: {args.skip_existing}")
    print(f"   Force: {args.force}")
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
    
    print(f"\n🎤 Generating {len(target_entries)} Armenian audio files...\n")
    
    for idx, entry in enumerate(target_entries, 1):
        entry_id = get_audio_id(entry)
        if not entry_id:
            if args.verbose:
                print(f"   [{idx}/{len(target_entries)}] ⚠️ No ID found")
            fail += 1
            continue
        
        hy_text = get_entry_text(entry, "hy")
        if not hy_text:
            if args.verbose:
                print(f"   [{idx}/{len(target_entries)}] ⚠️ {entry_id}: Empty text")
            fail += 1
            continue
        
        # Clean text
        clean = clean_text(hy_text)
        if not clean:
            if args.verbose:
                print(f"   [{idx}/{len(target_entries)}] ⚠️ {entry_id}: Text empty after cleaning")
            fail += 1
            continue
        
        output_path = OUT_DIR / f"{entry_id}.mp3"
        
        # Check if already exists
        if not args.force and args.skip_existing and output_path.exists() and output_path.stat().st_size > 1000:
            skipped += 1
            if args.verbose:
                print(f"   [{idx}/{len(target_entries)}] ⏭️ {entry_id}: Already exists")
            continue
        
        # Generate audio
        ok, err = await generate_audio_edge(clean, output_path)
        
        if ok:
            success += 1
            # Update manifest
            if entry_id not in manifest:
                manifest[entry_id] = {}
            manifest[entry_id]["hy"] = f"/audio/hy/{entry_id}.mp3"
            
            if args.verbose or success % 10 == 0:
                print(f"   [{idx}/{len(target_entries)}] ✅ {entry_id}: {clean[:30]}")
        else:
            fail += 1
            print(f"   [{idx}/{len(target_entries)}] ❌ {entry_id}: {err}")
        
        # Save manifest every 50 files
        if idx % 50 == 0:
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    # Final manifest save
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n🏁 GENERATION COMPLETE")
    print(f"   ✅ Generated: {success}")
    print(f"   ⏭️  Skipped: {skipped}")
    print(f"   ❌ Failed: {fail}")
    print(f"   📄 Manifest: {MANIFEST_PATH}")
    print("=" * 60)
    
    if fail == 0:
        print("\n✅ ALL DONE! All Armenian audio files generated successfully.")
    else:
        print(f"\n⚠️ COMPLETED WITH {fail} ERRORS. Check the log for details.")

if __name__ == "__main__":
    # Check if edge-tts is installed
    try:
        import edge_tts
    except ImportError:
        print("❌ edge-tts is not installed.")
        print("   Please install it with: python -m pip install edge-tts")
        sys.exit(1)
    
    asyncio.run(main())