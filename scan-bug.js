// scan-bug.js — NUR Lingo theme background bug scanner
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

console.log("\n═══════════════════════════════════════════════");
console.log("🔍 NUR LINGO — THEME BACKGROUND BUG SCANNER");
console.log("═══════════════════════════════════════════════\n");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

function walk(dir, exts, results = []) {
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (
        item === "node_modules" ||
        item === ".next" ||
        item === ".git" ||
        item === "dist" ||
        item === "build"
      )
        continue;
      walk(full, exts, results);
    } else {
      const ext = path.extname(item);
      if (exts.includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function findMatches(text, patterns) {
  const lines = text.split("\n");
  const found = [];
  lines.forEach((line, idx) => {
    for (const p of patterns) {
      if (line.match(p)) {
        found.push({ line: idx + 1, text: line.trim(), pattern: p.toString() });
      }
    }
  });
  return found;
}

// ─────────────────────────────────────────────
// 1. FIND ThemeBackground FILES
// ─────────────────────────────────────────────

console.log(`${BOLD}1️⃣  ThemeBackground component-ներ:${RESET}`);
const tsxFiles = walk(ROOT, [".tsx", ".ts"]);
const themeFiles = tsxFiles.filter((f) => f.includes("ThemeBackground"));

if (themeFiles.length === 0) {
  console.log(`${RED}❌ Ոչ մի ThemeBackground չի գտնվել!${RESET}`);
} else {
  themeFiles.forEach((f) => {
    const rel = path.relative(ROOT, f);
    console.log(`   ${CYAN}📄 ${rel}${RESET}`);
  });

  if (themeFiles.length > 1) {
    console.log(
      `${YELLOW}   ⚠️  Կա ${themeFiles.length} ThemeBackground! Միայն մեկը կարող է լինել!${RESET}`
    );
  }
}
console.log("");

// ─────────────────────────────────────────────
// 2. SCAN ThemeBackground.tsx for bugs
// ─────────────────────────────────────────────

console.log(`${BOLD}2️⃣  ThemeBackground.tsx — կասկածելի տողեր:${RESET}`);
const mainFile = themeFiles[0];

if (!mainFile) {
  console.log(`${RED}❌ ThemeBackground չկա${RESET}`);
} else {
  const content = readFile(mainFile);
  const rel = path.relative(ROOT, mainFile);

  // Check for darkImage/lightImage props
  const overrides = findMatches(content, [/darkImage/, /lightImage/]);
  if (overrides.length > 0) {
    console.log(`${RED}   ❌ Գտնվեցին darkImage/lightImage:${RESET}`);
    overrides.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));
  } else {
    console.log(`${GREEN}   ✅ Չկան darkImage/lightImage${RESET}`);
  }

  // Check for currentImage logic
  const currentImg = findMatches(content, [/currentImage/]);
  console.log(`   ${CYAN}📌 currentImage տողեր:${RESET}`);
  currentImg.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));

  // Check for backdrop-filter
  const backdrop = findMatches(content, [/backdropFilter/, /WebkitBackdropFilter/]);
  if (backdrop.length > 0) {
    console.log(`${YELLOW}   ⚠️  backdrop-filter (կարող է freeze անել):${RESET}`);
    backdrop.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));
  }

  // Check for z-index layers
  const zLayers = findMatches(content, [/-z-10/, /-z-20/, /zIndex/]);
  console.log(`   ${CYAN}📌 z-index layers (${zLayers.length}):${RESET}`);
  zLayers.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));

  // Check for background-image
  const bgImg = findMatches(content, [/backgroundImage/]);
  console.log(`   ${CYAN}📌 backgroundImage (${bgImg.length}):${RESET}`);
  bgImg.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));

  // Check for <img src=
  const imgEl = findMatches(content, [/<img/]);
  console.log(`   ${CYAN}📌 <img> elements (${imgEl.length}):${RESET}`);
  imgEl.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));
}
console.log("");

// ─────────────────────────────────────────────
// 3. SCAN layout.tsx
// ─────────────────────────────────────────────

