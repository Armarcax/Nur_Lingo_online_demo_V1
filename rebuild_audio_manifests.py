# rebuild_audio_manifests.py

import json
import os
from pathlib import Path
from typing import Dict, List

class AudioManifestRebuilder:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.audio_dir = self.root / 'public' / 'audio'
        
    def rebuild_all_manifests(self):
        """Վերականգնել բոլոր manifests-ները"""
        print("🔄 Վերականգնում եմ audio manifests...")
        
        # 1. Վերականգնել lesson manifests
        self.rebuild_lesson_manifest('hy_Ani', 'manifest_hy_ani.json')
        self.rebuild_lesson_manifest('en_female', 'manifest_en_female.json')
        self.rebuild_lesson_manifest('ru_female', 'manifest_ru_female.json')
        
        # 2. Վերականգնել dictionary manifest
        self.rebuild_dictionary_manifest()
        
        # 3. Վերականգնել user dictionary manifest
        self.rebuild_user_manifest()
        
        # 4. Ստեղծել index manifest
        self.create_index_manifest()
        
        print("✅ Բոլոր manifests-ները վերականգնված են")
    
    def rebuild_lesson_manifest(self, language_dir: str, manifest_name: str):
        """Վերականգնել lesson manifest-ը"""
        dir_path = self.audio_dir / 'offline' / language_dir
        manifest_path = self.audio_dir / 'offline' / manifest_name
        
        if not dir_path.exists():
            print(f"  ⚠️ {language_dir} - դիրեկտորիան բացակայում է")
            return
        
        # Հավաքել բոլոր MP3 ֆայլերը
        mp3_files = sorted([f.name for f in dir_path.glob('*.mp3')])
        
        # Ստեղծել manifest
        manifest_data = {
            "language": language_dir,
            "total_files": len(mp3_files),
            "files": mp3_files,
            "generated": str(self.get_timestamp())
        }
        
        # Պահպանել
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ {language_dir}: {len(mp3_files)} files → {manifest_name}")
    
    def rebuild_dictionary_manifest(self):
        """Վերականգնել dictionary manifest-ը"""
        manifest_path = self.audio_dir / 'offline_dictionary' / 'manifest.json'
        dict_data = {}
        
        languages = ['hy', 'en', 'ru']
        
        for lang in languages:
            dir_path = self.audio_dir / 'offline_dictionary' / lang
            if dir_path.exists():
                files = sorted([f.name for f in dir_path.glob('*.mp3')])
                dict_data[lang] = {
                    "count": len(files),
                    "files": files
                }
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(dict_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Dictionary manifest: {sum(d['count'] for d in dict_data.values())} files")
    
    def rebuild_user_manifest(self):
        """Վերականգնել user dictionary manifest-ը"""
        manifest_path = self.audio_dir / 'offline_user_dictionary' / 'user_manifest.json'
        user_data = {}
        
        languages = ['hy_user', 'en_user', 'ru_user']
        
        for lang in languages:
            dir_path = self.audio_dir / 'offline_user_dictionary' / lang
            if dir_path.exists():
                files = sorted([f.name for f in dir_path.glob('*.mp3')])
                user_data[lang] = {
                    "count": len(files),
                    "files": files
                }
            else:
                # Ստեղծել դատարկ դիրեկտորիա
                dir_path.mkdir(parents=True, exist_ok=True)
                user_data[lang] = {
                    "count": 0,
                    "files": []
                }
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ User manifest: {sum(d['count'] for d in user_data.values())} files")
    
    def create_index_manifest(self):
        """Ստեղծել index manifest-ը"""
        index_path = self.audio_dir / 'offline' / 'manifest_index.json'
        
        index_data = {
            "languages": {
                "hy": {
                    "folder": "hy_Ani",
                    "manifest": "manifest_hy_ani.json"
                },
                "en": {
                    "folder": "en_female",
                    "manifest": "manifest_en_female.json"
                },
                "ru": {
                    "folder": "ru_female",
                    "manifest": "manifest_ru_female.json"
                }
            },
            "dictionary": {
                "manifest": "offline_dictionary/manifest.json"
            },
            "user_dictionary": {
                "manifest": "offline_user_dictionary/user_manifest.json"
            },
            "generated": str(self.get_timestamp())
        }
        
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Index manifest created")
    
    def get_timestamp(self):
        """Ստանալ timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

if __name__ == "__main__":
    rebuilder = AudioManifestRebuilder(
        r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    )
    rebuilder.rebuild_all_manifests()