#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════╗
║           NUR Lingo — DESIGN AUDIT SCRIPT                            ║
║           Detects design inconsistencies across the codebase         ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python design_audit.py                     # Full audit
    python design_audit.py --path C:\\path     # Custom path
    python design_audit.py --section css       # Only CSS
    python design_audit.py --section colors    # Only colors
    python design_audit.py --section themes    # Only themes
    python design_audit.py --section classes   # Only class usage
    python design_audit.py --section zindex    # Only z-index
    python design_audit.py --section a11y      # Only accessibility
    python design_audit.py --quiet             # Only errors, no info

Sections:
    css       — globals.css issues (duplicates, !important, dead rules)
    colors    — hardcoded colors, off-palette usage
    themes    — missing dark: variants, light/dark coverage
    classes   — unused, undefined, or inconsistent classes
    zindex    — z-index conflicts
    typography— font-size, font-family inconsistencies
    spacing   — padding/margin inconsistencies
    a11y      — accessibility-related issues
    inline    — inline style vs Tailwind
    all       — everything (default)
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

def issue(severity, msg):
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
    severity: str  # "high", "med", "low"
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

    def add(self, severity: str, section: str, message: str,
            file: str = "", line: int = 0, detail: str = ""):
        self.issues.append(Issue(severity, section, message, file, line, detail))

    def by_severity(self, sev: str) -> List[Issue]:
        return [i for i in self.issues if i.severity == sev]

    def by_section(self, sec: str) -> List[Issue]:
        return [i for i in self.issues if i.section == sec]

# ═══════════════════════════════════════════════════════════════════════
#  FILE DISCOVERY
# ═══════════════════════════════════════════════════════════════════════

def find_src_files(project: Path) -> Tuple[List[Path], List[Path]]:
    """Return (tsx_files, css_files)."""
    tsx = []
    css = []
    src = project / "src"
    for root, _, files in os.walk(src):
        for f in files:
            p = Path(root) / f
            if f.endswith((".tsx", ".ts")):
                tsx.append(p)
            elif f.endswith((".css", ".scss")):
                css.append(p)
    return tsx, css

