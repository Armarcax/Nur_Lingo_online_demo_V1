# scripts/extract_prompt_answer_separate.py
# Run: python scripts/extract_prompt_answer_separate.py

import os
import json
import shutil
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# ─── CONFIG ──────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_BASE = PROJECT_ROOT / 'public' / 'audio' / 'offline'
MAPPING_FILE = PROJECT_ROOT / 'src' / 'lib' / 'content' / 'audio-mapping.ts'
DICT_FILE = PROJECT_ROOT / 'data' / 'dictionaries' / 'lesson-dictionary.json'

# Output directories
OUTPUT_PROMPTS = PROJECT_ROOT / 'extracted_prompts'
OUTPUT_ANSWERS = PROJECT_ROOT / 'extracted_answers'
OUTPUT_ALL = PROJECT_ROOT / 'extracted_all'

VOICE_DIRS = {
    'hy': 'hy_Ani',
    'en': 'en_female', 
    'ru': 'ru_female'
}

# ─── HELPERS ─────────────────────────────────────────────────────────

def parse_audio_mapping():
    """Parse EXERCISE_TO_AUDIO from audio-mapping.ts"""
    mapping = {}
    
    if not MAPPING_FILE.exists():
        print(f"❌ Mapping file not found: {MAPPING_FILE}")
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
    """Parse lesson-dictionary.json to get prompt/answer texts"""
    exercises = []
    
    if not DICT_FILE.exists():
        print(f"❌ Dictionary file not found: {DICT_FILE}")
        return exercises
    
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    lessons = data.get('lessons', [])
    
    for lesson in lessons:
        lesson_id = lesson.get('id', 'unknown')
        
        for ex in lesson.get('exercises', []):
            ex_id = ex.get('id', '')
            ex_type = ex.get('type', '')
            
            # Skip hints and feedbacks
            if '_hint' in ex_id or '_feedback' in ex_id:
                continue
            
            # Get prompt text
            prompt = ex.get('prompt', {})
            if isinstance(prompt, str):
                prompt = {'en': prompt, 'hy': prompt, 'ru': prompt}
            elif not isinstance(prompt, dict):
                prompt = {}
            
            prompt_hy = prompt.get('hy', '')
            prompt_en = prompt.get('en', '')
            prompt_ru = prompt.get('ru', '')
            
            # Skip if no prompt
            if not prompt_hy and not prompt_en and not prompt_ru:
                continue
            
            # Get answer
            target_answer = ex.get('targetAnswer', '') or ex.get('correctAnswer', '')
            
            exercises.append({
                'lesson_id': lesson_id,
                'exercise_id': ex_id,
                'type': ex_type,
                'prompt_hy': prompt_hy,
                'prompt_en': prompt_en,
                'prompt_ru': prompt_ru,
                'target_answer': target_answer,
                'audio_id': ex.get('audioId', '') or ex.get('audio_id', '')
            })
    
    print(f"✅ Loaded {len(exercises)} exercises from dictionary")
    return exercises

def is_prompt_or_answer(key: str) -> bool:
    """Check if key is prompt or answer"""
    if '_hint' in key or '_feedback' in key:
        return False
    if key.endswith('_prompt') or key.endswith('_answer'):
        return True
    if key.endswith('_mc_prompt') or key.endswith('_mc_answer'):
        return True
    if key.endswith('_tr_prompt') or key.endswith('_tr_answer'):
        return True
    return False

def find_matching_audio_id(exercise_id, audio_id, mapping):
    """Find matching audio ID from mapping"""
    
    # 1. Direct match
    if exercise_id in mapping:
        return mapping[exercise_id]
    
    # 2. Check with suffix
    for suffix in ['_prompt', '_answer', '_mc_prompt', '_mc_answer', '_tr_prompt', '_tr_answer']:
        key = f"{exercise_id}{suffix}"
        if key in mapping:
            return mapping[key]
    
    # 3. Check if audio_id exists
    if audio_id:
        for key, value in mapping.items():
            if value == audio_id:
                return value
    
    # 4. Try by pattern
    parts = exercise_id.split('_')
    if len(parts) >= 3:
        lesson = '_'.join(parts[:2])
        for key, value in mapping.items():
            if key.startswith(lesson) and is_prompt_or_answer(key):
                return value
    
    # 5. Try numeric
    numbers = re.findall(r'\d+', exercise_id)
    if numbers:
        num = numbers[-1]
        for key, value in mapping.items():
            if value.endswith(num) or value == num.zfill(6):
                return value
    
    return None

