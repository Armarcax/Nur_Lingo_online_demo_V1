# build_analyzer.py
import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

class BuildAnalyzer:
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.src_dir = self.root / 'src'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'files_with_issues': [],
            'issues': [],
            'summary': {
                'total_files': 0,
                'tsx_files': 0,
                'ts_files': 0,
                'errors': 0,
                'warnings': 0
            }
        }
        
        # Խնդիրների տիպեր
        self.issue_patterns = {
            'missing_import': r"import\s+.*?from\s+['\"](.*?)['\"]",
            'missing_export': r"export\s+(?:default\s+)?(?:const|function|class|interface|type)",
            'type_error': r":\s*(?:any|unknown|never)",
            'null_check': r"\?\.",
            'async_await': r"await\s+[\w\.]+\(\)",
            'provider_type': r"AudioProviderType\.[A-Z_]+",
            'json_import': r"import\s+.*?from\s+['\"].*?\.json['\"]",
        }
        
    def analyze_all(self):
        """Ամբողջական վերլուծություն"""
        print("\n" + "="*80)
        print("🔍 BUILD ANALYZER - ԿՈԴԻ ՍՏՈՒԳՈՒՄ")
        print("="*80)
        
        # 1. Սկանավորել բոլոր TypeScript ֆայլերը
        self.scan_typescript_files()
        
        # 2. Ստուգել import-ները
        self.check_imports()
        
        # 3. Ստուգել JSON import-ները
        self.check_json_imports()
        
        # 4. Ստուգել AudioProviderType-ները
        self.check_audio_provider_types()
        
        # 5. Ստուգել async/await-ները
        self.check_async_await()
        
        # 6. Ստեղծել զեկույց
        self.generate_report()
        
        # 7. Տպել ամփոփում
        self.print_summary()
        
        return self.results
    
    def scan_typescript_files(self):
        """Սկանավորել TypeScript ֆայլերը"""
        print("\n📁 SCANNING TYPESCRIPT FILES")
        print("-"*80)
        
        ts_files = []
        tsx_files = []
        
        for ext in ['*.ts', '*.tsx']:
            for file in self.src_dir.rglob(ext):
                if 'node_modules' not in str(file):
                    if ext == '*.tsx':
                        tsx_files.append(file)
                    else:
                        ts_files.append(file)
        
        self.results['summary']['total_files'] = len(ts_files) + len(tsx_files)
        self.results['summary']['ts_files'] = len(ts_files)
        self.results['summary']['tsx_files'] = len(tsx_files)
        
        print(f"  📄 TS files: {len(ts_files)}")
        print(f"  📄 TSX files: {len(tsx_files)}")
        print(f"  📄 Total: {len(ts_files) + len(tsx_files)}")
        
        # Save file list for later
        self.all_files = ts_files + tsx_files
    
    def check_imports(self):
        """Ստուգել import-ները"""
        print("\n🔍 CHECKING IMPORTS")
        print("-"*80)
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find imports
                imports = re.findall(self.issue_patterns['missing_import'], content)
                
                for imp in imports:
                    # Check if import path exists
                    if imp.startswith('@/'):
                        # Convert to relative path
                        rel_path = imp.replace('@/', 'src/')
                        full_path = self.root / rel_path
                        
                        # Check if file exists with extensions
                        exists = False
                        for ext in ['.ts', '.tsx', '.js', '.jsx', '.json']:
                            if (full_path.with_suffix(ext)).exists():
                                exists = True
                                break
                        
                        if not exists:
                            self.results['issues'].append({
                                'file': str(file.relative_to(self.root)),
                                'type': 'missing_import',
                                'message': f"Import not found: {imp}",
                                'line': self.get_line_number(content, imp)
                            })
                            self.results['summary']['errors'] += 1
                            
            except Exception as e:
                print(f"  ❌ Error reading {file.name}: {e}")
    
    def check_json_imports(self):
        """Ստուգել JSON import-ները"""
        print("\n📋 CHECKING JSON IMPORTS")
        print("-"*80)
        
        json_imports_found = 0
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find JSON imports
                json_imports = re.findall(r"import\s+.*?from\s+['\"](.*?\.json)['\"]", content)
                
                if json_imports:
                    json_imports_found += len(json_imports)
                    print(f"  📄 {file.name}: {len(json_imports)} JSON imports")
                    
                    for imp in json_imports:
                        print(f"    - {imp}")
                        self.results['issues'].append({
                            'file': str(file.relative_to(self.root)),
                            'type': 'json_import',
                            'message': f"JSON import found: {imp} - may need 'as any' or require()",
                            'line': self.get_line_number(content, imp)
                        })
                        self.results['summary']['warnings'] += 1
                        
            except Exception as e:
                print(f"  ❌ Error reading {file.name}: {e}")
        
        if json_imports_found == 0:
            print("  ✅ No JSON imports found")
    
    def check_audio_provider_types(self):
        """Ստուգել AudioProviderType-ները"""
        print("\n🎵 CHECKING AUDIO PROVIDER TYPES")
        print("-"*80)
        
        offline_usage = 0
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find AudioProviderType.OFFLINE
                offline_matches = re.findall(r"AudioProviderType\.OFFLINE", content)
                
                if offline_matches:
                    offline_usage += len(offline_matches)
                    print(f"  ⚠️ {file.name}: {len(offline_matches)} AudioProviderType.OFFLINE usages")
                    
                    self.results['issues'].append({
                        'file': str(file.relative_to(self.root)),
                        'type': 'audio_provider',
                        'message': f"AudioProviderType.OFFLINE used {len(offline_matches)} times - should be MP3",
                        'line': self.get_line_number(content, 'AudioProviderType.OFFLINE')
                    })
                    self.results['summary']['errors'] += len(offline_matches)
                    
            except Exception as e:
                print(f"  ❌ Error reading {file.name}: {e}")
        
        if offline_usage == 0:
            print("  ✅ No AudioProviderType.OFFLINE found")
    
    def check_async_await(self):
        """Ստուգել async/await-ները"""
        print("\n⏳ CHECKING ASYNC/AWAIT")
        print("-"*80)
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find async functions without try-catch
                async_funcs = re.findall(r"async\s+function\s+(\w+)", content)
                
                if async_funcs:
                    for func in async_funcs:
                        # Check if function has try-catch
                        func_pattern = rf"async\s+function\s+{func}\s*\([^)]*\)\s*{{([^}}]+)}}"
                        func_match = re.search(func_pattern, content, re.DOTALL)
                        
                        if func_match and 'try' not in func_match.group(1):
                            print(f"  ⚠️ {file.name}: {func}() has no try-catch")
                            self.results['issues'].append({
                                'file': str(file.relative_to(self.root)),
                                'type': 'async_no_try',
                                'message': f"Async function {func}() has no try-catch",
                                'line': self.get_line_number(content, f"async function {func}")
                            })
                            self.results['summary']['warnings'] += 1
                            
            except Exception as e:
                print(f"  ❌ Error reading {file.name}: {e}")
    
    def check_null_checks(self):
        """Ստուգել null checks-ները"""
        print("\n🔍 CHECKING NULL CHECKS")
        print("-"*80)
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                
                # Find potential null issues
                null_patterns = [
                    r"\?\.",
                    r"\.get\(",
                    r"\[.*?\]",
                ]
                
                # Find .get() without optional chaining
                get_calls = re.findall(r"(\w+)\.get\(", content)
                
                if get_calls:
                    # Check if there's optional chaining before
                    for call in set(get_calls):
                        if f"{call}?." not in content:
                            print(f"  ⚠️ {file.name}: {call}.get() without optional chaining")
                            
            except Exception as e:
                print(f"  ❌ Error reading {file.name}: {e}")
    
    def get_line_number(self, content: str, pattern: str) -> int:
        """Գտնել տողի համարը"""
        try:
            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                if pattern in line:
                    return i
        except:
            pass
        return 0
    
    def generate_report(self):
        """Ստեղծել JSON զեկույց"""
        print("\n📊 GENERATING REPORT")
        print("-"*80)
        
        report_dir = self.root / 'build_reports'
        report_dir.mkdir(exist_ok=True)
        
        report_file = report_dir / f'build_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"  ✅ Report saved: {report_file}")
        
        # Save simplified list of issues
        if self.results['issues']:
            issues_file = report_dir / 'build_issues.txt'
            with open(issues_file, 'w', encoding='utf-8') as f:
                f.write("="*80 + "\n")
                f.write("BUILD ISSUES\n")
                f.write("="*80 + "\n\n")
                
                for issue in self.results['issues']:
                    f.write(f"📄 {issue['file']}\n")
                    f.write(f"  Type: {issue['type']}\n")
                    f.write(f"  Line: {issue['line']}\n")
                    f.write(f"  {issue['message']}\n\n")
            
            print(f"  ✅ Issues list saved: {issues_file}")
    
    def print_summary(self):
        """Տպել ամփոփում"""
        print("\n" + "="*80)
        print("📊 SUMMARY")
        print("="*80)
        
        summary = self.results['summary']
        
        print(f"\n  📁 Total files: {summary['total_files']}")
        print(f"  📄 TS files: {summary['ts_files']}")
        print(f"  📄 TSX files: {summary['tsx_files']}")
        print(f"\n  ❌ Errors: {summary['errors']}")
        print(f"  ⚠️ Warnings: {summary['warnings']}")
        
        if self.results['issues']:
            print(f"\n  📋 Issues by type:")
            issue_types = {}
            for issue in self.results['issues']:
                issue_types[issue['type']] = issue_types.get(issue['type'], 0) + 1
            
            for type_name, count in issue_types.items():
                print(f"    - {type_name}: {count}")
            
            print(f"\n  📄 Files with issues: {len(set(i['file'] for i in self.results['issues']))}")
        
        if summary['errors'] == 0 and summary['warnings'] == 0:
            print("\n  ✅ BUILD SHOULD PASS WITHOUT ERRORS")
        elif summary['errors'] == 0:
            print("\n  ⚠️ BUILD MAY PASS WITH WARNINGS")
        else:
            print("\n  ❌ BUILD WILL FAIL - FIX ERRORS")
        
        print("="*80)
    
    def fix_auto(self):
        """Ավտոմատ ուղղումներ"""
        print("\n🔧 AUTO-FIXING ISSUES")
        print("-"*80)
        
        for file in self.all_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                changed = False
                
                # Fix AudioProviderType.OFFLINE
                if 'AudioProviderType.OFFLINE' in content:
                    new_content = content.replace('AudioProviderType.OFFLINE', 'AudioProviderType.MP3')
                    file.write_text(new_content, encoding='utf-8')
                    changed = True
                    print(f"  ✅ Fixed: {file.name}")
                
                if changed:
                    self.results['summary']['errors'] -= 1
                    
            except Exception as e:
                print(f"  ❌ Error fixing {file.name}: {e}")

def main():
    root_path = r"C:\Users\Armen\Documents\NurLingo\NURLingo-main\nurlingo_integrated_round2"
    analyzer = BuildAnalyzer(root_path)
    analyzer.analyze_all()
    
    # Ask if user wants to auto-fix
    print("\n🔧 Auto-fix issues? (y/n)")
    choice = input().strip().lower()
    if choice == 'y':
        analyzer.fix_auto()
        print("\n✅ Auto-fix complete. Run build again.")

if __name__ == "__main__":
    main()