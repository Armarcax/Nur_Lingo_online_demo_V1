#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 AUDIO SYSTEM DEBUGGER
Ստուգում է աուդիո համակարգի բոլոր հնարավոր խնդիրները
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.resolve()

# ─── Colors ──────────────────────────────────────────────────────────
G = "\033[92m"
R = "\033[91m"
Y = "\033[93m"
B = "\033[94m"
W = "\033[97m"
X = "\033[0m"

def ok(s): return f"{G}✅ {s}{X}"
def err(s): return f"{R}❌ {s}{X}"
def warn(s): return f"{Y}⚠️  {s}{X}"
def info(s): return f"{B}ℹ️  {s}{X}"
def hdr(s): return f"\n{W}{'═'*60}\n   {s}\n{'═'*60}{X}"

# ─── TEST 1: Audio files ────────────────────────────────────────────
def test_audio_files():
    print(hdr("TEST 1 — AUDIO FILES EXISTENCE"))
    
    audio_dirs = {
        "public/audio/offline/hy_Ani": "HY offline",
        "public/audio/offline/en_female": "EN offline",
        "public/audio/offline/ru_female": "RU offline",
    }
    
    total_files = 0
    for rel, label in audio_dirs.items():
        d = ROOT / rel
        if not d.exists():
            print(err(f"{label} — DIR MISSING"))
            continue
        
        mp3s = list(d.glob("*.mp3"))
        count = len(mp3s)
        total_files += count
        
        if count > 0:
            # Show first 5 files
            sample = [f.name for f in mp3s[:5]]
            print(ok(f"{label}: {count} MP3s"))
            print(f"   Sample: {', '.join(sample)}")
        else:
            print(err(f"{label}: 0 MP3s"))
    
    print(f"\n{info(f'Total audio files: {total_files}')}")
    return total_files

# ─── TEST 2: Manifest files ─────────────────────────────────────────
def test_manifests():
    print(hdr("TEST 2 — MANIFEST FILES"))
    
    manifests = [
        "public/audio/offline/manifest_hy_ani.json",
        "public/audio/offline/manifest_en_female.json",
        "public/audio/offline/manifest_ru_female.json",
    ]
    
    total_entries = 0
    for rel in manifests:
        f = ROOT / rel
        if not f.exists():
            print(err(f"{rel} — MISSING"))
            continue
        
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                data = json.load(fp)
            
            if isinstance(data, dict) and "mapping" in data:
                mapping = data["mapping"]
                count = len(mapping)
                total_entries += count
                
                # Show first 5 entries
                sample = list(mapping.items())[:5]
                print(ok(f"{Path(rel).name}: {count} entries"))
                for key, val in sample:
                    print(f"   {key} → {val}")
            else:
                print(err(f"{rel} — invalid format"))
        except Exception as e:
            print(err(f"{rel} — error: {e}"))
    
    print(f"\n{info(f'Total manifest entries: {total_entries}')}")
    return total_entries

