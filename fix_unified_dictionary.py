# fix_unified_dictionary.py
import json
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
DICT_PATH = ROOT / "data/dictionaries/unified-dictionary.json"

def fix_unified_dictionary():
    """Ավելացնել audioId դաշտը unified-dictionary.json-ի բոլոր entry-ներին"""
    
    if not DICT_PATH.exists():
        print(f"❌ File not found: {DICT_PATH}")
        return
    
    with open(DICT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"📊 Found {len(data)} entries")
    
    fixed_count = 0
    for entry in data:
        if isinstance(entry, dict):
            # Ավելացնել audioId, եթե բացակայում է
            if "audioId" not in entry:
                # Օգտագործել id-ն որպես audioId
                entry["audioId"] = entry.get("id", f"{len(data):06d}")
                fixed_count += 1
    
    print(f"✅ Added audioId to {fixed_count} entries")
    
    # Պահպանել
    with open(DICT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved to: {DICT_PATH}")

if __name__ == "__main__":
    fix_unified_dictionary()