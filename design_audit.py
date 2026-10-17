#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════╗
║           NUR Lingo — DESIGN AUDIT SCRIPT                            ║
║           Detects design inconsistencies across the codebase         ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python design_audit.py                     # Full audit
    python design_audit.py --section css       # Only CSS
    python design_audit.py --section colors    # Only colors
    python design_audit.py --section themes    # Only themes
    python design_audit.py --section classes   # Only class usage
    python design_audit.py --section zindex    # Only z-index
    python design_audit.py --section typography# Only typography
    python design_audit.py --section spacing   # Only spacing
    python design_audit.py --section a11y      # Only accessibility
    python design_audit.py --section inline    # Only inline styles
    python design_audit.py --quiet             # Only high/med issues
"""

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

# ═══════════════════════════════════════════════════════════════════════
#  ANSI COLORS
# ═══════════════════════════════════════════════════════════════════════

class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"

    @staticmethod
    def strip():
        if not sys.stdout.isatty():
            for attr in dir(C):
                if attr.isupper():
                    setattr(C, attr, "")

C.strip()

def c(text, color):
    return f"{color}{text}{C.RESET}"

def banner(text, color=C.CYAN):
    print()
    print(c("═" * 76, color))
    print(c(f"  {text}", C.BOLD + color))
    print(c("═" * 76, color))

def section(title, color=C.MAGENTA):
    print()
    print(c(f"┌─ {title}", C.BOLD + color))
    print(c("│", color))

def ok(msg):
    print(f"  {c('✓', C.GREEN)} {msg}")

def issue(severity, section_name, msg):
    icon = {"high": c("✗", C.RED), "med": c("⚠", C.YELLOW), "low": c("·", C.BLUE)}.get(severity, "·")
    color = {"high": C.RED, "med": C.YELLOW, "low": C.DIM}.get(severity, C.DIM)
    print(f"  {icon} {c(msg, color)}")

def note(msg):
    print(f"  {c('ℹ', C.CYAN)} {msg}")

# ═══════════════════════════════════════════════════════════════════════
#  ISSUE TRACKER
# ═══════════════════════════════════════════════════════════════════════

@dataclass
class Issue:
    severity: str
    section: str
    message: str
    file: str = ""
    line: int = 0
    detail: str = ""

@dataclass
class AuditReport:
    issues: List[Issue] = field(default_factory=list)
    stats: Dict[str, int] = field(default_factory=dict)
    start_time: str = ""

    def add(self, severity: str, section: str, message: str, file: str = "", line: int = 0, detail: str = ""):
        self.issues.append(Issue(severity, section, message, file, line, detail))

    def by_severity(self, sev: str) -> List[Issue]:
        return [i for i in self.issues if i.severity == sev]

# ═══════════════════════════════════════════════════════════════════════
#  FILE DISCOVERY
# ═══════════════════════════════════════════════════════════════════════

def find_src_files(project: Path) -> Tuple[List[Path], List[Path]]:
    tsx = []
    css = []
    src = project / "src"
    if not src.exists():
        return [], []
    for root, _, files in os.walk(src):
        for f in files:
            p = Path(root) / f
            if f.endswith((".tsx", ".ts")):
                tsx.append(p)
            elif f.endswith((".css", ".scss")):
                css.append(p)
    return tsx, css

def read_file_safe(path: Path) -> Optional[str]:
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            print(f"  {c('✗', C.RED)} Error reading {path.name}: {e}")
            return None
    except Exception as e:
        print(f"  {c('✗', C.RED)} Error reading {path.name}: {e}")
        return None

def short_path(path: Path, project: Path) -> str:
    try:
        return str(path.relative_to(project))
    except ValueError:
        return path.name

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 1 — CSS ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

def strip_at_rule_blocks(css: str, rule_name: str) -> str:
    """Ջնջում է ամբողջ @rule { ... } բլոկը (ներառյալ պարունակությունը)։"""
    result = []
    i = 0
    pattern = re.compile(r'@' + rule_name + r'\b', re.IGNORECASE)
    
    while i < len(css):
        match = pattern.search(css, i)
        if not match:
            result.append(css[i:])
            break
        
        result.append(css[i:match.start()])
        
        brace_start = css.find('{', match.end())
        if brace_start == -1:
            i = match.end()
            continue
        
        depth = 1
        j = brace_start + 1
        while j < len(css) and depth > 0:
            if css[j] == '{': depth += 1
            elif css[j] == '}': depth -= 1
            j += 1
        
        i = j
    
    return ''.join(result)

def parse_css_selectors(css_text: str) -> List[Tuple[str, int, str]]:
    rules = []
    clean_text = re.sub(r"/\*.*?\*/", "", css_text, flags=re.DOTALL)
    
    # ✅ Ջնջում ենք @media, @keyframes և այլ բլոկները, որ կեղծ ահազանգեր չտան
    clean_text = strip_at_rule_blocks(clean_text, 'keyframes')
    clean_text = strip_at_rule_blocks(clean_text, 'media')
    clean_text = strip_at_rule_blocks(clean_text, 'supports')
    clean_text = strip_at_rule_blocks(clean_text, 'font-face')
    clean_text = strip_at_rule_blocks(clean_text, 'layer') # Եթե Tailwind-ի layer-ներն ենք ուզում անտեսել
    
    pattern = re.compile(r"([^{}@]+?)\s*\{([^{}]*)\}", re.DOTALL)
    
    for m in pattern.finditer(clean_text):
        selector = m.group(1).strip()
        body = m.group(2).strip()
        
        if not selector: continue
        if selector in ("from", "to") or re.match(r"^\d+%", selector): continue
        
        line_num = clean_text[:m.start()].count("\n") + 1
        rules.append((selector, line_num, body))
    return rules

def analyze_css(css_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 1 — CSS Analysis", C.CYAN)

    if not css_files:
        issue("high", "css", "No CSS files found in src/")
        return

    for css_path in css_files:
        text = read_file_safe(css_path)
        rel = short_path(css_path, project)

        if text is None:
            issue("high", "css", f"Failed to read CSS file: {rel}")
            continue
        if len(text.strip()) == 0:
            issue("high", "css", f"CSS file is empty: {rel}")
            continue

        # 1.1 Duplicate selectors
        selectors = parse_css_selectors(text)
        selector_counts = Counter(s.strip() for s, _, _ in selectors)
        dupes = {s: n for s, n in selector_counts.items() if n > 1 and s}
        
        if dupes:
            issue("high", "css", f"{len(dupes)} selectors declared multiple times in {rel}")
            top = sorted(dupes.items(), key=lambda x: -x[1])[:5]
            for s, n in top:
                print(f"     {c(str(n) + 'x', C.RED)} {c(s[:80], C.DIM)}")
            report.add("high", "css", f"{len(dupes)} duplicate selectors in {rel}")
        else:
            ok(f"No duplicate selectors in {rel}")

        # 1.2 !important count (Թարմացված շեմերով)
        important_count = text.count("!important")
        if important_count > 150:
            issue("high", "css", f"{important_count} x `!important` in {rel} — extreme overuse")
        elif important_count > 100:
            issue("med", "css", f"{important_count} x `!important` in {rel}")
        else:
            ok(f"{important_count} x `!important` (ներառյալ theme overrides)")

        # 1.3 Universal selectors
        universal = re.findall(r"(?:^|\s)\*+\s*(?:,|\{)", text, re.MULTILINE)
        body_star = re.findall(r"(?:body|html|\.dark)\s+\*\s*\{", text)
        if body_star:
            issue("high", "css", f"{len(body_star)} x `body *` / `.dark *` selectors in {rel} — breaks theming")
        elif universal:
            issue("low", "css", f"{len(universal)} x universal selector uses (standard reset)")

        # 1.4 @import statements
        imports = re.findall(r"@import\s+url\(", text)
        if imports:
            issue("high", "css", f"{len(imports)} x `@import url()` in {rel} — use next/font instead")

        # 1.5 Hardcoded colors
        hex_colors = re.findall(r"#([0-9a-fA-F]{3,8})\b", text)
        is_globals = "globals" in rel.lower()
        if len(hex_colors) > 30 and not is_globals:
            issue("med", "css", f"{len(hex_colors)} hardcoded hex colors in {rel}")
        if "000000" in hex_colors:
            issue("med", "css", "Pure black `#000000` used — prefer off-black (#0a0a1a)")

        # 1.6 text-shadow on body
        if re.search(r"body\s*\{[^}]*text-shadow", text, re.DOTALL):
            issue("med", "css", "`text-shadow` on body — causes repaint on scroll")

        # 1.7 Nuclear rules
        nuclear = re.findall(r"(?:html:not\(\.dark\)|\.dark)\s+body\s+\*\s*\{[^}]*color\s*:[^}]*!important", text, re.DOTALL)
        if nuclear:
            issue("high", "css", f"{len(nuclear)} nuclear text-color rules (`body *` + !important)")

        # 1.8 :contains()
        if ":contains(" in text:
            issue("high", "css", "`:contains()` used — NOT a valid CSS pseudo-class")

    report.stats["css_files"] = len(css_files)

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 2 — COLOR ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

TW_COLOR_FAMILIES = [
    "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald",
    "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
]

def extract_tailwind_colors(tsx_text: str) -> Dict[str, List[int]]:
    result = defaultdict(list)
    pattern = re.compile(r"\b(?:text|bg|border|ring|from|to|via|fill|stroke|accent|caret|decoration|divide|outline|shadow|placeholder)-(" + "|".join(TW_COLOR_FAMILIES) + r")-(\d{2,3})\b")
    for i, line in enumerate(tsx_text.splitlines(), 1):
        for m in pattern.finditer(line):
            result[f"{m.group(1)}-{m.group(2)}"].append(i)
    return dict(result)

def extract_arbitrary_colors(tsx_text: str) -> List[Tuple[int, str]]:
    result = []
    pattern = re.compile(r"\b(?:text|bg|border|ring|from|to|via|fill|stroke)-\[(#[0-9a-fA-F]{3,8}|rgba?\([^\]]+\)|hsla?\([^\]]+\))\]")
    for i, line in enumerate(tsx_text.splitlines(), 1):
        for m in pattern.finditer(line):
            result.append((i, m.group(1)))
    return result

def extract_inline_styles(tsx_text: str) -> List[Tuple[int, str]]:
    result = []
    pattern = re.compile(r"style\s*=\s*\{\{([^}]+)\}\}", re.DOTALL)
    for m in pattern.finditer(tsx_text):
        line_num = tsx_text[:m.start()].count("\n") + 1
        result.append((line_num, m.group(1).strip()))
    return result

def analyze_colors(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 2 — Color Analysis", C.CYAN)

    family_usage = Counter()
    arbitrary_usages = []
    inline_color_usages = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)

        for key, lines in extract_tailwind_colors(text).items():
            family_usage[key.rsplit("-", 1)[0]] += len(lines)

        for line, val in extract_arbitrary_colors(text):
            arbitrary_usages.append((rel, line, val))

        for line, style in extract_inline_styles(text):
            if re.search(r"(?:^|[,{;]\s*)(?:color|background|borderColor|backgroundColor|fill|stroke)\s*:", style):
                inline_color_usages.append((rel, line, style[:120]))

    if arbitrary_usages:
        issue("med", "colors", f"{len(arbitrary_usages)} x arbitrary hex/rgb color in className")
        for rel, line, val in arbitrary_usages[:5]:
            print(f"     {c(rel, C.DIM)}:{line} → {c(val, C.YELLOW)}")
        if len(arbitrary_usages) > 5: print(f"     ... and {len(arbitrary_usages) - 5} more")
        report.add("med", "colors", f"{len(arbitrary_usages)} arbitrary color usages")
    else:
        ok("No arbitrary hex/rgb colors in className")

    if inline_color_usages:
        issue("med", "colors", f"{len(inline_color_usages)} x inline color styles")
        for rel, line, style in inline_color_usages[:3]:
            print(f"     {c(rel, C.DIM)}:{line} → {c(style, C.YELLOW)}")
    else:
        ok("No inline color styles")

    print()
    note("Tailwind color family usage (top 5):")
    for fam, count in family_usage.most_common(5):
        print(f"     {c(str(count).rjust(4) + 'x', C.DIM)} {c(fam, C.WHITE)}")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 3 — THEME ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

def analyze_themes(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 3 — Theme Coverage", C.CYAN)

    white_bg_no_dark = []
    text_white_on_transparent = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)
        
        for i, line in enumerate(text.splitlines(), 1):
            if "className" not in line and "class=" not in line: continue
            
            if re.search(r"\bbg-white(?:/\d+)?\b", line):
                if "dark:bg-" not in line and "dark:" not in line:
                    white_bg_no_dark.append((rel, i, line.strip()[:80]))
                    
            if re.search(r"\btext-white\b", line):
                if "bg-" not in line and "dark:" not in line:
                    text_white_on_transparent.append((rel, i, line.strip()[:80]))

    if white_bg_no_dark:
        issue("med", "themes", f"{len(white_bg_no_dark)} x `bg-white` without `dark:` variant")
        for rel, i, line in white_bg_no_dark[:3]:
            print(f"     {c(rel, C.DIM)}:{i} {c(line, C.DIM)}")
    else:
        ok("All `bg-white` have dark: variants")

    if text_white_on_transparent:
        issue("high", "themes", f"{len(text_white_on_transparent)} x `text-white` on transparent")
        for rel, i, line in text_white_on_transparent[:3]:
            print(f"     {c(rel, C.DIM)}:{i} {c(line, C.DIM)}")
        report.add("high", "themes", f"{len(text_white_on_transparent)} text-white on transparent")
    else:
        ok("No text-white on transparent")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 4 — CLASS USAGE
# ═══════════════════════════════════════════════════════════════════════

def analyze_classes(tsx_files: List[Path], css_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 4 — Class Usage", C.CYAN)

    defined: Set[str] = set()
    for css in css_files:
        text = read_file_safe(css)
        if text:
            for m in re.finditer(r"\.([a-zA-Z][a-zA-Z0-9_\-]*)", text):
                defined.add(m.group(1))

    used: Set[str] = set()
    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        for m in re.finditer(r'className\s*=\s*"([^"]+)"', text):
            for token in m.group(1).split():
                used.add(token.split(":")[-1])

    custom_prefixes = ("glass", "card", "btn", "dialogue", "word-chip", "badge", "hayq", "flag-stripe", "layer-", "nuri-", "text-body", "text-secondary", "text-muted", "text-danger", "text-success", "text-warning", "text-info", "backdrop-blur-glass", "backdrop-blur-soft", "animate-", "container-main", "answer-input", "exercise-card", "feedback-", "sparkle-", "letter-rain")
    
    custom_defined = {d for d in defined if d.startswith(custom_prefixes)}
    custom_used = {u for u in used if u.startswith(custom_prefixes)}

    unused = sorted(custom_defined - custom_used)
    undefined = sorted(custom_used - custom_defined)

    if unused:
        issue("med", "classes", f"{len(unused)} custom classes defined in CSS but unused")
        text_unused = ", ".join(unused[:8]) + "..."
        print(f"     {c(text_unused, C.DIM)}")
    else:
        ok("All custom CSS classes are used")

    if undefined:
        issue("high", "classes", f"{len(undefined)} custom classes used but not defined in CSS")
        text_undefined = ", ".join(undefined[:8]) + "..."
        print(f"     {c(text_undefined, C.RED)}")
    else:
        ok("All used custom classes are defined")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 5 — Z-INDEX
# ═══════════════════════════════════════════════════════════════════════

def analyze_zindex(tsx_files: List[Path], css_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 5 — Z-Index Conflicts", C.CYAN)
    zmap = defaultdict(int)

    for path in list(tsx_files) + list(css_files):
        text = read_file_safe(path)
        if not text: continue
        for m in re.finditer(r"\bz-(\[?\d+\]?)\b", text):
            zmap[m.group(1).strip("[]")] += 1

    high_z = {k: v for k, v in zmap.items() if int(k) >= 100}
    if high_z:
        issue("med", "zindex", f"{len(high_z)} z-index values >= 100 (potential conflicts)")
        for val, count in sorted(high_z.items(), key=lambda x: -int(x[0]))[:5]:
            print(f"     z-{c(val, C.YELLOW)} → {count} usages")
    else:
        ok("No high z-index values")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 6 — TYPOGRAPHY
# ═══════════════════════════════════════════════════════════════════════

def analyze_typography(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 6 — Typography", C.CYAN)
    font_sizes = Counter()
    arbitrary_font_sizes = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)
        
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b", line):
                font_sizes[m.group(1)] += 1
            for m in re.finditer(r"\btext-\[(\d+px|\d+rem|\d+em)\]", line):
                arbitrary_font_sizes.append((rel, i, m.group(1)))

    if arbitrary_font_sizes:
        issue("med", "typography", f"{len(arbitrary_font_sizes)} x arbitrary font sizes")
        uniq = Counter(v for _, _, v in arbitrary_font_sizes)
        for val, n in uniq.most_common(3):
            print(f"     {c(str(n).rjust(3) + 'x', C.DIM)} {c(val, C.YELLOW)}")
    else:
        ok("No arbitrary font sizes")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 7 — SPACING
# ═══════════════════════════════════════════════════════════════════════

def analyze_spacing(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 7 — Spacing", C.CYAN)
    arbitrary_spacing = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\b[pm][xytrbl]?-\[([^\]]+)\]", line):
                arbitrary_spacing.append((rel, i, m.group(1)))

    if arbitrary_spacing:
        issue("med", "spacing", f"{len(arbitrary_spacing)} x arbitrary spacing values")
    else:
        ok("No arbitrary spacing values")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 8 — ACCESSIBILITY (DESIGN)
# ═══════════════════════════════════════════════════════════════════════

def analyze_a11y(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 8 — Accessibility", C.CYAN)
    small_text = []
    missing_aria = []
    clickable_div = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\btext-\[(\d+)px\]", line):
                if int(m.group(1)) < 12:
                    small_text.append((rel, i, m.group(1)))
            if re.search(r"<button[^>]*>\s*<[A-Z]", line) and "aria-label" not in line:
                missing_aria.append((rel, i))
            if re.search(r"<div[^>]*\sonClick\s*=", line) and "role=" not in line:
                clickable_div.append((rel, i))

    if small_text:
        issue("med", "a11y", f"{len(small_text)} x text smaller than 12px")
    else:
        ok("All text >= 12px")

    if clickable_div:
        issue("med", "a11y", f"{len(clickable_div)} x clickable `<div onClick>` without role")
    else:
        ok("No clickable divs without role")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 9 — INLINE STYLES
# ═══════════════════════════════════════════════════════════════════════

def analyze_inline_styles(tsx_files: List[Path], project: Path, report: AuditReport) -> None:
    section("SECTION 9 — Inline Styles", C.CYAN)
    all_inline = []
    for path in tsx_files:
        text = read_file_safe(path)
        if not text: continue
        rel = short_path(path, project)
        for line, style in extract_inline_styles(text):
            all_inline.append((rel, line, style[:80]))

    if all_inline:
        issue("med", "inline", f"{len(all_inline)} x inline `style={{...}}`")
        for rel, line, style in all_inline[:3]:
            print(f"     {c(rel, C.DIM)}:{line} → {c(style, C.DIM)}")
    else:
        ok("No inline styles")

# ═══════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════

def parse_args():
    p = argparse.ArgumentParser(description="NUR Lingo — Design Audit")
    p.add_argument("path", nargs="?", default=None)
    p.add_argument("--section", default="all", choices=["all", "css", "colors", "themes", "classes", "zindex", "typography", "spacing", "a11y", "inline"])
    p.add_argument("--quiet", action="store_true")
    return p.parse_args()

def find_root(hint):
    if hint: return Path(hint).resolve()
    here = Path(__file__).resolve().parent
    for cand in [here, *here.parents]:
        if (cand / "package.json").exists(): return cand
    return here

def main():
    args = parse_args()
    project = find_root(args.path)

    banner("🎨  NUR LINGO — DESIGN AUDIT", C.CYAN)
    print(f"  {c('Project:', C.BOLD)} {project}")
    print(f"  {c('Section:', C.BOLD)} {args.section}")

    tsx_files, css_files = find_src_files(project)
    print(f"  {c('TSX files:', C.BOLD)} {len(tsx_files)}")
    print(f"  {c('CSS files:', C.BOLD)} {len(css_files)}")

    report = AuditReport(start_time=datetime.now().isoformat())

    sec = args.section
    if sec in ("all", "css"): analyze_css(css_files, project, report)
    if sec in ("all", "colors"): analyze_colors(tsx_files, project, report)
    if sec in ("all", "themes"): analyze_themes(tsx_files, project, report)
    if sec in ("all", "classes"): analyze_classes(tsx_files, css_files, project, report)
    if sec in ("all", "zindex"): analyze_zindex(tsx_files, css_files, project, report)
    if sec in ("all", "typography"): analyze_typography(tsx_files, project, report)
    if sec in ("all", "spacing"): analyze_spacing(tsx_files, project, report)
    if sec in ("all", "a11y"): analyze_a11y(tsx_files, project, report)
    if sec in ("all", "inline"): analyze_inline_styles(tsx_files, project, report)

    banner("📊 DESIGN AUDIT REPORT", C.CYAN)
    high = report.by_severity("high")
    med = report.by_severity("med")
    
    print(f"  {c('High:', C.RED)}   {len(high)}")
    print(f"  {c('Medium:', C.YELLOW)} {len(med)}")
    print()

    if high:
        print(c("  ❌ HIGH PRIORITY:", C.BOLD + C.RED))
        for i in high:
            print(f"     • [{i.section}] {i.message}")
        print()
    if med:
        print(c("  ⚠ MEDIUM:", C.BOLD + C.YELLOW))
        for i in med:
            print(f"     • [{i.section}] {i.message}")
        print()

    return 0 if not high else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(c("\n⚠ Interrupted", C.YELLOW))
        sys.exit(130)