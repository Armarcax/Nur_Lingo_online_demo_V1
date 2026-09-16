# add_phrases_to_lessons.py

import json
import re
from pathlib import Path
from datetime import datetime

def add_phrases_to_lessons():
    """Ավելացնել phrases դաշտը lesson-dictionary.json-ի յուրաքանչյուր դասի համար"""
    
    # Ֆայլի ճանապարհը
    file_path = Path(r'C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2\data\dictionaries\lesson-dictionary.json')
    
    if not file_path.exists():
        print(f"❌ Ֆայլը բացակայում է: {file_path}")
        return
    
    # 1. Backup անել
    backup_path = file_path.with_suffix('.json.bak')
    import shutil
    shutil.copy2(file_path, backup_path)
    print(f"✅ Backup ստեղծվեց: {backup_path}")
    
    # 2. Բեռնել JSON-ը
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 3. Ստուգել կառուցվածքը
    if 'lessons' not in data:
        print("❌ 'lessons' բանալին բացակայում է")
        return
    
    lessons = data['lessons']
    print(f"📊 Գտնվել է {len(lessons)} դաս")
    
    # 4. Ավելացնել phrases յուրաքանչյուր դասի
    added_count = 0
    already_have = 0
    
    for i, lesson in enumerate(lessons):
        # Ստուգել արդյոք phrases-ը կա
        if 'phrases' in lesson and lesson['phrases']:
            already_have += 1
            continue
        
        # Ստեղծել phrases-ը vocabulary-ից
        phrases = []
        if 'vocabulary' in lesson and lesson['vocabulary']:
            for vocab in lesson['vocabulary']:
                # Վերցնել բառերը
                hy_word = vocab.get('hy', '')
                en_word = vocab.get('en', '')
                ru_word = vocab.get('ru', '')
                
                if hy_word and en_word:
                    phrases.append({
                        'id': f"{vocab.get('id', '')}_phrase",
                        'hy': hy_word,
                        'en': en_word,
                        'ru': ru_word or en_word,
                        'audioId': vocab.get('audioId', '')
                    })
        
        # Ավելացնել phrases
        lesson['phrases'] = phrases
        added_count += 1
        
        if i < 5:  # Ցույց տալ առաջին 5-ը
            print(f"  📝 Դաս {i+1}: ավելացվեց {len(phrases)} phrase")
    
    print(f"\n📊 Վիճակագրություն:")
    print(f"  ✅ Ավելացվեց: {added_count} դասի")
    print(f"  ⚠️ Արդեն կար: {already_have} դասի")
    
    # 5. Թարմացնել metadata-ն
    if 'metadata' in data:
        total_phrases = sum(len(lesson.get('phrases', [])) for lesson in lessons)
        data['metadata']['totalPhrases'] = total_phrases
    
    # 6. Թարմացնել generatedAt
    data['generatedAt'] = datetime.now().isoformat()
    
    # 7. Պահպանել
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Ֆայլը թարմացվեց: {file_path}")
    print(f"📊 Ընդհանուր phrases: {sum(len(lesson.get('phrases', [])) for lesson in lessons)}")

def verify_phrases():
    """Ստուգել արդյոք phrases-ը ավելացվել է"""
    
    file_path = Path(r'C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2\data\dictionaries\lesson-dictionary.json')
    
    if not file_path.exists():
        print(f"❌ Ֆայլը բացակայում է: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n" + "="*60)
    print("📋 ՍՏՈՒԳՈՒՄ")
    print("="*60)
    
    lessons = data.get('lessons', [])
    total_phrases = 0
    lessons_with_phrases = 0
    
    for lesson in lessons:
        phrases = lesson.get('phrases', [])
        if phrases:
            lessons_with_phrases += 1
            total_phrases += len(phrases)
    
    print(f"📊 Ընդհանուր դասեր: {len(lessons)}")
    print(f"📊 Դասեր phrases-ով: {lessons_with_phrases}")
    print(f"📊 Ընդհանուր phrases: {total_phrases}")
    
    # Ցույց տալ առաջին 3 դասի phrases-ը
    print("\n📝 ԱՌԱՋԻՆ 3 ԴԱՍԻ PHRASES:")
    for i, lesson in enumerate(lessons[:3]):
        phrases = lesson.get('phrases', [])
        print(f"\n  Դաս {i+1}: {lesson.get('title', {}).get('en', 'N/A')}")
        for j, phrase in enumerate(phrases[:3]):
            print(f"    {j+1}. {phrase.get('hy')} → {phrase.get('en')}")

if __name__ == "__main__":
    print("\n🔧 PHRASES ԱՎԵԼԱՑՆԵԼՈՒ ՍԿՐԻՊՏ")
    print("="*60)
    
    # 1. Ավելացնել phrases
    add_phrases_to_lessons()
    
    # 2. Ստուգել
    verify_phrases()
    
    print("\n✅ Սկրիպտն ավարտված է")
    print("💡 Հիմա build արեք:")
    print("   npm run build")