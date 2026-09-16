#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎙️ NUR Lingo — Universal Audio Generator (Edge TTS + Fallbacks)
================================================================
Գեներացնում է MP3 աուդիոֆայլեր բոլոր լեզուներով (hy, en, ru):
- Հայերեն (hy) -> Edge TTS (hy-AM) - Արևելահայերեն, բնական ձայն
- Անգլերեն (en) -> Edge TTS (en-US)
- Ռուսերեն (ru) -> Edge TTS (ru-RU)

USAGE:
    # Գեներացնել բոլոր լեզուներով
    python scripts/generate_audio.py
    
    # Բաց թողնել արդեն գոյություն ունեցողները (Resume mode)
    python scripts/generate_audio.py --skip-existing
    
    # Միայն հայերեն
    python scripts/generate_audio.py --lang hy
    
    # Թեստային ռեժիմ (առաջին 10 բառը)
    python scripts/generate_audio.py --skip-existing --limit 10
"""

import os
import sys
import json
import time
import asyncio
import argparse
import re
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_BASE / "manifest.json"

# ─── ARGUMENTS ─────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="NUR Lingo Universal Audio Generator")
parser.add_argument("--dict", "-d", type=str, default="data/dictionaries/unified-dictionary.json", help="Բառարանի ուղին")
parser.add_argument("--skip-existing", "-s", action="store_true", help="Բաց թողնել արդեն գոյություն ունեցող ֆայլերը")
parser.add_argument("--force", "-f", action="store_true", help="Վերագեներացնել բոլորը (overwrite)")
parser.add_argument("--limit", "-l", type=int, default=0, help="Գեներացնել միայն առաջին N բառերը (թեստի համար)")
parser.add_argument("--lang", choices=["hy", "en", "ru", "all"], default="all", help="Ընտրել լեզուն (default: all)")
parser.add_argument("--format", choices=["mp3", "wav"], default="mp3", help="Ֆորմատը (default: mp3)")
args = parser.parse_args()

# ─── SETUP DIRECTORIES ─────────────────────────────────────────────────────────
for lang in ["hy", "en", "ru"]:
    (AUDIO_BASE / lang).mkdir(parents=True, exist_ok=True)

# ─── LOAD DATA ─────────────────────────────────────────────────────────────────
DICT_PATH = PROJECT_ROOT / args.dict
if not DICT_PATH.exists():
    print(f"❌ Բառարանը չի գտնվել: {DICT_PATH}")
    print("💡 Խնդրում եմ նախ գործարկել 'python scripts/generate_unified_dictionary.py'")
    sys.exit(1)

with open(DICT_PATH, "r", encoding="utf-8") as f:
    dict_data = json.load(f)

entries = list(dict_data.values()) if isinstance(dict_data, dict) else dict_data
print(f"📚 Բեռնվել է {len(entries)} մուտք '{DICT_PATH.name}'-ից")

# ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
def clean_text(text: str) -> str:
    """Մաքրում է տեքստը TTS-ի համար"""
    if not text: return ""
    # Հեռացնում ենք փակագծերի մեջ գրվածները (քերականական նշումներ)
    text = re.sub(r'\(.*?\)', '', text)
    # Փոխարինում ենք սլեշները և գծիկները բացատով
    text = re.sub(r'[/\-–—]', ' ', text)
    # Հեռացնում ենք բոլոր ոչ հայկական/ոչ լատինական/ոչ կիրիլյան նիշերը (բացի թվերից և կետադրությունից)
    text = re.sub(r'[^\w\s\u0531-\u058F\u0400-\u04FF\u00C0-\u024F.,!?\'-]', '', text)
    return text.strip()

def get_entry_text(entry, lang):
    """Վերցնում է տեքստը ըստ լեզվի"""
    val = entry.get(lang, "")
    if val and isinstance(val, str):
        return clean_text(val)
    return ""

def get_audio_id(entry):
    """Վերցնում է ID-ն"""
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

# ─── TTS ENGINES ───────────────────────────────────────────────────────────────

# 1. EDGE TTS (Primary - Online, High Quality, Eastern Armenian)
async def generate_edge_tts(text: str, lang: str, output_path: Path):
    try:
        import edge_tts
        voices = {
            "hy": "hy-AM",       # Արևելահայերեն
            "en": "en-US-JennyNeural",
            "ru": "ru-RU-SvetlanaNeural"
        }
        voice = voices.get(lang, "en-US-JennyNeural")
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, "Edge TTS"
        output_path.unlink(missing_ok=True)
        return False, "0B file"
    except Exception as e:
        return False, str(e)

# 2. gTTS (Fallback - Online, Lower Quality)
def generate_gtts(text: str, lang: str, output_path: Path):
    try:
        from gtts import gTTS
        # gTTS-ը հայերեն չի աջակցում, ուստի hy-ի համար միշտ կձախողվի
        if lang == "hy": 
            return False, "gTTS does not support Armenian (hy)"
            
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(str(output_path))
        
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True, "gTTS"
        output_path.unlink(missing_ok=True)
        return False, "0B file"
    except Exception as e:
        return False, str(e)

# ─── MAIN GENERATOR LOGIC ──────────────────────────────────────────────────────
async def generate_audio_item(entry, lang):
    entry_id = get_audio_id(entry)
    if not entry_id: return False, "No ID"
    
    text = get_entry_text(entry, lang)
    if not text: return False, "Empty text"
    
    output_path = AUDIO_BASE / lang / f"{entry_id}.{args.format}"
    
    # Ստուգում՝ արդյոք ֆայլը արդեն կա
    if not args.force and args.skip_existing and output_path.exists() and output_path.stat().st_size > 1000:
        return True, "skipped"
        
    # Փորձում ենք Edge TTS
    ok, msg = await generate_edge_tts(text, lang, output_path)
    if ok: return True, msg
    
    # Եթե չստացվեց, փորձում ենք gTTS (Fallback)
    ok, msg = generate_gtts(text, lang, output_path)
    if ok: return True, msg
    
    return False, msg

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
async def main():
    print(f"\n🎙️ NUR Lingo — Universal Audio Generator")
    print(f"   Բառարան: {DICT_PATH.name}")
    print(f"   Լեզուներ: {args.lang}")
    print(f"   Skip existing: {args.skip_existing}")
    print(f"   Limit: {args.limit or 'all'}")
    print("=" * 60)
    
    target_entries = entries[:args.limit] if args.limit > 0 else entries
    target_langs = ["hy", "en", "ru"] if args.lang == "all" else [args.lang]
    
    # Բեռնում ենք manifest-ը
    manifest = {}
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            
    total_success = 0
    total_fail = 0
    total_skipped = 0
    
    for lang in target_langs:
        print(f"\n🎤 Գեներացնում եմ {lang.upper()} ({len(target_entries)} մուտք)...")
        success = fail = skipped = 0
        
        for idx, entry in enumerate(target_entries, 1):
            ok, method = await generate_audio_item(entry, lang)
            entry_id = get_audio_id(entry) or f"{idx:06d}"
            
            if ok and method == "skipped":
                skipped += 1
                if idx % 50 == 0: print(f"   [{idx}/{len(target_entries)}] ⏭️ {entry_id} (exists)")
                continue
                
            if ok:
                success += 1
                if entry_id not in manifest: manifest[entry_id] = {}
                manifest[entry_id][lang] = f"/audio/{lang}/{entry_id}.{args.format}"
                if success <= 5 or success % 20 == 0:
                    print(f"   [{idx}/{len(target_entries)}] ✅ {entry_id} ({method})")
            else:
                fail += 1
                print(f"   [{idx}/{len(target_entries)}] ❌ {entry_id}: {method}")
                
            # Փոքր դադար՝ API rate-limit-ից խուսափելու համար
            if idx % 5 == 0: await asyncio.sleep(0.2)
            
        # Պահպանում ենք manifest-ը յուրաքանչյուր լեզվից հետո
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
            
        print(f"   📊 {lang.upper()} Արդյունք: ✅{success} ❌{fail} ⏭️{skipped}")
        total_success += success
        total_fail += fail
        total_skipped += skipped
        
    print(f"\n🏁 ԱՎԱՐՏՎԱԾ Է")
    print(f"   ✅ Ընդհանուր գեներացված: {total_success}")
    print(f"   ⏭️  Ընդհանուր բաց թողնված: {total_skipped}")
    print(f"   ❌ Ընդհանուր սխալ: {total_fail}")
    print(f"   📄 Manifest: {MANIFEST_PATH} ({len(manifest)} entries)")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())