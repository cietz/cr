# 🚀 Deploy na SquareCloud - Guia Passo a Passo

## ⚠️ IMPORTANTE: Problema da API do Clash Royale

### O Desafio

A API oficial do Clash Royale **exige que você registre previamente os IPs** autorizados a fazer requisições:

```
Seu servidor na SquareCloud → IP: 192.168.1.100 (hoje)
API Clash Royale → ✅ Aceita requisições

[SquareCloud reinicia ou migra seu app]

Seu servidor na SquareCloud → IP: 192.168.1.200 (amanhã)
API Clash Royale → ❌ BLOQUEIA requisições!
```

### ✅ Soluções

#### **Solução 1: Usar Dados Mockados (Mais Simples)**

Este projeto já vem com dados mockados! Você não precisa da API real:

```javascript
// Os dados estão em: api-data/*.json
// O servidor já serve esses dados automaticamente
// Perfeito para demonstração e testes
```

**Vantagens:**

- ✅ Sem custo adicional
- ✅ Funciona imediatamente
- ✅ Sem problemas de IP
- ✅ Rápido e confiável

**Desvantagens:**

- ❌ Dados não são em tempo real
- ❌ Não atualiza informações de jogadores

---

#### **Solução 2: Proxy com IP Fixo (Para API Real)**

Se você realmente precisa de dados em tempo real:

**Opção A - Railway.app (Grátis com limitações)**

1. Crie conta em [railway.app](https://railway.app)
2. Deploy um proxy simples
3. Configure IP fixo (plano gratuito: 500h/mês)
4. Registre o IP no [Clash Royale Developer Portal](https://developer.clashroyale.com)

**Opção B - Fly.io ($2/mês)**

1. Crie conta em [fly.io](https://fly.io)
2. Deploy com IP dedicado
3. Plano: $2/mês para IP estático

**Opção C - VPS Própria ($5/mês)**

- Contabo, DigitalOcean, Linode
- IP dedicado e fixo
- Controle total

---

## 📋 Pré-requisitos

- [x] Conta na [SquareCloud](https://squarecloud.app)
- [x] Projeto configurado (já está pronto!)
- [x] Credencial da Utmify (se for usar tracking)
- [x] (Opcional) IP fixo registrado na API do Clash Royale

---

## 🎯 Método 1: Deploy Direto (Recomendado)

### Passo 1: Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```bash
# Porta do servidor (SquareCloud usa PORT automático)
PORT=80

# Credencial da Utmify
UTMIFY_API_TOKEN=sua_credencial_aqui

# Ambiente
NODE_ENV=production

# Porta do proxy Utmify (se diferente)
UTMIFY_PORT=3001
```

### Passo 2: Atualizar package.json

```json
{
  "name": "clashroyale-store",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^3.3.0"
  }
}
```

### Passo 3: Criar arquivo de configuração da SquareCloud

Já criado: `squarecloud.config`

```ini
DISPLAY_NAME=ClashRoyale Store
MAIN=server.js
MEMORY=512
VERSION=recommended
SUBDOMAIN=clashroyale-store
AUTORESTART=true
```

### Passo 4: Preparar para Upload

1. **Compacte o projeto** (ZIP):

   ```powershell
   Compress-Archive -Path * -DestinationPath clashroyale-store.zip
   ```

2. **Exclua arquivos desnecessários** antes de compactar:
   - `node_modules/` (será instalado automaticamente)
   - `.git/` (histórico git)
   - `test-utmify.js` (apenas para testes locais)
   - `*.md` (documentação)

### Passo 5: Fazer Upload na SquareCloud

1. Acesse [squarecloud.app](https://squarecloud.app)
2. Faça login
3. Clique em **"Upload Application"**
4. Selecione o arquivo `clashroyale-store.zip`
5. Configure:
   - RAM: 512 MB
   - Região: Brasil (se disponível)
6. Clique em **"Upload"**

### Passo 6: Configurar Variáveis de Ambiente

No dashboard da SquareCloud:

1. Vá em **"Config"** → **"Environment Variables"**
2. Adicione:
   ```
   UTMIFY_API_TOKEN=sua_credencial_da_utmify
   NODE_ENV=production
   ```

### Passo 7: Iniciar Aplicação

1. Clique em **"Start"**
2. Aguarde inicialização
3. Acesse: `https://clashroyale-store.squarecloud.app`

---

## 🧪 Testar o Deploy

```powershell
# Health check
curl https://clashroyale-store.squarecloud.app/health

# Testar captura de UTM
curl "https://clashroyale-store.squarecloud.app/?utm_source=TEST&utm_campaign=DEPLOY"

# Testar Utmify proxy
curl https://clashroyale-store.squarecloud.app:3001/health
```

---

## 🔧 Configurações Adicionais

### Domínio Customizado

1. Vá em **"Config"** → **"Custom Domain"**
2. Adicione seu domínio: `loja.seusite.com`
3. Configure DNS:
   ```
   CNAME loja → clashroyale-store.squarecloud.app
   ```

### Logs

Para ver logs em tempo real:

```powershell
# No dashboard da SquareCloud
Logs → View Logs
```

### Backups

Configure backups automáticos:

1. **"Config"** → **"Backups"**
2. Frequência: Diária
3. Retenção: 7 dias

---

## 🌐 Método 2: Deploy com IP Fixo (API Real)

Se você precisa usar a API real do Clash Royale:

### Arquitetura Híbrida

```
SquareCloud (Frontend + Utmify)
       ↓
Railway/Fly.io (Proxy com IP Fixo)
       ↓
API Clash Royale
```

### Configuração

1. **Deploy do Proxy no Railway:**

```javascript
// proxy-cr-api.js (hospedar no Railway)
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const CR_API_TOKEN = process.env.CR_API_TOKEN;

app.get("/api/players/:tag", async (req, res) => {
  const response = await fetch(
    `https://api.clashroyale.com/v1/players/${encodeURIComponent(
      req.params.tag
    )}`,
    {
      headers: {
        Authorization: `Bearer ${CR_API_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  res.json(data);
});

