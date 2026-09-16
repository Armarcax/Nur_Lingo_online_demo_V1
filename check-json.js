// check-json.js
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2] || 'src/lib/i18n/translations.json';

console.log(`🔍 Ստուգում ենք ֆայլը: ${filePath}\n`);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Ստուգել բաց փակագծերը
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escape = false;
    let lineNumber = 1;
    let charNumber = 0;
    let error = null;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        charNumber++;
        
        if (char === '\n') {
            lineNumber++;
            charNumber = 0;
        }
        
        if (escape) {
            escape = false;
            continue;
        }
        
        if (char === '\\') {
            escape = true;
            continue;
        }
        
        if (char === '"' && !escape) {
            inString = !inString;
            continue;
        }
        
        if (!inString) {
            if (char === '{') openBraces++;
            if (char === '}') {
                openBraces--;
                if (openBraces < 0) {
                    error = `❌ Ավելորդ փակ փակագիծ (}) գծում ${lineNumber}, դիրքում ${charNumber}`;
                    break;
                }
            }
            if (char === '[') openBrackets++;
            if (char === ']') {
                openBrackets--;
                if (openBrackets < 0) {
                    error = `❌ Ավելորդ փակ քառակուսի (]) գծում ${lineNumber}, դիրքում ${charNumber}`;
                    break;
                }
            }
        }
    }
    
    if (error) {
        console.log(error);
        console.log(`\n📊 Open braces: ${openBraces}, Open brackets: ${openBrackets}`);
        process.exit(1);
    }
    
    if (openBraces > 0) {
        console.log(`❌ Բաց է մնացել ${openBraces} փակագիծ ({)`);
        process.exit(1);
    }
    
    if (openBrackets > 0) {
        console.log(`❌ Բաց է մնացել ${openBrackets} քառակուսի ([)`);
        process.exit(1);
    }
    
    console.log('✅ Փակագծերը ճիշտ են:');
    
    // 2. Parse JSON
    try {
        const json = JSON.parse(content);
        console.log('✅ JSON-ը վավեր է:');
        
        // 3. Ցույց տալ վիճակագրությունը
        console.log('\n📊 Վիճակագրություն:');
        for (const lang of ['hy', 'en', 'ru']) {
            if (json[lang]) {
                const keys = Object.keys(json[lang]);
                console.log(`  ${lang}: ${keys.length} key`);
            }
        }
        
        // 4. Ստուգել կրկնվող key-երը
        console.log('\n🔍 Ստուգում ենք կրկնվող key-երը...');
        let hasDuplicates = false;
        for (const lang of ['hy', 'en', 'ru']) {
            if (!json[lang]) continue;
            const keys = Object.keys(json[lang]);
            const unique = new Set(keys);
            if (keys.length !== unique.size) {
                hasDuplicates = true;
                console.log(`\n⚠️ ${lang} ում կան կրկնվող key-եր:`);
                const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
                duplicates.forEach(key => {
                    console.log(`    - ${key}`);
                });
            }
        }
        
        if (!hasDuplicates) {
            console.log('✅ Կրկնվող key-եր չկան');
        }
        
        // 5. Ստուգել կոնկրետ խնդրահարույց key-երը
        console.log('\n🔍 Ստուգում ենք հայտնի խնդրահարույց key-երը...');
        const problemKeys = ['page_mode', 'page_audio_mode', 'page_mode_audiomode_touppercase_'];
        for (const lang of ['hy', 'en', 'ru']) {
            if (!json[lang]) continue;
            const keys = Object.keys(json[lang]);
            problemKeys.forEach(key => {
                if (keys.includes(key)) {
                    console.log(`  ${lang}.${key} = "${json[lang][key]}"`);
                }
            });
        }
        
    } catch (parseError) {
        console.log(`❌ JSON-ը վավեր չէ:`);
        console.log(`   ${parseError.message}`);
        
        // Ցույց տալ սխալի տեղը
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const start = Math.max(0, pos - 50);
            const end = Math.min(content.length, pos + 50);
            console.log(`\n📄 Սխալի շուրջ տեքստը:`);
            console.log(`   ...${content.substring(start, end)}...`);
            console.log(`   ${' '.repeat(Math.min(pos - start + 3, 50))}↑`);
            
            // Ցույց տալ տողը
            const lines = content.substring(0, pos).split('\n');
            const lineNumber = lines.length;
            const lineContent = content.split('\n')[lineNumber - 1];
            console.log(`\n📍 Գիծ ${lineNumber}:`);
            console.log(`   ${lineContent}`);
        }
        
        process.exit(1);
    }
    
} catch (error) {
    console.log(`❌ Ֆայլը չի կարող կարդալ: ${error.message}`);
    process.exit(1);
}