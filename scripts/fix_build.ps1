# fix_build.ps1
# NUR Lingo Build Error Fixer
# Գործարկել PowerShell-ում

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 NUR Lingo - Build Error Fixer" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ─── 1. ՈՒՂՂԵԼ WAV_VOICES ──────────────────────────────────────────
Write-Host "`n📁 Fixing WAV_VOICES imports..." -ForegroundColor Yellow

$files = @(
    "src/app/dictionary/page.tsx",
    "src/app/user-dictionary/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📄 $file" -ForegroundColor Gray
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Հեռացնել WAV_VOICES-ը import-ից
        $content = $content -replace 'import\s*\{\s*getWavClient,\s*WavClient,\s*WAV_VOICES\s*\}\s*from\s*["'']@/lib/audio/WavClient["''];?', 'import { getWavClient, WavClient } from "@/lib/audio/WavClient";'
        
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "    ✅ Fixed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $file not found" -ForegroundColor Yellow
    }
}

# ─── 2. ՈՒՂՂԵԼ showMessage ──────────────────────────────────────────
Write-Host "`n📁 Fixing showMessage issues..." -ForegroundColor Yellow

$files = @(
    "src/app/dictionary/page.tsx",
    "src/app/curriculum/page.tsx",
    "src/app/dialogues/page.tsx",
    "src/app/garden/page.tsx",
    "src/app/vocab-audio/page.tsx",
    "src/app/world/page.tsx",
    "src/app/learn/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📄 $file" -ForegroundColor Gray
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 1. showMessage-ը հեռացնել useNuri-ից
        $content = $content -replace 'const\s*\{\s*setPage,\s*showMessage\s*\}\s*=\s*useNuri\(\)', 'const { setPage } = useNuri()'
        
        # 2. showMessage?.()-ը դարձնել showMessage()
        $content = $content -replace 'showMessage\?\.\(', 'showMessage('
        
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "    ✅ Fixed showMessage" -ForegroundColor Green
    }
}

# ─── 3. ԱՎԵԼԱՑՆԵԼ WAV_VOICES export ──────────────────────────────
Write-Host "`n📁 Adding WAV_VOICES to WavClient.ts..." -ForegroundColor Yellow

$wavFile = "src/lib/audio/WavClient.ts"
if (Test-Path $wavFile) {
    $content = Get-Content $wavFile -Raw -Encoding UTF8
    
    if ($content -notmatch "WAV_VOICES") {
        $wavVoices = @"

// ─── WAV VOICES ──────────────────────────────────────────────────────

export const WAV_VOICES = ["Avet", "Anahit", "Armen", "Lusine", "Hayk"];
"@
        $content = $content + $wavVoices
        $content | Set-Content $wavFile -Encoding UTF8 -NoNewline
        Write-Host "  ✅ Added WAV_VOICES export" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️ WAV_VOICES already exists" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️ WavClient.ts not found" -ForegroundColor Yellow
}

# ─── 4. ԱՎԵԼԱՑՆԵԼ ԲԱՑԱԿԱՅՈՒՂ IMPORTS ────────────────────────────
Write-Host "`n📁 Adding missing imports..." -ForegroundColor Yellow

$missingImports = @{
    "Star" = @("src/app/curriculum/page.tsx")
    "Heart" = @("src/app/curriculum/page.tsx")
    "Music" = @("src/app/dialogues/page.tsx")
    "Bookmark" = @("src/app/dialogues/page.tsx")
    "BookmarkCheck" = @("src/app/dialogues/page.tsx")
}

foreach ($import in $missingImports.Keys) {
    $files = $missingImports[$import]
    foreach ($file in $files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw -Encoding UTF8
            
            # Ստուգել արդյոք արդեն կա
            if ($content -match "import\s*\{[^}]*$import[^}]*\}") {
                Write-Host "  ⏭️ $import already in $file" -ForegroundColor Gray
                continue
            }
            
            # Ավելացնել import-ին
            $content = $content -replace '(import\s*\{[^}]*)\}', '$1, '$import' }'
            
            $content | Set-Content $file -Encoding UTF8 -NoNewline
            Write-Host "  ✅ Added $import to $file" -ForegroundColor Green
        }
    }
}

# ─── 5. LOCAL SHOW MESSAGE ──────────────────────────────────────────
Write-Host "`n📁 Adding local showMessage..." -ForegroundColor Yellow

$files = @(
    "src/app/dictionary/page.tsx",
    "src/app/curriculum/page.tsx",
    "src/app/dialogues/page.tsx",
    "src/app/garden/page.tsx",
    "src/app/vocab-audio/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Ստուգել արդյոք արդեն կա local showMessage
        if ($content -match "const showMessage = useCallback") {
            Write-Host "  ⏭️ showMessage already in $file" -ForegroundColor Gray
            continue
        }
        
        # Ավելացնել showMessage ֆունկցիան
        $showMsg = @"

  // ─── LOCAL SHOW MESSAGE ─────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
"@
        
        # Ավելացնել useState և useCallback import-ները, եթե չկան
        if ($content -notmatch "useState" -and $content -match "from 'react'") {
            $content = $content -replace "(import\s*\{[^}]*)\}", '$1, useState }'
        }
        if ($content -notmatch "useCallback" -and $content -match "from 'react'") {
            $content = $content -replace "(import\s*\{[^}]*)\}", '$1, useCallback }'
        }
        
        # Ավելացնել showMessage-ը export default function-ից հետո
        $content = $content -replace '(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)', '$1' + $showMsg
        
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        Write-Host "  ✅ Added showMessage to $file" -ForegroundColor Green
    }
}

# ─── 6. ՋՆՋԵԼ .next CACHE ─────────────────────────────────────────
Write-Host "`n📁 Clearing .next cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Cleared .next" -ForegroundColor Green
} else {
    Write-Host "  ⏭️ .next not found" -ForegroundColor Gray
}

# ─── ԱՎԱՐՏ ──────────────────────────────────────────────────────────
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✅ All fixes applied!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`n🚀 Now run: npm run build" -ForegroundColor Yellow
Write-Host "   or: npm run dev" -ForegroundColor Yellow