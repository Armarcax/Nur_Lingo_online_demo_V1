# online_audio_analyzer.py

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class OnlineAudioAnalyzer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.src_dir = self.root / 'src'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'online_audio_system': {
                'wav_am': {},
                'tts': {},
                'audio_providers': {},
                'api_routes': {},
                'hooks': {},
                'components': {}
            },
            'call_graph': [],
            'dependencies': {},
            'issues': [],
            'summary': {}
        }
    
    def analyze_all(self):
        """Ամբողջական վերլուծություն"""
        print("\n" + "="*80)
        print("🎵 ONLINE AUDIO SYSTEM ANALYZER")
        print("="*80)
        
        self.find_wav_am_files()
        self.find_tts_files()
        self.find_audio_providers()
        self.find_api_routes()
        self.find_hooks()
        self.find_components()
        self.build_call_graph()
        self.analyze_dependencies()
        self.check_functionality()
        self.print_summary()
        self.save_report()
        
        return self.results
    
    def find_wav_am_files(self):
        """Գտնել wav.am-ի հետ կապված բոլոր ֆայլերը"""
        print("\n🔊 WAV.AM FILES")
        print("-"*80)
        
        wav_patterns = [
            '*Wav*.ts', '*Wav*.tsx',
            '*wav*.ts', '*wav*.tsx',
            '*generate-wav*',
            '*WavClient*',
            '*WavProvider*',
            '*WavASR*'
        ]
        
        wav_files = []
        for pattern in wav_patterns:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    wav_files.append(file)
        
        # Remove duplicates
        wav_files = list(set(wav_files))
        
        print(f"  📁 Found {len(wav_files)} wav.am related files:")
        for file in sorted(wav_files):
            rel_path = file.relative_to(self.root)
            size = file.stat().st_size
            print(f"    - {rel_path} ({size} bytes)")
            
            # Read content and extract key info
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find exports
                exports = re.findall(r'export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)', content)
                if exports:
                    print(f"      📤 Exports: {', '.join(exports[:5])}")
                
                # Find imports
                imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
                if imports:
                    print(f"      📥 Imports: {', '.join(imports[:3])}")
                
                # Find wav.am specific calls
                wav_calls = re.findall(r'wav\.am|wavam|WavClient|WavProvider|playGeneratedAudio', content)
                if wav_calls:
                    print(f"      🎵 wav.am calls: {len(wav_calls)}")
                
                self.results['online_audio_system']['wav_am'][str(rel_path)] = {
                    'size': size,
                    'exports': exports[:5],
                    'imports': imports[:3],
                    'wav_calls': len(wav_calls)
                }
            except Exception as e:
                print(f"      ❌ Error reading: {e}")
    
    def find_tts_files(self):
        """Գտնել TTS-ի հետ կապված ֆայլերը"""
        print("\n🗣️ TTS FILES")
        print("-"*80)
        
        tts_patterns = [
            '*TTS*.ts', '*TTS*.tsx',
            '*tts*.ts', '*tts*.tsx',
            '*Speech*.ts', '*Speech*.tsx',
            '*generate-tts*',
            '*browser-tts*'
        ]
        
        tts_files = []
        for pattern in tts_patterns:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    tts_files.append(file)
        
        tts_files = list(set(tts_files))
        
        print(f"  📁 Found {len(tts_files)} TTS related files:")
        for file in sorted(tts_files):
            rel_path = file.relative_to(self.root)
            size = file.stat().st_size
            print(f"    - {rel_path} ({size} bytes)")
            
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find speech synthesis calls
                synth_calls = re.findall(r'speechSynthesis|SpeechSynthesisUtterance|window\.speechSynthesis', content)
                if synth_calls:
                    print(f"      🎤 Speech Synthesis: {len(synth_calls)} calls")
                
                # Find TTS specific
                tts_calls = re.findall(r'tts|TTS|TextToSpeech|text-to-speech', content, re.IGNORECASE)
                if tts_calls:
                    print(f"      🔊 TTS references: {len(tts_calls)}")
                
                self.results['online_audio_system']['tts'][str(rel_path)] = {
                    'size': size,
                    'synth_calls': len(synth_calls),
                    'tts_refs': len(tts_calls)
                }
            except Exception as e:
                print(f"      ❌ Error reading: {e}")
    
    def find_audio_providers(self):
        """Գտնել աուդիո provider-ները"""
        print("\n🎧 AUDIO PROVIDERS")
        print("-"*80)
        
        provider_files = []
        for file in self.src_dir.rglob('*AudioProvider*.ts'):
            if 'node_modules' not in str(file):
                provider_files.append(file)
        
        print(f"  📁 Found {len(provider_files)} audio provider files:")
        for file in sorted(provider_files):
            rel_path = file.relative_to(self.root)
            print(f"    - {rel_path}")
            
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find provider types
                provider_types = re.findall(r'class\s+(\w+Provider)|interface\s+(\w+Provider)', content)
                if provider_types:
                    provider_names = [p[0] or p[1] for p in provider_types]
                    print(f"      📦 Providers: {', '.join(provider_names)}")
                
                # Find methods
                methods = re.findall(r'(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]\s*(?:Promise|void|boolean|string)', content)
                if methods:
                    print(f"      🔧 Methods: {', '.join(methods[:5])}")
                
                self.results['online_audio_system']['audio_providers'][str(rel_path)] = {
                    'providers': provider_names if provider_types else [],
                    'methods': methods[:5]
                }
            except Exception as e:
                print(f"      ❌ Error reading: {e}")
    
    def find_api_routes(self):
        """Գտնել API routes-ները"""
        print("\n🌐 API ROUTES")
        print("-"*80)
        
        api_dir = self.src_dir / 'app' / 'api'
        if api_dir.exists():
            route_files = list(api_dir.rglob('route.ts'))
            
            print(f"  📁 Found {len(route_files)} API routes:")
            for file in sorted(route_files):
                rel_path = file.relative_to(self.root)
                print(f"    - {rel_path}")
                
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    
                    # Find HTTP methods
                    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
                    found_methods = []
                    for method in methods:
                        if f'export async function {method}' in content or f'export const {method}' in content:
                            found_methods.append(method)
                    
                    if found_methods:
                        print(f"      📤 Methods: {', '.join(found_methods)}")
                    
                    # Find wav.am or TTS specific
                    if 'wav' in content.lower() or 'tts' in content.lower():
                        print(f"      🎵 Audio related: YES")
                    
                    # Find imports
                    imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
                    if imports:
                        print(f"      📥 Imports: {len(imports)}")
                    
                    self.results['online_audio_system']['api_routes'][str(rel_path)] = {
                        'methods': found_methods,
                        'is_audio_related': 'wav' in content.lower() or 'tts' in content.lower()
                    }
                except Exception as e:
                    print(f"      ❌ Error reading: {e}")
    
    def find_hooks(self):
        """Գտնել hooks-ները"""
        print("\n🪝 HOOKS")
        print("-"*80)
        
        hooks_dir = self.src_dir / 'lib' / 'hooks'
        if hooks_dir.exists():
            hook_files = list(hooks_dir.glob('*Audio*.ts')) + list(hooks_dir.glob('*audio*.ts'))
            
            print(f"  📁 Found {len(hook_files)} audio hooks:")
            for file in sorted(hook_files):
                rel_path = file.relative_to(self.root)
                print(f"    - {rel_path}")
                
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    
                    # Find hook names
                    hook_names = re.findall(r'export\s+function\s+(\w+Audio\w+)|export\s+const\s+(\w+Audio\w+)', content)
                    if hook_names:
                        names = [n[0] or n[1] for n in hook_names]
                        print(f"      🪝 Hooks: {', '.join(names)}")
                    
                    # Find what they use
                    uses = re.findall(r'use(Audio|TTS|Wav|Speech|Voice)\w*', content)
                    if uses:
                        print(f"      🔗 Uses: {', '.join(set(uses))}")
                    
                    self.results['online_audio_system']['hooks'][str(rel_path)] = {
                        'hooks': names if hook_names else [],
                        'uses': list(set(uses))
                    }
                except Exception as e:
                    print(f"      ❌ Error reading: {e}")
    
    def find_components(self):
        """Գտնել կոմպոնենտները"""
        print("\n📦 COMPONENTS")
        print("-"*80)
        
        components_dir = self.src_dir / 'components'
        if components_dir.exists():
            audio_components = []
            for file in components_dir.rglob('*Audio*.tsx'):
                if 'node_modules' not in str(file):
                    audio_components.append(file)
            
            print(f"  📁 Found {len(audio_components)} audio components:")
            for file in sorted(audio_components):
                rel_path = file.relative_to(self.root)
                print(f"    - {rel_path}")
                
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    
                    # Find component names
                    comp_names = re.findall(r'export\s+(?:default\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=', content)
                    if comp_names:
                        names = [n[0] or n[1] for n in comp_names if n[0] or n[1]]
                        print(f"      📦 Components: {', '.join(names[:3])}")
                    
                    # Find audio related props
                    audio_props = re.findall(r'audioId|audioKey|playAudio|speak|tts|wav', content, re.IGNORECASE)
                    if audio_props:
                        print(f"      🎵 Audio props: {len(audio_props)}")
                    
                    self.results['online_audio_system']['components'][str(rel_path)] = {
                        'components': names[:3] if comp_names else [],
                        'audio_props': len(audio_props)
                    }
                except Exception as e:
                    print(f"      ❌ Error reading: {e}")
    
    def build_call_graph(self):
        """Կառուցել կանչերի գրաֆը"""
        print("\n🔗 CALL GRAPH")
        print("-"*80)
        
        # Find all imports between audio files
        audio_files = []
        for pattern in ['*Audio*.ts', '*audio*.ts', '*TTS*.ts', '*tts*.ts', '*Wav*.ts', '*wav*.ts']:
            for file in self.src_dir.rglob(pattern):
                if 'node_modules' not in str(file):
                    audio_files.append(file)
        
        audio_files = list(set(audio_files))
        
        print(f"  📁 Analyzing {len(audio_files)} files for dependencies...")
        
        for file in audio_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                rel_path = str(file.relative_to(self.root))
                
                # Find all imports
                imports = re.findall(r"import\s+.*?from\s+['\"](.*?)['\"]", content)
                
                for imp in imports:
                    if 'audio' in imp.lower() or 'tts' in imp.lower() or 'wav' in imp.lower():
                        self.results['call_graph'].append({
                            'from': rel_path,
                            'to': imp,
                            'type': 'import'
                        })
                
                # Find function calls
                calls = re.findall(r'(\w+Audio\w+)\.(\w+)|(\w+Audio\w+)\s*\(', content)
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
    
    def analyze_dependencies(self):
        """Վերլուծել կախվածությունները"""
        print("\n📊 DEPENDENCIES")
        print("-"*80)
        
        # Find all audio-related imports
        all_imports = {}
        for file in self.src_dir.rglob('*.ts'):
            if 'node_modules' not in str(file):
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore')
                    imports = re.findall(r"import\s+.*?from\s+['\"](.*?['\"])(?:['\"])?", content)
                    
                    for imp in imports:
                        if 'audio' in imp.lower() or 'tts' in imp.lower() or 'wav' in imp.lower():
                            if imp not in all_imports:
                                all_imports[imp] = []
                            all_imports[imp].append(str(file.relative_to(self.root)))
                except:
                    pass
        
        # Sort by usage count
        sorted_imports = sorted(all_imports.items(), key=lambda x: len(x[1]), reverse=True)
        
        print(f"  📊 Top 10 most imported audio modules:")
        for i, (module, files) in enumerate(sorted_imports[:10], 1):
            print(f"    {i}. {module} (used in {len(files)} files)")
        
        self.results['dependencies'] = {
            'top_imports': dict(sorted_imports[:10]),
            'total_audio_files': len(set([f for files in all_imports.values() for f in files]))
        }
    
    def check_functionality(self):
        """Ստուգել ֆունկցիոնալությունը"""
        print("\n✅ FUNCTIONALITY CHECK")
        print("-"*80)
        
        checks = {
            'wav_am_initialized': False,
            'tts_available': False,
            'audio_providers_ready': False,
            'api_routes_exist': False,
            'hooks_available': False,
            'components_available': False
        }
        
        # Check wav.am
        if self.results['online_audio_system']['wav_am']:
            checks['wav_am_initialized'] = True
            print("  ✅ wav.am: initialized")
        else:
            print("  ❌ wav.am: NOT initialized")
            self.results['issues'].append("wav.am not initialized")
        
        # Check TTS
        if self.results['online_audio_system']['tts']:
            checks['tts_available'] = True
            print("  ✅ TTS: available")
        else:
            print("  ❌ TTS: NOT available")
            self.results['issues'].append("TTS not available")
        
        # Check providers
        if self.results['online_audio_system']['audio_providers']:
            checks['audio_providers_ready'] = True
            print("  ✅ Audio Providers: ready")
        else:
            print("  ❌ Audio Providers: NOT ready")
            self.results['issues'].append("Audio providers not ready")
        
        # Check API routes
        if self.results['online_audio_system']['api_routes']:
            checks['api_routes_exist'] = True
            print(f"  ✅ API Routes: {len(self.results['online_audio_system']['api_routes'])} found")
        else:
            print("  ❌ API Routes: NOT found")
            self.results['issues'].append("API routes not found")
        
        # Check hooks
        if self.results['online_audio_system']['hooks']:
            checks['hooks_available'] = True
            print(f"  ✅ Hooks: {len(self.results['online_audio_system']['hooks'])} found")
        else:
            print("  ❌ Hooks: NOT found")
            self.results['issues'].append("Hooks not found")
        
        # Check components
        if self.results['online_audio_system']['components']:
            checks['components_available'] = True
            print(f"  ✅ Components: {len(self.results['online_audio_system']['components'])} found")
        else:
            print("  ❌ Components: NOT found")
            self.results['issues'].append("Components not found")
        
        # Summary
        total_checks = len(checks)
        passed_checks = sum(1 for v in checks.values() if v)
        
        self.results['summary'] = {
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'percentage': (passed_checks / total_checks) * 100 if total_checks > 0 else 0,
            'checks': checks
        }
        
        print(f"\n  📊 System Health: {self.results['summary']['percentage']:.1f}%")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 SUMMARY")
        print("="*80)
        
        summary = self.results['summary']
        
        print(f"\n  📁 Online Audio System Analysis")
        print(f"  📊 Total Checks: {summary['total_checks']}")
        print(f"  ✅ Passed: {summary['passed_checks']}")
        print(f"  ❌ Failed: {summary['total_checks'] - summary['passed_checks']}")
        print(f"  📊 Health: {summary['percentage']:.1f}%")
        
        if self.results['issues']:
            print(f"\n  ❌ Issues Found:")
            for issue in self.results['issues']:
                print(f"    - {issue}")
        else:
            print("\n  ✅ No issues found")
        
        # Print call graph stats
        call_graph = self.results['call_graph']
        if call_graph:
            imports = [c for c in call_graph if c['type'] == 'import']
            calls = [c for c in call_graph if c['type'] == 'call']
            print(f"\n  🔗 Call Graph:")
            print(f"    - Imports: {len(imports)}")
            print(f"    - Function calls: {len(calls)}")
        
        print("="*80)
    
    def save_report(self):
        """Պահպանել զեկույցը"""
        report_dir = self.root / 'audio_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'online_audio_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Report saved: {report_file}")

def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\lingo-offline-pal-master"
    analyzer = OnlineAudioAnalyzer(root_path)
    analyzer.analyze_all()

if __name__ == "__main__":
    main()