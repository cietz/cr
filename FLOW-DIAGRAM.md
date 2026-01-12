# 🎯 Diagrama de Fluxo - Integração UTMify

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    JORNADA DO USUÁRIO                           │
└─────────────────────────────────────────────────────────────────┘

1. ENTRADA
   │
   ├─► Usuário clica em anúncio
   │   (Facebook, Google, Instagram, etc.)
   │
   │   URL: https://seusite.com/?utm_source=FB&utm_campaign=PROMO2024
   │
   └─► Aterrissa no site

       ┌──────────────────────────────────────┐
       │  utm-capture.js                      │
       │  ✓ Captura UTMs da URL               │
       │  ✓ Salva no localStorage             │
       │  ✓ IP do usuário                     │
       │  ✓ Referrer                          │
       └──────────────────────────────────────┘
              │
              ▼
       localStorage:
       {
         utm_source: "FB",
         utm_campaign: "PROMO2024",
         utm_medium: "CPC",
         utm_content: null,
         utm_term: null
       }


2. NAVEGAÇÃO
   │
   ├─► Usuário navega pelo site
   │   (index.html → produtos → checkout)
   │
   └─► UTMs permanecem no localStorage
       (persistem durante toda a sessão)


3. CHECKOUT
   │
   ├─► Usuário adiciona produtos ao carrinho
   │
   ├─► Clica em "Finalizar Compra"
   │
   └─► checkout.html carrega

       ┌──────────────────────────────────────┐
       │  utmify-integration.js               │
       │  ✓ Carrega UTMs do localStorage      │
       │  ✓ Prepara dados do pedido           │
       │  ✓ Gera Order ID único               │
       └──────────────────────────────────────┘


4. PAGAMENTO
   │
   ├─► Usuário clica em "Pagar"
   │
   ├─► Sistema gera PIX
   │
   └─► ENVIO PARA UTMIFY #1

       ┌──────────────────────────────────────┐
       │  Status: waiting_payment             │
       │                                      │
       │  Dados enviados:                     │
       │  • Order ID                          │
       │  • Produtos                          │
       │  • Valores                           │
       │  • Cliente                           │
       │  • UTMs capturados                   │
       │  • Data de criação (UTC)             │
       └──────────────────────────────────────┘
              │
              ▼
       Frontend → Proxy Backend → API Utmify
       (porta 8080) (porta 3001)  (cloud)


5. CONFIRMAÇÃO
   │
   ├─► Usuário paga o PIX
   │
   ├─► Sistema detecta pagamento
   │
   └─► ENVIO PARA UTMIFY #2

       ┌──────────────────────────────────────┐
       │  Status: paid                        │
       │                                      │
       │  Dados enviados:                     │
       │  • Mesmo Order ID                    │
       │  • Mesmos dados                      │
       │  • Data de aprovação (UTC)           │
       │  • UTMs mantidos                     │
       └──────────────────────────────────────┘
              │
              ▼
       Frontend → Proxy Backend → API Utmify


6. DASHBOARD
   │
   └─► Dashboard Utmify atualiza

       ┌──────────────────────────────────────┐
       │  app.utmify.com.br                   │
       │                                      │
       │  ✓ Venda registrada                  │
       │  ✓ Atribuída à campanha FB/PROMO2024 │
       │  ✓ ROI calculado                     │
       │  ✓ Métricas atualizadas              │
       └──────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados Detalhado

```
┌─────────────┐
│   USUÁRIO   │
└──────┬──────┘
       │
       │ 1. Clica em link com UTMs
       │
       ▼
┌─────────────────────────┐
│   LANDING PAGE          │
│   (index.html)          │
│                         │
│   [utm-capture.js]      │
│   • Extrai UTMs da URL  │
│   • Salva localStorage  │
└──────┬──────────────────┘
       │
       │ 2. Navega para checkout
       │
       ▼
┌─────────────────────────┐
│   CHECKOUT              │
│   (checkout.html)       │
│                         │
│   [utmify-integration]  │
│   • Carrega UTMs        │
│   • Prepara pedido      │
└──────┬──────────────────┘
       │
       │ 3. Clica em "Pagar"
       │
       ▼
┌─────────────────────────┐
│   FRONTEND JS           │
│                         │
│   • Gera Order ID       │
│   • Coleta dados        │
│   • Monta payload       │
└──────┬──────────────────┘
       │
       │ 4. POST /api/utmify/order
       │
       ▼
┌─────────────────────────┐
│   PROXY BACKEND         │
│   (porta 3001)          │
│                         │
│   • Valida dados        │
│   • Adiciona API Token  │
│   • Calcula comissões   │
│   • Formata UTC         │
└──────┬──────────────────┘
       │
       │ 5. POST com x-api-token
       │
       ▼
┌─────────────────────────┐
│   API UTMIFY            │
│   api.utmify.com.br     │
│                         │
│   • Valida requisição   │
│   • Processa dados      │
│   • Salva no banco      │
│   • Retorna resposta    │
└──────┬──────────────────┘
       │
       │ 6. Resposta JSON
       │
       ▼
┌─────────────────────────┐
│   DASHBOARD UTMIFY      │
│   app.utmify.com.br     │
│                         │
│   • Exibe conversão     │
│   • Atualiza métricas   │
│   • Calcula ROI         │
└─────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos

```
site-clonado/
│
├── 📄 index.html                     → Página principal
│   └── <script src="utm-capture.js"> → Captura UTMs
│
├── 📄 checkout.html                  → Página de checkout
│   └── <script src="utmify-integration.js"> → Tracking
│
├── 🟦 utm-capture.js                 → Captura automática de UTMs
│   ├── getUTMParamsFromURL()
│   ├── saveToLocalStorage()
│   └── window.UTMCapture.*
│
├── 🟦 utmify-integration.js          → Classe principal
│   ├── class UTMifyTracker
│   ├── createPendingOrder()
│   ├── markOrderAsPaid()
│   └── sendOrder()
│
├── 🟩 utmify-proxy-server.js         → Backend Node.js
│   ├── POST /api/utmify/order
│   ├── POST /api/utmify/update-status
│   ├── POST /api/webhook/payment-confirmation
│   └── GET /health
│
├── 📚 UTMIFY-README.md               → Documentação completa
├── 📚 INSTALL.md                     → Guia de instalação
├── 📚 SUMMARY.md                     → Resumo do projeto
├── 🧪 test-utmify.js                 → Testes automáticos
├── 💡 utmify-examples.js             → Exemplos de código
│
└── 📦 package.json                   → Dependências
    ├── express
    ├── cors
    ├── node-fetch
    └── concurrently
