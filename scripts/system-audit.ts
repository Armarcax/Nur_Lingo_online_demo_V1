// scripts/system-audit.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface AuditResult {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  summary: {
    pageErrors: string[];
    componentErrors: string[];
    apiErrors: string[];
    navigationErrors: string[];
    dataErrors: string[];
    performanceWarnings: string[];
  };
  coverage: {
    pages: { path: string; status: 'ok' | 'error' | 'missing' }[];
    components: { name: string; status: 'ok' | 'error' | 'missing' }[];
    apis: { route: string; status: 'ok' | 'error' | 'missing' }[];
  };
}

interface TestResult {
  id: string;
  name: string;
  category: 'page' | 'component' | 'api' | 'navigation' | 'data' | 'performance';
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration: number;
  timestamp: string;
}

interface TestContext {
  consoleErrors: string[];
  networkErrors: string[];
  navigationLog: string[];
  domSnapshots: Map<string, string>;
}

// ─── TEST CONFIGURATION ──────────────────────────────────────────────────
const TEST_CONFIG = {
  pages: ['/', '/world', '/learn', '/garden', '/dictionary', '/dialogues', '/curriculum', '/onboarding'],
  apiRoutes: [
    '/api/check-answer',
    '/api/credits',
    '/api/dialogue',
    '/api/generate-wav',
    '/api/lesson',
    '/api/lesson/generate',
    '/api/lexicon',
    '/api/lexicon/full',
    '/api/validate'
  ],
  criticalComponents: [
    'BottomNav',
    'Nuri',
    'ThemeToggle',
    'InteractiveDialogue',
    'MultilingualLearningModule',
    'UserRecordingButton'
  ],
  localStorageKeys: [
    'nur_lang_config',
    'nur_lingo_seeds_v4',
    'nur_completed',
    'nur_lesson_session',
    'nur_rewards_cache'
  ]
};

