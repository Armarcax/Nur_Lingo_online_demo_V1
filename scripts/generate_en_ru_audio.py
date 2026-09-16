"""
NUR Lingo — EN & RU Audio Generator
=====================================
Գեներացնում է անգլերեն և ռուսերեն աուդիոները unified-dictionary.json-ից՝
պահպանելով ճիշտ ID-ները, որպեսզի համընկնեն հայերենի հետ:

USAGE:
    python scripts/generate_en_ru_audio.py
"""
import os
import json
import asyncio
import re
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("❌ edge-tts գրադարանը տեղադրված չէ:")
    print("👉 Գործարկեք՝ python -m pip install edge-tts")
    exit(1)

# ── Ուղիներ ──────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
dict_path = os.path.join(project_root, "data", "dictionaries", "unified-dictionary.json")
audio_base = os.path.join(project_root, "public", "audio")
manifest_path = os.path.join(project_root, "public", "audio", "manifest.json")

# ── Ձայներ (Microsoft Edge TTS) ──────────────────────────────────────────────
VOICES = {
    "en": "en-US-JennyNeural",      # Բնական ամերիկյան անգլերեն
    "ru": "ru-RU-SvetlanaNeural"    # Բնական ռուսերեն
}

def clean_text(text: str) -> str:
    """Մաքրում է տեքստը TTS-ի համար"""
    if not text:
        return ""
    # Հեռացնում ենք փակագծերի մեջ գրվածները
    text = re.sub(r'\(.*?\)', '', text)
    # Փոխարինում ենք սլեշները և գծիկները բացատով
    text = re.sub(r'[/\-–—]', ' ', text)
    # Հեռացնում ենք ավելորդ բացատները
    text = re.sub(r'\s+', ' ', text).strip()
    return text

async def generate_audio(text, voice, output_path):
    """Գեներացնում է աուդիո Edge TTS-ով"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        
        # Ստուգում ենք, որ ֆայլը նորմալ չափսի է
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return True
        else:
            if os.path.exists(output_path):
                os.remove(output_path)
            return False
    except Exception as e:
        if os.path.exists(output_path):
            os.remove(output_path)
        return False

async def main():
    # ── Ստուգել բառարանը ─────────────────────────────────────────────────────
    if not os.path.exists(dict_path):
        print(f"❌ Բառարանը չի գտնվել: {dict_path}")
        print("💡 Խնդրում եմ նախ գործարկել 'python scripts/generate_unified_dictionary.py'")
        return

    with open(dict_path, "r", encoding="utf-8") as f:
        entries = json.load(f)

    print(f"📚 Բեռնվել է {len(entries)} բառ/նախադասություն unified-dictionary.json-ից")
    print(f"🎯 Գեներացնելու ենք միայն EN և RU լեզուներով")
    print("=" * 60)

    # ── Բեռնել manifest-ը ────────────────────────────────────────────────────
    manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    # ── Գեներացնել յուրաքանչյուր լեզվի համար ─────────────────────────────────
    for lang, voice in VOICES.items():
        lang_dir = os.path.join(audio_base, lang)
        os.makedirs(lang_dir, exist_ok=True)
        
        print(f"\n🎤 Սկսում եմ {lang.upper()} լեզվի գեներացիան (Ձայնը՝ {voice})...")
        
        success = 0
        fail = 0
        skipped = 0

        for i, entry in enumerate(entries):
            # Վերցնում ենք ID-ն JSON-ից (օրինակ՝ "000001")
            entry_id = entry.get("id", f"{i+1:06d}")
            text = entry.get(lang, "").strip()

            if not text:
                fail += 1
                continue

            # Մաքրում ենք տեքստը
            clean = clean_text(text)
            if not clean:
                fail += 1
                continue

            output_path = os.path.join(lang_dir, f"{entry_id}.mp3")

            # Եթե ֆայլը արդեն կա և նորմալ չափսի է, բաց ենք թողնում
            if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                skipped += 1
                # Թարմացնել manifest-ը
                if entry_id not in manifest:
                    manifest[entry_id] = {}
                manifest[entry_id][lang] = f"/audio/{lang}/{entry_id}.mp3"
                continue

            # Գեներացնել
            ok = await generate_audio(clean, voice, output_path)
            
            if ok:
                success += 1
                # Թարմացնել manifest-ը
                if entry_id not in manifest:
                    manifest[entry_id] = {}
                manifest[entry_id][lang] = f"/audio/{lang}/{entry_id}.mp3"
                
                if success % 50 == 0:
                    print(f"   ✅ Առաջընթաց: {success} ֆայլ գեներացված է...")
            else:
                fail += 1

        print(f"🏁 {lang.upper()} ավարտված է: ✅ {success} հաջող, ⏭️ {skipped} բաց թողնված, ❌ {fail} սխալ")

    # ── Պահպանել manifest-ը ──────────────────────────────────────────────────
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Manifest թարմացված է: {len(manifest)} entries → {manifest_path}")
    print("\n🎉 Բոլոր լեզուների աուդիոները պատրաստ են և ID-ները համընկնում են:")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())