// scripts/analyze-hardcoded-texts.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Թարգմանությունների բանալիներ
type TranslationKey = {
  key: string;
  defaultText: string;
  context: string;
  file: string;
  line: number;
  type?: string; // ✅ ԱՎԵԼԱՑՎԵԼ Է (խնդիրը լուծված է)
};

// Հայտնաբերված hardcoded տեքստեր
const foundTexts: TranslationKey[] = [];

// Կանոնավոր արտահայտություններ hardcoded տեքստերը գտնելու համար
const patterns = [
  // JSX-ում hardcoded տեքստեր
  {
    regex: />([^<>{}\n]+)</g,
    type: 'jsx-text',
    description: 'JSX text node'
  },
  // Տիտղոսներ
  {
    regex: /title=["']([^"']+)["']/g,
    type: 'title-attribute',
    description: 'Title attribute'
  },
  // Placeholder-ներ
  {
    regex: /placeholder=["']([^"']+)["']/g,
    type: 'placeholder',
    description: 'Placeholder attribute'
  },
  // Button text
  {
    regex: /<button[^>]*>([^<]+)<\/button>/g,
    type: 'button-text',
    description: 'Button text'
  },
  // Label text
  {
    regex: /<label[^>]*>([^<]+)<\/label>/g,
    type: 'label-text',
    description: 'Label text'
  },
  // Heading text
  {
    regex: /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g,
    type: 'heading',
    description: 'Heading text'
  },
  // Paragraph text
  {
    regex: /<p[^>]*>([^<]+)<\/p>/g,
    type: 'paragraph',
    description: 'Paragraph text'
  },
  // Span text
  {
    regex: /<span[^>]*>([^<]+)<\/span>/g,
    type: 'span-text',
    description: 'Span text'
  },
  // Toast/alert messages
  {
    regex: /showMessage\(["']([^"']+)["']/g,
    type: 'toast-message',
    description: 'Toast/Alert message'
  },
  // Console log
  {
    regex: /console\.(log|error|warn)\(["']([^"']+)["']/g,
    type: 'console-log',
    description: 'Console log message'
  },
  // Alert
  {
    regex: /alert\(["']([^"']+)["']/g,
    type: 'alert',
    description: 'Alert message'
  },
  // Placeholder texts in inputs
  {
    regex: /placeholder:\s*["']([^"']+)["']/g,
    type: 'placeholder-prop',
    description: 'Placeholder in prop'
  },
  // Label in objects
  {
    regex: /label:\s*["']([^"']+)["']/g,
    type: 'label-prop',
    description: 'Label in object'
  },
  // Text in arrays
  {
    regex: /text:\s*["']([^"']+)["']/g,
    type: 'text-prop',
    description: 'Text in object'
  },
  // Menu items
  {
    regex: /name:\s*["']([^"']+)["']/g,
    type: 'menu-item',
    description: 'Menu item name'
  },
  // Navigation items
  {
    regex: /title:\s*["']([^"']+)["']/g,
    type: 'nav-item',
    description: 'Navigation title'
  },
  // Error messages
  {
    regex: /errorMessage:\s*["']([^"']+)["']/g,
    type: 'error-message',
    description: 'Error message'
  },
  // Success messages
  {
    regex: /successMessage:\s*["']([^"']+)["']/g,
    type: 'success-message',
    description: 'Success message'
  },
];

// Բացառվող ֆայլեր և դիրեկտորիաներ
const excludeDirs = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'public',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx',
  '*.d.ts'
];

// Ֆայլերի ընդլայնումներ
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// Hardcoded-ից բացառվող բառեր (լեզվի կոդեր, URL-ներ, etc.)
const excludeWords = [
  'hy', 'en', 'ru', 'http', 'https', 'www', 'href',
  'src', 'alt', 'className', 'id', 'data-', 'aria-',
  'role', 'type', 'name', 'value', 'onClick', 'onChange',
  'useState', 'useEffect', 'useCallback', 'useMemo',
  'return', 'export', 'import', 'const', 'let', 'var',
  'function', 'class', 'interface', 'type', 'enum',
  'true', 'false', 'null', 'undefined', 'async', 'await',
  'try', 'catch', 'finally', 'throw', 'new', 'this'
];

// Արդեն i18n-ով օգտագործվող ֆունկցիաներ
const i18nFunctions = [
  't(',
  'useTranslations',
  'getTranslations',
  'translate',
  'i18n.t',
  'formatMessage',
  'useIntl'
];

function isExcludedFile(filePath: string): boolean {
  return excludeDirs.some(dir => filePath.includes(dir));
}

function shouldExcludeText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;
  if (/^[0-9]+$/.test(trimmed)) return true; // Only numbers
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && !/[A-Z]/.test(trimmed)) return true; // Only letters/numbers
  if (excludeWords.some(word => trimmed === word)) return true;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true; // JS expressions
  if (trimmed.includes('${')) return true; // Template literals
  return false;
}

