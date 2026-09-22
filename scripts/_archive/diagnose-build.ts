// scripts/diagnose-build.ts

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { glob } from "glob";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

console.log(`
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
${YELLOW}  🔍 NUR LINGO BUILD DIAGNOSTIC TOOL${RESET}
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
`);

// ─── 1. CHECK TYPESCRIPT ERRORS ──────────────────────────────────────

console.log(`${BLUE}\n📋 1. CHECKING TYPESCRIPT ERRORS...${RESET}\n`);

try {
  const output = execSync("npx tsc --noEmit 2>&1", { 
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 30000
  });
  
  const lines = output.split("\n").filter(line => line.trim());
  
  if (lines.length === 0) {
    console.log(`${GREEN}✅ No TypeScript errors found!${RESET}`);
  } else {
    console.log(`${RED}❌ Found ${lines.length} TypeScript errors:${RESET}\n`);
    
    const errors: Record<string, { line: string; file: string; error: string }[]> = {};
    
    for (const line of lines) {
      // Parse error: file.ts(14:19): error TS2339: Property 'emoji' does not exist...
      const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineNum, colNum, code, message] = match;
        if (!errors[file]) errors[file] = [];
        errors[file].push({ line: `${lineNum}:${colNum}`, file, error: `TS${code}: ${message}` });
      }
    }
    
    for (const [file, errs] of Object.entries(errors)) {
      console.log(`${YELLOW}📁 ${file}${RESET}`);
      for (const err of errs) {
        console.log(`  ${RED}  ${err.error}${RESET}`);
      }
      console.log("");
    }
  }
} catch (error) {
  console.log(`${YELLOW}⚠️ TypeScript check failed or no errors found${RESET}`);
}

// ─── 2. CHECK NEXT.JS BUILD ──────────────────────────────────────────

console.log(`${BLUE}\n📋 2. CHECKING NEXT.JS BUILD...${RESET}\n`);

try {
  const output = execSync("npm run build 2>&1", { 
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 60000
  });
  console.log(`${GREEN}✅ Build successful!${RESET}`);
} catch (error: any) {
  const output = error.stdout || error.stderr || "";
  console.log(`${RED}❌ Build failed:${RESET}\n`);
  
  // Extract error messages
  const lines = output.split("\n");
  let inError = false;
  
  for (const line of lines) {
    if (line.includes("Failed to compile") || line.includes("Type error")) {
      inError = true;
      console.log(`${RED}${line}${RESET}`);
    } else if (inError && line.trim()) {
      console.log(`  ${line}`);
    }
    if (line.includes("✓ Compiled") && !line.includes("Failed")) {
      inError = false;
    }
  }
}

// ─── 3. CHECK MISSING EXPORTS ───────────────────────────────────────

console.log(`${BLUE}\n📋 3. CHECKING EXPORTS...${RESET}\n`);

const filesToCheck = [
  "src/components/NuriProvider.tsx",
  "src/hooks/useNuri.tsx",
  "src/components/NuriFloating.tsx",
  "src/components/Nuri.tsx",
];

for (const file of filesToCheck) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`${RED}❌ File not found: ${file}${RESET}`);
    continue;
  }
  
  const content = fs.readFileSync(fullPath, "utf-8");
  const exports = content.match(/^export\s+(?:const|function|class|type|interface|default)\s+(\w+)/gm) || [];
  const namedExports = content.match(/^export\s+{\s*([^}]+)\s*}/gm) || [];
  
  console.log(`${YELLOW}📁 ${file}${RESET}`);
  if (exports.length > 0) {
    console.log(`  ${GREEN}✅ Exports:${RESET}`);
    for (const exp of exports) {
      const name = exp.replace(/^export\s+(?:const|function|class|type|interface|default)\s+/, "");
      console.log(`    - ${name}`);
    }
  }
  if (namedExports.length > 0) {
    for (const exp of namedExports) {
      const names = exp.replace(/^export\s+{\s*/, "").replace(/\s*}$/, "");
      console.log(`    - ${names}`);
    }
  }
  console.log("");
}

// ─── 4. CHECK PAGE TYPES ─────────────────────────────────────────────

console.log(`${BLUE}\n📋 4. CHECKING PAGE TYPES...${RESET}\n`);

const filesWithSetPage = [
  "src/app/user-dictionary/page.tsx",
  "src/app/vocab-audio/page.tsx",
];

for (const file of filesWithSetPage) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`${RED}❌ File not found: ${file}${RESET}`);
    continue;
  }
  
  const content = fs.readFileSync(fullPath, "utf-8");
  const setPageLines = content.match(/setPage\(\s*["']([^"']+)["']\s*\)/g) || [];
  
  console.log(`${YELLOW}📁 ${file}${RESET}`);
  if (setPageLines.length > 0) {
    for (const line of setPageLines) {
      const page = line.match(/setPage\(\s*["']([^"']+)["']\s*\)/)?.[1] || "unknown";
      console.log(`  - setPage("${page}")`);
    }
  }
  console.log("");
}

// ─── 5. SUMMARY ─────────────────────────────────────────────────────

console.log(`
${BLUE}═══════════════════════════════════════════════════════════════${RESET}
${YELLOW}  📊 SUMMARY${RESET}
${BLUE}═══════════════════════════════════════════════════════════════${RESET}

${GREEN}✅ To fix common issues:${RESET}

1. Remove 'emoji' from useNuri.tsx
2. Add 'user-dictionary' and 'vocab-audio' to NuriContext.page type
3. Add 'user-dictionary' and 'vocab-audio' to NuriEmotionEngine page type
4. Fix NuriFloating.tsx export (named vs default)
5. Ensure all types are exported from NuriProvider

${YELLOW}📝 Run: npm run build -- --no-lint${RESET}
${YELLOW}📝 Or: npm run dev${RESET}

`);