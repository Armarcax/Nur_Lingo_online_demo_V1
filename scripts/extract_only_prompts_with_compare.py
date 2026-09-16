# scripts/extract_only_prompts_with_compare.py
# Run: python scripts/extract_only_prompts_with_compare.py

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

OUTPUT_DIR = PROJECT_ROOT / 'extracted_prompts_only'

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
    
    print(f"✅ Loaded {len(mapping)} mappings from audio-mapping.ts")
    return mapping

def parse_dictionary():
    """Parse lesson-dictionary.json to get prompt texts"""
    exercises = []
    
    if not DICT_FILE.exists():
        print(f"❌ Dictionary file not found: {DICT_FILE}")
        return exercises
    
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    lessons = data.get('lessons', [])
    print(f"✅ Found {len(lessons)} lessons in dictionary")
    
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
            
            exercises.append({
                'lesson_id': lesson_id,
                'exercise_id': ex_id,
                'type': ex_type,
                'order': ex.get('order', 0),
                'prompt_hy': prompt_hy,
                'prompt_en': prompt_en,
                'prompt_ru': prompt_ru,
                'audio_id': ex.get('audioId', '') or ex.get('audio_id', ''),
                'target_answer': ex.get('targetAnswer', '') or ex.get('correctAnswer', '')
            })
    
    print(f"✅ Loaded {len(exercises)} exercises from dictionary")
    return exercises

def is_prompt_key(key: str) -> bool:
    """Check if key is a prompt (not hint/feedback/answer)"""
    if '_hint' in key or '_feedback' in key:
        return False
    if key.endswith('_answer') or key.endswith('_mc_answer') or key.endswith('_tr_answer'):
        return False
    if key.endswith('_prompt') or key.endswith('_mc_prompt') or key.endswith('_tr_prompt'):
        return True
    return False

def find_matching_prompt_audio(exercise_id, audio_id, mapping):
    """Find matching audio ID for prompt"""
    
    # 1. Try with _prompt suffix first
    for suffix in ['_prompt', '_mc_prompt', '_tr_prompt']:
        key = f"{exercise_id}{suffix}"
        if key in mapping:
            return mapping[key]
    
    # 2. Try with language prefix + _prompt
    for lang in ['hy', 'en', 'ru']:
        for suffix in ['_prompt', '_mc_prompt', '_tr_prompt']:
            key = f"{lang}_{exercise_id}{suffix}"
            if key in mapping:
                return mapping[key]
    
    # 3. Direct match if it's a prompt key
    if exercise_id in mapping and is_prompt_key(exercise_id):
        return mapping[exercise_id]
    
    # 4. Check if audio_id exists
    if audio_id:
        for key, value in mapping.items():
            if value == audio_id and is_prompt_key(key):
                return value
    
    # 5. Try by pattern
    parts = exercise_id.split('_')
    if len(parts) >= 3:
        lesson = '_'.join(parts[:2])
        for key, value in mapping.items():
            if key.startswith(lesson) and is_prompt_key(key):
                return value
    
    # 6. Try numeric
    numbers = re.findall(r'\d+', exercise_id)
    if numbers:
        num = numbers[-1]
        for key, value in mapping.items():
            if is_prompt_key(key) and (value.endswith(num) or value == num.zfill(6)):
                return value
    
    return None