# ─── TEST 3: Audio file vs manifest match ──────────────────────────
def test_match():
    print(hdr("TEST 3 — AUDIO vs MANIFEST MATCH"))
    
    # Check hy_Ani
    audio_dir = ROOT / "public/audio/offline/hy_Ani"
    manifest_file = ROOT / "public/audio/offline/manifest_hy_ani.json"
    
    if not audio_dir.exists() or not manifest_file.exists():
        print(warn("HY files not found, skipping..."))
        return
    
    mp3s = set(f.stem for f in audio_dir.glob("*.mp3"))
    
    with open(manifest_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        mapping = data.get("mapping", {})
        manifest_ids = set(mapping.values())
    
    missing = manifest_ids - mp3s
    extra = mp3s - manifest_ids
    
    print(f"  MP3 files: {len(mp3s)}")
    print(f"  Manifest entries: {len(manifest_ids)}")
    
    if missing:
        print(err(f"  Missing MP3s: {len(missing)}"))
        print(f"    {', '.join(list(missing)[:10])}")
    else:
        print(ok("  All manifest entries have MP3 files"))
    
    if extra:
        print(warn(f"  Extra MP3s: {len(extra)}"))
        print(f"    {', '.join(list(extra)[:10])}")

# ─── TEST 4: Dictionary audioId ─────────────────────────────────────
def test_dictionary():
    print(hdr("TEST 4 — DICTIONARY audioId CHECK"))
    
    dict_files = [
        "src/lib/lexicon/master-dictionary.fixed.json",
        "data/dictionaries/unified-dictionary.json",
    ]
    
    for rel in dict_files:
        f = ROOT / rel
        if not f.exists():
            print(warn(f"{rel} — NOT FOUND"))
            continue
        
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                data = json.load(fp)
            
            if isinstance(data, dict):
                entries = data.values()
            elif isinstance(data, list):
                entries = data
            else:
                print(err(f"{rel} — unknown format"))
                continue
            
            total = 0
            has_audio_id = 0
            for entry in entries:
                if isinstance(entry, dict):
                    total += 1
                    if entry.get("audioId"):
                        has_audio_id += 1
            
            if total > 0:
                pct = int((has_audio_id / total) * 100)
                if has_audio_id == 0:
                    print(err(f"{rel}: 0/{total} have audioId ({pct}%)"))
                elif has_audio_id < total:
                    print(warn(f"{rel}: {has_audio_id}/{total} have audioId ({pct}%)"))
                else:
                    print(ok(f"{rel}: {has_audio_id}/{total} have audioId ({pct}%)"))
        except Exception as e:
            print(err(f"{rel} — error: {e}"))

# ─── TEST 5: OfflineAudioManager.ts code ──────────────────────────
def test_code():
    print(hdr("TEST 5 — OfflineAudioManager.ts CODE CHECK"))
    
    f = ROOT / "src/lib/offline/OfflineAudioManager.ts"
    if not f.exists():
        print(err("OfflineAudioManager.ts — NOT FOUND"))
        return
    
    code = f.read_text(encoding='utf-8')
    
    checks = {
        "play method": r"async play\(",
        "getAudioUrl method": r"getAudioUrl\(",
        "volume handling": r"volume",
        "muted handling": r"muted",
        "audioCache Map": r"audioCache.*Map",
        "combinedMapping": r"combinedMapping",
        "console.log in play": r"console\.log.*play",
    }
    
    for name, pattern in checks.items():
        if re.search(pattern, code):
            print(ok(f"{name} — found"))
        else:
            print(warn(f"{name} — NOT FOUND"))
    
    # Check if play() has volume check
    if "audio.volume" in code:
        print(ok("volume is set in play()"))
    else:
        print(err("⚠️  volume NOT set in play() !!!"))
    
    if "this.isMuted" in code:
        print(ok("muted is checked in play()"))
    else:
        print(warn("muted NOT checked in play()"))

# ─── TEST 6: page.tsx audio usage ──────────────────────────────────
def test_page():
    print(hdr("TEST 6 — page.tsx AUDIO USAGE"))
    
    f = ROOT / "src/app/learn/page.tsx"
    if not f.exists():
        print(err("page.tsx — NOT FOUND"))
        return
    
    code = f.read_text(encoding='utf-8')
    
    checks = {
        "playOfflineAudio function": r"playOfflineAudio",
        "offlineAudioManager import": r"offlineAudioManager",
        "setVolume called": r"setVolume",
        "setMuted called": r"setMuted",
        "showMessage on error": r"showMessage.*error",
    }
    
    for name, pattern in checks.items():
        if re.search(pattern, code):
            print(ok(f"{name} — found"))
        else:
            print(warn(f"{name} — NOT FOUND"))

# ─── TEST 7: Audio file URL check ──────────────────────────────────
def test_url():
    print(hdr("TEST 7 — AUDIO URL CHECK"))
    
    test_files = [
        "public/audio/offline/hy_Ani/000001.mp3",
        "public/audio/offline/hy_Ani/000002.mp3",
        "public/audio/offline/hy_Ani/000003.mp3",
    ]
    
    for rel in test_files:
        f = ROOT / rel
        if f.exists():
            size = f.stat().st_size
            print(ok(f"{rel} — exists ({size} bytes)"))
        else:
            print(err(f"{rel} — MISSING"))

# ─── FINAL REPORT ────────────────────────────────────────────────────
def print_summary(results):
    print(f"\n{W}{'═'*60}")
    print("   📊 AUDIO SYSTEM DEBUG SUMMARY")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═'*60}{X}")
    
    for key, value in results.items():
        print(f"  {key}: {value}")

# ─── MAIN ────────────────────────────────────────────────────────────
def main():
    print(f"\n{W}🔍 AUDIO SYSTEM DEBUGGER{X}")
    print(f"Root: {ROOT}\n")
    
    results = {}
    
    total_files = test_audio_files()
    results["Audio files"] = total_files
    
    total_entries = test_manifests()
    results["Manifest entries"] = total_entries
    
    test_match()
    test_dictionary()
    test_code()
    test_page()
    test_url()
    
    print_summary(results)
    
    print(f"\n{info('💡 Check the output above for issues')}")

if __name__ == "__main__":
    main()