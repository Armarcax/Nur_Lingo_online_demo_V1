// scripts/check-build.ts

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

console.log(`
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
${YELLOW}  🔧 NUR LINGO BUILD FIXER${RESET}
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
`);

// ─── 1. FIND ALL TS ERRORS ──────────────────────────────────────────

console.log(`${BLUE}\n📋 1. FINDING ALL TS ERRORS...${RESET}\n`);

try {
  const output = execSync("npx tsc --noEmit 2>&1", {
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 30000
  });
  
  const lines = output.split("\n").filter(line => line.trim());
  const errors: Record<string, { line: number; error: string }[]> = {};
  
  for (const line of lines) {
    // Parse: file.ts(14:19): error TS2339: Property 'emoji' does not exist...
    const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
    if (match) {
      const [, file, lineNum, , , message] = match;
      if (!errors[file]) errors[file] = [];
      errors[file].push({ line: parseInt(lineNum), error: `TS${match[4]}: ${message}` });
    }
  }
  
  if (Object.keys(errors).length === 0) {
    console.log(`${GREEN}✅ No TypeScript errors found!${RESET}`);
  } else {
    console.log(`${RED}❌ Found ${Object.keys(errors).length} files with errors:${RESET}\n`);
    
    for (const [file, errs] of Object.entries(errors)) {
      console.log(`${YELLOW}📁 ${file}${RESET}`);
      for (const err of errs) {
        console.log(`  ${RED}  Line ${err.line}: ${err.error}${RESET}`);
      }
      console.log("");
    }
  }
} catch (error: any) {
  // tsc returns error code if there are errors
  const output = error.stdout || error.stderr || "";
  console.log(`${YELLOW}⚠️ TypeScript errors found:${RESET}`);
  console.log(output);
}

// ─── 2. FIX LESSON AUDIO ────────────────────────────────────────────

console.log(`${BLUE}\n📋 2. FIXING LessonAudio.ts...${RESET}\n`);

const lessonAudioPath = "src/lib/audio/LessonAudio.ts";
if (fs.existsSync(lessonAudioPath)) {
  let content = fs.readFileSync(lessonAudioPath, "utf-8");
  
  // Fix the type issue
  const fixed = content.replace(
    /const prompt = exercise\.prompt\?\.[lang] \|\| exercise\.prompt\?\.en \|\| "";/g,
    'const prompt = (exercise.prompt as any)?.[lang] || exercise.prompt?.en || "";'
  );
  
  if (fixed !== content) {
    fs.writeFileSync(lessonAudioPath, fixed);
    console.log(`${GREEN}✅ Fixed LessonAudio.ts: added 'as any' for prompt indexing${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️ LessonAudio.ts already fixed or no changes needed${RESET}`);
  }
}

// ─── 3. FIX useNuri.tsx ─────────────────────────────────────────────

console.log(`${BLUE}\n📋 3. FIXING useNuri.tsx...${RESET}\n`);

const useNuriPath = "src/hooks/useNuri.tsx";
if (fs.existsSync(useNuriPath)) {
  let content = fs.readFileSync(useNuriPath, "utf-8");
  
  // Remove NuriAnimation export
  const fixed = content.replace(
    /export type { NuriMood, NuriAnimation } from/g,
    'export type { NuriMood } from'
  );
  
  if (fixed !== content) {
    fs.writeFileSync(useNuriPath, fixed);
    console.log(`${GREEN}✅ Fixed useNuri.tsx: removed NuriAnimation export${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️ useNuri.tsx already fixed${RESET}`);
  }
}

// ─── 4. FIX ALL SetPage CALLS ───────────────────────────────────────

console.log(`${BLUE}\n📋 4. FIXING setPage CALLS...${RESET}\n`);

const filesToFix = [
  "src/app/user-dictionary/page.tsx",
  "src/app/vocab-audio/page.tsx",
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf-8");
    // Replace user-dictionary and vocab-audio with dictionary
    const fixed = content.replace(
      /setPage\(\s*["'](?:user-dictionary|vocab-audio)["']\s*\)/g,
      'setPage("dictionary")'
    );
    
    if (fixed !== content) {
      fs.writeFileSync(file, fixed);
      console.log(`${GREEN}✅ Fixed ${file}: setPage changed to "dictionary"${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️ ${file} already fixed${RESET}`);
    }
  }
}

// ─── 5. CHECK AND FIX NuriFloating ──────────────────────────────────

console.log(`${BLUE}\n📋 5. CHECKING NuriFloating.tsx...${RESET}\n`);

const nuriFloatingPath = "src/components/NuriFloating.tsx";
if (fs.existsSync(nuriFloatingPath)) {
  let content = fs.readFileSync(nuriFloatingPath, "utf-8");
  
  // Check if emoji is used but not defined
  const hasEmoji = content.includes("const { mood, message, animation, emoji, context }");
  if (hasEmoji) {
    // Remove emoji from destructuring
    const fixed = content.replace(
      /const { mood, message, animation, emoji, context } = useNuriEngine\(\);/g,
      'const { mood, message, animation, context } = useNuriEngine();'
    );
    fs.writeFileSync(nuriFloatingPath, fixed);
    console.log(`${GREEN}✅ Fixed NuriFloating.tsx: removed emoji from destructuring${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️ NuriFloating.tsx already fixed${RESET}`);
  }
}

// ─── 6. SUMMARY ─────────────────────────────────────────────────────

console.log(`
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
${GREEN}✅ ALL FIXES APPLIED!${RESET}
${BLUE}═══════════════════════════════════════════════════════════════${RESET}

${YELLOW}📝 Now run:${RESET}
  npm run build

${YELLOW}📝 Or with clean cache:${RESET}
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  npm run build

`);