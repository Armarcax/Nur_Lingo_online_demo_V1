# audio_system_analyzer.py - ՈՒՂՂՎԱԾ

import os
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime
import sys
import re

class AudioSystemAnalyzer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.src_dir = self.root / 'src'
        self.public_audio = self.root / 'public' / 'audio'
        
        # Արդյունքների կառուցվածք
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'structure': {
                'data_dictionaries': {},
                'public_audio': {},
                'src_content': {}
            },
            'mappings': {},
            'missing': {},
            'errors': [],
            'warnings': []
        }
    
    def analyze_all(self):
        """Ամբողջական վերլուծություն"""
        print("\n" + "="*70)
        print("🎵 ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԱՄԲՈՂՋԱԿԱՆ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ")
        print("="*70)
        
        # 1. Վերլուծել data/dictionaries
        self.analyze_data_dictionaries()
        
        # 2. Վերլուծել public/audio
        self.analyze_public_audio()
        
        # 3. Վերլուծել src/lib/content
        self.analyze_src_content()
        
        # 4. Ստուգել կապերը
        self.check_connections()
        
        # 5. Ստեղծել արդյունքների ֆայլ
        self.generate_report()
        
        return self.results
    
    def analyze_data_dictionaries(self):
        """Վերլուծել data/dictionaries"""
        print("\n📁 DATA/DICTIONARIES")
        print("-"*50)
        
        dict_dir = self.root / 'data' / 'dictionaries'
        if not dict_dir.exists():
            self.results['errors'].append("data/dictionaries directory not found")
            print("  ❌ Դիրեկտորիան բացակայում է")
            return
        
        dict_files = {
            'user-dictionary.json': 'user',
            'unified-dictionary.json': 'unified',
            'lesson-dictionary.json': 'lesson'
        }
        
        for filename, dict_type in dict_files.items():
            filepath = dict_dir / filename
            self.results['structure']['data_dictionaries'][filename] = {
                'exists': filepath.exists(),
                'type': dict_type
            }
            
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        word_count = len(data.get('words', []))
                        print(f"  ✅ {filename}: {word_count} բառ")
                        
                        # Պահել բառերի ցուցակը
                        if dict_type == 'unified':
                            self.results['mappings']['unified_words'] = [
                                {'id': w.get('id'), 'word': w.get('word'), 'audioId': w.get('audioId')}
                                for w in data.get('words', [])
                            ]
                        elif dict_type == 'user':
                            self.results['mappings']['user_words'] = [
                                {'id': w.get('id'), 'word': w.get('word'), 'audioId': w.get('audioId')}
                                for w in data.get('words', [])
                            ]
                except Exception as e:
                    print(f"  ❌ {filename}: ERROR - {e}")
                    self.results['errors'].append(f"Failed to parse {filename}: {e}")
            else:
                print(f"  ❌ {filename}: ԲԱՑԱԿԱՅՈՒՄ Է")
                self.results['warnings'].append(f"Missing file: {filename}")
    
    def analyze_public_audio(self):
        """Վերլուծել public/audio"""
        print("\n🎵 PUBLIC/AUDIO")
        print("-"*50)
        
        if not self.public_audio.exists():
            self.results['errors'].append("public/audio directory not found")
            print("  ❌ Դիրեկտորիան բացակայում է")
            return
        
        # 1. Օֆլայն դասերի աուդիո
        offline_dir = self.public_audio / 'offline'
        if offline_dir.exists():
            self.results['structure']['public_audio']['offline'] = {}
            
            for lang_dir in offline_dir.iterdir():
                if lang_dir.is_dir() and not lang_dir.name.startswith('.'):
                    lang_name = lang_dir.name
                    mp3_files = list(lang_dir.glob('*.mp3'))
                    valid = [f for f in mp3_files if f.stat().st_size > 2048]
                    corrupted = [f for f in mp3_files if f.stat().st_size <= 2048]
                    
                    self.results['structure']['public_audio']['offline'][lang_name] = {
                        'total': len(mp3_files),
                        'valid': len(valid),
                        'corrupted': len(corrupted),
                        'sample_files': [f.name for f in list(mp3_files)[:5]]
                    }
                    
                    # Գտնել աուդիո ID-ների ցուցակը
                    audio_ids = [f.stem for f in mp3_files]
                    self.results['mappings'][f'audio_ids_{lang_name}'] = {
                        'count': len(audio_ids),
                        'ids': audio_ids[:100]  # Առաջին 100-ը
                    }
                    
                    print(f"  ✅ {lang_name}: {len(valid)}/{len(mp3_files)} ֆայլ, {len(corrupted)} corrupted")
            
            # 2. Manifest ֆայլեր
            manifests = {}
            for manifest_file in offline_dir.glob('manifest_*.json'):
                try:
                    with open(manifest_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        manifests[manifest_file.name] = {
                            'size': len(data) if isinstance(data, list) else len(data.get('files', [])),
                            'structure': type(data).__name__
                        }
                except Exception as e:
                    manifests[manifest_file.name] = {'error': str(e)}
            
            self.results['structure']['public_audio']['offline']['manifests'] = manifests
        
        # 3. Բառարանի աուդիո
        dict_audio_dir = self.public_audio / 'offline_dictionary'
        if dict_audio_dir.exists():
            self.results['structure']['public_audio']['offline_dictionary'] = {}
            
            for lang_dir in dict_audio_dir.iterdir():
                if lang_dir.is_dir():
                    mp3_files = list(lang_dir.glob('*.mp3'))
                    self.results['structure']['public_audio']['offline_dictionary'][lang_dir.name] = {
                        'total': len(mp3_files),
                        'sample_files': [f.name for f in list(mp3_files)[:5]]
                    }
                    print(f"  ✅ dict_{lang_dir.name}: {len(mp3_files)} ֆայլ")
        
        # 4. User բառարան
        user_dict_dir = self.public_audio / 'offline_user_dictionary'
        if user_dict_dir.exists():
            self.results['structure']['public_audio']['offline_user_dictionary'] = {}
            
            for lang_dir in user_dict_dir.iterdir():
                if lang_dir.is_dir():
                    mp3_files = list(lang_dir.glob('*.mp3'))
                    self.results['structure']['public_audio']['offline_user_dictionary'][lang_dir.name] = {
                        'total': len(mp3_files),
                        'sample_files': [f.name for f in list(mp3_files)[:5]]
                    }
                    print(f"  ✅ user_{lang_dir.name}: {len(mp3_files)} ֆայլ")
    
    def analyze_src_content(self):
        """Վերլուծել src/lib/content"""
        print("\n📁 SRC/LIB/CONTENT")
        print("-"*50)
        
        content_dir = self.src_dir / 'lib' / 'content'
        if not content_dir.exists():
            self.results['errors'].append("src/lib/content directory not found")
            print("  ❌ Դիրեկտորիան բացակայում է")
            return
        
        self.results['structure']['src_content'] = {}
        
        # 1. Mapping ֆայլեր
        mappings_dir = content_dir / 'mappings'
        if mappings_dir.exists():
            self.results['structure']['src_content']['mappings'] = {}
            
            mapping_files = {
                'audio-num-hy-mapping.json': 'hy',
                'audio-num-en-mapping.json': 'en',
                'audio-num-ru-mapping.json': 'ru',
                'audio-num-unified.json': 'unified'
            }
            
            for filename, lang in mapping_files.items():
                filepath = mappings_dir / filename
                self.results['structure']['src_content']['mappings'][filename] = {
                    'exists': filepath.exists()
                }
                
                if filepath.exists():
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            entry_count = len(data) if isinstance(data, dict) else len(data)
                            self.results['structure']['src_content']['mappings'][filename]['entries'] = entry_count
                            
                            if isinstance(data, dict):
                                # Պահել mapping-ը
                                self.results['mappings'][f'mapping_{lang}'] = {
                                    'count': entry_count,
                                    'sample': dict(list(data.items())[:10])
                                }
                            
                            print(f"  ✅ {filename}: {entry_count} entries")
                    except Exception as e:
                        print(f"  ❌ {filename}: ERROR - {e}")
                        self.results['errors'].append(f"Failed to parse {filename}: {e}")
                else:
                    print(f"  ❌ {filename}: ԲԱՑԱԿԱՅՈՒՄ Է")
                    self.results['warnings'].append(f"Missing mapping: {filename}")
        
        # 2. Այլ կարևոր ֆայլեր
        other_files = [
            'audio-mapping.ts',
            'audio-mapping-integrated.ts',
            'audio-num-mapping.json',
            'database.ts',
            'numbers.ts'
        ]
        
        for filename in other_files:
            filepath = content_dir / filename
            if filepath.exists():
                # Գտնել audioId-ներ
                content = filepath.read_text(encoding='utf-8', errors='ignore')
                audio_ids = self.extract_audio_ids(content)
                
                self.results['structure']['src_content'][filename] = {
                    'exists': True,
                    'size': filepath.stat().st_size,
                    'audio_ids_found': len(audio_ids),
                    'sample_audio_ids': list(audio_ids)[:10]
                }
                print(f"  ✅ {filename}: {len(audio_ids)} audio IDs found")
            else:
                print(f"  ❌ {filename}: ԲԱՑԱԿԱՅՈՒՄ Է")
                self.results['warnings'].append(f"Missing file: {filename}")
    
    def extract_audio_ids(self, content: str) -> Set[str]:
        """Արտահանել audioId-ները տեքստից"""
        # Փնտրել audioId: "xxxxxx" կամ audioId: 'xxxxxx'
        pattern = r"audioId\s*[:=]\s*['\"](\d{6})['\"]"
        matches = re.findall(pattern, content)
        return set(matches)
    
    def check_connections(self):
        """Ստուգել կապերը բոլոր բաղադրիչների միջև"""
        print("\n🔗 ԿԱՊԵՐԻ ՍՏՈՒԳՈՒՄ")
        print("-"*50)
        
        # 1. Unified mapping ↔ Audio files
        unified_mapping = self.results['mappings'].get('mapping_hy', {}).get('sample', {})
        hy_audio_ids = set()
        
        offline_dir = self.public_audio / 'offline' / 'hy_Ani'
        if offline_dir.exists():
            hy_audio_ids = {f.stem for f in offline_dir.glob('*.mp3') if f.stat().st_size > 2048}
        
        # Ստուգել mapping-ի ID-ները
        mapping_ids = set(unified_mapping.keys())
        mapping_values = set(unified_mapping.values())
        
        missing_in_audio = mapping_values - hy_audio_ids
        extra_in_audio = hy_audio_ids - mapping_values
        
        self.results['connections'] = {
            'mapping_keys_count': len(mapping_ids),
            'mapping_values_count': len(mapping_values),
            'audio_files_count': len(hy_audio_ids),
            'missing_in_audio': list(missing_in_audio)[:20],
            'extra_in_audio': list(extra_in_audio)[:20],
            'match_percentage': (len(mapping_values & hy_audio_ids) / len(mapping_values) * 100) if mapping_values else 0
        }
        
        print(f"  📊 Mapping keys: {len(mapping_ids)}")
        print(f"  📊 Mapping values: {len(mapping_values)}")
        print(f"  📊 Audio files: {len(hy_audio_ids)}")
        print(f"  📊 Match: {self.results['connections']['match_percentage']:.1f}%")
        print(f"  ❌ Missing in audio: {len(missing_in_audio)}")
        print(f"  ⚠️ Extra in audio: {len(extra_in_audio)}")
        
        # 2. Ստուգել dictionary words-ի audioId-ները
        unified_words = self.results['mappings'].get('unified_words', [])
        words_without_audio = [w for w in unified_words if not w.get('audioId')]
        
        self.results['connections']['words_without_audio'] = len(words_without_audio)
        
        if words_without_audio:
            print(f"  ⚠️ {len(words_without_audio)} բառեր առանց audioId")
            self.results['connections']['sample_words_without_audio'] = words_without_audio[:10]
    
    def generate_report(self):
        """Ստեղծել ամբողջական զեկույց"""
        print("\n📊 ԶԵԿՈՒՅՑ")
        print("-"*50)
        
        # 1. Save JSON report
        report_dir = self.root / 'audio_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'audio_system_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Report saved: {report_file}")
        
        # 2. Save simplified mapping
        self.generate_simplified_mapping()
        
        # 3. Print summary
        self.print_summary()
    
    def generate_simplified_mapping(self):
        """Ստեղծել պարզեցված mapping ամեն ինչի համար"""
        print("\n🗺️ ՊԱՐԶԵՑՎԱԾ MAPPING")
        print("-"*50)
        
        mappings_dir = self.root / 'src' / 'lib' / 'content' / 'mappings'
        if not mappings_dir.exists():
            print("  ❌ mappings directory not found")
            return
        
        # 1. Տարբեր աղբյուրներից հավաքել բոլոր audioIds
        all_audio_ids = {}
        
        # Unified dictionary words
        unified_words = self.results['mappings'].get('unified_words', [])
        for word in unified_words:
            if word.get('audioId'):
                all_audio_ids[word.get('id')] = {
                    'type': 'dictionary',
                    'audioId': word.get('audioId'),
                    'word': word.get('word')
                }
        
        # User dictionary words
        user_words = self.results['mappings'].get('user_words', [])
        for word in user_words:
            if word.get('audioId'):
                all_audio_ids[word.get('id')] = {
                    'type': 'user_dictionary',
                    'audioId': word.get('audioId'),
                    'word': word.get('word')
                }
        
        # 2. Ստեղծել unified mapping
        unified_mapping = {}
        for key, value in all_audio_ids.items():
            unified_mapping[key] = value['audioId']
        
        unified_file = mappings_dir / 'audio-num-unified.json'
        with open(unified_file, 'w', encoding='utf-8') as f:
            json.dump(unified_mapping, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Unified mapping: {len(unified_mapping)} entries")
        
        # 3. Ստեղծել dictionary mapping
        dict_mapping = {}
        for word in unified_words:
            if word.get('audioId'):
                dict_mapping[word.get('id')] = word.get('audioId')
        
        # 4. Ստուգել բացակայողները
        all_hy_audio = set()
        hy_dir = self.public_audio / 'offline' / 'hy_Ani'
        if hy_dir.exists():
            all_hy_audio = {f.stem for f in hy_dir.glob('*.mp3') if f.stat().st_size > 2048}
        
        missing = set(unified_mapping.values()) - all_hy_audio
        if missing:
            report_dir = self.root / 'audio_reports'
            missing_file = report_dir / 'missing_audio_ids.txt'
            with open(missing_file, 'w', encoding='utf-8') as f:
                f.write(f"Missing audio IDs ({len(missing)}):\n")
                for audio_id in sorted(missing):
                    f.write(f"  {audio_id}\n")
            print(f"  ⚠️ {len(missing)} missing audio IDs saved to {missing_file}")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*70)
        print("📋 ԱՄՓՈՓՈՒՄ")
        print("="*70)
        
        # Audio files summary
        offline = self.results['structure']['public_audio'].get('offline', {})
        for lang, data in offline.items():
            if lang != 'manifests':
                print(f"  🎵 {lang}: {data.get('valid', 0)} valid, {data.get('corrupted', 0)} corrupted")
        
        # Mappings summary
        for name, data in self.results['structure']['src_content'].get('mappings', {}).items():
            if data.get('exists'):
                print(f"  📋 {name}: {data.get('entries', 0)} entries")
        
        # Connections summary
        conn = self.results.get('connections', {})
        print(f"\n  🔗 Match: {conn.get('match_percentage', 0):.1f}%")
        print(f"  ❌ Missing in audio: {len(conn.get('missing_in_audio', []))}")
        print(f"  ⚠️ Extra in audio: {len(conn.get('extra_in_audio', []))}")
        print(f"  ⚠️ Words without audio: {conn.get('words_without_audio', 0)}")
        
        # Errors
        if self.results.get('errors'):
            print(f"\n  ❌ Errors: {len(self.results['errors'])}")
            for error in self.results['errors'][:5]:
                print(f"    - {error}")
        
        # Warnings
        if self.results.get('warnings'):
            print(f"\n  ⚠️ Warnings: {len(self.results['warnings'])}")
            for warning in self.results['warnings'][:5]:
                print(f"    - {warning}")
        
        print("="*70)

def main():
    # Փոխել root path-ը ըստ ձեր համակարգի
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    
    analyzer = AudioSystemAnalyzer(root_path)
    results = analyzer.analyze_all()
    
    print(f"\n✅ Վերլուծությունն ավարտված է")
    print(f"📊 Արդյունքները պահված են audio_reports/ դիրեկտորիայում")

if __name__ == "__main__":
    main()