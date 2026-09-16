# scripts/extract_prompt_answer_audio.py
# Run: python scripts/extract_prompt_answer_audio.py

import os
import json
import shutil
import re
from pathlib import Path
from datetime import datetime

# ─── CONFIG ──────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
AUDIO_BASE = PROJECT_ROOT / 'public' / 'audio' / 'offline'
MAPPING_FILE = PROJECT_ROOT / 'src' / 'lib' / 'content' / 'audio-mapping.ts'
DICT_FILE = PROJECT_ROOT / 'data' / 'dictionaries' / 'lesson-dictionary.json'
OUTPUT_DIR = PROJECT_ROOT / 'extracted_prompt_answer_audio'

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
    
    # Find EXERCISE_TO_AUDIO block
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
    """Parse lesson-dictionary.json to get prompt/answer texts"""
    exercises = []
    
    if not DICT_FILE.exists():
        print(f"❌ Dictionary file not found: {DICT_FILE}")
        return exercises
    
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    lessons = data.get('lessons', [])
    print(f"✅ Found {len(lessons)} lessons")
    
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
    """Check if key is prompt or answer (not hint/feedback)"""
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
    
    # 2. Check if exercise_id has mapping with suffix
    for suffix in ['_prompt', '_answer', '_mc_prompt', '_mc_answer', '_tr_prompt', '_tr_answer']:
        key = f"{exercise_id}{suffix}"
        if key in mapping:
            return mapping[key]
    
    # 3. Check if audio_id exists in mapping values
    if audio_id:
        for key, value in mapping.items():
            if value == audio_id:
                return value
    
    # 4. Try to find by pattern
    parts = exercise_id.split('_')
    if len(parts) >= 3:
        lesson = '_'.join(parts[:2])
        for key, value in mapping.items():
            if key.startswith(lesson) and is_prompt_or_answer(key):
                return value
    
    # 5. Try numeric extraction
    numbers = re.findall(r'\d+', exercise_id)
    if numbers:
        num = numbers[-1]
        for key, value in mapping.items():
            if value.endswith(num) or value == num.zfill(6):
                return value
    
    return None

def check_audio_files():
    """Check what audio files exist in each directory"""
    print("\n🔍 Checking existing audio files...")
    print(f"   Base path: {AUDIO_BASE}")
    print()
    
    total_files = 0
    for lang, voice_dir in VOICE_DIRS.items():
        dir_path = AUDIO_BASE / voice_dir
        print(f"  📁 {voice_dir}: {dir_path}")
        if dir_path.exists():
            files = list(dir_path.glob('*.mp3'))
            print(f"     ✅ EXISTS: {len(files)} files")
            if len(files) > 0:
                print(f"     Sample: {files[0].name}, {files[-1].name if len(files) > 1 else ''}")
                total_files += len(files)
            else:
                print(f"     ⚠️ Directory is EMPTY")
        else:
            print(f"     ❌ NOT FOUND")
    
    return total_files

