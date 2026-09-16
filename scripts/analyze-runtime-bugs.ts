// scripts/analyze-runtime-bugs.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface BugIssue {
  type: 'missing_file' | 'autoplay' | 'tts_error' | 'audio_path' | 'service_worker' | 'offline_manifest' | 'russian_tts';
  file: string;
  line?: number;
  message: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

const bugs: BugIssue[] = [];

// ─── 1. CHECK MISSING AUDIO MANIFEST FILES ──────────────────────────

const missingManifests = [
  '/audio/manifest.json',
  '/audio/offline/manifest_hy_ani.json',
  '/audio/offline/manifest_en_female.json',
  '/audio/offline/manifest_ru_female.json',
];

const publicDir = path.join(process.cwd(), 'public');

for (const manifest of missingManifests) {
  const fullPath = path.join(publicDir, manifest.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    bugs.push({
      type: 'offline_manifest',
      file: manifest,
      message: `❌ Missing audio manifest: ${manifest}`,
      suggestion: `Create the manifest file at "public${manifest}" or generate audio files first.`,
      severity: 'error',
    });
  } else {
    console.log(`✅ Found: ${manifest}`);
  }
}

// ─── 2. CHECK AUTOPLAY ISSUES ──────────────────────────────────────

// Search for speechSynthesis.speak() calls without user interaction
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
});

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // 2.1 Check for speechSynthesis without user interaction
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('speechSynthesis.speak') || line.includes('window.speechSynthesis.speak')) {
      // Check if it's inside a user event handler
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 2)).join('\n');
      const hasUserInteraction = /onClick|onPress|onTouch|onKeyDown|onSubmit|handleClick|handlePress/.test(context);
      
      if (!hasUserInteraction) {
        bugs.push({
          type: 'autoplay',
          file,
          line: i + 1,
          message: `⚠️ speechSynthesis.speak() called without user interaction at line ${i + 1}`,
          suggestion: 'Wrap speech synthesis in a user event handler (onClick, onPress, etc.)',
          severity: 'warning',
        });
      }
    }
  }

  // 2.2 Check for Audio() autoplay
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('new Audio(') && line.includes('.play()')) {
      // Check if it's inside a user event handler
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 2)).join('\n');
      const hasUserInteraction = /onClick|onPress|onTouch|onKeyDown|onSubmit|handleClick|handlePress/.test(context);
      
      if (!hasUserInteraction) {
        bugs.push({
          type: 'autoplay',
          file,
          line: i + 1,
          message: `⚠️ Audio.play() called without user interaction at line ${i + 1}`,
          suggestion: 'Wrap audio playback in a user event handler (onClick, onPress, etc.)',
          severity: 'warning',
        });
      }
    }
  }

  // 2.3 Check for 'not-allowed' error handling
  if (content.includes('not-allowed') && content.includes('SpeechSynthesisErrorEvent')) {
    bugs.push({
      type: 'tts_error',
      file,
      message: '❌ TTS not-allowed error detected in code',
      suggestion: 'Add fallback: if speechSynthesis fails, show a message to the user to click a button to play audio.',
      severity: 'error',
    });
  }

  // 2.4 Check for Russian TTS specific issues
  if (content.includes('Russian TTS failed') || content.includes('ru')) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Russian TTS') && line.includes('failed')) {
        bugs.push({
          type: 'russian_tts',
          file,
          line: i + 1,
          message: `❌ Russian TTS failure detected at line ${i + 1}`,
          suggestion: 'Check if Russian TTS voice is available in the browser, or use a fallback like Google TTS API.',
          severity: 'error',
        });
      }
    }
  }

  // 2.5 Check for "No female voice found" warnings
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('No female voice found') || line.includes('No male voice found')) {
      bugs.push({
        type: 'tts_error',
        file,
        line: i + 1,
        message: `⚠️ Voice selection issue: ${line.trim()}`,
        suggestion: 'Add better voice fallback logic. Use getVoices() with proper filtering.',
        severity: 'warning',
      });
    }
  }

  // 2.6 Check for "No audio available" messages
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('No audio available')) {
      bugs.push({
        type: 'audio_path',
        file,
        line: i + 1,
        message: `⚠️ Audio not available: ${line.trim()}`,
        suggestion: 'Ensure audio files are generated and available in public/audio/ directory.',
        severity: 'warning',
      });
    }
  }
}

// ─── 3. CHECK SERVICE WORKER ──────────────────────────────────────

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Service Worker registered') && line.includes('✅')) {
      // This is good - no bug
    }
    if (line.includes('Service Worker') && line.includes('error')) {
      bugs.push({
        type: 'service_worker',
        file,
        line: i + 1,
        message: `❌ Service Worker error: ${line.trim()}`,
        suggestion: 'Check if sw.js exists in public/ and is registered correctly.',
        severity: 'error',
      });
    }
  }
}

