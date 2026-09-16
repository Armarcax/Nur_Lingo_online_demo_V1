// scripts/find-latin-armenian.js
// NUR Lingo — Find Latin-script Armenian words and texts

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

// ─── ARMENIAN LATIN PATTERNS ──────────────────────────────────────

// Common Armenian words written in Latin script
const LATIN_ARMENIAN_PATTERNS = [
  // Greetings
  { latin: /Barev/i, armenian: 'Բարև' },
  { latin: /Vonts es/i, armenian: 'Ոնց ես' },
  { latin: /Lav em/i, armenian: 'Լավ եմ' },
  { latin: /Shnorhakalutyun/i, armenian: 'Շնորհակալություն' },
  { latin: /Mersi/i, armenian: 'Մերսի' },
  { latin: /Ayo/i, armenian: 'Այո' },
  { latin: /Voch/i, armenian: 'Ոչ' },
  
  // Names and places
  { latin: /Anund/i, armenian: 'Անուն' },
  { latin: /Erevan/i, armenian: 'Երևան' },
  { latin: /Hayastan/i, armenian: 'Հայաստան' },
  
  // Verbs and nouns
  { latin: /Sirum/i, armenian: 'Սիրում' },
  { latin: /Aprum/i, armenian: 'Ապրում' },
  { latin: /Gnum/i, armenian: 'Գնում' },
  { latin: /Tun/i, armenian: 'Տուն' },
  { latin: /Mayr/i, armenian: 'Մայր' },
  { latin: /Hayr/i, armenian: 'Հայր' },
  
  // Question words
  { latin: /Inch/i, armenian: 'Ինչ' },
  { latin: /Vonts/i, armenian: 'Ոնց' },
  { latin: /Du/i, armenian: 'Դու' },
  { latin: /Es/i, armenian: 'Ես' },
  
  // Common phrases
  { latin: /Urakh em/i, armenian: 'Ուրախ եմ' },
  { latin: /Tsanotel/i, armenian: 'Ծանոթանալ' },
  { latin: /Sharunakel/i, armenian: 'Շարունակել' },
  { latin: /Sksel/i, armenian: 'Սկսել' },
  { latin: /Sovecel/i, armenian: 'Սովորել' },
  { latin: /Avart/i, armenian: 'Ավարտ' },
  { latin: /Nunel/i, armenian: 'Նունել' },
  
  // Course/Lesson related
  { latin: /Das/i, armenian: 'Դաս' },
  { latin: /Dprots/i, armenian: 'Դպրոց' },
  { latin: /Usucich/i, armenian: 'Ուսուցիչ' },
  { latin: /Krtutun/i, armenian: 'Կրթություն' },
  { latin: /Aysqan/i, armenian: 'Այսքան' },
  
  // Food related
  { latin: /Utelik/i, armenian: 'Ուտելիք' },
  { latin: /Xmelik/i, armenian: 'Խմելիք' },
  { latin: /Restoran/i, armenian: 'Ռեստորան' },
  
  // Family related
  { latin: /Yntaniq/i, armenian: 'Ընտանիք' },
  { latin: /Yntaniqi/i, armenian: 'Ընտանիքի' },
  
  // Other common words
  { latin: /Astvac/i, armenian: 'Աստված' },
  { latin: /Hayrenik/i, armenian: 'Հայրենիք' },
  { latin: /Lusin/i, armenian: 'Լուսին' },
  { latin: /Areg/i, armenian: 'Արեգ' },
  
  // Armenian suffixes
  { latin: /um$/i, armenian: 'ում' },
  { latin: /y$/i, armenian: 'ը' },
  { latin: /ner$/i, armenian: 'ներ' },
  { latin: /ov$/i, armenian: 'ով' },
];

// ─── FILE EXTENSIONS TO CHECK ─────────────────────────────────────

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.json', '.md', '.txt'];

// ─── FOLDERS TO CHECK ─────────────────────────────────────────────

const FOLDERS_TO_CHECK = [
  'src/app',
  'src/components',
  'src/lib',
  'data/dictionaries',
  'public/audio',
];

// ─── MAIN FUNCTION ─────────────────────────────────────────────────

