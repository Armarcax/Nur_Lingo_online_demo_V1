import json
from pathlib import Path

def inspect_json_files():
    """Ուսումնասիրում է JSON ֆայլերի կառուցվածքը"""
    
    # JSON ֆայլերի ուղիները
    json_dir = Path("src/lib/content/mappings")
    json_files = [
        json_dir / "audio-num-en-mapping.json",
        json_dir / "audio-num-hy-mapping.json", 
        json_dir / "audio-num-ru-mapping.json",
        json_dir / "audio-num-mappings.json"
    ]
    
    for json_file in json_files:
        if not json_file.exists():
            print(f"❌ Ֆայլը չի գտնվել: {json_file}")
            continue
            
        print(f"\n{'='*60}")
        print(f"📄 Ֆայլ: {json_file.name}")
        print(f"{'='*60}")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 1. Տվյալների հիմնական տիպը
            print(f"📊 Տվյալների հիմնական տիպ: {type(data).__name__}")
            
            # 2. Եթե դա բառարան է (dict)
            if isinstance(data, dict):
                print(f"🔑 Բանալիների քանակ: {len(data)}")
                print(f"🔑 Բանալիներ: {list(data.keys())}")
                
                # Ստուգել առաջին բանալու արժեքը
                first_key = list(data.keys())[0]
                print(f"\n📌 Առաջին բանալի '{first_key}'-ի արժեքի տիպ: {type(data[first_key]).__name__}")
                
                if isinstance(data[first_key], list):
                    print(f"📌 Ցանկի երկարություն: {len(data[first_key])}")
                    if len(data[first_key]) > 0:
                        print(f"📌 Առաջին տարրի տիպ: {type(data[first_key][0]).__name__}")
                        if isinstance(data[first_key][0], dict):
                            print(f"📌 Առաջին տարրի բանալիներ: {list(data[first_key][0].keys())}")
                            # Ցույց տալ առաջին տարրի ամբողջական բովանդակությունը
                            print(f"📌 Առաջին տարր: {json.dumps(data[first_key][0], indent=2, ensure_ascii=False)[:500]}...")
                            
            # 3. Եթե դա ցանկ է (list)
            elif isinstance(data, list):
                print(f"📊 Ցանկի երկարություն: {len(data)}")
                if len(data) > 0:
                    print(f"📌 Առաջին տարրի տիպ: {type(data[0]).__name__}")
                    if isinstance(data[0], dict):
                        print(f"📌 Առաջին տարրի բանալիներ: {list(data[0].keys())}")
                        print(f"📌 Առաջին տարր: {json.dumps(data[0], indent=2, ensure_ascii=False)[:500]}...")
                    elif isinstance(data[0], str):
                        print(f"📌 Առաջին տարր (string): {data[0][:200]}...")
            
            # 4. Ցույց տալ ամբողջական կառուցվածքի նմուշ
            print(f"\n📝 Տվյալների նմուշ (առաջին 1000 նիշ).")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1000] + "...")
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON սխալ: {e}")
        except Exception as e:
            print(f"❌ Այլ սխալ: {e}")

if __name__ == "__main__":
    inspect_json_files()