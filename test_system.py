#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════╗
║           NUR Lingo — Full System Test Suite                         ║
║           Comprehensive local test suite                             ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python test_system.py                          # Full test
    python test_system.py --fast                   # Skip build, only static
    python test_system.py --skip-build             # Skip npm run build
    python test_system.py --skip-dev               # Skip dev server tests
    python test_system.py --port 3000              # Custom port
    python test_system.py C:\\path\\to\\project     # Custom project path

Outputs:
    - Colored console report
    - test_report.json (machine-readable)
    - test_report.txt  (human-readable)

Requirements:
    - Python 3.9+
    - Node.js 18.17+
    - npm
"""

import argparse
import json
import os
import platform
import re
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ═══════════════════════════════════════════════════════════════════════
#  ANSI COLOR HELPERS
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
    BG_RED = "\033[101m"
    BG_GREEN = "\033[102m"
    BG_YELLOW = "\033[103m"

    @staticmethod
    def strip() -> None:
        if not sys.stdout.isatty():
            for attr in dir(C):
                if attr.isupper():
                    setattr(C, attr, "")

C.strip()

def c(text: str, color: str) -> str:
    return f"{color}{text}{C.RESET}"

def banner(text: str, color: str = C.CYAN) -> None:
    width = 72
    print()
    print(c("═" * width, color))
    print(c(f"  {text}", C.BOLD + color))
    print(c("═" * width, color))

def section(num: str, title: str) -> None:
    print()
    print(c(f"┌─ [{num}] {title}", C.BOLD + C.MAGENTA))
    print(c("│", C.MAGENTA))

def ok(msg: str) -> None:
    print(f"  {c('✓', C.GREEN)} {msg}")

def fail(msg: str) -> None:
    print(f"  {c('✗', C.RED)} {msg}")

def warn(msg: str) -> None:
    print(f"  {c('⚠', C.YELLOW)} {msg}")

def info(msg: str) -> None:
    print(f"  {c('ℹ', C.BLUE)} {msg}")

def die(msg: str) -> None:
    print(f"\n{c('FATAL:', C.BG_RED + C.WHITE)} {msg}")
    sys.exit(1)

# ═══════════════════════════════════════════════════════════════════════
#  RESULTS TRACKER
# ═══════════════════════════════════════════════════════════════════════

class Results:
    def __init__(self):
        self.passed: List[str] = []
        self.failed: List[Tuple[str, str]] = []  # (name, reason)
        self.warnings: List[Tuple[str, str]] = []
        self.info: List[str] = []
        self.start_time = datetime.now()

    def add_pass(self, name: str, detail: str = "") -> None:
        self.passed.append(name)
        ok(f"{name}" + (f" — {c(detail, C.DIM)}" if detail else ""))

    def add_fail(self, name: str, reason: str) -> None:
        self.failed.append((name, reason))
        fail(f"{name} — {c(reason, C.DIM)}")

    def add_warn(self, name: str, reason: str) -> None:
        self.warnings.append((name, reason))
        warn(f"{name} — {c(reason, C.DIM)}")

    def add_info(self, msg: str) -> None:
        self.info.append(msg)
        info(msg)

    def summary(self) -> bool:
        elapsed = (datetime.now() - self.start_time).total_seconds()
        print()
        banner("📊 FINAL REPORT", C.CYAN)
        print(f"  {c('Passed:  ', C.GREEN)}{len(self.passed)}")
        print(f"  {c('Failed:  ', C.RED)}{len(self.failed)}")
        print(f"  {c('Warnings:', C.YELLOW)}{len(self.warnings)}")
        print(f"  {c('Elapsed: ', C.BLUE)}{elapsed:.1f}s")
        print()

        if self.failed:
            print(c("  ❌ FAILED CHECKS:", C.BOLD + C.RED))
            for name, reason in self.failed:
                print(f"     • {name}")
                print(f"       {c(reason, C.DIM)}")
            print()

        if self.warnings:
            print(c("  ⚠ WARNINGS:", C.BOLD + C.YELLOW))
            for name, reason in self.warnings[:20]:
                print(f"     • {name}: {c(reason, C.DIM)}")
            if len(self.warnings) > 20:
                print(f"     ... and {len(self.warnings) - 20} more")
            print()

        success = len(self.failed) == 0
        if success:
            print(c("  ✅ SYSTEM READY FOR DEPLOY", C.BOLD + C.BG_GREEN + C.WHITE))
        else:
            print(c("  ❌ SYSTEM HAS FAILURES", C.BOLD + C.BG_RED + C.WHITE))
        print()
        return success

    def to_dict(self) -> Dict[str, Any]:
        return {
            "started_at": self.start_time.isoformat(),
            "finished_at": datetime.now().isoformat(),
            "elapsed_seconds": (datetime.now() - self.start_time).total_seconds(),
            "passed_count": len(self.passed),
            "failed_count": len(self.failed),
            "warning_count": len(self.warnings),
            "passed": self.passed,
            "failed": [{"name": n, "reason": r} for n, r in self.failed],
            "warnings": [{"name": n, "reason": r} for n, r in self.warnings],
            "info": self.info,
        }

# ═══════════════════════════════════════════════════════════════════════
#  SUBPROCESS HELPERS
# ═══════════════════════════════════════════════════════════════════════

IS_WINDOWS = platform.system() == "Windows"

def run_cmd(
    cmd: List[str] | str,
    cwd: Path,
    timeout: int = 300,
    shell: bool = False,
    env: Optional[Dict[str, str]] = None,
) -> Tuple[int, str, str]:
    """Run a command and return (returncode, stdout, stderr)."""
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=shell,
            encoding="utf-8",
            errors="replace",
            env={**os.environ, **(env or {})},
        )
        return proc.returncode, proc.stdout or "", proc.stderr or ""
    except subprocess.TimeoutExpired:
        return -1, "", f"TIMEOUT after {timeout}s"
    except FileNotFoundError as e:
        return -2, "", f"Command not found: {e}"
    except Exception as e:
        return -3, "", f"Error: {e}"

def npm_cmd(args: List[str]) -> List[str]:
    """Return npm command suitable for the platform."""
    return ["npm.cmd" if IS_WINDOWS else "npm", *args]

def npx_cmd(args: List[str]) -> List[str]:
    return ["npx.cmd" if IS_WINDOWS else "npx", *args]

def which(program: str) -> Optional[str]:
    """Cross-platform which()."""
    return shutil.which(program)

# ═══════════════════════════════════════════════════════════════════════
#  1. ENVIRONMENT CHECK
# ═══════════════════════════════════════════════════════════════════════

def check_environment(res: Results) -> None:
    section("1", "Environment Check")

    # Python
    py_ver = sys.version.split()[0]
    if sys.version_info >= (3, 9):
        res.add_pass("Python version", f"{py_ver}")
    else:
        res.add_fail("Python version", f"{py_ver} (need >= 3.9)")

    # Node.js
    code, out, err = run_cmd(["node", "--version"], Path.cwd(), timeout=15)
    if code == 0:
        ver = out.strip()
        m = re.match(r"v(\d+)\.(\d+)\.(\d+)", ver)
        if m:
            major = int(m.group(1))
            if major >= 18:
                res.add_pass("Node.js", ver)
            else:
                res.add_fail("Node.js", f"{ver} (need >= 18)")
        else:
            res.add_pass("Node.js", ver)
    else:
        res.add_fail("Node.js", f"Not found: {err.strip()}")

    # npm
    code, out, err = run_cmd(npm_cmd(["--version"]), Path.cwd(), timeout=15)
    if code == 0:
        res.add_pass("npm", out.strip())
    else:
        res.add_fail("npm", f"Not found: {err.strip()}")

    # git
    code, out, err = run_cmd(["git", "--version"], Path.cwd(), timeout=15)
    if code == 0:
        res.add_pass("git", out.strip())
    else:
        res.add_warn("git", "Not found — some checks will be skipped")

    # OS
    res.add_info(f"OS: {platform.system()} {platform.release()} ({platform.machine()})")

# ═══════════════════════════════════════════════════════════════════════
#  2. PROJECT STRUCTURE
# ═══════════════════════════════════════════════════════════════════════

REQUIRED_FILES = [
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "src/app/curriculum/page.tsx",
    "src/app/dialogues/page.tsx",
    "src/app/dictionary/page.tsx",
    "src/app/garden/page.tsx",
    "src/app/world/page.tsx",
    "src/app/learn/page.tsx",
    "src/app/onboarding/page.tsx",
    "src/app/user-dictionary/page.tsx",
    "src/app/api/validate/route.ts",
    "src/lib/i18n/translations.json",
    "src/lib/i18n/index.ts",
    "src/lib/content/database.ts",
    "src/lib/content/worlds.ts",
    "src/components/ThemeBackground.tsx",
    "src/components/BottomNav.tsx",
    "src/components/Nuri.tsx",
    "public/manifest.json",
]

OPTIONAL_FILES = [
    "next.config.mjs",
    "next.config.ts",
    "src/app/drive-test/page.tsx",
    "src/app/vocab-audio/page.tsx",
    "src/app/admin/audio/page.tsx",
    "src/app/admin/dictionary/page.tsx",
    "src/app/diagnose/page.tsx",
    "public/logo.svg",
    "public/favicon.ico",
    "public/og-image.jpg",
]

def check_structure(project: Path, res: Results) -> None:
    section("2", "Project Structure")

    missing_required = []
    for rel in REQUIRED_FILES:
        p = project / rel
        if p.exists():
            res.add_pass(f"Required file: {rel}")
        else:
            missing_required.append(rel)
            res.add_fail(f"Required file: {rel}", "MISSING")

    for rel in OPTIONAL_FILES:
        p = project / rel
        if p.exists():
            res.add_info(f"Optional file present: {rel}")
        else:
            res.add_warn(f"Optional file: {rel}", "not present (OK)")

# ═══════════════════════════════════════════════════════════════════════
#  3. PACKAGE.JSON VALIDATION
# ═══════════════════════════════════════════════════════════════════════

def check_package_json(project: Path, res: Results) -> None:
    section("3", "package.json")

    pkg_path = project / "package.json"
    try:
        data = json.loads(pkg_path.read_text(encoding="utf-8"))
    except Exception as e:
        res.add_fail("package.json parse", str(e))
        return
    res.add_pass("package.json parse")

    # Engines
    engines = data.get("engines", {})
    if "node" in engines:
        res.add_info(f"engines.node = {engines['node']}")
    else:
        res.add_warn("engines.node", "not set (recommended: '>=18.17.0')")

    # Scripts
    scripts = data.get("scripts", {})
    for script in ["dev", "build", "start", "lint"]:
        if script in scripts:
            res.add_pass(f"npm script '{script}'", scripts[script])
        else:
            res.add_warn(f"npm script '{script}'", "not defined")

    # Core deps
    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
    required_deps = ["next", "react", "react-dom", "typescript"]
    for dep in required_deps:
        if dep in deps:
            res.add_pass(f"dependency '{dep}'", deps[dep])
        else:
            res.add_fail(f"dependency '{dep}'", "missing")

    # node_modules
    if (project / "node_modules").exists():
        nm_count = sum(1 for _ in (project / "node_modules").iterdir())
        res.add_pass("node_modules", f"{nm_count} entries")
    else:
        res.add_fail("node_modules", "not installed — run: npm install")

# ═══════════════════════════════════════════════════════════════════════
#  4. TRANSLATIONS.JSON VALIDATION
# ═══════════════════════════════════════════════════════════════════════

LANGS = ["hy", "en", "ru"]

def check_translations(project: Path, res: Results) -> None:
    section("4", "translations.json")

    tpath = project / "src/lib/i18n/translations.json"
    try:
        raw = tpath.read_text(encoding="utf-8")
        data = json.loads(raw)
    except Exception as e:
        res.add_fail("translations.json parse", str(e))
        return
    res.add_pass("translations.json parse")

    # Check all 3 languages
    for lang in LANGS:
        if lang in data:
            count = len(data[lang])
            res.add_pass(f"Language '{lang}'", f"{count} keys")
        else:
            res.add_fail(f"Language '{lang}'", "MISSING")

    if not all(lang in data for lang in LANGS):
        return

    # Check for duplicate keys (JSON allows, but last wins)
    for lang in LANGS:
        try:
            dupes = find_duplicate_json_keys(raw, lang)
            if dupes:
                res.add_warn(f"Duplicate keys in '{lang}'", ", ".join(dupes[:10]))
            else:
                res.add_pass(f"No duplicate keys in '{lang}'")
        except Exception:
            pass

    # Key parity across langs
    keys_by_lang = {lang: set(data[lang].keys()) for lang in LANGS}
    all_keys = set().union(*keys_by_lang.values())

    for lang in LANGS:
        missing = all_keys - keys_by_lang[lang]
        if missing:
            res.add_fail(
                f"Missing keys in '{lang}'",
                f"{len(missing)} missing (e.g. {', '.join(list(missing)[:5])})"
            )
        else:
            res.add_pass(f"All keys present in '{lang}'")

    # Check for empty string values
    empty_count = 0
    for lang in LANGS:
        for k, v in data[lang].items():
            if not isinstance(v, str) or v.strip() == "":
                empty_count += 1
    if empty_count:
        res.add_warn("Empty translation values", f"{empty_count} empty values")
    else:
        res.add_pass("No empty translation values")

    # Check specific critical keys
    critical = [
        "page_loading", "page_settings", "page_save", "page_cancel",
        "BottomNav_home", "BottomNav_world", "page_curriculum",
        "dialogues_title", "onboarding_next",
    ]
    for key in critical:
        present = all(key in data[lang] for lang in LANGS)
        if present:
            res.add_pass(f"Critical key: {key}")
        else:
            res.add_fail(f"Critical key: {key}", "missing in some language")

def find_duplicate_json_keys(raw: str, lang: str) -> List[str]:
    """Detect duplicate keys inside a specific language block (best-effort)."""
    # Extract block between "lang": { ... }
    pattern = rf'"{lang}"\s*:\s*\{{(.*?)\n\s*\}}\s*(?:,|\}})'
    m = re.search(pattern, raw, re.DOTALL)
    if not m:
        return []
    block = m.group(1)
    keys = re.findall(r'"([^"]+)"\s*:', block)
    seen = set()
    dupes = []
    for k in keys:
        if k in seen:
            dupes.append(k)
        seen.add(k)
    return dupes

# ═══════════════════════════════════════════════════════════════════════
#  5. KEY USAGE — cross-check translations vs code
# ═══════════════════════════════════════════════════════════════════════

def check_key_usage(project: Path, res: Results) -> None:
    section("5", "Translation Key Usage")

    tpath = project / "src/lib/i18n/translations.json"
    try:
        data = json.loads(tpath.read_text(encoding="utf-8"))
    except Exception:
        return

    defined = set(data.get("hy", {}).keys())

    # Scan source files for t("...") / t('...')
    src_dir = project / "src"
    used = set()
    pattern = re.compile(r'\bt\(\s*["\']([a-zA-Z0-9_\.]+)["\']')
    for ext in ("*.ts", "*.tsx"):
        for path in src_dir.rglob(ext):
            try:
                content = path.read_text(encoding="utf-8", errors="replace")
                for m in pattern.finditer(content):
                    used.add(m.group(1))
            except Exception:
                pass

    res.add_info(f"Defined keys: {len(defined)}")
    res.add_info(f"Used in code: {len(used)}")

    missing = sorted(used - defined)
    if missing:
        res.add_warn(
            f"{len(missing)} keys used in code but not in translations.json",
            ", ".join(missing[:15]) + (" ..." if len(missing) > 15 else "")
        )
    else:
        res.add_pass("All used keys defined")

    unused = sorted(defined - used)
    if unused:
        res.add_info(f"{len(unused)} keys defined but not used (OK)")

# ═══════════════════════════════════════════════════════════════════════
#  6. TYPESCRIPT CHECK
# ═══════════════════════════════════════════════════════════════════════

def check_typescript(project: Path, res: Results) -> None:
    section("6", "TypeScript Check (tsc --noEmit)")

    print(c("  ▶ Running npx tsc --noEmit ... (this may take a minute)", C.DIM))
    code, out, err = run_cmd(
        npx_cmd(["tsc", "--noEmit"]),
        project,
        timeout=600,
        shell=IS_WINDOWS,
    )

    combined = (out + "\n" + err).strip()
    if code == 0:
        res.add_pass("TypeScript compilation", "0 errors")
    else:
        # Extract error lines
        error_lines = [
            l for l in combined.splitlines()
            if "error TS" in l or l.strip().startswith("src/")
        ]
        count = sum(1 for l in combined.splitlines() if "error TS" in l)
        res.add_fail("TypeScript compilation", f"{count} errors")
        for l in error_lines[:15]:
            print(f"     {c(l.strip(), C.RED)}")
        if len(error_lines) > 15:
            print(f"     ... and {len(error_lines) - 15} more")

# ═══════════════════════════════════════════════════════════════════════
#  7. ESLINT
# ═══════════════════════════════════════════════════════════════════════

def check_eslint(project: Path, res: Results) -> None:
    section("7", "ESLint")

    # Only run if eslint config exists
    has_config = any(
        (project / f).exists()
        for f in [".eslintrc.json", ".eslintrc.js", ".eslintrc.cjs", "eslint.config.js"]
    )
    if not has_config:
        res.add_info("No ESLint config found — skipping")
        return

    print(c("  ▶ Running npx next lint ...", C.DIM))
    code, out, err = run_cmd(
        npx_cmd(["next", "lint"]),
        project,
        timeout=300,
        shell=IS_WINDOWS,
    )

    combined = (out + "\n" + err).strip()
    if code == 0:
        res.add_pass("ESLint")
    else:
        warnings = combined.count("Warning")
        errors = combined.count("Error")
        if errors > 0:
            res.add_fail("ESLint", f"{errors} errors, {warnings} warnings")
        elif warnings > 0:
            res.add_warn("ESLint", f"{warnings} warnings")
        else:
            res.add_fail("ESLint", "failed")

# ═══════════════════════════════════════════════════════════════════════
#  8. CONTENT DATABASE CHECK
# ═══════════════════════════════════════════════════════════════════════

def check_content_db(project: Path, res: Results) -> None:
    section("8", "Content Database")

    # Worlds
    worlds_path = project / "src/lib/content/worlds.ts"
    if worlds_path.exists():
        content = worlds_path.read_text(encoding="utf-8", errors="replace")
        world_count = len(re.findall(r'\bid:\s*["\']world', content))
        if world_count == 0:
            world_count = len(re.findall(r'\bid:\s*["\']', content))
        res.add_info(f"Worlds detected: {world_count}")
        if world_count >= 10:
            res.add_pass("Worlds count", f"{world_count}")
        else:
            res.add_warn("Worlds count", f"{world_count} (expected 10+)")

    # Lessons
    db_path = project / "src/lib/content/database.ts"
    if db_path.exists():
        content = db_path.read_text(encoding="utf-8", errors="replace")
        if "CONTENT_LESSONS" in content:
            res.add_pass("CONTENT_LESSONS export present")
        else:
            res.add_fail("CONTENT_LESSONS", "not found in database.ts")

    # Driving test data
    drive_dir = project / "src/app/drive-test"
    if drive_dir.exists():
        res.add_pass("Drive-test directory present")
    else:
        res.add_warn("Drive-test directory", "missing")

# ═══════════════════════════════════════════════════════════════════════
#  9. BUILD
# ═══════════════════════════════════════════════════════════════════════

def check_build(project: Path, res: Results) -> None:
    section("9", "Production Build (npm run build)")

    # Clean
    next_dir = project / ".next"
    if next_dir.exists():
        print(c("  ▶ Cleaning .next ...", C.DIM))
        shutil.rmtree(next_dir, ignore_errors=True)

    print(c("  ▶ Running npm run build ... (this may take 1-3 minutes)", C.DIM))
    start = time.time()
    code, out, err = run_cmd(
        npm_cmd(["run", "build"]),
        project,
        timeout=900,
        shell=IS_WINDOWS,
    )
    elapsed = time.time() - start
    combined = (out + "\n" + err).strip()

    if code == 0:
        res.add_pass("Production build", f"{elapsed:.1f}s")
        # Show route table
        in_routes = False
        for line in combined.splitlines():
            if "Route (app)" in line or "Route (pages)" in line:
                in_routes = True
            if in_routes:
                print(f"     {c(line, C.DIM)}")
            if in_routes and line.strip() == "" and "Route" not in combined[-100:]:
                break
    else:
        res.add_fail("Production build", f"exit code {code}")
        tail = combined.splitlines()[-30:]
        for line in tail:
            print(f"     {c(line, C.RED)}")

# ═══════════════════════════════════════════════════════════════════════
#  10. DEV SERVER + HTTP TESTS
# ═══════════════════════════════════════════════════════════════════════

class DevServer:
    def __init__(self, project: Path, port: int):
        self.project = project
        self.port = port
        self.proc: Optional[subprocess.Popen] = None
        self.base_url = f"http://localhost:{port}"

    def start(self, timeout: int = 120) -> bool:
        print(c(f"  ▶ Starting dev server on port {self.port} ...", C.DIM))

        env = {**os.environ, "PORT": str(self.port), "NODE_ENV": "development"}

        if IS_WINDOWS:
            self.proc = subprocess.Popen(
                ["npm.cmd", "run", "dev"],
                cwd=str(self.project),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=env,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
            )
        else:
            self.proc = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=str(self.project),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=env,
                preexec_fn=os.setsid,
            )

        # Wait for server
        start = time.time()
        while time.time() - start < timeout:
            if self._is_up():
                print(c(f"  ✓ Dev server ready in {time.time() - start:.1f}s", C.GREEN))
                return True
            time.sleep(1)

        print(c(f"  ✗ Dev server failed to start within {timeout}s", C.RED))
        return False

    def _is_up(self) -> bool:
        try:
            req = urllib.request.Request(self.base_url, method="HEAD")
            with urllib.request.urlopen(req, timeout=2):
                return True
        except Exception:
            return False

    def stop(self) -> None:
        if not self.proc:
            return
        try:
            if IS_WINDOWS:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(self.proc.pid)],
                    capture_output=True,
                    timeout=10,
                )
            else:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
        except Exception:
            pass
        try:
            self.proc.wait(timeout=5)
        except Exception:
            pass
        print(c("  ✓ Dev server stopped", C.DIM))


PAGES_TO_TEST = [
    ("/", "Home"),
    ("/world", "World"),
    ("/curriculum", "Curriculum"),
    ("/dialogues", "Dialogues"),
    ("/dictionary", "Dictionary"),
    ("/user-dictionary", "User Dictionary"),
    ("/garden", "Garden"),
    ("/onboarding", "Onboarding"),
    ("/learn", "Learn"),
    ("/vocab-audio", "Vocab Audio"),
    ("/drive-test", "Drive Test"),
    ("/admin/audio", "Admin Audio"),
    ("/admin/dictionary", "Admin Dictionary"),
    ("/diagnose", "Diagnose"),
]

API_ENDPOINTS_GET = [
    ("/api/lexicon", "Lexicon (GET)"),
    ("/api/credits", "Credits (GET)"),
    ("/api/diagnose", "Diagnose (GET)"),
]

STATIC_ASSETS = [
    ("/manifest.json", "manifest.json"),
    ("/logo.svg", "logo.svg"),
    ("/favicon.ico", "favicon.ico"),
    ("/og-image.jpg", "og-image.jpg"),
]


def http_get(url: str, timeout: int = 15) -> Tuple[int, int, str]:
    """Return (status_code, size_bytes, error)."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "NURLingoTestSuite/1.0"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            return resp.status, len(data), ""
    except urllib.error.HTTPError as e:
        return e.code, 0, f"HTTP {e.code}"
    except Exception as e:
        return 0, 0, str(e)


