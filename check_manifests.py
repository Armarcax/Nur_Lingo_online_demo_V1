# check_manifests.py
import json
from pathlib import Path

root = Path(r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2")

manifests = [
    'public/audio/offline/manifest_hy_ani.json',
    'public/audio/offline/manifest_en_female.json',
    'public/audio/offline/manifest_ru_female.json',
    'public/audio/offline_dictionary/manifest.json',
    'public/audio/offline_user_dictionary/user_manifest.json'
]

for manifest_path in manifests:
    filepath = root / manifest_path
    print(f"\n📄 {manifest_path}")
    print("-"*50)
    
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📊 Տիպ: {type(data).__name__}")
        
        if isinstance(data, dict):
            print(f"📊 Բանալիներ: {list(data.keys())[:10]}")
            
            # Ստուգել արդյոք կա 'mapping' բանալի
            if 'mapping' in data:
                print(f"📊 Mapping-ի չափ: {len(data['mapping'])}")
                print(f"📝 Mapping-ի օրինակներ: {list(data['mapping'].items())[:5]}")
            else:
                print("⚠️  'mapping' բանալին ԲԱՑԱԿԱՅՈՒՄ Է")
                
        elif isinstance(data, list):
            print(f"📊 Չափ: {len(data)}")
            if data:
                print(f"📝 Օրինակներ: {data[:5]}")
    else:
        print("❌ Ֆայլը բացակայում է")