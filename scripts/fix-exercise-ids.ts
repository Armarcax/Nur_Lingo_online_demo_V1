// scripts/fix-exercise-ids-ts.ts
// Alternative version that works with TypeScript source

import * as fs from 'fs';
import * as path from 'path';

// This version reads from the TypeScript source
const SOURCE_FILE = path.join(__dirname, '../src/lib/i18n/multilingual/index.ts');

function fixExerciseIdsFromTS() {
  console.log('📚 Reading from TypeScript source...');
  
  // Read the file
  const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
  
  // Find the LESSONS object
  const match = content.match(/export const LESSONS\s*=\s*({[\s\S]*?});/);
  
  if (!match) {
    console.error('❌ Could not find LESSONS object in file.');
    return;
  }
  
  console.log('✅ Found LESSONS object.');
  console.log('⚠️ This script needs to parse TypeScript. Please use the JSON version.');
  console.log('💡 Alternative: Export lessons to JSON first:');
  console.log('   node -e "const fs = require(\'fs\'); const { LESSONS } = require(\'./src/lib/i18n/multilingual/index.ts\'); fs.writeFileSync(\'./src/lib/i18n/multilingual/lessons.json\', JSON.stringify(LESSONS, null, 2));"');
}

// Try JSON first, then fallback to TS
if (fs.existsSync(path.join(__dirname, '../src/lib/i18n/multilingual/lessons.json'))) {
  // Use the main function above
  console.log('✅ Found lessons.json, using main script.');
} else {
  console.log('⚠️ lessons.json not found.');
  console.log('💡 Creating lessons.json from index.ts...');
  
  // You can manually export the data, or use the script below
  console.log('\n📌 To create lessons.json, run this in Node:');
  console.log(`
    const fs = require('fs');
    const path = require('path');
    
    // Copy the LESSONS data from index.ts
    const LESSONS = {
      // Paste your lessons data here
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../src/lib/i18n/multilingual/lessons.json'),
      JSON.stringify({ lessons: LESSONS }, null, 2)
    );
  `);
}