def http_post(url: str, body: Dict[str, Any], timeout: int = 15) -> Tuple[int, bytes, str]:
    """Return (status_code, response_bytes, error)."""
    try:
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "NURLingoTestSuite/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read(), ""
    except urllib.error.HTTPError as e:
        return e.code, e.read() if hasattr(e, "read") else b"", f"HTTP {e.code}"
    except Exception as e:
        return 0, b"", str(e)


def check_http(server: DevServer, res: Results) -> None:
    section("10", "HTTP Tests (Pages)")

    # Pages in parallel
    results_map: Dict[str, Tuple[int, int, str]] = {}
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(http_get, f"{server.base_url}{path}"): (path, name)
            for path, name in PAGES_TO_TEST
        }
        for fut in as_completed(futures):
            path, name = futures[fut]
            try:
                status, size, err = fut.result()
                results_map[path] = (status, size, err)
            except Exception as e:
                results_map[path] = (0, 0, str(e))

    for path, name in PAGES_TO_TEST:
        status, size, err = results_map.get(path, (0, 0, "no result"))
        if status == 200:
            res.add_pass(f"Page {path}", f"{name} ({size:,} bytes)")
        elif status == 404:
            res.add_warn(f"Page {path}", f"{name} — 404 (may not exist)")
        else:
            res.add_fail(f"Page {path}", f"{name} — {err or f'HTTP {status}'}")

    section("10b", "HTTP Tests (Static Assets)")
    for path, name in STATIC_ASSETS:
        status, size, err = http_get(f"{server.base_url}{path}", timeout=10)
        if status == 200:
            res.add_pass(f"Asset {path}", f"{size:,} bytes")
        else:
            res.add_warn(f"Asset {path}", f"{name} — {err or f'HTTP {status}'}")

    section("10c", "HTTP Tests (API GET)")
    for path, name in API_ENDPOINTS_GET:
        status, size, err = http_get(f"{server.base_url}{path}", timeout=15)
        if status in (200, 204):
            res.add_pass(f"API {path}", name)
        elif status == 404:
            res.add_warn(f"API {path}", f"{name} — 404 (not implemented)")
        else:
            res.add_warn(f"API {path}", f"{name} — {err or f'HTTP {status}'}")

    section("10d", "API POST — /api/validate")

    test_cases = [
        {
            "name": "Exact match (correct)",
            "body": {
                "userAnswer": "բարև",
                "expectedAnswer": "բարև",
                "exerciseType": "fill_in",
                "useAI": False,
            },
            "expect_accepted": True,
        },
        {
            "name": "Exact match (wrong)",
            "body": {
                "userAnswer": "ցտեսություն",
                "expectedAnswer": "բարև",
                "exerciseType": "fill_in",
                "useAI": False,
            },
            "expect_accepted": False,
        },
        {
            "name": "Empty answer (should reject)",
            "body": {
                "userAnswer": "",
                "expectedAnswer": "բարև",
                "exerciseType": "fill_in",
                "useAI": False,
            },
            "expect_accepted": False,
        },
        {
            "name": "Punctuation-only (should reject)",
            "body": {
                "userAnswer": "...",
                "expectedAnswer": "բարև",
                "exerciseType": "fill_in",
                "useAI": False,
            },
            "expect_accepted": False,
        },
        {
            "name": "Case insensitive",
            "body": {
                "userAnswer": "ԲԱՐԵՎ",
                "expectedAnswer": "բարև",
                "exerciseType": "fill_in",
                "useAI": False,
            },
            "expect_accepted": True,
        },
        {
            "name": "Word order — correct",
            "body": {
                "userAnswer": "ես սիրում եմ",
                "expectedAnswer": "ես սիրում եմ",
                "exerciseType": "word_order",
                "useAI": False,
            },
            "expect_accepted": True,
        },
        {
            "name": "Word order — wrong order",
            "body": {
                "userAnswer": "սիրում եմ ես",
                "expectedAnswer": "ես սիրում եմ",
                "exerciseType": "word_order",
                "useAI": False,
            },
            "expect_accepted": False,
        },
        {
            "name": "Multiple choice — correct",
            "body": {
                "userAnswer": "a",
                "expectedAnswer": "a",
                "options": ["a", "b", "c"],
                "exerciseType": "multiple_choice",
                "useAI": False,
            },
            "expect_accepted": True,
        },
        {
            "name": "Multiple choice — wrong option",
            "body": {
                "userAnswer": "b",
                "expectedAnswer": "a",
                "options": ["a", "b", "c"],
                "exerciseType": "multiple_choice",
                "useAI": False,
            },
            "expect_accepted": False,
        },
    ]

    for tc in test_cases:
        status, body_bytes, err = http_post(
            f"{server.base_url}/api/validate", tc["body"], timeout=20
        )
        name = tc["name"]

        if status != 200:
            res.add_fail(f"validate: {name}", f"HTTP {status} {err}")
            continue

        try:
            result = json.loads(body_bytes.decode("utf-8"))
        except Exception as e:
            res.add_fail(f"validate: {name}", f"invalid JSON: {e}")
            continue

        accepted = bool(result.get("accepted"))
        expected = tc["expect_accepted"]
        if accepted == expected:
            res.add_pass(f"validate: {name}", f"accepted={accepted}")
        else:
            res.add_fail(
                f"validate: {name}",
                f"expected accepted={expected}, got {accepted} — {result.get('feedback', '')}",
            )

    # Legacy mode test
    status, body_bytes, err = http_post(
        f"{server.base_url}/api/validate",
        {"userAnswer": "բարև", "expectedAnswer": "բարև", "legacy": True},
        timeout=20,
    )
    if status == 200:
        try:
            result = json.loads(body_bytes.decode("utf-8"))
            if result.get("accepted") is True:
                res.add_pass("validate: legacy mode", "accepted")
            else:
                res.add_fail("validate: legacy mode", "not accepted")
        except Exception:
            res.add_fail("validate: legacy mode", "invalid JSON")
    else:
        res.add_fail("validate: legacy mode", f"HTTP {status}")

    # Bad JSON body
    try:
        req = urllib.request.Request(
            f"{server.base_url}/api/validate",
            data=b"not-json",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (400, 500):
                res.add_pass("validate: bad JSON", f"HTTP {resp.status}")
            else:
                res.add_fail("validate: bad JSON", f"HTTP {resp.status} (expected 400)")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            res.add_pass("validate: bad JSON", "HTTP 400")
        else:
            res.add_fail("validate: bad JSON", f"HTTP {e.code}")
    except Exception as e:
        res.add_fail("validate: bad JSON", str(e))

# ═══════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="NUR Lingo — Full System Test Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "project",
        nargs="?",
        default=None,
        help="Path to project root (default: script's parent directory)",
    )
    parser.add_argument("--port", type=int, default=3000, help="Dev server port")
    parser.add_argument("--skip-build", action="store_true", help="Skip npm run build")
    parser.add_argument("--skip-dev", action="store_true", help="Skip dev server tests")
    parser.add_argument("--skip-lint", action="store_true", help="Skip ESLint")
    parser.add_argument("--skip-tsc", action="store_true", help="Skip TypeScript check")
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Skip build, lint, tsc, dev server — only static checks",
    )
    return parser.parse_args()


