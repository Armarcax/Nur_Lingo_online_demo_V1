# add_audio_ids.py

import json
import re
from pathlib import Path

def add_audio_ids():
    lesson_path = Path('data/dictionaries/lesson-dictionary.json')
    mapping_path = Path('src/lib/content/mappings/audio-num-hy-mapping.json')
    
    # 1. Բեռնել lesson-dictionary.json-ը
    with open(lesson_path, 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    # 2. Բեռնել mapping-ը
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_data = json.load(f)
    
    audio_to_num = mapping_data.get('mapping', {})
    
    # 3. Ավելացնել audioId
    added = 0
    already = 0
    
    for lesson in lesson_data.get('lessons', []):
        for exercise in lesson.get('exercises', []):
            if 'audioId' in exercise:
                already += 1
                continue
            
            ex_id = exercise.get('id', '')
            
            # Փորձել գտնել համապատասխան audioId
            audio_id = None
            
            # 1. Direct lookup
            if ex_id in audio_to_num:
                audio_id = audio_to_num[ex_id]
            
            # 2. w1_l1_mc_0 → w1_l1_mc_prompt
            if not audio_id:
                base = re.sub(r'_\d+$', '', ex_id)
                for suffix in ['_prompt', '_answer', '_hint', '_feedback_correct', '_feedback_incorrect']:
                    key = f"{base}{suffix}"
                    if key in audio_to_num:
                        audio_id = audio_to_num[key]
                        break
            
            # 3. w1_l1_mc_0 → greet_hello_mc_prompt
            if not audio_id:
                # Extract world and lesson
                match = re.match(r'w(\d+)_l(\d+)', ex_id)
                if match:
                    world = match.group(1)
                    lesson_num = match.group(2)
                    # Try to find in mapping
                    for key in audio_to_num:
                        if f'_mc_prompt' in key and key.startswith('greet_'):
                            audio_id = audio_to_num[key]
                            break
            
            if audio_id:
                exercise['audioId'] = audio_id
                added += 1
                print(f"✅ Added audioId {audio_id} to {ex_id}")
            else:
                print(f"⚠️ Could not find audioId for {ex_id}")
    
    # 4. Պահպանել
    with open(lesson_path, 'w', encoding='utf-8') as f:
        json.dump(lesson_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Added {added} audioIds")
    print(f"ℹ️ Already had {already} audioIds")

if __name__ == "__main__":
    add_audio_ids()