function findLatinArmenian() {
  log('\n🔍 NUR Lingo — Find Latin Armenian Texts\n', 'bold');
  log('═'.repeat(70), 'cyan');

  let totalFiles = 0;
  let totalMatches = 0;
  const results = [];

  for (const folder of FOLDERS_TO_CHECK) {
    const folderPath = path.join(PROJECT_ROOT, folder);
    if (!fs.existsSync(folderPath)) {
      log(`⚠️  ${folder} — չի գտնվել`, 'yellow');
      continue;
    }

    const files = getAllFiles(folderPath);
    
    for (const file of files) {
      const ext = path.extname(file);
      if (!EXTENSIONS.includes(ext)) continue;

      const relativePath = path.relative(PROJECT_ROOT, file);
      const content = fs.readFileSync(file, 'utf8');
      
      const matches = findMatches(content, relativePath);
      
      if (matches.length > 0) {
        totalFiles++;
        totalMatches += matches.length;
        results.push({ file: relativePath, matches });
      }
    }
  }

  // ─── DISPLAY RESULTS ─────────────────────────────────────────────

  if (results.length === 0) {
    log('\n✅ Ոչ մի լատինատառ հայերեն տեքստ չի գտնվել!', 'green');
    log('═'.repeat(70), 'cyan');
    return;
  }

  log('\n📝 Գտնված լատինատառ հայերեն տեքստեր:\n', 'bold');

  for (const result of results) {
    log(`📄 ${result.file}`, 'cyan');
    
    for (const match of result.matches) {
      log(`   📍 Տող ${match.line}:`, 'yellow');
      log(`      ❌ "${match.text}"`, 'red');
      log(`      ✅ պետք է լինի: "${match.suggestion}"`, 'green');
      log(`      📝 ${match.context}`, 'dim');
      log('');
    }
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────

  log('═'.repeat(70), 'cyan');
  log(`📊 Ամփոփում:`, 'bold');
  log(`   ✅ Ստուգված ֆայլեր: ${totalFiles}`, 'green');
  log(`   ⚠️  Գտնված խնդիրներ: ${totalMatches}`, totalMatches > 0 ? 'yellow' : 'green');
  log('═'.repeat(70), 'cyan');

  // ─── SUGGESTIONS ──────────────────────────────────────────────────

  if (totalMatches > 0) {
    log('\n💡 Առաջարկություններ:', 'bold');
    log('   1. Փոխարինեք բոլոր լատինատառ հայերեն բառերը հայատառով', 'yellow');
    log('   2. Օգտագործեք Unicode հայերեն տառեր (Բարև, ոչ թե Barev)', 'yellow');
    log('   3. Ստուգեք dictionary.json և այլ տվյալների ֆայլերը', 'yellow');
    log('   4. Դասերի բովանդակության մեջ փոխարինեք բոլոր տեքստերը', 'yellow');
  }

  log('\n═'.repeat(70), 'cyan');
}

// ─── HELPERS ──────────────────────────────────────────────────────

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (item === 'node_modules' || item === '.next' || item === '.git') continue;
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  
  return results;
}

function findMatches(content, filePath) {
  const lines = content.split('\n');
  const matches = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
    if (line.includes('import ') || line.includes('export ')) continue;
    if (line.includes('from ') && line.includes('"')) continue;
    
    for (const pattern of LATIN_ARMENIAN_PATTERNS) {
      const regex = new RegExp(pattern.latin, 'g');
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        // Check if it's inside a string or JSX text
        const isInString = isInsideString(line, match.index);
        const isInJSX = isInsideJSX(line, match.index);
        
        if (isInString || isInJSX) {
          const context = getContext(line, match.index, match[0].length);
          matches.push({
            line: i + 1,
            text: match[0],
            suggestion: pattern.armenian,
            context: context,
          });
        }
      }
    }
  }
  
  return matches;
}

function isInsideString(line, index) {
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < index; i++) {
    const char = line[i];
    
    if (char === '"' || char === "'" || char === '`') {
      if (inString && char === stringChar) {
        inString = false;
      } else if (!inString) {
        inString = true;
        stringChar = char;
      }
    }
  }
  
  return inString;
}

function isInsideJSX(line, index) {
  // Check if inside JSX text (between tags)
  const before = line.substring(0, index);
  const after = line.substring(index);
  
  // Check if after the text there is a closing tag
  const hasClosingTag = after.includes('</') || after.includes('>');
  const hasOpeningTag = before.includes('<') && !before.includes('>');
  
  return hasOpeningTag || hasClosingTag;
}

function getContext(line, start, length) {
  const before = line.substring(Math.max(0, start - 20), start);
  const text = line.substring(start, start + length);
  const after = line.substring(start + length, Math.min(line.length, start + length + 20));
  
  return `...${before}${text}${after}...`;
}

// ─── RUN ──────────────────────────────────────────────────────────

findLatinArmenian();