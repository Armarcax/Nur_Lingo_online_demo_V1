import os
import re
import json
from PIL import Image
import pytesseract

# ✅ Tesseract-ի ուղին (փոխիր ըստ քո տեղադրման)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# 📁 Նկարների պանակը
IMAGES_DIR = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\Nur_Lingo_online_demo_V1\public\qp_test"
OUTPUT_FILE = "extracted_questions.json"

def clean_text(text):
    """Մաքրում է OCR-ի աղբը"""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[^\w\s\?\!\.\,\:\;\(\)\-/Ա-Ֆա-ֆ]', '', text)
    return text.strip()

def extract_from_image(image_path):
    """Կարդում է նկարը և վերադարձնում տեքստը"""
    try:
        img = Image.open(image_path)
        # Փոխակերպում ենք սև-սպիտակի, որ OCR-ը ավելի լավ կարդա
        img = img.convert('L')
        # Կարդում ենք հայերեն և անգլերեն
        text = pytesseract.image_to_string(img, lang='hye+eng')
        return clean_text(text)
    except Exception as e:
        print(f"❌ Սխալ {image_path}-ը կարդալիս: {e}")
        return ""

def parse_questions(raw_text, image_name):
    """Փորձում է տեքստից առանձնացնել հարցը և պատասխանները"""
    questions = []
    
    # Սովորաբար հարցերը վերջանում են ? կամ : նշանով
    # Պատասխանները սկսվում են 1., 2., 3., կամ A., B., C. կամ - նշանով
    lines = raw_text.split('\n')
    
    current_question = None
    current_options = []
    
    # Regex պատասխանների համար (օր.՝ "1.", "1)", "ա)", "A.", "- ")
    option_pattern = re.compile(r'^(\d+[\.\)]|[ա-ֆ][\.\)]|[A-Z][\.\)]|[\-\*•])\s*(.+)')

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Եթե տողը վերջանում է ?-ով կամ : -ով, հավանաբար հարց է
        if (line.endswith('?') or line.endswith(':')) and not option_pattern.match(line):
            # Եթե արդեն ունենք նախորդ հարցը, պահպանում ենք
            if current_question and current_options:
                questions.append({
                    "image": image_name,
                    "question": current_question,
                    "options": current_options,
                    "correctIndex": None # Սա պետք է լրացնել ձեռքով
                })
            current_question = line
            current_options = []
            
        # Եթե տողը սկսվում է համարով կամ տառով, հավանաբար պատասխան է
        elif option_pattern.match(line):
            match = option_pattern.match(line)
            if match:
                current_options.append(match.group(2).strip())
        
        # Եթե հարց չկա, բայց տեքստ կա, գուցե հարցի շարունակությունն է
        elif current_question and not current_options:
            current_question += " " + line

    # Վերջին հարցի ավելացում
    if current_question and current_options:
         questions.append({
            "image": image_name,
            "question": current_question,
            "options": current_options,
            "correctIndex": None
        })

    return questions

def main():
    all_questions = []
    
    # Անցնում ենք 1.png-ից 32.png
    for i in range(1, 33):
        image_name = f"{i}.png"
        image_path = os.path.join(IMAGES_DIR, image_name)
        
        if not os.path.exists(image_path):
            print(f"⚠️ Նկարը չի գտնվել: {image_name}")
            continue
            
        print(f"🔍 Մշակվում է: {image_name}...")
        raw_text = extract_from_image(image_path)
        
        # Եթե ցանկանում ես տեսնել, թե ինչ է կարդացել OCR-ը, բացիր այս տողը.
        # print(f"--- OCR Արդյունք {image_name} ---\n{raw_text}\n----------------------")
        
        parsed = parse_questions(raw_text, image_name)
        
        if not parsed:
            # Եթե parse-ը չստացվեց, գոնե պահենք ամբողջ տեքստը
            all_questions.append({
                "image": image_name,
                "raw_text": raw_text
            })
        else:
            all_questions.extend(parsed)

    # Պահպանում ենք JSON ֆայլում
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"\n✅ Ամեն ինչ պահպանվել է {OUTPUT_FILE}-ում:")
    print(f"📊 Գտնվել է {len(all_questions)} հարց:")

if __name__ == "__main__":
    main()