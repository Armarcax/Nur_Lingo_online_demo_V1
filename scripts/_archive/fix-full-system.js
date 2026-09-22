
// scripts/fix-full-system.js
// Run: node scripts/fix-full-system.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing NUR Lingo system...');

// 1. Check and fix page.tsx
const pagePath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Ensure /audio/offline/ paths
  if (!content.includes('/audio/offline/')) {
    content = content.replace(/\/audio\/([a-z_]+)\//g, '/audio/offline/$1/');
    fs.writeFileSync(pagePath, content);
    console.log('✅ Fixed audio paths in page.tsx');
  }
}

// 2. Create sw.js if missing
const swPath = path.join(process.cwd(), 'public/sw.js');
if (!fs.existsSync(swPath)) {
  const swContent = `
// NUR Lingo Service Worker
const CACHE_NAME = 'nurlingo-v3';
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/audio/offline/')) {
    e.respondWith(
      caches.match(e.request).then(c => c || fetch(e.request))
    );
  }
});
  `;
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Created sw.js');
}

console.log('✅ Fix completed!');
