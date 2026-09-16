// scripts/generate-mms-pipeline.js
// Run: node scripts/generate-mms-pipeline.js
//
// Հայերեն աուդիո MMS-TTS pipeline-ով

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'hy_Ani');

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
}

function collectArmenianTexts(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    if (lesson.vocabulary) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.hy && !seen.has(v.id)) {
          seen.add(v.id);
          entries.push({
            id: v.id,
            text: v.hy,
            type: 'vocabulary'
          });
        }
      }
    }
  }
  
  return entries;
}

async function generateWithPipeline(text, outputPath) {
  // ✅ Python script with pipeline (more robust)
  const pythonScript = `
import torch
from transformers import pipeline
import scipy
import os

os.environ['TOKENIZERS_PARALLELISM'] = 'false'

try:
    # Use pipeline instead of direct model
    pipe = pipeline("text-to-speech", model="facebook/mms-tts-hyw")
    
    # Generate audio
    result = pipe("${text.replace(/"/g, '\\"').replace(/\n/g, ' ')}")
    
    # Get audio array
    audio_data = result["audio"]
    
    # If it's on GPU, move to CPU
    if hasattr(audio_data, 'cpu'):
        audio_data = audio_data.cpu()
    
    # Convert to numpy
    import numpy as np
    if hasattr(audio_data, 'numpy'):
        audio_data = audio_data.numpy()
    
    # Save
    output_path = r"${outputPath.replace(/\\/g, '\\\\')}"
    scipy.io.wavfile.write(output_path, 
                           rate=result["sampling_rate"], 
                           data=audio_data)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
`;

  const tempScript = path.join(process.cwd(), 'temp', `mms_pipe_${Date.now()}.py`);
  fs.writeFileSync(tempScript, pythonScript, 'utf-8');

  try {
    const { stdout, stderr } = await execAsync(`python "${tempScript}"`, {
      timeout: 120000,
      env: { ...process.env, TOKENIZERS_PARALLELISM: 'false' }
    });
    
    fs.unlinkSync(tempScript);
    return stdout.includes('SUCCESS');
  } catch (error) {
    if (fs.existsSync(tempScript)) fs.unlinkSync(tempScript);
    throw error;
  }
}

async function main() {
  console.log('🎵 ARMENIAN AUDIO GENERATOR (MMS-TTS Pipeline)');
  console.log('===============================================');
  console.log('  Model: facebook/mms-tts-hyw');
  console.log('  Method: HuggingFace Pipeline');
  console.log('  Output: hy_Ani/');
  console.log();
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  const entries = collectArmenianTexts(dict);
  console.log(`📚 Found ${entries.length} Armenian vocabulary entries\n`);
  
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  // Test only 5 files
  const testCount = Math.min(entries.length, 5);
  console.log(`🔬 Testing with ${testCount} files...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < testCount; i++) {
    const entry = entries[i];
    const outputPath = path.join(AUDIO_DIR, `${entry.id}.wav`);
    
    try {
      const pct = ((i + 1) / testCount * 100).toFixed(1);
      process.stdout.write(`\r  ${i+1}/${testCount} (${pct}%) - ${entry.id}`);
      
      const result = await generateWithPipeline(entry.text, outputPath);
      if (result) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`\n  ❌ ${entry.id}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n\n✅ Done! ${success} generated, ${failed} failed`);
  
  // Check files
  if (fs.existsSync(AUDIO_DIR)) {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.wav'));
    console.log(`\n📁 Files in hy_Ani: ${files.length}`);
    
    // Check sizes
    let valid = 0;
    for (const f of files.slice(0, 5)) {
      const stats = fs.statSync(path.join(AUDIO_DIR, f));
      if (stats.size > 1000) {
        valid++;
        console.log(`  ✅ ${f}: ${(stats.size / 1024).toFixed(1)} KB`);
      } else {
        console.log(`  ⚠️ ${f}: ${stats.size} bytes (too small)`);
      }
    }
    console.log(`\n  Valid files: ${valid}/${Math.min(files.length, 5)}`);
  }
}

main().catch(console.error);