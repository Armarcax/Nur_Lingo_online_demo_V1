#!/usr/bin/env python3
# scripts/fix_user_dictionary.py
# Ավտոմատ լրացնում է user-dictionary.json-ը թարգմանություններով և աուդիոյով

import json
import os
import time
from gtts import gTTS
import sys

# ─── ԹԱՐԳՄԱՆՈՒԹՅՈՒՆՆԵՐԻ ԲԱՌԱՐԱՆ ─────────────────────────────────

TRANSLATIONS = {
    # Ռուսերեն → {hy, en}
    "возраст": {"hy": "տարիք", "en": "age"},
    "аэропорт": {"hy": "օդանավակայան", "en": "airport"},
    "ответ": {"hy": "պատասխան", "en": "answer"},
    "яблоко": {"hy": "խնձոր", "en": "apple"},
    "апрель": {"hy": "ապրիլ", "en": "april"},
    "рука": {"hy": "բազուկ", "en": "arm"},
    "искусство": {"hy": "արվեստ", "en": "art"},
    "художник": {"hy": "նկարիչ", "en": "artist"},
    "август": {"hy": "օգոստոս", "en": "august"},
    "осень": {"hy": "աշուն", "en": "autumn"},
    "младенец": {"hy": "մանուկ", "en": "baby"},
    "сумка": {"hy": "պայուսակ", "en": "bag"},
    "медведь": {"hy": "արջ", "en": "bear"},
    "велосипед": {"hy": "հեծանիվ", "en": "bicycle"},
    "птица": {"hy": "թռչուն", "en": "bird"},
    "хлеб": {"hy": "հաց", "en": "bread"},
    "мост": {"hy": "կամուրջ", "en": "bridge"},
    "коричневый": {"hy": "շագանակագույն", "en": "brown"},
    "автобус": {"hy": "ավտոբուս", "en": "bus"},
    "масло": {"hy": "կարագ", "en": "butter"},
    "купить": {"hy": "գնել", "en": "buy"},
    "камера": {"hy": "տեսախցիկ", "en": "camera"},
    "машина": {"hy": "մեքենա", "en": "car"},
    "кот": {"hy": "կատու", "en": "cat"},
    "сыр": {"hy": "պանիր", "en": "cheese"},
    "повар": {"hy": "խոհարար", "en": "cook"},
    "церковь": {"hy": "եկեղեցի", "en": "church"},
    "город": {"hy": "քաղաք", "en": "city"},
    "облако": {"hy": "ամպ", "en": "cloud"},
    "пальто": {"hy": "վերարկու", "en": "coat"},
    "кофе": {"hy": "սուրճ", "en": "coffee"},
    "компьютер": {"hy": "համակարգիչ", "en": "computer"},
    "страна": {"hy": "երկիր", "en": "country"},
    "корова": {"hy": "կով", "en": "cow"},
    "плакать": {"hy": "լալ", "en": "cry"},
    "танцевать": {"hy": "պարել", "en": "dance"},
    "дочь": {"hy": "դուստր", "en": "daughter"},
    "смерть": {"hy": "մահ", "en": "death"},
    "декабрь": {"hy": "դեկտեմբեր", "en": "december"},
    "умереть": {"hy": "մահանալ", "en": "die"},
    "трудный": {"hy": "դժվար", "en": "difficult"},
    "врач": {"hy": "բժիշկ", "en": "doctor"},
    "собака": {"hy": "շուն", "en": "dog"},
    "мечта": {"hy": "երազ", "en": "dream"},
    "платье": {"hy": "զգեստ", "en": "dress"},
    "пить": {"hy": "խմել", "en": "drink"},
    "лёгкий": {"hy": "թեթև", "en": "easy"},
    "есть": {"hy": "ուտել", "en": "eat"},
    "яйцо": {"hy": "ձու", "en": "egg"},
    "слон": {"hy": "փիղ", "en": "elephant"},
    "инженер": {"hy": "ինժեներ", "en": "engineer"},
    "экзамен": {"hy": "քննություն", "en": "exam"},
    "семья": {"hy": "ընտանիք", "en": "family"},
    "февраль": {"hy": "փետրվար", "en": "february"},
    "найти": {"hy": "գտնել", "en": "find"},
    "палец": {"hy": "մատ", "en": "finger"},
    "рыба": {"hy": "ձուկ", "en": "fish"},
    "туман": {"hy": "մշուշ", "en": "fog"},
    "лес": {"hy": "անտառ", "en": "forest"},
    "бесплатный": {"hy": "անվճար", "en": "free"},
    "пятница": {"hy": "ուրբաթ", "en": "friday"},
    "игра": {"hy": "խաղ", "en": "game"},
    "география": {"hy": "աշխարհագրություն", "en": "geography"},
    "очки": {"hy": "ակնոց", "en": "glasses"},
    "дедушка": {"hy": "պապիկ", "en": "grandfather"},
    "бабушка": {"hy": "տատիկ", "en": "grandmother"},
    "трава": {"hy": "խոտ", "en": "grass"},
    "серый": {"hy": "մոխրագույն", "en": "gray"},
    "шапка": {"hy": "գլխարկ", "en": "hat"},
    "здоровье": {"hy": "առողջություն", "en": "health"},
    "помочь": {"hy": "օգնել", "en": "help"},
    "помощь": {"hy": "օգնություն", "en": "help"},
    "история": {"hy": "պատմություն", "en": "history"},
    "домашнее задание": {"hy": "տնային աշխատանք", "en": "homework"},
    "лошадь": {"hy": "ձի", "en": "horse"},
    "больница": {"hy": "հիվանդանոց", "en": "hospital"},
    "час": {"hy": "ժամ", "en": "hour"},
    "муж": {"hy": "ամուսին", "en": "husband"},
    "лёд": {"hy": "սառույց", "en": "ice"},
    "идея": {"hy": "գաղափար", "en": "idea"},
    "интернет": {"hy": "համացանց", "en": "internet"},
    "январь": {"hy": "հունվար", "en": "january"},
    "сок": {"hy": "հյութ", "en": "juice"},
    "июль": {"hy": "հուլիս", "en": "july"},
    "июнь": {"hy": "հունիս", "en": "june"},
    "язык": {"hy": "լեզու", "en": "language"},
    "смеяться": {"hy": "ծիծաղել", "en": "laugh"},
    "адвокат": {"hy": "իրավաբան", "en": "lawyer"},
    "учиться": {"hy": "սովորել", "en": "learn"},
    "нога": {"hy": "ոտք", "en": "leg"},
    "урок": {"hy": "դաս", "en": "lesson"},
    "библиотека": {"hy": "գրադարան", "en": "library"},
    "жизнь": {"hy": "կյանք", "en": "life"},
    "лев": {"hy": "առյուծ", "en": "lion"},
    "слушать": {"hy": "լսել", "en": "listen"},
    "жить": {"hy": "ապրել", "en": "live"},
    "длинный": {"hy": "երկար", "en": "long"},
    "потерять": {"hy": "կորցնել", "en": "lose"},
    "любить": {"hy": "սիրել", "en": "love"},
    "март": {"hy": "մարտ", "en": "march"},
    "рынок": {"hy": "շուկա", "en": "market"},
    "математика": {"hy": "մաթեմատիկա", "en": "mathematics"},
    "май": {"hy": "մայիս", "en": "may"},
    "мясо": {"hy": "միս", "en": "meat"},
    "сообщение": {"hy": "հաղորդագրություն", "en": "message"},
    "молоко": {"hy": "կաթ", "en": "milk"},
    "минута": {"hy": "րոպե", "en": "minute"},
    "понедельник": {"hy": "երկուշաբթի", "en": "monday"},
    "деньги": {"hy": "փող", "en": "money"},
    "гора": {"hy": "լեռ", "en": "mountain"},
    "фильм": {"hy": "ֆիլմ", "en": "movie"},
    "музыка": {"hy": "երաժշտություն", "en": "music"},
    "имя": {"hy": "անուն", "en": "name"},
    "ноябрь": {"hy": "նոյեմբեր", "en": "november"},
    "океан": {"hy": "օվկիանոս", "en": "ocean"},
    "октябрь": {"hy": "հոկտեմբեր", "en": "october"},
    "масло": {"hy": "յուղ", "en": "oil"},
    "апельсин": {"hy": "նարինջ", "en": "orange"},
    "брюки": {"hy": "տաբատ", "en": "pants"},
    "родители": {"hy": "ծնողներ", "en": "parents"},
    "парк": {"hy": "պարկ", "en": "park"},
    "пароль": {"hy": "գաղտնաբառ", "en": "password"},
    "мир": {"hy": "խաղաղություն", "en": "peace"},
    "телефон": {"hy": "հեռախոս", "en": "phone"},
    "свинья": {"hy": "խոզ", "en": "pig"},
    "пилот": {"hy": "օդաչու", "en": "pilot"},
    "самолёт": {"hy": "ինքնաթիռ", "en": "plane"},
    "играть": {"hy": "խաղալ", "en": "play"},
    "пожалуйста": {"hy": "խնդրեմ", "en": "please"},
    "полиция": {"hy": "ոստիկանություն", "en": "police"},
    "бедный": {"hy": "աղքատ", "en": "poor"},
    "президент": {"hy": "նախագահ", "en": "president"},
    "цена": {"hy": "գին", "en": "price"},
    "проблема": {"hy": "խնդիր", "en": "problem"},
    "фиолетовый": {"hy": "մանուշակագույն", "en": "purple"},
    "вопрос": {"hy": "հարց", "en": "question"},
    "кролик": {"hy": "նապաստակ", "en": "rabbit"},
    "дождь": {"hy": "անձրև", "en": "rain"},
    "читать": {"hy": "կարդալ", "en": "read"},
    "рис": {"hy": "բրինձ", "en": "rice"},
    "богатый": {"hy": "հարուստ", "en": "rich"},
    "кольцо": {"hy": "մատանի", "en": "ring"},
    "река": {"hy": "գետ", "en": "river"},
    "дорога": {"hy": "ճանապարհ", "en": "road"},
    "комната": {"hy": "սենյակ", "en": "room"},
    "бегать": {"hy": "վազել", "en": "run"},
    "соль": {"hy": "աղ", "en": "salt"},
    "песок": {"hy": "ավազ", "en": "sand"},
    "суббота": {"hy": "շաբաթ", "en": "saturday"},
    "наука": {"hy": "գիտություն", "en": "science"},
    "море": {"hy": "ծով", "en": "sea"},
    "секунда": {"hy": "վայրկյան", "en": "second"},
    "продавать": {"hy": "վաճառել", "en": "sell"},
    "сентябрь": {"hy": "սեպտեմբեր", "en": "september"},
    "овца": {"hy": "ոչխար", "en": "sheep"},
    "корабль": {"hy": "նավ", "en": "ship"},
    "рубашка": {"hy": "վերնաշապիկ", "en": "shirt"},
    "туфли": {"hy": "կոշիկ", "en": "shoes"},
    "короткий": {"hy": "կարճ", "en": "short"},
    "петь": {"hy": "երգել", "en": "sing"},
    "певец": {"hy": "երգիչ", "en": "singer"},
    "небо": {"hy": "երկինք", "en": "sky"},
    "спать": {"hy": "քնել", "en": "sleep"},
    "змея": {"hy": "օձ", "en": "snake"},
    "снег": {"hy": "ձյուն", "en": "snow"},
    "солдат": {"hy": "զինվոր", "en": "soldier"},
    "сын": {"hy": "որդի", "en": "son"},
    "извини": {"hy": "ներողություն", "en": "sorry"},
    "суп": {"hy": "ապուր", "en": "soup"},
    "спорт": {"hy": "սպորտ", "en": "sport"},
    "весна": {"hy": "գարուն", "en": "spring"},
    "камень": {"hy": "քար", "en": "stone"},
    "буря": {"hy": "փոթորիկ", "en": "storm"},
    "улица": {"hy": "փողոց", "en": "street"},
    "сильный": {"hy": "ուժեղ", "en": "strong"},
    "студент": {"hy": "ուսանող", "en": "student"},
    "сахар": {"hy": "շաքար", "en": "sugar"},
    "лето": {"hy": "ամառ", "en": "summer"},
    "воскресенье": {"hy": "կիրակի", "en": "sunday"},
    "говорить": {"hy": "խոսել", "en": "talk"},
    "чай": {"hy": "թեյ", "en": "tea"},
    "учить": {"hy": "ուսուցանել", "en": "teach"},
    "учитель": {"hy": "ուսուցիչ", "en": "teacher"},
    "температура": {"hy": "ջերմաստիճան", "en": "temperature"},
    "десять": {"hy": "տաս", "en": "ten"},
    "спасибо": {"hy": "շնորհակալություն", "en": "thank you"},
    "четверг": {"hy": "հինգշաբթի", "en": "thursday"},
    "тигр": {"hy": "վագր", "en": "tiger"},
    "поезд": {"hy": "գնացք", "en": "train"},
    "правда": {"hy": "ճշմարտություն", "en": "truth"},
    "вторник": {"hy": "երեքշաբթի", "en": "tuesday"},
    "университет": {"hy": "համալսարան", "en": "university"},
    "деревня": {"hy": "գյուղ", "en": "village"},
    "ходить": {"hy": "գնալ", "en": "walk"},
    "война": {"hy": "պատերազմ", "en": "war"},
    "слабый": {"hy": "թույլ", "en": "weak"},
    "погода": {"hy": "եղանակ", "en": "weather"},
    "среда": {"hy": "չորեքշաբթի", "en": "wednesday"},
    "жена": {"hy": "կին", "en": "wife"},
    "ветер": {"hy": "քամի", "en": "wind"},
    "вино": {"hy": "գինի", "en": "wine"},
    "зима": {"hy": "ձմեռ", "en": "winter"},
    "волк": {"hy": "գայլ", "en": "wolf"},
    "писать": {"hy": "գրել", "en": "write"},
    "писатель": {"hy": "գրող", "en": "writer"},
    "неправильный": {"hy": "սխալ", "en": "wrong"},
    "молодой": {"hy": "երիտասարդ", "en": "young"},
}

