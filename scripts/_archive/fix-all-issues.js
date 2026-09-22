// scripts/fix-all-issues.js
// NUR Lingo — Բոլոր խնդիրների ուղղում

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// 1. Fix dictionary.ts
const dictPath = path.join(PROJECT_ROOT, 'src/lib/dictionary.ts');
if (fs.existsSync(dictPath)) {
  let content = fs.readFileSync(dictPath, 'utf8');
  
  // Add getUserDictionary if missing
  if (!content.includes('getUserDictionary')) {
    const insertAfter = 'export function addToUserDictionary';
    const newFunction = `
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
`;
    // Insert after addToUserDictionary
    content = content.replace(insertAfter, insertAfter + newFunction);
    fs.writeFileSync(dictPath, content);
    console.log('✅ Fixed dictionary.ts');
  }
}

console.log('✅ All fixes applied!');