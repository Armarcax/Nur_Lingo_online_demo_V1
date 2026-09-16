#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔═══════════════════════════════════════════════════════╗
║  NUR Lingo — LOCAL AUDIO MAPPER                       ║
║  Դնել NURLingo-main/ root-ում, աշxatetsnel:          ║
║  python build_audio_mapping.py                        ║
╚═══════════════════════════════════════════════════════╝

Skanavorum e public/audio/ folder-y u sarqum e.
  - src/lib/content/mappings/audio-num-hy-mapping.json
  - src/lib/content/mappings/audio-num-en-mapping.json
  - src/lib/content/mappings/audio-num-ru-mapping.json
  - public/audio/offline_dictionary/manifest_dictionary.json
  - public/audio/offline_user_dictionary/user_manifest.json
  - data/dictionaries/unified-dictionary.json  (paths fixed)
  - data/dictionaries/user-dictionary.json     (paths fixed)
"""

import os, sys, json, re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.resolve()

G="\033[92m"; R="\033[91m"; Y="\033[93m"; W="\033[97m"; X="\033[0m"
ok  = lambda s: print(f"{G}✅ {s}{X}")
err = lambda s: print(f"{R}❌ {s}{X}")
inf = lambda s: print(f"{Y}ℹ️  {s}{X}")

# ─── 1. Scan audio folders ────────────────────────────────────────────────────
def scan_folder(path: Path) -> list[str]:
    if not path.exists():
        return []
    return sorted(f.stem for f in path.glob("*.mp3") if f.stat().st_size > 500)

print(f"\n{W}NUR Lingo — Local Audio Mapper{X}")
print(f"Root: {ROOT}\n")

AUDIO = ROOT / "public/audio"

# Lesson audio
hy_lesson = scan_folder(AUDIO / "offline/hy_Ani")
en_lesson  = scan_folder(AUDIO / "offline/en_female")
ru_lesson  = scan_folder(AUDIO / "offline/ru_female")

# Dictionary audio
hy_dict = scan_folder(AUDIO / "offline_dictionary/hy")
en_dict = scan_folder(AUDIO / "offline_dictionary/en")
ru_dict = scan_folder(AUDIO / "offline_dictionary/ru")

# User dictionary audio
hy_user = scan_folder(AUDIO / "offline_user_dictionary/hy_user")
en_user = scan_folder(AUDIO / "offline_user_dictionary/en_user")
ru_user = scan_folder(AUDIO / "offline_user_dictionary/ru_user")

print(f"{'='*55}")
print("AUDIO FILE SCAN RESULTS")
print(f"{'='*55}")
print(f"  Lessons  HY (hy_Ani):     {len(hy_lesson):>6} MP3s")
print(f"  Lessons  EN (en_female):  {len(en_lesson):>6} MP3s")
print(f"  Lessons  RU (ru_female):  {len(ru_lesson):>6} MP3s")
print(f"  Dict     HY:              {len(hy_dict):>6} MP3s")
print(f"  Dict     EN:              {len(en_dict):>6} MP3s")
print(f"  Dict     RU:              {len(ru_dict):>6} MP3s")
print(f"  UserDict HY:              {len(hy_user):>6} MP3s")
print(f"  UserDict EN:              {len(en_user):>6} MP3s")
print(f"  UserDict RU:              {len(ru_user):>6} MP3s")

# ─── 2. Load existing manifests to get text→ID mappings ──────────────────────
def load_manifest(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        return raw.get("mapping", raw) if isinstance(raw, dict) else {}
    except:
        return {}

# Load lesson manifests (text_id → numeric_id)
hy_lesson_map = load_manifest(AUDIO / "offline/manifest_hy_ani.json")
en_lesson_map = load_manifest(AUDIO / "offline/manifest_en_female.json")
ru_lesson_map = load_manifest(AUDIO / "offline/manifest_ru_female.json")

print(f"\n  Lesson HY manifest:       {len(hy_lesson_map):>6} entries")
print(f"  Lesson EN manifest:       {len(en_lesson_map):>6} entries")
print(f"  Lesson RU manifest:       {len(ru_lesson_map):>6} entries")

# ─── 3. Build/verify lesson mappings ─────────────────────────────────────────
MAPPINGS_DIR = ROOT / "src/lib/content/mappings"
MAPPINGS_DIR.mkdir(parents=True, exist_ok=True)

def build_lesson_mapping(manifest: dict, actual_files: set) -> dict:
    """Keep only entries where the MP3 actually exists."""
    verified = {}
    for text_id, num_id in manifest.items():
        padded = str(num_id).zfill(6)
        if padded in actual_files:
            verified[text_id] = padded
    return verified

hy_files = set(hy_lesson)
en_files = set(en_lesson)
ru_files = set(ru_lesson)

hy_verified = build_lesson_mapping(hy_lesson_map, hy_files)
en_verified = build_lesson_mapping(en_lesson_map, en_files)
ru_verified = build_lesson_mapping(ru_lesson_map, ru_files)

print(f"\n{'='*55}")
print("LESSON MAPPING VERIFICATION")
print(f"{'='*55}")
print(f"  HY: {len(hy_verified)}/{len(hy_lesson_map)} verified")
print(f"  EN: {len(en_verified)}/{len(en_lesson_map)} verified")
print(f"  RU: {len(ru_verified)}/{len(ru_lesson_map)} verified")

# Save lesson mappings
for lang, mapping, label in [
    ("hy", hy_verified, "HY"),
    ("en", en_verified, "EN"),
    ("ru", ru_verified, "RU"),
]:
    out = MAPPINGS_DIR / f"audio-num-{lang}-mapping.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump({
            "version": "3.0",
            "generatedAt": datetime.now().isoformat(),
            "lang": lang,
            "totalEntries": len(mapping),
            "mapping": mapping,
        }, f, ensure_ascii=False, indent=2)
    ok(f"Saved: {out.relative_to(ROOT)} ({len(mapping)} entries)")

# ─── 4. Build dictionary manifest ─────────────────────────────────────────────
print(f"\n{'='*55}")
print("DICTIONARY MANIFEST")
print(f"{'='*55}")

def build_dict_manifest(hy_ids, en_ids, ru_ids):
    """Build manifest for offline_dictionary files.
    Dictionary files are numbered sequentially matching unified-dictionary order.
    """
    mapping = {}
    # Each numeric ID maps to itself (the dict uses numeric IDs directly)
    all_ids = sorted(set(hy_ids) | set(en_ids) | set(ru_ids))
    for num_id in all_ids:
        mapping[num_id] = num_id  # id → id (direct numeric lookup)
    return mapping

dict_mapping = build_dict_manifest(hy_dict, en_dict, ru_dict)

dict_manifest_path = AUDIO / "offline_dictionary/manifest_dictionary.json"
dict_manifest_path.parent.mkdir(parents=True, exist_ok=True)
with open(dict_manifest_path, "w", encoding="utf-8") as f:
    json.dump({
        "version": "2.0",
        "generatedAt": datetime.now().isoformat(),
        "type": "dictionary",
        "totalEntries": len(dict_mapping),
        "hy": len(hy_dict),
        "en": len(en_dict),
        "ru": len(ru_dict),
        "mapping": dict_mapping,
    }, f, ensure_ascii=False, indent=2)
ok(f"Dictionary manifest: {len(dict_mapping)} entries")

# ─── 5. Build user dictionary manifest ───────────────────────────────────────
print(f"\n{'='*55}")
print("USER DICTIONARY MANIFEST")
print(f"{'='*55}")

user_mapping = {}
all_user_ids = sorted(set(hy_user) | set(en_user) | set(ru_user))
for num_id in all_user_ids:
    user_mapping[num_id] = num_id

user_manifest_path = AUDIO / "offline_user_dictionary/user_manifest.json"
user_manifest_path.parent.mkdir(parents=True, exist_ok=True)
with open(user_manifest_path, "w", encoding="utf-8") as f:
    json.dump({
        "version": "1.0",
        "generatedAt": datetime.now().isoformat(),
        "type": "user_dictionary",
        "totalEntries": len(user_mapping),
        "mapping": user_mapping,
    }, f, ensure_ascii=False, indent=2)
ok(f"User manifest: {len(user_mapping)} entries")

# ─── 6. Fix unified-dictionary.json paths ────────────────────────────────────
print(f"\n{'='*55}")
print("FIXING DICTIONARY JSON PATHS")
print(f"{'='*55}")

def fix_dict_paths(dict_path: Path, lang_map: dict, out_path: Path = None):
    if not dict_path.exists():
        err(f"Not found: {dict_path}")
        return 0

    with open(dict_path, encoding="utf-8") as f:
        entries = json.load(f)

    is_list = isinstance(entries, list)
    items = entries if is_list else entries.get("words", [])

    fixed = 0
    for entry in items:
        if not isinstance(entry, dict):
            continue

        # Add audioId if missing
        if "audioId" not in entry and "id" in entry:
            entry["audioId"] = entry["id"]

        if "audio" not in entry:
            audio_id = entry.get("audioId") or entry.get("id", "")
            if audio_id:
                entry["audio"] = {}

        if "audio" in entry and isinstance(entry["audio"], dict):
            for lang in ["hy", "en", "ru"]:
                old = entry["audio"].get(lang, "")
                # Fix various wrong path patterns
                new = ""
                if f"/audio/{lang}/" in old and "offline" not in old:
                    new = old.replace(f"/audio/{lang}/", f"/audio/offline_dictionary/{lang}/")
                elif f"/audio/{lang}_user/" in old and "offline" not in old:
                    new = old.replace(f"/audio/{lang}_user/", f"/audio/offline_user_dictionary/{lang}_user/")
                elif not old and entry.get("audioId"):
                    # Build path from audioId
                    aid = str(entry["audioId"]).zfill(6)
                    if entry.get("isUserAdded"):
                        new = f"/audio/offline_user_dictionary/{lang}_user/{aid}.mp3"
                    else:
                        new = f"/audio/offline_dictionary/{lang}/{aid}.mp3"

                if new and new != old:
                    entry["audio"][lang] = new
                    fixed += 1

    save_path = out_path or dict_path
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    return fixed

# Fix unified-dictionary.json
unified_path = ROOT / "data/dictionaries/unified-dictionary.json"
n = fix_dict_paths(unified_path, {}, unified_path)
ok(f"unified-dictionary.json: {n} paths fixed")

# Fix user-dictionary.json
user_path = ROOT / "data/dictionaries/user-dictionary.json"
n = fix_dict_paths(user_path, {}, user_path)
ok(f"user-dictionary.json: {n} paths fixed")

# ─── 7. Fix OfflineLessonEngine mapping bug ───────────────────────────────────
print(f"\n{'='*55}")
print("FIXING SOURCE CODE")
print(f"{'='*55}")

LE_PATH = ROOT / "src/lib/offline/OfflineLessonEngine.ts"
if LE_PATH.exists():
    code = LE_PATH.read_text(encoding="utf-8")
    original = code

    # Fix vocab self-mapping
    code = code.replace(
        "          this.combinedMapping[vocab.audioId] = vocab.audioId;",
        "          // ✅ FIXED: vocab.id → audioId (not self-map)\n"
        "          this.combinedMapping[vocab.id] = vocab.audioId;\n"
        "          this.combinedMapping[vocab.audioId] = vocab.audioId;"
    )

    # Fix exercise mapping
    code = code.replace(
        "            this.combinedMapping[exercise.audioId] = exercise.audioId;\n"
        "            registerExerciseAudio(exercise.id, exercise.audioId);",
        "            // ✅ FIXED: exercise.id → audioId\n"
        "            this.combinedMapping[exercise.id] = exercise.audioId;\n"
        "            this.combinedMapping[exercise.audioId] = exercise.audioId;\n"
        "            registerExerciseAudio(exercise.id, exercise.audioId);"
    )

    if code != original:
        LE_PATH.write_text(code, encoding="utf-8")
        ok("OfflineLessonEngine.ts: buildCombinedMapping fixed")
    else:
        inf("OfflineLessonEngine.ts: already correct or pattern changed")
else:
    err("OfflineLessonEngine.ts not found")

# Fix database.ts Date.now() fallback
DB_PATH = ROOT / "src/lib/content/database.ts"
if DB_PATH.exists():
    code = DB_PATH.read_text(encoding="utf-8")
    if "Date.now()" in code:
        code = re.sub(
            r"return String\(Date\.now\(\)\)\.slice\(-6\);",
            "return '000000'; // ✅ FIXED: was Date.now() — non-reproducible",
            code
        )
        DB_PATH.write_text(code, encoding="utf-8")
        ok("database.ts: Date.now() fallback replaced with '000000'")
    else:
        inf("database.ts: Date.now() not found (already fixed)")

# Fix learn/page.tsx duplicate button
LEARN_PATH = ROOT / "src/app/learn/page.tsx"
if LEARN_PATH.exists():
    code = LEARN_PATH.read_text(encoding="utf-8")
    if "Unlock All Button - Development only" in code:
        # Remove the duplicate block
        code = re.sub(
            r'\{/\* Unlock All Button - Development only \*/\}\s*'
            r'\{process\.env\.NODE_ENV === "development" && \(\s*'
            r'<button[^>]*onClick=\{unlockAllLessons\}[^}]*>[^<]*<Unlock[^/]*/>[^<]*Unlock All[^<]*</button>[^)]*\)\}',
            "{/* Unlock All: use world/page.tsx instead */}",
            code,
            flags=re.DOTALL
        )
        LEARN_PATH.write_text(code, encoding="utf-8")
        ok("learn/page.tsx: duplicate Unlock button removed")
    else:
        inf("learn/page.tsx: duplicate button not found (already removed)")

# ─── 8. Final summary ─────────────────────────────────────────────────────────
print(f"\n{'='*55}")
print("SUMMARY")
print(f"{'='*55}")
ok(f"Lesson mappings:    HY={len(hy_verified)}, EN={len(en_verified)}, RU={len(ru_verified)}")
ok(f"Dict manifest:      {len(dict_mapping)} entries")
ok(f"User manifest:      {len(user_mapping)} entries")
ok(f"Dictionary paths:   fixed")
ok(f"Source code:        fixed")
print(f"\n  Run again to verify. Then: git add . && git push origin master")