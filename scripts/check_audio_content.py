# check_audio_content.py
# Գործարկել՝ python check_audio_content.py
# Նախ տեղադրեք՝ pip install speechrecognition pydub

import os
import json
import wave
import audioop
from pathlib import Path
import speech_recognition as sr
from pydub import AudioSegment
import tempfile

PROJECT_ROOT = Path(__file__).parent
DICT_PATH = PROJECT_ROOT / 'data/dictionaries/unified-dictionary.json'
AUDIO_DIR = PROJECT_ROOT / 'public/audio/hy'

print('🔍 ՍԿՍՎՈՒՄ Է ԱՈՒԴԻՈ ՖԱՅԼԵՐԻ ԲՈՎԱՆԴԱԿՈՒԹՅԱՆ ՍՏՈՒԳՈՒՄ...\n')

# 1. Բեռնել բառարանը
print('📄 1. Բեռնում եմ unified-dictionary.json...')
with open(DICT_PATH, 'r', encoding='utf-8') as f:
    dict_data = json.load(f)
print(f'   ✅ Բառարանը բեռնված է: {len(dict_data)} բառ')

# 2. Ստեղծել ID-բառ քարտեզ
id_to_word = {item['id']: item['hy'] for item in dict_data}
print(f'   ✅ Ստեղծվել է ID-բառ քարտեզ')

# 3. Ստուգել խնդրահարույց բառերը
problem_words = ['վերև', 'նաև', 'հետև', 'որովհետև', 'Լավ, ցտեսություն։']
problem_ids = []

for item in dict_data:
    for word in problem_words:
        if word in item['hy']:
            problem_ids.append(item['id'])
            break

print(f'\n🔍 2. Խնդրահարույց բառեր ({len(problem_ids)}):')
for id in problem_ids:
    word = id_to_word.get(id, '?')
    print(f'   {id}: {word}')

# 4. Ֆունկցիա աուդիոն ճանաչելու համար
def recognize_audio(file_path):
    """Ճանաչել աուդիո ֆայլի բովանդակությունը"""
    try:
        # Փոխարկել MP3-ը WAV-ի
        audio = AudioSegment.from_mp3(file_path)
        
        # Պահել ժամանակավոր ֆայլում
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            temp_path = tmp.name
            audio.export(temp_path, format='wav')
        
        # Ճանաչել
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data, language='hy-AM')
                return text.lower()
            except sr.UnknownValueError:
                return None
            except sr.RequestError:
                return None
            finally:
                os.unlink(temp_path)
    except Exception as e:
        return None

# 5. Ստուգել յուրաքանչյուր խնդրահարույց բառ
print(f'\n🔊 3. Ստուգում եմ աուդիո ֆայլերի բովանդակությունը...')

results = []
for id in problem_ids:
    word = id_to_word.get(id, '?')
    audio_path = AUDIO_DIR / f'{id}.mp3'
    
    if not audio_path.exists():
        results.append({
            'id': id,
            'word': word,
            'status': 'ՖԱՅԼԸ ԲԱՑԱԿԱՅՈՒՄ Է',
            'recognized': None
        })
        continue
    
    print(f'   ⏳ {id}: {word}...')
    recognized = recognize_audio(audio_path)
    
    if recognized is None:
        results.append({
            'id': id,
            'word': word,
            'status': 'ՉԻ ՃԱՆԱՉՎԵԼ',
            'recognized': None
        })
    elif word.lower() in recognized or recognized in word.lower():
        results.append({
            'id': id,
            'word': word,
            'status': '✅ ՃԻՇՏ Է',
            'recognized': recognized
        })
    else:
        results.append({
            'id': id,
            'word': word,
            'status': '❌ ՍԽԱԼ Է',
            'recognized': recognized
        })

# 6. Ցույց տալ արդյունքները
print('\n📊 4. ԱՐԴՅՈՒՆՔՆԵՐ:')
print('=' * 60)

correct = 0
wrong = 0
missing = 0

for result in results:
    status = result['status']
    if '✅' in status:
        correct += 1
    elif '❌' in status:
        wrong += 1
    else:
        missing += 1
    
    print(f"\n📝 {result['id']}: {result['word']}")
    print(f"   {status}")
    if result['recognized']:
        print(f"   🎤 Ճանաչված տեքստ: {result['recognized']}")

# 7. Ամփոփում
print('\n' + '=' * 60)
print('📊 ԱՄՓՈՓՈՒՄ')
print(f'   ✅ Ճիշտ է: {correct}')
print(f'   ❌ Սխալ է: {wrong}')
print(f'   ⚠️  Բացակայում/Չի ճանաչվել: {missing}')

if wrong > 0:
    print('\n⚠️ ԳՏՆՎԵԼ ԵՆ ՍԽԱԼ ԱՈՒԴԻՈ ՖԱՅԼԵՐ:')
    for result in results:
        if '❌' in result['status']:
            print(f"   - {result['id']}: {result['word']} → {result['recognized']}")
else:
    print('\n✅ ԲԱՐՁՐԱՑՈՒՑԻՉ! Բոլոր աուդիո ֆայլերը ճիշտ են:')

print('\n✅ Ստուգումն ավարտված է!')