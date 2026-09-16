#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 NUR Lingo – Dictionary Data Source & Ordering Diagnostic
=============================================================
Finds where the dictionary page gets its data and why the order differs
from the JSON dictionary files.

USAGE:
    python scripts/diagnose_dictionary_order.py
"""

import os
import re
import json
import ast
from pathlib import Path

PROJECT_ROOT = Path.cwd()
DICT_PAGE_PATHS = [
    PROJECT_ROOT / "src/app/dictionary/page.tsx",
    PROJECT_ROOT / "src/app/dictionary/page.tsx",
    PROJECT_ROOT / "src/components/Dictionary.tsx",
    PROJECT_ROOT / "src/components/DictionaryPage.tsx",
]
DATA_SOURCES = {}

def find_file_imports(file_path):
    """Extract import statements from a TSX/TS file"""
    if not file_path.exists():
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    imports = {}
    # Match import statements: import { X } from "y" or import X from "y"
    pattern = r'import\s*\{([^}]+)\}\s*from\s*["\']([^"\']+)["\']'
    for match in re.findall(pattern, content):
        names = [n.strip() for n in match[0].split(",")]
        module = match[1]
        for name in names:
            imports[name] = module
    # Also check default imports
    default_pattern = r'import\s+(\w+)\s+from\s*["\']([^"\']+)["\']'
    for match in re.findall(default_pattern, content):
        imports[match[0]] = match[1]
    return imports

def find_used_data_source(imports):
    """Given imports dict, identify likely data sources"""
    candidates = {}
    for var, module in imports.items():
        if "CONTENT_LESSONS" in var or "LEXICON" in var or "dictionary" in var.lower():
            # Resolve module path to absolute file
            # e.g. "@/lib/content/database" -> src/lib/content/database.ts
            module_path = module.replace("@/", "src/")
            if not module_path.endswith((".ts", ".tsx", ".js", ".jsx")):
                module_path += ".ts"
            full_path = PROJECT_ROOT / module_path
            if full_path.exists():
                candidates[var] = full_path
            else:
                # Try .tsx, .js
                for ext in [".tsx", ".js", ".jsx"]:
                    alt = full_path.with_suffix(ext)
                    if alt.exists():
                        candidates[var] = alt
                        break
    return candidates

def get_first_entries_from_file(file_path, var_name=None):
    """Extract first few items from a data source file.
       Assumes the file exports an array-like object (list, or array from function).
       For simplicity, we'll look for 'export const CONTENT_LESSONS' or 'export const LEXICON'.
    """
    if not file_path.exists():
        return None
    content = file_path.read_text(encoding="utf-8")
    # Find the exported variable definition
    if var_name:
        pattern = rf'export\s+const\s+{var_name}\s*=\s*(\[.*?\]|{{.*?}});'
    else:
        pattern = r'export\s+const\s+(\w+)\s*=\s*(\[.*?\]|{{.*?}});'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        # Maybe it's from a function like buildWorld2()? We'll skip complex cases.
        return "Could not find direct export array."
    # For simplicity, we'll just print the beginning of the value string
    start = match.start(2)
    end = match.end(2)
    snippet = content[start:end]
    # Try to parse as JSON-like (replace single quotes)
    # Actually it's TypeScript, may contain comments, functions.
    # We'll just return the first 500 chars for inspection.
    return snippet[:500] + "..."

def main():
    print("🔍 NUR Lingo – Dictionary Data Source Diagnostic")
    print("=" * 60)

    # 1. Find dictionary page
    dict_page = None
    for p in DICT_PAGE_PATHS:
        if p.exists():
            dict_page = p
            break
    if not dict_page:
        print("❌ Could not find dictionary page at expected locations.")
        print("   Searched in:")
        for p in DICT_PAGE_PATHS:
            print(f"     {p}")
        return

    print(f"📄 Dictionary page found: {dict_page}")
    print("\n📦 Analyzing imports...")
    imports = find_file_imports(dict_page)
    if not imports:
        print("   No imports found?")
    else:
        print("   Imports:")
        for var, mod in imports.items():
            print(f"      {var} <- {mod}")

    # 2. Identify data source used
    data_sources = find_used_data_source(imports)
    if not data_sources:
        print("\n⚠️  Could not identify a clear data source from imports.")
        print("   Looking for direct usage of CONTENT_LESSONS or LEXICON...")
        # Search for known patterns in the file itself
        content = dict_page.read_text(encoding="utf-8")
        if "CONTENT_LESSONS" in content:
            print("   Found CONTENT_LESSONS in page code.")
            # Try to locate its import
            for var, mod in imports.items():
                if mod.endswith("database") or "database" in mod:
                    if "CONTENT_LESSONS" in var:
                        data_sources[var] = PROJECT_ROOT / mod.replace("@/", "src/") + ".ts"
        elif "LEXICON" in content:
            for var, mod in imports.items():
                if "lexicon" in mod:
                    data_sources[var] = PROJECT_ROOT / mod.replace("@/", "src/") + ".ts"
        elif "dictionary" in content.lower():
            for var, mod in imports.items():
                if "dictionary" in mod.lower():
                    data_sources[var] = PROJECT_ROOT / mod.replace("@/", "src/") + ".ts"

    if not data_sources:
        print("\n❌ Could not determine data source. Please check the dictionary page manually.")
        return

    print("\n🔎 Data sources found:")
    for var, path in data_sources.items():
        print(f"   {var} -> {path}")

    # 3. Inspect first entries from each source
    print("\n📊 First entries from each data source:")
    for var, path in data_sources.items():
        print(f"\n   --- {var} ({path.name}) ---")
        snippet = get_first_entries_from_file(path, var)
        if snippet:
            print(snippet)
        else:
            print("   (Could not extract entries)")

    # 4. Check JSON dictionary files
    json_paths = [
        PROJECT_ROOT / "data/dictionaries/dictionary.json",
        PROJECT_ROOT / "data/dictionaries/master-dictionary.json",
    ]
    print("\n📂 JSON dictionary files:")
    for jp in json_paths:
        if jp.exists():
            with open(jp, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                first_item = data[0] if data else None
            elif isinstance(data, dict):
                first_key = next(iter(data.keys())) if data else None
                first_item = data.get(first_key) if first_key else None
            else:
                first_item = None
            print(f"   {jp.name}: first item = {first_item}")
        else:
            print(f"   {jp.name}: NOT FOUND")

    # 5. Check manifest.json (not relevant for ordering but check)
    manifest_path = PROJECT_ROOT / "public/audio/manifest.json"
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        print(f"\n📄 Manifest.json: {len(manifest)} entries, numeric IDs, does not affect order.")

    print("\n💡 Conclusion:")
    print("   The dictionary page likely uses a data source that starts with 'hello' (e.g., CONTENT_LESSONS from database.ts).")
    print("   The JSON dictionary files start with 'the' because they are sorted alphabetically or have a different order.")
    print("   To change the dictionary page order, you need to sort the source data accordingly.")

    # Optional: suggest next steps
    print("\n🔧 Suggested actions:")
    print("   1. If you want the page to start with 'the', sort the vocabulary alphabetically before rendering.")
    print("   2. If you want to use the JSON files as source, modify the dictionary page to import from those JSON files instead.")

if __name__ == "__main__":
    main()