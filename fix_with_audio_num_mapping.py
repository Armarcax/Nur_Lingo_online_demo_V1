# fix_with_audio_num_mapping.py

import json
import re
from pathlib import Path

def fix_audio_ids_with_audio_num():
    lesson_path = Path('data/dictionaries/lesson-dictionary.json')
    
    # ✅ ՕԳՏԱԳՈՐԾԵԼ audio-num-mapping.json-ը
    mapping_path = Path('src/lib/content/audio-num-mapping.json')
    
    # 1. Բեռնել տվյալները
    with open(lesson_path, 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_data = json.load(f)
    
    # ✅ audioToNum-ը պարունակում է 25,099 entry
    audio_to_num = mapping_data.get('audioToNum', {})
    
    print(f"📊 audio-num-mapping.json has {len(audio_to_num)} entries")
    
    # 2. Ավելացնել audioId-ներ
    fixed = 0
    skipped = 0
    fixed_examples = []
    skipped_examples = []
    
    for lesson in lesson_data.get('lessons', []):
        for exercise in lesson.get('exercises', []):
            ex_id = exercise.get('id', '')
            
            # ✅ Փնտրել ուղղակի
            if ex_id in audio_to_num:
                audio_id = audio_to_num[ex_id]
                exercise['audioId'] = audio_id
                fixed += 1
                if len(fixed_examples) < 5:
                    fixed_examples.append(f"{ex_id} → {audio_id}")
                continue
            
            # ✅ w1_l1_mc_0 → w1_l1_mc_prompt
            base = re.sub(r'_\d+$', '', ex_id)
            
            # Փորձել տարբեր վերջավորություններ
            suffixes = ['_prompt', '_answer', '_hint', '_feedback_correct', '_feedback_incorrect']
            found = False
            
            for suffix in suffixes:
                key = f"{base}{suffix}"
                if key in audio_to_num:
                    audio_id = audio_to_num[key]
                    exercise['audioId'] = audio_id
                    fixed += 1
                    if len(fixed_examples) < 5:
                        fixed_examples.append(f"{ex_id} → {key} → {audio_id}")
                    found = True
                    break
            
            if not found:
                skipped += 1
                if len(skipped_examples) < 5:
                    skipped_examples.append(ex_id)
    
    # 3. Պահպանել
    with open(lesson_path, 'w', encoding='utf-8') as f:
        json.dump(lesson_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Fixed: {fixed} exercises")
    print(f"⚠️ Skipped: {skipped} exercises")
    
    if fixed_examples:
        print(f"\n📝 Fixed examples:")
        for ex in fixed_examples:
            print(f"  {ex}")
    
    if skipped_examples:
        print(f"\n⚠️ Skipped examples:")
        for ex in skipped_examples:
            print(f"  {ex}")

if __name__ == "__main__":
    fix_audio_ids_with_audio_num()