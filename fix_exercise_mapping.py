# fix_exercise_mapping.py

import json
import re
from pathlib import Path

def create_exercise_mapping():
    """Ստեղծել exercise → audio ID mapping"""
    
    # 1. Բեռնել lesson-dictionary.json
    lesson_path = Path('data/dictionaries/lesson-dictionary.json')
    with open(lesson_path, 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    # 2. Բեռնել audio-num-mapping.json
    mapping_path = Path('src/lib/content/audio-num-mapping.json')
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_data = json.load(f)
    
    audio_to_num = mapping_data.get('audioToNum', {})
    
    # 3. Create exercise → audio ID mapping
    exercise_to_audio = {}
    
    # Greet words mapping (w1_l1 - w1_l5)
    greet_words = ['hello', 'hi', 'morning', 'day', 'evening', 'night', 'bye', 'seeyou', 'welcome', 'pleasure', 'meet', 'name', 'friend', 'mr', 'mrs', 'thanks', 'please', 'sorry', 'yes', 'no', 'how', 'good', 'fine', 'bad', 'okay']
    
    # For each exercise, find corresponding audio
    for lesson in lesson_data.get('lessons', []):
        lesson_id = lesson.get('id', '')
        
        # Extract world and lesson numbers
        match = re.match(r'w(\d+)_l(\d+)', lesson_id)
        if not match:
            continue
        
        world = int(match.group(1))
        lesson_num = int(match.group(2))
        
        for exercise in lesson.get('exercises', []):
            ex_id = exercise.get('id', '')
            
            # Skip if already has audioId
            if 'audioId' in exercise:
                continue
            
            # Extract exercise type and number
            if '_mc_' in ex_id:
                ex_type = 'mc'
                ex_num = re.search(r'_mc_(\d+)', ex_id)
                if ex_num:
                    idx = int(ex_num.group(1))
                    # Map to greet word
                    if idx < len(greet_words):
                        word = greet_words[idx]
                        key = f"greet_{word}_mc_prompt"
                        if key in audio_to_num:
                            exercise['audioId'] = audio_to_num[key]
                            exercise_to_audio[ex_id] = audio_to_num[key]
                            print(f"✅ {ex_id} → {key} → {audio_to_num[key]}")
            
            elif '_tr_' in ex_id:
                ex_type = 'tr'
                ex_num = re.search(r'_tr_(\d+)', ex_id)
                if ex_num:
                    idx = int(ex_num.group(1))
                    if idx < len(greet_words):
                        word = greet_words[idx]
                        key = f"greet_{word}_tr_answer"
                        if key in audio_to_num:
                            exercise['audioId'] = audio_to_num[key]
                            exercise_to_audio[ex_id] = audio_to_num[key]
                            print(f"✅ {ex_id} → {key} → {audio_to_num[key]}")
    
    # 4. Save
    with open(lesson_path, 'w', encoding='utf-8') as f:
        json.dump(lesson_data, f, ensure_ascii=False, indent=2)
    
    # 5. Save mapping
    mapping_file = Path('src/lib/content/exercise-to-audio.json')
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(exercise_to_audio, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Added {len(exercise_to_audio)} exercise audio IDs")
    print(f"📁 Saved to: {mapping_file}")

if __name__ == "__main__":
    create_exercise_mapping()