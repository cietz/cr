# 🚀 Deploy no Railway - Guia Rápido

## GitHub: https://github.com/cietz/cr.git

## 📋 Passo a Passo Completo

### 1️⃣ Configurar Git e Subir para GitHub

```powershell
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar remote do GitHub
git remote add origin https://github.com/cietz/cr.git

# Ou se já existe remote, atualizar:
git remote set-url origin https://github.com/cietz/cr.git

# Verificar remote
git remote -v

# Criar .gitignore (se não existir)
@"
node_modules/
.env
.env.local
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparação para deploy no Railway com integração UTMify"

# Verificar branch
git branch

# Se não estiver em 'main', criar e trocar:
git branch -M main

# Fazer push
git push -u origin main

# Se der erro de autenticação, você precisará configurar suas credenciais do GitHub
```

---

### 2️⃣ Deploy no Railway

#### A) Criar Conta e Conectar GitHub

1. Acesse: **https://railway.app**
2. Clique em **"Login with GitHub"**
3. Autorize o Railway a acessar seus repositórios
4. Confirme a autorização

#### B) Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure e selecione: **"cietz/cr"**
4. Railway detectará automaticamente: **Node.js** ✅

#### C) Aguardar Build Inicial

```
Railway está fazendo:
├─ Detectando linguagem (Node.js) ✓
├─ Instalando dependências (npm install) ✓
├─ Executando build ✓
└─ Iniciando aplicação (npm start) ✓

Tempo estimado: 1-2 minutos
```

---

### 3️⃣ Configurar Variáveis de Ambiente

No dashboard do Railway, vá até seu serviço e:

1. Clique na aba **"Variables"**
2. Adicione as variáveis:

```bash
# Clique em "+ New Variable" para cada uma:

NODE_ENV = production
PORT = 3000
UTMIFY_API_TOKEN = sua_credencial_da_utmify_aqui
```

3. Clique em **"Deploy"** para aplicar as mudanças

---

### 4️⃣ Obter URL do Projeto

1. No dashboard, clique no seu serviço
2. Vá em **"Settings"** → **"Networking"**
3. Clique em **"Generate Domain"**

Sua URL será algo como:

```
https://cr-production-xxxx.up.railway.app
```

Copie essa URL e teste no navegador!

---

### 5️⃣ 🎯 OBTER IP PARA API DO CLASH ROYALE

**IMPORTANTE:** Este é o passo crucial para a API funcionar!

#### Método 1: Via Dashboard do Railway (Mais Fácil)

1. No dashboard do Railway, clique no seu serviço
2. Vá em **"Settings"** → **"Networking"**
3. Role até **"Public Networking"**
4. Você verá algo como:

```
Public IPv4 Address: xxx.xxx.xxx.xxx
```

**COPIE ESTE IP!** Este é o IP que você vai registrar na API do Clash Royale.

#### Método 2: Via Terminal (Alternativo)

Se não aparecer no dashboard, use este comando:

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Linkar ao projeto
railway link

# Ver variáveis de ambiente (incluindo IP)
railway variables

