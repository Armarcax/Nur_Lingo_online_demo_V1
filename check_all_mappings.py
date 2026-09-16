# check_all_mappings.py

import os
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class MappingValidator:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.audio_dir = self.root / 'public' / 'audio'
        self.content_dir = self.root / 'src' / 'lib' / 'content'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'status': 'OK',
            'checks': {},
            'errors': [],
            'warnings': [],
            'summary': {}
        }
    
    def run_all_checks(self):
        """Գործարկել բոլոր ստուգումները"""
        print("\n" + "="*80)
        print("🔍 MAPPING-ՆԵՐԻ ԱՄԲՈՂՋԱԿԱՆ ՍՏՈՒԳՈՒՄ")
        print("="*80)
        
        # 1. Ստուգել manifest-ները
        self.check_manifests()
        
        # 2. Ստուգել JSON mapping-ները
        self.check_json_mappings()
        
        # 3. Ստուգել TypeScript mapping-ները
        self.check_ts_mappings()
        
        # 4. Ստուգել կապերը
        self.check_connections()
        
        # 5. Ստուգել audioId-ների առկայությունը
        self.check_audio_ids()
        
        # 6. Ստեղծել ամփոփում
        self.print_summary()
        
        # 7. Պահպանել զեկույցը
        self.save_report()
        
        return self.results
    
    def check_manifests(self):
        """Ստուգել manifest-ները"""
        print("\n📋 MANIFEST-ՆԵՐ")
        print("-"*80)
        
        manifests = {
            'hy': self.audio_dir / 'offline' / 'manifest_hy_ani.json',
            'en': self.audio_dir / 'offline' / 'manifest_en_female.json',
            'ru': self.audio_dir / 'offline' / 'manifest_ru_female.json',
            'dict': self.audio_dir / 'offline_dictionary' / 'manifest.json',
            'user': self.audio_dir / 'offline_user_dictionary' / 'user_manifest.json'
        }
        
        for name, path in manifests.items():
            print(f"\n  📄 {name}: {path.name}")
            
            if not path.exists():
                print(f"    ❌ Ֆայլը բացակայում է")
                self.results['errors'].append(f"Missing manifest: {path.name}")
                continue
            
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Ստուգել կառուցվածքը
                if isinstance(data, dict):
                    keys = list(data.keys())
                    print(f"    ✅ Տիպ: dict")
                    print(f"    📊 Բանալիներ: {', '.join(keys)}")
                    
                    # Ստուգել files-ը
                    if 'files' in data:
                        if isinstance(data['files'], list):
                            print(f"    ✅ files: list, {len(data['files'])} ֆայլ")
                            # Ստուգել արդյոք ֆայլերը .mp3 են
                            mp3_files = [f for f in data['files'] if f.endswith('.mp3')]
                            if len(mp3_files) == len(data['files']):
                                print(f"    ✅ Բոլոր ֆայլերը .mp3 են")
                            else:
                                print(f"    ⚠️  {len(data['files']) - len(mp3_files)} ֆայլ .mp3 չեն")
                                self.results['warnings'].append(f"Non-mp3 files in {path.name}")
                        else:
                            print(f"    ❌ files-ը list չէ, այլ {type(data['files']).__name__}")
                            self.results['errors'].append(f"files is not list in {path.name}")
                    else:
                        print(f"    ⚠️  'files' բանալին բացակայում է")
                        self.results['warnings'].append(f"No 'files' key in {path.name}")
                    
                    # Ստուգել total_files
                    if 'total_files' in data:
                        if data['total_files'] == len(data.get('files', [])):
                            print(f"    ✅ total_files համապատասխանում է")
                        else:
                            print(f"    ❌ total_files ({data['total_files']}) != files count ({len(data.get('files', []))})")
                            self.results['errors'].append(f"total_files mismatch in {path.name}")
                    
                elif isinstance(data, list):
                    print(f"    ✅ Տիպ: list, {len(data)} entries")
                    
                    # Ստուգել արդյոք list-ը պարունակում է dict-եր
                    if data and isinstance(data[0], dict):
                        print(f"    ✅ List-ը պարունակում է dict-եր")
                        sample_keys = list(data[0].keys())
                        print(f"    📊 Օրինակ բանալիներ: {sample_keys[:5]}")
                    else:
                        print(f"    ⚠️  List-ը պարունակում է {type(data[0]).__name__ if data else 'empty'}")
                
                else:
                    print(f"    ❌ Անհայտ տիպ: {type(data).__name__}")
                    self.results['errors'].append(f"Unknown type in {path.name}")
                    
            except json.JSONDecodeError as e:
                print(f"    ❌ JSON սխալ: {e}")
                self.results['errors'].append(f"JSON error in {path.name}: {e}")
            except Exception as e:
                print(f"    ❌ Սխալ: {e}")
                self.results['errors'].append(f"Error in {path.name}: {e}")
    
    def check_json_mappings(self):
        """Ստուգել JSON mapping-ները"""
        print("\n🗺️ JSON MAPPING-ՆԵՐ")
        print("-"*80)
        
        mappings_dir = self.content_dir / 'mappings'
        if not mappings_dir.exists():
            print("  ❌ mappings դիրեկտորիան բացակայում է")
            self.results['errors'].append("mappings directory missing")
            return
        
        mapping_files = [
            'audio-num-hy-mapping.json',
            'audio-num-en-mapping.json',
            'audio-num-ru-mapping.json',
            'audio-num-unified.json'
        ]
        
        for filename in mapping_files:
            filepath = mappings_dir / filename
            print(f"\n  📄 {filename}")
            
            if not filepath.exists():
                print(f"    ❌ Ֆայլը բացակայում է")
                self.results['errors'].append(f"Missing mapping: {filename}")
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, dict):
                    print(f"    ✅ Տիպ: dict")
                    print(f"    📊 Entry-ների քանակ: {len(data)}")
                    
                    # Ստուգել արդյոք արժեքները 6-անիշ են
                    values = list(data.values())
                    six_digit = sum(1 for v in values if isinstance(v, str) and len(v) == 6 and v.isdigit())
                    
                    if len(values) > 0:
                        percentage = (six_digit / len(values)) * 100
                        if percentage == 100:
                            print(f"    ✅ Բոլոր արժեքները 6-անիշ են")
                        elif percentage > 50:
                            print(f"    ⚠️  {six_digit}/{len(values)} արժեքներ 6-անիշ են ({percentage:.1f}%)")
                            self.results['warnings'].append(f"Not all 6-digit in {filename}")
                        else:
                            print(f"    ❌ Միայն {six_digit}/{len(values)} արժեքներ 6-անիշ են ({percentage:.1f}%)")
                            self.results['errors'].append(f"Most values not 6-digit in {filename}")
                    
                    # Ստուգել արդյոք կան key-եր word-եր
                    keys = list(data.keys())
                    if keys:
                        sample_keys = keys[:5]
                        print(f"    📝 Օրինակ key-եր: {', '.join(sample_keys)}")
                        
                        # Ստուգել արդյոք key-երը meaningful են
                        meaningful = sum(1 for k in keys if '_' in k or k.isalpha())
                        if meaningful > 0:
                            print(f"    ✅ Key-երը meaningful են")
                        else:
                            print(f"    ⚠️  Key-երը թվային են կամ կարճ")
                
                elif isinstance(data, list):
                    print(f"    ✅ Տիպ: list")
                    print(f"    📊 Entry-ների քանակ: {len(data)}")
                    
                    if data:
                        print(f"    📝 Օրինակ: {data[0] if len(data) > 0 else 'empty'}")
                        if len(data) > 1:
                            print(f"    📝 2-րդ: {data[1] if len(data) > 1 else 'N/A'}")
                else:
                    print(f"    ❌ Անհայտ տիպ: {type(data).__name__}")
                    self.results['errors'].append(f"Unknown type in {filename}")
                    
            except json.JSONDecodeError as e:
                print(f"    ❌ JSON սխալ: {e}")
                self.results['errors'].append(f"JSON error in {filename}: {e}")
            except Exception as e:
                print(f"    ❌ Սխալ: {e}")
                self.results['errors'].append(f"Error in {filename}: {e}")
    
    def check_ts_mappings(self):
        """Ստուգել TypeScript mapping-ները"""
        print("\n📄 TYPESCRIPT MAPPING-ՆԵՐ")
        print("-"*80)
        
        ts_files = [
            'audio-mapping-integrated.ts',
            'audio-mapping.ts'
        ]
        
        for filename in ts_files:
            filepath = self.content_dir / filename
            print(f"\n  📄 {filename}")
            
            if not filepath.exists():
                print(f"    ❌ Ֆայլը բացակայում է")
                self.results['errors'].append(f"Missing TS file: {filename}")
                continue
            
            try:
                content = filepath.read_text(encoding='utf-8', errors='ignore')
                
                # Ստուգել import-ները
                imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
                if imports:
                    print(f"    ✅ Imports: {len(imports)}")
                    for imp in imports[:3]:
                        print(f"      - {imp}")
                
                # Ստուգել export-ները
                exports = re.findall(r'(?:export\s+)?(?:const|function|interface|type|class)\s+(\w+)', content)
                if exports:
                    print(f"    ✅ Exports: {len(exports)}")
                    print(f"      - {', '.join(exports[:5])}")
                
                # Ստուգել audioId-ներ
                audio_ids = re.findall(r"['\"](\d{6})['\"]", content)
                if audio_ids:
                    print(f"    ✅ Audio IDs found: {len(audio_ids)}")
                    print(f"      - {', '.join(audio_ids[:5])}")
                else:
                    print(f"    ⚠️  Audio IDs չեն գտնվել")
                    self.results['warnings'].append(f"No audio IDs in {filename}")
                
                # Ստուգել AUDIO_NUM_MAPS
                if 'AUDIO_NUM_MAPS' in content:
                    print(f"    ✅ AUDIO_NUM_MAPS-ը կա")
                else:
                    print(f"    ⚠️  AUDIO_NUM_MAPS-ը բացակայում է")
                    self.results['warnings'].append(f"AUDIO_NUM_MAPS missing in {filename}")
                
                # Ստուգել getAudioPath
                if 'getAudioPath' in content:
                    print(f"    ✅ getAudioPath-ը կա")
                else:
                    print(f"    ⚠️  getAudioPath-ը բացակայում է")
                    self.results['warnings'].append(f"getAudioPath missing in {filename}")
                
            except Exception as e:
                print(f"    ❌ Սխալ: {e}")
                self.results['errors'].append(f"Error in {filename}: {e}")
    
    def check_connections(self):
        """Ստուգել կապերը"""
        print("\n🔗 ԿԱՊԵՐԻ ՍՏՈՒԳՈՒՄ")
        print("-"*80)
        
        # 1. Հավաքել բոլոր audioId-ները manifest-ներից
        all_audio_ids = {}
        manifest_paths = {
            'hy': self.audio_dir / 'offline' / 'manifest_hy_ani.json',
            'en': self.audio_dir / 'offline' / 'manifest_en_female.json',
            'ru': self.audio_dir / 'offline' / 'manifest_ru_female.json'
        }
        
        for lang, path in manifest_paths.items():
            if path.exists():
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        files = data.get('files', [])
                        all_audio_ids[lang] = [f.replace('.mp3', '') for f in files if f.endswith('.mp3')]
                        print(f"  ✅ {lang}: {len(all_audio_ids[lang])} audio IDs")
                except:
                    print(f"  ❌ {lang}: չի կարողացել բեռնել")
                    all_audio_ids[lang] = []
            else:
                print(f"  ❌ {lang}: manifest-ը բացակայում է")
                all_audio_ids[lang] = []
        
        # 2. Ստուգել JSON mapping-ները
        mappings_dir = self.content_dir / 'mappings'
        json_mappings = {}
        
        mapping_files = {
            'hy': 'audio-num-hy-mapping.json',
            'en': 'audio-num-en-mapping.json',
            'ru': 'audio-num-ru-mapping.json'
        }
        
        for lang, filename in mapping_files.items():
            filepath = mappings_dir / filename
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, dict):
                            json_mappings[lang] = data
                            print(f"  ✅ {lang} mapping: {len(data)} entries")
                        else:
                            print(f"  ❌ {lang} mapping: dict չէ")
                            json_mappings[lang] = {}
                except:
                    print(f"  ❌ {lang} mapping: JSON սխալ")
                    json_mappings[lang] = {}
            else:
                print(f"  ❌ {lang} mapping: բացակայում է")
                json_mappings[lang] = {}
        
        # 3. Համեմատել
        print(f"\n  📊 ՀԱՄԵՄԱՏՈՒԹՅՈՒՆ:")
        for lang in ['hy', 'en', 'ru']:
            manifest_ids = set(all_audio_ids.get(lang, []))
            mapping_ids = set(json_mappings.get(lang, {}).values())
            
            if manifest_ids and mapping_ids:
                overlap = manifest_ids & mapping_ids
                missing = manifest_ids - mapping_ids
                extra = mapping_ids - manifest_ids
                
                print(f"\n    {lang.upper()}:")
                print(f"      📊 Manifest: {len(manifest_ids)}")
                print(f"      📊 Mapping: {len(mapping_ids)}")
                print(f"      ✅ Overlap: {len(overlap)}")
                
                if missing:
                    print(f"      ❌ Missing in mapping: {len(missing)}")
                    if len(missing) <= 5:
                        print(f"         - {', '.join(sorted(missing))}")
                    else:
                        print(f"         - {', '.join(sorted(missing)[:5])}...")
                    self.results['errors'].append(f"{len(missing)} missing in {lang} mapping")
                
                if extra:
                    print(f"      ⚠️  Extra in mapping: {len(extra)}")
                    if len(extra) <= 5:
                        print(f"         - {', '.join(sorted(extra))}")
                    else:
                        print(f"         - {', '.join(sorted(extra)[:5])}...")
                    self.results['warnings'].append(f"{len(extra)} extra in {lang} mapping")
                
                percentage = (len(overlap) / len(manifest_ids)) * 100 if manifest_ids else 0
                print(f"      📊 Match: {percentage:.1f}%")
                
                if percentage < 50:
                    self.results['errors'].append(f"Low match for {lang}: {percentage:.1f}%")
            else:
                if not manifest_ids:
                    print(f"\n    {lang.upper()}: ❌ No manifest IDs")
                if not mapping_ids:
                    print(f"\n    {lang.upper()}: ❌ No mapping IDs")
    
    def check_audio_ids(self):
        """Ստուգել audioId-ների առկայությունը dictionary-ներում"""
        print("\n🎯 AUDIO ID-ՆԵՐԻ ՍՏՈՒԳՈՒՄ")
        print("-"*80)
        
        # Ստուգել unified-dictionary.json
        dict_path = self.root / 'data' / 'dictionaries' / 'unified-dictionary.json'
        if dict_path.exists():
            try:
                with open(dict_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, dict):
                    words = data.get('words', [])
                    print(f"  ✅ unified-dictionary: {len(words)} բառ")
                    
                    # Ստուգել audioId-ները
                    with_audio = [w for w in words if w.get('audioId')]
                    without_audio = [w for w in words if not w.get('audioId')]
                    
                    print(f"    📊 audioId-ով: {len(with_audio)}")
                    print(f"    ⚠️  առանց audioId: {len(without_audio)}")
                    
                    if without_audio:
                        self.results['warnings'].append(f"{len(without_audio)} words without audioId in unified-dictionary")
                        if len(without_audio) <= 5:
                            for w in without_audio:
                                print(f"      - {w.get('word', 'N/A')} (id: {w.get('id', 'N/A')})")
                        else:
                            for w in without_audio[:3]:
                                print(f"      - {w.get('word', 'N/A')} (id: {w.get('id', 'N/A')})")
                            print(f"      ... and {len(without_audio) - 3} more")
                elif isinstance(data, list):
                    print(f"  ❌ unified-dictionary: list է, dict չէ")
                    self.results['errors'].append("unified-dictionary is list, not dict")
                else:
                    print(f"  ❌ unified-dictionary: անհայտ տիպ")
                    
            except json.JSONDecodeError as e:
                print(f"  ❌ JSON սխալ: {e}")
                self.results['errors'].append(f"JSON error in unified-dictionary.json: {e}")
        else:
            print(f"  ❌ unified-dictionary.json բացակայում է")
            self.results['errors'].append("unified-dictionary.json missing")
        
        # Ստուգել user-dictionary.json
        user_path = self.root / 'data' / 'dictionaries' / 'user-dictionary.json'
        if user_path.exists():
            try:
                with open(user_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, dict):
                    words = data.get('words', [])
                    print(f"  ✅ user-dictionary: {len(words)} բառ")
                    
                    with_audio = [w for w in words if w.get('audioId')]
                    without_audio = [w for w in words if not w.get('audioId')]
                    
                    print(f"    📊 audioId-ով: {len(with_audio)}")
                    print(f"    ⚠️  առանց audioId: {len(without_audio)}")
                    
                    if without_audio:
                        self.results['warnings'].append(f"{len(without_audio)} words without audioId in user-dictionary")
                elif isinstance(data, list):
                    print(f"  ❌ user-dictionary: list է, dict չէ")
                    self.results['errors'].append("user-dictionary is list, not dict")
                else:
                    print(f"  ❌ user-dictionary: անհայտ տիպ")
                    
            except json.JSONDecodeError as e:
                print(f"  ❌ JSON սխալ: {e}")
                self.results['errors'].append(f"JSON error in user-dictionary.json: {e}")
        else:
            print(f"  ❌ user-dictionary.json բացակայում է")
            self.results['errors'].append("user-dictionary.json missing")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 ԱՄՓՈՓՈՒՄ")
        print("="*80)
        
        errors = len(self.results['errors'])
        warnings = len(self.results['warnings'])
        
        if errors == 0 and warnings == 0:
            print("\n  ✅ ԱՄԵՆ ԻՆՉ ԱՇԽԱՏՈՒՄ Է ՆՈՐՄԱԼ")
            self.results['status'] = 'OK'
        elif errors == 0:
            print(f"\n  ⚠️  ԱՇԽԱՏՈՒՄ Է, ԲԱՅՑ ԿԱՆ {warnings} ԶԳՈՒՇԱՑՈՒՄՆԵՐ")
            self.results['status'] = 'WARNINGS'
        else:
            print(f"\n  ❌ ԿԱՆ {errors} ՍԽԱԼ ԵՎ {warnings} ԶԳՈՒՇԱՑՈՒՄ")
            self.results['status'] = 'ERRORS'
        
        if errors > 0:
            print(f"\n  ❌ ՍԽԱԼՆԵՐ:")
            for error in self.results['errors'][:10]:
                print(f"    - {error}")
            if len(self.results['errors']) > 10:
                print(f"    ... and {len(self.results['errors']) - 10} more")
        
        if warnings > 0:
            print(f"\n  ⚠️  ԶԳՈՒՇԱՑՈՒՄՆԵՐ:")
            for warning in self.results['warnings'][:5]:
                print(f"    - {warning}")
            if len(self.results['warnings']) > 5:
                print(f"    ... and {len(self.results['warnings']) - 5} more")
        
        print("="*80)
    
    def save_report(self):
        """Պահպանել զեկույցը"""
        report_dir = self.root / 'mapping_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'mapping_validation_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Report saved: {report_file}")

def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    validator = MappingValidator(root_path)
    validator.run_all_checks()

if __name__ == "__main__":
    main()