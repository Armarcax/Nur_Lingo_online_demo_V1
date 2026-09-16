# fix_audio_ids_correct.py

import json
import re
from pathlib import Path

def fix_audio_ids():
    lesson_path = Path('data/dictionaries/lesson-dictionary.json')
    mapping_path = Path('src/lib/content/mappings/audio-num-hy-mapping.json')
    
    # 1. Բեռնել տվյալները
    with open(lesson_path, 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_data = json.load(f)
    
    audio_to_num = mapping_data.get('mapping', {})
    
    # 2. Ուղղել audioId-ները
    fixed = 0
    skipped = 0
    
    for lesson in lesson_data.get('lessons', []):
        for exercise in lesson.get('exercises', []):
            ex_id = exercise.get('id', '')
            
            # ✅ Որոշել exercise-ի տեսակը
            if '_mc_' in ex_id:
                # Multiple choice → _mc_prompt
                base = re.sub(r'_\d+$', '', ex_id)
                key = f"{base}_prompt"
            elif '_tr_' in ex_id:
                # Translate → _tr_answer
                base = re.sub(r'_\d+$', '', ex_id)
                key = f"{base}_answer"
            elif '_match_' in ex_id:
                # Match pairs → _match_prompt
                base = re.sub(r'_\d+$', '', ex_id)
                key = f"{base}_prompt"
            elif '_listen_' in ex_id:
                # Listening → _listen_prompt
                base = re.sub(r'_\d+$', '', ex_id)
                key = f"{base}_prompt"
            else:
                # Default
                base = re.sub(r'_\d+$', '', ex_id)
                key = f"{base}_prompt"
            
            # ✅ Գտնել audioId-ն mapping-ում
            audio_id = audio_to_num.get(key)
            
            if audio_id:
                exercise['audioId'] = audio_id
                fixed += 1
                print(f"✅ {ex_id} → {key} → {audio_id}")
            else:
                print(f"⚠️ {ex_id} → {key} → NOT FOUND")
                skipped += 1
    
    # 3. Պահպանել
    with open(lesson_path, 'w', encoding='utf-8') as f:
        json.dump(lesson_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Fixed: {fixed} exercises")
    print(f"⚠️ Skipped: {skipped} exercises (no matching audioId)")

if __name__ == "__main__":
    fix_audio_ids()