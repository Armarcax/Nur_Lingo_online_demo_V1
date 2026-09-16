// scripts/test-wav.js
// NUR Lingo — WAV.am API Test

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WAV_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI1Yzg3Mjg3Y2Y5MzI0ZGEyYmUzYjIxZjMwMjNjODg3MyIsInVzZXJuYW1lIjoiQXJtZW5pYUFyY2F4IiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4NTU0MjQwMCwiaWF0IjoxNzgzMzQ0Mzg2fQ.VzV86Z_StMS3XXrjeJU1NdLaJiWAy-lquHfnd0_DK8c";
const PROJECT_ID = "15850";
const BASE_URL = "https://wav.am";

const AVAILABLE_VOICES = ["Avet", "Areg", "Luse", "Tigran", "Ani"];
const OUTPUT_DIR = path.join(__dirname, '..');

// ─── TTS GENERATION ──────────────────────────────────────────────────

async function generateTTS(text, voice = "Avet", format = "mp3") {
  console.log(`🔊 Generating TTS with voice: ${voice}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/generate_audio/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": WAV_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        project_id: PROJECT_ID,
        text: text,
        voice: voice,
        format: format,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${voice} - SUCCESS (${data.duration}s)`);
    console.log(`   📁 Path: ${data.path}`);
    
    const downloadUrl = `${BASE_URL}${data.path}`;
    const audioResponse = await fetch(downloadUrl, {
      method: "GET",
      headers: { 
        "Authorization": WAV_ACCESS_TOKEN,
        "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
    });
    
    if (audioResponse.ok) {
      const buffer = await audioResponse.arrayBuffer();
      const filePath = path.join(OUTPUT_DIR, `tts-${voice}-${Date.now()}.${format}`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`   💾 Saved to: ${filePath}`);
      return { success: true, filePath, duration: data.duration, path: data.path };
    } else {
      console.log(`   ❌ Download failed: ${audioResponse.status}`);
      return { success: false, error: `Download failed: ${audioResponse.status}` };
    }
  } catch (error) {
    console.log(`❌ ${voice} - FAILED: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ─── ASR TRANSCRIPTION ──────────────────────────────────────────────

function transcribeAudio(audioFilePath) {
  console.log("🎤 Transcribing audio...");
  
  let fullPath;
  if (path.isAbsolute(audioFilePath)) {
    fullPath = audioFilePath;
  } else {
    fullPath = path.join(OUTPUT_DIR, audioFilePath);
  }
    
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ File not found: ${fullPath}`);
    return { success: false, error: "File not found" };
  }
  
  console.log(`   📁 Using file: ${fullPath}`);
  
  try {
    // Use curl for better compatibility
    const curlCommand = `curl -s -X POST "https://wav.am/transcribe_audio/" -H "Authorization: ${WAV_ACCESS_TOKEN}" -F "project_id=${PROJECT_ID}" -F "language=hy" -F "num_speakers=1" -F "audio_file=@${fullPath}"`;
    
    console.log(`   📤 Sending request...`);
    const result = execSync(curlCommand, { 
      encoding: 'utf8', 
      maxBuffer: 50 * 1024 * 1024 
    });
    
    console.log(`   📥 Response received`);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(result);
      if (data.text) {
        console.log(`✅ Transcription: "${data.text}"`);
        return { success: true, text: data.text };
      } else {
        console.log(`✅ Transcription: ${result}`);
        return { success: true, text: result };
      }
    } catch (parseError) {
      // Not JSON, return raw
      console.log(`✅ Transcription: ${result}`);
      return { success: true, text: result };
    }
  } catch (error) {
    console.error(`❌ ASR Error: ${error.message}`);
    if (error.stdout) {
      console.log(`   📤 Output: ${error.stdout}`);
    }
    if (error.stderr) {
      console.log(`   ⚠️  Error output: ${error.stderr}`);
    }
    return { success: false, error: error.message };
  }
}

// ─── TEST FUNCTIONS ──────────────────────────────────────────────────

async function testTTS(voice = "Avet") {
  return await generateTTS("Բարև, ես Նուռ Լինգո եմ", voice);
}

function testASR(audioFilePath) {
  return transcribeAudio(audioFilePath);
}

// ─── SYSTEM STATUS ──────────────────────────────────────────────────

