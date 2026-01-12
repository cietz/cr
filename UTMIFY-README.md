# Integração UTMify - Clash Royale Store

Este projeto implementa a integração completa com a plataforma de tracking **UTMify** para rastreamento de vendas e conversões.

## 📋 Arquivos da Integração

### 1. `utmify-integration.js`

Módulo JavaScript principal que gerencia a integração com a API da Utmify no frontend.

**Funcionalidades:**

- Captura automática de parâmetros UTM da URL
- Armazenamento persistente dos UTMs no localStorage
- Classe `UTMifyTracker` para gerenciar pedidos
- Métodos para criar, atualizar e rastrear status de pedidos
- Formatação automática de datas no formato UTC
- Cálculo de valores em centavos

### 2. `utm-capture.js`

Script leve para captura de parâmetros UTM em todas as páginas do site.

**Funcionalidades:**

- Captura automática ao carregar a página
- Armazenamento no localStorage com timestamp
- Propagação de UTMs entre páginas internas
- Verificação de expiração dos parâmetros

### 3. `utmify-proxy-server.js`

Servidor Node.js que atua como proxy entre o frontend e a API da Utmify.

**Por que usar um proxy?**

- Mantém o API Token seguro (não exposto no frontend)
- Adiciona camada de validação e segurança
- Permite logging centralizado
- Facilita debugging e monitoramento

## 🚀 Configuração

### Passo 1: Obter Credencial da Utmify

