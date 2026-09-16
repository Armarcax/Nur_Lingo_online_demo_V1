// scripts/fast-fix.ts

import fs from "fs";
import path from "path";

console.log("🔧 Running fast fixes...\n");

// ─── FIX 1: useNuri.tsx ─────────────────────────────────────────────

const useNuriPath = "src/hooks/useNuri.tsx";
if (fs.existsSync(useNuriPath)) {
  let content = fs.readFileSync(useNuriPath, "utf-8");
  
  // Remove emoji
  content = content.replace(/,\s*emoji:\s*engine\.emoji/g, "");
  content = content.replace(/^export\s+type\s*{\s*NuriMood,\s*NuriAnimation\s*}/m, 'export type { NuriMood }');
  
  fs.writeFileSync(useNuriPath, content);
  console.log("✅ Fixed useNuri.tsx");
}

// ─── FIX 2: user-dictionary setPage ──────────────────────────────────

const userDictPath = "src/app/user-dictionary/page.tsx";
if (fs.existsSync(userDictPath)) {
  let content = fs.readFileSync(userDictPath, "utf-8");
  content = content.replace(/setPage\(\s*["']user-dictionary["']\s*\)/g, 'setPage("dictionary")');
  fs.writeFileSync(userDictPath, content);
  console.log("✅ Fixed user-dictionary/page.tsx");
}

// ─── FIX 3: vocab-audio setPage ──────────────────────────────────────

const vocabAudioPath = "src/app/vocab-audio/page.tsx";
if (fs.existsSync(vocabAudioPath)) {
  let content = fs.readFileSync(vocabAudioPath, "utf-8");
  content = content.replace(/setPage\(\s*["']vocab-audio["']\s*\)/g, 'setPage("dictionary")');
  fs.writeFileSync(vocabAudioPath, content);
  console.log("✅ Fixed vocab-audio/page.tsx");
}

console.log("\n✅ All fast fixes applied!");
console.log("📝 Run: npm run build");