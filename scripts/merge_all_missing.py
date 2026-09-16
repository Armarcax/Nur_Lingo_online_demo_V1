import json
import os
from pathlib import Path

# ── Ուղիներ ──────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
os.chdir(project_root) # Քայլերը ճիշտ աշխատելու համար

base_dir = Path("data/dictionaries")
unified_path = base_dir / "unified-dictionary.json"

# Ֆայլերի հնարավոր ուղիները (ներառյալ dictionary.json)
source_files = [
    base_dir / "full-dictionary.json",
    Path("full-dictionary.json"),
    base_dir / "Headers_dictionary.json",
    base_dir / "master-dictionary.json",
    base_dir / "dictionary.json"
]

# ── Օգնող ֆունկցիաներ ────────────────────────────────────────────────────────
def load_json_safe(path):
    """Անվտանգ JSON բեռնում (BOM և դատարկ ֆայլերի համար)"""
    if not os.path.exists(path):
        return None
    try:
        # utf-8-sig-ը ավտոմատ հեռացնում է թաքնված BOM սիմվոլները
        with open(path, 'r', encoding='utf-8-sig') as f:
            content = f.read().strip()
            if not content:
                print(f"⚠️ {path.name} ֆայլը դատարկ է, բաց եմ թողնում:")
                return None
            return json.loads(content)
    except Exception as e:
        print(f"❌ Սխալ {path.name} կարդալիս: {e}")
        return None

def clean_key(k):
    return k.strip()

def get_val(d, key):
    """Օգնող ֆունկցիա՝ անտեսում է բանալիների վերջում եղած բացատները"""
    key = clean_key(key)
    if key in d: return clean_key(str(d[key]))
    if f"{key} " in d: return clean_key(str(d[f"{key} "]))
    return ""

def process_dictionary(data, existing_hy_set, next_id):
    """Մշակում է բառարանը և վերադարձնում ավելացված բառերի ցուցակը"""
    added = []
    
    # Եթե տվյալները օբյեկտ են (ինչպես dictionary.json), վերածել այն զանգվածի
    if isinstance(data, dict):
        temp_list = []
        for key, value in data.items():
            if isinstance(value, dict):
                if 'en' not in value and 'hy' not in value:
                    value['en'] = key
                temp_list.append(value)
            else:
                temp_list.append({"en": key, "hy": str(value)})
        data = temp_list
    
    if isinstance(data, list):
        for entry in data:
            if not isinstance(entry, dict): continue
            
            hy = get_val(entry, 'hy')
            if hy and hy not in existing_hy_set:
                en = get_val(entry, 'en')
                ru = get_val(entry, 'ru')
                
                id_str = f"{next_id:06d}"
                new_entry = {
                    "id": id_str,
                    "hy": hy,
                    "en": en,
                    "ru": ru,
                    "type": "vocab",
                    "audio": {
                        "hy": f"/audio/hy/{id_str}.mp3",
                        "en": f"/audio/en/{id_str}.mp3",
                        "ru": f"/audio/ru/{id_str}.mp3"
                    }
                }
                added.append(new_entry)
                existing_hy_set.add(hy)
                next_id += 1
                
    return added, next_id

# ── Քայլ 1: Կարդալ unified-dictionary.json ───────────────────────────────────
print("📖 Քայլ 1: Կարդում եմ unified-dictionary.json...")
unified_data = load_json_safe(unified_path)
if unified_data is None:
    print("❌ unified-dictionary.json չի գտնվել կամ դատարկ է:")
    exit(1)

existing_hy = set()
max_id = 0

for item in unified_data:
    if not isinstance(item, dict): continue
    hy = get_val(item, 'hy')
    if hy:
        existing_hy.add(hy)
    
    item_id = get_val(item, 'id')
    if item_id.isdigit():
        num = int(item_id)
        if num > max_id: max_id = num

next_id = max_id + 1
print(f"✅ Գտնվել է {len(unified_data)} բառ։ Առկա առավելագույն ID՝ {max_id:06d}")

# ── Քայլ 2: Սկանավորել մյուս ֆայլերը ───────────────────────────────────────
print("\n🔍 Քայլ 2: Սկանավորում եմ մյուս բառարանները...")
total_added = 0

processed_paths = set()
for src in source_files:
    if str(src) in processed_paths: continue
    processed_paths.add(str(src))
    
    if not os.path.exists(src):
        continue
        
    print(f"\n📂 Սկանավորում եմ {src.name}...")
    data = load_json_safe(src)
    if data is None:
        continue
        
    added, next_id = process_dictionary(data, existing_hy, next_id)
    unified_data.extend(added)
    total_added += len(added)
    print(f"   ➕ {src.name}-ից ավելացվել է {len(added)} նոր բառ։")

# ── Քայլ 3: Պահպանել արդյունքը ──────────────────────────────────────────────
print(f"\n💾 Քայլ 3: Պահպանում եմ թարմացված unified-dictionary.json...")
with open(unified_path, 'w', encoding='utf-8') as f:
    json.dump(unified_data, f, ensure_ascii=False, indent=2)

# ── Վիճակագրություն ──────────────────────────────────────────────────────────
print("\n" + "="*60)
print("🎉 ՄԻԱՎՈՐՈՒՄԸ ԱՎԱՐՏՎԱԾ Է!")
print("="*60)
print(f"✅ Ընդհանուր ավելացվել է՝ {total_added} բառ")
print(f"✅ Նոր ընդհանուր քանակը՝ {len(unified_data)} բառ")
print(f"✅ Վերջին ID-ն է՝ {next_id-1:06d}")
print(f"📁 Պահպանվել է՝ {unified_path}")
print("="*60)