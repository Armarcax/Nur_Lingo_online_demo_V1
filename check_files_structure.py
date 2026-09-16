# check_files_structure.py
import json
from pathlib import Path

root = Path(r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2")
manifest_path = root / 'public/audio/offline/manifest_hy_ani.json'

with open(manifest_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("📊 files-ի տիպ:", type(data['files']).__name__)

if isinstance(data['files'], list):
    print("📊 files-ի չափ:", len(data['files']))
    print("📝 Առաջին 10 ֆայլ:")
    for i, file in enumerate(data['files'][:10], 1):
        print(f"  {i}. {file}")
elif isinstance(data['files'], dict):
    print("📊 files-ի բանալիներ:", list(data['files'].keys())[:10])
    print("📝 Առաջին 10 entry:")
    for i, (key, value) in enumerate(list(data['files'].items())[:10], 1):
        print(f"  {i}. {key} → {value}")