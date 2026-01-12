# 🎯 Deploy no Render.com - IP FIXO GRÁTIS!
## GitHub: https://github.com/cietz/cr.git

## 🌟 Por que Render?
- ✅ **IP fixo GRATUITO** - Perfeito para API Clash Royale!
- ✅ Deploy automático via GitHub
- ✅ SSL grátis
- ✅ Fácil de configurar
- ⚠️ App "dorme" após 15min sem uso (plano grátis)

---

## 📋 Passo a Passo Completo

### 1️⃣ Fazer commit do render.yaml

```powershell
git add render.yaml
git commit -m "Add: Configuração do Render.com"
git push
```

---

### 2️⃣ Criar conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Escolha **"Sign Up with GitHub"**
4. Autorize o Render a acessar seus repositórios

---

### 3️⃣ Criar Novo Web Service

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte ao repositório: **cietz/cr**
4. Se não aparecer, clique em **"Configure account"** e dê permissão

---

### 4️⃣ Configurar o Serviço

O Render vai detectar automaticamente o `render.yaml`, mas confirme:

**Build & Deploy:**
- **Name:** `clash-royale-store`
- **Region:** `Oregon (US West)` (ou escolha o mais próximo)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**
- Selecione: **"Free"** ✅

Clique em **"Create Web Service"**

---

### 5️⃣ Adicionar Variáveis de Ambiente

Enquanto o primeiro build roda:

1. No painel do serviço, vá em **"Environment"** (aba lateral)
2. Clique em **"Add Environment Variable"**
3. Adicione estas variáveis:

```
NODE_ENV = production
```

**NÃO adicione os tokens agora!** Vamos fazer depois de pegar o IP fixo.

---

### 6️⃣ Aguardar Build

O primeiro deploy leva ~3-5 minutos.

Você verá:
```
==> Installing dependencies
==> Building
==> Starting service
==> Live at https://clash-royale-store.onrender.com
```

---

### 7️⃣ Obter o IP FIXO (IMPORTANTE!)

#### Método 1: Via Dashboard (Mais Fácil)

1. No painel do seu serviço
2. Vá em **"Settings"** → **"Outbound IPs"**
3. Você verá algo como:

```
Outbound IPv4: 123.45.67.89
Outbound IPv6: 2600:1f18:...
```

**📌 COPIE O IPv4!** Este IP é **FIXO e GRÁTIS**! 🎉

#### Método 2: Via API

Acesse: `https://seu-app.onrender.com/get-ip`

---

### 8️⃣ Registrar IP na API Clash Royale

Agora que você tem o **IP FIXO**:

1. Acesse: **https://developer.clashroyale.com**
2. Login com Supercell ID
3. Vá em **"My Account"** → **"API Keys"**
4. Clique em **"Create New Key"**
5. Preencha:
   ```
   Name: Render Production
   Description: IP fixo do Render.com
   IP Address: 123.45.67.89  (o IP que você copiou)
   ```
6. Clique em **"Create Key"**
7. **COPIE O TOKEN** (você só verá uma vez!)

Exemplo de token:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiIsImlhdCI6MTY0MDk5NTIwMCwic3ViIjoiZGV2ZWxvcGVyLzEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjEyMy40NS42Ny44OSJdLCJ0eXBlIjoiY2xpZW50In1dfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

---

### 9️⃣ Adicionar Tokens no Render

Agora adicione as variáveis finais:

1. Render → **Environment**
2. Adicione:

```
CR_API_TOKEN = eyJ0eXAiOiJKV1QiLCJhbGc... (seu token)
UTMIFY_API_TOKEN = sua_credencial_utmify (se tiver)
```

3. O Render vai fazer **redeploy automático**
4. Como o **IP é fixo**, não precisa atualizar nada! ✅

---

### 🎉 Pronto!

Sua aplicação está rodando com:
- ✅ **IP fixo gratuito**
- ✅ SSL automático (HTTPS)
- ✅ Deploy automático a cada push
- ✅ API Clash Royale funcionando

**URL Final:** `https://clash-royale-store.onrender.com`

---

## 🔧 Comandos Úteis

### Testar localmente antes de fazer push:
```powershell
npm install
npm start
# Acesse http://localhost:8080
```

### Ver logs em tempo real:
- Render Dashboard → Seu serviço → **"Logs"** (aba lateral)

### Fazer novo deploy manualmente:
- Render Dashboard → Seu serviço → **"Manual Deploy"** → **"Deploy latest commit"**

---

## ⚠️ Limitações do Plano Gratuito

### Sleep após inatividade:
- App "dorme" após **15 minutos** sem requisições
- Primeira requisição após sleep demora **~30 segundos** para acordar
- Depois volta ao normal

### Solução para evitar sleep:

#### Opção 1: Upgrade para Starter ($7/mês)
- Sem sleep
- Melhor performance
- Ainda mais barato que Railway!

#### Opção 2: Usar serviço de "ping" grátis
- https://uptimerobot.com (faz requisição a cada 5min)
- https://cron-job.org (similar)
- Mantém app acordado 24/7

**Configurar UptimeRobot:**
1. Criar conta grátis
2. Add Monitor → URL: `https://seu-app.onrender.com/health`
3. Interval: 5 minutos
4. Pronto! App nunca dorme mais ✅

---

## 🆚 Render vs Railway

| Feature | Render (Free) | Railway (Free) |
|---------|---------------|----------------|
| **IP Fixo** | ✅ Grátis | ❌ $5/mês |
| **Sleep** | Sim (15min) | Não |
| **Horas/mês** | 750h | Ilimitado |
| **Custo Pago** | $7/mês | $5-20/mês |
| **Melhor para** | **API Clash** 🏆 | Apps sem IP fixo |

---

## 🎯 Checklist Final

- [ ] Commit do `render.yaml` feito
- [ ] Conta no Render criada
- [ ] Repositório conectado
- [ ] Primeiro deploy completado
- [ ] IP fixo copiado de Settings → Outbound IPs
- [ ] IP registrado em developer.clashroyale.com
- [ ] Token da API CR obtido
- [ ] Tokens adicionados no Environment
- [ ] Deploy final completado
- [ ] Site testado e funcionando

---

## 📞 Precisa de Ajuda?

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Support:** help@render.com

---

## 🎊 Resultado Final

Você terá:
- **URL:** https://clash-royale-store.onrender.com
- **IP Fixo:** 123.45.67.89 (exemplo)
- **Custo:** $0/mês
- **API Clash Royale:** Funcionando perfeitamente!
- **UTMify Tracking:** Integrado

**Tudo pronto para vender! 🎮💰**

---

## 💡 Dicas Extras

### Custom Domain (opcional):
1. Render → Settings → Custom Domains
2. Adicione seu domínio
3. Configure DNS (CNAME ou A record)
4. SSL automático!

### Monitoramento:
- Render mostra CPU, memória e requests
- Logs em tempo real
- Alertas por email (opcional)

### Backup:
Como está no GitHub, seu código está seguro! ✅

---

**Pronto para começar?** Execute o comando abaixo e siga o guia! 🚀

```powershell
git add render.yaml
git commit -m "Add: Configuração do Render.com"
git push
```
