# audio_bug_finder.py

import os
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class AudioBugFinder:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.src_dir = self.root / 'src'
        self.public_audio = self.root / 'public' / 'audio'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'bugs': [],
            'critical_bugs': [],
            'warnings': [],
            'stats': {}
        }
    
    def find_all_bugs(self):
        """Գտնել բոլոր բագերը"""
        print("\n" + "="*80)
        print("🔍 AUDIO SYSTEM BUG FINDER")
        print("="*80)
        
        self.check_audio_paths()
        self.check_mappings()
        self.check_manifests()
        self.check_audio_files()
        self.check_exercise_mapping()
        self.check_language_direction()
        self.check_offline_systems()
        self.check_duplicate_buttons()
        self.check_wav_am_integrity()
        
        self.print_summary()
        self.save_report()
        
        return self.results
    
    def check_audio_paths(self):
        """Ստուգել աուդիո ճանապարհները"""
        print("\n📁 CHECKING AUDIO PATHS")
        print("-"*80)
        
        # 1. Ստուգել OfflineAudioManager.ts
        filepath = self.src_dir / 'lib' / 'offline' / 'OfflineAudioManager.ts'
        if filepath.exists():
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            # Գտնել getAudioUrl ֆունկցիան
            if 'getAudioUrl' in content:
                # Ստուգել արդյոք օգտագործում է combinedMapping-ը
                if 'this.combinedMapping[audioKey]' in content:
                    print("  ✅ OfflineAudioManager: uses combinedMapping")
                else:
                    self.results['critical_bugs'].append({
                        'file': 'OfflineAudioManager.ts',
                        'issue': 'getAudioUrl does NOT use combinedMapping',
                        'fix': 'Use this.combinedMapping[audioKey] to resolve audio IDs'
                    })
                    print("  ❌ OfflineAudioManager: does NOT use combinedMapping")
            
            # Ստուգել արդյոք կա 000001 fallback
            if '000001' in content:
                self.results['bugs'].append({
                    'file': 'OfflineAudioManager.ts',
                    'issue': 'Contains 000001.mp3 fallback',
                    'fix': 'Remove hardcoded fallback, use proper mapping'
                })
                print("  ⚠️  Contains 000001.mp3 fallback")
        
        # 2. Ստուգել OfflineLessonEngine.ts
        filepath = self.src_dir / 'lib' / 'offline' / 'OfflineLessonEngine.ts'
        if filepath.exists():
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            # Ստուգել buildCombinedMapping-ը
            if 'buildCombinedMapping' in content:
                if 'exercise.audioId' in content:
                    print("  ✅ OfflineLessonEngine: uses exercise.audioId")
                else:
                    self.results['critical_bugs'].append({
                        'file': 'OfflineLessonEngine.ts',
                        'issue': 'buildCombinedMapping does NOT use exercise.audioId',
                        'fix': 'Map exercise.id → exercise.audioId, not exercise.id → exercise.id'
                    })
                    print("  ❌ OfflineLessonEngine: does NOT use exercise.audioId")
    
    def check_mappings(self):
        """Ստուգել mapping-ները"""
        print("\n🗺️ CHECKING MAPPINGS")
        print("-"*80)
        
        mapping_files = [
            'src/lib/content/mappings/audio-num-hy-mapping.json',
            'src/lib/content/mappings/audio-num-en-mapping.json',
            'src/lib/content/mappings/audio-num-ru-mapping.json'
        ]
        
        for mapping_file in mapping_files:
            filepath = self.root / mapping_file
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    if isinstance(data, dict):
                        # Ստուգել արդյոք կա 'mapping' բանալի
                        if 'mapping' in data:
                            mapping_count = len(data['mapping'])
                            print(f"  ✅ {mapping_file}: {mapping_count} entries in mapping")
                        elif 'files' in data:
                            print(f"  ✅ {mapping_file}: {len(data['files'])} files")
                        else:
                            self.results['warnings'].append({
                                'file': mapping_file,
                                'issue': 'No mapping or files key found'
                            })
                            print(f"  ⚠️  {mapping_file}: no mapping or files")
                except Exception as e:
                    self.results['bugs'].append({
                        'file': mapping_file,
                        'issue': f'Cannot parse JSON: {e}'
                    })
                    print(f"  ❌ {mapping_file}: cannot parse")
            else:
                self.results['critical_bugs'].append({
                    'file': mapping_file,
                    'issue': 'File does not exist',
                    'fix': 'Create or restore the mapping file'
                })
                print(f"  ❌ {mapping_file}: MISSING")
    
    def check_manifests(self):
        """Ստուգել manifests-ները"""
        print("\n📋 CHECKING MANIFESTS")
        print("-"*80)
        
        manifest_files = [
            'public/audio/offline/manifest_hy_ani.json',
            'public/audio/offline/manifest_en_female.json',
            'public/audio/offline/manifest_ru_female.json'
        ]
        
        for manifest_file in manifest_files:
            filepath = self.root / manifest_file
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Ստուգել կառուցվածքը
                    if isinstance(data, dict):
                        has_files = 'files' in data
                        has_mapping = 'mapping' in data
                        has_total = 'total_files' in data
                        
                        if has_files and has_total:
                            print(f"  ✅ {manifest_file}: files={len(data['files'])}, total={data['total_files']}")
                        else:
                            self.results['warnings'].append({
                                'file': manifest_file,
                                'issue': 'Missing files or total_files key'
                            })
                            print(f"  ⚠️  {manifest_file}: missing files or total_files")
                except Exception as e:
                    self.results['bugs'].append({
                        'file': manifest_file,
                        'issue': f'Cannot parse JSON: {e}'
                    })
                    print(f"  ❌ {manifest_file}: cannot parse")
            else:
                self.results['critical_bugs'].append({
                    'file': manifest_file,
                    'issue': 'File does not exist',
                    'fix': 'Generate or restore the manifest'
                })
                print(f"  ❌ {manifest_file}: MISSING")
    
    def check_audio_files(self):
        """Ստուգել աուդիո ֆայլերը"""
        print("\n🎵 CHECKING AUDIO FILES")
        print("-"*80)
        
        audio_dirs = [
            'public/audio/offline/hy_Ani',
            'public/audio/offline/en_female',
            'public/audio/offline/ru_female'
        ]
        
        for audio_dir in audio_dirs:
            dirpath = self.root / audio_dir
            if dirpath.exists():
                mp3_files = list(dirpath.glob('*.mp3'))
                valid = [f for f in mp3_files if f.stat().st_size > 2048]
                corrupted = [f for f in mp3_files if f.stat().st_size <= 2048]
                
                print(f"  📁 {audio_dir}: {len(valid)} valid, {len(corrupted)} corrupted")
                
                if len(corrupted) > 0:
                    self.results['bugs'].append({
                        'file': audio_dir,
                        'issue': f'{len(corrupted)} corrupted MP3 files (<2KB)',
                        'fix': 'Regenerate or restore corrupted files'
                    })
            else:
                self.results['critical_bugs'].append({
                    'file': audio_dir,
                    'issue': 'Directory does not exist',
                    'fix': 'Create directory and add audio files'
                })
                print(f"  ❌ {audio_dir}: MISSING")
    
    def check_exercise_mapping(self):
        """Ստուգել exercise → audio mapping-ը"""
        print("\n📝 CHECKING EXERCISE → AUDIO MAPPING")
        print("-"*80)
        
        # Ստուգել lesson-dictionary.json
        filepath = self.root / 'data' / 'dictionaries' / 'lesson-dictionary.json'
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                lessons = data.get('lessons', [])
                total_exercises = 0
                exercises_with_audio = 0
                
                for lesson in lessons:
                    exercises = lesson.get('exercises', [])
                    for exercise in exercises:
                        total_exercises += 1
                        if exercise.get('audioId'):
                            exercises_with_audio += 1
                
                print(f"  ✅ Lessons: {len(lessons)}")
                print(f"  📊 Exercises: {total_exercises}")
                print(f"  📊 Exercises with audioId: {exercises_with_audio}")
                
                if exercises_with_audio < total_exercises:
                    self.results['bugs'].append({
                        'file': 'lesson-dictionary.json',
                        'issue': f'{total_exercises - exercises_with_audio} exercises missing audioId',
                        'fix': 'Add audioId to all exercises'
                    })
                    print(f"  ⚠️  {total_exercises - exercises_with_audio} exercises missing audioId")
                
                # Ցույց տալ առաջին 5 առանց audioId
                missing_audio = []
                for lesson in lessons:
                    for exercise in lesson.get('exercises', []):
                        if not exercise.get('audioId'):
                            missing_audio.append(exercise.get('id', 'unknown'))
                            if len(missing_audio) >= 5:
                                break
                    if len(missing_audio) >= 5:
                        break
                
                if missing_audio:
                    print(f"  📝 Missing audioId examples: {', '.join(missing_audio)}")
                
            except Exception as e:
                self.results['bugs'].append({
                    'file': 'lesson-dictionary.json',
                    'issue': f'Cannot parse: {e}'
                })
                print(f"  ❌ Cannot parse lesson-dictionary.json")
        else:
            self.results['critical_bugs'].append({
                'file': 'lesson-dictionary.json',
                'issue': 'File does not exist',
                'fix': 'Create lesson-dictionary.json with exercises'
            })
            print(f"  ❌ lesson-dictionary.json: MISSING")
    
    def check_language_direction(self):
        """Ստուգել լեզվի ուղղությունը"""
        print("\n🌐 CHECKING LANGUAGE DIRECTION")
        print("-"*80)
        
        # Ստուգել page.tsx
        filepath = self.src_dir / 'app' / 'learn' / 'page.tsx'
        if filepath.exists():
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            # Ստուգել getInitialLanguage
            if 'getInitialLanguage' in content:
                print("  ✅ getInitialLanguage exists")
            else:
                self.results['bugs'].append({
                    'file': 'learn/page.tsx',
                    'issue': 'getInitialLanguage missing',
                    'fix': 'Add getInitialLanguage function'
                })
                print("  ❌ getInitialLanguage missing")
            
            # Ստուգել pair format
            if 'native-learning' in content or 'pair' in content:
                print("  ✅ pair handling exists")
            else:
                self.results['warnings'].append({
                    'file': 'learn/page.tsx',
                    'issue': 'pair handling might be incorrect',
                    'fix': 'Ensure pair format is native-learning'
                })
                print("  ⚠️  pair handling might be incorrect")
        
        # Ստուգել getLessonById
        filepath = self.src_dir / 'lib' / 'i18n' / 'multilingual.ts'
        if filepath.exists():
            content = filepath.read_text(encoding='utf-8', errors='ignore')
            
            if 'getLessonById' in content:
                # Ստուգել արդյոք prompt-ը native է
                if 'prompt' in content and 'native' in content:
                    print("  ✅ getLessonById uses prompt with native language")
                else:
                    self.results['warnings'].append({
                        'file': 'multilingual.ts',
                        'issue': 'getLessonById might not use native language for prompt',
                        'fix': 'Ensure prompt uses native language, targetAnswer uses learning language'
                    })
                    print("  ⚠️  getLessonById might have incorrect language direction")
    
    def check_offline_systems(self):
        """Ստուգել օֆլայն համակարգերի քանակը"""
        print("\n🔧 CHECKING OFFLINE SYSTEMS")
        print("-"*80)
        
        offline_files = []
        for pattern in ['*OfflineAudio*.ts', '*OfflineLesson*.ts']:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    offline_files.append(file.name)
        
        print(f"  📁 Found {len(offline_files)} offline system files:")
        for file in sorted(set(offline_files)):
            print(f"    - {file}")
        
        if len(set(offline_files)) > 3:
            self.results['warnings'].append({
                'issue': f'Multiple offline systems found: {", ".join(sorted(set(offline_files)))}',
                'fix': 'Consolidate to single canonical offline audio system'
            })
            print(f"  ⚠️  Multiple offline systems found")
    
    def check_duplicate_buttons(self):
        """Ստուգել կրկնվող կոճակները"""
        print("\n🔘 CHECKING DUPLICATE BUTTONS")
        print("-"*80)
        
        # Ստուգել Unlock All-ը
        learn_file = self.src_dir / 'app' / 'learn' / 'page.tsx'
        world_file = self.src_dir / 'app' / 'world' / 'page.tsx'
        
        unlock_all_count = 0
        
        if learn_file.exists():
            content = learn_file.read_text(encoding='utf-8', errors='ignore')
            if 'Unlock All' in content or 'unlockAllLessons' in content:
                unlock_all_count += 1
                print(f"  📄 learn/page.tsx: contains Unlock All button")
        
        if world_file.exists():
            content = world_file.read_text(encoding='utf-8', errors='ignore')
            if 'Unlock All' in content or 'unlockAllWorlds' in content:
                unlock_all_count += 1
                print(f"  📄 world/page.tsx: contains Unlock All button")
        
        if unlock_all_count > 1:
            self.results['warnings'].append({
                'issue': f'Unlock All button appears in {unlock_all_count} places',
                'fix': 'Keep only in world/page.tsx, remove from learn/page.tsx'
            })
            print(f"  ⚠️  Unlock All button appears in {unlock_all_count} places")
        
        # Ստուգել VoiceSelector-ը
        voice_selectors = []
        for file in self.src_dir.rglob('*.tsx'):
            if 'node_modules' not in str(file):
                content = file.read_text(encoding='utf-8', errors='ignore')
                if 'VoiceSelector' in content and 'function VoiceSelector' in content:
                    voice_selectors.append(file.name)
        
        if len(voice_selectors) > 1:
            self.results['warnings'].append({
                'issue': f'VoiceSelector appears in {len(voice_selectors)} files',
                'fix': 'Consolidate to single VoiceSelector component'
            })
            print(f"  ⚠️  VoiceSelector appears in {len(voice_selectors)} files")
    
    def check_wav_am_integrity(self):
        """Ստուգել wav.am-ի ամբողջականությունը"""
        print("\n🎵 CHECKING WAV.AM INTEGRITY")
        print("-"*80)
        
        wav_files = []
        for pattern in ['*Wav*.ts', '*wav*.ts', '*wav*.tsx']:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    wav_files.append(file.name)
        
        if wav_files:
            print(f"  📁 Found {len(wav_files)} wav.am related files:")
            for file in sorted(wav_files):
                print(f"    - {file}")
            
            # Ստուգել արդյոք wav.am կոդը փոփոխվել է
            wav_modified = False
            for file in wav_files:
                filepath = self.src_dir.rglob(file)
                for f in filepath:
                    content = f.read_text(encoding='utf-8', errors='ignore')
                    if 'wav.am' in content and ('offline' in content or 'audio/offline' in content):
                        wav_modified = True
                        break
            
            if wav_modified:
                self.results['bugs'].append({
                    'issue': 'wav.am files contain offline audio references',
                    'fix': 'Separate wav.am (online) from offline audio system'
                })
                print("  ❌ wav.am files may contain offline references")
            else:
                print("  ✅ wav.am files appear untouched")
        else:
            print("  ⚠️  No wav.am files found")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 SUMMARY")
        print("="*80)
        
        critical = len(self.results['critical_bugs'])
        bugs = len(self.results['bugs'])
        warnings = len(self.results['warnings'])
        
        print(f"\n  ❌ Critical Bugs: {critical}")
        print(f"  🐛 Bugs: {bugs}")
        print(f"  ⚠️  Warnings: {warnings}")
        
        if critical == 0 and bugs == 0:
            print("\n  ✅ SYSTEM LOOKS GOOD")
        elif critical == 0:
            print("\n  ⚠️  SYSTEM HAS WARNINGS BUT NO CRITICAL BUGS")
        else:
            print("\n  ❌ SYSTEM HAS CRITICAL BUGS THAT NEED FIXING")
        
        if critical > 0:
            print("\n  🔴 CRITICAL BUGS (must fix):")
            for bug in self.results['critical_bugs']:
                print(f"    - {bug.get('file', 'unknown')}: {bug.get('issue', '')}")
                if 'fix' in bug:
                    print(f"      Fix: {bug['fix']}")
        
        if bugs > 0:
            print("\n  🐛 BUGS:")
            for bug in self.results['bugs']:
                print(f"    - {bug.get('file', 'unknown')}: {bug.get('issue', '')}")
        
        print("="*80)
    
    def save_report(self):
        """Պահպանել զեկույցը"""
        report_dir = self.root / 'audio_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'audio_bugs_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Report saved: {report_file}")

def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\NURLingo-offline-audio-repair"
    finder = AudioBugFinder(root_path)
    finder.find_all_bugs()

if __name__ == "__main__":
    main()