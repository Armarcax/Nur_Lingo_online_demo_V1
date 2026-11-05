#!/bin/bash

echo "🧹 Մաքրում ենք քեշերը..."

# 1. Next.js cache
rm -rf .next
echo "✅ .next ջնջված"

# 2. Node modules cache
rm -rf node_modules/.cache
echo "✅ node_modules/.cache ջնջված"

# 3. TypeScript cache
rm -f tsconfig.tsbuildinfo
echo "✅ tsconfig.tsbuildinfo ջնջված"

# 4. Turbopack cache (եթե կա)
rm -rf .turbo
echo "✅ .turbo ջնջված"

# 5. Build info
rm -rf .vercel/output
echo "✅ .vercel/output ջնջված"

echo ""
echo "🚀 Այժմ գործարկիր՝ npm run dev"
echo "🌐 Եվ բրաուզերում սեղմիր Ctrl+Shift+R"