def read_file_safe(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 1 — CSS ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

def parse_css_selectors(css_text: str) -> List[Tuple[str, int, str]]:
    """
    Return list of (selector, line_num, body) for top-level rules.
    Best-effort parse (no nested @media traversal for simplicity).
    """
    rules = []
    lines = css_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Skip comments, at-rules other than media
        if line.startswith("@") and not line.startswith("@media"):
            i += 1
            continue
        # Match selector { ... }
        m = re.match(r"^([^{@][^{]*?)\s*\{", line)
        if m:
            selector = m.group(1).strip()
            body_lines = []
            depth = line.count("{") - line.count("}")
            j = i
            while j < len(lines) and depth > 0:
                if j > i:
                    body_lines.append(lines[j])
                    depth += lines[j].count("{") - lines[j].count("}")
                j += 1
            rules.append((selector, i + 1, "\n".join(body_lines)))
            i = j
        else:
            i += 1
    return rules

def analyze_css(css_files: List[Path], report: AuditReport) -> None:
    section("SECTION 1 — CSS Analysis", C.CYAN)

    for css_path in css_files:
        text = read_file_safe(css_path)
        if not text:
            continue

        rel = str(css_path)

        # ── 1.1: Duplicate selectors (same selector declared 2+ times) ──
        selectors = parse_css_selectors(text)
        selector_counts = Counter(s.strip() for s, _, _ in selectors)
        dupes = {s: n for s, n in selector_counts.items() if n > 1 and s}
        if dupes:
            issue("high", "css",
                  f"{len(dupes)} selectors declared multiple times in {rel}")
            top = sorted(dupes.items(), key=lambda x: -x[1])[:10]
            for s, n in top:
                print(f"     {c(f'{n}×', C.RED)} {c(s[:80], C.DIM)}")
            report.add("high", "css", f"{len(dupes)} duplicate selectors in {rel}",
                       file=rel, detail=json.dumps(dupes))
        else:
            ok(f"No duplicate selectors in {rel}")

        # ── 1.2: `!important` count ──
        important_matches = re.findall(r"!important", text)
        if len(important_matches) > 20:
            issue("high", "css",
                  f"{len(important_matches)} × `!important` in {rel} — overuse")
        elif len(important_matches) > 5:
            issue("med", "css",
                  f"{len(important_matches)} × `!important` in {rel}")
        else:
            ok(f"{len(important_matches)} × `!important`")

        # ── 1.3: Universal selectors ──
        universal = re.findall(r"(?:^|\s)\*+\s*(?:,|\{)", text, re.MULTILINE)
        body_star = re.findall(r"(?:body|html|\.dark)\s+\*\s*\{", text)
        if body_star:
            issue("high", "css",
                  f"{len(body_star)} × `body *` / `.dark *` selectors in {rel} — breaks theming")
        elif universal:
            issue("med", "css", f"{len(universal)} × universal selector uses")

        # ── 1.4: `@import` statements (blocking) ──
        imports = re.findall(r"@import\s+url\(", text)
        if imports:
            issue("high", "css",
                  f"{len(imports)} × `@import url()` in {rel} — use next/font instead")

        # ── 1.5: Hardcoded colors (non-variable) ──
        hex_colors = re.findall(r"#([0-9a-fA-F]{3,8})\b", text)
        # Filter out colors inside CSS variables that are intended
        is_globals = "globals" in rel.lower()
        if len(hex_colors) > 30 and not is_globals:
            issue("med", "css", f"{len(hex_colors)} hardcoded hex colors in {rel}")
        # Check for specific problematic ones
        if "000000" in hex_colors:
            issue("med", "css",
                  "Pure black `#000000` used — prefer off-black (#0a0a1a)")

        # ── 1.6: `text-shadow` on body ──
        if re.search(r"body\s*\{[^}]*text-shadow", text, re.DOTALL):
            issue("med", "css",
                  "`text-shadow` on body — causes repaint on scroll")

        # ── 1.7: `.dark body *` / `body *` with !important ──
        nuclear = re.findall(
            r"(?:html:not\(\.dark\)|\.dark)\s+body\s+\*\s*\{[^}]*color\s*:[^}]*!important",
            text, re.DOTALL
        )
        if nuclear:
            issue("high", "css",
                  f"{len(nuclear)} nuclear text-color rules (`body *` + !important) — will break all colors")

        # ── 1.8: `:contains()` (non-standard) ──
        if ":contains(" in text:
            issue("high", "css",
                  "`:contains()` used — NOT a valid CSS pseudo-class")

        # ── 1.9: Font-family duplicates ──
        ff_count = len(re.findall(r"font-family\s*:", text))
        if ff_count > 10:
            issue("med", "css",
                  f"{ff_count} × `font-family` declarations — inconsistent")
        elif ff_count > 5:
            issue("low", "css", f"{ff_count} × `font-family` declarations")

        # ── 1.10: Text-shadow duplicates ──
        ts_count = len(re.findall(r"text-shadow\s*:", text))
        if ts_count > 5:
            issue("med", "css",
                  f"{ts_count} × `text-shadow` — likely duplicated")

        # ── 1.11: Scrollbar rules duplicates ──
        scroll_count = len(re.findall(r"::-webkit-scrollbar\s*\{", text))
        if scroll_count > 4:
            issue("med", "css",
                  f"{scroll_count} × `::-webkit-scrollbar` rules — likely duplicated")

    report.stats["css_files"] = len(css_files)

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 2 — COLOR ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

# Tailwind color families — used to detect arbitrary values
TW_COLOR_FAMILIES = [
    "slate", "gray", "zinc", "neutral", "stone",
    "red", "orange", "amber", "yellow", "lime", "green", "emerald",
    "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
    "fuchsia", "pink", "rose",
]
TW_SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]

# Brand palette — these are the "approved" colors used in the project
BRAND_HEX = {
    "#D90012", "#d90012", "#FFA500", "#ffa500",
    "#0033A0", "#0033a0", "#F2A800", "#f2a800",
}

# Standard semantic colors that are OK to use
SEMANTIC_COLORS = {
    "red", "green", "emerald", "blue", "yellow", "amber",
    "orange", "purple", "indigo", "pink", "cyan", "teal", "rose",
}

