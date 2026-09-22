// scripts/fix-detected-issues.js
// NUR Lingo — Ուղղել թեստում գտնված խնդիրները

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

console.log('🔧 NUR Lingo — Ուղղում ենք գտնված խնդիրները...\n');

// ─── 1. FIX dictionary.ts ──────────────────────────────────────────

const dictPath = path.join(PROJECT_ROOT, 'src/lib/dictionary.ts');
if (fs.existsSync(dictPath)) {
  let content = fs.readFileSync(dictPath, 'utf8');
  
  // Add getUserDictionary if missing
  if (!content.includes('getUserDictionary')) {
    const insertAfter = 'export function addToUserDictionary';
    const newFunctions = `

// ✅ GET user dictionary
export function getUserDictionary(): DictionaryEntry[] {
  try {
    const stored = localStorage.getItem("nurlingo_user_dictionary");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return [];
}

// ✅ REMOVE from user dictionary
export function removeFromUserDictionary(id: string): boolean {
  try {
    const dict = getUserDictionary();
    const filtered = dict.filter(e => e.id !== id);
    localStorage.setItem("nurlingo_user_dictionary", JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// ✅ Check if word is in base dictionary
export function isInBaseDictionary(word: string): boolean {
  try {
    const baseDict = JSON.parse(
      localStorage.getItem("nurlingo_base_dictionary") || "[]"
    );
    return baseDict.some((e: any) => e.hy === word || e.en === word);
  } catch {
    return false;
  }
}
`;
    // Insert after addToUserDictionary
    content = content.replace(insertAfter, insertAfter + newFunctions);
    fs.writeFileSync(dictPath, content);
    console.log('✅ dictionary.ts — ավելացվել են getUserDictionary, removeFromUserDictionary, isInBaseDictionary');
  } else {
    console.log('ℹ️ dictionary.ts — արդեն կա getUserDictionary');
  }
} else {
  console.log('❌ dictionary.ts — չի գտնվել');
}

// ─── 2. FIX Nuri.tsx ──────────────────────────────────────────────

const nuriPath = path.join(PROJECT_ROOT, 'src/components/Nuri.tsx');
if (fs.existsSync(nuriPath)) {
  let content = fs.readFileSync(nuriPath, 'utf8');
  
  // Fix getMoodFromScore if it doesn't handle attempts
  if (content.includes('getMoodFromScore') && !content.includes('attempts')) {
    const oldFunction = /export function getMoodFromScore\([^)]*\)[^{]*{[\s\S]*?}/;
    const newFunction = `export function getMoodFromScore(
  score: number,
  accepted: boolean,
  streak: number = 0,
  attempts: number = 0
): NuriMood {
  if (!accepted) {
    if (attempts >= 3) return "sad";
    if (attempts >= 1) return "confused";
    return "thinking";
  }
  if (streak >= 10) return "celebrating";
  if (streak >= 5) return "excited";
  if (streak >= 3) return "happy";
  if (score > 80) return "proud";
  if (score > 50) return "happy";
  return "encouraging";
}`;
    
    content = content.replace(oldFunction, newFunction);
    fs.writeFileSync(nuriPath, content);
    console.log('✅ Nuri.tsx — թարմացվել է getMoodFromScore-ը (attempts-ով)');
  } else {
    console.log('ℹ️ Nuri.tsx — արդեն կա attempts-ի աջակցություն');
  }
} else {
  console.log('❌ Nuri.tsx — չի գտնվել');
}

// ─── 3. CREATE favicon.ico ─────────────────────────────────────────

const faviconPath = path.join(PROJECT_ROOT, 'public/favicon.ico');
if (!fs.existsSync(faviconPath)) {
  // Create a simple favicon (or copy from logo.svg)
  const svgPath = path.join(PROJECT_ROOT, 'public/logo.svg');
  if (fs.existsSync(svgPath)) {
    // Copy logo.svg as favicon
    fs.copyFileSync(svgPath, faviconPath);
    console.log('✅ favicon.ico — ստեղծվել է (logo.svg-ից)');
  } else {
    // Create minimal favicon
    const minimalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="70" font-size="80" text-anchor="middle">🇦🇲</text></svg>`;
    fs.writeFileSync(faviconPath, minimalSvg);
    console.log('✅ favicon.ico — ստեղծվել է (minimal)');
  }
} else {
  console.log('ℹ️ favicon.ico — արդեն կա');
}

console.log('\n🎉 Բոլոր ուղղումները ավարտված են!');
console.log('📝 Գործարկեք npm run dev և ստուգեք');