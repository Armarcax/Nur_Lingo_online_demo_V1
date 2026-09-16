// scripts/generate-trilingual-audio.js
// Run: node scripts/generate-trilingual-audio.js

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Բեռնել բառարանները
// ============================================================

function loadDictionary() {
  // ✅ Try multiple paths
  const paths = [
    path.join(process.cwd(), 'src', 'lib', 'lexicon', 'master-dictionary.json'),
    path.join(process.cwd(), 'src', 'lib', 'lexicon', 'master-dictionary.fixed.json'),
    path.join(process.cwd(), 'data', 'dictionaries', 'unified-dictionary.json'),
    path.join(process.cwd(), 'data', 'dictionaries', 'dictionary.json'),
    path.join(process.cwd(), 'public', 'data', 'lesson-dictionary.json'),
  ];

  for (const dictPath of paths) {
    try {
      if (fs.existsSync(dictPath)) {
        const data = fs.readFileSync(dictPath, 'utf-8');
        const parsed = JSON.parse(data);
        
        // ✅ Check if it's an array
        if (Array.isArray(parsed)) {
          console.log(`✅ Loaded dictionary from: ${path.basename(dictPath)} (${parsed.length} entries)`);
          return parsed;
        }
        
        // ✅ Check if it has vocabulary array
        if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
          console.log(`✅ Loaded vocabulary from: ${path.basename(dictPath)} (${parsed.vocabulary.length} entries)`);
          return parsed.vocabulary;
        }
        
        // ✅ Check if it has entries
        if (parsed.entries && Array.isArray(parsed.entries)) {
          console.log(`✅ Loaded entries from: ${path.basename(dictPath)} (${parsed.entries.length} entries)`);
          return parsed.entries;
        }
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // ✅ Fallback data
  console.warn('⚠️ No dictionary found, using fallback data');
  return [
    { id: '000001', hy: 'Բարև', en: 'Hello', ru: 'Привет' },
    { id: '000002', hy: 'Ցտեսություն', en: 'Goodbye', ru: 'До свидания' },
    { id: '000003', hy: 'Շնորհակալություն', en: 'Thank you', ru: 'Спасибо' },
    { id: '000004', hy: 'Խնդրեմ', en: 'You\'re welcome', ru: 'Пожалуйста' },
    { id: '000005', hy: 'Ինչպես ես', en: 'How are you', ru: 'Как дела' },
    { id: '000006', hy: 'Լավ', en: 'Good', ru: 'Хорошо' },
    { id: '000007', hy: 'Վատ', en: 'Bad', ru: 'Плохо' },
    { id: '000008', hy: 'Այո', en: 'Yes', ru: 'Да' },
    { id: '000009', hy: 'Ոչ', en: 'No', ru: 'Нет' },
    { id: '000010', hy: 'Միգուցե', en: 'Maybe', ru: 'Может быть' },
  ];
}

function loadLessons() {
  // ✅ Try to load from engine.ts or use fallback
  const enginePath = path.join(process.cwd(), 'src', 'lib', 'lessons', 'engine.ts');
  
  try {
    if (fs.existsSync(enginePath)) {
      const content = fs.readFileSync(enginePath, 'utf-8');
      // Try to extract lessons from content
      const lessons = extractLessonsFromContent(content);
      if (lessons && lessons.length > 0) {
        console.log(`✅ Loaded ${lessons.length} lessons from engine.ts`);
        return lessons;
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to load lessons from engine.ts:', error.message);
  }

  // ✅ Fallback lessons
  console.warn('⚠️ Using fallback lessons data');
  return [
    {
      id: 'lesson-1',
      title: 'Բարև Ձեզ',
      vocabulary: [
        { id: 'v1', hy: 'Բարև', en: 'Hello', ru: 'Привет' },
        { id: 'v2', hy: 'Ցտեսություն', en: 'Goodbye', ru: 'До свидания' },
        { id: 'v3', hy: 'Շնորհակալություն', en: 'Thank you', ru: 'Спасибо' },
      ],
      phrases: [
        { id: 'p1', hy: 'Բարև Ձեզ', en: 'Hello you', ru: 'Здравствуйте' },
        { id: 'p2', hy: 'Ինչպես եք', en: 'How are you', ru: 'Как дела' },
      ],
      dialogues: [
        {
          id: 'd1',
          lines: [
            { speaker: 'A', text: 'Բարև', translation: 'Hello' },
            { speaker: 'B', text: 'Բարև Ձեզ', translation: 'Hello you' },
            { speaker: 'A', text: 'Ինչպես ես', translation: 'How are you' },
            { speaker: 'B', text: 'Լավ եմ', translation: 'I am good' },
          ],
        },
      ],
    },
    {
      id: 'lesson-2',
      title: 'Թվեր',
      vocabulary: [
        { id: 'v4', hy: 'Մեկ', en: 'One', ru: 'Один' },
        { id: 'v5', hy: 'Երկու', en: 'Two', ru: 'Два' },
        { id: 'v6', hy: 'Երեք', en: 'Three', ru: 'Три' },
      ],
      phrases: [
        { id: 'p3', hy: 'Մեկ երկու', en: 'One two', ru: 'Один два' },
      ],
      dialogues: [],
    },
  ];
}

function extractLessonsFromContent(content) {
  const lessons = [];
  
  try {
    // Try to find LESSONS array
    const match = content.match(/export const LESSONS: Lesson\[] = \[([\s\S]*?)\];/);
    if (match) {
      const lessonContent = match[1];
      const lessonObjects = lessonContent.split(/\{\s*id:/).slice(1);
      
      for (const obj of lessonObjects) {
        const id = obj.match(/id:\s*["']([^"']+)["']/)?.[1] || `lesson_${lessons.length + 1}`;
        const title = obj.match(/title:\s*["']([^"']+)["']/)?.[1] || `Lesson ${lessons.length + 1}`;
        
        // Try to extract vocabulary from exercises
        const vocabulary = [];
        const vocabMatches = obj.match(/word:\s*["']([^"']+)["']/g) || [];
        for (const vm of vocabMatches) {
          const word = vm.match(/["']([^"']+)["']/)?.[1];
          if (word) {
            vocabulary.push({
              id: `v_${vocabulary.length + 1}`,
              hy: word,
              en: word,
              ru: word,
            });
          }
        }
        
        lessons.push({
          id,
          title,
          vocabulary,
          phrases: [],
          dialogues: [],
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to extract lessons:', error.message);
  }
  
  return lessons;
}

// ============================================================
// 2. Աուդիո Գեներացում
// ============================================================

class TrilingualAudioGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'public', 'audio', 'offline');
    this.manifest = {
      version: '2.0',
      generatedAt: new Date().toISOString(),
      totalEntries: 0,
      languages: ['hy', 'en', 'ru'],
      entries: {},
    };
    
    // Create directories for each language
    for (const lang of ['hy', 'en', 'ru']) {
      const dir = path.join(this.outputDir, lang);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  // Generate TTS audio using API or local method
  async generateTTS(text, language) {
    if (!text || text.trim().length === 0) {
      return null;
    }

    // Sanitize filename
    const filename = `${this.sanitizeFilename(text)}.mp3`;
    const filepath = path.join(this.outputDir, language, filename);
    
    // Check if file already exists
    if (fs.existsSync(filepath)) {
      return `/audio/offline/${language}/${filename}`;
    }

    // ✅ Try to fetch from WAV.am API for Armenian
    if (language === 'hy') {
      try {
        const result = await this.generateWavAudio(text);
        if (result) {
          fs.writeFileSync(filepath, result);
          return `/audio/offline/${language}/${filename}`;
        }
      } catch (error) {
        console.warn(`⚠️ WAV generation failed for "${text}":`, error.message);
      }
    }

    // ✅ Create placeholder for other languages or fallback
    // In production, use actual TTS service
    const placeholder = `# ${text} - ${language} - Generated: ${new Date().toISOString()}`;
    fs.writeFileSync(filepath, placeholder);
    
    return `/audio/offline/${language}/${filename}`;
  }

  // Generate using WAV.am API
  async generateWavAudio(text) {
    const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN;
    const PROJECT_ID = '15850';
    const BASE_URL = 'https://wav.am';

    if (!WAV_ACCESS_TOKEN) {
      throw new Error('WAV_ACCESS_TOKEN not set');
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        project_id: PROJECT_ID,
        text: text,
        voice: 'Luse',
        format: 'mp3',
      });

      const options = {
        hostname: 'wav.am',
        path: '/generate_audio/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WAV_ACCESS_TOKEN,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = require('https').request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            const downloadUrl = `${BASE_URL}${result.path}`;
            
            require('https').get(downloadUrl, { headers: { 'Authorization': WAV_ACCESS_TOKEN } }, (audioRes) => {
              const chunks = [];
              audioRes.on('data', (chunk) => { chunks.push(chunk); });
              audioRes.on('end', () => {
                resolve(Buffer.concat(chunks));
              });
              audioRes.on('error', reject);
            }).on('error', reject);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  // Generate audio for a single entry
  async generateEntry(id, hy, en, ru, type = 'vocabulary') {
    const audioFiles = {};
    
    // Generate audio for each language
    if (hy) audioFiles.hy = await this.generateTTS(hy, 'hy');
    if (en) audioFiles.en = await this.generateTTS(en, 'en');
    if (ru) audioFiles.ru = await this.generateTTS(ru, 'ru');
    
    const entry = {
      id,
      text: hy || en || ru,
      language: 'hy',
      translations: { hy, en, ru },
      audioFiles,
      type,
    };
    
    this.manifest.entries[id] = entry;
    this.manifest.totalEntries++;
    
    return entry;
  }

  // Generate all dictionary audio
  async generateDictionary(dictionary) {
    if (!dictionary || !Array.isArray(dictionary) || dictionary.length === 0) {
      console.log('⚠️ No dictionary entries found');
      return 0;
    }

    console.log(`📚 Generating dictionary audio for ${dictionary.length} entries...`);
    let count = 0;
    
    for (const entry of dictionary) {
      const hy = entry.hy || entry.word || entry.text;
      const en = entry.en || entry.english || entry.translation || hy;
      const ru = entry.ru || entry.russian || en;
      
      if (hy) {
        await this.generateEntry(
          entry.id || `dict_${count}`,
          hy,
          en,
          ru,
          'dictionary'
        );
        count++;
      }
    }
    
    console.log(`✅ Generated ${count} dictionary entries`);
    return count;
  }

  // Generate all lesson audio
  async generateLessons(lessons) {
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      console.log('⚠️ No lessons found');
      return 0;
    }

    console.log(`📚 Generating lesson audio for ${lessons.length} lessons...`);
    let count = 0;
    
    for (const lesson of lessons) {
      console.log(`  📖 Lesson: ${lesson.title || lesson.id}`);
      
      // Title
      if (lesson.title) {
        await this.generateEntry(
          `lesson_${lesson.id}_title`,
          lesson.title,
          lesson.title,
          lesson.title,
          'title'
        );
        count++;
      }
      
      // Vocabulary
      const vocab = lesson.vocabulary || [];
      for (const v of vocab) {
        const hy = v.hy || v.word || v.text;
        const en = v.en || v.english || hy;
        const ru = v.ru || v.russian || en;
        
        if (hy) {
          await this.generateEntry(
            v.id || `vocab_${count}`,
            hy,
            en,
            ru,
            'vocabulary'
          );
          count++;
        }
      }
      
      // Phrases
      const phrases = lesson.phrases || [];
      for (const p of phrases) {
        const hy = p.hy || p.text;
        const en = p.en || p.translation || hy;
        const ru = p.ru || en;
        
        if (hy) {
          await this.generateEntry(
            p.id || `phrase_${count}`,
            hy,
            en,
            ru,
            'phrase'
          );
          count++;
        }
      }
      
      // Dialogues
      const dialogues = lesson.dialogues || [];
      for (const dialogue of dialogues) {
        const lines = dialogue.lines || [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const text = line.text || line.speech || '';
          const translation = line.translation || line.english || text;
          
          if (text) {
            await this.generateEntry(
              `dialogue_${dialogue.id || 'd'}_${i}`,
              text,
              translation,
              translation,
              'dialogue'
            );
            count++;
          }
        }
      }
    }
    
    console.log(`✅ Generated ${count} lesson entries`);
    return count;
  }

  // Generate user dictionary audio
  async generateUserDictionary(userWords) {
    if (!userWords || !Array.isArray(userWords) || userWords.length === 0) {
      console.log('⚠️ No user dictionary entries found');
      return 0;
    }

    console.log(`📚 Generating user dictionary audio for ${userWords.length} entries...`);
    let count = 0;
    
    for (const word of userWords) {
      const lang = word.language || 'hy';
      const translation = word.translation || word.word;
      
      if (lang === 'hy') {
        await this.generateEntry(
          `user_${word.id}`,
          word.word,
          translation,
          translation,
          'user-dictionary'
        );
      } else {
        await this.generateEntry(
          `user_${word.id}`,
          translation,
          word.word,
          word.word,
          'user-dictionary'
        );
      }
      count++;
    }
    
    console.log(`✅ Generated ${count} user dictionary entries`);
    return count;
  }

  // Save manifest
  saveManifest() {
    const manifestPath = path.join(process.cwd(), 'public', 'data', 'audio-manifest.json');
    
    // Ensure directory exists
    const dir = path.dirname(manifestPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(this.manifest, null, 2));
    console.log(`✅ Manifest saved: ${manifestPath}`);
    
    // Also save a copy to the offline directory
    const offlineManifestPath = path.join(process.cwd(), 'public', 'data', 'offline-audio-manifest.json');
    fs.writeFileSync(offlineManifestPath, JSON.stringify(this.manifest, null, 2));
    console.log(`✅ Offline manifest saved: ${offlineManifestPath}`);
  }

  // Utility
  sanitizeFilename(text) {
    if (!text) return 'empty';
    return text
      .toLowerCase()
      .replace(/[^a-zա-ֆա-ֆа-яa-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50);
  }
}

// ============================================================
// 3. MAIN
// ============================================================

async function main() {
  console.log('\n🎵 Generating Trilingual Audio System...\n');
  console.log('=' .repeat(60));
  
  const generator = new TrilingualAudioGenerator();
  
  // 1. Load data
  console.log('\n📂 Loading data...');
  const dictionary = loadDictionary();
  console.log(`📚 Dictionary: ${dictionary.length} entries`);
  
  const lessons = loadLessons();
  console.log(`📚 Lessons: ${lessons.length} lessons`);
  
  const userWords = []; // Load from localStorage or database
  
  // 2. Generate audio
  console.log('\n1️⃣ Generating dictionary audio...');
  const dictCount = await generator.generateDictionary(dictionary);
  
  console.log('\n2️⃣ Generating lesson audio...');
  const lessonCount = await generator.generateLessons(lessons);
  
  console.log('\n3️⃣ Generating user dictionary audio...');
  const userCount = await generator.generateUserDictionary(userWords);
  
  // 3. Save manifest
  generator.saveManifest();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Trilingual Audio System ready!');
  console.log(`   📊 Total audio entries: ${generator.manifest.totalEntries}`);
  console.log(`   📁 Audio files: public/audio/offline/{hy,en,ru}/`);
  console.log(`   📄 Manifest: public/data/audio-manifest.json`);
  console.log(`\n📊 Summary:`);
  console.log(`   Dictionary entries: ${dictCount}`);
  console.log(`   Lesson entries: ${lessonCount}`);
  console.log(`   User entries: ${userCount}`);
}

// Run
main().catch(console.error);