def extract_separate():
    """Main extraction function - separate prompts and answers"""
    print("=" * 60)
    print("   🎵 EXTRACT PROMPTS & ANSWERS SEPARATELY")
    print("   From existing hy_Ani audio library")
    print("=" * 60)
    print()
    
    # Create output directories
    OUTPUT_PROMPTS.mkdir(exist_ok=True, parents=True)
    OUTPUT_ANSWERS.mkdir(exist_ok=True, parents=True)
    OUTPUT_ALL.mkdir(exist_ok=True, parents=True)
    
    # Parse mapping and dictionary
    mapping = parse_audio_mapping()
    if not mapping:
        print("❌ No mapping found")
        return
    
    exercises = parse_dictionary()
    if not exercises:
        print("❌ No exercises found")
        return
    
    # Get existing audio files from hy_Ani
    hy_ani_path = AUDIO_BASE / 'hy_Ani'
    if not hy_ani_path.exists():
        print(f"❌ hy_Ani directory not found: {hy_ani_path}")
        return
    
    existing_audio_ids = set()
    for file_path in hy_ani_path.glob('*.mp3'):
        existing_audio_ids.add(file_path.stem)
    
    print(f"🎵 Found {len(existing_audio_ids)} audio files in hy_Ani")
    print()
    
    # ─── PROCESS EACH EXERCISE ──────────────────────────────────────
    
    prompts = []
    answers = []
    all_files = []
    matched = 0
    unmatched = 0
    unmatched_list = []
    
    for ex in exercises:
        ex_id = ex['exercise_id']
        audio_id = ex.get('audio_id', '')
        prompt_text = ex['prompt_hy'] or ex['prompt_en'] or ''
        answer_text = ex['target_answer'] or ''
        
        # Find matching audio ID
        matched_audio_id = find_matching_audio_id(ex_id, audio_id, mapping)
        
        if not matched_audio_id:
            unmatched += 1
            unmatched_list.append(ex_id)
            continue
        
        # Check if file exists
        if matched_audio_id not in existing_audio_ids:
            unmatched += 1
            unmatched_list.append(f"{ex_id} → {matched_audio_id} (not found)")
            continue
        
        # Copy the audio file
        source_file = hy_ani_path / f"{matched_audio_id}.mp3"
        
        # 1. Copy to prompts directory if it has prompt text
        if prompt_text:
            dest_prompt = OUTPUT_PROMPTS / f"{matched_audio_id}.mp3"
            shutil.copy2(source_file, dest_prompt)
            prompts.append({
                'audio_id': matched_audio_id,
                'exercise_id': ex_id,
                'text': prompt_text[:100],
                'file': str(dest_prompt)
            })
        
        # 2. Copy to answers directory if it has answer text
        if answer_text:
            dest_answer = OUTPUT_ANSWERS / f"{matched_audio_id}.mp3"
            shutil.copy2(source_file, dest_answer)
            answers.append({
                'audio_id': matched_audio_id,
                'exercise_id': ex_id,
                'text': answer_text[:100],
                'file': str(dest_answer)
            })
        
        # 3. Copy to all directory
        dest_all = OUTPUT_ALL / f"{matched_audio_id}.mp3"
        shutil.copy2(source_file, dest_all)
        all_files.append({
            'audio_id': matched_audio_id,
            'exercise_id': ex_id,
            'type': 'prompt' if prompt_text else 'answer',
            'text': prompt_text or answer_text,
            'file': str(dest_all)
        })
        
        matched += 1
    
    print(f"\n✅ Matched: {matched} exercises")
    print(f"❌ Unmatched: {unmatched} exercises")
    if unmatched > 0:
        print(f"   First 10 unmatched: {unmatched_list[:10]}")
    
    # ─── CREATE ORGANIZED STRUCTURE ─────────────────────────────────
    
    # 1. Create CSV with all files
    csv_all = PROJECT_ROOT / 'extracted_prompt_answer_separate.csv'
    with open(csv_all, 'w', encoding='utf-8') as f:
        f.write("Audio ID,Exercise ID,Type,Text,File\n")
        for item in all_files:
            f.write(f"{item['audio_id']},{item['exercise_id']},{item['type']},\"{item['text'][:100]}\",{item['file']}\n")
    
    print(f"\n📊 CSV saved: {csv_all}")
    
    # 2. Create JSON report
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_mappings': len(mapping),
        'total_exercises': len(exercises),
        'matched': matched,
        'unmatched': unmatched,
        'unmatched_list': unmatched_list[:50],
        'prompts_count': len(prompts),
        'answers_count': len(answers),
        'total_files': len(all_files),
        'directories': {
            'prompts': str(OUTPUT_PROMPTS),
            'answers': str(OUTPUT_ANSWERS),
            'all': str(OUTPUT_ALL)
        },
        'sample_prompts': prompts[:10],
        'sample_answers': answers[:10]
    }
    
    report_file = PROJECT_ROOT / 'extraction_separate_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"📁 Report saved: {report_file}")
    
    # ─── CREATE README ──────────────────────────────────────────────
    
    readme = f"""# Extracted Prompts and Answers

Generated: {datetime.now().isoformat()}

## Structure

- **prompts/** - Audio files for questions/prompts ({len(prompts)} files)
- **answers/** - Audio files for answers ({len(answers)} files)
- **all/** - All extracted audio files ({len(all_files)} files)

## Statistics

- Total exercises processed: {len(exercises)}
- Matched: {matched}
- Unmatched: {unmatched}
- Prompts extracted: {len(prompts)}
- Answers extracted: {len(answers)}

## File Naming

Files are named with 6-digit audio IDs (e.g., 000001.mp3)

## Usage

1. Prompts are in: `extracted_prompts/`
2. Answers are in: `extracted_answers/`
3. All files are in: `extracted_all/`

## CSV File

`extracted_prompt_answer_separate.csv` contains the full list with metadata.
"""
    
    readme_file = PROJECT_ROOT / 'EXTRACTED_README.md'
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme)
    
    print(f"📄 README saved: {readme_file}")
    
    # ─── SUMMARY ──────────────────────────────────────────────────────
    
    print("\n" + "=" * 60)
    print("📊 FINAL SUMMARY")
    print("=" * 60)
    print(f"\n  ✅ Prompts extracted: {len(prompts)} files")
    print(f"     📁 {OUTPUT_PROMPTS}")
    print(f"\n  ✅ Answers extracted: {len(answers)} files")
    print(f"     📁 {OUTPUT_ANSWERS}")
    print(f"\n  ✅ All files: {len(all_files)} files")
    print(f"     📁 {OUTPUT_ALL}")
    print(f"\n  📊 CSV: {csv_all}")
    print(f"  📁 Report: {report_file}")
    print(f"  📄 README: {readme_file}")
    
    print("\n🎉 Done!")

if __name__ == "__main__":
    extract_separate()