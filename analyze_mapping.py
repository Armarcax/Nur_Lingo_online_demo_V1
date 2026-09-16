#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 MAPPING STRUCTURE ANALYZER
Ստուգում է բոլոր mapping ֆայլերի կառուցվածքը
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.resolve()

# ─── Colors ──────────────────────────────────────────────────────────
G = "\033[92m"
R = "\033[91m"
Y = "\033[93m"
B = "\033[94m"
W = "\033[97m"
X = "\033[0m"

def ok(s): return f"{G}✅ {s}{X}"
def err(s): return f"{R}❌ {s}{X}"
def warn(s): return f"{Y}⚠️  {s}{X}"
def info(s): return f"{B}ℹ️  {s}{X}"

def analyze_file(file_path):
    """Վերլուծել մեկ ֆայլ"""
    
    print(f"\n📄 {file_path.name}")
    print("─" * 60)
    
    if not file_path.exists():
        print(err(f"File not found: {file_path}"))
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            data = json.loads(content)
        
        print(f"📊 File size: {len(content)} bytes")
        print(f"📊 Data type: {type(data).__name__}")
        
        if isinstance(data, dict):
            print(f"🔑 Top-level keys: {list(data.keys())}")
            
            # Check if mapping exists
            if "mapping" in data:
                mapping = data["mapping"]
                print(f"📊 Mapping entries: {len(mapping)}")
                
                # Show first 20 keys
                keys = list(mapping.keys())
                print(f"\n📋 First 20 entries:")
                for i, key in enumerate(keys[:20], 1):
                    print(f"  {i:2}. {key} → {mapping[key]}.mp3")
                
                # Check for greet_hello
                if "greet_hello" in mapping:
                    print(ok(f"\n✅ 'greet_hello' found → {mapping['greet_hello']}.mp3"))
                else:
                    print(warn(f"\n⚠️  'greet_hello' NOT in mapping!"))
                
                # Check if keys are numeric or string
                numeric_keys = [k for k in keys if k.isdigit()]
                string_keys = [k for k in keys if not k.isdigit()]
                print(f"\n📊 Numeric keys: {len(numeric_keys)}")
                print(f"📊 String keys: {len(string_keys)}")
                
                # Show sample of string keys
                if string_keys:
                    print(f"\n📋 Sample string keys (first 10):")
                    for key in string_keys[:10]:
                        print(f"  {key}")
                
                # Check for pattern
                if string_keys:
                    print(f"\n📋 Key patterns:")
                    patterns = {}
                    for key in string_keys:
                        pattern = re.sub(r'[0-9]+', '#', key)
                        pattern = re.sub(r'[aeiouyAEIOUY]+', 'V', pattern)
                        pattern = re.sub(r'[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]+', 'C', pattern)
                        pattern = re.sub(r'[^CV]', 'O', pattern)
                        if pattern not in patterns:
                            patterns[pattern] = 0
                        patterns[pattern] += 1
                    for pattern, count in sorted(patterns.items(), key=lambda x: -x[1])[:5]:
                        print(f"  {pattern} → {count} keys")
                
                return {"name": file_path.name, "entries": len(mapping), "has_greet": "greet_hello" in mapping, "keys": keys}
            else:
                print(err("❌ No 'mapping' field found!"))
                return None
        elif isinstance(data, list):
            print(f"📊 List length: {len(data)}")
            print(f"\n📋 First 5 entries:")
            for i, item in enumerate(data[:5], 1):
                if isinstance(item, dict):
                    print(f"  {i}. {item.get('id', 'N/A')} → {item.get('hy', 'N/A')}")
                else:
                    print(f"  {i}. {item}")
            return {"name": file_path.name, "entries": len(data), "has_greet": False}
        else:
            print(err(f"Unknown format: {type(data)}"))
            return None
            
    except json.JSONDecodeError as e:
        print(err(f"JSON parse error: {e}"))
        print(f"First 200 chars: {content[:200]}...")
        return None
    except Exception as e:
        print(err(f"Error reading file: {e}"))
        return None

def main():
    print(f"\n{W}🔍 MAPPING STRUCTURE ANALYZER{X}")
    print(f"Root: {ROOT}\n")
    print("=" * 60)
    
    # Files to analyze
    files = [
        ROOT / "src/lib/content/audio-mapping.ts",
        ROOT / "public/audio/offline/audio-num-en-mapping.json",
        ROOT / "public/audio/offline/audio-num-hy-mapping.json",
        ROOT / "public/audio/offline/audio-num-ru-mapping.json",
        ROOT / "public/audio/offline/manifest_hy_ani.json",
        ROOT / "public/audio/offline/manifest_en_female.json",
        ROOT / "public/audio/offline/manifest_ru_female.json",
    ]
    
    results = []
    
    for f in files:
        result = analyze_file(f)
        if result:
            results.append(result)
    
    # ─── SUMMARY ────────────────────────────────────────────────────
    print(f"\n{W}{'═'*60}")
    print("   📊 SUMMARY")
    print(f"{'═'*60}{X}")
    
    for r in results:
        if r:
            status = "✅" if r.get("has_greet") else "⚠️"
            print(f"\n📄 {r['name']}")
            print(f"  Entries: {r['entries']}")
            print(f"  {status} greet_hello: {'YES' if r.get('has_greet') else 'NO'}")
    
    # Check if greet_hello is in any file
    has_greet = any(r.get("has_greet") for r in results if r)
    print(f"\n{info('📌 greet_hello found in: ' + ', '.join([r['name'] for r in results if r and r.get('has_greet')]))}")
    
    print(f"\n{info('💡 If greet_hello is in manifests but not working, check OfflineAudioManager')}")

if __name__ == "__main__":
    main()