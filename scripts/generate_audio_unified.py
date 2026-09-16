#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎙️ NUR Lingo — Unified Audio Generator (Edge TTS + gTTS + MMS TTS)
===================================================================
Generates MP3 audio for ALL languages (hy, en, ru) using:
1. Edge TTS (Microsoft) – highest quality, requires internet
2. gTTS (Google) – fallback if Edge TTS fails
3. MMS TTS (Facebook) – optional, offline, for Armenian only

USAGE:
    python generate_audio_unified.py

    # Use MMS TTS for Armenian (offline, requires transformers/torch)
    python generate_audio_unified.py --use-mms-hy

    # Test with 10 files
    python generate_audio_unified.py --limit 10

    # Force regenerate all files
    python generate_audio_unified.py --force

    # Skip existing files (resume mode)
    python generate_audio_unified.py --skip-existing
"""

import os
import re
import sys
import json
import time
import asyncio
import argparse
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
DB_PATH = PROJECT_ROOT / "src" / "lib" / "content" / "database.ts"
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"

# Edge TTS voices
EDGE_VOICES = {
    "en": "en-US-JennyNeural",
    "ru": "ru-RU-SvetlanaNeural",
    "hy": "hy-AM-AnahidNeural",  # or "hy-AM-ArmenianNeural"
}

# gTTS language codes
GTTS_LANGS = {
    "en": "en",
    "ru": "ru",
    "hy": "hy",
}

# ─── ARGUMENTS ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo Unified Audio Generator")
parser.add_argument("--use-mms-hy", action="store_true",
                    help="Use Facebook MMS TTS for Armenian (offline, better quality)")
parser.add_argument("--skip-existing", "-s", action="store_true",
                    help="Skip already generated files (resume mode)")
parser.add_argument("--force", "-f", action="store_true",
                    help="Force regenerate all files (overwrite existing)")
parser.add_argument("--limit", "-l", type=int, default=0,
                    help="Generate only first N entries (for testing)")
parser.add_argument("--lang", choices=["hy", "en", "ru", "all"], default="all",
                    help="Language to generate (default: all)")
args = parser.parse_args()

# ─── SETUP DIRECTORIES ──────────────────────────────────────────────────────
for lang in ["hy", "en", "ru"]:
    (AUDIO_BASE / lang).mkdir(parents=True, exist_ok=True)

# ─── LOAD DATA ────────────────────────────────────────────────────────────────
def load_from_database():
    """Extract vocabulary from database.ts (v() function calls)"""
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        sys.exit(1)

    with open(DB_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    items = []
    pattern = re.compile(
        r"v\s*\(\s*[\"'](\d{6})[\"']\s*,\s*[\"']([^\"']*?)[\"']\s*,\s*[\"']([^\"']*?)[\"']\s*,\s*[\"']([^\"']*?)[\"']\s*\)",
        re.DOTALL
    )

    for match in pattern.findall(content):
        id_val, en_text, ru_text, hy_text = match
        items.append({
            "id": id_val,
            "en": en_text.replace('\\n', '\n').strip(),
            "ru": ru_text.replace('\\n', '\n').strip(),
            "hy": hy_text.replace('\\n', '\n').strip(),
        })

    # Also check master-dictionary.json if database.ts has no data
    if not items:
        dict_path = PROJECT_ROOT / "data" / "dictionaries" / "master-dictionary.json"
        if dict_path.exists():
            with open(dict_path, "r", encoding="utf-8") as f:
                dict_data = json.load(f)
            for entry in dict_data:
                audio = entry.get("audio", {})
                hy_path = audio.get("hy", "")
                if hy_path:
                    id_val = Path(hy_path).stem
                else:
                    id_val = entry.get("id", "")
                if not id_val:
                    continue
                items.append({
                    "id": id_val.zfill(6),
                    "en": entry.get("en", ""),
                    "ru": entry.get("ru", ""),
                    "hy": entry.get("hy", ""),
                })

    print(f"📊 Loaded {len(items)} entries from database")
    return items

ITEMS = load_from_database()
if not ITEMS:
    print("❌ No data found! Check database.ts or master-dictionary.json")
    sys.exit(1)

# ─── CHECK MISSING FILES ──────────────────────────────────────────────────────
def check_missing(items, target_langs):
    missing = {lang: [] for lang in target_langs}
    for item in items:
        for lang in target_langs:
            file_path = AUDIO_BASE / lang / f"{item['id']}.mp3"
            if args.force:
                missing[lang].append(item)
            elif not file_path.exists() or file_path.stat().st_size < 1000:
                missing[lang].append(item)

    for lang in target_langs:
        print(f"   {lang.upper()}: {len(missing[lang])} missing")
    return missing

TARGET_LANGS = ["hy", "en", "ru"] if args.lang == "all" else [args.lang]
MISSING = check_missing(ITEMS, TARGET_LANGS)

# ─── GENERATORS ──────────────────────────────────────────────────────────────

async def generate_edge_tts(text, lang, voice, output_path):
    """Generate audio using Microsoft Edge TTS"""
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, None
        output_path.unlink(missing_ok=True)
        return False, "0B file"
    except Exception as e:
        output_path.unlink(missing_ok=True)
        return False, str(e)

def generate_gtts(text, lang, output_path):
    """Generate audio using Google Translate TTS (fallback)"""
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang=GTTS_LANGS[lang], slow=False)
        tts.save(str(output_path))
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, None
        output_path.unlink(missing_ok=True)
        return False, "0B file"
    except Exception as e:
        output_path.unlink(missing_ok=True)
        return False, str(e)

def generate_mms_hy(text, output_path):
    """Generate Armenian audio using Facebook MMS TTS (offline)"""
    try:
        import torch
        from transformers import VitsModel, AutoTokenizer
        import soundfile as sf
        import numpy as np

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model_id = "facebook/mms-tts-hyw"  # Western Armenian (works reliably)
        # For Eastern Armenian try: "facebook/mms-tts-hye" (may not exist)

        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = VitsModel.from_pretrained(model_id).to(device)
        model.eval()

        # Clean text (remove parentheses, slashes)
        import re
        clean = re.sub(r'\(.*?\)', '', text)
        clean = re.sub(r'[/\-–—]', ' ', clean)
        clean = re.sub(r'\s+', ' ', clean).strip()

        if not clean:
            return False, "Empty text after cleaning"

        inputs = tokenizer(clean, return_tensors="pt").to(device)
        with torch.no_grad():
            waveform = model(**inputs).waveform.squeeze().cpu().numpy()

        # Save as MP3 via temp WAV
        tmp_wav = output_path.with_suffix(".tmp.wav")
        sf.write(str(tmp_wav), waveform, model.config.sampling_rate)

        # Convert to MP3 using pydub/ffmpeg
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_wav(str(tmp_wav))
            audio.export(str(output_path), format="mp3", bitrate="128k")
            tmp_wav.unlink(missing_ok=True)
        except ImportError:
            # If pydub not available, keep as WAV
            tmp_wav.rename(output_path.with_suffix(".wav"))
            return False, "pydub not installed, saved as WAV"

        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, None
        output_path.unlink(missing_ok=True)
        return False, "0B file"

    except Exception as e:
        output_path.unlink(missing_ok=True)
        return False, str(e)

async def generate_audio(item, lang, use_mms_hy):
    """Generate audio for one item using the best available method"""
    output_path = AUDIO_BASE / lang / f"{item['id']}.mp3"

    if not args.force and output_path.exists() and output_path.stat().st_size > 1000:
        return True, "skipped"

    text = item.get(lang, "")
    if not text:
        return False, "empty text"

    # If Armenian and MMS is enabled, try MMS first
    if lang == "hy" and use_mms_hy:
        ok, err = generate_mms_hy(text, output_path)
        if ok:
            return True, "MMS TTS"
        print(f"      ⚠️ MMS TTS failed: {err}, trying fallback...")

    # Try Edge TTS
    voice = EDGE_VOICES.get(lang)
    if voice:
        ok, err = await generate_edge_tts(text, lang, voice, output_path)
        if ok:
            return True, "Edge TTS"
        print(f"      ⚠️ Edge TTS failed: {err}, trying gTTS...")

    # Fallback to gTTS
    ok, err = generate_gtts(text, lang, output_path)
    if ok:
        return True, "gTTS"
    return False, err

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
async def main():
    print(f"\n🎙️ NUR Lingo — Unified Audio Generator")
    print(f"   Languages: {', '.join(TARGET_LANGS)}")
    print(f"   Use MMS for HY: {args.use_mms_hy}")
    print(f"   Force: {args.force}")
    print(f"   Limit: {args.limit or 'all'}")
    print("=" * 60)

    total_success = 0
    total_fail = 0
    total_skipped = 0

    # Load existing manifest
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    for lang in TARGET_LANGS:
        missing_items = MISSING.get(lang, [])
        if not missing_items:
            print(f"\n✅ {lang.upper()} — all files exist")
            continue

        if args.limit > 0 and args.limit < len(missing_items):
            missing_items = missing_items[:args.limit]

        print(f"\n🎤 Generating {lang.upper()} ({len(missing_items)} files)...")

        success = 0
        fail = 0
        skipped = 0

        for i, item in enumerate(missing_items, 1):
            # Determine if using MMS for hy
            use_mms = args.use_mms_hy and lang == "hy"

            ok, method = await generate_audio(item, lang, use_mms)

            if ok and method == "skipped":
                skipped += 1
                print(f"   [{i}/{len(missing_items)}] ⏭️ {item['id']} (exists)")
                continue

            if ok:
                success += 1
                manifest[item["id"]] = manifest.get(item["id"], {})
                manifest[item["id"]][lang] = f"/audio/{lang}/{item['id']}.mp3"
                print(f"   [{i}/{len(missing_items)}] ✅ {item['id']} ({method})")
            else:
                fail += 1
                print(f"   [{i}/{len(missing_items)}] ❌ {item['id']}: {method}")

            # Save manifest every 10 files
            if (i % 10 == 0 or i == len(missing_items)):
                with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                    json.dump(manifest, f, indent=2, ensure_ascii=False)

            # Small delay to avoid rate limiting
            if i % 5 == 0:
                await asyncio.sleep(0.5)

        total_success += success
        total_fail += fail
        total_skipped += skipped
        print(f"   📊 {lang.upper()}: ✅{success} ❌{fail} ⏭️{skipped}")

    # Final manifest save
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n🏁 GENERATION COMPLETE")
    print(f"   ✅ Total generated: {total_success}")
    print(f"   ⏭️  Total skipped:   {total_skipped}")
    print(f"   ❌ Total failed:    {total_fail}")
    print(f"   📄 Manifest: {MANIFEST_PATH} ({len(manifest)} entries)")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())