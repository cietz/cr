# 🚂 Deploy no Railway - Guia Completo

## 🎯 Por que Railway é Melhor para Este Projeto

✅ **IP mais estável** - Perfeito para API do Clash Royale  
✅ **Deploy automático** via GitHub  
✅ **$5 grátis/mês** - Suficiente para começar  
✅ **Logs profissionais** - Debug facilitado  
✅ **Escalável** - Cresce com seu projeto

---

## 📋 Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta no [Railway](https://railway.app)
- [ ] Projeto no Git (ou use o comando abaixo)
- [ ] Credencial da Utmify (opcional, para tracking)
- [ ] Token da API Clash Royale (opcional, para dados reais)

---

## 🚀 Método 1: Deploy via GitHub (Recomendado)

### Passo 1: Preparar Repositório Git

Se ainda não tem Git configurado:

```powershell
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Clash Royale Store com UTMify"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/seu-usuario/clashroyale-store.git
git branch -M main
git push -u origin main
```

### Passo 2: Conectar Railway ao GitHub

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Login with GitHub"**
3. Autorize o Railway a acessar seus repositórios

### Passo 3: Criar Novo Projeto

1. Dashboard → **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha **"clashroyale-store"** (ou nome do seu repo)
4. Railway detecta automaticamente: Node.js ✅

### Passo 4: Configurar Variáveis de Ambiente

No dashboard do projeto:

1. Clique na aba **"Variables"**
2. Adicione as seguintes variáveis:

```bash
# Obrigatórias
NODE_ENV=production
PORT=3000

# UTMify (opcional, mas recomendado)
UTMIFY_API_TOKEN=sua_credencial_da_utmify

# Clash Royale API (se for usar dados reais)
CR_API_TOKEN=seu_token_clash_royale
```

### Passo 5: Deploy Automático

O Railway fará deploy automaticamente! 🎉

- **Build**: `npm install`
- **Start**: `npm start`
- **Tempo**: ~30-60 segundos

### Passo 6: Obter URL e IP

Após o deploy:

1. Clique no serviço deployado
2. Vá em **"Settings"** → **"Networking"**
3. Clique em **"Generate Domain"**
4. Sua URL será: `https://clashroyale-store-production.up.railway.app`
5. Anote o IP em **"Public Networking"**

---

## 🔧 Método 2: Deploy via CLI do Railway

### Passo 1: Instalar Railway CLI

```powershell
# Via npm
npm install -g @railway/cli

# Verificar instalação
railway --version
```

### Passo 2: Fazer Login

```powershell
railway login
```

Isso abrirá o navegador para autenticação.

### Passo 3: Inicializar Projeto

```powershell
# Na pasta do projeto
railway init

# Selecione: Create new project
# Nome: clashroyale-store
```

### Passo 4: Adicionar Variáveis

```powershell
railway variables set UTMIFY_API_TOKEN=sua_credencial
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

### Passo 5: Deploy

```powershell
railway up
```

Pronto! Deploy feito via CLI.

---

## 🎯 Configuração para API do Clash Royale

### Opção 1: IP Padrão (Gratuito)

O Railway fornece um IP relativamente estável:

1. **Obter o IP do seu serviço:**

   ```powershell
   # No dashboard Railway
   Settings → Networking → Public Networking
   ```

2. **Registrar no Clash Royale:**
   - Acesse: [developer.clashroyale.com](https://developer.clashroyale.com)
   - My Account → API Keys
   - Add IP: `[IP do Railway]`

⚠️ **Limitação**: IP pode mudar em updates/manutenção (raro)

### Opção 2: IP Dedicado ($5/mês)

Para IP 100% fixo:

1. No dashboard: **Settings → Networking**
2. Clique em **"Add IPv4 Address"**
3. Custo: **$5/mês adicional**
4. IP nunca muda ✅

**Registro na API:**

```
Clash Royale Dev Portal
└─ Add IP: [Seu IP Dedicado]
   └─ Funciona para sempre!
```

---

## 📁 Arquivos de Configuração Railway

### 1. railway.json (Opcional)

Crie este arquivo na raiz para configurações avançadas:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. nixpacks.toml (Otimização)

Para builds mais rápidos:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["echo 'Build concluído'"]

[start]
cmd = "npm start"
```

### 3. .railwayignore

Arquivos a ignorar no deploy:

```
node_modules
*.log
.git
.env.local
test-*.js
*.md
!README.md
```

---

## 🌐 Domínio Customizado

### Adicionar Domínio Próprio

1. **No Railway:**

   - Settings → Networking → Custom Domain
   - Adicione: `loja.seusite.com`

2. **No seu provedor de DNS:**

   ```
   Tipo: CNAME
   Nome: loja
   Valor: clashroyale-store-production.up.railway.app
   ```

3. **SSL automático** - Railway configura HTTPS automaticamente ✅

---

## 📊 Monitoramento e Logs

### Ver Logs em Tempo Real

```powershell
# Via CLI
railway logs

# Ou no dashboard
Dashboard → Deployments → View Logs
```

