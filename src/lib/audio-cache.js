// lib/audio-cache.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AudioCache {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this.metadataFile = path.join(cacheDir, 'metadata.json');
    this.metadata = this.loadMetadata();
  }

  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const data = fs.readFileSync(this.metadataFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
    return {};
  }

  saveMetadata() {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(this.metadata, null, 2));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  generateKey(text, voice) {
    const hash = crypto.createHash('md5')
      .update(`${text}_${voice}`)
      .digest('hex');
    return hash;
  }

  async get(key) {
    const filePath = path.join(this.cacheDir, `${key}.mp3`);
    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        return buffer.toString('base64');
      } catch (error) {
        console.error('Cache read error:', error);
        return null;
      }
    }
    return null;
  }

  async set(key, audioData, metadata = {}) {
    try {
      const filePath = path.join(this.cacheDir, `${key}.mp3`);
      const buffer = Buffer.from(audioData, 'base64');
      fs.writeFileSync(filePath, buffer);

      // Store metadata
      this.metadata[key] = {
        created: new Date().toISOString(),
        ...metadata
      };
      this.saveMetadata();

      return true;
    } catch (error) {
      console.error('Cache write error:', error);
      return false;
    }
  }

  async getStats() {
    const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.mp3'));
    return {
      total_files: files.length,
      total_size_mb: files.reduce((total, file) => {
        const stats = fs.statSync(path.join(this.cacheDir, file));
        return total + stats.size / (1024 * 1024);
      }, 0).toFixed(2),
      metadata_entries: Object.keys(this.metadata).length
    };
  }

  async clear() {
    const files = fs.readdirSync(this.cacheDir);
    files.forEach(file => {
      if (file.endsWith('.mp3')) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    });
    this.metadata = {};
    this.saveMetadata();
  }
}

module.exports = AudioCache;