def extract_tailwind_colors(tsx_text: str) -> Dict[str, List[int]]:
    """
    Return mapping of "family-shade" → list of line numbers.
    Detects `text-red-500`, `bg-blue-400`, `border-green-600`, etc.
    """
    result = defaultdict(list)
    pattern = re.compile(
        r"\b(?:text|bg|border|ring|from|to|via|fill|stroke|accent|caret|decoration|divide|outline|shadow|placeholder)-("
        + "|".join(TW_COLOR_FAMILIES) + r")-(\d{2,3})\b"
    )
    for i, line in enumerate(tsx_text.splitlines(), 1):
        for m in pattern.finditer(line):
            key = f"{m.group(1)}-{m.group(2)}"
            result[key].append(i)
    return dict(result)

def extract_arbitrary_colors(tsx_text: str) -> List[Tuple[int, str]]:
    """Return list of (line, value) for arbitrary hex/rgb values in className."""
    result = []
    # `bg-[#abc]`, `text-[rgb(0,0,0)]`, etc.
    pattern = re.compile(
        r"\b(?:text|bg|border|ring|from|to|via|fill|stroke)-\[(#[0-9a-fA-F]{3,8}|rgba?\([^\]]+\)|hsla?\([^\]]+\))\]"
    )
    for i, line in enumerate(tsx_text.splitlines(), 1):
        for m in pattern.finditer(line):
            result.append((i, m.group(1)))
    return result

def extract_inline_styles(tsx_text: str) -> List[Tuple[int, str]]:
    """Return list of (line, style_str) for inline style={{ ... }}."""
    result = []
    pattern = re.compile(r"style\s*=\s*\{\{([^}]+)\}\}", re.DOTALL)
    for i, line in enumerate(tsx_text.splitlines(), 1):
        pass
    # Do it over full text
    for m in pattern.finditer(tsx_text):
        line_num = tsx_text[:m.start()].count("\n") + 1
        result.append((line_num, m.group(1).strip()))
    return result

def analyze_colors(tsx_files: List[Path], report: AuditReport) -> None:
    section("SECTION 2 — Color Analysis", C.CYAN)

    family_usage = Counter()
    arbitrary_usages = []
    inline_color_usages = []

    for path in tsx_files:
        text = read_file_safe(path)
        if not text:
            continue
        rel = str(path)

        # Tailwind colors
        colors = extract_tailwind_colors(text)
        for key, lines in colors.items():
            fam = key.rsplit("-", 1)[0]
            family_usage[fam] += len(lines)

        # Arbitrary values
        arb = extract_arbitrary_colors(text)
        for line, val in arb:
            arbitrary_usages.append((rel, line, val))

        # Inline styles
        inline = extract_inline_styles(text)
        for line, style in inline:
            if re.search(r"(?:^|[,{;]\s*)(?:color|background|borderColor|backgroundColor|fill|stroke)\s*:", style):
                inline_color_usages.append((rel, line, style[:120]))

    # Report
    if arbitrary_usages:
        issue("med", "colors",
              f"{len(arbitrary_usages)} × arbitrary hex/rgb color in className")
        for rel, line, val in arbitrary_usages[:15]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{line} → {c(val, C.YELLOW)}")
        if len(arbitrary_usages) > 15:
            print(f"     ... and {len(arbitrary_usages) - 15} more")
        report.add("med", "colors",
                   f"{len(arbitrary_usages)} arbitrary color usages",
                   detail=str(arbitrary_usages[:50]))
    else:
        ok("No arbitrary hex/rgb colors in className")

    if inline_color_usages:
        issue("med", "colors",
              f"{len(inline_color_usages)} × inline color styles")
        for rel, line, style in inline_color_usages[:10]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{line} → {c(style, C.YELLOW)}")
    else:
        ok("No inline color styles")

    # Color family usage stats
    print()
    note("Tailwind color family usage (top 10):")
    for fam, count in family_usage.most_common(10):
        print(f"     {c(f'{count:>4}×', C.DIM)} {c(fam, C.WHITE)}")

    # Warn about rare colors
    rare = [(f, n) for f, n in family_usage.items() if n <= 2]
    if rare:
        issue("low", "colors",
              f"{len(rare)} color families used ≤ 2 times — palette bloat")
        for fam, count in rare:
            print(f"     {c(fam, C.DIM)} — {count}×")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 3 — THEME ANALYSIS (light/dark coverage)
# ═══════════════════════════════════════════════════════════════════════