1. Acesse [app.utmify.com.br/register](https://app.utmify.com.br/register) e crie uma conta gratuita
2. Navegue até: **Integrações > Webhooks > Credenciais de API**
3. Clique em **Adicionar Credencial > Criar Credencial**
4. Copie a credencial gerada (ex: `KVRxalfMiBfm8Rm1nP5YxfwYzArNsA0VLeWC`)

### Passo 2: Configurar o Proxy Server

Abra o arquivo `utmify-proxy-server.js` e substitua:

```javascript
const UTMIFY_CONFIG = {
  apiToken: "SUA_CREDENCIAL_AQUI", // Cole a credencial aqui
  endpoint: "https://api.utmify.com.br/api-credentials/orders",
  platform: "ClashRoyaleStore",
};
```

**Ou configure via variável de ambiente:**

```bash
# Windows
set UTMIFY_API_TOKEN=sua_credencial_aqui

# Linux/Mac
export UTMIFY_API_TOKEN=sua_credencial_aqui
```

### Passo 3: Instalar Dependências

```bash
npm install express cors node-fetch
```

### Passo 4: Iniciar o Servidor Proxy

```bash
node utmify-proxy-server.js
```

O servidor estará rodando em `http://localhost:3001`

### Passo 5: Incluir Scripts no HTML

**Em todas as páginas de entrada (index.html, landing pages):**

```html
<head>
  <!-- Captura de UTMs -->
  <script src="utm-capture.js"></script>
</head>
```

**Na página de checkout (checkout.html):**

```html
<head>
  <!-- UTMify Integration -->
  <script src="utmify-integration.js"></script>
</head>
```

## 📊 Fluxo de Rastreamento

### 1. Entrada do Usuário

```
Usuário clica em anúncio do Facebook:
https://seusite.com/?utm_source=FB&utm_campaign=PROMO2024&utm_medium=ABO
```

### 2. Captura de UTMs

O script `utm-capture.js` captura automaticamente e salva no localStorage:

```javascript
{
  "utm_source": "FB",
  "utm_campaign": "PROMO2024",
  "utm_medium": "ABO",
  "utm_content": null,
  "utm_term": null,
  "src": null,
  "sck": null
}
```

### 3. Navegação

Os UTMs são mantidos no localStorage mesmo que o usuário navegue para outras páginas.

### 4. Checkout - Geração do PIX

Quando o usuário clica em "Pagar", o sistema:

1. Gera um Order ID único (ex: `CR-1234567890-ABC123`)
2. Envia pedido para Utmify com status `waiting_payment`
3. Inclui todos os parâmetros UTM capturados

### 5. Confirmação de Pagamento

Quando o PIX é confirmado:

1. Sistema envia atualização para Utmify com status `paid`
2. Inclui data de aprovação (`approvedDate`)
3. Mantém os mesmos UTMs e dados do cliente

## 🔄 Status de Pedidos

A Utmify aceita os seguintes status:

| Status            | Quando Usar                      |
| ----------------- | -------------------------------- |
| `waiting_payment` | PIX gerado, aguardando pagamento |
| `paid`            | Pagamento confirmado             |
| `refused`         | Pagamento recusado               |
| `refunded`        | Pedido reembolsado               |
| `chargedback`     | Chargeback realizado             |

## 💡 Exemplos de Uso

### Criar Pedido Pendente (PIX Gerado)

```javascript
const utmifyTracker = new UTMifyTracker({
  platform: "ClashRoyaleStore",
  isTestMode: false,
});

const orderId = utmifyTracker.generateOrderId();

await utmifyTracker.createPendingOrder(
  orderId,
  {
    name: "João Silva",
    email: "joao@example.com",
    phone: "11999999999",
    document: "12345678900",
    country: "BR",
  },
  [
    {
      id: "prod-1",
      name: "Passe Royale",
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: 2990, // R$ 29,90
    },
  ],
  2990, // Total em centavos
  90 // Taxa do gateway (3%)
);
```

### Marcar como Pago

```javascript
await utmifyTracker.markOrderAsPaid(
  orderId,
  customerData,
  products,
  2990,
  90,
  "2024-07-26 14:35:13" // createdAt original
);
```

### Marcar como Reembolsado

```javascript
await utmifyTracker.markOrderAsRefunded(
  orderId,
  customerData,
  products,
  2990,
  90,
  "2024-07-26 14:35:13", // createdAt
  "2024-07-26 14:43:37" // approvedDate
);
```

## 🧪 Modo de Teste

Para testar sem salvar dados reais na Utmify:

```javascript
const utmifyTracker = new UTMifyTracker({
  isTestMode: true, // Apenas valida, não salva
});
```

Ou no proxy server:

```javascript
isTest: true; // No payload enviado à API
```

## 📈 Visualizando Resultados

1. Acesse [app.utmify.com.br](https://app.utmify.com.br)
2. Faça login com sua conta
3. Navegue até **Resumo** ou **Vendas**
4. Visualize os pedidos e conversões rastreadas
5. Analise performance por fonte, campanha, mídia, etc.

## 🔍 Debug e Monitoramento

### No Console do Navegador

```javascript
// Ver UTMs capturados
console.log(window.UTMCapture.current);

// Ver UTMs salvos
console.log(window.UTMCapture.get());

// Limpar UTMs (para testes)
window.UTMCapture.clear();
```

### No Servidor Proxy

Os logs mostrarão:

- ✅ Pedidos enviados com sucesso
- ❌ Erros e falhas
- 📊 Payload completo enviado à Utmify

## ⚠️ Considerações Importantes

### 1. Datas em UTC

Todas as datas devem ser enviadas no formato UTC:

```
YYYY-MM-DD HH:MM:SS
Exemplo: 2024-07-26 14:35:13
```

### 2. Valores em Centavos

Todos os valores devem ser em centavos:

```javascript
R$ 29,90 = 2990 centavos
R$ 149,90 = 14990 centavos
```

### 3. Limite de Dias

- Pedidos: máximo 7 dias retroativos
- Reembolsos/Chargebacks: máximo 45 dias

### 4. Comissão do Usuário

O campo `userCommissionInCents` não pode ser 0, exceto se o vendedor realmente não recebeu nada.

## 🔐 Segurança

### ⚠️ NUNCA exponha sua credencial de API no frontend!

**✅ CERTO (via proxy):**

```javascript
// Frontend envia para seu servidor
fetch('http://localhost:3001/api/utmify/order', {...})

// Servidor usa a credencial de forma segura
headers: { 'x-api-token': process.env.UTMIFY_API_TOKEN }
```

**❌ ERRADO (expõe credencial):**

```javascript
// NÃO FAÇA ISSO!
fetch("https://api.utmify.com.br/api-credentials/orders", {
  headers: { "x-api-token": "SuaCredencialAqui" }, // Visível no código fonte!
});
```

## 📞 Suporte

- **Documentação Utmify:** Fornecida acima
- **Criar conta:** [app.utmify.com.br/register](https://app.utmify.com.br/register)
- **Dúvidas:** Consulte a documentação completa da API

## 📝 Checklist de Implementação

- [ ] Criar conta na Utmify
- [ ] Gerar credencial de API
- [ ] Configurar credencial no `utmify-proxy-server.js`
- [ ] Instalar dependências (`npm install`)
- [ ] Incluir `utm-capture.js` nas páginas de entrada
- [ ] Incluir `utmify-integration.js` no checkout
- [ ] Iniciar servidor proxy (`node utmify-proxy-server.js`)
- [ ] Testar com `isTestMode: true`
- [ ] Verificar pedidos no dashboard da Utmify
- [ ] Ativar modo produção (`isTestMode: false`)

## 🎯 Resultado Esperado

Após a implementação, você terá:

✅ Rastreamento completo de todas as vendas  
✅ Atribuição correta de conversões às campanhas  
✅ Dados de UTM preservados em toda a jornada  
✅ Dashboard com métricas detalhadas de performance  
✅ ROI calculado automaticamente por fonte/campanha

---

**Boa sorte com seu tracking! 🚀📊**
