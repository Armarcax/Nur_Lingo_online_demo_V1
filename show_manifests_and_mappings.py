# show_manifests_and_mappings.py

import os
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

class ManifestAndMappingViewer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'files': []
        }
        self.total_files = 0

    def analyze_all(self):
        """Վերլուծել բոլոր JSON ֆայլերը"""
        print("\n" + "="*80)
        print("📋 MANIFEST & MAPPING FILES VIEWER")
        print("="*80)
        print("\n🔍 Փնտրում եմ բոլոր JSON ֆայլերը...")

        # 1. Գտնել բոլոր JSON ֆայլերը
        json_files = []
        
        # Manifest ֆայլեր
        manifest_patterns = [
            'public/audio/offline/*.json',
            'public/audio/offline_dictionary/*.json',
            'public/audio/offline_user_dictionary/*.json'
        ]
        
        for pattern in manifest_patterns:
            for file in self.root.glob(pattern):
                json_files.append(file)
        
        # Mapping ֆայլեր
        mapping_patterns = [
            'src/lib/content/mappings/*.json',
            'src/lib/content/*.json'
        ]
        
        for pattern in mapping_patterns:
            for file in self.root.glob(pattern):
                if file.name not in [f.name for f in json_files]:
                    json_files.append(file)
        
        # Dictionary ֆայլեր
        dict_patterns = [
            'data/dictionaries/*.json'
        ]
        
        for pattern in dict_patterns:
            for file in self.root.glob(pattern):
                if file.name not in [f.name for f in json_files]:
                    json_files.append(file)

        print(f"\n📁 Գտնվել է {len(json_files)} JSON ֆայլ\n")
        print("-"*80)

        for file in sorted(json_files):
            self.total_files += 1
            self.display_file(file)

        self.print_summary()

    def display_file(self, filepath: Path):
        """Ցուցադրել ֆայլի պարունակությունը"""
        rel_path = filepath.relative_to(self.root)
        size = filepath.stat().st_size
        
        print(f"\n{'='*80}")
        print(f"📄 {rel_path}")
        print(f"📊 Չափ: {self.format_size(size)}")
        print("-"*80)

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Փորձել parse անել JSON-ը
            try:
                data = json.loads(content)
                data_type = type(data).__name__
                print(f"📊 Տիպ: {data_type}")
                
                if isinstance(data, dict):
                    print(f"📊 Բանալիներ: {len(data)}")
                    print(f"📊 Բանալիների ցանկ: {list(data.keys())[:10]}")
                    if len(data.keys()) > 10:
                        print(f"   ... և {len(data.keys()) - 10} ավել")
                    
                    # Ցույց տալ առաջին 50 տողը
                    self.show_json_preview(data, 50)
                    
                elif isinstance(data, list):
                    print(f"📊 Չափ: {len(data)}")
                    if len(data) > 0:
                        print(f"📊 Առաջին տարրի տիպ: {type(data[0]).__name__}")
                    self.show_json_preview(data, 50)
                    
                else:
                    print(f"📊 Այլ տիպ: {data_type}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON parse սխալ: {e}")
                # Ցույց տալ առաջին 50 տողը որպես տեքստ
                lines = content.split('\n')
                print(f"\n📝 ԱՌԱՋԻՆ 50 ՏՈՂԸ:")
                for i, line in enumerate(lines[:50], 1):
                    print(f"{i:4}. {line[:100]}")
                if len(lines) > 50:
                    print(f"... և {len(lines) - 50} տող ավել")
                    
        except Exception as e:
            print(f"❌ Սխալ: {e}")

    def show_json_preview(self, data: Any, max_lines: int = 50):
        """Ցույց տալ JSON-ի առաջին max_lines տողերը"""
        try:
            # Ամբողջական JSON-ը մեկ տողով
            full_json = json.dumps(data, ensure_ascii=False, indent=2)
            lines = full_json.split('\n')
            
            print(f"\n📝 ԱՌԱՋԻՆ {max_lines} ՏՈՂԸ:")
            for i, line in enumerate(lines[:max_lines], 1):
                # Կրճատել երկար տողերը
                if len(line) > 120:
                    line = line[:117] + '...'
                print(f"{i:4}. {line}")
            
            if len(lines) > max_lines:
                print(f"... և {len(lines) - max_lines} տող ավել")
                
        except Exception as e:
            print(f"❌ Preview սխալ: {e}")

    def format_size(self, size: int) -> str:
        """Ֆորմատավորել ֆայլի չափը"""
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"

    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 ԱՄՓՈՓՈՒՄ")
        print("="*80)
        print(f"\n📁 Ընդհանուր JSON ֆայլեր: {self.total_files}")

def main():
    # Փոխել root path-ը ըստ ձեր համակարգի
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\NURLingo-offline-audio-repair"
    
    # Կամ օգտագործել ընթացիկ դիրեկտորիան
    # root_path = os.getcwd()
    
    viewer = ManifestAndMappingViewer(root_path)
    viewer.analyze_all()

if __name__ == "__main__":
    main()