// lib/logger.js
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = path.join(__dirname, '..', logDir);
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    const logString = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(this.logDir, `${new Date().toISOString().slice(0, 10)}.log`);
    
    fs.appendFileSync(logFile, logString);

    // Also log to console
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  error(message, error = null) {
    this.log('error', message, { error: error?.message, stack: error?.stack });
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
}

module.exports = new Logger();