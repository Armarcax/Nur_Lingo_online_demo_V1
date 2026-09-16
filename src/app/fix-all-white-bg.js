// scripts/fix-all-white-bg.js
// Բոլոր էջերից հեռացնում է սպիտակ ֆոնը (դարձնում թափանցիկ)

const fs = require('fs');
const path = require('path');

// ─── ԷՋԵՐԻ ՖԱՅԼԵՐԸ ──────────────────────────────────────────────

const pages = [
  'src/app/page.tsx',
  'src/app/dictionary/page.tsx',
  'src/app/user-dictionary/page.tsx',
  'src/app/dialogues/page.tsx',
  'src/app/curriculum/page.tsx',
  'src/app/garden/page.tsx',
  'src/app/world/page.tsx',
  'src/app/learn/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/admin/dictionary/page.tsx',
  'src/app/admin/audio/page.tsx',
];

// ─── ՓՈՓՈԽՈՒԹՅՈՒՆՆԵՐԸ ──────────────────────────────────────────

const replacements = [
  // bg-white → bg-transparent
  {
    find: /bg-white/g,
    replace: 'bg-transparent',
  },
  // bg-white/20 → bg-transparent
  {
    find: /bg-white\/20/g,
    replace: 'bg-transparent',
  },
  // bg-white/40 → bg-transparent
  {
    find: /bg-white\/40/g,
    replace: 'bg-transparent',
  },
  // bg-white/80 → bg-transparent
  {
    find: /bg-white\/80/g,
    replace: 'bg-transparent',
  },
  // dark:bg-white → dark:bg-transparent
  {
    find: /dark:bg-white/g,
    replace: 'dark:bg-transparent',
  },
  // dark:bg-white/10 → dark:bg-transparent
  {
    find: /dark:bg-white\/10/g,
    replace: 'dark:bg-transparent',
  },
  // dark:bg-white/20 → dark:bg-transparent
  {
    find: /dark:bg-white\/20/g,
    replace: 'dark:bg-transparent',
  },
  // dark:bg-white/40 → dark:bg-transparent
  {
    find: /dark:bg-white\/40/g,
    replace: 'dark:bg-transparent',
  },
  // backdrop-blur-sm → backdrop-blur-none
  {
    find: /backdrop-blur-sm/g,
    replace: 'backdrop-blur-none',
  },
  // backdrop-blur-xl → backdrop-blur-none
  {
    find: /backdrop-blur-xl/g,
    replace: 'backdrop-blur-none',
  },
  // bg-gray-50 → bg-transparent
  {
    find: /bg-gray-50/g,
    replace: 'bg-transparent',
  },
  // bg-gray-100 → bg-transparent
  {
    find: /bg-gray-100/g,
    replace: 'bg-transparent',
  },
  // bg-gray-200 → bg-transparent
  {
    find: /bg-gray-200/g,
    replace: 'bg-transparent',
  },
  // bg-[#1a0a0a] → bg-transparent
  {
    find: /bg-\[#1a0a0a\]/g,
    replace: 'bg-transparent',
  },
];

// ─── RUN ──────────────────────────────────────────────────────────────

console.log('🔧 REMOVING WHITE BACKGROUND FROM ALL PAGES');
console.log('='.repeat(60));

let totalChanges = 0;
let totalFiles = 0;

for (const page of pages) {
  const filePath = path.join(__dirname, '..', page);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Ֆայլը չկա: ${page}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  let changesInFile = 0;

  for (const rule of replacements) {
    if (content.match(rule.find)) {
      const count = (content.match(rule.find) || []).length;
      content = content.replace(rule.find, rule.replace);
      fileChanged = true;
      changesInFile += count;
      totalChanges += count;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFiles++;
    console.log(`✅ ${page}: ${changesInFile} փոփոխություն`);
  }
}

console.log('='.repeat(60));
console.log(`📊 ԱՐԴՅՈՒՆՔ:`);
console.log(`   📁 Թարմացված ֆայլեր: ${totalFiles}/${pages.length}`);
console.log(`   🔄 Ընդհանուր փոփոխություններ: ${totalChanges}`);
console.log('💡 ԲՈԼՈՐ ՍՊԻՏԱԿ ՖՈՆԵՐԸ ՀԵՌԱՑՎԵԼ ԵՆ');
console.log('💡 Գործարկեք: npm run dev');