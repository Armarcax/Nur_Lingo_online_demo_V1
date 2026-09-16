#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 AUDIO PLAYBACK DEBUGGER
Ստուգում է, թե ինչու աուդիոն չի լսվում
"""

import os
import json
import subprocess
import sys
from pathlib import Path

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

# ─── TEST 1: Audio files exist ──────────────────────────────────────
def test_audio_files():
    print(hdr("TEST 1 — AUDIO FILES EXISTENCE"))
    
    audio_dir = ROOT / "public/audio/offline/hy_Ani"
    if not audio_dir.exists():
        print(err(f"Directory not found: {audio_dir}"))
        return 0
    
    mp3s = list(audio_dir.glob("*.mp3"))
    count = len(mp3s)
    print(f"  📁 {audio_dir}")
    print(f"  📄 MP3 files: {count}")
    
    if count > 0:
        sample = [f.name for f in mp3s[:5]]
        print(f"  📋 Sample: {', '.join(sample)}")
        print(ok(f"Found {count} MP3 files"))
    else:
        print(err("❌ NO MP3 FILES FOUND!"))
    
    # Check file sizes (corrupted files are < 2000 bytes)
    small_files = [f for f in mp3s if f.stat().st_size < 2000]
    if small_files:
        print(warn(f"  ⚠️ {len(small_files)} files are too small (<2KB) - may be corrupted"))
        print(f"    {', '.join([f.name for f in small_files[:5]])}")
    
    return count

# ─── TEST 2: Manifest file ──────────────────────────────────────────
def test_manifest():
    print(hdr("TEST 2 — MANIFEST FILE"))
    
    manifest_file = ROOT / "public/audio/offline/manifest_hy_ani.json"
    if not manifest_file.exists():
        print(err(f"Manifest not found: {manifest_file}"))
        return 0
    
    try:
        with open(manifest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, dict) and "mapping" in data:
            mapping = data["mapping"]
            count = len(mapping)
            print(f"  📄 Manifest entries: {count}")
            
            # Show first 10 entries
            sample = list(mapping.items())[:10]
            print(f"  📋 Sample entries:")
            for key, val in sample:
                print(f"    {key} → {val}.mp3")
            
            # Check if greet_hello exists
            if "greet_hello" in mapping:
                print(ok(f"  ✅ 'greet_hello' found → {mapping['greet_hello']}.mp3"))
            else:
                print(warn(f"  ⚠️ 'greet_hello' NOT in manifest"))
            
            return count
        else:
            print(err("Invalid manifest format"))
            return 0
    except Exception as e:
        print(err(f"Error reading manifest: {e}"))
        return 0

# ─── TEST 3: Check audio path consistency ──────────────────────────
def test_audio_paths():
    print(hdr("TEST 3 — AUDIO PATH CONSISTENCY"))
    
    audio_dir = ROOT / "public/audio/offline/hy_Ani"
    manifest_file = ROOT / "public/audio/offline/manifest_hy_ani.json"
    
    if not audio_dir.exists() or not manifest_file.exists():
        print(warn("Skipping - files missing"))
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
        print(err(f"  ❌ Missing MP3s: {len(missing)}"))
        print(f"    {', '.join(list(missing)[:10])}")
    else:
        print(ok("  ✅ All manifest entries have MP3 files"))
    
    if extra:
        print(warn(f"  ⚠️ Extra MP3s: {len(extra)}"))
        print(f"    {', '.join(list(extra)[:10])}")

# ─── TEST 4: Check OfflineAudioManager code ────────────────────────
def test_manager_code():
    print(hdr("TEST 4 — OfflineAudioManager CODE CHECK"))
    
    manager_file = ROOT / "src/lib/offline/OfflineAudioManager.ts"
    if not manager_file.exists():
        print(err("OfflineAudioManager.ts not found"))
        return
    
    code = manager_file.read_text(encoding='utf-8')
    
    checks = {
        "play method": r"async play\(",
        "getAudioUrl method": r"getAudioUrl\(",
        "volume handling": r"audio\.volume",
        "muted handling": r"this\.isMuted",
        "audioCache Map": r"audioCache.*Map",
        "combinedMapping": r"combinedMapping",
        "console.log in play": r"console\.log.*play",
    }
    
    print("  Checking OfflineAudioManager.ts:")
    for name, pattern in checks.items():
        if __import__('re').search(pattern, code):
            print(ok(f"  {name} — found"))
        else:
            print(warn(f"  {name} — NOT FOUND"))

# ─── TEST 5: Check page.tsx audio usage ────────────────────────────
def test_page_code():
    print(hdr("TEST 5 — page.tsx AUDIO USAGE"))
    
    page_file = ROOT / "src/app/learn/page.tsx"
    if not page_file.exists():
        print(err("page.tsx not found"))
        return
    
    code = page_file.read_text(encoding='utf-8')
    
    checks = {
        "playOfflineAudio function": r"playOfflineAudio",
        "offlineAudioManager import": r"offlineAudioManager",
        "setVolume called": r"setVolume",
        "setMuted called": r"setMuted",
        "showMessage on error": r"showMessage.*error",
    }
    
    print("  Checking page.tsx:")
    for name, pattern in checks.items():
        if __import__('re').search(pattern, code):
            print(ok(f"  {name} — found"))
        else:
            print(warn(f"  {name} — NOT FOUND"))

# ─── TEST 6: Check audio URL directly ──────────────────────────────
def test_audio_url():
    print(hdr("TEST 6 — AUDIO URL CHECK"))
    
    audio_id = "000001"
    audio_file = ROOT / f"public/audio/offline/hy_Ani/{audio_id}.mp3"
    
    if audio_file.exists():
        size = audio_file.stat().st_size
        print(ok(f"  {audio_id}.mp3 — exists ({size} bytes)"))
        
        # Check if it's a valid MP3
        try:
            with open(audio_file, 'rb') as f:
                header = f.read(4)
                if header == b'ID3' or header[:2] == b'\xff\xfb' or header[:2] == b'\xff\xf3':
                    print(ok(f"  MP3 header valid"))
                else:
                    print(warn(f"  MP3 header: {header.hex()} - may not be a valid MP3"))
        except Exception as e:
            print(warn(f"  Error reading file: {e}"))
    else:
        print(err(f"  {audio_id}.mp3 — NOT FOUND"))

# ─── TEST 7: Check combined mapping ────────────────────────────────
def test_mapping():
    print(hdr("TEST 7 — COMBINED MAPPING"))
    
    # Try to import the module
    try:
        sys.path.insert(0, str(ROOT))
        from src.lib.offline.OfflineAudioManager import offlineAudioManager
        
        # Check if initialized
        mapping = offlineAudioManager.getCombinedMapping()
        if mapping:
            count = len(mapping)
            print(ok(f"  Combined mapping has {count} entries"))
            
            # Check if greet_hello exists
            if "greet_hello" in mapping:
                print(ok(f"  ✅ 'greet_hello' → {mapping['greet_hello']}.mp3"))
            else:
                print(warn(f"  ⚠️ 'greet_hello' NOT in combined mapping"))
            
            # Show first 10
            sample = list(mapping.items())[:10]
            print(f"  📋 Sample: {', '.join([f'{k}→{v}' for k, v in sample])}")
        else:
            print(err("  ❌ Combined mapping is empty!"))
    except Exception as e:
        print(warn(f"  Could not load module: {e}"))

# ─── TEST 8: Check browser console commands ────────────────────────
def test_browser_commands():
    print(hdr("TEST 8 — BROWSER CONSOLE COMMANDS"))
    
    print("  Copy and paste these commands in browser console (F12):")
    print()
    print(f"{Y}  // 1. Check if audio file is accessible{X}")
    print(f"{Y}  fetch('/audio/offline/hy_Ani/000001.mp3'){X}")
    print(f"{Y}    .then(r => console.log('Status:', r.status)){X}")
    print(f"{Y}    .catch(e => console.error('Error:', e));{X}")
    print()
    print(f"{Y}  // 2. Try to play audio{X}")
    print(f"{Y}  const audio = new Audio('/audio/offline/hy_Ani/000001.mp3');{X}")
    print(f"{Y}  audio.volume = 1;{X}")
    print(f"{Y}  audio.play().then(() => console.log('✅ Playing!')).catch(e => console.error('❌', e));{X}")
    print()
    print(f"{Y}  // 3. Check offlineAudioManager{X}")
    print(f"{Y}  console.log('Has greet_hello:', offlineAudioManager.hasAudioKey('greet_hello', 'hy'));{X}")
    print(f"{Y}  offlineAudioManager.play('greet_hello', 'hy'){X}")
    print(f"{Y}    .then(() => console.log('✅ Played!')){X}")
    print(f"{Y}    .catch(e => console.error('❌', e));{X}")

# ─── FINAL REPORT ────────────────────────────────────────────────────
def print_summary(results):
    print(f"\n{W}{'═'*60}")
    print("   📊 AUDIO PLAYBACK DEBUG SUMMARY")
    print(f"{'═'*60}{X}")
    
    for key, value in results.items():
        print(f"  {key}: {value}")
    
    print(f"\n{info('💡 If all tests pass but audio still not playing:')}")
    print(f"  1. Check browser volume (not muted)")
    print(f"  2. Check system volume")
    print(f"  3. Check headphones/speakers")
    print(f"  4. Try a different browser")
    print(f"  5. Check if browser has autoplay blocked")

# ─── MAIN ────────────────────────────────────────────────────────────
def main():
    print(f"\n{W}🔍 AUDIO PLAYBACK DEBUGGER{X}")
    print(f"Root: {ROOT}\n")
    
    results = {}
    
    audio_count = test_audio_files()
    results["Audio files"] = audio_count
    
    manifest_count = test_manifest()
    results["Manifest entries"] = manifest_count
    
    test_audio_paths()
    test_manager_code()
    test_page_code()
    test_audio_url()
    test_mapping()
    test_browser_commands()
    
    print_summary(results)
    
    print(f"\n{info('💡 Run the browser console commands above to test')}")

if __name__ == "__main__":
    main()