def analyze_themes(tsx_files: List[Path], report: AuditReport) -> None:
    section("SECTION 3 — Theme Coverage (dark: variants)", C.CYAN)

    white_bg_no_dark = []
    white_text_no_dark = []
    black_bg_no_dark = []
    text_white_on_transparent = []
    dark_overrides = Counter()

    # Pattern: lines with bg-white but no dark:
    for path in tsx_files:
        text = read_file_safe(path)
        if not text:
            continue
        rel = str(path)
        # Only inspect files that contain "className="
        for i, line in enumerate(text.splitlines(), 1):
            if "className" not in line and "class=" not in line:
                continue
            # bg-white / bg-white/X  →  needs dark:bg-*
            if re.search(r"\bbg-white(?:/\d+)?\b", line):
                if "dark:bg-" not in line and "dark:" not in line:
                    white_bg_no_dark.append((rel, i, line.strip()[:120]))
            # text-white without colored parent → broken in light mode
            if re.search(r"\btext-white\b", line):
                if "bg-" not in line and "dark:" not in line:
                    # crude heuristic; still useful
                    text_white_on_transparent.append((rel, i, line.strip()[:120]))
            # bg-black/X  →  should have dark override
            if re.search(r"\bbg-black(?:/\d+)?\b", line) and "dark:" not in line:
                black_bg_no_dark.append((rel, i, line.strip()[:120]))
            # Count dark: usages
            for m in re.finditer(r"\bdark:([a-zA-Z0-9\-:/\[\]]+)", line):
                dark_overrides[m.group(1).split("-")[0]] += 1

    # Report
    if white_bg_no_dark:
        issue("med", "themes",
              f"{len(white_bg_no_dark)} × `bg-white` without `dark:` variant")
        for rel, i, line in white_bg_no_dark[:10]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{i}")
            print(f"       {c(line, C.DIM)}")
    else:
        ok("All `bg-white` have dark: variants")

    if text_white_on_transparent:
        issue("high", "themes",
              f"{len(text_white_on_transparent)} × `text-white` on transparent (breaks light mode)")
        for rel, i, line in text_white_on_transparent[:10]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{i}")
            print(f"       {c(line, C.DIM)}")
        report.add("high", "themes",
                   f"{len(text_white_on_transparent)} text-white on transparent")

    if black_bg_no_dark:
        issue("low", "themes",
              f"{len(black_bg_no_dark)} × `bg-black/X` without dark: variant")

    if not (white_bg_no_dark or text_white_on_transparent):
        ok("Theme coverage looks consistent")

    # Report most common dark overrides
    print()
    note("Top 10 dark: variants used:")
    for prop, count in dark_overrides.most_common(10):
        print(f"     {c(f'{count:>4}×', C.DIM)} dark:{prop}")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 4 — CLASS USAGE (unused CSS classes)
# ═══════════════════════════════════════════════════════════════════════

def analyze_classes(project: Path, tsx_files: List[Path],
                    css_files: List[Path], report: AuditReport) -> None:
    section("SECTION 4 — Class Usage", C.CYAN)

    # Extract classes defined in CSS
    defined: Set[str] = set()
    for css in css_files:
        text = read_file_safe(css)
        # Simple `.classname` detection
        for m in re.finditer(r"\.([a-zA-Z][a-zA-Z0-9_\-]*)", text):
            name = m.group(1)
            # Filter out common utility class names from Tailwind
            if name and not name.startswith("_"):
                defined.add(name)

    # Extract classes used in tsx (from className="..." and cn("..."))
    used: Set[str] = set()
    for path in tsx_files:
        text = read_file_safe(path)
        for m in re.finditer(r'className\s*=\s*"([^"]+)"', text):
            for token in m.group(1).split():
                # Strip variants like `dark:foo` → foo
                token = token.split(":")[-1]
                # Strip brackets and modifiers
                token = re.sub(r"\[.*?\]", "", token)
                if token:
                    used.add(token)
        for m in re.finditer(r"className\s*=\s*\{`([^`]+)`\}", text):
            for token in re.split(r"\s+", m.group(1)):
                if "${" in token:
                    continue
                token = token.split(":")[-1]
                if token and not token.startswith("$"):
                    used.add(token)

    # Note: we only compare "custom-looking" names (not in Tailwind's built-in set)
    # Since Tailwind's classes are too many, we filter to project-specific names
    # matching kebab-case or our custom prefix.
    custom_prefixes = ("glass", "card", "btn", "dialogue", "word-chip",
                       "badge", "hayq", "flag-stripe", "layer-", "nuri-",
                       "text-body", "text-secondary", "text-muted",
                       "text-danger", "text-success", "text-warning",
                       "text-info", "backdrop-blur-glass", "backdrop-blur-soft",
                       "animate-", "container-main", "answer-input",
                       "exercise-card", "feedback-", "sparkle-", "letter-rain",
                       "perspective", "transform-style-3d", "backface-hidden",
                       "rotate-y-180", "no-print", "print-world", "mascot-",
                       "animated-bg", "text-gradient", "shadow-glow", "bg-gradient-hero")

    custom_defined = {d for d in defined if d.startswith(custom_prefixes)}
    custom_used = {u for u in used if u.startswith(custom_prefixes)}

    unused = sorted(custom_defined - custom_used)
    undefined = sorted(custom_used - custom_defined)

    if unused:
        issue("med", "classes",
              f"{len(unused)} custom classes defined in CSS but unused in tsx")
        for u in unused[:20]:
            print(f"     {c(u, C.YELLOW)}")
        if len(unused) > 20:
            print(f"     ... and {len(unused) - 20} more")
        report.add("med", "classes", f"{len(unused)} unused CSS classes",
                   detail=", ".join(unused))
    else:
        ok("All custom CSS classes are used")

    if undefined:
        issue("high", "classes",
              f"{len(undefined)} custom classes used in tsx but not defined in CSS")
        for u in undefined[:20]:
            print(f"     {c(u, C.RED)}")
        report.add("high", "classes", f"{len(undefined)} undefined classes",
                   detail=", ".join(undefined))
    else:
        ok("All used custom classes are defined")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 5 — Z-INDEX
