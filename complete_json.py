#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
import os
from pathlib import Path

def analyze_json_structure(data):
    """
    Վերլուծում է JSON-ի կառուցվածքը և գտնում բոլոր բանալիները
    """
    pattern = re.compile(r'^w(\d+)_l(\d+)_(mc|tr)_(\d+)$')
    
    max_week = 0
    max_lesson = 0
    max_exercise = 0
    existing_keys = set()
    
    for key in data.keys():
        match = pattern.match(key)
        if match:
            week = int(match.group(1))
            lesson = int(match.group(2))
            exercise = int(match.group(4))
            
            max_week = max(max_week, week)
            max_lesson = max(max_lesson, lesson)
            max_exercise = max(max_exercise, exercise)
            existing_keys.add(key)
    
    # Գտնել w1_l1_e* բանալիները
    e_keys = {}
    for key in data.keys():
        if key.startswith('w1_l1_e'):
            e_keys[key] = data[key]
    
    return {
        'max_week': max_week,
        'max_lesson': max_lesson,
        'max_exercise': max_exercise,
        'existing_keys': existing_keys,
        'e_keys': e_keys,
        'total_keys': len(data)
    }

def generate_value(week, lesson, exercise, exercise_type, existing_data, max_exercise):
    """
    Ստեղծում է արժեք բանալու համար
    """
    # Փորձել գտնել նույն w,l-ի արժեք
    for e in range(max_exercise + 1):
        test_key = f"w{week}_l{lesson}_{exercise_type}_{e}"
        if test_key in existing_data:
            return existing_data[test_key]
    
    # Փորձել գտնել նույն w-ում
    for l in range(1, 11):  # max 10 lessons
        for e in range(max_exercise + 1):
            test_key = f"w{week}_l{l}_{exercise_type}_{e}"
            if test_key in existing_data:
                return existing_data[test_key]
    
    # Default արժեք՝ հիմնված pattern-ի վրա
    base = (lesson - 1) * 50 + exercise * 10
    if exercise_type == 'mc':
        value = base + 6
    else:  # tr
        value = base + 32
    
    return str(value).zfill(6)

def get_w1_l1_e_values():
    """
    Վերադարձնում է w1_l1_e* բանալիների արժեքները
    """
    return {
        'w1_l1_e0': 'greet_hello',
        'w1_l1_e1': 'greet_hi',
        'w1_l1_e2': 'greet_morning',
        'w1_l1_e3': 'greet_day',
        'w1_l1_e4': 'greet_evening',
        'w1_l1_e5': 'greet_night',
        'w1_l1_e6': 'greet_hello',
        'w1_l1_e7': 'greet_thank_you',
        'w1_l1_e8': 'greet_what',
        'w1_l1_e9': 'greet_name',
        'w1_l1_e10': 'greet_nice',
        'w1_l1_e11': 'greet_too',
        'w1_l1_e12': 'greet_morning',
        'w1_l1_e13': 'greet_evening',
        'w1_l1_e14': 'greet_bye',
        'w1_l1_e15': 'greet_match',
        'w1_l1_e16': 'greet_nice'
    }

def main():
    # Ֆայլի ուղի
    script_dir = Path(__file__).parent
    json_path = script_dir / 'src' / 'lib' / 'content' / 'exercise-to-audio.json'
    
    # Եթե ֆայլը չկա, փնտրել ընթացիկ գրացուցակում
    if not json_path.exists():
        json_path = Path('exercise-to-audio.json')
    
    if not json_path.exists():
        print(f"❌ Ֆայլը չի գտնվել: {json_path}")
        print("📁 Խնդրում եմ նշեք ճիշտ ուղին կամ տեղափոխեք ֆայլը սկրիպտի մոտ")
        return
    
    print(f"📁 Ֆայլ: {json_path}")
    print("=" * 60)
    
    # Կարդալ JSON-ը
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ JSON-ը հաջողությամբ բացվեց")
        print(f"📊 Առկա բանալիներ: {len(data)}")
    except Exception as e:
        print(f"❌ Սխալ JSON-ը կարդալիս: {e}")
        return
    
    # Վերլուծել կառուցվածքը
    analysis = analyze_json_structure(data)
    print(f"\n📊 Վերլուծության արդյունքներ:")
    print(f"   Առավելագույն շաբաթ (week): {analysis['max_week']}")
    print(f"   Առավելագույն դաս (lesson): {analysis['max_lesson']}")
    print(f"   Առավելագույն վարժություն (exercise): {analysis['max_exercise']}")
    print(f"   w1_l1_e* բանալիներ: {len(analysis['e_keys'])}")
    
    # Լրացնել w*_l*_* բանալիները
    print("\n🔄 Լրացնում ենք w*_l*_* բանալիները...")
    added_count = 0
    
    for week in range(1, analysis['max_week'] + 1):
        for lesson in range(1, analysis['max_lesson'] + 1):
            for exercise in range(analysis['max_exercise'] + 1):
                for exercise_type in ['mc', 'tr']:
                    key = f"w{week}_l{lesson}_{exercise_type}_{exercise}"
                    if key not in data:
                        value = generate_value(
                            week, lesson, exercise, exercise_type, 
                            data, analysis['max_exercise']
                        )
                        data[key] = value
                        added_count += 1
    
    # Ավելացնել w1_l1_e* բանալիները
    print("🔄 Լրացնում ենք w1_l1_e* բանալիները...")
    w1_l1_e_values = get_w1_l1_e_values()
    e_added = 0
    
    for key, value in w1_l1_e_values.items():
        if key not in data:
            data[key] = value
            e_added += 1
    
    # Պահպանել
    print("\n💾 Պահպանում ենք թարմացված JSON-ը...")
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Ֆայլը հաջողությամբ պահպանվեց")
    except Exception as e:
        print(f"❌ Սխալ ֆայլը պահպանելիս: {e}")
        return
    
    # Վերջնական վիճակագրություն
    final_keys = len(data)
    total_added = final_keys - analysis['total_keys']
    
    print("\n" + "=" * 60)
    print("📊 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ")
    print("=" * 60)
    print(f"   ✅ Ավելացված w*_l*_* բանալիներ: {added_count}")
    print(f"   ✅ Ավելացված w1_l1_e* բանալիներ: {e_added}")
    print(f"   📊 Ընդհանուր ավելացված: {total_added}")
    print(f"   📊 Սկզբնական բանալիներ: {analysis['total_keys']}")
    print(f"   📊 Վերջնական բանալիներ: {final_keys}")
    print("=" * 60)
    
    # Ցույց տալ ավելացված բանալիների օրինակներ
    if added_count > 0:
        print("\n📋 Ավելացված w*_l*_* բանալիների օրինակներ (առաջին 10):")
        added_examples = []
        for week in range(1, analysis['max_week'] + 1):
            for lesson in range(1, analysis['max_lesson'] + 1):
                for exercise in range(analysis['max_exercise'] + 1):
                    for exercise_type in ['mc', 'tr']:
                        key = f"w{week}_l{lesson}_{exercise_type}_{exercise}"
                        if len(added_examples) < 10 and key not in analysis['existing_keys']:
                            added_examples.append((key, data[key]))
        
        for key, value in added_examples:
            print(f"   {key}: {value}")
    
    if e_added > 0:
        print("\n📋 Ավելացված w1_l1_e* բանալիներ:")
        for key, value in w1_l1_e_values.items():
            if key not in analysis['existing_keys']:
                print(f"   {key}: {value}")
    
    print("\n✅ Ամեն ինչ պատրաստ է!")

if __name__ == "__main__":
    main()