def extract_only_prompts():
    """Extract only prompts from audio library with dictionary comparison"""
    print("=" * 60)
    print("   🎵 EXTRACT ONLY PROMPTS (with Dictionary Comparison)")
    print("=" * 60)
    print()
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
    
    # Parse mapping and dictionary
    mapping = parse_audio_mapping()
    if not mapping:
        print("❌ No mapping found")
        return
    
    exercises = parse_dictionary()
    if not exercises:
        print("❌ No exercises found in dictionary")
        return
    
    # Get existing audio files
    hy_ani_path = AUDIO_BASE / 'hy_Ani'
    if not hy_ani_path.exists():
        print(f"❌ hy_Ani directory not found: {hy_ani_path}")
        return
    
    existing_audio_ids = set()
    for file_path in hy_ani_path.glob('*.mp3'):
        existing_audio_ids.add(file_path.stem)
    
    print(f"🎵 Found {len(existing_audio_ids)} audio files in hy_Ani")
    print()
    
    # ─── STATISTICS ──────────────────────────────────────────────────
    
    stats = {
        'total_exercises': len(exercises),
        'with_prompt_hy': 0,
        'with_prompt_en': 0,
        'with_prompt_ru': 0,
        'with_audio_id': 0,
        'matched_audio': 0,
        'unmatched_audio': 0,
        'no_audio_file': 0,
        'by_lesson': defaultdict(lambda: {'total': 0, 'matched': 0, 'unmatched': 0})
    }
    
    # ─── PROCESS EACH EXERCISE ──────────────────────────────────────
    
    prompts = []
    prompt_texts = []
    matched_list = []
    unmatched_list = []
    no_audio_file_list = []
    
    for ex in exercises:
        ex_id = ex['exercise_id']
        lesson_id = ex['lesson_id']
        audio_id = ex.get('audio_id', '')
        prompt_hy = ex['prompt_hy']
        prompt_en = ex['prompt_en']
        prompt_ru = ex['prompt_ru']
        
        # Count prompts by language
        if prompt_hy:
            stats['with_prompt_hy'] += 1
        if prompt_en:
            stats['with_prompt_en'] += 1
        if prompt_ru:
            stats['with_prompt_ru'] += 1
        if audio_id:
            stats['with_audio_id'] += 1
        
        stats['by_lesson'][lesson_id]['total'] += 1
        
        # Skip if no prompt text
        if not prompt_hy and not prompt_en and not prompt_ru:
            continue
        
        # Find matching audio ID for prompt
        matched_audio_id = find_matching_prompt_audio(ex_id, audio_id, mapping)
        
        if not matched_audio_id:
            stats['unmatched_audio'] += 1
            stats['by_lesson'][lesson_id]['unmatched'] += 1
            unmatched_list.append({
                'exercise_id': ex_id,
                'lesson_id': lesson_id,
                'audio_id': audio_id,
                'prompt_hy': prompt_hy[:50],
                'reason': 'No audio ID found in mapping'
            })
            continue
        
        # Check if file exists
        if matched_audio_id not in existing_audio_ids:
            stats['no_audio_file'] += 1
            stats['by_lesson'][lesson_id]['unmatched'] += 1
            no_audio_file_list.append({
                'exercise_id': ex_id,
                'lesson_id': lesson_id,
                'audio_id': matched_audio_id,
                'prompt_hy': prompt_hy[:50],
                'reason': f'File {matched_audio_id}.mp3 not found'
            })
            continue
        
        # Copy the audio file
        source_file = hy_ani_path / f"{matched_audio_id}.mp3"
        dest_file = OUTPUT_DIR / f"{matched_audio_id}.mp3"
        
        shutil.copy2(source_file, dest_file)
        
        stats['matched_audio'] += 1
        stats['by_lesson'][lesson_id]['matched'] += 1
        
        # Store prompt info
        prompt_text = prompt_hy or prompt_en or prompt_ru
        prompts.append({
            'audio_id': matched_audio_id,
            'exercise_id': ex_id,
            'lesson_id': lesson_id,
            'prompt_hy': prompt_hy,
            'prompt_en': prompt_en,
            'prompt_ru': prompt_ru,
            'text': prompt_text,
            'file': str(dest_file)
        })
        
        prompt_texts.append({
            'audio_id': matched_audio_id,
            'exercise_id': ex_id,
            'lesson_id': lesson_id,
            'prompt_hy': prompt_hy,
            'prompt_en': prompt_en,
            'prompt_ru': prompt_ru,
            'target_answer': ex.get('target_answer', ''),
            'file': f"{matched_audio_id}.mp3"
        })
        
        matched_list.append(ex_id)
    
    # ─── PRINT STATISTICS ────────────────────────────────────────────
    
    print("\n📊 COMPARISON STATISTICS:")
    print("-" * 60)
    print(f"  Total exercises in dictionary: {stats['total_exercises']}")
    print(f"  With HY prompt: {stats['with_prompt_hy']}")
    print(f"  With EN prompt: {stats['with_prompt_en']}")
    print(f"  With RU prompt: {stats['with_prompt_ru']}")
    print(f"  With audioId in dictionary: {stats['with_audio_id']}")
    print()
    print(f"  ✅ Matched audio files: {stats['matched_audio']}")
    print(f"  ❌ Unmatched (no mapping): {stats['unmatched_audio']}")
    print(f"  ❌ Unmatched (no file): {stats['no_audio_file']}")
    print(f"  📁 Total prompts extracted: {len(prompts)}")
    
    # ─── SHOW UNMATCHED ─────────────────────────────────────────────
    
    if unmatched_list:
        print(f"\n⚠️ First 10 unmatched (no mapping):")
        for item in unmatched_list[:10]:
            print(f"  - {item['lesson_id']}/{item['exercise_id']} → {item['reason']}")
    
    if no_audio_file_list:
        print(f"\n⚠️ First 10 unmatched (file not found):")
        for item in no_audio_file_list[:10]:
            print(f"  - {item['lesson_id']}/{item['exercise_id']} → {item['reason']}")
    
    # ─── SHOW BY LESSON ─────────────────────────────────────────────
    
    print(f"\n📚 Summary by lesson:")
    print("-" * 60)
    for lesson_id, data in sorted(stats['by_lesson'].items()):
        coverage = (data['matched'] / data['total'] * 100) if data['total'] > 0 else 0
        status = "✅" if coverage == 100 else "⚠️" if coverage >= 70 else "❌"
        print(f"  {status} {lesson_id}: {data['matched']}/{data['total']} ({coverage:.0f}%)")
    
    # ─── CREATE CSV ──────────────────────────────────────────────────
    
    csv_file = PROJECT_ROOT / 'extracted_prompts_with_compare.csv'
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write("Audio ID,Lesson,Exercise ID,Prompt (HY),Prompt (EN),Prompt (RU),Target Answer,File\n")
        for item in prompt_texts:
            f.write(f"{item['audio_id']},{item['lesson_id']},{item['exercise_id']},\"{item['prompt_hy']}\",\"{item['prompt_en']}\",\"{item['prompt_ru']}\",\"{item['target_answer']}\",{item['file']}\n")
    
    print(f"\n📊 CSV saved: {csv_file}")
    
    # ─── CREATE COMPARISON REPORT ────────────────────────────────────
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'dictionary_file': str(DICT_FILE),
        'mapping_file': str(MAPPING_FILE),
        'total_mappings': len(mapping),
        'total_exercises': stats['total_exercises'],
        'with_prompt_hy': stats['with_prompt_hy'],
        'with_prompt_en': stats['with_prompt_en'],
        'with_prompt_ru': stats['with_prompt_ru'],
        'matched_audio': stats['matched_audio'],
        'unmatched_audio': stats['unmatched_audio'],
        'no_audio_file': stats['no_audio_file'],
        'coverage': f"{stats['matched_audio'] / stats['total_exercises'] * 100:.1f}%",
        'by_lesson': {k: dict(v) for k, v in stats['by_lesson'].items()},
        'unmatched_list': unmatched_list[:50],
        'no_audio_file_list': no_audio_file_list[:50],
        'output_dir': str(OUTPUT_DIR),
        'sample_prompts': prompts[:10]
    }
    
    report_file = PROJECT_ROOT / 'extracted_prompts_comparison_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"📁 Report saved: {report_file}")
    
    # ─── CREATE README ──────────────────────────────────────────────
    
    readme = f"""# Extracted Prompts with Dictionary Comparison

Generated: {datetime.now().isoformat()}

## Statistics

- Total exercises in dictionary: {stats['total_exercises']}
- ✅ Matched audio files: {stats['matched_audio']}
- ❌ Unmatched (no mapping): {stats['unmatched_audio']}
- ❌ Unmatched (no file): {stats['no_audio_file']}
- 📈 Coverage: {stats['matched_audio'] / stats['total_exercises'] * 100:.1f}%

## Comparison with Dictionary

| Field | Count |
|-------|-------|
| Exercises with HY prompt | {stats['with_prompt_hy']} |
| Exercises with EN prompt | {stats['with_prompt_en']} |
| Exercises with RU prompt | {stats['with_prompt_ru']} |
| Exercises with audioId | {stats['with_audio_id']} |

## Output Files

- **Prompts**: `extracted_prompts_only/` ({stats['matched_audio']} files)
- **CSV**: `extracted_prompts_with_compare.csv`
- **Report**: `extracted_prompts_comparison_report.json`

## By Lesson Summary

{chr(10).join([f"- {k}: {d['matched']}/{d['total']} ({d['matched']/d['total']*100:.0f}%)" for k, d in sorted(stats['by_lesson'].items())])}
"""
    
    readme_file = PROJECT_ROOT / 'EXTRACTED_PROMPTS_COMPARISON_README.md'
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme)
    
    print(f"📄 README saved: {readme_file}")
    
    # ─── FINAL SUMMARY ──────────────────────────────────────────────
    
    print("\n" + "=" * 60)
    print("📊 FINAL SUMMARY")
    print("=" * 60)
    print(f"\n  📚 Total exercises: {stats['total_exercises']}")
    print(f"  ✅ Matched prompts: {stats['matched_audio']} ({stats['matched_audio']/stats['total_exercises']*100:.1f}%)")
    print(f"  ❌ Unmatched: {stats['unmatched_audio'] + stats['no_audio_file']}")
    print(f"\n  📁 Prompts saved: {OUTPUT_DIR}")
    print(f"  📊 CSV: {csv_file}")
    print(f"  📁 Report: {report_file}")
    
    print("\n🎉 Done!")

if __name__ == "__main__":
    extract_only_prompts()