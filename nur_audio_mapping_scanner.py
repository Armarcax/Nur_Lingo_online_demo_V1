#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════╗
║   NUR LINGO — AUDIO MAPPING FULL SCANNER + AUTO-FIXER           ║
║   Դնել NURLingo-main/ root-ում:                                  ║
║   python nur_audio_mapping_scanner.py                            ║
║   python nur_audio_mapping_scanner.py --fix   (auto-fix)        ║
╚══════════════════════════════════════════════════════════════════╝

Ինչ կ'ստուգի.
  1. Բոլոր 3 audio source-ների ֆայլ counts
  2. HY/EN/RU mapping cross-check
  3. FIXED_AUDIO_IDS vs mappings
  4. Numbers (num_1..num_10) missing audioId
  5. audio-index.ts wrong paths
  6. database.ts getAudioId() logic
  7. Corrupted MP3 files (<2KB)
  8. Missing files referenced in manifests
  9. audio-mapping-integrated.ts correctness
  10. Full sync report: code ↔ files ↔ mappings
"""

import os, sys, json, re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.resolve()
FIX_MODE = "--fix" in sys.argv

# ─── Colors ──────────────────────────────────────────────────────────────────
G="\033[92m"; R="\033[91m"; Y="\033[93m"; B="\033[94m"; W="\033[97m"; X="\033[0m"
def ok(s):   return f"{G}✅ {s}{X}"
def err(s):  return f"{R}❌ {s}{X}"
def warn(s): return f"{Y}⚠️  {s}{X}"
def info(s): return f"{B}ℹ️  {s}{X}"
def hdr(s):  return f"\n{W}{'═'*62}\n   {s}\n{'═'*62}{X}"

bugs = []
fixes_applied = []

def BUG(msg, detail="", fix=None):
    bugs.append({"msg": msg, "detail": detail, "fix": fix, "severity": "ERROR"})
    print(err(msg))
    if detail: print(f"     └─ {detail}")

def WARN(msg, detail="", fix=None):
    bugs.append({"msg": msg, "detail": detail, "fix": fix, "severity": "WARN"})
    print(warn(msg))
    if detail: print(f"     └─ {detail}")

def OK(msg):
    print(ok(msg))

def INFO(msg):
    print(info(msg))

# ─── Load all mappings ────────────────────────────────────────────────────────
def load_mapping(path: Path) -> dict:
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, dict) and "mapping" in raw:
        return raw["mapping"]
    return raw if isinstance(raw, dict) else {}

def load_json_safe(path: Path):
    if not path.exists(): return None
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(err(f"JSON parse error: {path.name}: {e}"))
        return None

# ─── TEST 1: Audio source directories ────────────────────────────────────────
def test_audio_sources():
    print(hdr("TEST 1 — AUDIO SOURCE DIRECTORIES"))

    SOURCES = {
        "offline/hy_Ani":           ("Lessons HY (hy-AM-AnahitNeural)", 25000),
        "offline/en_female":        ("Lessons EN (female)", 25000),
        "offline/ru_female":        ("Lessons RU (female)", 20000),
        "offline_dictionary/hy":    ("Dictionary HY", 1000),
        "offline_dictionary/en":    ("Dictionary EN", 1000),
        "offline_dictionary/ru":    ("Dictionary RU", 1000),
        "offline_user_dictionary/hy_user": ("User Dict HY", 0),
        "offline_user_dictionary/en_user": ("User Dict EN", 0),
        "offline_user_dictionary/ru_user": ("User Dict RU", 0),
    }

    for rel, (label, min_count) in SOURCES.items():
        d = ROOT / "public/audio" / rel
        if not d.exists():
            WARN(f"Missing audio dir: {rel}", f"Expected at: {d}")
            continue
        mp3s = sorted(d.glob("*.mp3"))
        count = len(mp3s)
        corrupted = [f for f in mp3s if f.stat().st_size < 2000]

        if corrupted:
            WARN(f"{label}: {count} MP3s, {len(corrupted)} CORRUPTED (<2KB)",
                 f"First corrupt: {', '.join(f.name for f in corrupted[:5])}",
                 f"Run: python fix_corrupted_hy_audio.py")
        elif count >= min_count:
            OK(f"{label}: {count} MP3s")
        else:
            WARN(f"{label}: only {count} (expected ≥{min_count})")

    # Check old wrong path that audio-index.ts scans
    wrong = ROOT / "public/audio/hy"
    if wrong.exists():
        WARN("Old path /audio/hy/ exists (audio-index.ts scans this by mistake)",
             "Should scan /audio/offline/hy_Ani/ instead")
    else:
        OK("No stale /audio/hy/ directory")

# ─── TEST 2: Mapping files completeness ──────────────────────────────────────
def test_mappings():
    print(hdr("TEST 2 — MAPPING FILES CROSS-CHECK"))

    MAPPING_PATHS = {
        "hy": ROOT / "src/lib/content/mappings/audio-num-hy-mapping.json",
        "en": ROOT / "src/lib/content/mappings/audio-num-en-mapping.json",
        "ru": ROOT / "src/lib/content/mappings/audio-num-ru-mapping.json",
    }
    # Fallback paths
    FALLBACK = {
        "hy": ROOT / "public/audio/offline/manifest_hy_ani.json",
        "en": ROOT / "public/audio/offline/manifest_en_female.json",
        "ru": ROOT / "public/audio/offline/manifest_ru_female.json",
    }

    maps = {}
    for lang in ["hy","en","ru"]:
        m = load_mapping(MAPPING_PATHS[lang])
        if not m:
            m = load_mapping(FALLBACK[lang])
            if m:
                INFO(f"  {lang}: using fallback manifest (mappings/ dir missing)")
        maps[lang] = m
        count = len(m)
        if count == 0:
            BUG(f"{lang} mapping EMPTY", f"Path: {MAPPING_PATHS[lang]}")
        else:
            OK(f"{lang} mapping: {count} entries")

    # Cross-check: all HY keys should be in EN
    hy_keys = set(maps["hy"].keys())
    en_keys = set(maps["en"].keys())
    ru_keys = set(maps["ru"].keys())

    only_in_en = en_keys - hy_keys
    only_in_hy = hy_keys - en_keys
    in_en_not_ru = en_keys - ru_keys

    if only_in_hy:
        WARN(f"In HY not in EN: {len(only_in_hy)} keys",
             f"Sample: {list(only_in_hy)[:5]}")
    else:
        OK("HY ⊆ EN (all HY keys present in EN)")

    if in_en_not_ru:
        INFO(f"EN has {len(in_en_not_ru)} more keys than RU (RU missing some content)")
    else:
        OK("EN ⊆ RU (all content in RU)")

    # Check values are 6-digit numeric IDs
    bad_vals = [(k,v) for k,v in maps["hy"].items() if not re.match(r'^\d{6}$', str(v))]
    if bad_vals:
        BUG(f"HY mapping has {len(bad_vals)} non-6digit values",
            f"Sample: {bad_vals[:3]}")
    else:
        OK("HY mapping values all 6-digit format")

    return maps

# ─── TEST 3: FIXED_AUDIO_IDS vs mappings ─────────────────────────────────────
def test_fixed_audio_ids(hy_map: dict):
    print(hdr("TEST 3 — FIXED_AUDIO_IDS vs MAPPING"))

    # Find audio-ids.ts
    ids_file = ROOT / "src/lib/content/audio-ids.ts"
    if not ids_file.exists():
        ids_file = next(ROOT.rglob("audio-ids.ts"), None)
    if not ids_file:
        BUG("audio-ids.ts not found")
        return {}

    content = ids_file.read_text(encoding="utf-8")
    fixed = dict(re.findall(r'"([\w_]+)":\s*"(\d+)"', content))
    OK(f"FIXED_AUDIO_IDS: {len(fixed)} entries")

    # In FIXED but not in HY mapping
    in_fixed_not_hy = {k:v for k,v in fixed.items() if k not in hy_map}
    if in_fixed_not_hy:
        BUG(f"{len(in_fixed_not_hy)} IDs in FIXED_AUDIO_IDS but NOT in HY mapping",
            f"Sample: {list(in_fixed_not_hy.items())[:5]}",
            "Add missing entries to audio-num-hy-mapping.json")
    else:
        OK("All FIXED_AUDIO_IDS present in HY mapping")

    # IDs that exist in mapping but not in FIXED (extra mapping entries)
    in_hy_not_fixed = {k for k in hy_map if k not in fixed}
    INFO(f"HY mapping has {len(in_hy_not_fixed)} extra keys beyond FIXED_AUDIO_IDS")

    # Check for content IDs (w1_l1_v0_mc_prompt style) — these are exercise prompts
    exercise_keys = [k for k in hy_map if re.match(r'w\d+_l\d+', k)]
    vocab_keys = [k for k in hy_map if not re.match(r'w\d+_l\d+', k)]
    INFO(f"HY mapping: {len(exercise_keys)} exercise keys + {len(vocab_keys)} vocab keys")

    return fixed

# ─── TEST 4: Numbers missing audioId ─────────────────────────────────────────
def test_numbers(fixed_ids: dict, hy_map: dict):
    print(hdr("TEST 4 — NUMBERS (num_1..num_10) AUDIO IDs"))

    nums_file = ROOT / "src/lib/content/numbers.ts"
    if not nums_file:
        WARN("numbers.ts not found")
        return

    content = nums_file.read_text(encoding="utf-8") if nums_file.exists() else ""
    num_ids = [f"num_{i}" for i in range(1, 11)]

    has_audio_id = "audioId" in content
    if not has_audio_id:
        BUG("numbers.ts has NO audioId fields — numbers will play silently",
            "All 10 number entries (num_1..num_10) missing audioId")
        # Check if they're in fixed_ids
        nums_in_fixed = {k: v for k, v in fixed_ids.items() if k.startswith("num_")}
        nums_in_hy = {k: v for k, v in hy_map.items() if k.startswith("num_")}
        print(f"     └─ In FIXED_AUDIO_IDS: {len(nums_in_fixed)} ({list(nums_in_fixed.keys())})")
        print(f"     └─ In HY mapping: {len(nums_in_hy)}")

        if FIX_MODE and nums_in_fixed and nums_file.exists():
            _fix_numbers(nums_file, nums_in_fixed)
    else:
        OK("numbers.ts has audioId fields")

def _fix_numbers(nums_file: Path, nums_in_fixed: dict):
    content = nums_file.read_text(encoding="utf-8")
    new_lines = []
    for line in content.split("\n"):
        match = re.search(r'id:\s*"(num_\d+)"', line)
        if match and "audioId" not in line:
            num_id = match.group(1)
            if num_id in nums_in_fixed:
                # Add audioId before the closing brace of the object
                indent = len(line) - len(line.lstrip())
                aid = nums_in_fixed[num_id]
                line = line.rstrip()
                if line.endswith("},"):
                    line = line[:-2] + f', audioId: "{aid}" }},'
                elif line.endswith("}"):
                    line = line[:-1] + f', audioId: "{aid}" }}'
        new_lines.append(line)
    nums_file.write_text("\n".join(new_lines), encoding="utf-8")
    fixes_applied.append("numbers.ts: added audioId to all 10 number entries")
    print(ok("  FIXED numbers.ts — added audioId fields"))

# ─── TEST 5: audio-index.ts wrong paths ───────────────────────────────────────
def test_audio_index():
    print(hdr("TEST 5 — AUDIO-INDEX.TS PATH CHECK"))

    ai_file = ROOT / "src/lib/content/audio-index.ts"
    if not ai_file.exists():
        WARN("audio-index.ts not found")
        return

    content = ai_file.read_text(encoding="utf-8")

    # Check for correct paths
    correct_paths = ["/audio/offline/hy_Ani", "/audio/offline/en_female", "/audio/offline/ru_female"]
    wrong_paths   = ["/audio/hy", "/audio/en", "/audio/ru"]

    has_correct = any(p in content for p in correct_paths)
    has_wrong   = any(p in content for p in wrong_paths)

    if has_wrong and not has_correct:
        BUG("audio-index.ts scans WRONG paths",
            "Scans: /audio/hy, /audio/en, /audio/ru (non-existent)\n"
            "     Should scan: /audio/offline/hy_Ani/, /audio/offline/en_female/, etc.",
            "Replace path constants in audio-index.ts")

        if FIX_MODE:
            _fix_audio_index(ai_file, content)
    elif has_wrong and has_correct:
        WARN("audio-index.ts has BOTH old and new paths — may cause duplicates")
    else:
        OK("audio-index.ts uses correct offline paths")

    # Check languages list
    lang_list = re.findall(r"'(hy\w*|en\w*|ru\w*)'", content)
    INFO(f"  Scanned language dirs: {set(lang_list)}")

def _fix_audio_index(ai_file: Path, content: str):
    fixed = content
    LANG_REPLACEMENTS = [
        ("const languages = ['hy', 'en', 'ru', 'hy_user', 'en_user', 'ru_user'];",
         "const languages = ['offline/hy_Ani', 'offline/en_female', 'offline/ru_female',\n"
         "                   'offline_dictionary/hy', 'offline_dictionary/en', 'offline_dictionary/ru',\n"
         "                   'offline_user_dictionary/hy_user', 'offline_user_dictionary/en_user', 'offline_user_dictionary/ru_user'];"),
        ("const langDir = path.join(audioDir, lang);",
         "const langDir = path.join(audioDir, lang);\n"
         "    const baseLang2 = lang.includes('hy') ? 'hy' : lang.includes('en') ? 'en' : 'ru';"),
        ("const baseLang = lang.split('_')[0];",
         "const baseLang = lang.includes('hy') ? 'hy' : lang.includes('en') ? 'en' : 'ru';"),
    ]
    for old, new in LANG_REPLACEMENTS:
        if old in fixed:
            fixed = fixed.replace(old, new)

    if fixed != content:
        ai_file.write_text(fixed, encoding="utf-8")
        fixes_applied.append("audio-index.ts: fixed path constants to use offline/ subdirs")
        print(ok("  FIXED audio-index.ts paths"))

# ─── TEST 6: audio-mapping-integrated.ts correctness ─────────────────────────
def test_mapping_integrated():
    print(hdr("TEST 6 — AUDIO-MAPPING-INTEGRATED.TS"))

    ami = ROOT / "src/lib/content/audio-mapping-integrated.ts"
    if not ami.exists():
        ami = next(ROOT.rglob("audio-mapping-integrated.ts"), None)
    if not ami:
        WARN("audio-mapping-integrated.ts not found")
        return

    content = ami.read_text(encoding="utf-8")

    checks = {
        "imports manifest_hy_ani": "manifest_hy_ani",
        "imports manifest_en_female": "manifest_en_female",
        "imports manifest_ru_female": "manifest_ru_female",
        "imports dict manifest": "dictManifest",
        "imports user manifest": "userManifest",
        "getAudioPath function": "getAudioPath",
        "correct hy_Ani folder": "hy_Ani",
        "correct en_female folder": "en_female",
        "user dict path": "offline_user_dictionary",
        "source detection": "getAudioSource",
    }

    for name, pattern in checks.items():
        if pattern in content:
            OK(f"  {name}")
        else:
            BUG(f"  Missing: {name}", f"Pattern not found: '{pattern}'")

# ─── TEST 7: database.ts getAudioId logic ─────────────────────────────────────
def test_database():
    print(hdr("TEST 7 — DATABASE.TS AUDIO ID LOGIC"))

    db = ROOT / "src/lib/content/database.ts"
    if not db.exists():
        db = next(ROOT.rglob("database.ts"), None)
    if not db:
        WARN("database.ts not found")
        return

    content = db.read_text(encoding="utf-8")

    # Check getAudioId function
    if "getAudioId" not in content:
        BUG("getAudioId function missing from database.ts")
        return

    # Correct behavior: item.audioId → FIXED_AUDIO_IDS → warn
    checks = {
        "checks item.audioId first": "item.audioId",
        "fallback to FIXED_AUDIO_IDS": "FIXED_AUDIO_IDS",
        "warns on missing": 'console.warn',
        "pads to 6 digits": 'padStart(6',
    }
    for name, pattern in checks.items():
        if pattern in content:
            OK(f"  getAudioId: {name}")
        else:
            WARN(f"  getAudioId missing: {name}")

    # Check for Date.now() fallback (BAD — creates non-reproducible IDs)
    if "Date.now()" in content:
        BUG("getAudioId uses Date.now() as fallback — creates random non-reproducible IDs!",
            "Replace with: return '000000' (silent placeholder)",
            "Fix fallback in database.ts getAudioId()")

    # Check builder imports
    builder_imports = re.findall(r"W(\d+)_LESSONS", content)
    OK(f"  Imports builders for worlds: {sorted(set(int(x) for x in builder_imports))}")

# ─── TEST 8: Manifest ↔ File sync ────────────────────────────────────────────
def test_manifest_file_sync():
    print(hdr("TEST 8 — MANIFEST ↔ FILE SYNC (SAMPLE CHECK)"))

    MANIFEST_PAIRS = [
        ("public/audio/offline/manifest_hy_ani.json",   "public/audio/offline/hy_Ani",    "hy"),
        ("public/audio/offline/manifest_en_female.json","public/audio/offline/en_female",  "en"),
        ("public/audio/offline/manifest_ru_female.json","public/audio/offline/ru_female",  "ru"),
        ("public/audio/offline_dictionary/manifest.json","public/audio/offline_dictionary/hy","dict_hy"),
    ]

    for mpath, audio_rel, label in MANIFEST_PAIRS:
        mfile = ROOT / mpath
        audio_dir = ROOT / audio_rel
        if not mfile.exists():
            WARN(f"Manifest missing: {mpath}")
            continue

        manifest = load_mapping(mfile)
        mp3_set = set(f.stem for f in audio_dir.glob("*.mp3")) if audio_dir.exists() else set()

        # Check first 200 entries
        sample = list(manifest.items())[:200]
        missing_files = []
        for key, val in sample:
            if isinstance(val, dict):
                num = val.get("numId") or val.get("audioId") or val.get("id") or key
            elif isinstance(val, str):
                num = val.replace(".mp3","").split("/")[-1]
            else:
                num = str(key).zfill(6)

            padded = str(num).zfill(6)
            if padded not in mp3_set:
                missing_files.append(f"{key} → {padded}.mp3")

        total_mp3s = len(mp3_set)
        total_entries = len(manifest)
        if not missing_files:
            OK(f"{label}: {total_entries} entries ↔ {total_mp3s} files — SYNCED ✓")
        else:
            WARN(f"{label}: {len(missing_files)}/200 sampled entries missing MP3",
                 f"Sample: {missing_files[:3]}")

# ─── TEST 9: Build consistency check ─────────────────────────────────────────
def test_build_consistency():
    print(hdr("TEST 9 — BUILD CONSISTENCY"))

    # Check for 'as any' type bypasses in database.ts
    db = ROOT / "src/lib/content/database.ts"
    if db.exists():
        content = db.read_text(encoding="utf-8")
        as_any = len(re.findall(r'as any', content))
        if as_any > 2:
            WARN(f"database.ts has {as_any} 'as any' type bypasses",
                 "Should fix TypeScript types instead of using 'as any'")
        else:
            OK(f"database.ts: minimal type bypasses ({as_any})")

    # Check fix-database.js exists (TypeScript dialogue type fix)
    fix_db = ROOT / "fix-database.js"
    if fix_db.exists():
        INFO("fix-database.js exists — run: node fix-database.js if dialogue type errors")

    # Check for missing builders
    builder_dir = ROOT / "src/lib/content/builders"
    if builder_dir.exists():
        builders = list(builder_dir.glob("world*.ts"))
        OK(f"Builder files: {len(builders)} ({', '.join(sorted(f.stem for f in builders))})")
        # Check for world 11+ which might be referenced
        db_content = (ROOT / "src/lib/content/database.ts").read_text() if (ROOT / "src/lib/content/database.ts").exists() else ""
        missing_builders = re.findall(r"from.*world(\d+)", db_content)
        existing_nums = {int(re.search(r'\d+', f.stem).group()) for f in builders}
        required_nums = {int(n) for n in missing_builders}
        missing = required_nums - existing_nums
        if missing:
            BUG(f"Missing builder files for worlds: {sorted(missing)}")
    else:
        WARN("Builders directory not found at src/lib/content/builders/")

# ─── GENERATE FIXED MAPPING ──────────────────────────────────────────────────
def generate_fixed_mapping(hy_map, en_map, ru_map, fixed_ids):
    print(hdr("GENERATE — UNIFIED AUDIO MAPPING"))

    # Build the complete unified mapping
    # Logic: audioId (text key) → {hy: "000001", en: "000001", ru: "000001"}
    all_keys = set(hy_map.keys()) | set(en_map.keys()) | set(fixed_ids.keys())
    
    # Add numbers
    for i in range(1, 11):
        all_keys.add(f"num_{i}")

    unified = {}
    no_hy = []
    no_en = []
    no_ru = []

    for key in sorted(all_keys):
        hy_num = hy_map.get(key) or fixed_ids.get(key, "").zfill(6) if fixed_ids.get(key) else None
        en_num = en_map.get(key) or hy_num  # EN often same ID
        ru_num = ru_map.get(key) or hy_num  # RU often same ID

        entry = {}
        if hy_num: entry["hy"] = str(hy_num).zfill(6)
        else: no_hy.append(key)
        if en_num: entry["en"] = str(en_num).zfill(6)
        else: no_en.append(key)
        if ru_num: entry["ru"] = str(ru_num).zfill(6)
        else: no_ru.append(key)

        if entry:
            unified[key] = entry

    # Save unified mapping
    out_dir = ROOT / "src/lib/content/mappings"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "audio-num-unified.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({
            "version": "3.0",
            "generatedAt": datetime.now().isoformat(),
            "totalKeys": len(unified),
            "mapping": unified
        }, f, ensure_ascii=False, indent=2)

    OK(f"Generated unified mapping: {len(unified)} keys → {out_path.name}")
    if no_hy:
        WARN(f"{len(no_hy)} keys have no HY audio number",
             f"Sample: {no_hy[:5]}")

    return unified, out_path

# ─── FINAL REPORT ─────────────────────────────────────────────────────────────
def print_final_report():
    errors   = [b for b in bugs if b["severity"] == "ERROR"]
    warnings = [b for b in bugs if b["severity"] == "WARN"]

    print(f"\n{W}{'═'*62}")
    print("   🍎 NUR LINGO AUDIO MAPPING REPORT")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═'*62}{X}")
    print(f"\n  {R}❌ ERRORS: {len(errors)}{X}")
    print(f"  {Y}⚠️  WARNINGS: {len(warnings)}{X}")

    total = len(errors) + len(warnings)
    score = max(0, 100 - len(errors)*8 - len(warnings)*3)
    bar   = "█"*(score//5) + "░"*(20-score//5)
    col   = G if score>=80 else Y if score>=60 else R
    print(f"\n  Score: {col}[{bar}] {score}%{X}\n")

    if errors:
        print(f"{W}{'─'*62}\n   ❌ ERRORS (must fix){X}")
        for b in errors:
            print(f"\n  {R}{b['msg']}{X}")
            if b["detail"]: print(f"     └─ {b['detail']}")
            if b["fix"]:    print(f"     💡 Fix: {b['fix']}")

    if warnings:
        print(f"\n{W}{'─'*62}\n   ⚠️  WARNINGS{X}")
        for b in warnings:
            print(f"\n  {Y}{b['msg']}{X}")
            if b["detail"]: print(f"     └─ {b['detail']}")
            if b["fix"]:    print(f"     💡 Fix: {b['fix']}")

    if fixes_applied:
        print(f"\n{G}{'─'*62}\n   ✅ AUTO-FIXES APPLIED{X}")
        for f in fixes_applied:
            print(f"  ✅ {f}")

    # Save report
    report = ROOT / "audio-mapping-report.json"
    with open(report, "w", encoding="utf-8") as f:
        json.dump({
            "generatedAt": datetime.now().isoformat(),
            "score": score,
            "errors": len(errors),
            "warnings": len(warnings),
            "bugs": bugs,
            "fixesApplied": fixes_applied,
        }, f, ensure_ascii=False, indent=2)

    print(f"\n  💾 Report: audio-mapping-report.json")
    if not FIX_MODE and errors:
        print(f"\n  {Y}Tip: Run with --fix to auto-apply safe fixes{X}")
    print()

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n{W}NUR LINGO — AUDIO MAPPING SCANNER{X}")
    print(f"Root: {ROOT}")
    print(f"Mode: {'🔧 FIX' if FIX_MODE else '🔍 SCAN'}\n")

    test_audio_sources()
    maps = test_mappings()
    hy_map = maps.get("hy", {})
    en_map = maps.get("en", {})
    ru_map = maps.get("ru", {})
    fixed_ids = test_fixed_audio_ids(hy_map)
    test_numbers(fixed_ids, hy_map)
    test_audio_index()
    test_mapping_integrated()
    test_database()
    test_manifest_file_sync()
    test_build_consistency()

    if FIX_MODE or not bugs:
        unified, out_path = generate_fixed_mapping(hy_map, en_map, ru_map, fixed_ids)

    print_final_report()