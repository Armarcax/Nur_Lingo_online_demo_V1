// scripts/find-language-switcher.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

console.log('\n🔍 Searching for LanguageSwitcher in the project...\n');

const root = process.cwd();

// ─── 1. SEARCH FOR IMPORTS ──────────────────────────────────────────

const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
});

console.log(`📁 Scanning ${files.length} files...\n`);

const results: {
  file: string;
  line: number;
  content: string;
  type: 'import' | 'usage' | 'jsx' | 'layout' | 'component';
}[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // ─── Imports ──────────────────────────────────────────────────────
    if (line.includes('LanguageSwitcher') && line.includes('import')) {
      results.push({
        file,
        line: i + 1,
        content: line.trim(),
        type: 'import'
      });
    }

    // ─── JSX Usage ──────────────────────────────────────────────────
    if (line.includes('<LanguageSwitcher') || line.includes('LanguageSwitcher />')) {
      results.push({
        file,
        line: i + 1,
        content: line.trim(),
        type: 'jsx'
      });
    }

    // ─── Component Usage ────────────────────────────────────────────
    if (line.includes('LanguageSwitcher') && !line.includes('import') && !line.includes('export')) {
      results.push({
        file,
        line: i + 1,
        content: line.trim(),
        type: 'usage'
      });
    }

    // ─── Layout file ────────────────────────────────────────────────
    if (file.includes('layout.tsx') || file.includes('layout.ts')) {
      if (line.includes('LanguageSwitcher')) {
        results.push({
          file,
          line: i + 1,
          content: line.trim(),
          type: 'layout'
        });
      }
    }
  }
}

// ─── 2. SEARCH FOR LANGUAGE SWITCHER BUTTONS (text-based) ──────────

const textPatterns = [
  '🇦🇲', '🇬🇧', '🇷🇺',
  'Հայ', 'EN', 'RU',
  'hy', 'en', 'ru'
];

const textResults: {
  file: string;
  line: number;
  content: string;
  matched: string;
}[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of textPatterns) {
      if (line.includes(pattern)) {
        // Skip if it's inside a translation key or comment
        if (line.includes('t(') || line.includes('//') || line.includes('/*')) continue;
        
        // Check if it's likely a language switcher button
        const hasMultiple = textPatterns.filter(p => line.includes(p)).length >= 2;
        if (hasMultiple) {
          textResults.push({
            file,
            line: i + 1,
            content: line.trim(),
            matched: pattern
          });
        }
      }
    }
  }
}

// ─── 3. SEARCH FOR LANGUAGE SELECTOR IN THEME TOGGLE ───────────────

// Check if ThemeToggle contains language switcher logic
for (const file of files) {
  if (file.includes('ThemeToggle')) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('LanguageSwitcher') || 
        content.includes('language') && content.includes('switcher')) {
      results.push({
        file,
        line: 1,
        content: '⚠️ ThemeToggle may contain language switcher logic',
        type: 'component'
      });
    }
  }
}

// ─── 4. CHECK NuriFloating ──────────────────────────────────────────

for (const file of files) {
  if (file.includes('NuriFloating')) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('LanguageSwitcher') || 
        content.includes('language') && content.includes('switcher')) {
      results.push({
        file,
        line: 1,
        content: '⚠️ NuriFloating may contain language switcher',
        type: 'component'
      });
    }
  }
}

// ─── 5. CHECK THEME BACKGROUND ──────────────────────────────────────

for (const file of files) {
  if (file.includes('ThemeBackground')) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('LanguageSwitcher') || 
        content.includes('language') && content.includes('switcher')) {
      results.push({
        file,
        line: 1,
        content: '⚠️ ThemeBackground may contain language switcher',
        type: 'component'
      });
    }
  }
}

// ─── 6. CHECK ANY REMAINING COMPONENTS ──────────────────────────────

for (const file of files) {
  if (file.includes('components/') && !file.includes('LanguageSwitcher')) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('LanguageSwitcher')) {
      results.push({
        file,
        line: 1,
        content: '⚠️ Found LanguageSwitcher reference in components',
        type: 'component'
      });
    }
  }
}

// ─── PRINT RESULTS ──────────────────────────────────────────────────

console.log('='.repeat(72));
console.log('📊 RESULTS');
console.log('='.repeat(72));

if (results.length === 0 && textResults.length === 0) {
  console.log('\n✅ No LanguageSwitcher found in the project.');
  console.log('💡 If you see language switcher buttons, they may be:');
  console.log('   - Part of a third-party library');
  console.log('   - Injected dynamically by browser extension');
  console.log('   - Rendered by NuriFloating or another component without explicit import');
  console.log('\n🔧 To hide them on onboarding, use the CSS/JS approach I provided earlier.');
} else {
  console.log(`\n📁 Found ${results.length + textResults.length} potential matches:\n`);

  // Group by type
  const grouped: Record<string, typeof results> = {};
  for (const r of results) {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  }

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n📂 ${type.toUpperCase()}:`);
    for (const item of items) {
      const relative = path.relative(root, item.file);
      console.log(`   📄 ${relative}:${item.line}`);
      console.log(`      ${item.content}`);
    }
  }

  if (textResults.length > 0) {
    console.log(`\n📂 TEXT MATCHES (language switcher buttons):`);
    const uniqueFiles = new Set<string>();
    for (const item of textResults) {
      if (!uniqueFiles.has(item.file)) {
        uniqueFiles.add(item.file);
        const relative = path.relative(root, item.file);
        console.log(`   📄 ${relative}:${item.line}`);
        console.log(`      "${item.content}"`);
      }
    }
  }

  // ─── RECOMMENDATIONS ──────────────────────────────────────────────

  console.log('\n' + '='.repeat(72));
  console.log('🛠️  RECOMMENDATIONS');
  console.log('='.repeat(72));

  const hasLayout = results.some(r => r.type === 'layout');
  const hasComponent = results.some(r => r.type === 'component');
  const hasJsx = results.some(r => r.type === 'jsx');

  if (hasLayout) {
    console.log('\n1️⃣ LanguageSwitcher is in LAYOUT:');
    console.log('   ✅ Add condition to hide it on onboarding:');
    console.log('   ```tsx');
    console.log('   const isOnboarding = pathname === "/onboarding";');
    console.log('   {!isOnboarding && <LanguageSwitcher />}');
    console.log('   ```');
  } else if (hasJsx) {
    console.log('\n2️⃣ LanguageSwitcher is used in JSX:');
    console.log('   ✅ Remove the <LanguageSwitcher /> tag from the file.');
  } else if (hasComponent) {
    console.log('\n3️⃣ LanguageSwitcher is referenced in components:');
    console.log('   ✅ Check the component file and remove or conditionally render it.');
  } else {
    console.log('\n4️⃣ No explicit LanguageSwitcher found:');
    console.log('   ✅ Use CSS/JS to hide it on onboarding:');
    console.log('   ```tsx');
    console.log('   useEffect(() => {');
    console.log('     document.querySelectorAll("[data-language-switcher]").forEach(el => {');
    console.log('       (el as HTMLElement).style.display = "none";');
    console.log('     });');
    console.log('   }, []);');
    console.log('   ```');
  }

  console.log('\n5️⃣ Or use the useEffect I already added in onboarding/page.tsx:');
  console.log('   ✅ It automatically hides all language switcher elements.');
}

console.log('\n' + '='.repeat(72));