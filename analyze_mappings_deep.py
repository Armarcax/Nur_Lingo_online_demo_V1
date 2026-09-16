# analyze_mappings_deep.py

import os
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class MappingAnalyzer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.content_dir = self.root / 'src' / 'lib' / 'content'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'files_analyzed': [],
            'summary': {}
        }
    
    def analyze_all(self):
        """Վերլուծել բոլոր մափինգ ֆայլերը"""
        print("\n" + "="*80)
        print("🔍 MAPPING ՖԱՅԼԵՐԻ ԽՈՐ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ")
        print("="*80)
        
        # 1. JSON mapping ֆայլեր
        self.analyze_json_mappings()
        
        # 2. audio-mapping.ts
        self.analyze_audio_mapping_ts()
        
        # 3. audio-num-mapping.json
        self.analyze_audio_num_mapping()
        
        # 4. audio-mapping-integrated.ts
        self.analyze_audio_mapping_integrated()
        
        # 5. Այլ ֆայլեր, որոնք կարող են պարունակել audioId
        self.analyze_other_files()
        
        # 6. Ամփոփում
        self.print_summary()
        
        # 7. Պահպանել արդյունքները
        self.save_report()
        
        return self.results
    
    def analyze_json_mappings(self):
        """Վերլուծել JSON mapping ֆայլերը"""
        print("\n📋 JSON MAPPING ՖԱՅԼԵՐ")
        print("-"*80)
        
        mappings_dir = self.content_dir / 'mappings'
        if not mappings_dir.exists():
            print("  ❌ mappings դիրեկտորիան բացակայում է")
            return
        
        json_files = [
            'audio-num-hy-mapping.json',
            'audio-num-en-mapping.json',
            'audio-num-ru-mapping.json',
            'audio-num-unified.json'
        ]
        
        for filename in json_files:
            filepath = mappings_dir / filename
            print(f"\n  📄 {filename}")
            print("  " + "-"*60)
            
            if not filepath.exists():
                print(f"    ❌ Ֆայլը բացակայում է")
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Վերլուծել կառուցվածքը
                data_type = type(data).__name__
                print(f"    📊 Տիպ: {data_type}")
                
                if isinstance(data, dict):
                    keys = list(data.keys())
                    print(f"    📊 Entry-ների քանակ: {len(data)}")
                    print(f"    📊 Բանալիների տիպ: {type(keys[0]).__name__ if keys else 'N/A'}")
                    print(f"    📊 Արժեքների տիպ: {type(data[keys[0]]).__name__ if keys else 'N/A'}")
                    
                    # Ցուցադրել առաջին 20-ը
                    print(f"\n    📝 ԱՌԱՋԻՆ 20 ENTRY:")
                    for i, (key, value) in enumerate(list(data.items())[:20], 1):
                        print(f"      {i:2}. {key} → {value}")
                    
                    # Վիճակագրություն
                    values = list(data.values())
                    if values:
                        # Ստուգել արդյոք արժեքները 6-անիշ թվեր են
                        six_digit = sum(1 for v in values if isinstance(v, str) and len(v) == 6 and v.isdigit())
                        print(f"\n    📊 6-անիշ արժեքներ: {six_digit}/{len(values)}")
                        
                        # Գտնել կրկնվող արժեքներ
                        duplicates = [v for v in set(values) if values.count(v) > 1]
                        if duplicates:
                            print(f"    ⚠️  Կրկնվող արժեքներ: {len(duplicates)}")
                            for dup in duplicates[:5]:
                                keys_with_dup = [k for k, v in data.items() if v == dup]
                                print(f"      - {dup}: {keys_with_dup}")
                
                elif isinstance(data, list):
                    print(f"    📊 Entry-ների քանակ: {len(data)}")
                    
                    # Ցուցադրել առաջին 20-ը
                    print(f"\n    📝 ԱՌԱՋԻՆ 20 ENTRY:")
                    for i, item in enumerate(data[:20], 1):
                        if isinstance(item, dict):
                            print(f"      {i:2}. {json.dumps(item, ensure_ascii=False)[:100]}...")
                        else:
                            print(f"      {i:2}. {item}")
                
                else:
                    print(f"    ⚠️  Անհայտ տիպ: {data_type}")
                    print(f"    📝 Բովանդակություն: {str(data)[:200]}...")
                
                self.results['files_analyzed'].append({
                    'file': filename,
                    'type': data_type,
                    'count': len(data) if isinstance(data, (dict, list)) else 0,
                    'sample': list(data.items())[:20] if isinstance(data, dict) else data[:20] if isinstance(data, list) else str(data)[:200]
                })
                
            except json.JSONDecodeError as e:
                print(f"    ❌ JSON սխալ: {e}")
            except Exception as e:
                print(f"    ❌ Սխալ: {e}")
    
    def analyze_audio_mapping_ts(self):
        """Վերլուծել audio-mapping.ts ֆայլը"""
        print("\n📄 audio-mapping.ts")
        print("-"*80)
        
        filepath = self.content_dir / 'audio-mapping.ts'
        if not filepath.exists():
            print("  ❌ Ֆայլը բացակայում է")
            return
        
        try:
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            # Փնտրել exports
            exports = re.findall(r'export\s+(?:const|function|interface|type|class)\s+(\w+)', content)
            print(f"  📊 Exports: {', '.join(exports[:10])}")
            
            # Փնտրել audioId-ներ
            audio_ids = re.findall(r"['\"](\d{6})['\"]", content)
            print(f"  📊 Audio IDs found: {len(audio_ids)}")
            
            # Փնտրել mapping օբյեկտներ
            mappings = re.findall(r'(?:const|let|var)\s+(\w+Mapping)\s*[:=]', content)
            print(f"  📊 Mapping variables: {', '.join(mappings[:5])}")
            
            # Ցույց տալ ֆայլի կառուցվածքը
            lines = content.split('\n')
            print(f"\n  📝 ՖԱՅԼԻ ԿԱՌՈՒՑՎԱԾՔԸ (առաջին 20 տող):")
            for i, line in enumerate(lines[:20], 1):
                if line.strip():
                    print(f"    {i:2}. {line[:80]}")
            
            self.results['files_analyzed'].append({
                'file': 'audio-mapping.ts',
                'type': 'typescript',
                'exports': exports[:10],
                'audio_ids_count': len(audio_ids),
                'sample_ids': audio_ids[:10]
            })
            
        except Exception as e:
            print(f"  ❌ Սխալ: {e}")
    
    def analyze_audio_num_mapping(self):
        """Վերլուծել audio-num-mapping.json ֆայլը"""
        print("\n📄 audio-num-mapping.json")
        print("-"*80)
        
        filepath = self.content_dir / 'audio-num-mapping.json'
        if not filepath.exists():
            print("  ❌ Ֆայլը բացակայում է")
            return
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            data_type = type(data).__name__
            print(f"  📊 Տիպ: {data_type}")
            
            if isinstance(data, dict):
                print(f"  📊 Entry-ների քանակ: {len(data)}")
                
                # Ցուցադրել առաջին 20-ը
                print(f"\n  📝 ԱՌԱՋԻՆ 20 ENTRY:")
                for i, (key, value) in enumerate(list(data.items())[:20], 1):
                    print(f"    {i:2}. {key} → {value}")
                
                # Վիճակագրություն
                values = list(data.values())
                six_digit = sum(1 for v in values if isinstance(v, str) and len(v) == 6 and v.isdigit())
                print(f"\n  📊 6-անիշ արժեքներ: {six_digit}/{len(values)}")
                
                # Ստուգել առանձնահատկություններ
                keys = list(data.keys())
                if keys:
                    print(f"  📊 Բանալիների օրինակներ: {', '.join(keys[:10])}")
                    
                    # Ստուգել արդյոք կան prefix-ներ
                    prefixes = set()
                    for key in keys:
                        if '_' in key:
                            prefixes.add(key.split('_')[0])
                    if prefixes:
                        print(f"  📊 Prefix-ներ: {', '.join(prefixes)}")
                
                self.results['files_analyzed'].append({
                    'file': 'audio-num-mapping.json',
                    'type': data_type,
                    'count': len(data),
                    'sample': list(data.items())[:20]
                })
                
            elif isinstance(data, list):
                print(f"  📊 Entry-ների քանակ: {len(data)}")
                print(f"\n  📝 ԱՌԱՋԻՆ 20 ENTRY:")
                for i, item in enumerate(data[:20], 1):
                    print(f"    {i:2}. {item}")
                
                self.results['files_analyzed'].append({
                    'file': 'audio-num-mapping.json',
                    'type': data_type,
                    'count': len(data),
                    'sample': data[:20]
                })
            else:
                print(f"  📝 Բովանդակություն: {str(data)[:200]}...")
                
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON սխալ: {e}")
        except Exception as e:
            print(f"  ❌ Սխալ: {e}")
    
    def analyze_audio_mapping_integrated(self):
        """Վերլուծել audio-mapping-integrated.ts ֆայլը"""
        print("\n📄 audio-mapping-integrated.ts")
        print("-"*80)
        
        filepath = self.content_dir / 'audio-mapping-integrated.ts'
        if not filepath.exists():
            print("  ❌ Ֆայլը բացակայում է")
            return
        
        try:
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            # Փնտրել imports
            imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
            print(f"  📊 Imports: {', '.join(imports[:5])}")
            
            # Փնտրել ֆունկցիաներ
            functions = re.findall(r'(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(', content)
            print(f"  📊 Functions: {', '.join(functions[:10])}")
            
            # Փնտրել constants
            constants = re.findall(r'(?:export\s+)?const\s+(\w+)\s*[:=]', content)
            print(f"  📊 Constants: {', '.join(constants[:10])}")
            
            # Փնտրել audioId-ներ
            audio_ids = re.findall(r"['\"](\d{6})['\"]", content)
            print(f"  📊 Audio IDs found: {len(audio_ids)}")
            
            # Ցույց տալ ֆայլի կառուցվածքը
            lines = content.split('\n')
            print(f"\n  📝 ՖԱՅԼԻ ԿԱՌՈՒՑՎԱԾՔԸ (առաջին 20 տող):")
            for i, line in enumerate(lines[:20], 1):
                if line.strip():
                    print(f"    {i:2}. {line[:80]}")
            
            self.results['files_analyzed'].append({
                'file': 'audio-mapping-integrated.ts',
                'type': 'typescript',
                'imports': imports[:5],
                'functions': functions[:10],
                'constants': constants[:10],
                'audio_ids_count': len(audio_ids)
            })
            
        except Exception as e:
            print(f"  ❌ Սխալ: {e}")
    
    def analyze_other_files(self):
        """Վերլուծել այլ ֆայլեր, որոնք կարող են պարունակել audioId"""
        print("\n📄 ԱՅԼ ՖԱՅԼԵՐ (audioId-ներով)")
        print("-"*80)
        
        other_files = [
            'database.ts',
            'numbers.ts',
            '../lessons/engine.ts',
            '../lexicon/dictionary.ts'
        ]
        
        for filename in other_files:
            filepath = self.content_dir / filename
            if not filepath.exists():
                filepath = self.root / 'src' / 'lib' / filename
                if not filepath.exists():
                    print(f"  ❌ {filename}: բացակայում է")
                    continue
            
            try:
                content = filepath.read_text(encoding='utf-8', errors='ignore')
                audio_ids = re.findall(r"['\"](\d{6})['\"]", content)
                
                if audio_ids:
                    print(f"\n  📄 {filename}")
                    print(f"    📊 Audio IDs found: {len(audio_ids)}")
                    print(f"    📝 Օրինակներ: {', '.join(audio_ids[:10])}")
                    
                    # Փնտրել audioId կամ audio_id
                    audio_refs = re.findall(r'(?:audioId|audio_id)\s*[:=]\s*[''"](\d{6})[''"]', content, re.IGNORECASE)
                    if audio_refs:
                        print(f"    📊 audioId references: {len(audio_refs)}")
                        print(f"    📝 Օրինակներ: {', '.join(audio_refs[:10])}")
                    
                    self.results['files_analyzed'].append({
                        'file': filename,
                        'type': 'typescript',
                        'audio_ids_count': len(audio_ids),
                        'sample_ids': audio_ids[:10]
                    })
                else:
                    print(f"  ⚠️ {filename}: audioId չի գտնվել")
                    
            except Exception as e:
                print(f"  ❌ {filename}: {e}")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 ԱՄՓՈՓՈՒՄ")
        print("="*80)
        
        total_entries = 0
        total_audio_ids = 0
        
        for file_info in self.results['files_analyzed']:
            if 'count' in file_info:
                total_entries += file_info['count']
            if 'audio_ids_count' in file_info:
                total_audio_ids += file_info['audio_ids_count']
        
        print(f"\n  📁 Վերլուծված ֆայլեր: {len(self.results['files_analyzed'])}")
        print(f"  📊 Ընդհանուր entries: {total_entries}")
        print(f"  🎵 Ընդհանուր audio IDs: {total_audio_ids}")
        
        # Ցույց տալ ամենամեծ mapping-ը
        if self.results['files_analyzed']:
            largest = max(
                [f for f in self.results['files_analyzed'] if 'count' in f],
                key=lambda x: x.get('count', 0),
                default=None
            )
            if largest:
                print(f"\n  📈 Ամենամեծ mapping: {largest.get('file')} - {largest.get('count', 0)} entries")
    
    def save_report(self):
        """Պահպանել արդյունքները"""
        report_dir = self.root / 'mapping_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'mapping_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Report saved: {report_file}")

def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    analyzer = MappingAnalyzer(root_path)
    analyzer.analyze_all()

if __name__ == "__main__":
    main()