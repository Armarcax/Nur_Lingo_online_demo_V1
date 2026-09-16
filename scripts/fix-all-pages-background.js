// scripts/fix-all-pages-background.js
// Բոլոր էջերի ֆոնի թափանցելիությունը դարձնում է 100% (ամբողջովին թափանցիկ)

const fs = require('fs');
const path = require('path');

// ─── ԷՋԵՐԻ ՖԱՅԼԵՐԸ ──────────────────────────────────────────────

const pages = [
  'src/app/page.tsx',                          // Գլխավոր
  'src/app/dictionary/page.tsx',               // Հիմնական բառարան
  'src/app/user-dictionary/page.tsx',          // Օգտատիրոջ բառարան
  'src/app/dialogues/page.tsx',                // Երկխոսություն
  'src/app/curriculum/page.tsx',               // Ծրագիր
  'src/app/garden/page.tsx',                   // Պարտեզ
  'src/app/world/page.tsx',                    // Դասեր
  'src/app/learn/page.tsx',                    // Սովորել
  'src/app/onboarding/page.tsx',               // Onboarding
  'src/app/admin/dictionary/page.tsx',         // Admin բառարան
  'src/app/admin/audio/page.tsx',              // Admin աուդիո
];

// ─── ՓՈՓՈԽՈՒԹՅՈՒՆՆԵՐԸ (100% ԹԱՓԱՆՑԵԼԻՈՒԹՅՈՒՆ) ──────────────────

const replacements = [
  // 1. bg-white/20 → bg-transparent
  {
    find: /bg-white\/20/g,
    replace: 'bg-transparent',
  },
  // 2. bg-white/40 → bg-transparent
  {
    find: /bg-white\/40/g,
    replace: 'bg-transparent',
  },
  // 3. bg-white/80 → bg-transparent
  {
    find: /bg-white\/80/g,
    replace: 'bg-transparent',
  },
  // 4. dark:bg-white/10 → dark:bg-transparent
  {
    find: /dark:bg-white\/10/g,
    replace: 'dark:bg-transparent',
  },
  // 5. dark:bg-white/20 → dark:bg-transparent
  {
    find: /dark:bg-white\/20/g,
    replace: 'dark:bg-transparent',
  },
  // 6. dark:bg-white/40 → dark:bg-transparent
  {
    find: /dark:bg-white\/40/g,
    replace: 'dark:bg-transparent',
  },
  // 7. bg-white/5 → bg-transparent
  {
    find: /bg-white\/5/g,
    replace: 'bg-transparent',
  },
  // 8. dark:bg-white/5 → dark:bg-transparent
  {
    find: /dark:bg-white\/5/g,
    replace: 'dark:bg-transparent',
  },
  // 9. bg-gray-800/90 → bg-transparent
  {
    find: /bg-gray-800\/90/g,
    replace: 'bg-transparent',
  },
  // 10. bg-gray-700/80 → bg-transparent
  {
    find: /bg-gray-700\/80/g,
    replace: 'bg-transparent',
  },
  // 11. bg-black/40 → bg-transparent (header-ից բացի)
  {
    find: /bg-black\/40/g,
    replace: 'bg-transparent',
  },
  // 12. bg-black/60 → bg-transparent
  {
    find: /bg-black\/60/g,
    replace: 'bg-transparent',
  },
  // 13. bg-black/80 → bg-transparent
  {
    find: /bg-black\/80/g,
    replace: 'bg-transparent',
  },
  // 14. backdrop-blur-xl → backdrop-blur-none
  {
    find: /backdrop-blur-xl/g,
    replace: 'backdrop-blur-none',
  },
  // 15. backdrop-blur-sm → backdrop-blur-none
  {
    find: /backdrop-blur-sm/g,
    replace: 'backdrop-blur-none',
  },
];

// ─── RUN ──────────────────────────────────────────────────────────────

console.log('🔧 FIXING ALL PAGES BACKGROUND (100% TRANSPARENT)');
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
console.log('💡 ԲՈԼՈՐ ՖՈՆԵՐԸ 100% ԹԱՓԱՆՑԵԼԻ ԵՆ');
console.log('💡 Գործարկեք: npm run dev');