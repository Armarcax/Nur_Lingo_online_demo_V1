import os
import re
import json
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Any

class AudioCodeAnalyzer:
    """Աուդիոհամակարգի կոդային ֆայլերի վերլուծության դաս"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.src_root = self.project_root / "src"
        
        # Աուդիո հետ կապված ֆայլերի ուղիներ
        self.audio_dirs = [
            "app/api/generate-tts",
            "app/api/generate-wav",
            "lib/audio",
            "lib/hooks",
            "lib/offline",
            "components"
        ]
        
        # Աուդիո հետ կապված ֆայլերի անուններ
        self.audio_patterns = [
            r'.*[Aa]udio.*\.(ts|tsx|js|jsx)$',
            r'.*[Tt]rilingual.*\.(ts|tsx|js|jsx)$',
            r'.*[Ww]av.*\.(ts|tsx|js|jsx)$',
            r'.*[Tt]ts.*\.(ts|tsx|js|jsx)$',
            r'.*[Ss]ound.*\.(ts|tsx|js|jsx)$',
        ]
        
        # Հայտնաբերված խնդիրներ
        self.issues = {
            'missing_imports': [],
            'undefined_variables': [],
            'type_errors': [],
            'potential_nulls': [],
            'hardcoded_paths': [],
            'missing_error_handling': [],
            'console_logs': [],
            'deprecated_apis': [],
            'async_issues': [],
            'path_issues': []
        }
        
        self.stats = {
            'files_analyzed': 0,
            'lines_analyzed': 0,
            'issues_found': 0
        }
    
    def find_audio_files(self) -> List[Path]:
        """Գտնում է բոլոր աուդիո հետ կապված ֆայլերը"""
        audio_files = []
        
        for pattern in self.audio_patterns:
            for file_path in self.src_root.rglob("*"):
                if file_path.is_file() and re.match(pattern, file_path.name):
                    audio_files.append(file_path)
        
        # Հեռացնել կրկնօրինակները
        return list(set(audio_files))
    
    def analyze_file(self, file_path: Path) -> Dict[str, List]:
        """Վերլուծում է մեկ ֆայլ և գտնում խնդիրները"""
        issues = defaultdict(list)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            self.stats['lines_analyzed'] += len(lines)
            
            # 1. Ստուգել import-ները
            imports = re.findall(r'import\s+.*?\s+from\s+[\'"](.+?)[\'"]', content)
            for imp in imports:
                if imp.startswith('.') and not self._check_import_exists(file_path, imp):
                    issues['missing_imports'].append({
                        'line': self._find_line_number(lines, imp),
                        'import': imp
                    })
            
            # 2. Ստուգել undefined variables
            var_pattern = r'\b(const|let|var)\s+(\w+)\s*=\s*([^;]+);'
            variables = re.findall(var_pattern, content)
            for var_type, var_name, var_value in variables:
                if 'undefined' in var_value:
                    issues['undefined_variables'].append({
                        'line': self._find_line_number(lines, var_value),
                        'variable': var_name
                    })
            
            # 3. Ստուգել TypeScript type errors
            type_patterns = [
                r':\s*any\b',
                r':\s*unknown\b',
                r'as\s+any\b',
            ]
            for pattern in type_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    issues['type_errors'].append({
                        'pattern': pattern,
                        'count': len(matches)
                    })
            
            # 4. Ստուգել potential null/undefined
            null_patterns = [
                r'\.\s*audio\s*[?]\.',
                r'\.\s*sound\s*[?]\.',
                r'\.\s*play\s*[?]\.',
                r'\[\s*\w+\s*\]\s*[?]\.',
            ]
            for pattern in null_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    issues['potential_nulls'].append({
                        'pattern': pattern,
                        'count': len(matches)
                    })
            
            # 5. Ստուգել hardcoded paths
            path_patterns = [
                r'[\'"]/public/audio/',
                r'[\'"]public/audio/',
                r'[\'"]/audio/',
                r'[\'"]audio/',
                r'[\'"]offline/',
            ]
            for pattern in path_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    issues['hardcoded_paths'].append({
                        'path': pattern,
                        'count': len(matches)
                    })
            
            # 6. Ստուգել missing error handling
            if 'try' in content and 'catch' not in content:
                issues['missing_error_handling'].append({
                    'message': 'try block without catch'
                })
            
            if 'fetch' in content and '.catch' not in content and 'try' not in content:
                issues['missing_error_handling'].append({
                    'message': 'fetch without error handling'
                })
            
            # 7. Ստուգել console.log-եր
            console_matches = re.findall(r'console\.(log|warn|error|debug|info)', content)
            if console_matches:
                issues['console_logs'].append({
                    'count': len(console_matches),
                    'types': list(set(console_matches))
                })
            
            # 8. Ստուգել deprecated APIs
            deprecated = [
                r'\bcreateRef\b',
                r'\bcomponentWillMount\b',
                r'\bcomponentWillReceiveProps\b',
                r'\bcomponentWillUpdate\b',
            ]
            for pattern in deprecated:
                if re.search(pattern, content):
                    issues['deprecated_apis'].append({
                        'api': pattern,
                        'line': self._find_line_number(lines, pattern)
                    })
            
            # 9. Ստուգել async/await issues
            if 'async' in content and 'await' not in content:
                issues['async_issues'].append({
                    'message': 'async function without await'
                })
            
            if 'await' in content and 'async' not in content:
                issues['async_issues'].append({
                    'message': 'await outside async function'
                })
            
            # 10. Ստուգել path issues (Windows vs Unix)
            if '\\\\' in content or 'C:' in content:
                issues['path_issues'].append({
                    'message': 'Windows-specific paths detected'
                })
            
            # 11. Ստուգել աուդիո ֆայլերի ուղիներ
            audio_path_matches = re.findall(r'[\'"]([^\'"]*\.(mp3|wav|m4a))[\'"]', content)
            if audio_path_matches:
                for match in audio_path_matches:
                    path = match[0]
                    if not path.startswith('/') and not path.startswith('http') and not path.startswith('.'):
                        issues['path_issues'].append({
                            'path': path,
                            'message': 'Relative path without leading ./'
                        })
            
        except Exception as e:
            issues['parse_error'] = [str(e)]
        
        return issues
    
    def _check_import_exists(self, file_path: Path, import_path: str) -> bool:
        """Ստուգում է, արդյոք import-ը գոյություն ունի"""
        # Պարզեցված ստուգում
        if import_path.startswith('@'):
            return True  # External packages
        if import_path.startswith('.'):
            # Relative import
            base_dir = file_path.parent
            target_path = base_dir / import_path
            for ext in ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']:
                if (target_path.with_suffix(ext)).exists():
                    return True
                if (target_path / f'index{ext}').exists():
                    return True
        return False
    
    def _find_line_number(self, lines: List[str], pattern: str) -> int:
        """Գտնում է տողի համարը, որտեղ գտնվում է pattern-ը"""
        for i, line in enumerate(lines, 1):
            if pattern in line:
                return i
        return 0
    
    def generate_report(self, all_issues: Dict[Path, Dict[str, List]]):
        """Ստեղծում է ամփոփ հաշվետվություն"""
        
        print("\n" + "="*70)
        print("📊 ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԿՈԴԱՅԻՆ ՎԵՐԼՈՒԾՈՒԹՅԱՆ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ")
        print("="*70)
        
        # Խմբավորել խնդիրները ըստ տիպի
        grouped_issues = defaultdict(list)
        total_issues = 0
        
        for file_path, issues in all_issues.items():
            if issues:
                for issue_type, issue_list in issues.items():
                    if issue_list:
                        grouped_issues[issue_type].extend(issue_list)
                        total_issues += len(issue_list)
        
        # Վիճակագրություն
        print(f"\n📈 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ:")
        print(f"   • Վերլուծված ֆայլեր: {self.stats['files_analyzed']}")
        print(f"   • Վերլուծված տողեր: {self.stats['lines_analyzed']}")
        print(f"   • Ընդհանուր խնդիրներ: {total_issues}")
        
        # Խնդիրների ցուցակ
        if total_issues > 0:
            print(f"\n⚠️  ՀԱՅՏՆԱԲԵՐՎԱԾ ԽՆԴԻՐՆԵՐ:")
            print("-"*70)
            
            for issue_type, issues in sorted(grouped_issues.items()):
                print(f"\n  📌 {issue_type.replace('_', ' ').title()}: {len(issues)}")
                # Ցույց տալ առաջին 5-ը
                for issue in issues[:5]:
                    if isinstance(issue, dict):
                        details = ', '.join(f"{k}: {v}" for k, v in issue.items())
                        print(f"      • {details}")
                    else:
                        print(f"      • {issue}")
                if len(issues) > 5:
                    print(f"      ... և {len(issues)-5} այլ")
        
        # Առանձին ֆայլերի ամփոփում
        print(f"\n📁 ՖԱՅԼԵՐԻ ԱՄՓՈՓՈՒՄ:")
        print("-"*70)
        for file_path, issues in sorted(all_issues.items()):
            if issues:
                total = sum(len(v) for v in issues.values())
                print(f"  ⚠️ {file_path.relative_to(self.project_root)}: {total} խնդիր")
        
        # Պահպանել JSON հաշվետվություն
        report_data = {
            'stats': self.stats,
            'total_issues': total_issues,
            'issues': {k: v[:100] for k, v in grouped_issues.items()},
            'file_details': {
                str(f.relative_to(self.project_root)): {k: len(v) for k, v in issues.items()}
                for f, issues in all_issues.items() if issues
            }
        }
        
        report_file = self.project_root / "audio_code_analysis_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Հաշվետվությունը պահպանվել է՝ {report_file}")
    
    def run(self):
        """Գործարկում է ամբողջական վերլուծությունը"""
        print("🚀 ՍԿՍՎՈՒՄ Է ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԿՈԴԱՅԻՆ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆԸ...\n")
        
        # Գտնել բոլոր աուդիո ֆայլերը
        audio_files = self.find_audio_files()
        self.stats['files_analyzed'] = len(audio_files)
        
        print(f"📁 Գտնվել է {len(audio_files)} աուդիո հետ կապված ֆայլ")
        
        # Վերլուծել յուրաքանչյուր ֆայլ
        all_issues = {}
        for file_path in audio_files:
            print(f"   • Վերլուծում եմ: {file_path.relative_to(self.project_root)}")
            issues = self.analyze_file(file_path)
            if issues:
                all_issues[file_path] = issues
        
        # Ստեղծել հաշվետվություն
        self.generate_report(all_issues)
        
        print("\n✅ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆԸ ԱՎԱՐՏՎԱԾ Է")

if __name__ == "__main__":
    analyzer = AudioCodeAnalyzer()
    analyzer.run()