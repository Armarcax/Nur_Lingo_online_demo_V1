# scripts/extract_prompts_with_mapping.py
# Run: python scripts/extract_prompts_with_mapping.py

import os
import json
import shutil
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_BASE = PROJECT_ROOT / 'public' / 'audio' / 'offline'
MAPPING_FILE = PROJECT_ROOT / 'exercise_id_mapping.json'
OUTPUT_DIR = PROJECT_ROOT / 'extracted_prompts_mapped'

def extract_prompts():
    """Extract prompts using the mapping file"""
    
    print("=" * 60)
    print("   🎵 EXTRACT PROMPTS USING MAPPING")
    print("=" * 60)
    print()
    
    if not MAPPING_FILE.exists():
        print(f"❌ Please run create_exercise_mapping.py first")
        return
    
    with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    mapping = data.get('mapping', {})
    
    if not mapping:
        print("❌ No mapping found")
        return
    
    print(f"✅ Loaded {len(mapping)} mappings")
    
    # Check audio files
    hy_ani_path = AUDIO_BASE / 'hy_Ani'
    if not hy_ani_path.exists():
        print(f"❌ hy_Ani not found")
        return
    
    existing_audio = set()
    for f in hy_ani_path.glob('*.mp3'):
        existing_audio.add(f.stem)
    
    print(f"🎵 Found {len(existing_audio)} audio files")
    
    # Create output
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
    
    extracted = []
    missing = []
    
    for dict_id, info in mapping.items():
        audio_id = info['audio_id']
        
        if audio_id in existing_audio:
            src = hy_ani_path / f"{audio_id}.mp3"
            dst = OUTPUT_DIR / f"{audio_id}.mp3"
            shutil.copy2(src, dst)
            extracted.append({'dict_id': dict_id, 'audio_id': audio_id})
        else:
            missing.append({'dict_id': dict_id, 'audio_id': audio_id})
    
    print(f"\n✅ Extracted: {len(extracted)} files")
    print(f"❌ Missing: {len(missing)} files")
    
    # Save list
    csv_file = PROJECT_ROOT / 'extracted_prompts_mapped.csv'
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write("Dictionary ID,Audio ID\n")
        for item in extracted:
            f.write(f"{item['dict_id']},{item['audio_id']}\n")
    
    print(f"\n📊 CSV saved: {csv_file}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print("\n🎉 Done!")

if __name__ == "__main__":
    extract_prompts()