console.log(`${BOLD}3️⃣  layout.tsx — ThemeBackground-ի օգտագործում:${RESET}`);
const layoutFile = path.join(ROOT, "src/app/layout.tsx");

if (!fs.existsSync(layoutFile)) {
  console.log(`${RED}❌ layout.tsx չկա${RESET}`);
} else {
  const content = readFile(layoutFile);

  const usage = findMatches(content, [/<ThemeBackground/]);
  if (usage.length > 0) {
    console.log(`${GREEN}   ✅ ThemeBackground օգտագործվում է${RESET}`);
    usage.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));

    // Show block
    const lines = content.split("\n");
    const startLine = usage[0].line - 1;
    console.log(`   ${CYAN}📌 Block (15 lines from <ThemeBackground>):${RESET}`);
    for (let i = startLine; i < Math.min(startLine + 15, lines.length); i++) {
      console.log(`      ${i + 1}: ${lines[i]}`);
    }
  } else {
    console.log(`${RED}   ❌ ThemeBackground չի օգտագործվում!${RESET}`);
  }

  // Check for darkImage/lightImage in layout
  const layoutOverrides = findMatches(content, [/darkImage/, /lightImage/]);
  if (layoutOverrides.length > 0) {
    console.log(`${RED}   ❌ layout.tsx-ում կա darkImage/lightImage:${RESET}`);
    layoutOverrides.forEach((m) => console.log(`      Line ${m.line}: ${m.text}`));
  } else {
    console.log(`${GREEN}   ✅ layout.tsx-ը մաքուր է${RESET}`);
  }
}
console.log("");

// ─────────────────────────────────────────────
// 4. SCAN globals.css for background overrides
// ─────────────────────────────────────────────

console.log(`${BOLD}4️⃣  globals.css — background override-ներ:${RESET}`);
const cssFiles = walk(ROOT, [".css"]);
const globalCss = cssFiles.find((f) => f.includes("globals.css"));

