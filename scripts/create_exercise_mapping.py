# scripts/create_exercise_mapping.py
# Run: python scripts/create_exercise_mapping.py

import os
import json
import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
DICT_FILE = PROJECT_ROOT / 'data' / 'dictionaries' / 'lesson-dictionary.json'
MAPPING_FILE = PROJECT_ROOT / 'src' / 'lib' / 'content' / 'audio-mapping.ts'
OUTPUT_FILE = PROJECT_ROOT / 'exercise_id_mapping.json'

def parse_audio_mapping():
    """Parse EXERCISE_TO_AUDIO from audio-mapping.ts"""
    mapping = {}
    
    if not MAPPING_FILE.exists():
        print(f"❌ Mapping file not found")
        return mapping
    
    with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'export const EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};'
    match = re.search(pattern, content)
    
    if not match:
        print("❌ EXERCISE_TO_AUDIO not found")
        return mapping
    
    block = match.group(1)
    line_pattern = r'["\'](\w+)["\']\s*:\s*["\'](\w+)["\']'
    for line_match in re.finditer(line_pattern, block):
        key = line_match.group(1)
        value = line_match.group(2)
        mapping[key] = value
    
    print(f"✅ Loaded {len(mapping)} mappings")
    return mapping

def parse_dictionary():
    """Parse lesson-dictionary.json"""
    exercises = []
    
    if not DICT_FILE.exists():
        print(f"❌ Dictionary file not found")
        return exercises
    
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    lessons = data.get('lessons', [])
    
    for lesson in lessons:
        lesson_id = lesson.get('id', 'unknown')
        
        for ex in lesson.get('exercises', []):
            ex_id = ex.get('id', '')
            if '_hint' in ex_id or '_feedback' in ex_id:
                continue
            
            prompt = ex.get('prompt', {})
            if isinstance(prompt, str):
                prompt = {'en': prompt, 'hy': prompt, 'ru': prompt}
            elif not isinstance(prompt, dict):
                prompt = {}
            
            prompt_hy = prompt.get('hy', '')
            prompt_en = prompt.get('en', '')
            prompt_ru = prompt.get('ru', '')
            
            if not prompt_hy and not prompt_en and not prompt_ru:
                continue
            
            exercises.append({
                'dict_id': ex_id,
                'lesson_id': lesson_id,
                'type': ex.get('type', ''),
                'order': ex.get('order', 0),
                'prompt_hy': prompt_hy,
                'prompt_en': prompt_en,
                'prompt_ru': prompt_ru,
                'target_answer': ex.get('targetAnswer', '') or ex.get('correctAnswer', ''),
                'audio_id': ex.get('audioId', '') or ex.get('audio_id', '')
            })
    
    print(f"✅ Loaded {len(exercises)} exercises from dictionary")
    return exercises

def create_mapping():
    """Create mapping between dictionary IDs and audio IDs"""
    
    print("=" * 60)
    print("   🔗 CREATE EXERCISE ID MAPPING")
    print("   Connecting dictionary IDs with audio IDs")
    print("=" * 60)
    print()
    
    mapping = parse_audio_mapping()
    exercises = parse_dictionary()
    
    if not mapping or not exercises:
        print("❌ Could not load data")
        return
    
    # ─── FIND MATCHES ─────────────────────────────────────────────────
    
    exercise_map = {}
    matched = 0
    unmatched = []
    
    # Get all mapping keys
    mapping_keys = list(mapping.keys())
    
    for ex in exercises:
        dict_id = ex['dict_id']
        audio_id = ex['audio_id']
        
        # Try different patterns
        found = False
        
        # 1. Direct match
        if dict_id in mapping:
            exercise_map[dict_id] = {
                'dict_id': dict_id,
                'audio_id': mapping[dict_id],
                'matched_by': 'direct'
            }
            matched += 1
            found = True
            continue
        
        # 2. Try with suffixes
        suffixes = ['_prompt', '_answer', '_mc_prompt', '_mc_answer', '_tr_prompt', '_tr_answer']
        for suffix in suffixes:
            key = f"{dict_id}{suffix}"
            if key in mapping:
                exercise_map[dict_id] = {
                    'dict_id': dict_id,
                    'audio_id': mapping[key],
                    'matched_by': f'suffix_{suffix}'
                }
                matched += 1
                found = True
                break
        
        if found:
            continue
        
        # 3. Try by lesson pattern
        parts = dict_id.split('_')
        if len(parts) >= 3:
            lesson = '_'.join(parts[:2])
            for key in mapping_keys:
                if key.startswith(lesson):
                    # Check if it's a prompt or answer
                    if '_prompt' in key or '_mc_prompt' in key or '_tr_prompt' in key:
                        exercise_map[dict_id] = {
                            'dict_id': dict_id,
                            'audio_id': mapping[key],
                            'matched_by': f'lesson_pattern_{key}'
                        }
                        matched += 1
                        found = True
                        break
        
        if not found:
            unmatched.append({
                'dict_id': dict_id,
                'lesson_id': ex['lesson_id'],
                'audio_id': audio_id,
                'prompt_hy': ex['prompt_hy'][:50]
            })
    
    # ─── SAVE MAPPING ─────────────────────────────────────────────────
    
    result = {
        'timestamp': datetime.now().isoformat(),
        'total_exercises': len(exercises),
        'matched': matched,
        'unmatched': len(unmatched),
        'mapping': exercise_map,
        'unmatched_list': unmatched
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Mapping saved: {OUTPUT_FILE}")
    print(f"\n📊 Statistics:")
    print(f"  Total exercises: {len(exercises)}")
    print(f"  ✅ Matched: {matched}")
    print(f"  ❌ Unmatched: {len(unmatched)}")
    
    if unmatched:
        print(f"\n⚠️ First 10 unmatched:")
        for item in unmatched[:10]:
            print(f"  - {item['dict_id']} ({item['lesson_id']})")
    
    # ─── CREATE CSV ──────────────────────────────────────────────────
    
    csv_file = PROJECT_ROOT / 'exercise_id_mapping.csv'
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write("Dictionary ID,Audio ID,Matched By\n")
        for dict_id, data in exercise_map.items():
            f.write(f"{dict_id},{data['audio_id']},{data['matched_by']}\n")
    
    print(f"\n📊 CSV saved: {csv_file}")
    
    print("\n🎉 Done!")

if __name__ == "__main__":
    create_mapping()