# ═══════════════════════════════════════════════════════════════════════

def analyze_zindex(tsx_files: List[Path], css_files: List[Path],
                   report: AuditReport) -> None:
    section("SECTION 5 — Z-Index Conflicts", C.CYAN)

    zmap: Dict[str, List[Tuple[str, int, str]]] = defaultdict(list)

    for path in tsx_files:
        text = read_file_safe(path)
        rel = str(path)
        # z-10, z-20, z-50, z-[100], z-[101]
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\bz-(\[?\d+\]?)\b", line):
                val = m.group(1).strip("[]")
                context = line.strip()[:100]
                zmap[val].append((rel, i, context))
            # Also inline style zIndex
            for m in re.finditer(r"zIndex\s*:\s*(-?\d+)", line):
                zmap[m.group(1)].append((rel, i, line.strip()[:100]))

    for path in css_files:
        text = read_file_safe(path)
        rel = str(path)
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"z-index\s*:\s*(-?\d+)", line):
                zmap[m.group(1)].append((rel, i, line.strip()[:100]))

    # High z-index conflicts
    high_z = {k: v for k, v in zmap.items() if v and int(k) >= 100}
    if high_z:
        issue("med", "zindex",
              f"{len(high_z)} z-index values ≥ 100 (potential conflicts)")
        for val, entries in sorted(high_z.items(), key=lambda x: -int(x[0]))[:10]:
            files = ", ".join(sorted({e[0].split("src")[-1].lstrip("\\/") for e in entries[:3]}))
            print(f"     z-{c(val, C.YELLOW)} → {len(entries)} usages across {c(files, C.DIM)}")
        report.add("med", "zindex", f"{len(high_z)} high z-index values",
                   detail=json.dumps({k: len(v) for k, v in high_z.items()}))

    # Duplicate z-index values used for different purposes
    large_groups = {k: v for k, v in zmap.items() if len(v) >= 15}
    if large_groups:
        issue("low", "zindex",
              f"{len(large_groups)} z-index values used 15+ times")
        for val, entries in sorted(large_groups.items(), key=lambda x: -len(x[1]))[:5]:
            print(f"     z-{c(val, C.YELLOW)} → {len(entries)} usages")

    if not high_z:
        ok("No high z-index values")

    # z-index summary
    print()
    note("Z-index values in use:")
    for val in sorted(zmap.keys(), key=lambda x: int(x)):
        print(f"     z-{c(val, C.CYAN):<10} {len(zmap[val])}×")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 6 — TYPOGRAPHY
# ═══════════════════════════════════════════════════════════════════════

