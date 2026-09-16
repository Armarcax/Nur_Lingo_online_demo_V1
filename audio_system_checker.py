import os
import json
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, Set, List, Any

class AudioSystemChecker:
    """Աուդիոհամակարգի ճշգրիտ ստուգման դաս"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.audio_root = self.project_root / "public" / "audio"
        self.mappings_dir = self.project_root / "src" / "lib" / "content" / "mappings"
        
        # Լեզուների համապատասխանություն (նորմալիզացիայի համար)
        self.normalize_mapping = {
            'en': 'en_female',
            'hy': 'hy_Ani',
            'ru': 'ru_female',
            'en_female': 'en_female',
            'hy_ani': 'hy_Ani',
            'ru_female': 'ru_female'
        }
        
        self.issues = {
            'missing_files': [],
            'extra_files': [],
            'json_errors': [],
            'zero_size_files': []
        }
        
        self.stats = defaultdict(lambda: {'mapped': 0, 'physical': 0, 'missing': 0, 'extra': 0})
    
    def normalize_path(self, path: str) -> str:
        """
        Նորմալիզացնում է ուղին համեմատության համար:
        - en/005169.mp3 -> en_female/005169.mp3
        - offline/en_female/005169.mp3 -> en_female/005169.mp3
        """
        # Հեռացնել offline/ պրեֆիքսը, եթե կա
        if path.startswith('offline/'):
            path = path[8:]  # հեռացնել 'offline/'-ը
        
        # Բաժանել պանակը և ֆայլի անունը
        parts = path.split('/')
        if len(parts) == 2:
            folder, filename = parts
            # Նորմալիզացնել պանակի անունը
            normalized_folder = self.normalize_mapping.get(folder.lower(), folder)
            return f"{normalized_folder}/{filename}"
        else:
            return path
    
    def find_all_audio_files(self) -> Set[str]:
        """Գտնում է բոլոր աուդիո ֆայլերը և նորմալիզացնում ուղիները"""
        print("📂 1. Սկանավորում եմ աուդիո ֆայլերը...")
        
        audio_files = set()
        audio_extensions = {".mp3", ".wav", ".m4a"}
        
        # Որոնել միայն offline պանակներում
        for search_root in [self.audio_root / "offline"]:
            if search_root.exists():
                for ext in audio_extensions:
                    for file_path in search_root.rglob(f"*{ext}"):
                        # Վերցնել հարաբերական ուղին offline/-ից
                        rel_path = file_path.relative_to(self.audio_root)
                        # Նորմալիզացնել ուղին
                        normalized = self.normalize_path(str(rel_path).replace('\\', '/'))
                        audio_files.add(normalized)
        
        print(f"   ✅ Գտնվել է {len(audio_files)} աուդիո ֆայլ")
        return audio_files
    
    def parse_mappings(self) -> Set[str]:
        """Վերլուծում է JSON քարտեզագրումները"""
        print("\n📄 2. Վերլուծում եմ քարտեզագրումները...")
        
        mapped_files = set()
        json_files = list(self.mappings_dir.glob("*.json"))
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Հանել բոլոր աուդիո համարները
                numbers = set()
                
                if isinstance(data, dict):
                    # Ստուգել audioToNum, mapping, numToAudio
                    for key in ['audioToNum', 'mapping', 'numToAudio']:
                        if key in data and isinstance(data[key], dict):
                            for word, num in data[key].items():
                                numbers.add(num)
                    
                    # Ստուգել languages (audio-num-mappings.json-ի համար)
                    if 'languages' in data and isinstance(data['languages'], dict):
                        for lang_code, lang_data in data['languages'].items():
                            if isinstance(lang_data, dict):
                                for key in ['audioToNum', 'mapping']:
                                    if key in lang_data and isinstance(lang_data[key], dict):
                                        for word, num in lang_data[key].items():
                                            numbers.add(num)
                
                # JSON-ից ստացված համարներից ստեղծել ուղիներ
                # Որոշել լեզուն և պանակը
                if 'en' in json_file.name:
                    folder = 'en_female'
                elif 'hy' in json_file.name:
                    folder = 'hy_Ani'
                elif 'ru' in json_file.name:
                    folder = 'ru_female'
                else:
                    folder = None
                
                if folder and numbers:
                    for num in numbers:
                        # Եթե num-ը ամբողջ թիվ է, ապա 6 նիշով ձևաչափել
                        if isinstance(num, int):
                            num_str = f"{num:06d}"
                        else:
                            num_str = str(num).zfill(6) if num.isdigit() else num
                        
                        # Ստեղծել նորմալիզացված ուղի
                        path = f"{folder}/{num_str}.mp3"
                        mapped_files.add(path)
                    
                    print(f"   ✅ {json_file.name}: {len(numbers)} ֆայլ")
                else:
                    print(f"   ⚠️ {json_file.name}: ֆայլեր չեն գտնվել")
                    
            except Exception as e:
                print(f"   ❌ {json_file.name}: {e}")
                self.issues['json_errors'].append(f"{json_file.name}: {e}")
        
        print(f"\n   📊 Ընդհանուր քարտեզագրված ուղիներ՝ {len(mapped_files)}")
        return mapped_files
    
    def check_files(self, physical_files: Set[str], mapped_files: Set[str]):
        """Ստուգում է ֆայլերի առկայությունը"""
        print("\n🔎 3. Ստուգում եմ ֆայլերի առկայությունը...")
        
        # Բացակայող ֆայլեր (քարտեզագրված է, բայց չկա)
        missing = mapped_files - physical_files
        if missing:
            print(f"   ❌ Բացակայող ֆայլեր՝ {len(missing)}")
            for path in list(missing)[:10]:
                print(f"      - {path}")
            self.issues['missing_files'] = list(missing)
        else:
            print("   ✅ Բոլոր քարտեզագրված ֆայլերը առկա են")
        
        # Ավելորդ ֆայլեր (կա, բայց չի քարտեզագրված)
        extra = physical_files - mapped_files
        if extra:
            print(f"\n   ⚠️ Ավելորդ ֆայլեր՝ {len(extra)}")
            for path in list(extra)[:10]:
                print(f"      - {path}")
            self.issues['extra_files'] = list(extra)
        else:
            print("   ✅ Բոլոր ֆիզիկական ֆայլերը քարտեզագրված են")
        
        # Պահպանել վիճակագրություն
        for path in physical_files:
            folder = path.split('/')[0]
            self.stats[folder]['physical'] += 1
        
        for path in mapped_files:
            folder = path.split('/')[0]
            self.stats[folder]['mapped'] += 1
        
        for path in missing:
            folder = path.split('/')[0]
            self.stats[folder]['missing'] += 1
        
        for path in extra:
            folder = path.split('/')[0]
            self.stats[folder]['extra'] += 1
    
    def check_file_sizes(self, physical_files: Set[str]):
        """Ստուգում է ֆայլերի չափերը"""
        print("\n📏 4. Ստուգում եմ ֆայլերի չափերը...")
        
        zero_size = []
        for path in physical_files:
            # Վերականգնել իրական ուղին
            full_path = self.audio_root / "offline" / path
            if full_path.exists() and full_path.stat().st_size == 0:
                zero_size.append(path)
        
        if zero_size:
            print(f"   ❌ Դատարկ ֆայլեր (0 բայթ)՝ {len(zero_size)}")
            for path in zero_size[:10]:
                print(f"      - {path}")
            self.issues['zero_size_files'] = zero_size
        else:
            print("   ✅ Դատարկ ֆայլեր չեն գտնվել")
    
    def generate_report(self):
        """Ստեղծում է ամփոփ հաշվետվություն"""
        print("\n" + "="*60)
        print("📊 ԱՄՓՈՓ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ")
        print("="*60)
        
        if self.stats:
            print("\n📈 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ ԸՍՏ ԼԵԶՎԻ:")
            print("-" * 50)
            for folder, stats in self.stats.items():
                status = "✅" if stats['missing'] == 0 and stats['extra'] == 0 else "⚠️"
                print(f"  {status} {folder}:")
                print(f"      Քարտեզագրված: {stats['mapped']}")
                print(f"      Ֆիզիկական: {stats['physical']}")
                if stats['missing']:
                    print(f"      ❌ Բացակայող: {stats['missing']}")
                if stats['extra']:
                    print(f"      ⚠️ Ավելորդ: {stats['extra']}")
        
        # Ընդհանուր խնդիրներ
        total_issues = sum(len(v) for v in self.issues.values() if v)
        if total_issues == 0:
            print("\n🎉 ԱՄԵՆ ԻՆՉ ԼԱՎ Է: Խնդիրներ չեն հայտնաբերվել!")
        else:
            print(f"\n⚠️ Հայտնաբերվել է {total_issues} խնդիր:")
            for issue_type, items in self.issues.items():
                if items:
                    print(f"   • {issue_type.replace('_', ' ').title()}: {len(items)}")
        
        # Պահպանել հաշվետվությունը
        report_file = self.project_root / "audio_system_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'stats': dict(self.stats),
                'issues': {k: v[:100] for k, v in self.issues.items() if v}
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Հաշվետվությունը պահպանվել է՝ {report_file}")
    
    def run(self):
        """Գործարկում է ամբողջական ստուգումը"""
        print("🚀 ՍԿՍՎՈՒՄ Է ԱՈՒԴԻՈ ՀԱՄԱԿԱՐԳԻ ՃՇՇՏ ՍՏՈՒԳՈՒՄԸ...\n")
        
        # 1. Գտնել ֆիզիկական ֆայլերը
        physical_files = self.find_all_audio_files()
        
        # 2. Վերլուծել քարտեզագրումները
        mapped_files = self.parse_mappings()
        
        # 3. Ստուգել ֆայլերի առկայությունը
        self.check_files(physical_files, mapped_files)
        
        # 4. Ստուգել ֆայլերի չափերը
        self.check_file_sizes(physical_files)
        
        # 5. Ստեղծել հաշվետվություն
        self.generate_report()
        
        print("\n✅ ՍՏՈՒԳՈՒՄԸ ԱՎԱՐՏՎԱԾ Է")

if __name__ == "__main__":
    checker = AudioSystemChecker()
    checker.run()