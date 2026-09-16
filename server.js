// server.js
// NUR Lingo - WAV.am API Server

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const multer = require('multer');
const { execSync } = require('child_process');

// Load environment variables
dotenv.config();

// Import modules
const WavAPI = require('./lib/wav-api');
const AudioCache = require('./lib/audio-cache');
const logger = require('./lib/logger');

// ─── CONFIGURATION ──────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

// WAV.am configuration
const WAV_TOKEN = process.env.WAV_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI1Yzg3Mjg3Y2Y5MzI0ZGEyYmUzYjIxZjMwMjNjODg3MyIsInVzZXJuYW1lIjoiQXJtZW5pYUFyY2F4IiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4NTU0MjQwMCwiaWF0IjoxNzgzMzQ0Mzg2fQ.VzV86Z_StMS3XXrjeJU1NdLaJiWAy-lquHfnd0_DK8c";
const PROJECT_ID = process.env.PROJECT_ID || "15850";
const BASE_URL = process.env.BASE_URL || "https://wav.am";
const AVAILABLE_VOICES = ["Avet", "Areg", "Luse", "Tigran", "Ani"];

// Initialize services
const wavAPI = new WavAPI(WAV_TOKEN, PROJECT_ID, BASE_URL);
const audioCache = new AudioCache(path.join(__dirname, 'cache'));

// ─── MIDDLEWARE ─────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/audio', express.static(path.join(__dirname, 'cache')));
app.use(express.static(path.join(__dirname, 'public')));

// Multer for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Create necessary directories
['cache', 'uploads', 'logs'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// ─── ROUTES ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    voices: AVAILABLE_VOICES,
    version: '1.0.0'
  });
});

// Get available voices
app.get('/api/voices', (req, res) => {
  res.json({
    voices: AVAILABLE_VOICES,
    default: 'Avet'
  });
});

// Text-to-Speech
app.post('/api/tts', async (req, res) => {
  const startTime = Date.now();
  const { text, voice = 'Avet', format = 'mp3' } = req.body;

  // Validate input
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!AVAILABLE_VOICES.includes(voice)) {
    return res.status(400).json({ 
      error: `Invalid voice. Available: ${AVAILABLE_VOICES.join(', ')}` 
    });
  }

  logger.info(`TTS Request: voice=${voice}, text="${text.substring(0, 50)}..."`);

  try {
    // Check cache first
    const cacheKey = audioCache.generateKey(text, voice);
    const cachedAudio = await audioCache.get(cacheKey);

    if (cachedAudio) {
      logger.info(`TTS Cache hit: ${cacheKey}`);
      return res.json({
        success: true,
        audio: cachedAudio,
        cached: true,
        voice: voice,
        text: text,
        duration: 0,
        format: format,
        elapsed_ms: Date.now() - startTime
      });
    }

    // Generate TTS
    const result = await wavAPI.textToSpeech(text, voice, format);

    if (!result.success) {
      logger.error(`TTS Failed: ${result.error}`);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // Save to cache
    if (result.audioData) {
      await audioCache.set(cacheKey, result.audioData, {
        text,
        voice,
        duration: result.duration
      });
    }

    logger.info(`TTS Success: voice=${voice}, duration=${result.duration}s`);

    res.json({
      success: true,
      audio: result.audioData,
      cached: false,
      voice: voice,
      text: text,
      duration: result.duration,
      format: format,
      path: result.path,
      elapsed_ms: Date.now() - startTime
    });

  } catch (error) {
    logger.error(`TTS Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Speech-to-Text (ASR)
app.post('/api/asr', upload.single('audio'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioPath = req.file.path;
    const language = req.body.language || 'hy';
    const numSpeakers = parseInt(req.body.numSpeakers) || 1;

    logger.info(`ASR Request: file=${req.file.originalname}, language=${language}`);

    // Transcribe audio
    const result = await wavAPI.speechToText(audioPath, language, numSpeakers);

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    if (!result.success) {
      logger.error(`ASR Failed: ${result.error}`);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`ASR Success: text="${result.text}"`);

    res.json({
      success: true,
      text: result.text,
      language: language,
      elapsed_ms: Date.now() - startTime
    });

  } catch (error) {
    logger.error(`ASR Error: ${error.message}`, error);
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch TTS
app.post('/api/tts/batch', async (req, res) => {
  const startTime = Date.now();
  const { texts, voice = 'Avet', format = 'mp3' } = req.body;

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Texts array is required' });
  }

  if (!AVAILABLE_VOICES.includes(voice)) {
    return res.status(400).json({ 
      error: `Invalid voice. Available: ${AVAILABLE_VOICES.join(', ')}` 
    });
  }

  logger.info(`Batch TTS: ${texts.length} texts, voice=${voice}`);

  try {
    const results = [];
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      // Check cache
      const cacheKey = audioCache.generateKey(text, voice);
      const cachedAudio = await audioCache.get(cacheKey);

      if (cachedAudio) {
        results.push({
          index: i,
          text: text,
          audio: cachedAudio,
          cached: true
        });
        continue;
      }

      // Generate TTS
      const result = await wavAPI.textToSpeech(text, voice, format);
      
      if (result.success && result.audioData) {
        await audioCache.set(cacheKey, result.audioData, { text, voice });
        results.push({
          index: i,
          text: text,
          audio: result.audioData,
          cached: false,
          duration: result.duration
        });
      } else {
        results.push({
          index: i,
          text: text,
          error: result.error || 'Generation failed',
          cached: false
        });
      }

      // Rate limiting
      if (i < texts.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    const successful = results.filter(r => r.audio).length;
    logger.info(`Batch TTS Complete: ${successful}/${texts.length} successful`);

    res.json({
      success: true,
      results: results,
      summary: {
        total: texts.length,
        successful: successful,
        failed: texts.length - successful
      },
      elapsed_ms: Date.now() - startTime
    });

  } catch (error) {
    logger.error(`Batch TTS Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cache stats
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await audioCache.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cache
app.delete('/api/cache', async (req, res) => {
  try {
    await audioCache.clear();
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── ERROR HANDLING ─────────────────────────────────────

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ─── START SERVER ───────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`🚀 NUR Lingo Server running on http://localhost:${PORT}`);
  logger.info(`📝 Available voices: ${AVAILABLE_VOICES.join(', ')}`);
  logger.info(`💾 Cache directory: ${path.join(__dirname, 'cache')}`);
  logger.info(`📊 API endpoint: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

module.exports = app;