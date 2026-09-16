# fix-translations.ps1
# Սկրիպտը ուղղում է translations.json-ի կրկնվող key-երի խնդիրը

param(
    [string]$FilePath = "src\lib\i18n\translations.json"
)

Write-Host "🔧 Ֆիքսում ենք translations.json ֆայլը..." -ForegroundColor Cyan

# Ստուգել ֆայլի գոյությունը
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ Ֆայլը չի գտնվել: $FilePath" -ForegroundColor Red
    exit 1
}

# Կարդալ ֆայլը
$content = Get-Content $FilePath -Raw -Encoding UTF8

# Պահպանել բնօրինակը
$backupPath = $FilePath + ".backup"
Copy-Item $FilePath $backupPath
Write-Host "✅ Բնօրինակը պահպանվել է: $backupPath" -ForegroundColor Green

# Վերականգնել JSON-ը
try {
    $json = $content | ConvertFrom-Json
} catch {
    Write-Host "❌ JSON-ը վավեր չէ, փորձում ենք ուղղել..." -ForegroundColor Yellow
    
    # Եթե JSON-ը վավեր չէ, փորձում ենք մաքրել
    $cleaned = $content -replace ',\s*\}', '}' -replace ',\s*\]', ']'
    $cleaned = $cleaned -replace '(?m)^\s*//.*$', '' -replace '(?m)^\s*/\*.*?\*/', ''
    
    try {
        $json = $cleaned | ConvertFrom-Json
    } catch {
        Write-Host "❌ Չհաջողվեց վերականգնել JSON-ը:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

# Հավաքել բոլոր key-երը
$allKeys = @{}
$duplicates = @{}

# Ստուգել յուրաքանչյուր լեզվի բաժին
foreach ($lang in @("hy", "en", "ru")) {
    if ($json.PSObject.Properties.Name -contains $lang) {
        $langObj = $json.$lang
        $keys = @()
        
        $langObj.PSObject.Properties | ForEach-Object {
            $key = $_.Name
            if ($keys -contains $key) {
                if (-not $duplicates.ContainsKey($lang)) {
                    $duplicates[$lang] = @()
                }
                $duplicates[$lang] += $key
                Write-Host "⚠️ Կրկնվող key '$key' $lang-ում" -ForegroundColor Yellow
            } else {
                $keys += $key
            }
        }
        
        $allKeys[$lang] = $keys
    }
}

if ($duplicates.Count -eq 0) {
    Write-Host "✅ Կրկնվող key-եր չեն գտնվել!" -ForegroundColor Green
    exit 0
}

# Վերակառուցել JSON-ը առանց կրկնությունների
$newJson = @{}

foreach ($lang in @("hy", "en", "ru")) {
    if ($json.PSObject.Properties.Name -contains $lang) {
        $langObj = $json.$lang
        $newLangObj = @{}
        
        # Վերցնել միայն եզակի key-երը
        $uniqueKeys = $allKeys[$lang] | Sort-Object -Unique
        
        foreach ($key in $uniqueKeys) {
            $newLangObj[$key] = $langObj.$key
        }
        
        $newJson[$lang] = $newLangObj
    }
}

# Արտահանել նոր JSON-ը
$newJsonString = $newJson | ConvertTo-Json -Depth 10
$newJsonString = $newJsonString -replace '    ', '  '

# Գրել ֆայլ
Set-Content -Path $FilePath -Value $newJsonString -Encoding UTF8 -NoNewline

Write-Host "`n✅ translations.json-ը հաջողությամբ ուղղվեց!" -ForegroundColor Green
Write-Host "📊 Վիճակագրություն:" -ForegroundColor Cyan
foreach ($lang in @("hy", "en", "ru")) {
    if ($newJson.ContainsKey($lang)) {
        $count = $newJson[$lang].PSObject.Properties.Count
        Write-Host "  $lang : $count key" -ForegroundColor White
    }
}

if ($duplicates.Count -gt 0) {
    Write-Host "`n🗑️ Հեռացված կրկնվող key-եր:" -ForegroundColor Yellow
    foreach ($lang in $duplicates.Keys) {
        Write-Host "  $lang :" -ForegroundColor Yellow
        foreach ($key in $duplicates[$lang]) {
            Write-Host "    - $key" -ForegroundColor Gray
        }
    }
}

Write-Host "`n💡 Հաջորդ քայլերը:" -ForegroundColor Cyan
Write-Host "  1. Մաքրեք քեշը: Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host "  2. Վերագործարկեք: npm run dev" -ForegroundColor White

# Առաջարկել backup-ի ջնջում
$deleteBackup = Read-Host "`nՋնջե՞լ backup ֆայլը ($backupPath)? (y/N)"
if ($deleteBackup -eq 'y' -or $deleteBackup -eq 'Y') {
    Remove-Item $backupPath -Force
    Write-Host "✅ Backup-ը ջնջվեց" -ForegroundColor Green
}