def analyze_typography(tsx_files: List[Path], css_files: List[Path],
                       report: AuditReport) -> None:
    section("SECTION 6 — Typography Inconsistencies", C.CYAN)

    font_sizes = Counter()
    font_weights = Counter()
    arbitrary_font_sizes = []
    arbitrary_font_weights = []

    for path in tsx_files:
        text = read_file_safe(path)
        rel = str(path)

        # Standard sizes
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b", line):
                font_sizes[m.group(1)] += 1
            for m in re.finditer(r"\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b", line):
                font_weights[m.group(1)] += 1
            # Arbitrary: text-[14px]
            for m in re.finditer(r"\btext-\[(\d+px|\d+rem|\d+em)\]", line):
                arbitrary_font_sizes.append((rel, i, m.group(1)))
            for m in re.finditer(r"\bfont-\[(\d+)\]", line):
                arbitrary_font_weights.append((rel, i, m.group(1)))

    # CSS font-size
    for path in css_files:
        text = read_file_safe(path)
        rel = str(path)
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"font-size\s*:\s*([^;]+);", line):
                arbitrary_font_sizes.append((rel, i, m.group(1).strip()))

    if arbitrary_font_sizes:
        issue("med", "typography",
              f"{len(arbitrary_font_sizes)} × arbitrary font sizes")
        # Group unique values
        uniq = Counter(v for _, _, v in arbitrary_font_sizes)
        for val, n in uniq.most_common(10):
            print(f"     {c(f'{n:>3}×', C.DIM)} {c(val, C.YELLOW)}")
    else:
        ok("No arbitrary font sizes")

    if arbitrary_font_weights:
        issue("low", "typography",
              f"{len(arbitrary_font_weights)} × arbitrary font weights")

    print()
    note("Standard text sizes used:")
    for size, n in sorted(font_sizes.items(), key=lambda x: -x[1]):
        print(f"     {c(f'{n:>4}×', C.DIM)} text-{c(size, C.WHITE)}")

    print()
    note("Font weights used:")
    for w, n in sorted(font_weights.items(), key=lambda x: -x[1]):
        print(f"     {c(f'{n:>4}×', C.DIM)} font-{c(w, C.WHITE)}")

    # Check for weights not in a typical set
    common_weights = {"normal", "medium", "semibold", "bold"}
    unusual = {w: n for w, n in font_weights.items() if w not in common_weights and n <= 3}
    if unusual:
        issue("low", "typography",
              f"{len(unusual)} unusual font weights used ≤ 3 times")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 7 — SPACING
# ═══════════════════════════════════════════════════════════════════════

def analyze_spacing(tsx_files: List[Path], report: AuditReport) -> None:
    section("SECTION 7 — Spacing Inconsistencies", C.CYAN)

    arbitrary_padding = []
    arbitrary_margin = []
    arbitrary_gap = []

    for path in tsx_files:
        text = read_file_safe(path)
        rel = str(path)
        for i, line in enumerate(text.splitlines(), 1):
            for m in re.finditer(r"\bp[xytrbl]?-\[([^\]]+)\]", line):
                arbitrary_padding.append((rel, i, m.group(1)))
            for m in re.finditer(r"\bm[xytrbl]?-\[([^\]]+)\]", line):
                arbitrary_margin.append((rel, i, m.group(1)))
            for m in re.finditer(r"\bgap-\[([^\]]+)\]", line):
                arbitrary_gap.append((rel, i, m.group(1)))

    total_arbitrary = len(arbitrary_padding) + len(arbitrary_margin) + len(arbitrary_gap)
    if total_arbitrary:
        issue("med", "spacing",
              f"{total_arbitrary} × arbitrary spacing values")
        if arbitrary_padding:
            print(f"     Padding: {len(arbitrary_padding)}")
            for _, _, v in arbitrary_padding[:5]:
                print(f"       {c(v, C.YELLOW)}")
        if arbitrary_margin:
            print(f"     Margin: {len(arbitrary_margin)}")
        if arbitrary_gap:
            print(f"     Gap: {len(arbitrary_gap)}")
    else:
        ok("No arbitrary spacing values")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 8 — ACCESSIBILITY (design)
# ═══════════════════════════════════════════════════════════════════════