# ─── ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ ──────────────────────────────────────────────

USER_DICT_PATH = "data/dictionaries/user-dictionary.json"
OUTPUT_DICT_PATH = "data/dictionaries/user-dictionary-fixed.json"
AUDIO_BASE = "public/audio"
MANIFEST_PATH = f"{AUDIO_BASE}/user_manifest.json"

LANG_CONFIG = {
    "hy": {"dir": "hy_user", "lang": "hy", "label": "Հայերեն"},
    "en": {"dir": "en_user", "lang": "en", "label": "English"},
    "ru": {"dir": "ru_user", "lang": "ru", "label": "Русский"},
}

# ─── ՕԳՆԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ ──────────────────────────────────────────

def ensure_directories():
    """Ստեղծում է անհրաժեշտ թղթապանակները"""
    for config in LANG_CONFIG.values():
        dir_path = f"{AUDIO_BASE}/{config['dir']}"
        os.makedirs(dir_path, exist_ok=True)
        print(f"📁 Created: {dir_path}")

def load_manifest():
    """Բեռնում է user_manifest.json-ը"""
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"schemaVersion": 1, "lastUpdated": "", "totalEntries": 0, "entries": {}}

def save_manifest(manifest):
    """Պահպանում է user_manifest.json-ը"""
    manifest["schemaVersion"] = 1
    manifest["lastUpdated"] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    manifest["totalEntries"] = len(manifest["entries"])
    
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"✅ Manifest saved: {MANIFEST_PATH}")

