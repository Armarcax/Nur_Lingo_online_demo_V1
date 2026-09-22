// scripts/fix-world-header.js
// Միայն World Page-ի Header-ի ֆոնը փոխում է

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/world/page.tsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // ✅ ՓՈԽԱՐԻՆԵԼ HEADER-Ի ՖՈՆԸ
  // bg-black/40 backdrop-blur-xl → bg-black backdrop-blur-none
  const updated = content.replace(
    /bg-black\/40 backdrop-blur-xl/g,
    'bg-black backdrop-blur-none'
  );
  
  if (content === updated) {
    console.log('⚠️ Ոչ մի փոփոխություն չի արվել:');
    console.log('💡 Համոզվեք, որ ֆայլում կա "bg-black/40 backdrop-blur-xl"');
    process.exit(0);
  }
  
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('✅ Header-ի ֆոնը փոխվեց:');
  console.log('   bg-black/40 backdrop-blur-xl → bg-black backdrop-blur-none');
  console.log('📁 Ֆայլ: src/app/world/page.tsx');
  
} catch (error) {
  console.error('❌ Սխալ:', error.message);
  process.exit(1);
}