# Ou executar um comando para descobrir o IP
railway run curl ifconfig.me
```

#### Método 3: Via API Request

Adicione este código temporário ao `server.js`:

```javascript
// Adicione esta rota temporária para descobrir o IP
app.get("/get-ip", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({
      ip: data.ip,
      message: "Use este IP na API do Clash Royale",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});
```

Depois acesse: `https://seu-app.up.railway.app/get-ip`

---

### 6️⃣ Registrar IP na API do Clash Royale

Agora que você tem o IP do Railway:

1. **Acesse:** https://developer.clashroyale.com
2. **Login** com sua Supercell ID
3. Vá em **"My Account"** → **"API Keys"**
4. Clique em **"Create New Key"**
5. Preencha:
   ```
   Name: Railway Production
   Description: IP do servidor Railway para produção
   IP Address: [COLE O IP QUE VOCÊ COPIOU]
   ```
6. Clique em **"Create Key"**
7. **COPIE O TOKEN** gerado (você não verá novamente!)

#### Adicionar Token ao Railway

Volte ao Railway e adicione mais uma variável:

```bash
CR_API_TOKEN = seu_token_da_api_clash_royale
```

---

### 7️⃣ Testar Tudo

#### A) Testar a Aplicação

Acesse sua URL do Railway:

```
https://seu-app.up.railway.app
```

#### B) Testar Captura de UTM

```
https://seu-app.up.railway.app/?utm_source=teste&utm_campaign=railway
```

Abra o Console (F12) e verifique se os UTMs foram capturados.

#### C) Testar API do Clash Royale

Se você adicionou o token, teste:

```
https://seu-app.up.railway.app/api/players/%23SEU_TAG_AQUI
```

Substitua `%23SEU_TAG_AQUI` por uma tag real do jogo.

---

### 8️⃣ Monitorar Deploy

No dashboard do Railway:

1. **Logs:** Veja logs em tempo real
2. **Deployments:** Histórico de deploys
3. **Metrics:** CPU, Memória, Rede
4. **Usage:** Consumo de créditos

---

## ⚠️ Problemas Comuns e Soluções

### Problema 1: "IP Address is not authorized"

**Causa:** IP não registrado ou mudou

**Solução:**

```powershell
# 1. Verificar IP atual
railway run curl ifconfig.me

# 2. Atualizar no developer.clashroyale.com
# 3. Aguardar 5-10 minutos para propagar
```

### Problema 2: Build Falha

**Causa:** Dependências faltando

**Solução:**

```powershell
# Verificar package.json local
npm install

# Commitar e fazer push novamente
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Problema 3: App Não Inicia

**Causa:** Porta incorreta

**Solução:** Certifique-se que `server.js` usa:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

### Problema 4: IP Muda Após Restart

**Soluções:**

1. **Grátis:** Aceitar que pode mudar raramente e atualizar quando necessário
2. **Pago ($5/mês):** Adicionar IP dedicado no Railway
   - Settings → Networking → Add IPv4 Address

---

## 🎯 IP Dedicado (Opcional - $5/mês)

Se você quer garantir que o IP **NUNCA** mude:

1. No Railway: **Settings** → **Networking**
2. Clique em **"Add IPv4 Address"**
3. Confirme o custo de **$5/mês**
4. Anote o IP dedicado
5. Registre na API do Clash Royale
6. Nunca mais precisa atualizar! ✅

---

## 📊 Monitoramento de IP

Crie um script para verificar se o IP mudou:

```javascript
// Adicione ao server.js
let lastKnownIP = null;

async function checkIP() {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    if (lastKnownIP && lastKnownIP !== data.ip) {
      console.log("⚠️ IP MUDOU!");
      console.log("IP Antigo:", lastKnownIP);
      console.log("IP Novo:", data.ip);
      console.log("Atualize em developer.clashroyale.com");
    }

    lastKnownIP = data.ip;
    console.log("IP Atual:", data.ip);
  } catch (error) {
    console.error("Erro ao verificar IP:", error);
  }
}

// Verificar IP a cada 1 hora
setInterval(checkIP, 60 * 60 * 1000);
checkIP(); // Verificar imediatamente
```

---

## ✅ Checklist Final

- [ ] Git configurado e push feito para https://github.com/cietz/cr.git
- [ ] Conta Railway criada
- [ ] Projeto conectado ao GitHub
- [ ] Deploy realizado com sucesso
- [ ] URL gerada e testada
- [ ] IP do Railway obtido
- [ ] IP registrado em developer.clashroyale.com
- [ ] Token da API CR obtido
- [ ] Token adicionado às variáveis do Railway
- [ ] Testes realizados (app + UTM + API)
- [ ] Monitoramento configurado

---

## 🎉 Pronto!

Seu projeto agora está:
✅ No GitHub: https://github.com/cietz/cr.git  
✅ Rodando no Railway  
✅ Com IP registrado na API do Clash Royale  
✅ Rastreando vendas com UTMify

**URL Final:** https://cr-production-xxxx.up.railway.app

---

## 📞 Comandos Úteis

```powershell
# Ver logs em tempo real
railway logs

# Ver variáveis de ambiente
railway variables

# Redeploy manual
railway up

# Ver status
railway status

# Abrir dashboard
railway open
```

---

## 💡 Dica Final

**Salve este IP em algum lugar seguro:**

```
IP do Railway: [SEU_IP_AQUI]
Registrado em: developer.clashroyale.com
Data: [DATA_ATUAL]
```

Assim você saberá se mudou futuramente!

---

**Precisa de ajuda?** Consulte:

- [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md) - Guia detalhado
- [RAILWAY-VS-SQUARECLOUD.md](RAILWAY-VS-SQUARECLOUD.md) - Comparação
- Railway Docs: https://docs.railway.app