```

---

## 🔐 Fluxo de Segurança

```
┌──────────────────────────────────────────────────────────────┐
│  POR QUE USAR PROXY BACKEND?                                 │
└──────────────────────────────────────────────────────────────┘

❌ SEM PROXY (INSEGURO):

   Frontend (JavaScript)
   └─► Chama API Utmify diretamente
       └─► API Token EXPOSTO no código-fonte! 🚨
           └─► Qualquer pessoa pode ver e roubar

✅ COM PROXY (SEGURO):

   Frontend (JavaScript)
   └─► Chama SEU servidor (localhost:3001)
       └─► Servidor adiciona API Token
           └─► Chama API Utmify
               └─► API Token PROTEGIDO ✅

┌──────────────────────────────────────────────────────────────┐
│  HEADERS DA REQUISIÇÃO                                       │
└──────────────────────────────────────────────────────────────┘

Frontend → Proxy:
   POST http://localhost:3001/api/utmify/order
   Headers: {
     'Content-Type': 'application/json'
   }
   Body: { orderId, customer, products, ... }

Proxy → Utmify:
   POST https://api.utmify.com.br/api-credentials/orders
   Headers: {
     'Content-Type': 'application/json',
     'x-api-token': 'SUA_CREDENCIAL_AQUI'  ← Seguro no servidor
   }
   Body: { orderId, customer, products, trackingParams, ... }
```

---

## 📱 Casos de Uso

```
┌──────────────────────────────────────────────────────────────┐
│  CASO 1: Facebook Ads                                        │
└──────────────────────────────────────────────────────────────┘

Link do anúncio:
https://seusite.com/?utm_source=facebook&utm_campaign=blackfriday2024&utm_medium=cpc&utm_content=video1&utm_term=feed

Resultado no dashboard:
• Fonte: Facebook
• Campanha: blackfriday2024
• Mídia: CPC
• Conteúdo: video1
• Termo: feed

─────────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────┐
│  CASO 2: Influenciador Instagram                             │
└──────────────────────────────────────────────────────────────┘

Link na bio:
https://seusite.com/?src=instagram_@influencer&utm_campaign=parcerias

Resultado no dashboard:
• SRC: instagram_@influencer
• Campanha: parcerias
• Você sabe exatamente quantas vendas vieram do influencer!

─────────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────┐
│  CASO 3: Google Ads                                          │
└──────────────────────────────────────────────────────────────┘

Link do anúncio:
https://seusite.com/?utm_source=google&utm_campaign=search2024&utm_medium=cpc&utm_term=comprar+gemas

Resultado no dashboard:
• Fonte: Google
• Campanha: search2024
• Mídia: CPC
• Termo: comprar+gemas
• ROI calculado automaticamente
```

---

## 🎯 Métricas Disponíveis

```
┌──────────────────────────────────────────────────────────────┐
│  DASHBOARD UTMIFY - MÉTRICAS                                 │
└──────────────────────────────────────────────────────────────┘

Por Fonte (utm_source):
├─► Facebook: 45 vendas | R$ 2.350,00
├─► Instagram: 23 vendas | R$ 1.150,00
├─► Google: 18 vendas | R$ 900,00
└─► Direto: 10 vendas | R$ 500,00

Por Campanha (utm_campaign):
├─► blackfriday2024: 32 vendas | R$ 1.680,00
├─► promo_natal: 28 vendas | R$ 1.400,00
└─► lancamento: 20 vendas | R$ 1.000,00

Por Mídia (utm_medium):
├─► CPC: 55 vendas | R$ 2.750,00
├─► Stories: 30 vendas | R$ 1.500,00
└─► Feed: 15 vendas | R$ 750,00

ROI (Retorno sobre Investimento):
• Investido: R$ 1.000,00
• Faturado: R$ 4.900,00
• ROI: 390% 📈
```

---

**Este diagrama mostra o fluxo completo desde a entrada do usuário até a visualização no dashboard da Utmify!** 🚀
