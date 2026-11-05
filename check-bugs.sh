#!/bin/bash

echo "🔍 Սկսում ենք բագերի որոնումը..."
echo ""

# 1. TypeScript check
echo "1️⃣  TypeScript ստուգում..."
npx tsc --noEmit 2>&1 | tee /tmp/ts-errors.log
if [ -s /tmp/ts-errors.log ]; then
    echo "❌ TypeScript սխալներ գտնվեցին (տես վերևում)"
else
    echo "✅ TypeScript-ը մաքուր է"
fi
echo ""

# 2. ESLint check (եթե կա)
echo "2️⃣  ESLint ստուգում..."
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then
    npx next lint 2>&1 | tee /tmp/eslint-errors.log
    if grep -q "Error" /tmp/eslint-errors.log; then
        echo "❌ ESLint սխալներ գտնվեցին"
    else
        echo "✅ ESLint-ը մաքուր է"
    fi
else
    echo "⏭️  ESLint config չկա, բաց թողնում ենք"
fi
echo ""

# 3. Build test (ամենակարևորը)
echo "3️⃣  Production build թեստ..."
npm run build 2>&1 | tee /tmp/build-errors.log
if [ $? -eq 0 ]; then
    echo "✅ Build-ը հաջողվեց"
else
    echo "❌ Build-ը ձախողվեց — տես /tmp/build-errors.log"
    echo ""
    echo "🔎 Սխալի համառոտ նկարագրությունը."
    grep -A 5 "Error" /tmp/build-errors.log | head -30
fi
echo ""

# 4. Ստուգում ենք հատուկ ֆայլերը
echo "4️⃣  Ստուգում ենք հիմնական ֆայլերը..."
FILES=(
    "src/app/learn/page.tsx"
    "src/components/InteractiveLesson.tsx"
    "src/components/InteractiveDialogue.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Ստուգում ենք չփակված փակագծերը
        OPEN=$(grep -o '{' "$file" | wc -l)
        CLOSE=$(grep -o '}' "$file" | wc -l)
        if [ "$OPEN" -ne "$CLOSE" ]; then
            echo "⚠️  $file — Չհավասարակշռված փակագծեր: { = $OPEN, } = $CLOSE"
        else
            echo "✅ $file — փակագծերը հավասարակշռված են"
        fi

        # Ստուգում ենք TODO/FIXME
        TODOS=$(grep -c "TODO\|FIXME\|XXX" "$file" 2>/dev/null || echo 0)
        if [ "$TODOS" -gt 0 ]; then
            echo "   ℹ️  $file — $TODOS հատ TODO/FIXME"
        fi
    else
        echo "❌ $file — Ֆայլը չի գտնվել!"
    fi
done

echo ""
echo "🏁 Ստուգումն ավարտված է"