#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FIX 2 — Regenerate 434 corrupted HY audio files
Uses edge-tts (free, hy-AM-AnahitNeural)

Install: pip install edge-tts
Run:     python fix_corrupted_hy_audio.py
"""
import asyncio, json, os, sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
HY_DIR = ROOT / "public/audio/offline/hy_Ani"
MANIFEST_PATH = ROOT / "public/audio/offline/manifest_hy_ani.json"
VOICE = "hy-AM-AnahitNeural"
MIN_SIZE = 2000  # bytes — below this = corrupt

def find_corrupted():
    mp3s = list(HY_DIR.glob("*.mp3"))
    return [f for f in mp3s if f.stat().st_size < MIN_SIZE]

def load_manifest():
    if not MANIFEST_PATH.exists():
        return {}
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    return raw.get("mapping", raw) if isinstance(raw, dict) else {}

async def regenerate(text: str, path: Path) -> bool:
    try:
        import edge_tts
        comm = edge_tts.Communicate(text=text, voice=VOICE, rate="+0%")
        await comm.save(str(path))
        size = path.stat().st_size if path.exists() else 0
        return size > MIN_SIZE
    except Exception as e:
        print(f"  ⚠️  edge-tts error: {e}")
        return False

async def main():
    try:
        import edge_tts
    except ImportError:
        print("❌ edge-tts not installed: pip install edge-tts")
        sys.exit(1)

    corrupted = find_corrupted()
    print(f"🔍 Found {len(corrupted)} corrupted files in {HY_DIR}")

    if not corrupted:
        print("✅ No corrupted files!")
        return

    manifest = load_manifest()
    # Build reverse map: 000013 → text
    id_to_text = {}
    for text_key, val in manifest.items():
        if isinstance(val, dict):
            aid = val.get("audioId","")
            text = val.get("hy","") or val.get("text","") or text_key
        elif isinstance(val, str):
            aid = val.replace(".mp3","").split("/")[-1]
            text = text_key
        else:
            continue
        padded = str(aid).zfill(6) if aid else ""
        if padded:
            id_to_text[padded] = text

    print(f"📖 Manifest: {len(id_to_text)} id→text mappings")
    print(f"🔊 Voice: {VOICE}")
    print()

    success = skip = fail = 0
    for mp3 in sorted(corrupted):
        stem = mp3.stem  # e.g. "000013"
        text = id_to_text.get(stem, "")
        if not text:
            print(f"  ⚠️  {stem}.mp3 — no text in manifest, skipping")
            skip += 1
            continue

        mp3.unlink()  # Delete corrupted
        ok = await regenerate(text, mp3)
        if ok:
            size = mp3.stat().st_size
            print(f"  ✅ {stem}.mp3 — '{text[:30]}' ({size//1024}KB)")
            success += 1
        else:
            print(f"  ❌ {stem}.mp3 — failed to regenerate")
            fail += 1

        await asyncio.sleep(0.15)  # Rate limit

    print(f"\n{'='*50}")
    print(f"✅ Regenerated: {success}")
    print(f"⚠️  Skipped (no text): {skip}")
    print(f"❌ Failed: {fail}")

if __name__ == "__main__":
    asyncio.run(main())
