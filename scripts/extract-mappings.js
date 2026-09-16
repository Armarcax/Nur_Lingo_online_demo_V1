// scripts/extract-mappings.js
// Run: node scripts/extract-mappings.js
//
// Արտահանում է mapping-ները manifest-ներից

const fs = require('fs');
const path = require('path');

const AUDIO_BASE = path.join(process.cwd(), 'public', 'audio', 'offline');
const OUTPUT_DIR = path.join(process.cwd(), 'lib', 'content', 'mappings');

const MANIFESTS = {
  en: 'manifest_en_female.json',
  ru: 'manifest_ru_female.json',
  hy: 'manifest_hy_Ani.json',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractMapping(language, manifestFile) {
  const manifestPath = path.join(AUDIO_BASE, manifestFile);
  
  if (!fs.existsSync(manifestPath)) {
    console.log(`⚠️ ${manifestFile} not found, skipping...`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    if (!manifest.mapping) {
      console.log(`⚠️ No mapping in ${manifestFile}`);
      return null;
    }
    
    // Create reverse mapping
    const reverseMapping = {};
    for (const [audioId, numId] of Object.entries(manifest.mapping)) {
      reverseMapping[numId] = audioId;
    }
    
    const result = {
      version: manifest.version || '2.0',
      generatedAt: manifest.generatedAt || new Date().toISOString(),
      voice: manifest.voice || 'unknown',
      voiceLabel: manifest.voiceLabel || 'Unknown',
      totalFiles: manifest.totalFiles || Object.keys(manifest.mapping).length,
      audioToNum: manifest.mapping,
      numToAudio: reverseMapping,
    };
    
    // Save as JSON
    const outputPath = path.join(OUTPUT_DIR, `audio-num-${language}-mapping.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`✅ ${language}: ${Object.keys(manifest.mapping).length} entries → ${outputPath}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to extract ${language}:`, error.message);
    return null;
  }
}

function main() {
  console.log('🎵 EXTRACT MAPPINGS FROM MANIFESTS');
  console.log('====================================\n');
  
  ensureDir(OUTPUT_DIR);
  
  const results = {};
  for (const [language, manifestFile] of Object.entries(MANIFESTS)) {
    const result = extractMapping(language, manifestFile);
    if (result) {
      results[language] = result;
    }
  }
  
  // Create combined mapping
  const combined = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    languages: results,
  };
  
  const combinedPath = path.join(OUTPUT_DIR, 'audio-num-mappings.json');
  fs.writeFileSync(combinedPath, JSON.stringify(combined, null, 2));
  console.log(`\n✅ Combined mapping: ${combinedPath}`);
  
  console.log('\n📊 SUMMARY');
  console.log('──────────────────────────────────────────');
  for (const [lang, data] of Object.entries(results)) {
    console.log(`  ${lang}: ${data.totalFiles} files`);
  }
}

main().catch(console.error);