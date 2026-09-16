# fix_build_errors.py
"""
NUR Lingo Build Error Fixer
Ավտոմատ շտկում է build-ի սխալները
"""

import os
import re
import json
from pathlib import Path
from typing import List, Tuple

# ─── ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ ──────────────────────────────────────────────────

SRC_DIR = "src"
APP_DIR = os.path.join(SRC_DIR, "app")
LIBS_DIR = os.path.join(SRC_DIR, "lib")

# ─── ՇՏԿՄԱՆ ԿԱՆՈՆՆԵՐ ──────────────────────────────────────────────

FIXES = [
    # 1. WAV_VOICES - հեռացնել import-ից
    {
        "pattern": r'from\s+["\']@/lib/audio/WavClient["\']\s+import\s*\{[^}]*WAV_VOICES[^}]*\}',
        "replacement": 'from "@/lib/audio/WavClient"',
        "files": ["**/dictionary/page.tsx", "**/user-dictionary/page.tsx"],
        "description": "Remove WAV_VOICES from import"
    },
    # 2. showMessage - փոխարինել useNuri-ում
    {
        "pattern": r'const\s*\{\s*setPage,\s*showMessage\s*\}\s*=\s*useNuri\(\)',
        "replacement": 'const { setPage } = useNuri()',
        "files": ["**/curriculum/page.tsx", "**/dialogues/page.tsx", "**/garden/page.tsx", "**/vocab-audio/page.tsx", "**/world/page.tsx"],
        "description": "Remove showMessage from useNuri destructuring"
    },
    # 3. Star import - ավելացնել
    {
        "pattern": r'from\s+["\']lucide-react["\']\s+import\s*\{([^}]*)\}',
        "replacement": 'from "lucide-react" import {\\1, Star, Heart, Music, Bookmark, BookmarkCheck }',
        "files": ["**/curriculum/page.tsx", "**/dialogues/page.tsx"],
        "description": "Add missing Star, Heart, Music imports"
    },
    # 4. showMessage?.() - փոխարինել showMessage()
    {
        "pattern": r'showMessage\?\.\(([^)]*)\)',
        "replacement": 'showMessage(\\1)',
        "files": ["**/curriculum/page.tsx", "**/dialogues/page.tsx", "**/garden/page.tsx", "**/vocab-audio/page.tsx"],
        "description": "Remove optional chaining from showMessage"
    },
]

# ─── ՖՈՒՆԿՑԻԱՆԵՐ ──────────────────────────────────────────────────────

def find_files(pattern: str, root_dir: str = ".") -> List[str]:
    """Գտնել բոլոր ֆայլերը pattern-ով"""
    matches = []
    for root, dirs, files in os.walk(root_dir):
        # Բաց թողնել node_modules, .next, .git
        dirs[:] = [d for d in dirs if d not in ["node_modules", ".next", ".git", "dist", "build"]]
        
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                full_path = os.path.join(root, file)
                # Ստուգել pattern-ը
                if pattern == "**/*.tsx" or pattern == "**/*.ts":
                    matches.append(full_path)
                elif pattern.replace("**/", "") in full_path:
                    matches.append(full_path)
    return matches

def find_files_by_patterns(patterns: List[str]) -> List[str]:
    """Գտնել բոլոր ֆայլերը patterns-ով"""
    all_files = []
    for pattern in patterns:
        files = find_files(pattern)
        all_files.extend(files)
    return list(set(all_files))

def fix_file(file_path: str, fix_rules: List[dict]) -> Tuple[bool, List[str]]:
    """Շտկել ֆայլը fix_rules-ով"""
    changes = []
    modified = False
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Cannot read {file_path}: {e}")
        return False, changes
    
    original_content = content
    
    for rule in fix_rules:
        pattern = rule.get("pattern")
        replacement = rule.get("replacement")
        
        if not pattern or not replacement:
            continue
        
        # Ստուգել արդյոք pattern-ը համապատասխանում է
        if not re.search(pattern, content, re.MULTILINE | re.DOTALL):
            continue
        
        # Կատարել փոխարինում
        new_content, count = re.subn(
            pattern,
            replacement,
            content,
            flags=re.MULTILINE | re.DOTALL
        )
        
        if count > 0:
            content = new_content
            modified = True
            changes.append(f"  ✅ {rule.get('description', 'Fixed')} ({count} changes)")
            print(f"  ✅ {rule.get('description', 'Fixed')} ({count} changes)")
    
    if modified:
        # Պահել փոփոխությունները
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Saved: {file_path}")
        except Exception as e:
            print(f"❌ Cannot save {file_path}: {e}")
            return False, changes
    
    return modified, changes

