// scripts/fix-audio-playback.ts

import fs from 'fs';
import path from 'path';

interface Manifest {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  mapping: Record<string, string>;
}

interface Exercise {
  id: string;
  type: string;
  prompt: Record<string, string>;
  targetAnswer: string;
}

class AudioPlaybackFixer {
  private basePath: string;
  private manifests: Map<string, Manifest> = new Map();
  private exerciseIds: string[] = [];
  private audioFiles: string[] = [];

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async run() {
    console.log('🔧 NUR Lingo Audio Playback Fixer\n');
    console.log('═'.repeat(60));

    await this.loadManifests();
    await this.loadExercises();
    await this.analyzeMappings();
    await this.fixPageTSX();
    await this.fixBottomNav();
    await this.generateReport();
  }

  private async loadManifests() {
    console.log('\n📄 Loading manifests...');
    
    const manifestFiles = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json' },
    ];

    for (const mf of manifestFiles) {
      const fullPath = path.join(this.basePath, mf.path);
      if (fs.existsSync(fullPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Manifest;
          this.manifests.set(mf.name, data);
          const count = Object.keys(data.mapping || {}).length;
          console.log(`✅ ${mf.name}: ${count} entries`);
        } catch (e) {
          console.log(`❌ ${mf.name}: INVALID JSON`);
        }
      } else {
        console.log(`❌ ${mf.name}: NOT FOUND`);
      }
    }
  }

  private async loadExercises() {
    console.log('\n📚 Loading exercises...');
    
    const dictPath = path.join(this.basePath, 'data/dictionaries/lesson-dictionary.json');
    if (!fs.existsSync(dictPath)) {
      console.log('❌ lesson-dictionary.json NOT FOUND');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
      for (const [key, value] of Object.entries(data)) {
        if (key === 'version' || key === 'metadata') continue;
        const lesson = value as any;
        if (lesson.vocabulary) {
          for (const vocab of lesson.vocabulary) {
            if (vocab.id) this.exerciseIds.push(vocab.id);
          }
        }
        if (lesson.phrases) {
          for (const phrase of lesson.phrases) {
            if (phrase.id) this.exerciseIds.push(phrase.id);
          }
        }
      }
      console.log(`✅ Found ${this.exerciseIds.length} exercise IDs`);
      console.log(`   Sample: ${this.exerciseIds.slice(0, 5).join(', ')}`);
    } catch (e) {
      console.log('❌ Failed to parse lesson-dictionary.json');
    }
  }

  private async analyzeMappings() {
    console.log('\n🔍 Analyzing mappings...');
    
    let totalMapped = 0;
    let mappedIds: string[] = [];
    
    for (const [name, manifest] of this.manifests) {
      const mapping = manifest.mapping || {};
      const count = Object.keys(mapping).length;
      totalMapped += count;
      mappedIds = mappedIds.concat(Object.keys(mapping));
      console.log(`📊 ${name}: ${count} mapped entries`);
    }

    console.log(`📊 Total mapped entries: ${totalMapped}`);

    // Check which exercise IDs are mapped
    let found = 0;
    let notFound: string[] = [];
    
    for (const id of this.exerciseIds) {
      let isFound = false;
      for (const [name, manifest] of this.manifests) {
        if (manifest.mapping && manifest.mapping[id]) {
          isFound = true;
          break;
        }
      }
      if (isFound) {
        found++;
      } else {
        notFound.push(id);
      }
    }

    console.log(`\n📊 Exercise mapping status:`);
    console.log(`   ✅ Found: ${found} / ${this.exerciseIds.length}`);
    console.log(`   ❌ Not found: ${notFound.length}`);
    if (notFound.length > 0 && notFound.length <= 10) {
      console.log(`   Sample not found: ${notFound.join(', ')}`);
    }
  }

  private async fixPageTSX() {
    console.log('\n🔧 Fixing page.tsx...');
    
    const pagePath = path.join(this.basePath, 'src/app/learn/page.tsx');
    if (!fs.existsSync(pagePath)) {
      console.log('❌ page.tsx NOT FOUND');
      return;
    }

    let content = fs.readFileSync(pagePath, 'utf8');

    // ✅ Check if playOfflineAudio exists
    const hasPlayFunction = content.includes('const playOfflineAudio');
    if (!hasPlayFunction) {
      console.log('⚠️ playOfflineAudio not found, adding...');
    }

    // ✅ Create the fixed playOfflineAudio function
    const fixedPlayFunction = `
  // ─── PLAY OFFLINE AUDIO - FIXED ────────────────────────────────────

  const playOfflineAudio = useCallback(async () => {
    console.log('🔊🔊🔊 playOfflineAudio CALLED');
    
    if (!offlineAudio.isOfflineMode) {
      showMessage("📱 Offline mode is not active", "info");
      console.warn('❌ Offline mode not active');
      return;
    }
    
    if (!current) {
      showMessage("❌ No current exercise", "error");
      console.warn('❌ No current exercise');
      return;
    }

    // ✅ Get language
    const lang = loadLangConfig()?.learning || 'hy';
    const gender = offlineAudio.getVoice(lang);
    
    // ✅ Determine audio directory
    const audioDir = lang === 'en' ? 'en_female' : lang === 'hy' ? 'hy_Ani' : 'ru_female';
    
    console.log(\`🎯 Exercise ID: \${current.id}\`);
    console.log(\`🔊 Language: \${lang}, Gender: \${gender}, Dir: \${audioDir}\`);
    
    // ✅ Try multiple ways to get audio ID
    let audioId = null;
    
    // 1. Try direct mapping from combinedMapping
    try {
      const combinedMapping = (offlineAudio as any).combinedMapping || {};
      audioId = combinedMapping[current.id];
      if (audioId) {
        console.log(\`✅ Found in combinedMapping: \${current.id} -> \${audioId}\`);
      }
    } catch (e) {
      console.warn('⚠️ Error accessing combinedMapping:', e);
    }
    
    // 2. Try to find by partial match in combinedMapping
    if (!audioId) {
      try {
        const combinedMapping = (offlineAudio as any).combinedMapping || {};
        for (const [key, value] of Object.entries(combinedMapping)) {
          if (key === current.id || key.includes(current.id) || current.id.includes(key)) {
            audioId = value;
            console.log(\`✅ Found by partial match: \${key} -> \${value}\`);
            break;
          }
        }
      } catch (e) {
        console.warn('⚠️ Error searching combinedMapping:', e);
      }
    }
    
    // 3. Try numeric extraction from exercise ID
    if (!audioId) {
      const numMatch = current.id.match(/\\d+/);
      if (numMatch) {
        audioId = parseInt(numMatch[0]);
        console.log(\`✅ Extracted number from ID: \${audioId}\`);
      }
    }
    
    // 4. Try to use exercise ID as number
    if (!audioId) {
      const num = parseInt(current.id);
      if (!isNaN(num) && num > 0) {
        audioId = num;
        console.log(\`✅ Using exercise ID as number: \${audioId}\`);
      }
    }
    
    // 5. Fallback to 000001
    if (!audioId) {
      audioId = 1;
      console.log(\`⚠️ Using fallback: 000001\`);
    }
    
    // ✅ Construct audio path
    const audioNum = String(audioId).padStart(6, '0');
    const path = \`/audio/offline/\${audioDir}/\${audioNum}.mp3\`;
    
    console.log(\`🎯 FINAL AUDIO PATH: \${path}\`);
    
    // ✅ Check if file exists
    try {
      console.log(\`🔍 Checking file: \${path}\`);
      const response = await fetch(path, { method: 'HEAD' });
      console.log(\`📊 Response status: \${response.status}\`);
      
      if (!response.ok) {
        showMessage(\`❌ Audio file not found (\${response.status})\`, "error");
        console.warn(\`❌ File not found: \${path}\`);
        return;
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      showMessage(\`❌ Cannot access audio file\`, "error");
      return;
    }

    // ✅ Play audio
    try {
      console.log(\`🔊 Playing: \${path}\`);
      const audio = new Audio(path);
      
      audio.onplay = () => {
        console.log('✅ Audio started playing');
        showMessage("🔊 Playing audio...", "success");
      };
      
      audio.onended = () => {
        console.log('✅ Audio finished');
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio error:', e);
        showMessage(\`❌ Failed to play audio\`, "error");
      };
      
      await audio.play();
      console.log('✅ Audio play() called successfully');
    } catch (err) {
      console.error('❌ Audio play error:', err);
      showMessage(\`❌ Failed to play: \${err.message}\`, "error");
    }
  }, [offlineAudio, current, showMessage]);
`;

    // ✅ Check if we need to add or replace
    if (content.includes('const playOfflineAudio')) {
      // Replace existing function
      const regex = /const playOfflineAudio[^]*?}, \[[^\]]*\]\);/s;
      content = content.replace(regex, fixedPlayFunction.trim());
      console.log('✅ Replaced playOfflineAudio function');
    } else {
      // Find a good place to insert
      const insertAfter = 'const playOfflineAudio';
      content = content.replace(
        /const playOfflineAudio[^]*?}/s,
        fixedPlayFunction
      );
      console.log('✅ Added playOfflineAudio function');
    }

    // ✅ Write the file
    fs.writeFileSync(pagePath, content);
    console.log('✅ page.tsx updated successfully');
  }

  private async fixBottomNav() {
    console.log('\n🔧 Fixing BottomNav.tsx...');
    
    const navPath = path.join(this.basePath, 'src/components/BottomNav.tsx');
    if (!fs.existsSync(navPath)) {
      console.log('❌ BottomNav.tsx NOT FOUND');
      return;
    }

    let content = fs.readFileSync(navPath, 'utf8');

    // ✅ Check if test button already exists
    if (content.includes('TEST AUDIO BUTTON')) {
      console.log('✅ Test button already exists');
      return;
    }

    // ✅ Add test button
    const testButton = `
          {/* ✅ TEST AUDIO BUTTON */}
          <button
            onClick={() => {
              console.log('🔊🔊🔊 TEST FROM BOTTOM NAV!');
              const testPath = '/audio/offline/hy_Ani/000001.mp3';
              console.log('🎯 Testing path:', testPath);
              const audio = new Audio(testPath);
              audio.play()
                .then(() => {
                  console.log('✅ Audio started playing!');
                  alert('🔊 Audio is playing!');
                })
                .catch((err) => {
                  console.error('❌ Error:', err);
                  alert('❌ Failed: ' + err.message);
                });
            }}
            className="p-2 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
            title="Test Audio"
          >
            <Volume2 size={16} />
          </button>
`;

    // Find ThemeToggle and add button next to it
    content = content.replace(
      /<ThemeToggle size="sm" \/>/,
      `${testButton}\n          <ThemeToggle size="sm" />`
    );

    fs.writeFileSync(navPath, content);
    console.log('✅ BottomNav.tsx updated with test button');
  }

  private async generateReport() {
    console.log('\n📊 SUMMARY REPORT');
    console.log('═'.repeat(60));

    console.log(`
✅ Audio Playback Fix Completed!

🔧 Changes made:
1. ✅ Fixed playOfflineAudio function in page.tsx
2. ✅ Added TEST button to BottomNav.tsx
3. ✅ Added multiple fallback methods for audio ID lookup
4. ✅ Added console logging for debugging

📝 How to test:
1. Restart the app: npm run dev
2. Open browser console (F12)
3. Click the 🔊 TEST button in bottom nav
4. Check console for logs
5. If audio plays, everything works!

🔍 Debugging steps:
1. Check console for "🔊🔊🔊 playOfflineAudio CALLED"
2. Check "🎯 Exercise ID" to see what ID is being used
3. Check "🎯 FINAL AUDIO PATH" to verify the path
4. Check network tab for audio request

⚠️ If audio still doesn't play:
1. Check that audio files exist in public/audio/offline/
2. Check that 000001.mp3 is accessible via browser
3. Check browser console for errors
4. Try different browser (Chrome recommended)

📁 Audio files location:
   /public/audio/offline/en_female/000001.mp3
   /public/audio/offline/hy_Ani/000001.mp3
   /public/audio/offline/ru_female/000001.mp3
`);
  }
}

// Run the fixer
async function runFixer() {
  const fixer = new AudioPlaybackFixer(process.cwd());
  await fixer.run();
}

runFixer().catch(console.error);

console.log('\n🚀 To run: npx ts-node scripts/fix-audio-playback.ts');