// ─── 4. CHECK OFFLINE AUDIO RESOLVER ──────────────────────────────

for (const file of files) {
  if (file.includes('offline-audio-resolver')) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Key not found')) {
        bugs.push({
          type: 'audio_path',
          file,
          line: i + 1,
          message: `⚠️ Audio key not found: ${line.trim()}`,
          suggestion: 'Check if the audio ID exists in the audio mapping or manifest files.',
          severity: 'warning',
        });
      }
    }
  }
}

// ─── PRINT REPORT ────────────────────────────────────────────────────

console.log('\n' + '='.repeat(72));
console.log('🐛 RUNTIME BUG ANALYSIS REPORT');
console.log('='.repeat(72));
console.log(`\n📁 Files scanned: ${files.length}\n`);

const groupedByType: Record<string, BugIssue[]> = {};
for (const bug of bugs) {
  if (!groupedByType[bug.type]) {
    groupedByType[bug.type] = [];
  }
  groupedByType[bug.type].push(bug);
}

const severityCount: Record<string, number> = { error: 0, warning: 0, info: 0 };
for (const bug of bugs) {
  severityCount[bug.severity] = (severityCount[bug.severity] || 0) + 1;
}

console.log('📊 BY SEVERITY:');
console.log(`   ❌ Errors:   ${severityCount.error || 0}`);
console.log(`   ⚠️ Warnings: ${severityCount.warning || 0}`);
console.log(`   💡 Info:     ${severityCount.info || 0}`);

console.log('\n📋 BY TYPE:');
for (const [type, items] of Object.entries(groupedByType)) {
  const emoji = type === 'missing_file' || type === 'offline_manifest' || type === 'russian_tts' || type === 'service_worker' ? '❌' :
                type === 'autoplay' || type === 'tts_error' || type === 'audio_path' ? '⚠️' : '💡';
  console.log(`   ${emoji} ${type}: ${items.length}`);
}

console.log('\n' + '='.repeat(72));
console.log('🔍 DETAILED ISSUES');
console.log('='.repeat(72));

const bugsByFile: Record<string, BugIssue[]> = {};
for (const bug of bugs) {
  if (!bugsByFile[bug.file]) {
    bugsByFile[bug.file] = [];
  }
  bugsByFile[bug.file].push(bug);
}

// Sort files with most bugs first
const sortedFiles = Object.entries(bugsByFile).sort((a, b) => b[1].length - a[1].length);

for (const [file, fileBugs] of sortedFiles) {
  const relativePath = path.relative(process.cwd(), file);
  console.log(`\n📄 ${relativePath}`);
  
  for (const bug of fileBugs) {
    const emoji = bug.severity === 'error' ? '❌' : bug.severity === 'warning' ? '⚠️' : '💡';
    console.log(`   ${emoji} [${bug.type}] ${bug.message}`);
    if (bug.line) {
      console.log(`      📍 Line ${bug.line}`);
    }
    console.log(`      💡 ${bug.suggestion}`);
  }
}

// ─── SUMMARY ─────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(72));
console.log('📈 SUMMARY');
console.log('='.repeat(72));

if (severityCount.error === 0 && severityCount.warning === 0) {
  console.log('\n✅ No bugs found!');
} else {
  console.log(`\n❌ ${severityCount.error || 0} error(s) require attention.`);
  if (severityCount.warning > 0) {
    console.log(`⚠️ ${severityCount.warning} warning(s) should be reviewed.`);
  }
  console.log('\n🛠️  ACTION PLAN:');
  
  if (severityCount.error > 0) {
    console.log('   1. Fix all ERRORs first:');
    if (bugs.some(b => b.type === 'offline_manifest')) {
      console.log('      🔹 Generate audio manifests (run audio generation script)');
    }
    if (bugs.some(b => b.type === 'russian_tts')) {
      console.log('      🔹 Fix Russian TTS: check voice availability or use fallback');
    }
    if (bugs.some(b => b.type === 'service_worker')) {
      console.log('      🔹 Fix Service Worker: ensure sw.js exists and is registered');
    }
  }
  
  if (severityCount.warning > 0) {
    console.log('   2. Review WARNINGS:');
    if (bugs.some(b => b.type === 'autoplay')) {
      console.log('      🔹 Wrap audio/speech calls in user event handlers');
    }
    if (bugs.some(b => b.type === 'audio_path')) {
      console.log('      🔹 Check audio file paths and ensure files exist');
    }
  }
}

console.log('\n' + '='.repeat(72));