#!/bin/bash
# diagnose.sh — NUR Lingo theme debug

echo ""
echo "═══════════════════════════════════════════════"
echo "🔍  NUR LINGO THEME DIAGNOSTIC"
echo "═══════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────
# 1. ԸՆԹԱՑԻԿ ՊԱՆԱԿ
# ─────────────────────────────────────────────
echo "1️⃣  Ընթացիկ պանակ."
pwd
echo ""

# ─────────────────────────────────────────────
# 2. GIT STATUS
# ─────────────────────────────────────────────
echo "2️⃣  Git status (փոփոխություններ կան՞):"
echo "───────────────────────────────────────────"
git status --short
echo ""

# ─────────────────────────────────────────────
# 3. ՎԵՐՋԻՆ COMMITS
# ─────────────────────────────────────────────
echo "3️⃣  Վերջին 5 commit-ները."
echo "───────────────────────────────────────────"
git log --oneline -5
echo ""

# ─────────────────────────────────────────────
# 4. UNPUSHED COMMITS
# ─────────────────────────────────────────────
echo "4️⃣  Unpushed commits (commit-ված, բայց չpush-ված):"
echo "───────────────────────────────────────────"
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null)
if [ -z "$UNPUSHED" ]; then
  echo "✅ Բոլորը push-ված են"
else
  echo "❌ Կան չpush-ված commit-ներ:"
  echo "$UNPUSHED"
fi
echo ""

# ─────────────────────────────────────────────
# 5. layout.tsx — darkImage / lightImage
# ─────────────────────────────────────────────
echo "5️⃣  layout.tsx — darkImage/lightImage props:"
echo "───────────────────────────────────────────"
if [ -f "src/app/layout.tsx" ]; then
  MATCHES=$(grep -n "darkImage\|lightImage" src/app/layout.tsx)
  if [ -z "$MATCHES" ]; then
    echo "✅ ՉԿԱՆ (լավ է)"
  else
    echo "❌ ԿԱՆ (սա է խնդիրը):"
    echo "$MATCHES"
  fi
else
  echo "❌ src/app/layout.tsx չի գտնվել"
fi
echo ""

# ─────────────────────────────────────────────
# 6. layout.tsx — ThemeBackground block
# ─────────────────────────────────────────────
echo "6️⃣  layout.tsx — ThemeBackground block:"
echo "───────────────────────────────────────────"
if [ -f "src/app/layout.tsx" ]; then
  grep -A 10 "<ThemeBackground" src/app/layout.tsx | head -15
else
  echo "❌ layout.tsx չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 7. ThemeBackground.tsx — props
# ─────────────────────────────────────────────
echo "7️⃣  ThemeBackground.tsx — interface props:"
echo "───────────────────────────────────────────"
if [ -f "src/components/ThemeBackground.tsx" ]; then
  grep -A 15 "interface ThemeBackgroundProps" src/components/ThemeBackground.tsx | head -16
else
  echo "❌ ThemeBackground.tsx չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 8. ThemeBackground.tsx — currentImage logic
# ─────────────────────────────────────────────
echo "8️⃣  ThemeBackground.tsx — currentImage logic:"
echo "───────────────────────────────────────────"
if [ -f "src/components/ThemeBackground.tsx" ]; then
  grep -n "currentImage\|currentDarkImage\|currentLightImage\|selected.dark\|selected.light" src/components/ThemeBackground.tsx
else
  echo "❌ ThemeBackground.tsx չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 9. THEME_BACKGROUNDS count
# ─────────────────────────────────────────────
echo "9️⃣  ThemeBackground.tsx — preset count:"
echo "───────────────────────────────────────────"
if [ -f "src/components/ThemeBackground.tsx" ]; then
  COUNT=$(grep -c 'id: "' src/components/ThemeBackground.tsx)
  echo "📊 Preset-ների քանակը. $COUNT"
else
  echo "❌ ThemeBackground.tsx չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 10. Images in public/images/
# ─────────────────────────────────────────────
echo "🔟  public/images/ — ֆայլերի քանակ:"
echo "───────────────────────────────────────────"
if [ -d "public/images" ]; then
  IMG_COUNT=$(ls -1 public/images/*.{jpg,jpeg,png} 2>/dev/null | wc -l)
  echo "📊 Նկարների քանակը. $IMG_COUNT"
  echo ""
  echo "📋 Առաջին 10-ը."
  ls -1 public/images/*.{jpg,jpeg,png} 2>/dev/null | head -10 | sed 's|public/images/||'
else
  echo "❌ public/images/ չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 11. Missing files check
# ─────────────────────────────────────────────
echo "1️⃣1️⃣  Բացակայող նկարներ (կոդում կա, ֆայլ չկա):"
echo "───────────────────────────────────────────"
if [ -f "src/components/ThemeBackground.tsx" ] && [ -d "public/images" ]; then
  # Extract image paths from code
  grep -oE '"/images/[^"]+"' src/components/ThemeBackground.tsx | sed 's/"\/images\///;s/"$//' | sort -u | while read -r f; do
    if [ ! -f "public/images/$f" ]; then
      echo "❌ $f"
    fi
  done
  echo "✅ Ստուգումն ավարտված է"
else
  echo "⚠️  Սքիպ"
fi
echo ""

# ─────────────────────────────────────────────
# 12. Git ls-files check
# ─────────────────────────────────────────────
echo "1️⃣2️⃣  Git-ում գրանցված նկարներ:"
echo "───────────────────────────────────────────"
GIT_IMG=$(git ls-files public/images/ | wc -l)
echo "📊 Git-ում. $GIT_IMG նկար"
echo ""

# ─────────────────────────────────────────────
# 13. TypeScript check
# ─────────────────────────────────────────────
echo "1️⃣3️⃣  TypeScript check."
echo "───────────────────────────────────────────"
if command -v npx &> /dev/null; then
  npx tsc --noEmit 2>&1 | head -20
  TSC_EXIT=$?
  if [ $TSC_EXIT -eq 0 ]; then
    echo "✅ TS OK"
  else
    echo "❌ TS error-ներ կան (տես վերևում)"
  fi
else
  echo "⚠️  npx չի գտնվել"
fi
echo ""

# ─────────────────────────────────────────────
# 14. .gitignore — images
# ─────────────────────────────────────────────
echo "1️⃣4️⃣  .gitignore-ը արգելա՞կում է նկարները."
echo "───────────────────────────────────────────"
if [ -f ".gitignore" ]; then
  IGNORED=$(grep -E "\.(jpg|jpeg|png)|images" .gitignore | head -10)
  if [ -z "$IGNORED" ]; then
    echo "✅ ՉԿԱ արգելք"
  else
    echo "⚠️  Հնարավոր արգելքներ:"
    echo "$IGNORED"
  fi
else
  echo "⚠️  .gitignore չկա"
fi
echo ""

# ─────────────────────────────────────────────
# 15. Node modules / Next.js
# ─────────────────────────────────────────────
echo "1️⃣5️⃣  Next.js version."
echo "───────────────────────────────────────────"
if [ -f "package.json" ]; then
  NEXT_VER=$(grep -E '"next"' package.json | head -1)
  echo "📦 $NEXT_VER"
else
  echo "❌ package.json չկա"
fi
echo ""

echo "═══════════════════════════════════════════════"
echo "✅  ԱՎԱՐՏՎԱԾ"
echo "═══════════════════════════════════════════════"
echo ""
echo "📤 Ուղարկիր ամբողջ output-ը"