def add_local_show_message(file_path: str) -> bool:
    """Ավելացնել local showMessage ֆունկցիա"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return False
    
    # Ստուգել արդյոք արդեն կա
    if "const showMessage = useCallback" in content:
        return False
    
    # Գտնել useState import-ը
    if "useState" not in content:
        return False
    
    # Գտնել return-ից առաջ ավելացնել
    return_pattern = r'(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)'
    if not re.search(return_pattern, content):
        return False
    
    # Ավելացնել showMessage
    show_msg_code = '''
  
  // ─── LOCAL SHOW MESSAGE ─────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
'''
    
    # Ավելացնել useState import-ը, եթե չկա
    if "useState" not in content:
        content = content.replace(
            "from 'react'",
            "from 'react'\nimport { useState, useCallback } from 'react'"
        )
    
    # Ավելացնել showMessage
    content = re.sub(
        return_pattern,
        r'\1' + show_msg_code,
        content,
        flags=re.DOTALL
    )
    
    # Ավելացնել Toast component
    toast_component = '''
  
      {/* ─── TOAST MESSAGE ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${
              toastType === "success"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : toastType === "error"
                ? "border-red-500/30 text-red-600 dark:text-red-400"
                : "border-blue-500/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
'''
    
    # Գտնել return-ը և ավելացնել Toast-ը
    return_pattern = r'(return\s*\()'
    if re.search(return_pattern, content):
        content = re.sub(
            return_pattern,
            r'\1' + toast_component,
            content,
            count=1
        )
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Added showMessage to: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Cannot save {file_path}: {e}")
        return False

# ─── ՀԻՄՆԱԿԱՆ ՖՈՒՆԿՑԻԱ ─────────────────────────────────────────────

def main():
    print("=" * 60)
    print("🔧 NUR Lingo - Build Error Fixer")
    print("=" * 60)
    
    # ─── 1. ՈՒՂՂԵԼ WAV_VOICES ──────────────────────────────────────
    print("\n📁 Fixing WAV_VOICES imports...")
    
    files = find_files_by_patterns(["**/dictionary/page.tsx", "**/user-dictionary/page.tsx"])
    
    for file_path in files:
        print(f"\n📄 {file_path}")
        
        # Import-ի շտկում
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Հեռացնել WAV_VOICES-ը import-ից
        new_content = re.sub(
            r'import\s*\{[^}]*WAV_VOICES[^}]*\}\s*from\s*["\']@/lib/audio/WavClient["\']',
            'import { getWavClient, WavClient } from "@/lib/audio/WavClient"',
            content
        )
        
        # Եթե WavClient-ը չի օգտագործվում որպես տիպ, հեռացնել
        if "WavClient" in new_content and not "WavClient" in new_content:
            new_content = new_content.replace("WavClient, ", "")
            new_content = new_content.replace(", WavClient", "")
        
        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("  ✅ Fixed import")
    
    # ─── 2. ՈՒՂՂԵԼ showMessage ──────────────────────────────────────
    print("\n📁 Fixing showMessage issues...")
    
    show_msg_files = find_files_by_patterns([
        "**/curriculum/page.tsx",
        "**/dialogues/page.tsx",
        "**/garden/page.tsx",
        "**/vocab-audio/page.tsx",
        "**/world/page.tsx"
    ])
    
    for file_path in show_msg_files:
        print(f"\n📄 {file_path}")
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 1. showMessage-ը հեռացնել useNuri-ից
        content = re.sub(
            r'const\s*\{\s*setPage,\s*showMessage\s*\}\s*=\s*useNuri\(\)',
            'const { setPage } = useNuri()',
            content
        )
        
        # 2. showMessage?.()-ը դարձնել showMessage()
        content = re.sub(
            r'showMessage\?\.\(([^)]*)\)',
            r'showMessage(\1)',
            content
        )
        
        if content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("  ✅ Fixed showMessage usage")
    
    # ─── 3. ԱՎԵԼԱՑՆԵԼ Local showMessage ───────────────────────────
    print("\n📁 Adding local showMessage...")
    
    for file_path in show_msg_files:
        print(f"\n📄 {file_path}")
        # Ստուգել արդյոք արդեն կա
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "const showMessage = useCallback" in content:
            print("  ⏭️ Already has showMessage")
            continue
        
        # Ավելացնել local showMessage
        add_local_show_message(file_path)
    
    # ─── 4. ԱՎԵԼԱՑՆԵԼ ԲԱՑԱԿԱՅՈՒՂ Import-ներ ─────────────────────
    print("\n📁 Adding missing imports...")
    
    missing_imports = [
        ("Star", "**/curriculum/page.tsx"),
        ("Heart", "**/curriculum/page.tsx"),
        ("Music", "**/dialogues/page.tsx"),
        ("Bookmark", "**/dialogues/page.tsx"),
        ("BookmarkCheck", "**/dialogues/page.tsx"),
    ]
    
    for import_name, file_pattern in missing_imports:
        files = find_files_by_patterns([file_pattern])
        for file_path in files:
            print(f"\n📄 {file_path}")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Ստուգել արդյոք արդեն կա
            if f"import {{" in content and import_name in content:
                print(f"  ⏭️ Already has {import_name}")
                continue
            
            # Ավելացնել import-ին
            new_content = re.sub(
                r'(import\s*\{[^}]*)\}',
                rf'\1, {import_name} }}',
                content,
                count=1
            )
            
            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"  ✅ Added {import_name} import")
            else:
                print(f"  ❌ Could not add {import_name}")
    
    # ─── 5. WAVClient.ts - ԱՎԵԼԱՑՆԵԼ WAV_VOICES export ─────────
    print("\n📁 Fixing WavClient.ts...")
    
    wav_client_path = os.path.join(LIBS_DIR, "audio", "WavClient.ts")
    if os.path.exists(wav_client_path):
        with open(wav_client_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Ստուգել արդյոք կա WAV_VOICES
        if "WAV_VOICES" not in content:
            # Ավելացնել WAV_VOICES export
            wav_voices_code = """
// ─── WAV VOICES ──────────────────────────────────────────────────────

export const WAV_VOICES = ["Avet", "Anahit", "Armen", "Lusine", "Hayk"];
"""
            # Ավելացնել ֆայլի վերջում
            content = content + wav_voices_code
            
            with open(wav_client_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("  ✅ Added WAV_VOICES export")
        else:
            print("  ⏭️ WAV_VOICES already exists")
    
    # ─── ԱՎԱՐՏ ──────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("✅ All fixes applied!")
    print("=" * 60)
    print("\n🚀 Now run: npm run build")
    print("   or: npm run dev")

if __name__ == "__main__":
    main()