def analyze_a11y(tsx_files: List[Path], report: AuditReport) -> None:
    section("SECTION 8 — Accessibility (design)", C.CYAN)

    small_text = []
    missing_aria_label = []
    clickable_div = []
    focus_styles = []

    for path in tsx_files:
        text = read_file_safe(path)
        rel = str(path)
        for i, line in enumerate(text.splitlines(), 1):
            # Very small text (a11y: below 12px is hard to read)
            for m in re.finditer(r"\btext-\[(\d+)px\]", line):
                px = int(m.group(1))
                if px < 12:
                    small_text.append((rel, i, px))
            # Icon-only buttons should have aria-label
            if re.search(r"<button[^>]*>\s*<[A-Z]", line) and "aria-label" not in line and "title" not in line:
                missing_aria_label.append((rel, i, line.strip()[:100]))
            # div with onClick (should be button)
            if re.search(r"<div[^>]*\sonClick\s*=", line):
                if "role=" not in line:
                    clickable_div.append((rel, i, line.strip()[:100]))

    if small_text:
        issue("med", "a11y",
              f"{len(small_text)} × text smaller than 12px (hard to read)")
        for rel, i, px in small_text[:10]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{i} → {c(f'{px}px', C.RED)}")
    else:
        ok("All text ≥ 12px")

    if missing_aria_label:
        issue("low", "a11y",
              f"{len(missing_aria_label)} × icon-only buttons without aria-label/title")

    if clickable_div:
        issue("med", "a11y",
              f"{len(clickable_div)} × clickable `<div onClick>` without role")
        for rel, i, line in clickable_div[:8]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{i}")
            print(f"       {c(line, C.DIM)}")

    if not (small_text or clickable_div):
        ok("Basic a11y checks passed")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 9 — INLINE STYLES VS TAILWIND
# ═══════════════════════════════════════════════════════════════════════

def analyze_inline_styles(tsx_files: List[Path], report: AuditReport) -> None:
    section("SECTION 9 — Inline Styles vs Tailwind", C.CYAN)

    all_inline = []
    for path in tsx_files:
        text = read_file_safe(path)
        rel = str(path)
        for line, style in extract_inline_styles(text):
            all_inline.append((rel, line, style[:120]))

    if all_inline:
        issue("med", "inline",
              f"{len(all_inline)} × inline `style={{...}}` — prefer Tailwind")
        for rel, line, style in all_inline[:10]:
            short = rel.split("src")[-1].lstrip("\\/")
            print(f"     {c(short, C.DIM)}:{line}")
            print(f"       {c(style, C.DIM)}")
    else:
        ok("No inline styles")

# ═══════════════════════════════════════════════════════════════════════
#  SECTION 10 — COLOR CONTRAST (basic)
# ═══════════════════════════════════════════════════════════════════════

def hex_to_rgb(hex_str: str) -> Optional[Tuple[int, int, int]]:
    h = hex_str.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    if len(h) != 6:
        return None
    try:
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    except ValueError:
        return None

