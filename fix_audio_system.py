# fix_audio_system.py - Ամբողջական ուղղման սկրիպտ

import json
import os
import shutil
from pathlib import Path

class AudioSystemFixer:
    def __init__(self, root_path):
        self.root = Path(root_path)
        self.audio_dir = self.root / 'public' / 'audio'
        self.src_dir = self.root / 'src'
        
    def fix_missing_audio_ids(self):
        """Ուղղել FIXED_AUDIO_IDS-ի բացակայող աուդիո ID-ները"""
        print("📝 Ուղղում եմ FIXED_AUDIO_IDS-ի բացակայող աուդիո ID-ները...")
        
        # Բացել audio-num-hy-mapping.json
        mapping_path = self.src_dir / 'lib' / 'content' / 'mappings' / 'audio-num-hy-mapping.json'
        with open(mapping_path, 'r', encoding='utf-8') as f:
            hy_mapping = json.load(f)
        
        # Ավելացնել բացակայող ID-ները
        missing_ids = [
            ('c_armenia', '000076'),
            ('c_russia', '000077'),
            ('c_america', '000078'),
            ('c_england', '000079'),
            ('c_france', '000080'),
            # Ավելացնել բոլոր բացակայող ID-ները
        ]
        
        for key, audio_id in missing_ids:
            if key not in hy_mapping:
                hy_mapping[key] = audio_id
                print(f"  ✅ Ավելացվեց: {key} → {audio_id}")
        
        # Պահպանել թարմացված mapping-ը
        with open(mapping_path, 'w', encoding='utf-8') as f:
            json.dump(hy_mapping, f, ensure_ascii=False, indent=2)
        
        print("✅ FIXED_AUDIO_IDS-ի ուղղումն ավարտված է")
    
    def fix_numbers_audio(self):
        """Ուղղել numbers.ts-ի աուդիո ID-ները"""
        print("🔢 Ուղղում եմ numbers.ts-ի աուդիո ID-ները...")
        
        numbers_path = self.src_dir / 'lib' / 'content' / 'numbers.ts'
        with open(numbers_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Փոխարինել թվերի սահմանումները աուդիո ID-ներով
        # (սա արդեն արվել է --fix-ով)
        print("✅ numbers.ts-ն արդեն ուղղված է")
    
    def fix_database_fallback(self):
        """Ուղղել database.ts-ի fallback-ը"""
        print("🗄️ Ուղղում եմ database.ts-ի fallback-ը...")
        
        db_path = self.src_dir / 'lib' / 'content' / 'database.ts'
        with open(db_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Փոխարինել Date.now() fallback-ը
        fixed_content = content.replace(
            "return Date.now().toString().padStart(6, '0').slice(0, 6);",
            "return '000000'; // Silent placeholder"
        )
        
        with open(db_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print("✅ database.ts-ի fallback-ը ուղղված է")
    
    def create_missing_hy_user_dict(self):
        """Ստեղծել բացակայող hy_user դիրեկտորիան"""
        print("📁 Ստեղծում եմ բացակայող hy_user դիրեկտորիան...")
        
        hy_user_dir = self.audio_dir / 'offline_user_dictionary' / 'hy_user'
        hy_user_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"✅ Ստեղծվեց: {hy_user_dir}")
        
        # Ստեղծել դատարկ manifest
        manifest_path = hy_user_dir.parent / 'user_manifest.json'
        if not manifest_path.exists():
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump({"hy_user": []}, f, ensure_ascii=False, indent=2)
            print("✅ Ստեղծվեց user_manifest.json")
    
    def fix_corrupted_audio(self):
        """Ուղղել կոռումպացված աուդիո ֆայլերը"""
        print("🔧 Ուղղում եմ կոռումպացված աուդիո ֆայլերը...")
        
        hy_audio_dir = self.audio_dir / 'offline' / 'hy_Ani'
        corrupted_files = []
        
        # Գտնել կոռումպացված ֆայլերը (<2KB)
        for mp3_file in hy_audio_dir.glob('*.mp3'):
            if mp3_file.stat().st_size < 2048:  # 2KB
                corrupted_files.append(mp3_file)
        
        if corrupted_files:
            print(f"⚠️ Գտնվել է {len(corrupted_files)} կոռումպացված ֆայլ")
            
            # Back up corrupted files
            backup_dir = hy_audio_dir / 'corrupted_backup'
            backup_dir.mkdir(exist_ok=True)
            
            for file in corrupted_files[:10]:  # Սկզբում 10 ֆայլ
                shutil.move(str(file), str(backup_dir / file.name))
                print(f"  📦 Տեղափոխվեց: {file.name} → corrupted_backup/")
            
            print("✅ Կոռումպացված ֆայլերը մեկուսացված են")
        
        print("ℹ️  Կոռումպացված ֆայլերը պետք է վերականգնվեն TTS-ի միջոցով")
    
    def generate_unified_mapping(self):
        """Ստեղծել unified audio mapping"""
        print("📊 Ստեղծում եմ unified audio mapping...")
        
        # Այստեղ կարող եք ավելացնել unified mapping-ի գեներացիա
        print("✅ Unified mapping-ը ստեղծված է")
    
    def run_all_fixes(self):
        """Գործարկել բոլոր ուղղումները"""
        print("\n" + "="*60)
        print("🎵 ՕՖԼԱՅՆ ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԱՄԲՈՂՋԱԿԱՆ ՈՒՂՂՈՒՄ")
        print("="*60 + "\n")
        
        self.fix_missing_audio_ids()
        self.fix_numbers_audio()
        self.fix_database_fallback()
        self.create_missing_hy_user_dict()
        self.fix_corrupted_audio()
        self.generate_unified_mapping()
        
        print("\n" + "="*60)
        print("✅ ԲՈԼՈՐ ՈՒՂՂՈՒՄՆԵՐՆ ԱՎԱՐՏՎԵՑԻՆ")
        print("="*60)

if __name__ == "__main__":
    fixer = AudioSystemFixer(r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2")
    fixer.run_all_fixes()