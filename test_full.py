#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════╗
║     NUR LINGO — AUDIO SYSTEM FULL DIAGNOSTIC TESTER         ║
║     Դնել NURLingo-main/ պանակում և աշխատեցնել:             ║
║     python test_full.py                                     ║
╚══════════════════════════════════════════════════════════════╝
"""

import os, sys, json, re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.resolve()

# ─── Colors ──────────────────────────────────────────────────────────────────
G = "\033[92m"; R = "\033[91m"; Y = "\033[93m"; B = "\033[94m"; W = "\033[97m"; X = "\033[0m"
def ok(s):   return f"{G}✅ {s}{X}"
def err(s):  return f"{R}❌ {s}{X}"
def warn(s): return f"{Y}⚠️  {s}{X}"
def info(s): return f"{B}ℹ️  {s}{X}"
def hdr(s):  return f"\n{W}{'═'*60}\n   {s}\n{'═'*60}{X}"

results = {"pass": 0, "fail": 0, "warn": 0, "bugs": []}

def record(level, msg, detail=""):
    if level == "pass": results["pass"] += 1
    elif level == "fail":
        results["fail"] += 1
        results["bugs"].append(f"❌ {msg}" + (f"\n   └─ {detail}" if detail else ""))
    elif level == "warn":
        results["warn"] += 1
        results["bugs"].append(f"⚠️  {msg}" + (f"\n   └─ {detail}" if detail else ""))

# ─── TEST 1: File existence ───────────────────────────────────────────────────
def test_critical_files():
    print(hdr("TEST 1 — CRITICAL FILE EXISTENCE"))
    files = {
        "public/audio/offline/manifest_hy_ani.json": "HY manifest",
        "public/audio/offline/manifest_en_female.json": "EN manifest",
        "public/audio/offline/manifest_ru_female.json": "RU manifest",
        "public/audio/offline/manifest_index.json": "Master manifest index",
        "src/lib/audio/AudioManager.ts": "AudioManager",
        "src/lib/audio/AudioManifest.ts": "AudioManifest",
        "src/lib/hooks/useAudio.ts": "useAudio hook",
        "data/dictionaries/unified-dictionary.json": "Unified dictionary",
        "data/dictionaries/lesson-dictionary.json": "Lesson dictionary",
        "src/lib/lexicon/master-dictionary.json": "Master dictionary (or .fixed)",
        "next.config.js": "Next.js config",
        "tailwind.config.js": "Tailwind config",
    }
    # Check for master-dictionary variant
    for alt in ["src/lib/lexicon/master-dictionary.json",
                "src/lib/lexicon/master-dictionary.fixed.json"]:
        if (ROOT / alt).exists():
            files["src/lib/lexicon/master-dictionary.json"] = f"Master dictionary → {alt}"
            break

    for path, name in files.items():
        found = None
        for variant in [path, path.replace(".json", ".fixed.json")]:
            if (ROOT / variant).exists():
                found = variant
                break
        if found:
            size = (ROOT / found).stat().st_size
            print(ok(f"{name} ({size//1024}KB)"))
            record("pass", name)
        else:
            print(err(f"{name} — MISSING: {path}"))
            record("fail", f"Missing critical file: {name}", path)

# ─── TEST 2: Audio file counts ───────────────────────────────────────────────
def test_audio_counts():
    print(hdr("TEST 2 — AUDIO FILE COUNTS"))

    audio_dirs = {
        "public/audio/offline/hy_Ani": ("HY offline (hy_Ani)", 1000),
        "public/audio/offline/en_female": ("EN offline (en_female)", 1000),
        "public/audio/offline/ru_female": ("RU offline (ru_female)", 1000),
        "public/audio/offline_dictionary/hy": ("HY dictionary", 100),
        "public/audio/offline_dictionary/en": ("EN dictionary", 100),
        "public/audio/offline_dictionary/ru": ("RU dictionary", 100),
    }
    for rel, (label, min_count) in audio_dirs.items():
        d = ROOT / rel
        if not d.exists():
            print(err(f"{label} — DIR MISSING: {rel}"))
            record("fail", f"Audio dir missing: {label}", rel)
            continue
        mp3s = list(d.glob("*.mp3"))
        count = len(mp3s)
        tiny = [f for f in mp3s if f.stat().st_size < 2000]
        if count >= min_count and not tiny:
            print(ok(f"{label}: {count} MP3s"))
            record("pass", label)
        elif tiny:
            print(warn(f"{label}: {count} MP3s — {len(tiny)} CORRUPTED (<2KB)"))
            record("warn", f"{label}: {len(tiny)} corrupted files",
                   ", ".join(f.name for f in tiny[:5]))
        else:
            print(warn(f"{label}: only {count}/{min_count} expected"))
            record("warn", f"{label} low count: {count}", f"expected ≥{min_count}")

        nums = sorted(int(f.stem) for f in mp3s if f.stem.isdigit())
        if nums:
            expected = list(range(nums[0], nums[0] + min(100, len(nums))))
            actual = nums[:len(expected)]
            gaps = [n for n in expected if n not in actual]
            if gaps:
                print(warn(f"  Gaps in numbering: {gaps[:5]}..."))
                record("warn", f"{label}: numbering gaps", str(gaps[:5]))

# ─── TEST 3: Manifest integrity ───────────────────────────────────────────────
def test_manifests():
    print(hdr("TEST 3 — MANIFEST INTEGRITY"))

    manifests = {
        "public/audio/offline/manifest_hy_ani.json": ("hy_Ani", "public/audio/offline/hy_Ani"),
        "public/audio/offline/manifest_en_female.json": ("en_female", "public/audio/offline/en_female"),
        "public/audio/offline/manifest_ru_female.json": ("ru_female", "public/audio/offline/ru_female"),
    }

    for mpath, (lang, audio_rel) in manifests.items():
        mfile = ROOT / mpath
        if not mfile.exists():
            print(err(f"Manifest missing: {mpath}"))
            record("fail", f"Manifest missing: {lang}", mpath)
            continue

        try:
            with open(mfile, encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception as e:
            print(err(f"Manifest parse error ({lang}): {e}"))
            record("fail", f"Manifest JSON invalid: {lang}", str(e))
            continue

        if isinstance(manifest, dict) and "mapping" in manifest:
            mapping = manifest["mapping"]
        elif isinstance(manifest, dict):
            mapping = manifest
        elif isinstance(manifest, list):
            mapping = {str(i): v for i, v in enumerate(manifest)}
        else:
            print(err(f"Unknown manifest schema: {lang}"))
            record("fail", f"Unknown manifest schema: {lang}")
            continue

        total = len(mapping)
        audio_dir = ROOT / audio_rel
        mp3s = set(f.stem for f in audio_dir.glob("*.mp3")) if audio_dir.exists() else set()

        missing_files = []
        empty_entries = []
        for key, val in list(mapping.items())[:500]:
            if isinstance(val, dict):
                aid = val.get("audioId") or val.get("id") or key
            elif isinstance(val, str):
                aid = val.replace(".mp3", "").split("/")[-1]
            else:
                aid = str(key).zfill(6)

            padded = str(aid).zfill(6)
            if padded not in mp3s and aid not in mp3s:
                missing_files.append(f"{key} → {padded}.mp3")

        miss_count = len(missing_files)
        print(f"  {lang}: {total} entries, {len(mp3s)} MP3s")
        if miss_count == 0:
            print(ok(f"  {lang} manifest: all checked entries have matching MP3s"))
            record("pass", f"Manifest {lang} integrity")
        elif miss_count < total * 0.1:
            print(warn(f"  {lang}: {miss_count} missing MP3 references"))
            record("warn", f"Manifest {lang}: {miss_count} missing", str(missing_files[:3]))
        else:
            print(err(f"  {lang}: {miss_count}/{min(500,total)} entries missing MP3"))
            record("fail", f"Manifest {lang}: major sync issue", str(missing_files[:3]))

# ─── TEST 4: Dictionary integrity ─────────────────────────────────────────────
def test_dictionaries():
    print(hdr("TEST 4 — DICTIONARY INTEGRITY"))

    master_path = None
    for p in ["src/lib/lexicon/master-dictionary.fixed.json",
              "src/lib/lexicon/master-dictionary.json",
              "data/dictionaries/unified-dictionary.json"]:
        if (ROOT / p).exists():
            master_path = p
            break

    if not master_path:
        print(err("No master dictionary found!"))
        record("fail", "Master dictionary missing")
        return

    with open(ROOT / master_path, encoding="utf-8") as f:
        d = json.load(f)

    if isinstance(d, list):
        entries = d
        schema = "list"
    elif isinstance(d, dict):
        entries = list(d.values())
        schema = "dict"
    else:
        print(err("Unknown dictionary schema"))
        record("fail", "Dictionary unknown schema")
        return

    total = len(entries)
    has_audio_id = sum(1 for e in entries if isinstance(e, dict) and e.get("audioId"))
    has_hy = sum(1 for e in entries if isinstance(e, dict) and e.get("hy"))
    has_en = sum(1 for e in entries if isinstance(e, dict) and e.get("en"))
    has_ru = sum(1 for e in entries if isinstance(e, dict) and e.get("ru"))
    has_audio_paths = sum(1 for e in entries if isinstance(e, dict) and isinstance(e.get("audio"), dict) and e["audio"])

    print(f"  Schema: {schema}, Entries: {total}")
    print(f"  HY: {has_hy}/{total}  EN: {has_en}/{total}  RU: {has_ru}/{total}")
    print(f"  audioId: {has_audio_id}/{total}  audio paths: {has_audio_paths}/{total}")

    issues = []
    if has_audio_id == 0:
        issues.append("NO audioId fields — code cannot resolve MP3 paths")
        record("fail", "Dictionary missing audioId", master_path)
        print(err("  ❌ audioId: 0 — CRITICAL BUG"))
    elif has_audio_id < total * 0.9:
        issues.append(f"Only {has_audio_id}/{total} have audioId")
        record("warn", f"Dictionary partial audioId: {has_audio_id}/{total}")
        print(warn(f"  Partial audioId: {has_audio_id}/{total}"))
    else:
        record("pass", "Dictionary audioId")
        print(ok(f"  audioId present in {has_audio_id}/{total}"))

    if has_audio_paths == 0:
        print(err("  ❌ audio paths: 0 — dictionary not linked to MP3s"))
        record("fail", "Dictionary has no audio path references", master_path)
    elif has_audio_paths < total * 0.5:
        print(warn(f"  audio paths only in {has_audio_paths}/{total}"))
        record("warn", f"Dictionary partial audio paths", master_path)
    else:
        print(ok(f"  audio paths: {has_audio_paths}/{total}"))
        record("pass", "Dictionary audio paths")

# ─── TEST 5: AudioManager source code analysis ────────────────────────────────
def test_audio_manager():
    print(hdr("TEST 5 — AUDIOMANAGER CODE ANALYSIS"))

    am_path = ROOT / "src/lib/audio/AudioManager.ts"
    if not am_path.exists():
        print(err("AudioManager.ts not found"))
        record("fail", "AudioManager.ts missing")
        return

    code = am_path.read_text(encoding="utf-8")

    checks = {
        "HEAD check before play": [r"HEAD", r"method.*HEAD", r"fetch.*HEAD"],
        "MP3 fallback to TTS": [r"fallback", r"BrowserTTS", r"speechSynthesis"],
        "Error handling (no throw)": [r"catch", r"try\s*{"],
        "audioId usage": [r"audioId", r"options\.id", r"opts\.id"],
        "padStart(6": [r"padStart\(6", r"padStart\(\s*6", r"\.padStart"],
        "console.warn (not error)": [r"console\.warn"],
        "No console.error": [r"console\.error"],
    }

    for check, patterns in checks.items():
        found = any(re.search(p, code, re.IGNORECASE) for p in patterns)
        if check == "No console.error":
            errors = len(re.findall(r"console\.error", code))
            if errors > 0:
                print(warn(f"  console.error called {errors}x (should use .warn)"))
                record("warn", f"AudioManager uses console.error {errors}x",
                       "Replace with console.warn to avoid polluting console")
            else:
                print(ok("  No console.error (clean console)"))
                record("pass", "No console.error in AudioManager")
        elif found:
            print(ok(f"  {check}"))
            record("pass", f"AudioManager: {check}")
        else:
            print(err(f"  {check} — NOT FOUND"))
            record("fail", f"AudioManager missing: {check}", am_path.name)

# ─── TEST 6: Path consistency check ───────────────────────────────────────────
def test_path_consistency():
    print(hdr("TEST 6 — AUDIO PATH CONSISTENCY"))

    for fname in ["AudioProviders.ts", "AudioManager.ts", "AudioManifest.ts"]:
        fpath = ROOT / "src/lib/audio" / fname
        if not fpath.exists():
            continue
        code = fpath.read_text(encoding="utf-8")
        urls = re.findall(r'`[^`]*audio[^`]*`', code)
        if urls:
            print(f"  URL patterns in {fname}:")
            for u in urls[:5]:
                print(f"    {u}")
            if any(r"/audio/${lang}/${" in u or r"/audio/offline/" in u for u in urls):
                print(ok(f"  {fname}: uses correct /audio/... path"))
                record("pass", f"Path format in {fname}")
            else:
                print(warn(f"  {fname}: unusual path format"))
                record("warn", f"Unusual URL format in {fname}", str(urls[:2]))

    oe = ROOT / "src/lib/offline/OfflineAudioEngine.ts"
    if oe.exists():
        code = oe.read_text(encoding="utf-8")
        offline_paths = re.findall(r"'/audio/[^']+/'", code)
        correct = [p for p in offline_paths if "offline" in p]
        wrong = [p for p in offline_paths if "offline" not in p]
        print(f"  OfflineAudioEngine offline paths: {correct[:3]}")
        if wrong:
            print(warn(f"  Non-offline paths in OfflineAudioEngine: {wrong[:3]}"))
            record("warn", "OfflineAudioEngine has non-offline paths", str(wrong[:2]))
        else:
            print(ok("  OfflineAudioEngine paths look correct"))
            record("pass", "OfflineAudioEngine paths")

# ─── TEST 7: learn/page.tsx audio usage ───────────────────────────────────────
def test_learn_page():
    print(hdr("TEST 7 — LEARN PAGE AUDIO USAGE"))

    lp = ROOT / "src/app/learn/page.tsx"
    if not lp.exists():
        print(err("learn/page.tsx not found"))
        record("fail", "learn/page.tsx missing")
        return

    code = lp.read_text(encoding="utf-8")

    checks = {
        "Uses useAudio or useAudioManager": [r"useAudio", r"AudioManager", r"audioManager"],
        "Does NOT use speechSynthesis directly": [r"speechSynthesis"],
        "Passes audioId to play": [r"audioId", r"entry\.audioId", r"word\.audioId"],
        "Has Suspense wrapper": [r"Suspense"],
        "Has error boundary / try-catch": [r"catch", r"try\s*{"],
    }

    for check, patterns in checks.items():
        found = any(re.search(p, code, re.IGNORECASE) for p in patterns)
        if check == "Does NOT use speechSynthesis directly":
            if found:
                count = len(re.findall(r"speechSynthesis", code))
                print(warn(f"  Direct speechSynthesis usage ({count}x) — bypasses AudioService"))
                record("warn", "learn/page.tsx bypasses AudioService with direct speechSynthesis",
                       f"Found {count} occurrences — should use AudioService.play() instead")
            else:
                print(ok("  No direct speechSynthesis (uses AudioService)"))
                record("pass", "learn/page.tsx uses AudioService")
        elif found:
            print(ok(f"  {check}"))
            record("pass", f"learn/page: {check}")
        else:
            print(warn(f"  {check} — not detected"))
            record("warn", f"learn/page: {check} not found")

# ─── TEST 8: dictionary/page.tsx audio ────────────────────────────────────────
def test_dictionary_page():
    print(hdr("TEST 8 — DICTIONARY PAGE AUDIO"))

    dp = ROOT / "src/app/dictionary/page.tsx"
    if not dp.exists():
        print(err("dictionary/page.tsx not found"))
        record("fail", "dictionary/page.tsx missing")
        return

    code = dp.read_text(encoding="utf-8")

    checks = {
        "Play button per language": [r"play.*hy", r"play.*en", r"play.*ru", r"🔊"],
        "Back to top button": [r"scrollTo", r"scrollIntoView", r"top.*btn", r"↑"],
        "Search/filter": [r"search", r"filter", r"query"],
        "Loads from manifest or API": [r"manifest", r"/api/lexicon", r"fetch"],
        "Audio via AudioService or hook": [r"AudioService", r"useAudio", r"useAudioManager"],
    }

    for check, patterns in checks.items():
        found = any(re.search(p, code, re.IGNORECASE) for p in patterns)
        if found:
            print(ok(f"  {check}"))
            record("pass", f"dictionary/page: {check}")
        else:
            print(warn(f"  {check} — not detected"))
            record("warn", f"dictionary/page: {check} not found")

# ─── TEST 9: generate_hy_audio.py ─────────────────────────────────────────────
def test_audio_scripts():
    print(hdr("TEST 9 — AUDIO GENERATION SCRIPTS"))

    scripts = {
        "scripts/generate_hy_audio.py": "HY audio generator",
        "scripts/generate_hy_audio_speechgen_auto.py": "SpeechGen auto generator",
    }

    for path, name in scripts.items():
        fpath = ROOT / path
        if not fpath.exists():
            found = list(ROOT.rglob(Path(path).name))
            if found:
                fpath = found[0]
                print(info(f"  {name} found at: {fpath.relative_to(ROOT)}"))
            else:
                print(warn(f"  {name} not found at {path}"))
                record("warn", f"Script not found: {name}", path)
                continue

        code = fpath.read_text(encoding="utf-8")

        email_bug = re.search(r'"email":\s*[a-zA-Z][^\s",]+@[^\s",]+\s*,', code)
        if email_bug:
            print(err(f"  {name}: EMAIL BUG — missing quotes: {email_bug.group()}"))
            record("fail", f"{name}: email field missing quotes (script will crash)",
                   f'Fix: change to "email": "arcaxa305@gmail.com",')
        else:
            print(ok(f"  {name}: email field OK"))
            record("pass", f"{name}: no email bug")

        if "public/audio/hy" in code or "offline/hy" in code:
            print(ok(f"  {name}: outputs to correct audio directory"))
            record("pass", f"{name}: correct output path")
        else:
            print(warn(f"  {name}: output path unclear"))
            record("warn", f"{name}: output directory not detected in code")

# ─── TEST 10: Build check (TypeScript errors) ─────────────────────────────────
def test_typescript():
    print(hdr("TEST 10 — TYPESCRIPT QUICK CHECK"))

    tsconfig = ROOT / "tsconfig.json"
    if not tsconfig.exists():
        print(err("tsconfig.json not found"))
        record("fail", "tsconfig.json missing")
        return

    import subprocess
    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--pretty", "false"],
            cwd=str(ROOT), capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0:
            print(ok("TypeScript: no errors"))
            record("pass", "TypeScript clean")
        else:
            errors = result.stdout.strip().split('\n')
            error_count = len([l for l in errors if "error TS" in l])
            print(err(f"TypeScript: {error_count} errors"))
            codes = set(re.findall(r"TS\d+", result.stdout))
            print(f"  Error codes: {', '.join(sorted(codes)[:10])}")
            for line in errors[:8]:
                if "error TS" in line:
                    print(f"  {line.strip()}")
            record("fail", f"TypeScript: {error_count} compilation errors",
                   "; ".join(list(codes)[:5]))
    except subprocess.TimeoutExpired:
        print(warn("TypeScript check timed out (60s)"))
        record("warn", "TypeScript check timeout")
    except FileNotFoundError:
        print(warn("npx not found — skipping TypeScript check"))
        record("warn", "npx not available for TypeScript check")

# ─── FINAL REPORT ─────────────────────────────────────────────────────────────
def print_report():
    print(f"\n{W}{'═'*60}")
    print("   🍎 NUR LINGO AUDIO DIAGNOSTIC REPORT")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═'*60}{X}")
    print(f"\n  {G}✅ PASS: {results['pass']}{X}")
    print(f"  {Y}⚠️  WARN: {results['warn']}{X}")
    print(f"  {R}❌ FAIL: {results['fail']}{X}")

    total = results['pass'] + results['warn'] + results['fail']
    score = int((results['pass'] / total) * 100) if total > 0 else 0
    bar = "█" * (score // 5) + "░" * (20 - score // 5)
    color = G if score >= 80 else Y if score >= 60 else R
    print(f"\n  Score: {color}[{bar}] {score}%{X}\n")

    if results["bugs"]:
        print(f"{W}{'─'*60}")
        print("   BUGS & WARNINGS TO FIX")
        print(f"{'─'*60}{X}")
        for bug in results["bugs"]:
            print(f"\n  {bug}")

    report_path = ROOT / "audio-diagnostic-report.txt"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"NUR LINGO AUDIO DIAGNOSTIC REPORT\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Root: {ROOT}\n\n")
        f.write(f"PASS: {results['pass']}  WARN: {results['warn']}  FAIL: {results['fail']}\n")
        f.write(f"Score: {score}%\n\n")
        if results["bugs"]:
            f.write("BUGS & WARNINGS:\n")
            for bug in results["bugs"]:
                f.write(f"\n{bug}\n")

    print(f"\n  💾 Report saved: audio-diagnostic-report.txt\n")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n{W}NUR LINGO — AUDIO SYSTEM DIAGNOSTIC{X}")
    print(f"Root: {ROOT}\n")

    test_critical_files()
    test_audio_counts()
    test_manifests()
    test_dictionaries()
    test_audio_manager()
    test_path_consistency()
    test_learn_page()
    test_dictionary_page()
    test_audio_scripts()
    test_typescript()
    print_report()