app.listen(process.env.PORT || 3000);
```

2. **Atualizar seu servidor para usar o proxy:**

```javascript
// No seu server.js (SquareCloud)
const CR_PROXY_URL =
  process.env.CR_PROXY_URL || "https://seu-proxy.railway.app";

app.get("/api/players/:tag", async (req, res) => {
  const response = await fetch(`${CR_PROXY_URL}/api/players/${req.params.tag}`);
  const data = await response.json();
  res.json(data);
});
```

---

## 📊 Monitoramento

### Uptime

SquareCloud já monitora uptime automaticamente. Você pode ver:

- Status (online/offline)
- Tempo de atividade
- Uso de recursos

### Logs de Erro

```javascript
// Adicione logging robusto
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
});
```

---

## 💰 Custos Estimados

### Opção 1: Apenas SquareCloud (Dados Mockados)

- **SquareCloud**: Grátis (plano básico) ou R$ 5-20/mês
- **Total**: R$ 0-20/mês
- ✅ **Recomendado para:** Demonstrações, projetos pessoais

### Opção 2: SquareCloud + Proxy IP Fixo (API Real)

- **SquareCloud**: R$ 5-20/mês
- **Railway/Fly.io**: $0-2/mês
- **Total**: R$ 5-30/mês
- ✅ **Recomendado para:** Produção com dados reais

### Opção 3: SquareCloud + VPS (Controle Total)

- **SquareCloud**: R$ 5-20/mês
- **VPS (Contabo)**: €5/mês (~R$ 30)
- **Total**: R$ 35-50/mês
- ✅ **Recomendado para:** Projetos sérios, alta escala

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"

```bash
# Certifique-se que package.json está correto
# SquareCloud instala dependências automaticamente
```

### Erro: "Port already in use"

```javascript
// Use a porta fornecida pelo ambiente
const PORT = process.env.PORT || 80;
```

### API Clash Royale retorna 403

```
1. Verifique se registrou o IP correto
2. Confirme que o token está válido
3. Use solução de proxy com IP fixo
```

### Utmify não está funcionando

```
1. Verifique variável UTMIFY_API_TOKEN
2. Confirme que proxy está rodando
3. Veja logs para detalhes
```

---

## ✅ Checklist de Deploy

- [ ] Projeto compactado (.zip)
- [ ] `package.json` atualizado
- [ ] `server.js` configurado
- [ ] `squarecloud.config` criado
- [ ] Variáveis de ambiente definidas
- [ ] (Opcional) IP fixo registrado na API CR
- [ ] Upload feito na SquareCloud
- [ ] Aplicação iniciada
- [ ] Testes realizados
- [ ] Domínio customizado configurado (opcional)

---

## 🎯 Recomendação Final

Para **maioria dos casos**, recomendo:

1. ✅ **Usar SquareCloud com dados mockados**

   - Sem complicações de IP
   - Funciona imediatamente
   - Ideal para demonstrações

2. ✅ **Se precisar de dados reais:**
   - SquareCloud para frontend + Utmify
   - Railway/Fly.io para proxy da API CR
   - Custo total: ~R$ 15/mês

---

**Dúvidas?** Consulte:

- [Documentação SquareCloud](https://docs.squarecloud.app)
- [Clash Royale API Docs](https://developer.clashroyale.com/docs)
- Suporte SquareCloud: Discord oficial

---

**Boa sorte com o deploy! 🚀**
