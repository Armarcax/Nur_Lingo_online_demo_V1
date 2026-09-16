# audio_system_analyzer_simple.py - Պարզեցված տարբերակ

import os
import json
from pathlib import Path
from datetime import datetime

def analyze_audio_system(root_path):
    """Պարզեցված վերլուծություն"""
    
    root = Path(root_path)
    results = {
        'timestamp': datetime.now().isoformat(),
        'directories': {},
        'files_count': {},
        'issues': []
    }
    
    # 1. Ստուգել data/dictionaries
    dict_dir = root / 'data' / 'dictionaries'
    if dict_dir.exists():
        results['directories']['data_dictionaries'] = 'OK'
        for f in dict_dir.glob('*.json'):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    results['files_count'][f.name] = len(data.get('words', []))
            except:
                results['issues'].append(f"Can't parse {f.name}")
    else:
        results['directories']['data_dictionaries'] = 'MISSING'
    
    # 2. Ստուգել public/audio
    audio_dir = root / 'public' / 'audio'
    if audio_dir.exists():
        results['directories']['public_audio'] = 'OK'
        
        # Offline
        offline = audio_dir / 'offline'
        if offline.exists():
            for d in offline.iterdir():
                if d.is_dir():
                    mp3s = list(d.glob('*.mp3'))
                    results['files_count'][f'offline_{d.name}'] = len(mp3s)
        
        # Dictionary
        dict_audio = audio_dir / 'offline_dictionary'
        if dict_audio.exists():
            for d in dict_audio.iterdir():
                if d.is_dir():
                    mp3s = list(d.glob('*.mp3'))
                    results['files_count'][f'dict_{d.name}'] = len(mp3s)
        
        # User dictionary
        user_dict = audio_dir / 'offline_user_dictionary'
        if user_dict.exists():
            for d in user_dict.iterdir():
                if d.is_dir():
                    mp3s = list(d.glob('*.mp3'))
                    results['files_count'][f'user_{d.name}'] = len(mp3s)
    else:
        results['directories']['public_audio'] = 'MISSING'
    
    # 3. Ստուգել src/lib/content/mappings
    mappings_dir = root / 'src' / 'lib' / 'content' / 'mappings'
    if mappings_dir.exists():
        results['directories']['mappings'] = 'OK'
        for f in mappings_dir.glob('*.json'):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    results['files_count'][f.name] = len(data) if isinstance(data, dict) else len(data)
            except:
                results['issues'].append(f"Can't parse {f.name}")
    else:
        results['directories']['mappings'] = 'MISSING'
    
    # Save results
    report_dir = root / 'audio_reports'
    report_dir.mkdir(exist_ok=True)
    
    report_file = report_dir / f'audio_system_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Print summary
    print("\n" + "="*60)
    print("🎵 AUDIO SYSTEM ANALYSIS")
    print("="*60)
    
    for dir_name, status in results['directories'].items():
        icon = '✅' if status == 'OK' else '❌'
        print(f"  {icon} {dir_name}: {status}")
    
    print("\n  📊 FILES COUNT:")
    for name, count in results['files_count'].items():
        print(f"    {name}: {count}")
    
    if results['issues']:
        print("\n  ❌ ISSUES:")
        for issue in results['issues']:
            print(f"    - {issue}")
    
    print(f"\n✅ Report saved: {report_file}")

if __name__ == "__main__":
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    analyze_audio_system(root_path)