function isI18nText(text: string): boolean {
  return i18nFunctions.some(fn => text.includes(fn));
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Ստուգել արդյոք տողը պարունակում է i18n
    if (isI18nText(line)) return;

    patterns.forEach(({ regex, type, description }) => {
      let match;
      const regexCopy = new RegExp(regex.source, 'g');

      while ((match = regexCopy.exec(line)) !== null) {
        const text = match[1]?.trim();
        if (!text) continue;
        if (shouldExcludeText(text)) continue;
        if (isI18nText(text)) continue;

        // Ստուգել արդյոք տեքստը արդեն թարգմանված է
        if (text.includes('t(') || text.includes('formatMessage')) return;

        foundTexts.push({
          key: generateKey(text, filePath),
          defaultText: text,
          context: line.trim(),
          file: filePath,
          line: lineNumber,
          type: type // ✅ ԱՎԵԼԱՑՎԵԼ Է (type-ը պահպանվում է)
        });
      }
    });
  });
}

function generateKey(text: string, filePath: string): string {
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  
  const fileName = path.basename(filePath, path.extname(filePath));
  return `${fileName}_${cleanText}`;
}

function generateI18nStructure() {
  // Խմբավորել ըստ ֆայլերի
  const groupedByFile: Record<string, TranslationKey[]> = {};
  foundTexts.forEach(item => {
    if (!groupedByFile[item.file]) {
      groupedByFile[item.file] = [];
    }
    groupedByFile[item.file].push(item);
  });

  // Ստեղծել JSON ֆայլ i18n-ի համար
  const translations: Record<string, any> = {
    hy: {},
    en: {},
    ru: {}
  };

  foundTexts.forEach(item => {
    const key = item.key;
    translations.hy[key] = item.defaultText;
    translations.en[key] = item.defaultText;
    translations.ru[key] = item.defaultText;
  });

  // Պահպանել արդյունքները
  const outputDir = './scripts/output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // JSON թարգմանություններ
  fs.writeFileSync(
    path.join(outputDir, 'translations.json'),
    JSON.stringify(translations, null, 2)
  );

  // Markdown զեկույց
  let report = '# Hardcoded Texts Report\n\n';
  report += `Ընդհանուր հայտնաբերված hardcoded տեքստեր: ${foundTexts.length}\n\n`;

  report += '## Ըստ ֆայլերի\n\n';
  Object.entries(groupedByFile).forEach(([file, items]) => {
    report += `### ${file}\n\n`;
    items.forEach(item => {
      report += `- **Line ${item.line}**: "${item.defaultText}"\n`;
      report += `  - Key: \`${item.key}\`\n`;
      report += `  - Context: \`${item.context}\`\n\n`;
    });
  });

  report += '\n## Ըստ տեսակի\n\n';
  const groupedByType: Record<string, TranslationKey[]> = {};
  foundTexts.forEach(item => {
    const type = item.type || 'unknown'; // ✅ ԱՅԺՄ ԱՇԽԱՏՈՒՄ Է
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push(item);
  });

  Object.entries(groupedByType).forEach(([type, items]) => {
    report += `### ${type} (${items.length})\n\n`;
    items.forEach(item => {
      report += `- "${item.defaultText}" - ${path.basename(item.file)}:${item.line}\n`;
    });
    report += '\n';
  });

  fs.writeFileSync(
    path.join(outputDir, 'hardcoded-texts-report.md'),
    report
  );

  // CSV ֆայլ
  let csv = 'File,Line,Type,Text,Key\n';
  foundTexts.forEach(item => {
    csv += `${item.file},${item.line},${item.type || 'unknown'},"${item.defaultText}",${item.key}\n`;
  });
  fs.writeFileSync(
    path.join(outputDir, 'hardcoded-texts.csv'),
    csv
  );

  console.log('✅ Վերլուծությունն ավարտված է:');
  console.log(`📊 Հայտնաբերվել է ${foundTexts.length} hardcoded տեքստ`);
  console.log(`📁 Արդյունքները պահպանված են ${outputDir} դիրեկտորիայում`);
}

// ─── RUN ────────────────────────────────────────────────────────────

function findFiles(dir: string): string[] {
  let results: string[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results = results.concat(findFiles(fullPath));
      }
    } else if (extensions.includes(path.extname(file))) {
      if (!isExcludedFile(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// Սկսել վերլուծությունը src դիրեկտորիայից
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  const files = findFiles(srcDir);
  console.log(`🔍 Վերլուծվում է ${files.length} ֆայլ...`);
  
  files.forEach(file => {
    analyzeFile(file);
  });

  generateI18nStructure();
} else {
  console.log('❌ src դիրեկտորիան չի գտնվել');
}