def relative_luminance(rgb: Tuple[int, int, int]) -> float:
    def f(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def contrast_ratio(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    l1 = relative_luminance(c1)
    l2 = relative_luminance(c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def analyze_contrast(css_files: List[Path], report: AuditReport) -> None:
    section("SECTION 10 — Contrast Ratios (WCAG)", C.CYAN)

    # Extract CSS variable values for --color-text and --color-bg
    for path in css_files:
        if "globals" not in path.name.lower():
            continue
        text = read_file_safe(path)

        def var_val(name):
            m = re.search(rf"{re.escape(name)}\s*:\s*([^;]+);", text)
            return m.group(1).strip() if m else None

        # Light mode
        light_text = var_val("--color-text")
        light_bg = var_val("--color-bg")

        # Dark mode (search inside .dark block)
        dark_block = re.search(r"\.dark\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}", text, re.DOTALL)
        dark_text = None
        dark_bg = None
        if dark_block:
            m = re.search(r"--color-text\s*:\s*([^;]+);", dark_block.group(1))
            if m:
                dark_text = m.group(1).strip()
            m = re.search(r"--color-bg\s*:\s*([^;]+);", dark_block.group(1))
            if m:
                dark_bg = m.group(1).strip()

        def try_ratio(text_val, bg_val, label):
            if not text_val or not bg_val:
                return
            # Only handle solid hex or rgba with alpha=1
            tm = re.search(r"#([0-9a-fA-F]{3,8})", text_val)
            bm = re.search(r"#([0-9a-fA-F]{3,8})", bg_val)
            if not tm or not bm:
                return
            t_rgb = hex_to_rgb("#" + tm.group(1))
            b_rgb = hex_to_rgb("#" + bm.group(1))
            if not t_rgb or not b_rgb:
                return
            ratio = contrast_ratio(t_rgb, b_rgb)
            status = "✓" if ratio >= 4.5 else "⚠"
            color = C.GREEN if ratio >= 4.5 else C.YELLOW
            print(f"     {c(status, color)} {label}: {ratio:.2f}:1 "
                  f"({c(text_val, C.DIM)} on {c(bg_val, C.DIM)})")
            if ratio < 4.5:
                report.add("med", "a11y",
                           f"Low contrast in {label}: {ratio:.2f}:1")

        note("Light mode contrast:")
        try_ratio(light_text, light_bg, "text on bg")
        print()
        note("Dark mode contrast:")
        try_ratio(dark_text, dark_bg, "text on bg")

# ═══════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════

def parse_args():
    p = argparse.ArgumentParser(
        description="NUR Lingo — Design Audit",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("path", nargs="?", default=None)
    p.add_argument("--section", default="all",
                   choices=["all", "css", "colors", "themes", "classes",
                            "zindex", "typography", "spacing", "a11y",
                            "inline", "contrast"])
    p.add_argument("--quiet", action="store_true")
    return p.parse_args()

def find_root(hint):
    if hint:
        return Path(hint).resolve()
    here = Path(__file__).resolve().parent
    for cand in [here, *here.parents]:
        if (cand / "package.json").exists():
            return cand
    return here

def main():
    args = parse_args()
    project = find_root(args.path)

    banner("🎨  NUR LINGO — DESIGN AUDIT", C.CYAN)
    print(f"  {c('Project:', C.BOLD)} {project}")
    print(f"  {c('Started:', C.BOLD)} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  {c('Section:', C.BOLD)} {args.section}")

    tsx_files, css_files = find_src_files(project)
    print(f"  {c('TSX files:', C.BOLD)} {len(tsx_files)}")
    print(f"  {c('CSS files:', C.BOLD)} {len(css_files)}")

    report = AuditReport(start_time=datetime.now().isoformat())

    sec = args.section
    if sec in ("all", "css"):
        analyze_css(css_files, report)
    if sec in ("all", "colors"):
        analyze_colors(tsx_files, report)
    if sec in ("all", "themes"):
        analyze_themes(tsx_files, report)
    if sec in ("all", "classes"):
        analyze_classes(project, tsx_files, css_files, report)
    if sec in ("all", "zindex"):
        analyze_zindex(tsx_files, css_files, report)
    if sec in ("all", "typography"):
        analyze_typography(tsx_files, css_files, report)
    if sec in ("all", "spacing"):
        analyze_spacing(tsx_files, report)
    if sec in ("all", "a11y"):
        analyze_a11y(tsx_files, report)
    if sec in ("all", "inline"):
        analyze_inline_styles(tsx_files, report)
    if sec in ("all", "contrast"):
        analyze_contrast(css_files, report)

    # ─── SUMMARY ───────────────────────────────────────────────────
    banner("📊 DESIGN AUDIT REPORT", C.CYAN)
    high = report.by_severity("high")
    med = report.by_severity("med")
    low = report.by_severity("low")

    print(f"  {c('High:', C.RED)}   {len(high)}")
    print(f"  {c('Medium:', C.YELLOW)} {len(med)}")
    print(f"  {c('Low:', C.BLUE)}    {len(low)}")
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
    if low and not args.quiet:
        print(c("  · LOW:", C.BOLD + C.BLUE))
        for i in low[:20]:
            print(f"     • [{i.section}] {i.message}")
        if len(low) > 20:
            print(f"     ... and {len(low) - 20} more")
        print()

    # Save report
    out_dir = project / "design_reports"
    out_dir.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = out_dir / f"design_audit_{ts}.json"
    json_path.write_text(json.dumps({
        "started_at": report.start_time,
        "finished_at": datetime.now().isoformat(),
        "issues": [
            {"severity": i.severity, "section": i.section, "message": i.message,
             "file": i.file, "line": i.line, "detail": i.detail}
            for i in report.issues
        ],
        "summary": {
            "high": len(high), "medium": len(med), "low": len(low),
        },
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"  📄 Report saved: {json_path}")
    print()

    return 0 if not high else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(c("\n⚠ Interrupted", C.YELLOW))
        sys.exit(130)