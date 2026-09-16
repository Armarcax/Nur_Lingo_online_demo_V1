// scripts/build-lesson-dictionary.js
// Run: node scripts/build-lesson-dictionary.js

const fs = require('fs');
const path = require('path');

const BUILDERS_DIR = path.join(process.cwd(), 'src', 'lib', 'content', 'builders');
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'dictionaries');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'lesson-dictionary.json');

// ============================================================
// EXTRACT FROM world1_quick.ts
// ============================================================

function extractWorld1Quick(content) {
  const lessons = [];
  
  const match = content.match(/const QUICK_LESSONS: QuickLesson\[]?\s*=\s*\[([\s\S]*?)\];/);
  if (!match) {
    console.log('   ⚠️ No QUICK_LESSONS found');
    return lessons;
  }
  
  const arrayContent = match[1];
  
  let i = 0;
  while (i < arrayContent.length) {
    const startMatch = arrayContent.substring(i).match(/\{\s*id:\s*["']w1_l/);
    if (!startMatch) break;
    
    const startIdx = i + startMatch.index;
    let braceCount = 0;
    let endIdx = startIdx;
    
    for (let j = startIdx; j < arrayContent.length; j++) {
      if (arrayContent[j] === '{') braceCount++;
      if (arrayContent[j] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = j + 1;
          break;
        }
      }
    }
    
    const lessonBlock = arrayContent.substring(startIdx, endIdx);
    const lesson = parseQuickLesson(lessonBlock);
    if (lesson) {
      lessons.push(lesson);
      console.log(`   📝 ${lesson.id} - vocab: ${lesson.vocabulary.length}, phrases: ${lesson.phrases.length}, dialogues: ${lesson.dialogues.length}, exercises: ${lesson.exercises.length}`);
    }
    
    i = endIdx;
  }
  
  return lessons;
}

function parseQuickLesson(content) {
  try {
    const idMatch = content.match(/id:\s*["']([^"']+)["']/);
    if (!idMatch) return null;
    const id = idMatch[1];
    
    if (id.includes('_ex')) return null;
    
    const worldIdMatch = content.match(/worldId:\s*["']([^"']+)["']/);
    const worldId = worldIdMatch ? worldIdMatch[1] : 'w1';
    
    const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
    const slug = slugMatch ? slugMatch[1] : id;
    
    const difficultyMatch = content.match(/difficulty:\s*["']([^"']+)["']/);
    const difficulty = difficultyMatch ? difficultyMatch[1] : 'A1';
    
    const titleMatch = content.match(/title:\s*\{\s*en:\s*["']([^"']+)["'],\s*hy:\s*["']([^"']+)["'],\s*ru:\s*["']([^"']+)["']\s*\}/);
    const title = titleMatch ? { en: titleMatch[1], hy: titleMatch[2], ru: titleMatch[3] } : { en: '', hy: '', ru: '' };
    
    const conceptMatch = content.match(/concept:\s*\{\s*en:\s*["']([^"']+)["'],\s*hy:\s*["']([^"']+)["'],\s*ru:\s*["']([^"']+)["']\s*\}/);
    const concept = conceptMatch ? { en: conceptMatch[1], hy: conceptMatch[2], ru: conceptMatch[3] } : { en: '', hy: '', ru: '' };
    
    const vocabulary = extractVocab(content);
    const phrases = extractPhrases(content);
    
    // ✅ Dialogue-ները ստեղծում ենք vocab-ից (եթե չկան)
    let dialogues = extractDialogues(content);
    if (dialogues.length === 0) {
      dialogues = buildDialoguesFromVocab(vocabulary, id);
    }
    
    const exercises = extractExercises(content);
    const finalExercises = exercises.length > 0 ? exercises : buildExercises(vocabulary, id);
    
    return {
      id,
      worldId,
      slug,
      title,
      concept,
      difficulty,
      vocabulary: vocabulary,
      phrases: phrases,
      dialogues: dialogues,
      exercises: finalExercises,
    };
  } catch (error) {
    console.log(`   ⚠️ Error parsing lesson: ${error.message}`);
    return null;
  }
}

// ============================================================
// EXTRACT VOCAB
// ============================================================

function extractVocab(content) {
  const vocab = [];
  
  const vocabStart = content.indexOf('vocab:');
  if (vocabStart === -1) return vocab;
  
  let bracketCount = 0;
  let start = -1;
  let end = -1;
  
  for (let i = vocabStart; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) start = i;
      bracketCount++;
    }
    if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (start === -1 || end === -1) return vocab;
  
  const vocabText = content.substring(start + 1, end);
  
  const items = vocabText.match(/\[["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']*)["']\]/g);
  if (items) {
    for (const item of items) {
      const m = item.match(/["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']*)["']/);
      if (m) {
        vocab.push({ id: `v${vocab.length + 1}`, hy: m[1], en: m[2], ru: m[3] || '' });
      }
    }
  }
  
  return vocab;
}

// ============================================================
// EXTRACT PHRASES
// ============================================================

function extractPhrases(content) {
  const phrases = [];
  
  const phrasesStart = content.indexOf('phrases:');
  if (phrasesStart === -1) return phrases;
  
  let bracketCount = 0;
  let start = -1;
  let end = -1;
  
  for (let i = phrasesStart; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) start = i;
      bracketCount++;
    }
    if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (start === -1 || end === -1) return phrases;
  
  const phrasesText = content.substring(start + 1, end);
  
  const items = phrasesText.match(/\[["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["'](?:\s*,\s*\[[^\]]*\])?\]/g);
  if (items) {
    for (const item of items) {
      const m = item.match(/["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/);
      if (m) {
        phrases.push({ id: `p${phrases.length + 1}`, hy: m[1], en: m[2], ru: m[3] });
      }
    }
  }
  
  return phrases;
}

// ============================================================
// EXTRACT DIALOGUES - ATTEMPT 1
// ============================================================

function extractDialogues(content) {
  const dialogues = [];
  
  const dialoguesStart = content.indexOf('dialogues:');
  if (dialoguesStart === -1) return dialogues;
  
  let bracketCount = 0;
  let start = -1;
  let end = -1;
  
  for (let i = dialoguesStart; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) start = i;
      bracketCount++;
    }
    if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (start === -1 || end === -1) return dialogues;
  
  let dialoguesText = content.substring(start + 1, end);
  
  let idx = 0;
  while (idx < dialoguesText.length) {
    const titleStart = dialoguesText.indexOf('{ title:', idx);
    if (titleStart === -1) break;
    
    let braceCount2 = 0;
    let objEnd = titleStart;
    for (let j = titleStart; j < dialoguesText.length; j++) {
      if (dialoguesText[j] === '{') braceCount2++;
      if (dialoguesText[j] === '}') {
        braceCount2--;
        if (braceCount2 === 0) {
          objEnd = j + 1;
          break;
        }
      }
    }
    
    const dialogueObj = dialoguesText.substring(titleStart, objEnd);
    
    const titleEn = dialogueObj.match(/en:\s*["']([^"']+)["']/);
    const titleHy = dialogueObj.match(/hy:\s*["']([^"']+)["']/);
    const titleRu = dialogueObj.match(/ru:\s*["']([^"']+)["']/);
    
    const title = {
      en: titleEn ? titleEn[1] : '',
      hy: titleHy ? titleHy[1] : '',
      ru: titleRu ? titleRu[1] : ''
    };
    
    const turnsMatch = dialogueObj.match(/turns:\s*\[([\s\S]*?)\]\s*\}/);
    const turns = [];
    
    if (turnsMatch) {
      const turnItems = turnsMatch[1].match(/\[["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\]/g);
      if (turnItems) {
        for (const ti of turnItems) {
          const m = ti.match(/["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/);
          if (m) {
            turns.push({ speaker: m[1], hy: m[2], en: m[3], ru: m[4] });
          }
        }
      }
    }
    
    if (turns.length > 0) {
      dialogues.push({ id: `d${dialogues.length + 1}`, title, turns });
    }
    
    idx = objEnd;
  }
  
  return dialogues;
}

// ============================================================
// BUILD DIALOGUES FROM VOCABULARY (FALLBACK)
// ============================================================

function buildDialoguesFromVocab(vocabulary, lessonId) {
  const dialogues = [];
  
  if (vocabulary.length < 3) return dialogues;
  
  // ✅ Ստեղծում ենք 2-3 պարզ երկխոսություն
  const dialogTitles = [
    { en: 'Introduction', hy: 'Ծանոթություն', ru: 'Знакомство' },
    { en: 'Question', hy: 'Հարց', ru: 'Вопрос' },
    { en: 'Response', hy: 'Պատասխան', ru: 'Ответ' }
  ];
  
  for (let d = 0; d < Math.min(3, Math.floor(vocabulary.length / 5)); d++) {
    const startIdx = d * 5;
    const words = vocabulary.slice(startIdx, startIdx + 5);
    if (words.length < 2) break;
    
    const turns = [];
    
    // ✅ First turn: question
    const qWord = words[0];
    turns.push({
      speaker: 'nurik',
      hy: `Ի՞նչ է նշանակում "${qWord.hy}"?`,
      en: `What does "${qWord.hy}" mean?`,
      ru: `Что означает "${qWord.hy}"?`
    });
    
    // ✅ Second turn: answer
    const aWord = words[1] || words[0];
    turns.push({
      speaker: 'user',
      hy: `"${aWord.hy}" նշանակում է "${aWord.en}"։`,
      en: `"${aWord.hy}" means "${aWord.en}".`,
      ru: `"${aWord.hy}" означает "${aWord.en}".`
    });
    
    // ✅ Third turn: confirmation
    if (words.length > 2) {
      turns.push({
        speaker: 'nurik',
        hy: `Ճիշտ է։ Իսկ "${words[2].hy}"?`,
        en: `Correct. And "${words[2].hy}"?`,
        ru: `Верно. А "${words[2].hy}"?`
      });
      turns.push({
        speaker: 'user',
        hy: `"${words[2].hy}" - "${words[2].en}"։`,
        en: `"${words[2].hy}" - "${words[2].en}".`,
        ru: `"${words[2].hy}" - "${words[2].en}".`
      });
    }
    
    if (turns.length >= 2) {
      dialogues.push({
        id: `d${dialogues.length + 1}`,
        title: dialogTitles[d % dialogTitles.length],
        turns: turns
      });
    }
  }
  
  return dialogues;
}

// ============================================================
// EXTRACT EXERCISES
// ============================================================

function extractExercises(content) {
  const exercises = [];
  
  const exercisesStart = content.indexOf('exercises:');
  if (exercisesStart === -1) return exercises;
  
  let bracketCount = 0;
  let start = -1;
  let end = -1;
  
  for (let i = exercisesStart; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) start = i;
      bracketCount++;
    }
    if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        end = i;
        break;
      }
    }
  }
  
  if (start === -1 || end === -1) return exercises;
  
  const exercisesText = content.substring(start + 1, end);
  
  const items = exercisesText.match(/\{\s*id:\s*["']([^"']+)["'][\s\S]*?\}\s*(?:,|\}|$)/g);
  if (items) {
    for (const item of items) {
      const idMatch = item.match(/id:\s*["']([^"']+)["']/);
      const typeMatch = item.match(/type:\s*["']([^"']+)["']/);
      
      if (idMatch && typeMatch) {
        const id = idMatch[1];
        const type = typeMatch[1];
        
        const promptMatch = item.match(/prompt:\s*\{\s*en:\s*["']([^"']+)["'],\s*hy:\s*["']([^"']+)["'],\s*ru:\s*["']([^"']+)["']\s*\}/);
        const prompt = promptMatch ? { en: promptMatch[1], hy: promptMatch[2], ru: promptMatch[3] } : { en: '', hy: '', ru: '' };
        
        let targetAnswer = '';
        const targetMatch = item.match(/targetAnswer:\s*(["']?)([\s\S]*?)\1\s*(?:,|\}|$)/);
        if (targetMatch) {
          targetAnswer = targetMatch[2].trim();
        }
        
        let pairs = [];
        const pairsMatch = item.match(/pairs:\s*\[([\s\S]*?)\]\s*(?:,|\}|$)/);
        if (pairsMatch) {
          const pairItems = pairsMatch[1].match(/\[["']([^"']+)["']\s*,\s*["']([^"']+)["']\]/g);
          if (pairItems) {
            for (const p of pairItems) {
              const m = p.match(/["']([^"']+)["']\s*,\s*["']([^"']+)["']/);
              if (m) pairs.push([m[1], m[2]]);
            }
          }
        }
        
        exercises.push({
          id,
          type,
          prompt,
          targetAnswer,
          pairs: pairs,
          hayqReward: 10,
        });
      }
    }
  }
  
  return exercises;
}

// ============================================================
// BUILD EXERCISES FROM VOCABULARY (FALLBACK)
// ============================================================

function buildExercises(vocabulary, lessonId) {
  const exercises = [];
  
  for (let i = 0; i < Math.min(vocabulary.length, 10); i++) {
    const word = vocabulary[i];
    const options = [word.en];
    const others = vocabulary.filter((_, idx) => idx !== i).slice(0, 3);
    for (const other of others) {
      if (!options.includes(other.en)) options.push(other.en);
    }
    exercises.push({
      id: `${lessonId}_ex_mc_${i + 1}`,
      type: 'multiple_choice',
      prompt: {
        en: `What does "${word.hy}" mean?`,
        hy: `Ի՞նչ է նշանակում "${word.hy}"`,
        ru: `Что означает "${word.hy}"?`,
      },
      targetAnswer: word.en,
      options: options,
      hayqReward: 10,
    });
  }
  
  return exercises;
}

// ============================================================
// MAIN
// ============================================================

function buildLessonDictionary() {
  console.log('📚 Building Lesson Dictionary from World files...\n');
  console.log('='.repeat(60));
  
  const allLessons = [];
  const files = ['world1_quick.ts'];
  
  for (const fileName of files) {
    console.log(`📖 Processing ${fileName}...`);
    const filePath = path.join(BUILDERS_DIR, fileName);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️ File not found`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lessons = extractWorld1Quick(content);
      
      if (lessons.length > 0) {
        allLessons.push(...lessons);
        console.log(`   ✅ ${lessons.length} lessons extracted`);
        const first = lessons[0];
        console.log(`   📝 ${first.id} - vocab: ${first.vocabulary.length}, phrases: ${first.phrases.length}, dialogues: ${first.dialogues.length}, exercises: ${first.exercises.length}`);
        if (first.vocabulary.length > 0) {
          console.log(`   📝 First vocab: ${first.vocabulary[0].hy} → ${first.vocabulary[0].en}`);
        }
      } else {
        console.log(`   ⚠️ No lessons found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Total lessons: ${allLessons.length}`);
  
  let totalVocab = 0, totalPhrases = 0, totalDialogues = 0, totalExercises = 0;
  for (const lesson of allLessons) {
    totalVocab += lesson.vocabulary.length;
    totalPhrases += lesson.phrases.length;
    totalDialogues += lesson.dialogues.length;
    totalExercises += lesson.exercises.length;
  }
  
  const dictionary = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    totalLessons: allLessons.length,
    totalVocabulary: totalVocab,
    totalPhrases: totalPhrases,
    totalDialogues: totalDialogues,
    totalExercises: totalExercises,
    lessons: allLessons,
  };
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dictionary, null, 2));
  console.log(`\n✅ Saved: ${OUTPUT_FILE}`);
  
  const publicDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicFile = path.join(publicDir, 'lesson-dictionary.json');
  
  const lessonDict = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    totalLessons: allLessons.length,
    lessons: allLessons.reduce((acc, l) => { acc[l.id] = l; return acc; }, {}),
    stats: { totalLessons: allLessons.length, totalVocabulary: totalVocab, totalPhrases: totalPhrases, totalDialogues: totalDialogues, totalExercises: totalExercises }
  };
  fs.writeFileSync(publicFile, JSON.stringify(lessonDict, null, 2));
  console.log(`✅ Saved: ${publicFile}`);
  
  console.log('\n📊 Summary:');
  console.log(`   Lessons: ${allLessons.length}`);
  console.log(`   Vocabulary: ${totalVocab}`);
  console.log(`   Phrases: ${totalPhrases}`);
  console.log(`   Dialogues: ${totalDialogues}`);
  console.log(`   Exercises: ${totalExercises}`);
}

// ============================================================
// RUN
// ============================================================

try {
  buildLessonDictionary();
} catch (error) {
  console.error('❌ Build failed:', error);
  console.error(error.stack);
}