// ─── MAIN AUDIT CLASS ────────────────────────────────────────────────────
class SystemAudit {
  private results: AuditResult;
  private context: TestContext;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      results: [],
      summary: {
        pageErrors: [],
        componentErrors: [],
        apiErrors: [],
        navigationErrors: [],
        dataErrors: [],
        performanceWarnings: []
      },
      coverage: {
        pages: [],
        components: [],
        apis: []
      }
    };
    this.context = {
      consoleErrors: [],
      networkErrors: [],
      navigationLog: [],
      domSnapshots: new Map()
    };
  }

  // ─── RUN ALL TESTS ──────────────────────────────────────────────────
  async run() {
    console.log('🔍 Starting System Audit...\n');
    console.log('═'.repeat(60));

    await this.checkFileStructure();
    await this.checkTypeScriptErrors();
    await this.checkImports();
    await this.checkPages();
    await this.checkComponents();
    await this.checkAPIs();
    await this.checkNavigation();
    await this.checkDataPersistence();
    await this.checkDependencies();
    await this.checkBuild();

    this.printReport();
    this.saveReport();
    return this.results;
  }

  // ─── 1. FILE STRUCTURE ──────────────────────────────────────────────
  private async checkFileStructure() {
    console.log('📁 Checking file structure...');

    const requiredFiles = [
      'src/app/page.tsx',
      'src/app/world/page.tsx',
      'src/app/learn/page.tsx',
      'src/components/BottomNav.tsx',
      'src/components/Nuri.tsx',
      'src/lib/rewards/seeds.ts',
      'src/lib/rewards/quests.ts',
      'src/lib/i18n/multilingual.ts',
      'src/lib/lessons/engine.ts'
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      if (!exists) {
        this.addError('file', `Missing file: ${file}`);
      }
    }
  }

  // ─── 2. TYPESCRIPT ERRORS ────────────────────────────────────────────
  private async checkTypeScriptErrors() {
    console.log('🔷 Checking TypeScript errors...');

    try {
      const output = execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        timeout: 60000
      });
      if (output.includes('error TS')) {
        const errors = output.split('\n').filter(line => line.includes('error TS'));
        for (const error of errors) {
          this.addError('typescript', error.trim());
        }
      }
    } catch (error: any) {
      if (error.stdout) {
        const errors = error.stdout.split('\n').filter((line: string) => line.includes('error TS'));
        for (const err of errors) {
          this.addError('typescript', err.trim());
        }
      } else {
        this.addError('typescript', `TS check failed: ${error.message}`);
      }
    }
  }

  // ─── 3. IMPORTS ─────────────────────────────────────────────────────
  private async checkImports() {
    console.log('📦 Checking imports...');

    const srcDir = path.join(process.cwd(), 'src');
    const files = this.getAllFiles(srcDir, ['.tsx', '.ts']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('@/')) {
          const resolvedPath = importPath.replace('@/', 'src/');
          const fullPath = path.join(process.cwd(), resolvedPath);
          const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
          const exists = possibleExtensions.some(ext => {
            return fs.existsSync(fullPath + ext) || fs.existsSync(path.join(fullPath, 'index' + ext));
          });

          if (!exists) {
            this.addError('import', `Missing import: ${importPath} in ${path.basename(file)}`);
          }
        }
      }
    }
  }

  // ─── 4. PAGES ────────────────────────────────────────────────────────
  private async checkPages() {
    console.log('📄 Checking pages...');

    for (const page of TEST_CONFIG.pages) {
      const pagePath = page === '/' ? 'src/app/page.tsx' : `src/app${page}/page.tsx`;
      const fullPath = path.join(process.cwd(), pagePath);

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        this.results.coverage.pages.push({ path: page, status: 'ok' });

        // Check for common issues
        if (!content.includes('"use client"') && content.includes('useState')) {
          this.addWarning('page', `Page ${page} uses useState but is not marked 'use client'`);
        }
        if (!content.includes('export default')) {
          this.addError('page', `Page ${page} missing default export`);
        }
        if (content.includes('console.log')) {
          this.addWarning('page', `Page ${page} contains console.log statements`);
        }
      } else {
        this.results.coverage.pages.push({ path: page, status: 'missing' });
        this.addError('page', `Missing page: ${page}`);
      }
    }
  }

  // ─── 5. COMPONENTS ──────────────────────────────────────────────────
  private async checkComponents() {
    console.log('🧩 Checking components...');

    const componentsDir = path.join(process.cwd(), 'src/components');
    const componentFiles = this.getAllFiles(componentsDir, ['.tsx']);

    for (const comp of TEST_CONFIG.criticalComponents) {
      const found = componentFiles.some(f => f.includes(comp + '.tsx') || f.includes(comp + '/'));
      if (found) {
        this.results.coverage.components.push({ name: comp, status: 'ok' });
        // Check component exports
        const compFile = componentFiles.find(f => f.includes(comp + '.tsx'));
        if (compFile) {
          const content = fs.readFileSync(compFile, 'utf8');
          if (!content.includes('export default') && !content.includes(`export { ${comp}`)) {
            this.addError('component', `Component ${comp} missing export`);
          }
        }
      } else {
        this.results.coverage.components.push({ name: comp, status: 'missing' });
        this.addError('component', `Missing component: ${comp}`);
      }
    }

    // Check for component size issues
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      if (lines > 400) {
        this.addWarning('performance', `Component ${path.basename(file)} is large (${lines} lines)`);
      }
    }
  }

  // ─── 6. APIS ─────────────────────────────────────────────────────────
  private async checkAPIs() {
    console.log('🔌 Checking APIs...');

    for (const route of TEST_CONFIG.apiRoutes) {
      const apiPath = path.join(process.cwd(), 'src/app/api', route.replace('/api/', ''), 'route.ts');
      if (fs.existsSync(apiPath)) {
        this.results.coverage.apis.push({ route, status: 'ok' });
        const content = fs.readFileSync(apiPath, 'utf8');
        if (!content.includes('export async function') && !content.includes('export function')) {
          this.addError('api', `API ${route} missing handler function`);
        }
        if (content.includes('console.log')) {
          this.addWarning('api', `API ${route} contains console.log`);
        }
      } else {
        this.results.coverage.apis.push({ route, status: 'missing' });
        this.addError('api', `Missing API: ${route}`);
      }
    }
  }

  // ─── 7. NAVIGATION ──────────────────────────────────────────────────
  private async checkNavigation() {
    console.log('🧭 Checking navigation...');

    // Check BottomNav links
    const bottomNavPath = path.join(process.cwd(), 'src/components/BottomNav.tsx');
    if (fs.existsSync(bottomNavPath)) {
      const content = fs.readFileSync(bottomNavPath, 'utf8');
      const navLinks = content.match(/href=["']([^"']+)["']/g) || [];
      for (const link of navLinks) {
        const href = link.replace(/href=["']/g, '').replace(/["']/g, '');
        if (href.startsWith('/') && !href.startsWith('/api')) {
          const pagePath = href === '/' ? 'src/app/page.tsx' : `src/app${href}/page.tsx`;
          if (!fs.existsSync(path.join(process.cwd(), pagePath))) {
            this.addError('navigation', `Nav link ${href} points to missing page`);
          }
        }
      }
    }

    // Check useRouter usage
    const pages = this.getAllFiles(path.join(process.cwd(), 'src/app'), ['.tsx']);
    for (const page of pages) {
      const content = fs.readFileSync(page, 'utf8');
      if (content.includes('useRouter') && !content.includes('"use client"')) {
        this.addError('navigation', `Page ${path.basename(page)} uses useRouter without 'use client'`);
      }
    }
  }

  // ─── 8. DATA PERSISTENCE ────────────────────────────────────────────
  private async checkDataPersistence() {
    console.log('💾 Checking data persistence...');

    for (const key of TEST_CONFIG.localStorageKeys) {
      // Check if key is used in code
      const found = this.searchInFiles(key);
      if (!found) {
        this.addWarning('data', `LocalStorage key '${key}' not found in code`);
      }
    }

    // Check seeds.ts
    const seedsPath = path.join(process.cwd(), 'src/lib/rewards/seeds.ts');
    if (fs.existsSync(seedsPath)) {
      const content = fs.readFileSync(seedsPath, 'utf8');
      if (!content.includes('localStorage.setItem') && !content.includes('localStorage.getItem')) {
        this.addError('data', 'seeds.ts not using localStorage for persistence');
      }
    }
  }

  // ─── 9. DEPENDENCIES ──────────────────────────────────────────────────
  private async checkDependencies() {
    console.log('📦 Checking dependencies...');

    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for outdated or vulnerable packages
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdated) {
        const outdatedData = JSON.parse(outdated);
        for (const [name, info] of Object.entries(outdatedData) as any) {
          this.addWarning('performance', `Package ${name} is outdated: ${info.current} → ${info.latest}`);
        }
      }
    } catch (error) {
      // npm outdated might exit with code 1 if there are outdated packages
      const output = (error as any).stdout || '';
      if (output) {
        try {
          const outdatedData = JSON.parse(output);
          for (const [name, info] of Object.entries(outdatedData) as any) {
            this.addWarning('performance', `Package ${name} is outdated: ${info.current} → ${info.latest}`);
          }
        } catch {}
      }
    }
  }

  // ─── 10. BUILD ────────────────────────────────────────────────────────
  private async checkBuild() {
    console.log('🏗️ Checking build...');

    try {
      const output = execSync('npm run build 2>&1', {
        encoding: 'utf8',
        timeout: 300000,
        maxBuffer: 50 * 1024 * 1024
      });

      if (output.includes('Failed to compile')) {
        const errors = output.split('\n').filter(line => line.includes('error'));
        for (const err of errors) {
          this.addError('build', err.trim());
        }
      }

      if (output.includes('warning')) {
        const warnings = output.split('\n').filter(line => line.includes('warning'));
        for (const warn of warnings) {
          this.addWarning('performance', warn.trim());
        }
      }
    } catch (error: any) {
      if (error.stdout) {
        if (error.stdout.includes('Failed to compile')) {
          const errors = error.stdout.split('\n').filter((line: string) => line.includes('error'));
          for (const err of errors) {
            this.addError('build', err.trim());
          }
        }
      } else {
        this.addError('build', `Build failed: ${error.message}`);
      }
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

  private searchInFiles(query: string): boolean {
    const files = this.getAllFiles(path.join(process.cwd(), 'src'), ['.tsx', '.ts', '.jsx', '.js']);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(query)) {
        return true;
      }
    }
    return false;
  }

  private addError(category: string, message: string) {
    this.results.summary.pageErrors.push(`[${category}] ${message}`);
    this.results.failed++;
    this.results.totalTests++;
  }

  private addWarning(category: string, message: string) {
    this.results.summary.performanceWarnings.push(`[${category}] ${message}`);
  }

  // ─── REPORT ────────────────────────────────────────────────────────────

  private printReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 AUDIT REPORT');
    console.log('═'.repeat(60));

    console.log(`\n📈 Results:`);
    console.log(`  ✅ Passed: ${this.results.passed}`);
    console.log(`  ❌ Failed: ${this.results.failed}`);
    console.log(`  ⏭️ Skipped: ${this.results.skipped}`);
    console.log(`  📝 Total: ${this.results.totalTests}`);

    if (this.results.summary.pageErrors.length > 0) {
      console.log(`\n❌ Errors (${this.results.summary.pageErrors.length}):`);
      for (const err of this.results.summary.pageErrors) {
        console.log(`  🔴 ${err}`);
      }
    }

    if (this.results.summary.performanceWarnings.length > 0) {
      console.log(`\n⚠️ Warnings (${this.results.summary.performanceWarnings.length}):`);
      for (const warn of this.results.summary.performanceWarnings) {
        console.log(`  🟡 ${warn}`);
      }
    }

    console.log('\n📁 Coverage:');
    console.log(`  📄 Pages: ${this.results.coverage.pages.filter(p => p.status === 'ok').length}/${this.results.coverage.pages.length}`);
    console.log(`  🧩 Components: ${this.results.coverage.components.filter(c => c.status === 'ok').length}/${this.results.coverage.components.length}`);
    console.log(`  🔌 APIs: ${this.results.coverage.apis.filter(a => a.status === 'ok').length}/${this.results.coverage.apis.length}`);

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n⏱️ Duration: ${duration}s`);
    console.log('\n' + '═'.repeat(60));

    if (this.results.failed === 0) {
      console.log('✅ All tests passed! System is healthy.');
    } else {
      console.log(`❌ ${this.results.failed} tests failed. Please fix the issues above.`);
    }
  }

  private saveReport() {
    const reportDir = path.join(process.cwd(), 'audit-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    const filename = `audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const reportPath = path.join(reportDir, filename);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const audit = new SystemAudit();
audit.run().catch(console.error);