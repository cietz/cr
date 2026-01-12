# Script de Preparação para Deploy no Railway
# Execute este script antes de fazer push para o GitHub

Write-Host "🚂 Preparando projeto para deploy no Railway..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Git
Write-Host "📋 Verificando Git..." -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    Write-Host "  ⚠️  Repositório Git não inicializado" -ForegroundColor Yellow
    $initGit = Read-Host "Deseja inicializar Git agora? (s/n)"
    
    if ($initGit -eq "s" -or $initGit -eq "S") {
        git init
        Write-Host "  ✓ Git inicializado" -ForegroundColor Green
        
        # Criar .gitignore se não existir
        if (-not (Test-Path ".gitignore")) {
            @"
node_modules/
.env
.env.local
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
            Write-Host "  ✓ .gitignore criado" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  Git é necessário para deploy no Railway" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ Git já inicializado" -ForegroundColor Green
}

# 2. Verificar arquivos essenciais
Write-Host ""
Write-Host "📦 Verificando arquivos essenciais..." -ForegroundColor Cyan

$essentialFiles = @(
    "package.json",
    "server.js",
    "index.html",
    "checkout.html",
    "utmify-integration.js",
    "utm-capture.js",
    "utmify-proxy-server.js",
    "railway.json",
    "nixpacks.toml"
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
    Write-Host "Corrija antes de fazer deploy!" -ForegroundColor Red
    exit 1
}

# 3. Verificar package.json
Write-Host ""
Write-Host "📝 Verificando package.json..." -ForegroundColor Cyan

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if ($packageJson.main -ne "server.js") {
    Write-Host "  ⚠️  'main' deveria ser 'server.js'" -ForegroundColor Yellow
}

if (-not $packageJson.scripts.start) {
    Write-Host "  ⚠️  Script 'start' não encontrado" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Script 'start' configurado" -ForegroundColor Green
}

if (-not $packageJson.engines) {
    Write-Host "  ⚠️  'engines' não especificado (recomendado)" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ 'engines' especificado" -ForegroundColor Green
}

# 4. Criar .env.example para Railway
Write-Host ""
Write-Host "🔑 Criando .env.example..." -ForegroundColor Cyan

$envExample = @"
# Configurações para Railway
# Copie este arquivo para .env e preencha com seus valores

# Porta (Railway define automaticamente, não mude)
PORT=3000

# Ambiente
NODE_ENV=production

# UTMify - Obrigatório para tracking de vendas
UTMIFY_API_TOKEN=sua_credencial_da_utmify_aqui

# (Opcional) Clash Royale API - Para dados reais
CR_API_TOKEN=seu_token_clash_royale_aqui

# (Opcional) URL do proxy com IP fixo
CR_PROXY_URL=https://seu-proxy-railway.up.railway.app
"@

$envExample | Out-File -FilePath ".env.example" -Encoding UTF8
Write-Host "  ✓ .env.example criado" -ForegroundColor Green

# 5. Verificar se há mudanças não commitadas
Write-Host ""
Write-Host "📊 Verificando status do Git..." -ForegroundColor Cyan

if (Test-Path ".git") {
    $status = git status --porcelain
    if ($status) {
        Write-Host "  ⚠️  Há arquivos não commitados" -ForegroundColor Yellow
        Write-Host ""
        git status --short
        Write-Host ""
        
        $commit = Read-Host "Deseja adicionar e commitar agora? (s/n)"
        if ($commit -eq "s" -or $commit -eq "S") {
            git add .
            $commitMsg = Read-Host "Mensagem do commit (Enter para mensagem padrão)"
            if (-not $commitMsg) {
                $commitMsg = "Preparação para deploy no Railway"
            }
            git commit -m $commitMsg
            Write-Host "  ✓ Commit realizado" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✓ Tudo commitado" -ForegroundColor Green
    }
}

# 6. Verificar remote
Write-Host ""
Write-Host "🌐 Verificando remote do GitHub..." -ForegroundColor Cyan

if (Test-Path ".git") {
    $remote = git remote -v
    if (-not $remote) {
        Write-Host "  ⚠️  Nenhum remote configurado" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Configure o remote do GitHub:" -ForegroundColor Cyan
        Write-Host "  git remote add origin https://github.com/seu-usuario/clashroyale-store.git" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "  ✓ Remote configurado" -ForegroundColor Green
        Write-Host $remote -ForegroundColor Gray
    }
}

# 7. Teste local
Write-Host ""
$testLocal = Read-Host "Deseja testar localmente antes de fazer deploy? (s/n)"

if ($testLocal -eq "s" -or $testLocal -eq "S") {
    Write-Host ""
    Write-Host "🧪 Iniciando teste local..." -ForegroundColor Cyan
    Write-Host "  Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    
    npm start
}

# 8. Resumo final
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PREPARAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS PARA RAILWAY:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Push para GitHub" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Criar conta no Railway" -ForegroundColor White
Write-Host "   https://railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Conectar com GitHub" -ForegroundColor White
Write-Host "   Login with GitHub → Autorizar" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Deploy" -ForegroundColor White
Write-Host "   New Project → Deploy from GitHub → Selecionar repo" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  Configurar variáveis" -ForegroundColor White
Write-Host "   Variables → Add:" -ForegroundColor Gray
Write-Host "   - UTMIFY_API_TOKEN=sua_credencial" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "6️⃣  Obter URL e IP" -ForegroundColor White
Write-Host "   Settings → Networking → Generate Domain" -ForegroundColor Gray
Write-Host ""
Write-Host "7️⃣  Registrar IP na API do Clash Royale" -ForegroundColor White
Write-Host "   developer.clashroyale.com → Add IP" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentação completa: DEPLOY-RAILWAY.md" -ForegroundColor Cyan
Write-Host "🆚 Comparar com SquareCloud: RAILWAY-VS-SQUARECLOUD.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Railway é MELHOR para API do Clash Royale!" -ForegroundColor Green
Write-Host "   ✅ IP mais estável" -ForegroundColor Green
Write-Host "   ✅ Deploy automático via Git" -ForegroundColor Green
Write-Host "   ✅ $5 grátis/mês" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Boa sorte com o deploy!" -ForegroundColor Cyan
Write-Host ""