def find_project_root(hint: Optional[str]) -> Path:
    if hint:
        p = Path(hint).resolve()
        if not p.exists():
            die(f"Project path does not exist: {p}")
        return p

    # Default: script's own directory, or walk up to find package.json
    here = Path(__file__).resolve().parent
    for cand in [here, *here.parents]:
        if (cand / "package.json").exists():
            return cand
    die(f"No package.json found from {here} upward")


def main() -> int:
    args = parse_args()
    project = find_project_root(args.project)

    banner("🐿️  NUR LINGO — SYSTEM TEST SUITE", C.CYAN)
    print(f"  {c('Project:', C.BOLD)} {project}")
    print(f"  {c('Started:', C.BOLD)} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  {c('Mode:   ', C.BOLD)} {'FAST (static only)' if args.fast else 'FULL'}")

    res = Results()
    os.chdir(project)

    # 1. Environment
    check_environment(res)

    # 2. Structure
    check_structure(project, res)

    # 3. package.json
    check_package_json(project, res)

    # 4. translations.json
    check_translations(project, res)

    # 5. Key usage
    check_key_usage(project, res)

    # 6. TypeScript
    if not args.fast and not args.skip_tsc:
        check_typescript(project, res)
    else:
        info("Skipping TypeScript check")

    # 7. ESLint
    if not args.fast and not args.skip_lint:
        check_eslint(project, res)
    else:
        info("Skipping ESLint")

    # 8. Content DB
    check_content_db(project, res)

    # 9. Build
    if not args.fast and not args.skip_build:
        check_build(project, res)
    else:
        info("Skipping production build")

    # 10. Dev server + HTTP
    server = None
    if not args.fast and not args.skip_dev:
        server = DevServer(project, args.port)
        try:
            if server.start():
                check_http(server, res)
            else:
                res.add_fail("Dev server", "failed to start")
        finally:
            server.stop()
    else:
        info("Skipping dev server tests")

    # Report
    success = res.summary()

    # Save reports
    report_dir = project / "test_reports"
    report_dir.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    json_path = report_dir / f"test_report_{ts}.json"
    txt_path = report_dir / f"test_report_{ts}.txt"

    json_path.write_text(
        json.dumps(res.to_dict(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    # Text report
    lines = []
    lines.append("=" * 72)
    lines.append("  NUR LINGO — TEST REPORT")
    lines.append("=" * 72)
    lines.append(f"Project:  {project}")
    lines.append(f"Date:     {datetime.now().isoformat()}")
    lines.append(f"Elapsed:  {res.to_dict()['elapsed_seconds']:.1f}s")
    lines.append("")
    lines.append(f"Passed:   {len(res.passed)}")
    lines.append(f"Failed:   {len(res.failed)}")
    lines.append(f"Warnings: {len(res.warnings)}")
    lines.append("")
    if res.failed:
        lines.append("FAILED:")
        for name, reason in res.failed:
            lines.append(f"  ✗ {name}")
            lines.append(f"    {reason}")
        lines.append("")
    if res.warnings:
        lines.append("WARNINGS:")
        for name, reason in res.warnings:
            lines.append(f"  ⚠ {name}: {reason}")
        lines.append("")
    txt_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"  📄 JSON report: {json_path}")
    print(f"  📄 Text report: {txt_path}")
    print()

    return 0 if success else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(c("\n\n⚠ Interrupted by user", C.YELLOW))
        sys.exit(130)