const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'content', 'database.ts');

console.log('📁 Opening:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// ✅ Ճիշտ expand ֆունկցիա
const correctExpand = `function expand(q: QuickLesson): ContentLesson {
  return {
    id: q.id,
    worldId: q.worldId,
    slug: q.slug,
    title: q.title,
    concept: q.concept,
    difficulty: q.difficulty,
    vocabulary: q.vocab.map(([h, e, r], i) => v(\`\${q.id}_v\${i}\`, h, e, r)),
    phrases: q.phrases.map(([h, e, r, altEn], i) =>
      p(\`\${q.id}_p\${i}\`, h, e, r, altEn ? { en: altEn } : undefined)
    ),
    dialogues: q.dialogues.map((dl, i) =>
      d(\`\${q.id}_d\${i}\`, dl.title,
        dl.turns.map(([s, h, e, r]) => t(s, h, e, r))
      )
    ),
  };
}`;

// 🔍 Գտնել expand ֆունկցիան (բոլոր հնարավոր ձևերով)
const expandRegex = /function\s+expand\s*\(\s*q\s*:\s*QuickLesson\s*\)\s*:\s*ContentLesson\s*\{([\s\S]*?)\n\s*\}/;

const match = content.match(expandRegex);

if (match) {
    console.log('✅ Found expand function, replacing...');
    content = content.replace(expandRegex, correctExpand);
    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed expand() function!');
} else {
    console.log('❌ Regex did not match. Trying alternative...');
    
    // 🟡 Alternative: find by line
    const lines = content.split('\n');
    let expandStart = -1;
    let expandEnd = -1;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function expand') && lines[i].includes('QuickLesson')) {
            expandStart = i;
            break;
        }
    }
    
    if (expandStart !== -1) {
        // Find the end of the function
        for (let i = expandStart; i < lines.length; i++) {
            if (lines[i].includes('{')) braceCount++;
            if (lines[i].includes('}')) braceCount--;
            if (braceCount === 0 && i > expandStart) {
                expandEnd = i;
                break;
            }
        }
        
        if (expandEnd !== -1) {
            const before = lines.slice(0, expandStart).join('\n');
            const after = lines.slice(expandEnd + 1).join('\n');
            content = before + '\n' + correctExpand + '\n' + after;
            fs.writeFileSync(filePath, content);
            console.log('✅ Fixed expand() function using line-based replacement!');
        } else {
            console.log('❌ Could not find end of expand function');
        }
    } else {
        console.log('❌ Could not find expand function at all');
    }
}

console.log('\n📝 Now run: npm run build');