def generate_audio_for_word(word_id, text, lang_code, config):
    """Գեներացնում է աուդիո մեկ բառի համար"""
    if not text or text.strip() == "":
        return None
    
    filename = f"{word_id}.mp3"
    filepath = f"{AUDIO_BASE}/{config['dir']}/{filename}"
    
    # Եթե աուդիոն արդեն գոյություն ունի, բաց թողնել
    if os.path.exists(filepath):
        return filepath
    
    try:
        tts = gTTS(text, lang=config['lang'])
        tts.save(filepath)
        return filepath
    except Exception as e:
        print(f"   ❌ Error generating {lang_code}: {e}")
        return None

def create_audio_manifest_entry(word_id, lang_code):
    """Ստեղծում է manifest-ի entry"""
    return f"/audio/{LANG_CONFIG[lang_code]['dir']}/{word_id}.mp3"

# ─── ԳԼԽԱՎՈՐ ՖՈՒՆԿՑԻԱ ──────────────────────────────────────────────

def fix_user_dictionary():
    """Հիմնական ֆունկցիա - թարգմանում և գեներացնում է աուդիո"""
    print("\n" + "=" * 60)
    print("🔧 FIXING USER DICTIONARY")
    print("=" * 60)
    
    # 1. Ստեղծել թղթապանակներ
    ensure_directories()
    
    # 2. Կարդալ user-dictionary.json
    if not os.path.exists(USER_DICT_PATH):
        print(f"❌ {USER_DICT_PATH} not found!")
        return
    
    with open(USER_DICT_PATH, "r", encoding="utf-8") as f:
        entries = json.load(f)
    
    print(f"\n📊 Found {len(entries)} user words")
    
    # 3. Բեռնել manifest
    manifest = load_manifest()
    
    # 4. Թարմացնել բառերը
    fixed_entries = []
    fixed_count = 0
    audio_success = 0
    audio_fail = 0
    not_found = []
    
    print("\n📝 Processing...\n")
    
    for entry in entries:
        word_id = entry.get("id", "")
        ru = entry.get("ru", "")
        
        if not word_id or not ru:
            continue
        
        # Գտնել թարգմանությունը
        translation = TRANSLATIONS.get(ru)
        
        if translation:
            # ✅ Թարմացնել բառը
            entry["hy"] = translation["hy"]
            entry["en"] = translation["en"]
            entry["type"] = "user"
            entry["isUserAdded"] = True
            entry["audioGenerated"] = True
            entry["translationSource"] = "auto"
            
            # ✅ Ավելացնել audio դաշտը
            entry["audio"] = {
                "hy": f"/audio/hy_user/{word_id}.mp3",
                "en": f"/audio/en_user/{word_id}.mp3",
                "ru": f"/audio/ru_user/{word_id}.mp3",
            }
            
            fixed_count += 1
            print(f"✅ {word_id}: {ru} → {translation['hy']} / {translation['en']}")
            
            # ✅ Գեներացնել աուդիո բոլոր 3 լեզուներով
            for lang_code, config in LANG_CONFIG.items():
                text = entry.get(lang_code, "")
                if not text:
                    continue
                
                filepath = generate_audio_for_word(word_id, text, lang_code, config)
                if filepath:
                    # Թարմացնել manifest
                    if word_id not in manifest["entries"]:
                        manifest["entries"][word_id] = {}
                    manifest["entries"][word_id][lang_code] = create_audio_manifest_entry(word_id, lang_code)
                    audio_success += 1
                    print(f"   ✅ {config['label']}: {text[:30]}...")
                else:
                    audio_fail += 1
            
            fixed_entries.append(entry)
            
        else:
            not_found.append(ru)
            print(f"⚠️  {word_id}: {ru} → translation not found")
            fixed_entries.append(entry)  # Պահպանել առանց թարգմանության
        
        # Rate limiting - մի փոքր դադար
        time.sleep(0.3)
    
    # 5. Պահպանել թարմացված dictionary
    with open(OUTPUT_DICT_PATH, 'w', encoding='utf-8') as f:
        json.dump(fixed_entries, f, indent=2, ensure_ascii=False)
    print(f"\n📁 Dictionary saved: {OUTPUT_DICT_PATH}")
    
    # 6. Պահպանել manifest
    save_manifest(manifest)
    
    # 7. Արդյունքներ
    print("\n" + "=" * 60)
    print("📊 RESULTS:")
    print(f"   ✅ Fixed translations: {fixed_count}/{len(entries)} words")
    print(f"   ✅ Audio generated: {audio_success} files")
    print(f"   ❌ Audio failed: {audio_fail} files")
    print(f"   ⚠️  Not found in translation dict: {len(not_found)} words")
    
    if not_found:
        print("\n📝 Words not found (will be kept without translation):")
        for word in not_found[:10]:
            print(f"   - {word}")
        if len(not_found) > 10:
            print(f"   ... and {len(not_found) - 10} more")
    
    print("\n✅ Done! User dictionary is now complete with audio.")

# ─── ԳՈՐԾԱՐԿԵԼ ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        from gtts import gTTS
        print("✅ gTTS installed")
    except ImportError:
        print("❌ gTTS not installed. Please run: pip install gtts")
        sys.exit(1)
    
    fix_user_dictionary()