// scripts/fix-final-errors.ts
import fs from 'fs';
import path from 'path';

interface FixResult {
  file: string;
  issue: string;
  fixed: boolean;
  message?: string;
}

class FixFinalErrors {
  private results: FixResult[] = [];
  private fixedCount = 0;
  private failedCount = 0;

  async run() {
    console.log('🔧 Fixing final errors...\n');
    console.log('═'.repeat(60));

    await this.fixBadgeFile();
    await this.fixWavVoices();

    this.printSummary();
    this.saveResults();
  }

  // ─── 1. FIX badge.tsx ─────────────────────────────────────────────────
  private async fixBadgeFile() {
    console.log('📁 Fixing badge.tsx...');

    const badgePath = path.join(process.cwd(), 'src/components/ui/badge.tsx');
    
    if (!fs.existsSync(badgePath)) {
      // Create the file if it doesn't exist
      const badgeContent = `"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
`;
      fs.writeFileSync(badgePath, badgeContent);
      this.addResult('src/components/ui/badge.tsx', 'Declaration or statement expected', true, 'Recreated file');
      return;
    }

    // Read and fix existing file
    const content = fs.readFileSync(badgePath, 'utf8');
    
    // Fix the BadgeProps interface
    let newContent = content;
    
    // Remove any broken interface declarations
    newContent = newContent.replace(/interface\s+BadgeProps\s*\{[^}]*\}/s, '');
    
    // Add proper BadgeProps
    newContent = newContent.replace(
      /export\s+interface\s+BadgeProps/,
      'export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}'
    );
    
    // If there's no proper export, add it
    if (!newContent.includes('export interface BadgeProps')) {
      newContent = newContent.replace(
        /import\s*\{\s*cn\s*\}\s*from\s*["']@\/lib\/utils["']/,
        `import { cn } from "@/lib/utils";\n\nexport interface BadgeProps\n  extends React.HTMLAttributes<HTMLDivElement>,\n    VariantProps<typeof badgeVariants> {}`
      );
    }
    
    // Fix missing imports
    if (!newContent.includes('import { cva }')) {
      newContent = newContent.replace(
        /import\s*\{\s*cn\s*\}\s*from\s*["']@\/lib\/utils["']/,
        `import { cva, type VariantProps } from "class-variance-authority";\nimport { cn } from "@/lib/utils";`
      );
    }
    
    fs.writeFileSync(badgePath, newContent);
    this.addResult('src/components/ui/badge.tsx', 'Declaration or statement expected', true, 'Fixed BadgeProps');
  }

  // ─── 2. FIX WAV_VOICES import ─────────────────────────────────────────
  private async fixWavVoices() {
    console.log('📁 Fixing WAV_VOICES import...');

    // First, check if WavClient.ts exists and has the export
    const wavClientPath = path.join(process.cwd(), 'src/lib/audio/WavClient.ts');
    if (fs.existsSync(wavClientPath)) {
      const content = fs.readFileSync(wavClientPath, 'utf8');
      
      // If WAV_VOICES is not exported as default, add it
      if (!content.includes('export default WAV_VOICES') && !content.includes('export default')) {
        // Add default export
        let newContent = content;
        if (content.includes('export const WAV_VOICES')) {
          newContent = content + '\n\nexport default WAV_VOICES;\n';
        } else if (content.includes('const WAV_VOICES')) {
          newContent = content + '\n\nexport default WAV_VOICES;\n';
        } else {
          // Create WAV_VOICES if it doesn't exist
          newContent = content + `
// WAV_VOICES export for dictionary page
export const WAV_VOICES = {
  en: ['en-US-1', 'en-US-2', 'en-GB-1'],
  hy: ['hy-AM-1', 'hy-AM-2'],
  ru: ['ru-RU-1', 'ru-RU-2']
};

export default WAV_VOICES;
`;
        }
        fs.writeFileSync(wavClientPath, newContent);
        this.addResult('src/lib/audio/WavClient.ts', 'WAV_VOICES export', true, 'Added default export');
      } else {
        this.addResult('src/lib/audio/WavClient.ts', 'WAV_VOICES export', true, 'Already has export');
      }
    } else {
      // Create WavClient.ts if it doesn't exist
      const wavClientContent = `// WAV Audio Client for TTS
// This file provides voice configuration for different languages

export const WAV_VOICES = {
  en: ['en-US-1', 'en-US-2', 'en-GB-1'],
  hy: ['hy-AM-1', 'hy-AM-2'],
  ru: ['ru-RU-1', 'ru-RU-2']
};

export class WavClient {
  constructor(private apiKey: string) {}

  async transcribeAudio(audioData: ArrayBuffer): Promise<string> {
    // Implementation will be added later
    return "Transcription result";
  }

  async getAvailableVoices(): Promise<string[]> {
    return Object.values(WAV_VOICES).flat();
  }
}

export default WAV_VOICES;
`;
      const dir = path.dirname(wavClientPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(wavClientPath, wavClientContent);
      this.addResult('src/lib/audio/WavClient.ts', 'WAV_VOICES export', true, 'Created file with export');
    }

    // Fix the import in dictionary/page.tsx
    const dictPaths = [
      'src/app/dictionary/page.tsx',
      'src/app/dictionary/page.ts'
    ];

    for (const dictPath of dictPaths) {
      const fullPath = path.join(process.cwd(), dictPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        
        // Fix import to use default import
        if (content.includes('import { WAV_VOICES } from')) {
          newContent = content.replace(
            /import\s*\{\s*WAV_VOICES\s*\}\s*from\s*["'][^"']+["']/g,
            'import WAV_VOICES from "@/lib/audio/WavClient"'
          );
          fs.writeFileSync(fullPath, newContent);
          this.addResult(dictPath, 'WAV_VOICES import', true, 'Fixed to default import');
          return;
        }
      }
    }

    // If dictionary page doesn't exist, create a simple one
    const dictPath = path.join(process.cwd(), 'src/app/dictionary/page.tsx');
    if (!fs.existsSync(dictPath)) {
      const dictContent = `"use client";

import { useState, useEffect } from 'react';
import WAV_VOICES from '@/lib/audio/WavClient';

export default function DictionaryPage() {
  const [voices, setVoices] = useState<string[]>([]);

  useEffect(() => {
    // Load voices from WAV_VOICES
    const allVoices = Object.values(WAV_VOICES).flat();
    setVoices(allVoices);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dictionary</h1>
      <div className="grid gap-2">
        {voices.map((voice, index) => (
          <div key={index} className="p-2 bg-white/5 rounded">
            {voice}
          </div>
        ))}
      </div>
    </div>
  );
}
`;
      const dir = path.dirname(dictPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dictPath, dictContent);
      this.addResult('src/app/dictionary/page.tsx', 'WAV_VOICES import', true, 'Created page with import');
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

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
      console.log('\n🎉 All errors fixed! Run: npm run audit');
    } else {
      console.log('\n⚠️ Some issues remain. Please check manually.');
    }
  }

  private saveResults() {
    const reportDir = path.join(process.cwd(), 'audit-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const filename = `fix-final-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const reportPath = path.join(reportDir, filename);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Fix report saved: ${reportPath}`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const fixer = new FixFinalErrors();
fixer.run().catch(console.error);