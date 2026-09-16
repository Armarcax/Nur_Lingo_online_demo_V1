# offline_audio_analyzer.py

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple
from collections import defaultdict

class OfflineAudioAnalyzer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.src_dir = self.root / 'src'
        self.public_dir = self.root / 'public'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'offline_audio_system': {
                'core_files': {},
                'manifests': {},
                'audio_files': {},
                'mappings': {},
                'hooks': {},
                'components': {},
                'dictionaries': {}
            },
            'call_graph': [],
            'dependencies': {},
            'issues': [],
            'warnings': [],
            'summary': {}
        }
        self.issue_count = 0
        self.warning_count = 0

    def analyze_all(self):
        """Ամբողջական վերլուծություն"""
        print("\n" + "=" * 80)
        print("📁 OFFLINE AUDIO SYSTEM ANALYZER")
        print("=" * 80)

        self.find_core_offline_files()
        self.find_manifests()
        self.find_audio_files()
        self.find_mappings()
        self.find_offline_hooks()
        self.find_offline_components()
        self.check_dictionaries()
        self.check_offline_paths()
        self.build_offline_call_graph()
        self.check_integrity()
        self.print_summary()
        self.save_report()

        return self.results

    def find_core_offline_files(self):
        """Գտնել core offline ֆայլերը"""
        print("\n📁 CORE OFFLINE FILES")
        print("-" * 80)

        core_patterns = [
            '*Offline*.ts',
            '*offline*.ts',
            '*OfflineAudio*.ts',
            '*OfflineLesson*.ts',
            '*CanonicalOfflineAudio*.ts'
        ]

        core_files = []
        for pattern in core_patterns:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    core_files.append(file)

        core_files = list(set(core_files))

        print(f"  📁 Found {len(core_files)} core offline files:")
        for file in sorted(core_files):
            rel_path = file.relative_to(self.root)
            size = file.stat().st_size
            print(f"    - {rel_path} ({size} bytes)")

            try:
                content = file.read_text(encoding='utf-8', errors='ignore')

                # Find exports
                exports = re.findall(r'export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)',
                                     content)
                if exports:
                    print(f"      📤 Exports: {', '.join(exports[:5])}")

                # Find imports
                imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
                if imports:
                    print(f"      📥 Imports: {', '.join(imports[:3])}")

                # Check for combinedMapping
                if 'combinedMapping' in content:
                    print(f"      ✅ Has combinedMapping")

                # Check for resolveOfflineAudio
                if 'resolveOfflineAudio' in content:
                    print(f"      ✅ Has resolveOfflineAudio")

                # Check for getAudioPath
                if 'getAudioPath' in content:
                    print(f"      ✅ Has getAudioPath")

                self.results['offline_audio_system']['core_files'][str(rel_path)] = {
                    'size': size,
                    'exports': exports[:5],
                    'imports': imports[:3],
                    'has_combined_mapping': 'combinedMapping' in content,
                    'has_resolve': 'resolveOfflineAudio' in content,
                    'has_get_path': 'getAudioPath' in content
                }
            except Exception as e:
                print(f"      ❌ Error reading: {e}")

    def find_manifests(self):
        """Գտնել manifest ֆայլերը"""
        print("\n📋 MANIFESTS")
        print("-" * 80)

        manifest_patterns = [
            'public/audio/offline/manifest_*.json',
            'public/audio/offline_dictionary/manifest*.json',
            'public/audio/offline_user_dictionary/manifest*.json'
        ]

        manifests = []
        for pattern in manifest_patterns:
            for file in self.root.glob(pattern):
                manifests.append(file)

        print(f"  📁 Found {len(manifests)} manifest files:")
        for file in sorted(manifests):
            rel_path = file.relative_to(self.root)
            size = file.stat().st_size
            print(f"    - {rel_path} ({size} bytes)")

            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                if isinstance(data, dict):
                    # Check structure
                    has_files = 'files' in data
                    has_mapping = 'mapping' in data
                    has_total = 'total_files' in data or 'totalFiles' in data

                    if has_files:
                        file_count = len(data['files'])
                        print(f"      📊 Files: {file_count}")
                    if has_mapping:
                        mapping_count = len(data['mapping'])
                        print(f"      🗺️ Mapping: {mapping_count}")

                    if has_files and has_mapping and has_total:
                        print(f"      ✅ Complete manifest")
                    else:
                        print(f"      ⚠️  Incomplete manifest")
                        self.warning_count += 1

                    self.results['offline_audio_system']['manifests'][str(rel_path)] = {
                        'size': size,
                        'has_files': has_files,
                        'has_mapping': has_mapping,
                        'has_total': has_total,
                        'file_count': len(data['files']) if has_files else 0,
                        'mapping_count': len(data['mapping']) if has_mapping else 0
                    }
            except Exception as e:
                print(f"      ❌ Error reading: {e}")
                self.issue_count += 1

    def find_audio_files(self):
        """Ստուգել աուդիո ֆայլերը"""
        print("\n🎵 AUDIO FILES")
        print("-" * 80)

        audio_dirs = [
            'public/audio/offline/hy_Ani',
            'public/audio/offline/en_female',
            'public/audio/offline/ru_female',
            'public/audio/offline_dictionary/hy',
            'public/audio/offline_dictionary/en',
            'public/audio/offline_dictionary/ru',
            'public/audio/offline_user_dictionary/hy_user',
            'public/audio/offline_user_dictionary/en_user',
            'public/audio/offline_user_dictionary/ru_user'
        ]

        total_valid = 0
        total_corrupted = 0

        for audio_dir in audio_dirs:
            dirpath = self.root / audio_dir
            if dirpath.exists():
                mp3_files = list(dirpath.glob('*.mp3'))
                valid = [f for f in mp3_files if f.stat().st_size > 2048]
                corrupted = [f for f in mp3_files if f.stat().st_size <= 2048]

                total_valid += len(valid)
                total_corrupted += len(corrupted)

                status = "✅" if len(corrupted) == 0 else "⚠️"
                print(f"  {status} {audio_dir}: {len(valid)} valid, {len(corrupted)} corrupted")

                if len(corrupted) > 0:
                    self.warning_count += 1
                    self.results['warnings'].append({
                        'file': audio_dir,
                        'issue': f'{len(corrupted)} corrupted MP3 files (<2KB)'
                    })

                self.results['offline_audio_system']['audio_files'][audio_dir] = {
                    'valid': len(valid),
                    'corrupted': len(corrupted),
                    'total': len(mp3_files)
                }
            else:
                print(f"  ❌ {audio_dir}: MISSING")
                self.issue_count += 1
                self.results['issues'].append({
                    'file': audio_dir,
                    'issue': 'Directory does not exist'
                })

        print(f"\n  📊 Total audio files: {total_valid + total_corrupted}")
        print(f"  ✅ Valid: {total_valid}")
        print(f"  ❌ Corrupted: {total_corrupted}")

    def find_mappings(self):
        """Գտնել mapping ֆայլերը"""
        print("\n🗺️ MAPPINGS")
        print("-" * 80)

        mapping_files = [
            'src/lib/content/mappings/audio-num-hy-mapping.json',
            'src/lib/content/mappings/audio-num-en-mapping.json',
            'src/lib/content/mappings/audio-num-ru-mapping.json',
            'src/lib/content/audio-num-mapping.json'
        ]

        for mapping_file in mapping_files:
            filepath = self.root / mapping_file
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    if isinstance(data, dict):
                        # Check structure
                        if 'mapping' in data:
                            mapping_count = len(data['mapping'])
                            print(f"  ✅ {mapping_file}: {mapping_count} entries in mapping")
                        elif 'files' in data:
                            print(f"  ✅ {mapping_file}: {len(data['files'])} files")
                        else:
                            print(f"  ⚠️  {mapping_file}: unknown structure")
                            self.warning_count += 1

                        self.results['offline_audio_system']['mappings'][mapping_file] = {
                            'type': 'dict',
                            'keys': list(data.keys())[:5]
                        }
                except Exception as e:
                    print(f"  ❌ {mapping_file}: cannot parse - {e}")
                    self.issue_count += 1
            else:
                print(f"  ❌ {mapping_file}: MISSING")
                self.issue_count += 1

    def find_offline_hooks(self):
        """Գտնել offline hooks-ները"""
        print("\n🪝 OFFLINE HOOKS")
        print("-" * 80)

        hooks_dir = self.src_dir / 'lib' / 'hooks'
        if hooks_dir.exists():
            hook_files = list(hooks_dir.glob('*Offline*.ts')) + list(hooks_dir.glob('*offline*.ts'))

            print(f"  📁 Found {len(hook_files)} offline hooks:")
            for file in sorted(hook_files):
                rel_path = file.relative_to(self.root)
                print(f"    - {rel_path}")

                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')

                    # Find hook names
                    hook_names = re.findall(r'export\s+function\s+(\w+Offline\w+)|export\s+const\s+(\w+Offline\w+)',
                                           content)
                    if hook_names:
                        names = [n[0] or n[1] for n in hook_names]
                        print(f"      🪝 Hooks: {', '.join(names)}")

                    # Check for offline functionality
                    has_offline_mode = 'isOfflineMode' in content
                    has_play_audio = 'playAudio' in content
                    has_audio_count = 'audioCount' in content

                    if has_offline_mode and has_play_audio:
                        print(f"      ✅ Complete offline hook")

                    self.results['offline_audio_system']['hooks'][str(rel_path)] = {
                        'hooks': names if hook_names else [],
                        'has_offline_mode': has_offline_mode,
                        'has_play_audio': has_play_audio,
                        'has_audio_count': has_audio_count
                    }
                except Exception as e:
                    print(f"      ❌ Error reading: {e}")

    def find_offline_components(self):
        """Գտնել offline components-ները"""
        print("\n📦 OFFLINE COMPONENTS")
        print("-" * 80)

        components_dir = self.src_dir / 'components'
        if components_dir.exists():
            offline_components = []
            for file in components_dir.rglob('*Offline*.tsx'):
                if 'node_modules' not in str(file):
                    offline_components.append(file)

            print(f"  📁 Found {len(offline_components)} offline components:")
            for file in sorted(offline_components):
                rel_path = file.relative_to(self.root)
                print(f"    - {rel_path}")

                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')

                    # Find component names
                    comp_names = re.findall(r'export\s+(?:default\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=',
                                           content)
                    if comp_names:
                        names = [n[0] or n[1] for n in comp_names if n[0] or n[1]]
                        print(f"      📦 Components: {', '.join(names[:3])}")

                    self.results['offline_audio_system']['components'][str(rel_path)] = {
                        'components': names[:3] if comp_names else []
                    }
                except Exception as e:
                    print(f"      ❌ Error reading: {e}")

    def check_dictionaries(self):
        """Ստուգել dictionaries-ները"""
        print("\n📖 DICTIONARIES")
        print("-" * 80)

        dict_files = [
            'data/dictionaries/unified-dictionary.json',
            'data/dictionaries/user-dictionary.json',
            'data/dictionaries/lesson-dictionary.json'
        ]

        for dict_file in dict_files:
            filepath = self.root / dict_file
            if filepath.exists():
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    if isinstance(data, dict):
                        words = data.get('words', [])
                        lessons = data.get('lessons', [])

                        print(f"  ✅ {dict_file}: {len(words)} words, {len(lessons)} lessons")

                        # Check for audioId
                        words_with_audio = 0
                        for word in words:
                            if word.get('audioId'):
                                words_with_audio += 1

                        if words_with_audio > 0:
                            print(f"      📊 Words with audioId: {words_with_audio}/{len(words)}")
                        else:
                            print(f"      ⚠️  No audioId found in words")
                            self.warning_count += 1

                        self.results['offline_audio_system']['dictionaries'][dict_file] = {
                            'words': len(words),
                            'lessons': len(lessons),
                            'words_with_audio': words_with_audio
                        }
                except Exception as e:
                    print(f"  ❌ {dict_file}: cannot parse - {e}")
                    self.issue_count += 1
            else:
                print(f"  ❌ {dict_file}: MISSING")
                self.issue_count += 1

    def check_offline_paths(self):
        """Ստուգել offline paths-ները"""
        print("\n🔗 OFFLINE PATHS")
        print("-" * 80)

        # Check for hardcoded paths
        hardcoded_paths = []
        for file in self.src_dir.rglob('*.ts'):
            if 'node_modules' not in str(file):
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    paths = re.findall(r'["\']/audio/offline/([^"\']+)["\']', content)
                    if paths:
                        hardcoded_paths.extend(paths)
                except:
                    pass

        if hardcoded_paths:
            print(f"  📊 Found {len(set(hardcoded_paths))} unique hardcoded paths:")
            for path in sorted(set(hardcoded_paths))[:10]:
                print(f"    - {path}")
        else:
            print("  ✅ No hardcoded paths found")

    def build_offline_call_graph(self):
        """Կառուցել offline call graph-ը"""
        print("\n🔗 OFFLINE CALL GRAPH")
        print("-" * 80)

        offline_files = []
        for file in self.src_dir.rglob('*Offline*.ts'):
            if 'node_modules' not in str(file):
                offline_files.append(file)

        print(f"  📁 Analyzing {len(offline_files)} offline files...")

        for file in offline_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                rel_path = str(file.relative_to(self.root))

                # Find imports
                imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)

                for imp in imports:
                    if 'Offline' in imp or 'offline' in imp:
                        self.results['call_graph'].append({
                            'from': rel_path,
                            'to': imp,
                            'type': 'import'
                        })

                # Find function calls
                calls = re.findall(r'(\w+Offline\w+)\.(\w+)|(\w+Offline\w+)\s*\(', content)
                for call in calls:
                    if any(call):
                        self.results['call_graph'].append({
                            'from': rel_path,
                            'to': call[0] or call[2] or 'unknown',
                            'type': 'call'
                        })

            except Exception as e:
                print(f"      ❌ Error analyzing {file.name}: {e}")

        print(f"  📊 Found {len(self.results['call_graph'])} connections")

    def check_integrity(self):
        """Ստուգել ամբողջականությունը"""
        print("\n✅ INTEGRITY CHECK")
        print("-" * 80)

        checks = {
            'core_files_exist': False,
            'manifests_exist': False,
            'audio_files_exist': False,
            'mappings_exist': False,
            'dictionaries_exist': False,
            'hooks_exist': False,
            'components_exist': False,
            'no_hardcoded_paths': True
        }

        # Check core files
        if self.results['offline_audio_system']['core_files']:
            checks['core_files_exist'] = True
            print("  ✅ Core files exist")
        else:
            print("  ❌ Core files missing")
            self.issue_count += 1

        # Check manifests
        if self.results['offline_audio_system']['manifests']:
            checks['manifests_exist'] = True
            print("  ✅ Manifests exist")
        else:
            print("  ❌ Manifests missing")
            self.issue_count += 1

        # Check audio files
        audio_files = self.results['offline_audio_system']['audio_files']
        if audio_files:
            total_valid = sum(data['valid'] for data in audio_files.values())
            total_corrupted = sum(data['corrupted'] for data in audio_files.values())
            checks['audio_files_exist'] = total_valid > 0
            print(f"  ✅ Audio files exist: {total_valid} valid, {total_corrupted} corrupted")
        else:
            print("  ❌ Audio files missing")
            self.issue_count += 1

        # Check mappings
        if self.results['offline_audio_system']['mappings']:
            checks['mappings_exist'] = True
            print("  ✅ Mappings exist")
        else:
            print("  ❌ Mappings missing")
            self.issue_count += 1

        # Check dictionaries
        if self.results['offline_audio_system']['dictionaries']:
            checks['dictionaries_exist'] = True
            print("  ✅ Dictionaries exist")
        else:
            print("  ❌ Dictionaries missing")
            self.issue_count += 1

        # Check hooks
        if self.results['offline_audio_system']['hooks']:
            checks['hooks_exist'] = True
            print("  ✅ Hooks exist")
        else:
            print("  ⚠️  Hooks missing")
            self.warning_count += 1

        # Check components
        if self.results['offline_audio_system']['components']:
            checks['components_exist'] = True
            print("  ✅ Components exist")
        else:
            print("  ⚠️  Components missing")
            self.warning_count += 1

        # Check for hardcoded paths
        hardcoded = False
        for file in self.src_dir.rglob('*.ts'):
            if 'node_modules' not in str(file):
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    if re.search(r'["\']/audio/offline/[^"\']+\.mp3["\']', content):
                        hardcoded = True
                        break
                except:
                    pass

        if not hardcoded:
            checks['no_hardcoded_paths'] = True
            print("  ✅ No hardcoded paths")
        else:
            checks['no_hardcoded_paths'] = False
            print("  ⚠️  Hardcoded paths found")
            self.warning_count += 1

        # Summary
        total_checks = len(checks)
        passed_checks = sum(1 for v in checks.values() if v)

        self.results['summary'] = {
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'percentage': (passed_checks / total_checks) * 100 if total_checks > 0 else 0,
            'checks': checks
        }

        print(f"\n  📊 Offline System Health: {self.results['summary']['percentage']:.1f}%")

    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "=" * 80)
        print("📊 OFFLINE AUDIO SYSTEM SUMMARY")
        print("=" * 80)

        summary = self.results['summary']

        print(f"\n  📁 System Health: {summary['percentage']:.1f}%")
        print(f"  ✅ Passed Checks: {summary['passed_checks']}/{summary['total_checks']}")
        print(f"  ❌ Issues: {self.issue_count}")
        print(f"  ⚠️  Warnings: {self.warning_count}")

        if self.results['issues']:
            print(f"\n  ❌ Issues Found:")
            for issue in self.results['issues'][:5]:
                print(f"    - {issue.get('file', 'unknown')}: {issue.get('issue', '')}")

        if self.results['warnings']:
            print(f"\n  ⚠️  Warnings:")
            for warning in self.results['warnings'][:5]:
                print(f"    - {warning.get('file', 'unknown')}: {warning.get('issue', '')}")

        # Statistics
        core = self.results['offline_audio_system']['core_files']
        manifests = self.results['offline_audio_system']['manifests']
        audio = self.results['offline_audio_system']['audio_files']
        mappings = self.results['offline_audio_system']['mappings']

        total_audio_files = sum(d['valid'] + d['corrupted'] for d in audio.values()) if audio else 0
        total_manifests = len(manifests) if manifests else 0

        print(f"\n  📊 Offline Audio Statistics:")
        print(f"    - Core Files: {len(core)}")
        print(f"    - Manifests: {total_manifests}")
        print(f"    - Audio Files: {total_audio_files}")
        print(f"    - Mappings: {len(mappings)}")

        print("=" * 80)

    def save_report(self):
        """Պահպանել զեկույցը"""
        report_dir = self.root / 'audio_reports'
        report_dir.mkdir(exist_ok=True)

        report_file = report_dir / f'offline_audio_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Report saved: {report_file}")


def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\NURLingo-offline-audio-repair"
    analyzer = OfflineAudioAnalyzer(root_path)
    analyzer.analyze_all()


if __name__ == "__main__":
    main()