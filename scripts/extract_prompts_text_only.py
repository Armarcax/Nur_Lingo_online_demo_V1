# scripts/extract_prompts_text_only.py
# Run: python scripts/extract_prompts_text_only.py

import json
import re
from pathlib import Path
from datetime import datetime

# ─── CONFIG ──────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
DICT_FILE = PROJECT_ROOT / 'data' / 'dictionaries' / 'lesson-dictionary.json'
OUTPUT_FILE = PROJECT_ROOT / 'extracted_prompts.txt'
OUTPUT_CSV = PROJECT_ROOT / 'extracted_prompts.csv'

# ─── HELPERS ─────────────────────────────────────────────────────────

def parse_dictionary():
    """Parse lesson-dictionary.json to get prompt texts"""
    prompts = []
    
    if not DICT_FILE.exists():
        print(f"❌ Dictionary file not found: {DICT_FILE}")
        return prompts
    
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    lessons = data.get('lessons', [])
    print(f"✅ Found {len(lessons)} lessons")
    
    for lesson in lessons:
        lesson_id = lesson.get('id', 'unknown')
        
        for ex in lesson.get('exercises', []):
            ex_id = ex.get('id', '')
            
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
            
            prompts.append({
                'lesson_id': lesson_id,
                'exercise_id': ex_id,
                'type': ex.get('type', ''),
                'order': ex.get('order', 0),
                'prompt_hy': prompt_hy,
                'prompt_en': prompt_en,
                'prompt_ru': prompt_ru
            })
    
    print(f"✅ Loaded {len(prompts)} prompts from dictionary")
    return prompts

# ─── MAIN ────────────────────────────────────────────────────────────

def extract_prompts():
    """Extract only prompts as text files"""
    
    print("=" * 60)
    print("   📝 EXTRACT PROMPTS (TEXT ONLY)")
    print("=" * 60)
    print()
    
    prompts = parse_dictionary()
    
    if not prompts:
        print("❌ No prompts found")
        return
    
    # ─── 1. SAVE AS TXT ─────────────────────────────────────────────
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("EXTRACTED PROMPTS (QUESTIONS) FROM LESSON DICTIONARY\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n")
        f.write(f"Total prompts: {len(prompts)}\n")
        f.write("=" * 80 + "\n\n")
        
        current_lesson = ""
        count = 0
        
        for p in sorted(prompts, key=lambda x: (x['lesson_id'], x['order'])):
            if p['lesson_id'] != current_lesson:
                current_lesson = p['lesson_id']
                f.write(f"\n{'=' * 80}\n")
                f.write(f"LESSON: {current_lesson}\n")
                f.write(f"{'=' * 80}\n\n")
            
            count += 1
            f.write(f"[{count}] {p['exercise_id']} ({p['type']})\n")
            
            if p['prompt_hy']:
                f.write(f"  🇦🇲 HY: {p['prompt_hy']}\n")
            if p['prompt_en']:
                f.write(f"  🇬🇧 EN: {p['prompt_en']}\n")
            if p['prompt_ru']:
                f.write(f"  🇷🇺 RU: {p['prompt_ru']}\n")
            
            f.write("\n")
    
    print(f"✅ TXT saved: {OUTPUT_FILE}")
    
    # ─── 2. SAVE AS CSV ─────────────────────────────────────────────
    
    with open(OUTPUT_CSV, 'w', encoding='utf-8') as f:
        f.write("Lesson,Exercise ID,Type,Order,Prompt HY,Prompt EN,Prompt RU\n")
        for p in sorted(prompts, key=lambda x: (x['lesson_id'], x['order'])):
            f.write(f"{p['lesson_id']},{p['exercise_id']},{p['type']},{p['order']},\"{p['prompt_hy']}\",\"{p['prompt_en']}\",\"{p['prompt_ru']}\"\n")
    
    print(f"✅ CSV saved: {OUTPUT_CSV}")
    
    # ─── 3. SAVE HY ONLY ────────────────────────────────────────────
    
    hy_file = PROJECT_ROOT / 'extracted_prompts_hy_only.txt'
    with open(hy_file, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("ՀԱՐՑԱԴՐՈՒՄՆԵՐ (ՄԻԱՅՆ ՀԱՅԵՐԵՆ)\n")
        f.write("=" * 60 + "\n\n")
        
        for p in sorted(prompts, key=lambda x: (x['lesson_id'], x['order'])):
            if p['prompt_hy']:
                f.write(f"{p['prompt_hy']}\n")
    
    print(f"✅ HY only saved: {hy_file}")
    
    # ─── 4. SAVE EN ONLY ────────────────────────────────────────────
    
    en_file = PROJECT_ROOT / 'extracted_prompts_en_only.txt'
    with open(en_file, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("PROMPTS (ENGLISH ONLY)\n")
        f.write("=" * 60 + "\n\n")
        
        for p in sorted(prompts, key=lambda x: (x['lesson_id'], x['order'])):
            if p['prompt_en']:
                f.write(f"{p['prompt_en']}\n")
    
    print(f"✅ EN only saved: {en_file}")
    
    # ─── 5. SAVE RU ONLY ────────────────────────────────────────────
    
    ru_file = PROJECT_ROOT / 'extracted_prompts_ru_only.txt'
    with open(ru_file, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("ПРОМПТЫ (ТОЛЬКО РУССКИЙ)\n")
        f.write("=" * 60 + "\n\n")
        
        for p in sorted(prompts, key=lambda x: (x['lesson_id'], x['order'])):
            if p['prompt_ru']:
                f.write(f"{p['prompt_ru']}\n")
    
    print(f"✅ RU only saved: {ru_file}")
    
    # ─── 6. CREATE SUMMARY ──────────────────────────────────────────
    
    summary = {
        'timestamp': datetime.now().isoformat(),
        'total_prompts': len(prompts),
        'with_hy': len([p for p in prompts if p['prompt_hy']]),
        'with_en': len([p for p in prompts if p['prompt_en']]),
        'with_ru': len([p for p in prompts if p['prompt_ru']]),
        'files': {
            'txt': str(OUTPUT_FILE),
            'csv': str(OUTPUT_CSV),
            'hy_only': str(hy_file),
            'en_only': str(en_file),
            'ru_only': str(ru_file)
        },
        'by_lesson': {}
    }
    
    for p in prompts:
        lesson = p['lesson_id']
        if lesson not in summary['by_lesson']:
            summary['by_lesson'][lesson] = 0
        summary['by_lesson'][lesson] += 1
    
    # ─── PRINT SUMMARY ──────────────────────────────────────────────
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"\n  Total prompts: {len(prompts)}")
    print(f"  With HY: {summary['with_hy']}")
    print(f"  With EN: {summary['with_en']}")
    print(f"  With RU: {summary['with_ru']}")
    print(f"\n  By lesson:")
    for lesson, count in sorted(summary['by_lesson'].items()):
        print(f"    {lesson}: {count}")
    print(f"\n  📁 Files generated:")
    print(f"    - {OUTPUT_FILE}")
    print(f"    - {OUTPUT_CSV}")
    print(f"    - {hy_file}")
    print(f"    - {en_file}")
    print(f"    - {ru_file}")
    
    print("\n🎉 Done!")

if __name__ == "__main__":
    extract_prompts()