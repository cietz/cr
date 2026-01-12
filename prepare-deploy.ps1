# Script de Preparação para Deploy na SquareCloud
# Execute este script antes de fazer o upload

Write-Host "🚀 Preparando projeto para deploy na SquareCloud..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se node_modules existe
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠ node_modules não encontrado. Executando npm install..." -ForegroundColor Yellow
    npm install
}

# 2. Verificar arquivos essenciais
Write-Host ""
Write-Host "📋 Verificando arquivos essenciais..." -ForegroundColor Cyan

$essentialFiles = @(
    "package.json",
    "server.js",
    "squarecloud.config",
    "index.html",
    "checkout.html",
    "utmify-integration.js",
    "utm-capture.js",
    "utmify-proxy-server.js"
)

$missing = @()
foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (FALTANDO!)" -ForegroundColor Red
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Arquivos faltando: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Corrija antes de fazer o deploy!" -ForegroundColor Red
    exit 1
}

# 3. Verificar credencial Utmify
Write-Host ""
Write-Host "🔑 Verificando configuração..." -ForegroundColor Cyan

$serverContent = Get-Content "utmify-proxy-server.js" -Raw
if ($serverContent -match "SUA_CREDENCIAL_AQUI") {
    Write-Host "  ⚠ ATENÇÃO: Credencial da Utmify não configurada!" -ForegroundColor Yellow
    Write-Host "  Configure em utmify-proxy-server.js ou use variável de ambiente" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Credencial configurada" -ForegroundColor Green
}

# 4. Criar arquivo .env de exemplo
Write-Host ""
Write-Host "📝 Criando .env de exemplo..." -ForegroundColor Cyan

$envExample = @"
# Configurações para SquareCloud
PORT=80
NODE_ENV=production
UTMIFY_API_TOKEN=sua_credencial_da_utmify_aqui
UTMIFY_PORT=3001

# (Opcional) Se usar API real do Clash Royale
CR_API_TOKEN=seu_token_clash_royale
CR_PROXY_URL=https://seu-proxy-com-ip-fixo.railway.app
"@

$envExample | Out-File -FilePath ".env.example" -Encoding UTF8
Write-Host "  ✓ .env.example criado" -ForegroundColor Green

# 5. Limpar node_modules para reduzir tamanho
Write-Host ""
$cleanModules = Read-Host "Deseja remover node_modules antes de compactar? (s/n)"
if ($cleanModules -eq "s" -or $cleanModules -eq "S") {
    Write-Host "  Removendo node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ node_modules removido (será reinstalado pela SquareCloud)" -ForegroundColor Green
}

# 6. Criar arquivo ZIP para upload
Write-Host ""
Write-Host "📦 Criando arquivo ZIP para upload..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "clashroyale-store-$timestamp.zip"

# Remove ZIP anterior se existir
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
}

# Lista de arquivos/pastas a incluir
$include = @(
    "*.js",
    "*.html",
    "*.json",
    "*.config",
    ".env.example",
    "store.supercell.com",
    "external",
    "api-data",
    "cdn.id.supercell.com",
    "cdn.supercell.com",
    "game-assets.store.supercell.com",
    "accounts.supercell.com"
)

# Comprimir (excluindo o que está em .squarecloudignore)
try {
    $files = Get-ChildItem -Path . -Include $include -Recurse | 
             Where-Object { $_.FullName -notmatch "node_modules|\.git|\.md$|test-" }
    
    Compress-Archive -Path $files -DestinationPath $zipName -Force
    
    $size = (Get-Item $zipName).Length / 1MB
    Write-Host "  ✓ ZIP criado: $zipName ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erro ao criar ZIP: $_" -ForegroundColor Red
    exit 1
}

# 7. Resumo final
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PREPARAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Arquivo para upload: $zipName" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Acesse https://squarecloud.app" -ForegroundColor White
Write-Host "2. Faça login" -ForegroundColor White
Write-Host "3. Clique em 'Upload Application'" -ForegroundColor White
Write-Host "4. Selecione o arquivo: $zipName" -ForegroundColor Yellow
Write-Host "5. Configure RAM: 512 MB" -ForegroundColor White
Write-Host "6. Adicione variáveis de ambiente:" -ForegroundColor White
Write-Host "   - UTMIFY_API_TOKEN=sua_credencial" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "7. Inicie a aplicação" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  LEMBRE-SE:" -ForegroundColor Yellow
Write-Host "   - API do Clash Royale requer IP fixo registrado" -ForegroundColor Yellow
Write-Host "   - Considere usar dados mockados ou proxy com IP fixo" -ForegroundColor Yellow
Write-Host "   - Veja DEPLOY-SQUARECLOUD.md para detalhes" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Boa sorte com o deploy! 🚀" -ForegroundColor Green
Write-Host ""
