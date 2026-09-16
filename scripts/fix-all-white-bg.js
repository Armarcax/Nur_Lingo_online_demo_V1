// scripts/fix-all-bg-50-full.js
// ԲՈԼՈՐ ՖԱՅԼԵՐՈՒՄ սպիտակ ֆոնը դարձնում է 50% թափանցելի

const fs = require('fs');
const path = require('path');

// ─── ԲՈԼՈՐ ՖԱՅԼԵՐԸ ────────────────────────────────────────────────

const files = [
  // ԷՋԵՐ
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
  // ԿՈՄՊՈՆԵՆՏՆԵՐ
  'src/components/BottomNav.tsx',
  'src/components/Nuri.tsx',
  'src/components/NuriFloating.tsx',
  'src/components/NuriProvider.tsx',
  'src/components/NuriRain.tsx',
  'src/components/NuriStateManager.tsx',
  'src/components/ThemeBackground.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/InteractiveDialogue.tsx',
  'src/components/MultilingualLearningModule.tsx',
  'src/components/UserRecordingButton.tsx',
  'src/components/theme-provider.tsx',
  // UI ԿՈՄՊՈՆԵՆՏՆԵՐ
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toggle.tsx',
  'src/components/ui/tooltip.tsx',
  // STYLES
  'src/app/globals.css',
  'tailwind.config.js',
];

// ─── ՓՈՓՈԽՈՒԹՅՈՒՆՆԵՐԸ (50% ԹԱՓԱՆՑԵԼԻ) ──────────────────────────

const replacements = [
  // bg-white → bg-white/50
  { find: /bg-white(?![\/\-])/g, replace: 'bg-white/50' },
  // dark:bg-white → dark:bg-white/50
  { find: /dark:bg-white(?![\/\-])/g, replace: 'dark:bg-white/50' },
  // bg-white/20 → bg-white/50
  { find: /bg-white\/20/g, replace: 'bg-white/50' },
  // bg-white/30 → bg-white/50
  { find: /bg-white\/30/g, replace: 'bg-white/50' },
  // bg-white/40 → bg-white/50
  { find: /bg-white\/40/g, replace: 'bg-white/50' },
  // bg-white/80 → bg-white/50
  { find: /bg-white\/80/g, replace: 'bg-white/50' },
  // dark:bg-white/10 → dark:bg-white/50
  { find: /dark:bg-white\/10/g, replace: 'dark:bg-white/50' },
  // dark:bg-white/20 → dark:bg-white/50
  { find: /dark:bg-white\/20/g, replace: 'dark:bg-white/50' },
  // dark:bg-white/40 → dark:bg-white/50
  { find: /dark:bg-white\/40/g, replace: 'dark:bg-white/50' },
  // bg-gray-50 → bg-white/50
  { find: /bg-gray-50/g, replace: 'bg-white/50' },
  // bg-gray-100 → bg-white/50
  { find: /bg-gray-100/g, replace: 'bg-white/50' },
  // bg-gray-200 → bg-white/50
  { find: /bg-gray-200/g, replace: 'bg-white/50' },
  // bg-[#1a0a0a] → bg-black/50
  { find: /bg-\[#1a0a0a\]/g, replace: 'bg-black/50' },
  // backdrop-blur-sm → backdrop-blur-none
  { find: /backdrop-blur-sm/g, replace: 'backdrop-blur-none' },
  // backdrop-blur-xl → backdrop-blur-none
  { find: /backdrop-blur-xl/g, replace: 'backdrop-blur-none' },
];

// ─── RUN ──────────────────────────────────────────────────────────────

console.log('🔧 SETTING ALL BACKGROUNDS TO 50% TRANSPARENT (FULL)');
console.log('='.repeat(70));

let totalChanges = 0;
let totalFiles = 0;

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Ֆայլը չկա: ${file}`);
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
    console.log(`✅ ${file}: ${changesInFile} փոփոխություն`);
  }
}

console.log('='.repeat(70));
console.log(`📊 ԱՐԴՅՈՒՆՔ:`);
console.log(`   📁 Թարմացված ֆայլեր: ${totalFiles}/${files.length}`);
console.log(`   🔄 Ընդհանուր փոփոխություններ: ${totalChanges}`);
console.log('💡 ԲՈԼՈՐ ՖՈՆԵՐԸ 50% ԹԱՓԱՆՑԵԼԻ ԵՆ');
console.log('💡 Գործարկեք: npm run dev');
console.log('💡 Բրաուզերում: Ctrl + Shift + R');