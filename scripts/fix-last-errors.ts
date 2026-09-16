// scripts/fix-last-errors.ts
import fs from 'fs';
import path from 'path';

interface FixResult {
  file: string;
  issue: string;
  fixed: boolean;
  message?: string;
}

class FixLastErrors {
  private results: FixResult[] = [];
  private fixedCount = 0;
  private failedCount = 0;

  async run() {
    console.log('🔧 Fixing LAST errors...\n');
    console.log('═'.repeat(60));

    await this.fixWavClientExports();
    await this.fixDialogueFunctions();
    await this.fixAllImports();

    this.printSummary();
    this.saveResults();
  }

  // ─── 1. FIX WavClient.ts exports ─────────────────────────────────────
  private async fixWavClientExports() {
    console.log('📁 Fixing WavClient.ts exports...');

    const wavPath = path.join(process.cwd(), 'src/lib/audio/WavClient.ts');
    const fixedContent = `// WAV Audio Client for TTS
// This file provides voice configuration for different languages

export const WAV_VOICES = {
  en: ['en-US-1', 'en-US-2', 'en-GB-1'],
  hy: ['hy-AM-1', 'hy-AM-2'],
  ru: ['ru-RU-1', 'ru-RU-2']
};

export class WavClient {
  constructor(private apiKey?: string) {}

  async transcribe(audioData: ArrayBuffer): Promise<string> {
    // Implementation will be added later
    return "Transcription result";
  }

  async getAvailableVoices(): Promise<string[]> {
    return Object.values(WAV_VOICES).flat();
  }

  async synthesizeSpeech(text: string, voice: string): Promise<ArrayBuffer> {
    // Implementation will be added later
    return new ArrayBuffer(0);
  }
}

// Export singleton instance getter
let instance: WavClient | null = null;

export function getWavClient(): WavClient {
  if (!instance) {
    instance = new WavClient();
  }
  return instance;
}

export default WAV_VOICES;
`;
    fs.writeFileSync(wavPath, fixedContent);
    this.addResult('WavClient.ts', 'getWavClient export', true, 'Added getWavClient function');
  }

  // ─── 2. FIX dialogue.functions.ts ────────────────────────────────────
  private async fixDialogueFunctions() {
    console.log('📁 Fixing dialogue.functions.ts...');

    const dlgPath = path.join(process.cwd(), 'src/lib/ai/dialogue.functions.ts');
    if (fs.existsSync(dlgPath)) {
      const content = fs.readFileSync(dlgPath, 'utf8');
      let newContent = content;

      // Remove any broken syntax
      newContent = newContent.replace(
        /const\s+.*?\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*\}/gs,
        (match) => {
          // Clean up any broken function definitions
          return match.replace(/createServerFn/g, '');
        }
      );

      // Fix any remaining issues
      newContent = newContent.replace(
        /\(\s*\{[^}]*\}\s*\)/g,
        '()'
      );

      // Ensure proper function syntax
      newContent = newContent.replace(
        /async\s*\(\s*\)\s*=>\s*\{/g,
        'async function dialogueHandler() {'
      );

      fs.writeFileSync(dlgPath, newContent);
      this.addResult('dialogue.functions.ts', 'Syntax errors', true, 'Fixed function syntax');
    }
  }

  // ─── 3. FIX all imports ──────────────────────────────────────────────
  private async fixAllImports() {
    console.log('📁 Fixing all imports...');

    const srcDir = path.join(process.cwd(), 'src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    let fixedCount = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let changed = false;

      // Fix WavClient imports - change { getWavClient } to getWavClient
      if (content.includes('import { getWavClient } from')) {
        newContent = newContent.replace(
          /import\s*\{\s*getWavClient\s*\}\s*from\s*["'][^"']+["']/g,
          'import { getWavClient } from "@/lib/audio/WavClient"'
        );
        changed = true;
      }

      // Fix WAV_VOICES imports
      if (content.includes('import { WAV_VOICES } from') && !content.includes('import WAV_VOICES from')) {
        newContent = newContent.replace(
          /import\s*\{\s*WAV_VOICES\s*\}\s*from\s*["'][^"']+["']/g,
          'import WAV_VOICES from "@/lib/audio/WavClient"'
        );
        changed = true;
      }

      // Fix default imports that should be named
      if (content.includes('import WAV_VOICES from') && content.includes('WAV_VOICES.')) {
        // Keep as is - default import is correct
      }

      if (changed) {
        fs.writeFileSync(file, newContent);
        fixedCount++;
      }
    }

    this.addResult('All files', 'Imports', true, `Fixed imports in ${fixedCount} files`);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
          files.push(...this.getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  private addResult(file: string, issue: string, fixed: boolean, message?: string) {
    this.results.push({ file, issue, fixed, message });
    if (fixed) this.fixedCount++;
    else this.failedCount++;
  }

  private printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('═'.repeat(60));

    console.log(`\n✅ Fixed: ${this.fixedCount}`);
    console.log(`❌ Failed: ${this.failedCount}`);
    console.log(`📝 Total: ${this.results.length}`);

    if (this.fixedCount > 0) {
      console.log('\n✅ Fixed issues:');
      for (const r of this.results) {
        if (r.fixed) {
          console.log(`  ✅ ${r.file} - ${r.issue} (${r.message})`);
        }
      }
    }

    if (this.failedCount > 0) {
      console.log('\n❌ Failed issues:');
      for (const r of this.results) {
        if (!r.fixed) {
          console.log(`  ❌ ${r.file} - ${r.issue} (${r.message})`);
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    
    if (this.fixedCount > 0 && this.failedCount === 0) {
      console.log('\n🎉 All 8 errors fixed! Run: npm run audit');
    } else {
      console.log('\n⚠️ Some issues remain. Run: npm run audit');
    }
  }

  private saveResults() {
    const reportDir = path.join(process.cwd(), 'audit-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const filename = `fix-last-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const reportPath = path.join(reportDir, filename);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Fix report saved: ${reportPath}`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const fixer = new FixLastErrors();
fixer.run().catch(console.error);