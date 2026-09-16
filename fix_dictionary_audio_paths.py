#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FIX 1 — Dictionary audio paths (0/428 → 428/428)
Adds audio.hy / audio.en / audio.ru paths to master-dictionary.json

Run from project root:
  python fix_dictionary_audio_paths.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.resolve()

# Paths
DICT_PATHS = [
    ROOT / "src/lib/lexicon/master-dictionary.json",
    ROOT / "src/lib/lexicon/master-dictionary.fixed.json",
]
MANIFEST_INDEX = ROOT / "public/audio/offline/manifest_index.json"

# Language folder mapping (matches OfflineAudioEngine)
LANG_FOLDERS = {
    "hy": "hy_Ani",
    "en": "en_female",
    "ru": "ru_female",
}

def main():
    # Find dictionary
    dict_path = None
    for p in DICT_PATHS:
        if p.exists():
            dict_path = p
            break
    if not dict_path:
        print("❌ master-dictionary.json not found")
        return

    with open(dict_path, encoding="utf-8") as f:
        d = json.load(f)

    entries = list(d.values()) if isinstance(d, dict) else d
    keys    = list(d.keys())   if isinstance(d, dict) else [e.get("id", str(i)) for i, e in enumerate(d)]

    # Load manifest_index to cross-check audioId → file existence
    index = {}
    if MANIFEST_INDEX.exists():
        with open(MANIFEST_INDEX, encoding="utf-8") as f:
            raw = json.load(f)
        index = raw.get("mapping", raw) if isinstance(raw, dict) else {}
    
    updated = 0
    for key, entry in zip(keys, entries):
        if not isinstance(entry, dict):
            continue
        audio_id = entry.get("audioId", "")
        if not audio_id:
            continue
        padded = str(audio_id).zfill(6)

        # Build audio paths
        audio = {}
        for lang, folder in LANG_FOLDERS.items():
            audio_path = ROOT / f"public/audio/offline/{folder}/{padded}.mp3"
            if audio_path.exists() and audio_path.stat().st_size > 2000:
                audio[lang] = f"/audio/offline/{folder}/{padded}.mp3"
            else:
                # Fallback to dictionary audio
                dict_path2 = ROOT / f"public/audio/offline_dictionary/{lang}/{padded}.mp3"
                if dict_path2.exists():
                    audio[lang] = f"/audio/offline_dictionary/{lang}/{padded}.mp3"

        if audio:
            entry["audio"] = audio
            updated += 1

    # Save
    if isinstance(d, dict):
        out = {k: v for k, v in zip(keys, entries)}
    else:
        out = entries

    out_path = ROOT / "src/lib/lexicon/master-dictionary.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ Fixed: {updated}/{len(entries)} entries now have audio paths")
    print(f"   Saved: {out_path}")

    # Verify
    sample = entries[0] if entries else {}
    print(f"   Sample: {json.dumps(sample.get('audio',{}), ensure_ascii=False)}")

if __name__ == "__main__":
    main()
