#!/usr/bin/env python3
import json
from pathlib import Path

# Կարևոր ֆայլեր (բովանդակային)
IMPORTANT = [
    "src/lib/i18n/translations.json",
    "src/lib/content/exercise-to-audio.json",
    "src/lib/lexicon/master-dictionary.json",
    "public/data/lesson-dictionary.json",
    "public/data/audio-manifest.json",
    "public/data/offline-audio-manifest.json",
    "public/drive_test/data/index.json",
    "public/drive_test/data/all-questions.json",
    "public/drive_test/data/test-01.json",
    "public/qp_test/NUR_Lingo_Qaghaqpashtpanutyun_հարցեր.json",
]

def show_structure(path_str):
    path = Path(path_str)
    if not path.exists():
        print(f"❌ ՉԿԱ: {path_str}\n")
        return
    
    size = path.stat().st_size
    size_str = f"{size/1024:.1f} KB" if size < 1024*1024 else f"{size/1024/1024:.1f} MB"
    
    print(f"\n{'═' * 70}")
    print(f"📄 {path_str}")
    print(f"   Չափ: {size_str}")
    print(f"{'═' * 70}")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"   ❌ Parse error: {e}")
        return
    
    if isinstance(data, list):
        print(f"   📦 Array — {len(data)} item")
        if data and isinstance(data[0], dict):
            print(f"   🔑 Item-ի keys:")
            for k, v in data[0].items():
                t = type(v).__name__
                if isinstance(v, list):
                    t = f"Array[{len(v)}]"
                elif isinstance(v, dict):
                    t = f"Object[{len(v)}]"
                val_preview = str(v)[:40] if not isinstance(v, (list, dict)) else ''
                print(f"      • {k:25} → {t:15} {val_preview}")
    
    elif isinstance(data, dict):
        print(f"   📦 Object — {len(data)} key")
        print(f"   🔑 Keys:")
        for k, v in list(data.items())[:15]:
            t = type(v).__name__
            if isinstance(v, list):
                t = f"Array[{len(v)}]"
            elif isinstance(v, dict):
                t = f"Object[{len(v)}]"
            val_preview = str(v)[:50] if not isinstance(v, (list, dict)) else ''
            print(f"      • {k:30} → {t:20} {val_preview}")
        if len(data) > 15:
            print(f"      ... +{len(data) - 15} more keys")

if __name__ == "__main__":
    for f in IMPORTANT:
        show_structure(f)