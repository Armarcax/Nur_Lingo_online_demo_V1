#!/usr/bin/env node
/**
 * Fix mobile issues:
 * 1. SnakePath — make responsive (islands scale with viewport)
 * 2. NuriFloating — raise up on mobile
 *
 * Usage: node scripts/fix-mobile-issues.js
 * Safe: LF endings preserved, UTF-8.
 */

const fs = require('fs');
const path = require('path');

console.log('');
console.log('='.repeat(72));
console.log('🔧 Fix mobile issues');
console.log('='.repeat(72));
console.log('');

// ─── FIX 1: SnakePath in world/page.tsx ─────────────────────────────

const worldPath = path.join(process.cwd(), 'src', 'app', 'world', 'page.tsx');
let world = fs.readFileSync(worldPath, 'utf8');

const before1 = world;

// (a) Add responsive width logic at the start of SnakePath
const anchorA = `  const { t } = useI18n();
  const STEP_Y = isCompact ? 100 : 130;
  const AMPLITUDE = isCompact ? 100 : 140;
  const WIDTH = isCompact ? 320 : 400;
  const centerX = WIDTH / 2;
  const height = Math.max(isCompact ? 120 : 160, lessons.length * STEP_Y + 40);`;

const replaceA = `  const { t } = useI18n();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  // 📱 Responsive: measure available width on the parent and scale all positions
  useEffect(() => {
    const measure = () => {
      const el = wrapperRef.current;
      if (!el || !el.parentElement) return;
      // GlassCard has p-6 (24px each side = 48px total padding)
      const available = el.parentElement.clientWidth - 48;
      setContainerWidth(Math.max(260, Math.min(400, available)));
    };
    // Let layout settle first
    const t = setTimeout(measure, 0);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const WIDTH = containerWidth;
  const scale = WIDTH / 400;
  const STEP_Y = (isCompact ? 100 : 130) * scale;
  const AMPLITUDE = (isCompact ? 100 : 140) * scale;
  const centerX = WIDTH / 2;
  const height = Math.max((isCompact ? 120 : 160) * scale, lessons.length * STEP_Y + 40);`;

if (world.includes(anchorA)) {
  world = world.replace(anchorA, replaceA);
  console.log('✅ SnakePath: added responsive width logic');
} else if (world.includes('wrapperRef')) {
  console.log('⏭️  SnakePath: already patched (wrapperRef found)');
} else {
  console.error('❌ SnakePath anchor A not found');
  process.exit(1);
}

// (b) Attach wrapperRef to the root div
const anchorB = `    <div className="relative mx-auto" style={{ width: WIDTH, height }}>`;
const replaceB = `    <div ref={wrapperRef} className="relative mx-auto" style={{ width: WIDTH, height }}>`;

if (world.includes(anchorB)) {
  world = world.replace(anchorB, replaceB);
  console.log('✅ SnakePath: attached wrapperRef');
} else if (world.includes('ref={wrapperRef} className="relative mx-auto"')) {
  console.log('⏭️  SnakePath: wrapperRef already attached');
} else {
  console.error('❌ SnakePath anchor B not found');
  process.exit(1);
}

if (world !== before1) {
  // Normalize to LF
  world = world.replace(/\r\n/g, '\n');
  fs.writeFileSync(worldPath, world, 'utf8');
  console.log('💾 Saved world/page.tsx');
} else {
  console.log('⏭️  world/page.tsx unchanged');
}

// ─── FIX 2: NuriFloating positionClasses ─────────────────────────────

const nuriPath = path.join(process.cwd(), 'src', 'components', 'NuriFloating.tsx');
let nuri = fs.readFileSync(nuriPath, 'utf8');
const before2 = nuri;

const anchorC = `  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };`;

const replaceC = `  const positionClasses = {
    // 📱 Mobile: raise Nuri up so it doesn't overlap the bottom nav
    // 🖥️  Desktop (md+): keep it near the bottom corner
    "bottom-right": "bottom-24 md:bottom-6 right-4",
    "bottom-left": "bottom-24 md:bottom-6 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };`;

if (nuri.includes(anchorC)) {
  nuri = nuri.replace(anchorC, replaceC);
  console.log('✅ NuriFloating: raised position on mobile');
} else if (nuri.includes('bottom-24 md:bottom-6')) {
  console.log('⏭️  NuriFloating: already patched');
} else {
  console.error('❌ NuriFloating anchor not found');
  process.exit(1);
}

if (nuri !== before2) {
  nuri = nuri.replace(/\r\n/g, '\n');
  fs.writeFileSync(nuriPath, nuri, 'utf8');
  console.log('💾 Saved NuriFloating.tsx');
} else {
  console.log('⏭️  NuriFloating.tsx unchanged');
}

console.log('');
console.log('='.repeat(72));
console.log('✅ Done');
console.log('='.repeat(72));
console.log('');
console.log('📋 Next steps:');
console.log('   1. npx tsc --noEmit');
console.log('   2. git diff --stat');
console.log('   3. npm run dev  (test on mobile)');
console.log('');