if (!globalCss) {
  console.log(`${YELLOW}   ⚠️  globals.css չի գտնվել${RESET}`);
} else {
  const content = readFile(globalCss);
  const overrides = findMatches(content, [
    /body\s*\{/,
    /html\s*\{/,
    /background(-image|-color)?\s*:/,
  ]);

  if (overrides.length > 0) {
    console.log(`${CYAN}   📌 Գտնված background կանոններ (${overrides.length}):${RESET}`);
    overrides.slice(0, 20).forEach((m) => {
      console.log(`      Line ${m.line}: ${m.text}`);
    });
  } else {
    console.log(`${GREEN}   ✅ Background override չկա${RESET}`);
  }
}
console.log("");

// ─────────────────────────────────────────────
// 5. CHECK localStorage-ում պահված ID
// ─────────────────────────────────────────────

console.log(`${BOLD}5️⃣  Preset-ների ցանկը (կոդից):${RESET}`);
if (mainFile) {
  const content = readFile(mainFile);
  const ids = [...content.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  console.log(`   📊 ${ids.length} preset: ${ids.join(", ")}`);
}
console.log("");

// ─────────────────────────────────────────────
// 6. CHECK for OTHER components with -z-10
// ─────────────────────────────────────────────

console.log(`${BOLD}6️⃣  Այլ component-ներ, որ ունեն fixed + z-10:${RESET}`);
const allFiles = walk(path.join(ROOT, "src"), [".tsx"]);
let suspicious = [];

for (const f of allFiles) {
  if (f.includes("ThemeBackground")) continue;
  const content = readFile(f);
  const hasFixed = /fixed\s+inset-0/.test(content);
  const hasNegZ = /-z-[12]0/.test(content) || /-z-\[-\d+\]/.test(content);
  if (hasFixed && hasNegZ) {
    const rel = path.relative(ROOT, f);
    suspicious.push(rel);
  }
}

if (suspicious.length === 0) {
  console.log(`${GREEN}   ✅ Ոչ մի այլ component չի կոնֿլիկտի${RESET}`);
} else {
  console.log(`${YELLOW}   ⚠️  Կասկածելի ֆայլեր:${RESET}`);
  suspicious.forEach((f) => console.log(`      ${RED}${f}${RESET}`));
}
console.log("");

// ─────────────────────────────────────────────
// 7. CHECK for duplicate backgrounds in public/
// ─────────────────────────────────────────────

console.log(`${BOLD}7️⃣  Նկարների ստուգում public/images/:${RESET}`);
const imagesDir = path.join(ROOT, "public/images");
if (!fs.existsSync(imagesDir)) {
  console.log(`${RED}   ❌ public/images/ չկա${RESET}`);
} else {
  const images = fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  console.log(`   📊 ${images.length} նկար`);

  // Check which are referenced in code
  if (mainFile) {
    const content = readFile(mainFile);
    const referenced = [...content.matchAll(/["']\/images\/([^"']+)["']/g)].map(
      (m) => m[1]
    );
    console.log(`   📊 ${referenced.length} նկար հիշատակված կոդում`);

    const missing = referenced.filter((r) => !images.includes(r));
    if (missing.length > 0) {
      console.log(`${RED}   ❌ Կոդում հիշատակված, բայց գոյություն չունեցող:${RESET}`);
      missing.forEach((m) => console.log(`      ${m}`));
    } else {
      console.log(`${GREEN}   ✅ Բոլոր նկարները գոյություն ունեն${RESET}`);
    }
  }
}
console.log("");

// ─────────────────────────────────────────────
// 8. CHECK for hydration errors
// ─────────────────────────────────────────────

console.log(`${BOLD}8️⃣  Hydration-ի համար կասկածելի patterns:${RESET}`);
if (mainFile) {
  const content = readFile(mainFile);

  const issues = [];

  // localStorage in render (outside useEffect)
  if (/localStorage\.getItem/.test(content)) {
    // Find context
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("localStorage")) {
        // Check if within useEffect
        let inEffect = false;
        for (let j = i; j >= Math.max(0, i - 20); j--) {
          if (lines[j].includes("useEffect")) {
            inEffect = true;
            break;
          }
          if (lines[j].includes("return (") || lines[j].includes("const ")) {
            break;
          }
        }
        if (!inEffect) {
          issues.push(`Line ${i + 1}: ${line.trim()} (outside useEffect?)`);
        }
      }
    });
  }

  if (issues.length > 0) {
    console.log(`${YELLOW}   ⚠️  Հնարավոր issues:${RESET}`);
    issues.forEach((i) => console.log(`      ${i}`));
  } else {
    console.log(`${GREEN}   ✅ Չկան ակնհայտ hydration issues${RESET}`);
  }
}
console.log("");

// ─────────────────────────────────────────────
// 9. Check for Service Worker
// ─────────────────────────────────────────────

console.log(`${BOLD}9️⃣  Service Worker version:${RESET}`);
const swFile = path.join(ROOT, "public/sw.js");
if (fs.existsSync(swFile)) {
  const sw = readFile(swFile);
  const ver = sw.match(/SW_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (ver) {
    console.log(`   📌 SW_VERSION: ${ver[1]}`);
  }
  const isNetworkFirstStatic = /handleStaticRequest[\s\S]{0,500}NETWORK FIRST/i.test(sw);
  if (isNetworkFirstStatic) {
    console.log(`${GREEN}   ✅ Static handler = network-first${RESET}`);
  } else {
    console.log(`${RED}   ❌ Static handler = cache-first (BUG!)${RESET}`);
  }
} else {
  console.log(`${YELLOW}   ⚠️  sw.js չկա${RESET}`);
}
console.log("");

// ─────────────────────────────────────────────
// 10. FINAL SUMMARY
// ─────────────────────────────────────────────

console.log("═══════════════════════════════════════════════");
console.log(`${BOLD}📊 ԱՄՓՈՓՈՒՄ${RESET}`);
console.log("═══════════════════════════════════════════════");
console.log("");
console.log("Ուղարկիր այս output-ը ուղղակի պատճենելով։");
console.log("Կասեմ ճշգրիտ պատճառը և fix-ը։ 🎯");
console.log("");