function checkSystemStatus() {
  console.log("\n🔍 System Status Check:");
  console.log("═══════════════════════════════════════════");
  
  console.log(`✅ Node.js: ${process.version}`);
  
  try {
    execSync('curl --version', { stdio: 'ignore' });
    console.log('✅ curl: Available');
  } catch {
    console.log('❌ curl: Not available');
  }
  
  try {
    const ffmpeg = execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('✅ ffmpeg: Available');
  } catch {
    console.log('❌ ffmpeg: Not available (optional)');
  }
  
  console.log(`✅ Output directory: ${OUTPUT_DIR}`);
  console.log(`✅ API Token: ${WAV_ACCESS_TOKEN ? 'Present' : 'Missing'}`);
  console.log(`✅ Available voices: ${AVAILABLE_VOICES.join(', ')}`);
  
  // Check if there are any audio files
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('tts-') && (f.endsWith('.mp3') || f.endsWith('.wav')));
  console.log(`✅ Audio files: ${files.length} files`);
  
  console.log("═══════════════════════════════════════════\n");
}

// ─── BATCH PROCESSING ──────────────────────────────────────────────

async function processBatch(texts, voice = "Avet") {
  console.log(`📦 Processing batch with voice: ${voice}`);
  console.log(`   ${texts.length} texts to process\n`);
  
  const results = [];
  for (let i = 0; i < texts.length; i++) {
    console.log(`   [${i+1}/${texts.length}] Processing: "${texts[i].substring(0, 30)}..."`);
    const result = await generateTTS(texts[i], voice);
    results.push(result);
    // Wait a bit between requests
    if (i < texts.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ Batch complete: ${successful}/${texts.length} successful`);
  return results;
}

// ─── MAIN ──────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  🎙️  NUR Lingo - WAV.am API");
  console.log(`  Project ID: ${PROJECT_ID}`);
  console.log(`  Voices: ${AVAILABLE_VOICES.join(', ')}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log("═══════════════════════════════════════════\n");
  
  const args = process.argv.slice(2);
  
  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 Available Commands:

  Basic TTS:
    node scripts/test-wav.js                    → Generate TTS with Avet
    node scripts/test-wav.js --voice Avet      → Generate TTS with specific voice
    node scripts/test-wav.js --all-voices      → Test all voices

  Custom Text:
    node scripts/test-wav.js --text "Hello"    → Generate TTS with custom text
    node scripts/test-wav.js --text "Hello" --voice Tigran

  ASR (Speech-to-Text):
    node scripts/test-wav.js --asr file.mp3    → Transcribe audio file

  Batch Processing:
    node scripts/test-wav.js --batch "text1,text2,text3" --voice Avet

  System:
    node scripts/test-wav.js --status          → Check system status
    node scripts/test-wav.js --help            → Show this help

Examples:
  node scripts/test-wav.js --text "Բարև ձեզ" --voice Luse
  node scripts/test-wav.js --asr tts-Avet-1234567890.mp3
  node scripts/test-wav.js --batch "Hello,Goodbye,Thank you" --voice Areg
    `);
    return;
  }
  
  // Check status
  if (args.includes('--status')) {
    checkSystemStatus();
    return;
  }
  
  // ASR
  if (args.includes('--asr')) {
    const audioPath = args[args.indexOf('--asr') + 1];
    if (!audioPath) {
      console.log("❌ Please provide audio file path");
      console.log("   Example: node scripts/test-wav.js --asr test-output-Avet.mp3");
      return;
    }
    testASR(audioPath);
    return;
  }
  
  // Batch processing
  if (args.includes('--batch')) {
    const textsStr = args[args.indexOf('--batch') + 1];
    if (!textsStr) {
      console.log("❌ Please provide texts");
      return;
    }
    const texts = textsStr.split(',').map(t => t.trim());
    const voice = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : "Avet";
    await processBatch(texts, voice);
    return;
  }
  
  // Custom text
  if (args.includes('--text')) {
    const text = args[args.indexOf('--text') + 1];
    if (!text) {
      console.log("❌ Please provide text");
      return;
    }
    const voice = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : "Avet";
    await generateTTS(text, voice);
    return;
  }
  
  // Test all voices
  if (args.includes('--all-voices')) {
    for (const voice of AVAILABLE_VOICES) {
      await testTTS(voice);
      console.log("");
      await new Promise(r => setTimeout(r, 500));
    }
    return;
  }
  
  // Specific voice
  if (args.includes('--voice')) {
    const voice = args[args.indexOf('--voice') + 1] || "Avet";
    await testTTS(voice);
    return;
  }
  
  // Default: test Avet
  await testTTS("Avet");
}

main().catch(console.error);