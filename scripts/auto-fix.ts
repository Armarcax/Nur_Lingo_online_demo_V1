// scripts/auto-fix.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface FixResult {
  file: string;
  issue: string;
  fixed: boolean;
  message?: string;
}

class AutoFixer {
  private results: FixResult[] = [];
  private fixedCount = 0;
  private failedCount = 0;

  async run() {
    console.log('🔧 Starting Auto-Fix...\n');
    console.log('═'.repeat(60));

    await this.fixMissingUtils();
    await this.fixMissingImports();
    await this.fixComponentExports();
    await this.fixLocalStorageKeys();
    await this.fixTypeErrors();
    await this.installMissingDeps();

    this.printSummary();
    this.saveResults();
  }

  // ─── 1. CREATE MISSING lib/utils.ts ────────────────────────────────
  private async fixMissingUtils() {
    console.log('📁 Creating missing lib/utils.ts...');

    const utilsPath = path.join(process.cwd(), 'src/lib/utils.ts');
    if (!fs.existsSync(utilsPath)) {
      const utilsContent = `
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
`;
      fs.writeFileSync(utilsPath, utilsContent);
      this.addResult('src/lib/utils.ts', 'Missing utils.ts', true, 'Created');
    } else {
      // Check if cn function exists
      const content = fs.readFileSync(utilsPath, 'utf8');
      if (!content.includes('export function cn')) {
        const fixedContent = `
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
` + content;
        fs.writeFileSync(utilsPath, fixedContent);
        this.addResult('src/lib/utils.ts', 'Missing cn function', true, 'Added');
      }
    }

    // Also create hooks/use-mobile.ts
    const hooksDir = path.join(process.cwd(), 'src/hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }
    const useMobilePath = path.join(hooksDir, 'use-mobile.ts');
    if (!fs.existsSync(useMobilePath)) {
      const useMobileContent = `
import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
`;
      fs.writeFileSync(useMobilePath, useMobileContent);
      this.addResult('src/hooks/use-mobile.ts', 'Missing use-mobile hook', true, 'Created');
    }
  }

  // ─── 2. FIX MISSING IMPORTS ─────────────────────────────────────────
  private async fixMissingImports() {
    console.log('📦 Fixing missing imports...');

    const srcDir = path.join(process.cwd(), 'src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      let fixed = false;
      let newContent = content;

      // Fix missing @/lib/utils imports
      if (content.includes('cn(') || content.includes('className') && content.includes('twMerge')) {
        if (!content.includes('from "@/lib/utils"') && !content.includes('from "@/lib/utils"')) {
          // Find import section
          const importRegex = /^import.*from.*['"][^'"]+['"]/gm;
          const imports = content.match(importRegex) || [];
          if (imports.length > 0) {
            // Add after last import
            const lastImport = imports[imports.length - 1];
            const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
            newContent = content.slice(0, lastImportIndex) + '\nimport { cn } from "@/lib/utils";' + content.slice(lastImportIndex);
            fixed = true;
          }
        }
      }

      // Fix missing @/hooks/use-mobile imports
      if (content.includes('useMobile') && !content.includes('from "@/hooks/use-mobile"')) {
        const importRegex = /^import.*from.*['"][^'"]+['"]/gm;
        const imports = content.match(importRegex) || [];
        if (imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
          newContent = content.slice(0, lastImportIndex) + '\nimport { useMobile } from "@/hooks/use-mobile";' + content.slice(lastImportIndex);
          fixed = true;
        }
      }

      if (fixed) {
        fs.writeFileSync(file, newContent);
        this.addResult(path.basename(file), 'Missing imports', true, 'Added missing imports');
      }
    }
  }

  // ─── 3. FIX COMPONENT EXPORTS ──────────────────────────────────────
  private async fixComponentExports() {
    console.log('🧩 Fixing component exports...');

    const componentsDir = path.join(process.cwd(), 'src/components');
    const files = this.getAllFiles(componentsDir, ['.tsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let fixed = false;

      // Fix missing 'use client' directive
      if (!content.startsWith('"use client"') && !content.includes('"use client"')) {
        newContent = '"use client";\n\n' + content;
        fixed = true;
      }

      // Fix component name conflicts
      const componentName = path.basename(file, '.tsx');
      if (content.includes(`export default ${componentName}`) && content.includes(`function ${componentName}`)) {
        // Already has correct export
      } else if (content.includes(`export function ${componentName}`) && !content.includes('export default')) {
        // Add default export
        const functionMatch = content.match(new RegExp(`export function ${componentName}\\s*\\([^)]*\\)\\s*\\{`));
        if (functionMatch) {
          newContent = content + `\n\nexport default ${componentName};\n`;
          fixed = true;
        }
      }

      if (fixed) {
        fs.writeFileSync(file, newContent);
        this.addResult(path.basename(file), 'Component exports', true, 'Fixed exports');
      }
    }
  }

  // ─── 4. FIX LOCAL STORAGE KEYS ──────────────────────────────────────
  private async fixLocalStorageKeys() {
    console.log('💾 Fixing localStorage keys...');

    const seedsPath = path.join(process.cwd(), 'src/lib/rewards/seeds.ts');
    if (fs.existsSync(seedsPath)) {
      const content = fs.readFileSync(seedsPath, 'utf8');
      let newContent = content;
      let fixed = false;

      // Add missing localStorage keys
      const requiredKeys = [
        'nur_lingo_seeds_v4',
        'nur_completed',
        'nur_lang_config',
        'nur_lesson_session'
      ];

      for (const key of requiredKeys) {
        if (!content.includes(`'${key}'`) && !content.includes(`"${key}"`)) {
          // Add comment about the key
          newContent = newContent.replace(
            '// localStorage keys',
            `// localStorage keys\nconst STORAGE_KEYS = {\n  SEEDS: 'nur_lingo_seeds_v4',\n  COMPLETED: 'nur_completed',\n  CONFIG: 'nur_lang_config',\n  SESSION: 'nur_lesson_session'\n};\n`
          );
          fixed = true;
          break;
        }
      }

      if (fixed) {
        fs.writeFileSync(seedsPath, newContent);
        this.addResult('seeds.ts', 'localStorage keys', true, 'Added missing keys');
      }
    }
  }

  // ─── 5. FIX COMMON TYPE ERRORS ─────────────────────────────────────
  private async fixTypeErrors() {
    console.log('🔷 Fixing TypeScript errors...');

    // Fix WAV_VOICES import
    const dictPath = path.join(process.cwd(), 'src/app/dictionary/page.tsx');
    if (fs.existsSync(dictPath)) {
      const content = fs.readFileSync(dictPath, 'utf8');
      if (content.includes('import { WAV_VOICES } from "@/lib/audio/WavClient"')) {
        const newContent = content.replace(
          'import { WAV_VOICES } from "@/lib/audio/WavClient"',
          'import WAV_VOICES from "@/lib/audio/WavClient"'
        );
        fs.writeFileSync(dictPath, newContent);
        this.addResult('dictionary/page.tsx', 'WAV_VOICES import', true, 'Fixed import');
      }
    }

    // Fix BadgeProps variant error
    const badgePath = path.join(process.cwd(), 'src/components/ui/badge.tsx');
    if (fs.existsSync(badgePath)) {
      const content = fs.readFileSync(badgePath, 'utf8');
      if (content.includes('interface BadgeProps') && !content.includes('variant?')) {
        const newContent = content.replace(
          'interface BadgeProps',
          'interface BadgeProps {\n  variant?: "default" | "secondary" | "destructive" | "outline";\n  className?: string;\n  children?: React.ReactNode;\n}'
        );
        fs.writeFileSync(badgePath, newContent);
        this.addResult('badge.tsx', 'BadgeProps', true, 'Added missing props');
      }
    }
  }

  // ─── 6. INSTALL MISSING DEPENDENCIES ──────────────────────────────
  private async installMissingDeps() {
    console.log('📦 Installing missing dependencies...');

    const missingDeps = [
      'clsx',
      'tailwind-merge',
      'zod',
      'class-variance-authority',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot',
      'cmdk',
      'sonner',
      'vaul',
      'react-resizable-panels',
      'embla-carousel-react',
      'recharts',
      'react-hook-form',
      'input-otp',
      'react-day-picker'
    ];

    try {
      console.log(`Installing ${missingDeps.length} packages...`);
      execSync(`npm install ${missingDeps.join(' ')} --legacy-peer-deps`, {
        stdio: 'inherit',
        timeout: 300000
      });
      this.addResult('package.json', 'Missing dependencies', true, `Installed ${missingDeps.length} packages`);
    } catch (error) {
      this.addResult('package.json', 'Missing dependencies', false, 'Failed to install some packages');
    }
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
    console.log(`\n⚠️ Please run 'npm run audit' again to verify fixes.`);
  }

  private saveResults() {
    const reportDir = path.join(process.cwd(), 'audit-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const filename = `fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const reportPath = path.join(reportDir, filename);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Fix report saved: ${reportPath}`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const fixer = new AutoFixer();
fixer.run().catch(console.error);