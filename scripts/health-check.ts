// scripts/health-check.ts
import fs from 'fs';
import path from 'path';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }[];
  details: {
    nodeVersion: string;
    memory: string;
    uptime: string;
    env: string;
  };
}

function runHealthCheck(): HealthCheck {
  const checks: { name: string; status: 'pass' | 'fail'; message?: string }[] = [];
  const startTime = Date.now();

  // 1. Check Node.js version
  const nodeVersion = process.version;
  if (nodeVersion.startsWith('v18') || nodeVersion.startsWith('v20')) {
    checks.push({ name: 'Node.js version', status: 'pass' });
  } else {
    checks.push({ name: 'Node.js version', status: 'fail', message: `Node ${nodeVersion} is not v18+` });
  }

  // 2. Check required files
  const requiredFiles = [
    'src/app/page.tsx',
    'src/app/world/page.tsx',
    'src/components/BottomNav.tsx',
    'src/lib/rewards/seeds.ts'
  ];
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checks.push({
      name: `File: ${file}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? undefined : 'File not found'
    });
  }

  // 3. Check package.json
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (pkg.dependencies && pkg.devDependencies) {
      checks.push({ name: 'package.json', status: 'pass' });
    }
  } catch {
    checks.push({ name: 'package.json', status: 'fail', message: 'Invalid package.json' });
  }

  // 4. Check build output
  const hasNextDir = fs.existsSync(path.join(process.cwd(), '.next'));
  checks.push({
    name: 'Build output (.next)',
    status: hasNextDir ? 'pass' : 'fail',
    message: hasNextDir ? undefined : 'Run npm run build first'
  });

  // 5. Check node_modules
  const hasNodeModules = fs.existsSync(path.join(process.cwd(), 'node_modules'));
  checks.push({
    name: 'Dependencies (node_modules)',
    status: hasNodeModules ? 'pass' : 'fail',
    message: hasNodeModules ? undefined : 'Run npm install first'
  });

  const failed = checks.filter(c => c.status === 'fail').length;
  const status = failed === 0 ? 'healthy' : failed > 3 ? 'unhealthy' : 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    details: {
      nodeVersion,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      uptime: `${Math.round((Date.now() - startTime) / 1000)}s`,
      env: process.env.NODE_ENV || 'development'
    }
  };
}

// ─── RUN ──────────────────────────────────────────────────────────────────

const result = runHealthCheck();
console.log(JSON.stringify(result, null, 2));

// Exit with error if unhealthy
if (result.status === 'unhealthy') {
  process.exit(1);
}