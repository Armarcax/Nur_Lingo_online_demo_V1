// scripts/debug-wav.js
// Run: node scripts/debug-wav.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 WAV Debug Script');
console.log('========================================\n');

// ─── 1. CHECK ENVIRONMENT ────────────────────────────────────────────

console.log('📋 1. Environment Variables:');
console.log('----------------------------------------');
const envVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
for (const env of envVars) {
  const value = process.env[env] || 'NOT SET';
  console.log(`  ${env}: ${value.substring(0, 20)}...`);
}
console.log('');

// ─── 2. CHECK PUBLIC/AUDIO DIRECTORY ───────────────────────────────

console.log('📋 2. Audio Files Check:');
console.log('----------------------------------------');
const audioDir = path.join(process.cwd(), 'public', 'audio', 'hy_wav');
if (fs.existsSync(audioDir)) {
  const files = fs.readdirSync(audioDir);
  console.log(`  ✅ Directory exists: ${audioDir}`);
  console.log(`  📁 Files: ${files.length}`);
  
  if (files.length > 0) {
    console.log(`  📄 Sample files (first 5):`);
    files.slice(0, 5).forEach(f => console.log(`    - ${f}`));
  } else {
    console.log('  ⚠️ No WAV files found!');
  }
} else {
  console.log(`  ❌ Directory not found: ${audioDir}`);
}
console.log('');

// ─── 3. CHECK API ENDPOINT ──────────────────────────────────────────

console.log('📋 3. API Endpoint Check:');
console.log('----------------------------------------');
const apiUrl = 'http://localhost:3001/api/generate-wav';

try {
  // Use fetch if available, otherwise use curl
  const isNode18 = parseInt(process.version.slice(1).split('.')[0]) >= 18;
  
  if (isNode18) {
    console.log('  Using fetch API...');
    // Node 18+ has fetch
    const fetch = require('node-fetch');
    fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'test', voice: 'Avet' }) })
      .then(res => {
        console.log(`  Response status: ${res.status}`);
        if (res.ok) {
          console.log('  ✅ API is working!');
        } else {
          console.log(`  ❌ API error: ${res.status}`);
        }
      })
      .catch(err => {
        console.log(`  ❌ API error: ${err.message}`);
      });
  } else {
    console.log('  Using curl...');
    try {
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X POST ${apiUrl} -H "Content-Type: application/json" -d '{"text":"test","voice":"Avet"}'`, { encoding: 'utf8' });
      console.log(`  Response status: ${result.trim()}`);
      if (result.trim() === '200') {
        console.log('  ✅ API is working!');
      } else {
        console.log(`  ❌ API error: ${result.trim()}`);
      }
    } catch {
      console.log('  ❌ Could not reach API');
    }
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}
console.log('');

// ─── 4. CHECK NEXT.JS CONFIG ────────────────────────────────────────

console.log('📋 4. Next.js Config:');
console.log('----------------------------------------');
try {
  const nextConfig = require(path.join(process.cwd(), 'next.config.js'));
  console.log(`  ✅ next.config.js loaded`);
  console.log(`  output: ${nextConfig.output || 'default'}`);
  
  if (nextConfig.output === 'export') {
    console.log('  ⚠️ WARNING: Static export detected!');
    console.log('  API routes will not work in static export.');
  }
} catch {
  console.log('  ❌ Could not load next.config.js');
}
console.log('');

// ─── 5. CHECK FOR STATIC EXPORT ─────────────────────────────────────

console.log('📋 5. Build Output Check:');
console.log('----------------------------------------');
const buildDir = path.join(process.cwd(), '.next');
if (fs.existsSync(buildDir)) {
  console.log(`  ✅ .next directory exists`);
  
  // Check if it's a static export
  const serverDir = path.join(buildDir, 'server');
  if (fs.existsSync(serverDir)) {
    console.log(`  ✅ Server directory exists (Dynamic mode)`);
  } else {
    console.log(`  ⚠️ Server directory missing (Static export?)`);
  }
} else {
  console.log(`  ❌ .next directory not found`);
}
console.log('');

// ─── 6. CHECK RUNTIME DIFFERENCES ──────────────────────────────────

console.log('📋 6. Runtime Differences:');
console.log('----------------------------------------');
console.log(`  npm run dev: Development mode (no optimization)`);
console.log(`  npm run build + start: Production mode (optimized)`);
console.log('');
console.log('  Common issues in production:');
console.log('  1. API routes are serverless functions');
console.log('  2. Static optimization may skip dynamic routes');
console.log('  3. Environment variables may differ');
console.log('  4. File system access is limited in serverless');
console.log('');

// ─── 7. SUMMARY ──────────────────────────────────────────────────────

console.log('📊 SUMMARY');
console.log('========================================');
console.log('');
console.log('💡 Possible reasons WAV works in dev but not production:');
console.log('');
console.log('  1. API routes not deployed correctly');
console.log('     → Check if /api/generate-wav is available');
console.log('');
console.log('  2. Static export issue');
console.log('     → If using output: "export", API routes won\'t work');
console.log('');
console.log('  3. Environment variables');
console.log('     → Check .env.production vs .env.local');
console.log('');
console.log('  4. File system access');
console.log('     → Production may not have write access to public/');
console.log('');
console.log('  5. Serverless timeout');
console.log('     → WAV generation may take too long');
console.log('');
console.log('🔧 Solutions:');
console.log('');
console.log('  1. Use ISR instead of static export');
console.log('  2. Use browser TTS as fallback (already implemented)');
console.log('  3. Pre-generate WAV files during build');
console.log('  4. Use a different TTS provider for production');
console.log('');

// ─── 8. SUGGEST FIX ──────────────────────────────────────────────────

console.log('🔧 Recommended Fix:');
console.log('----------------------------------------');
console.log('');
console.log('  Since WAV API doesn\'t work in production, use:');
console.log('  1. Browser TTS for all languages (already implemented)');
console.log('  2. Or pre-generate audio during build');
console.log('');
console.log('  To use browser TTS only:');
console.log('  // src/lib/audio/LessonAudio.ts');
console.log('  export const DEFAULT_AUDIO_CONFIG = {');
console.log('    mode: "on",');
console.log('    source: "tts",  // ✅ WAV → TTS');
console.log('    ...');
console.log('  };');
console.log('');

console.log('✅ Debug complete!');