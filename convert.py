# convert_user_dictionary.py

import json
from pathlib import Path
from datetime import datetime

def convert_user_dictionary():
    """Փոխարկել user-dictionary.json-ը list-ից dict-ի"""
    
    file_path = Path('data/dictionaries/user-dictionary.json')
    
    if not file_path.exists():
        print(f"❌ Ֆայլը բացակայում է: {file_path}")
        return
    
    # 1. Backup անել
    backup_path = file_path.with_suffix('.json.bak')
    import shutil
    shutil.copy2(file_path, backup_path)
    print(f"✅ Backup ստեղծվեց: {backup_path}")
    
    # 2. Բեռնել առկա ֆայլը
    with open(file_path, 'r', encoding='utf-8') as f:
        old_data = json.load(f)
    
    print(f"📊 Տիպը: {type(old_data).__name__}")
    
    # 3. Եթե list է, փոխարկել dict-ի
    if isinstance(old_data, list):
        print(f"📊 Գտնվել է {len(old_data)} բառ")
        
        # Փոխարկել list-ը dict-ի
        new_data = {
            "version": "1.0.0",
            "lastUpdated": datetime.now().isoformat(),
            "words": [],
            "statistics": {
                "totalWords": len(old_data),
                "lastAccessed": datetime.now().isoformat()
            }
        }
        
        # Փոխարկել յուրաքանչյուր բառը
        for item in old_data:
            word_entry = {
                "id": item.get("id", ""),
                "word": item.get("hy", item.get("word", "")),
                "translations": {
                    "hy": item.get("hy", ""),
                    "en": item.get("en", ""),
                    "ru": item.get("ru", "")
                },
                "audioId": item.get("id", ""),
                "type": item.get("type", "user"),
                "isUserAdded": item.get("isUserAdded", True),
                "audioGenerated": item.get("audioGenerated", True),
                "audio": item.get("audio", {})
            }
            new_data["words"].append(word_entry)
        
        # 4. Պահպանել նոր ֆայլը
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Փոխարկվեց {len(new_data['words'])} բառ")
        print(f"📁 Պահվեց: {file_path}")
        
    elif isinstance(old_data, dict):
        print("✅ Ֆայլն արդեն dict է, փոփոխություն պետք չէ")
        
        # Ստուգել արդյոք կա 'words' բանալի
        if 'words' not in old_data:
            print("⚠️ 'words' բանալին բացակայում է, ավելացնում եմ...")
            old_data['words'] = []
            old_data['statistics'] = {
                "totalWords": 0,
                "lastAccessed": datetime.now().isoformat()
            }
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(old_data, f, ensure_ascii=False, indent=2)
            print("✅ Թարմացվեց")
    else:
        print(f"❌ Անհայտ տիպ: {type(old_data).__name__}")

def check_dictionary():
    """Ստուգել արդյոք ֆայլը ճիշտ է"""
    
    file_path = Path('data/dictionaries/user-dictionary.json')
    
    if not file_path.exists():
        print(f"❌ Ֆայլը բացակայում է: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n" + "="*50)
    print("📋 USER-DICTIONARY ՍՏՈՒԳՈՒՄ")
    print("="*50)
    
    print(f"📊 Տիպ: {type(data).__name__}")
    
    if isinstance(data, dict):
        print(f"📊 Բանալիներ: {list(data.keys())}")
        words = data.get('words', [])
        print(f"📊 Բառերի քանակ: {len(words)}")
        
        if words:
            print(f"\n📝 Առաջին 3 բառը:")
            for i, word in enumerate(words[:3], 1):
                print(f"  {i}. {word.get('word', 'N/A')} ({word.get('id', 'N/A')})")
        
        print("\n✅ Ֆայլը ճիշտ է")
    else:
        print("\n❌ Ֆայլը list է, պետք է dict լինի")
        print("💡 Գործարկեք convert_user_dictionary()")

if __name__ == "__main__":
    print("\n🔧 USER-DICTIONARY ՓՈԽԱՐԿԻՉ")
    print("="*50)
    
    # 1. Նախ ստուգել
    check_dictionary()
    
    # 2. Հարցնել արդյոք փոխարկել
    print("\n" + "="*50)
    choice = input("🔄 Փոխարկել list-ը dict-ի? (y/n): ").strip().lower()
    
    if choice == 'y':
        convert_user_dictionary()
        print("\n✅ Փոխարկումն ավարտված է")
        print("\n📋 Ստուգում նոր ֆայլը...")
        check_dictionary()
    else:
        print("❌ Չեղարկված")