// lib/wav-api.js
const fs = require('fs');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

class WavAPI {
  constructor(token, projectId, baseUrl = 'https://wav.am') {
    this.token = token;
    this.projectId = projectId;
    this.baseUrl = baseUrl;
  }

  async textToSpeech(text, voice = 'Avet', format = 'mp3') {
    try {
      const response = await fetch(`${this.baseUrl}/generate_audio/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        },
        body: JSON.stringify({
          project_id: this.projectId,
          text: text,
          voice: voice,
          format: format
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Download the audio file
      const audioUrl = `${this.baseUrl}${data.path}`;
      const audioResponse = await fetch(audioUrl, {
        headers: {
          'Authorization': this.token
        }
      });

      if (!audioResponse.ok) {
        throw new Error(`Audio download failed: ${audioResponse.status}`);
      }

      const audioBuffer = await audioResponse.buffer();
      const audioBase64 = audioBuffer.toString('base64');

      return {
        success: true,
        audioData: audioBase64,
        duration: data.duration,
        path: data.path,
        format: format
      };

    } catch (error) {
      console.error('TTS Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async speechToText(audioPath, language = 'hy', numSpeakers = 1) {
    try {
      if (!fs.existsSync(audioPath)) {
        throw new Error(`File not found: ${audioPath}`);
      }

      // Use curl for ASR (more reliable)
      const curlCommand = `curl -s -X POST "${this.baseUrl}/transcribe_audio/" -H "Authorization: ${this.token}" -F "project_id=${this.projectId}" -F "language=${language}" -F "num_speakers=${numSpeakers}" -F "audio_file=@${audioPath}"`;

      const result = execSync(curlCommand, {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      // Parse JSON response
      try {
        const data = JSON.parse(result);
        return {
          success: true,
          text: data.text || result
        };
      } catch (parseError) {
        // If not JSON, return raw
        return {
          success: true,
          text: result.trim()
        };
      }

    } catch (error) {
      console.error('ASR Error:', error);
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }
}

module.exports = WavAPI;