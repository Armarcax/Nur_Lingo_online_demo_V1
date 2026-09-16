"""
NUR Lingo — Unified Dictionary Generator
=========================================
Միավորում է բոլոր աղբյուրները և ստեղծում unified-dictionary.json
"""
import os
import re
import json
from pathlib import Path

# ── Ուղիներ ──────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Աղբյուրներ
txt_source = Path(project_root) / "New Text Document (6).txt"
full_dict_path = Path(project_root) / "full-dictionary.json"
master_dict_path = Path(project_root) / "data" / "dictionaries" / "master-dictionary.json"

# Արդյունք
output_path = Path(project_root) / "data" / "dictionaries" / "unified-dictionary.json"

print("🔍 NUR Lingo — Unified Dictionary Generator")
print("=" * 60)

# ── Քայլ 1: Կարդալ New Text Document (6).txt ─────────────────────────────────
print("\n📖 Քայլ 1: Կարդում եմ New Text Document (6).txt...")

if not txt_source.exists():
    print(f"❌ Չի գտնվել: {txt_source}")
    exit(1)

with open(txt_source, 'r', encoding='utf-8') as f:
    txt_content = f.read()

# Վերլուծել ձևաչափը:
# բարև
# hello / привет
# ID: 000001
pattern = r'([ա-ֆԱ-Ֆa-zA-Z\s\-\.,!?]+)\n([a-zA-Z\s\-\.,!?]+)\s*/\s*([а-яА-ЯёЁ\s\-\.,!?]+)\nID:\s*(\d+)'
matches = re.findall(pattern, txt_content)

txt_entries = {}
for hy, en, ru, id_num in matches:
    hy = hy.strip()
    en = en.strip()
    ru = ru.strip()
    id_padded = id_num.zfill(6)
    
    txt_entries[id_padded] = {
        "id": id_padded,
        "hy": hy,
        "en": en,
        "ru": ru,
        "type": "vocab",
        "audio": {
            "hy": f"/audio/hy/{id_padded}.mp3",
            "en": f"/audio/en/{id_padded}.mp3",
            "ru": f"/audio/ru/{id_padded}.mp3"
        }
    }

print(f"✅ Գտնվել է {len(txt_entries)} բառ New Text Document (6).txt-ից")

# ── Քայլ 2: Ստուգել full-dictionary.json ─────────────────────────────────────
print("\n📖 Քայլ 2: Ստուգում եմ full-dictionary.json...")

if full_dict_path.exists():
    with open(full_dict_path, 'r', encoding='utf-8') as f:
        full_dict = json.load(f)
    
    print(f"✅ full-dictionary.json պարունակում է {len(full_dict)} մուտք")
    
    # Ավելացնել բացակայող մուտքերը
    for entry in full_dict:
        entry_id = entry.get("id", "")
        if entry_id and entry_id not in txt_entries:
            txt_entries[entry_id] = entry
            print(f"  ➕ Ավելացվել է {entry_id} full-dictionary.json-ից")
else:
    print(f"⚠️ Չի գտնվել: {full_dict_path}")

# ── Քայլ 3: Ստուգել master-dictionary.json ───────────────────────────────────
print("\n📖 Քայլ 3: Ստուգում եմ master-dictionary.json...")

if master_dict_path.exists():
    with open(master_dict_path, 'r', encoding='utf-8') as f:
        master_dict = json.load(f)
    
    print(f"✅ master-dictionary.json պարունակում է {len(master_dict)} մուտք")
    
    # Ավելացնել բացակայող մուտքերը
    added_count = 0
    for entry in master_dict:
        hy = entry.get("hy", "")
        en = entry.get("en", "")
        ru = entry.get("ru", "")
        
        # Ստուգել, թե արդյոք արդեն կա
        exists = False
        for existing_id, existing_entry in txt_entries.items():
            if existing_entry.get("hy") == hy and existing_entry.get("en") == en:
                exists = True
                break
        
        if not exists and hy and en:
            # Գտնել հաջորդ հասանելի ID-ն
            max_id = max([int(k) for k in txt_entries.keys()]) if txt_entries else 0
            new_id = str(max_id + 1).zfill(6)
            
            txt_entries[new_id] = {
                "id": new_id,
                "hy": hy,
                "en": en,
                "ru": ru,
                "type": "vocab",
                "audio": {
                    "hy": f"/audio/hy/{new_id}.mp3",
                    "en": f"/audio/en/{new_id}.mp3",
                    "ru": f"/audio/ru/{new_id}.mp3"
                }
            }
            added_count += 1
    
    print(f"  ➕ Ավելացվել է {added_count} նոր մուտք master-dictionary.json-ից")
else:
    print(f"⚠️ Չի գտնվել: {master_dict_path}")

# ── Քայլ 4: Ստեղծել unified-dictionary.json ──────────────────────────────────
print("\n💾 Քայլ 4: Ստեղծում եմ unified-dictionary.json...")

# Ստեղծել output պանակը, եթե չկա
output_path.parent.mkdir(parents=True, exist_ok=True)

# Դասավորել ըստ ID-ի
sorted_entries = [txt_entries[k] for k in sorted(txt_entries.keys())]

# Գրել ֆայլ
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(sorted_entries, f, ensure_ascii=False, indent=2)

print(f"✅ unified-dictionary.json ստեղծվել է")
print(f"   📊 Ընդհանուր մուտքեր: {len(sorted_entries)}")
print(f"   📁 Պահպանվել է: {output_path}")

# ── Վիճակագրություն ──────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("📊 ՎԻՃԱԳՐՈՒԹՅՈՒՆ")
print("=" * 60)
print(f"✅ Ընդհանուր բառեր: {len(sorted_entries)}")
print(f"✅ Առաջին ID: {sorted_entries[0]['id']}")
print(f"✅ Վերջին ID: {sorted_entries[-1]['id']}")

# Ստուգել ըստ տեսակի
vocab_count = sum(1 for e in sorted_entries if e.get("type") == "vocab")
phrase_count = sum(1 for e in sorted_entries if e.get("type") == "phrase")
dialogue_count = sum(1 for e in sorted_entries if e.get("type") == "dialogue")

print(f"   - Vocab: {vocab_count}")
print(f"   - Phrases: {phrase_count}")
print(f"   - Dialogues: {dialogue_count}")

print("\n" + "=" * 60)
print("🎉 ՄԻԱՍՆԱԿԱՆ ԲԱՌԱՐԱՆԸ ՊԱՏՐԱՍՏ Է!")
print("=" * 60)
print(f"\n📝 Հաջորդ քայլ: Գեներացնել աուդիո ֆայլերը")
print(f"   python scripts/generate_all_audio.py --skip-existing")