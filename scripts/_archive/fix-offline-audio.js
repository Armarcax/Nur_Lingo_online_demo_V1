
// scripts/fix-offline-audio.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing offline audio issues...');

const pagePath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  if (content.includes('/audio/hy_wav/') || content.includes('/audio/en_wav/')) {
    content = content.replace(/\/audio\/(hy_wav|en_wav|ru_wav)\//g, '/audio/offline/');
    fs.writeFileSync(pagePath, content);
    console.log('✅ Fixed hardcoded paths in page.tsx');
  }
}

const cacheDirs = ['public/audio/cache', '.next/cache'];
for (const dir of cacheDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`🗑️ Cleared: ${dir}`);
  }
}

console.log('✅ Fix completed! Run: npm run dev');