### Métricas Disponíveis

O Railway mostra:

- 📈 CPU Usage
- 💾 Memory Usage
- 🌐 Network I/O
- ⏱️ Response Time
- 🔄 Request Count

---

## 🔄 Deploy Automático

Após configuração inicial, **cada push no GitHub** faz deploy automaticamente:

```powershell
# Fazer alterações
git add .
git commit -m "Atualização do checkout"
git push

# Railway detecta e faz deploy automático! 🚀
```

---

## 💡 Dicas e Otimizações

### 1. Healthcheck Endpoint

Adicione no seu `server.js`:

```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

Railway usa isso para monitorar seu app.

### 2. Graceful Shutdown

```javascript
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido, desligando gracefully...");
  server.close(() => {
    console.log("Servidor fechado");
    process.exit(0);
  });
});
```

### 3. Variáveis de Ambiente

Sempre use variáveis para dados sensíveis:

```javascript
const UTMIFY_TOKEN = process.env.UTMIFY_API_TOKEN;
const CR_TOKEN = process.env.CR_API_TOKEN;
```

### 4. Caching

Adicione cache para reduzir custos:

```javascript
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 min
```

---

## 🗄️ Adicionar Banco de Dados (Opcional)

### PostgreSQL

1. **No Railway:**

   - New → Database → PostgreSQL
   - Railway provisiona automaticamente

2. **Conectar no código:**
   ```javascript
   const { Pool } = require("pg");
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
   });
   ```

### Redis (Cache)

1. **No Railway:**

   - New → Database → Redis

2. **Usar no código:**
   ```javascript
   const redis = require("redis");
   const client = redis.createClient({
     url: process.env.REDIS_URL,
   });
   ```

---

## 💰 Otimizar Custos

### Créditos Gratuitos ($5/mês)

O plano Hobby inclui **$5 em créditos mensais**:

```
Uso estimado deste projeto:
├─ Servidor Node.js: ~$3/mês
├─ Banco de dados (opcional): ~$2/mês
└─ Total: ~$5/mês → GRÁTIS com créditos!
```

### Dicas para Reduzir Custos

1. **Sleep Mode**: Ative para projetos de baixo tráfego
2. **Cache**: Reduza chamadas à API
3. **Otimize imagens**: Use CDN
4. **Monitore uso**: Dashboard → Usage

---

## 🐛 Troubleshooting

### Build Falha

**Erro: "Cannot find module"**

```powershell
# Solução: Verificar package.json
# Certifique-se que todas as dependências estão listadas
```

### App Crashando

**Erro: "Application error"**

```powershell
# Ver logs
railway logs

# Verificar variáveis de ambiente
railway variables
```

### IP Bloqueado pela API CR

**Erro: 403 Forbidden**

```
1. Obtenha IP atual: railway run env | grep PUBLIC_IPV4
2. Registre no developer.clashroyale.com
3. Aguarde 5-10 minutos
```

### Port Binding Error

```javascript
// Use a porta fornecida pelo Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

---

## 📈 Escalar o Projeto

### Horizontal Scaling

```powershell
# Railway escala automaticamente
# Configure em: Settings → Resources
```

### Regiões

Railway tem servidores em:

- 🇺🇸 US West
- 🇺🇸 US East
- 🇪🇺 Europe
- 🇦🇺 Asia Pacific

---

## ✅ Checklist de Deploy

- [ ] Repositório Git criado e pushed
- [ ] Conta Railway criada
- [ ] Projeto conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy feito com sucesso
- [ ] URL gerada e testada
- [ ] IP registrado na API CR (se aplicável)
- [ ] Domínio customizado configurado (opcional)
- [ ] Logs verificados
- [ ] Healthcheck funcionando

---

## 🎯 Próximos Passos

1. **Testar o deploy:**

   ```
   https://seu-app.up.railway.app
   https://seu-app.up.railway.app/health
   https://seu-app.up.railway.app/?utm_source=railway&utm_campaign=deploy
   ```

2. **Configurar CI/CD:**

   - Já configurado automaticamente via GitHub! ✅

3. **Monitorar:**

   - Dashboard Railway mostra tudo em tempo real

4. **Escalar:**
   - Railway escala automaticamente conforme necessário

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Status Page](https://status.railway.app)
- [Pricing](https://railway.app/pricing)

---

## 🎉 Conclusão

Railway é a escolha **perfeita** para este projeto porque:

✅ Deploy automático via Git  
✅ IP estável para API do Clash Royale  
✅ $5 grátis/mês (suficiente para começar)  
✅ Logs e monitoramento profissionais  
✅ Escalável conforme crescimento

**Pronto para começar?** 🚀

Acesse [railway.app](https://railway.app) e faça seu primeiro deploy em 5 minutos!

---

**Precisa de ajuda?**

- Ver comparação: [RAILWAY-VS-SQUARECLOUD.md](RAILWAY-VS-SQUARECLOUD.md)
- Documentação UTMify: [UTMIFY-README.md](UTMIFY-README.md)