def extract_audio_files():
    """Main extraction function"""
    print("=" * 60)
    print("   🎵 EXTRACT PROMPT & ANSWER AUDIO")
    print("   From existing audio library")
    print("=" * 60)
    print()
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
    
    # Check audio files first
    total_audio_files = check_audio_files()
    
    if total_audio_files == 0:
        print("\n⚠️ WARNING: No audio files found!")
        print("   Please check that audio files exist in:")
        print("   - public/audio/offline/hy_Ani/")
        print("   - public/audio/offline/en_female/")
        print("   - public/audio/offline/ru_female/")
        print("\n   Or run: npm run dev and generate audio first")
        return
    
    # Parse mapping
    mapping = parse_audio_mapping()
    if not mapping:
        print("❌ No mapping found")
        return
    
    # Parse dictionary
    exercises = parse_dictionary()
    if not exercises:
        print("❌ No exercises found")
        return
    
    print(f"\n🔍 Matching exercises with audio files...\n")
    
    # ─── FIRST, find all audio IDs that exist ──────────────────────
    
    existing_audio_ids = set()
    for lang, voice_dir in VOICE_DIRS.items():
        dir_path = AUDIO_BASE / voice_dir
        if dir_path.exists():
            for file_path in dir_path.glob('*.mp3'):
                audio_id = file_path.stem
                existing_audio_ids.add(audio_id)
    
    print(f"🎵 Found {len(existing_audio_ids)} existing audio files")
    
    # ─── MATCH EXERCISES ─────────────────────────────────────────────
    
    audio_files = []
    processed_ids = set()
    matched = 0
    unmatched = 0
    unmatched_list = []
    
    for ex in exercises:
        ex_id = ex['exercise_id']
        audio_id = ex.get('audio_id', '')
        
        # Find matching audio ID
        matched_audio_id = find_matching_audio_id(ex_id, audio_id, mapping)
        
        if not matched_audio_id:
            unmatched += 1
            unmatched_list.append(f"{ex_id} (no mapping)")
            continue
        
        # Check if this audio ID exists
        if matched_audio_id not in existing_audio_ids:
            unmatched += 1
            unmatched_list.append(f"{ex_id} → {matched_audio_id} (file not found)")
            continue
        
        # Skip duplicates
        if matched_audio_id in processed_ids:
            continue
        processed_ids.add(matched_audio_id)
        
        # Determine if this is prompt or answer
        is_prompt = bool(ex['prompt_hy'] or ex['prompt_en'] or ex['prompt_ru'])
        text = ex['prompt_hy'] or ex['prompt_en'] or ex['prompt_ru'] or ''
        if not is_prompt:
            text = ex['target_answer'] or ''
        
        # Find which language has this audio
        found_lang = None
        found_path = None
        for lang, voice_dir in VOICE_DIRS.items():
            file_path = AUDIO_BASE / voice_dir / f"{matched_audio_id}.mp3"
            if file_path.exists():
                found_lang = lang
                found_path = file_path
                break
        
        if found_lang and found_path:
            audio_files.append({
                'audio_id': matched_audio_id,
                'exercise_id': ex_id,
                'language': found_lang,
                'voice_dir': VOICE_DIRS[found_lang],
                'file_path': str(found_path),  # ✅ Convert to string
                'type': 'prompt' if is_prompt else 'answer',
                'text': text[:100] if text else '',
                'source_file': f"{VOICE_DIRS[found_lang]}/{matched_audio_id}.mp3",
                'size': found_path.stat().st_size
            })
            matched += 1
    
    print(f"\n✅ Matched: {matched} exercises")
    print(f"❌ Unmatched: {unmatched} exercises")
    if unmatched > 0:
        print(f"   First 10 unmatched: {unmatched_list[:10]}")
    print(f"🎵 Audio files found: {len(audio_files)}")
    
    # ─── COPY TO OUTPUT ──────────────────────────────────────────────
    
    if audio_files:
        print("\n📁 Copying files to output...")
        
        copied = 0
        errors = 0
        
        for audio in audio_files:
            dest_dir = OUTPUT_DIR / audio['voice_dir']
            dest_dir.mkdir(exist_ok=True, parents=True)
            
            dest_file = dest_dir / f"{audio['audio_id']}.mp3"
            
            try:
                shutil.copy2(Path(audio['file_path']), dest_file)
                copied += 1
            except Exception as e:
                print(f"  ❌ Failed to copy {audio['source_file']}: {e}")
                errors += 1
        
        print(f"✅ Copied {copied} files, {errors} errors")
    else:
        print("\n⚠️ No audio files to copy")
    
    # ─── GENERATE REPORT ─────────────────────────────────────────────
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_mappings': len(mapping),
        'existing_audio_files': len(existing_audio_ids),
        'exercises_processed': len(exercises),
        'matched': matched,
        'unmatched': unmatched,
        'unmatched_list': unmatched_list[:50],
        'audio_files_found': len(audio_files),
        'files_copied': copied if audio_files else 0,
        'errors': errors if audio_files else 0,
        'by_language': {},
        'sample_files': audio_files[:10],
        'output_dir': str(OUTPUT_DIR)
    }
    
    # Count by language
    for audio in audio_files:
        lang = audio['language']
        report['by_language'][lang] = report['by_language'].get(lang, 0) + 1
    
    # Save report
    report_file = PROJECT_ROOT / 'extraction_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📁 Report saved: {report_file}")
    
    # ─── SUMMARY ──────────────────────────────────────────────────────
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"  Total mappings: {len(mapping)}")
    print(f"  Existing audio files: {len(existing_audio_ids)}")
    print(f"  Exercises processed: {len(exercises)}")
    print(f"  ✅ Matched: {matched}")
    print(f"  ❌ Unmatched: {unmatched}")
    print(f"  🎵 Audio files found: {len(audio_files)}")
    print(f"  📁 Files copied: {copied if audio_files else 0}")
    print(f"\n  By language:")
    for lang, count in report['by_language'].items():
        print(f"    {lang}: {count} files")
    print(f"\n  Output: {OUTPUT_DIR}")
    
    if unmatched > 0:
        print(f"\n⚠️ {unmatched} exercises could not be matched to audio files")
        print("   Check extraction_report.json for details")
    
    # ─── CREATE CSV ──────────────────────────────────────────────────
    
    if audio_files:
        try:
            csv_file = PROJECT_ROOT / 'extracted_audio_list.csv'
            with open(csv_file, 'w', encoding='utf-8') as f:
                f.write("Audio ID,Exercise ID,Language,Type,Text,Size(bytes),Source File\n")
                for audio in audio_files:
                    f.write(f"{audio['audio_id']},{audio['exercise_id']},{audio['language']},{audio['type']},\"{audio['text'][:100]}\",{audio['size']},{audio['source_file']}\n")
            print(f"\n📊 CSV saved: {csv_file}")
        except PermissionError:
            print(f"\n⚠️ Could not save CSV - file is open in another program")
    
    print("\n🎉 Done!")

if __name__ == "__main__":
    extract_audio_files()