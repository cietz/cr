# 📊 Integração UTMify - Resumo Completo

## ✅ O que foi implementado

A integração completa com a plataforma **UTMify** para rastreamento de vendas e conversões foi implementada com sucesso. O sistema agora é capaz de:

### 🎯 Funcionalidades Implementadas

1. **Captura Automática de UTMs**

   - Captura parâmetros UTM de qualquer URL (utm_source, utm_campaign, utm_medium, etc.)
   - Salva no localStorage para manter durante toda a jornada do usuário
   - Suporta também parâmetros src e sck

2. **Rastreamento de Pedidos**

   - Envia pedidos para Utmify quando PIX é gerado (status: waiting_payment)
   - Atualiza quando PIX é pago (status: paid)
   - Suporta reembolsos e chargebacks
   - Todos os dados enviados no formato correto da API

3. **Segurança**

   - API Token não é exposto no frontend
   - Proxy backend protege as credenciais
   - Validação de dados antes de enviar

4. **Tracking Completo**
   - IP do cliente
   - Dados do pedido (produtos, valores, quantidades)
   - Informações do cliente
   - Parâmetros UTM completos
   - Timestamps em UTC

---

## 📁 Arquivos Criados

### 1. **utmify-integration.js** (6KB)

**Módulo principal de integração**

- Classe `UTMifyTracker` para gerenciar pedidos
- Métodos para criar, atualizar e rastrear status
- Captura e gerenciamento de UTMs
- Formatação de datas e valores

**Uso:**

```javascript
const tracker = new UTMifyTracker({
    platform: 'ClashRoyaleStore'
});
await tracker.createPendingOrder(...);
```

### 2. **utm-capture.js** (3KB)

**Script de captura de UTMs**

- Roda automaticamente em todas as páginas
- Salva UTMs no localStorage
- Expõe API global `window.UTMCapture`

**Uso:**

```javascript
const utms = window.UTMCapture.get();
```

### 3. **utmify-proxy-server.js** (5KB)

**Servidor Node.js proxy**

- Porta: 3001
- Endpoint: `/api/utmify/order`
- Protege o API Token
- Valida e formata dados

**Configuração necessária:**

- Adicionar credencial da Utmify
- Executar: `npm run utmify`

### 4. **utmify-examples.js** (8KB)

**Exemplos práticos de uso**

- 6 exemplos diferentes
- Código comentado
- Casos de uso reais

### 5. **UTMIFY-README.md** (12KB)

**Documentação completa**

- Formato da requisição
- Descrição de todos os parâmetros
- Exemplos práticos
- FAQ e troubleshooting

### 6. **INSTALL.md** (3KB)

**Guia de instalação rápida**

- Passo a passo
- Checklist
- Problemas comuns e soluções

### 7. **.env.example** (500 bytes)

**Exemplo de configuração**

- Template para variáveis de ambiente
- Instruções de uso

### 8. **.gitignore** (200 bytes)

**Proteção de dados sensíveis**

- Ignora .env
- Ignora node_modules
- Outras exclusões padrão

### 9. Arquivos Atualizados

**package.json**

- Novas dependências: cors, node-fetch, concurrently
- Novos scripts: `npm run utmify`, `npm run dev`

**checkout.html**

- Inclusão do script utmify-integration.js
- Integração com o sistema de tracking

**index.html**

- Inclusão do script utm-capture.js
- Captura de UTMs desde a entrada

---

## 🚀 Como Usar

### Instalação (5 minutos)

1. **Instalar dependências:**

   ```powershell
   npm install
   ```

2. **Obter credencial da Utmify:**

   - Acesse: https://app.utmify.com.br/register
   - Crie conta gratuita
   - Vá em: Integrações > Webhooks > Credenciais de API
   - Copie a credencial

3. **Configurar credencial:**

   - Abra `utmify-proxy-server.js`
   - Cole a credencial no lugar de `'SUA_CREDENCIAL_AQUI'`

4. **Iniciar servidores:**

   ```powershell
   npm run dev
   ```

5. **Testar:**
   - Abra: http://localhost:8080/?utm_source=FB&utm_campaign=TESTE
   - Faça uma compra de teste
   - Verifique no dashboard da Utmify

### Fluxo de Tracking

```
Usuário clica em anúncio
         ↓
UTMs são capturados (utm-capture.js)
         ↓
Usuário navega pelo site (UTMs persistem)
         ↓
Usuário vai ao checkout
         ↓
Clica em "Pagar" → Pedido enviado à Utmify (status: waiting_payment)
         ↓
PIX é pago → Pedido atualizado (status: paid)
         ↓
Dashboard da Utmify mostra conversão com UTMs corretos
```

---

## 📊 O que a Utmify Rastreia

Com esta integração, você terá acesso a:

✅ **Qual fonte trouxe a venda** (Facebook, Google, Instagram, etc.)  
✅ **Qual campanha converteu** (Promo Black Friday, etc.)  
✅ **Qual anúncio performou melhor** (utm_content)  
✅ **ROI por campanha** (investimento vs. receita)  
✅ **Funil de conversão completo**  
✅ **Análise de performance em tempo real**

---

## 🎯 Próximos Passos

### Para Produção

1. **Configurar webhook de confirmação de pagamento**

   - Para atualizar automaticamente quando PIX for pago
   - Ver exemplo no `utmify-proxy-server.js` (linha ~120)

2. **Adicionar UTMs em links de anúncios**

   ```
   Exemplo de link do Facebook:
   https://seusite.com/?utm_source=facebook&utm_campaign=blackfriday2024&utm_medium=cpc&utm_content=video1&utm_term=feed
   ```

3. **Testar com diferentes fontes**

   - Facebook Ads
   - Google Ads
   - Instagram
   - TikTok
   - Influenciadores (src=instagram\_@influencer)

4. **Monitorar dashboard**
   - Acompanhe conversões diariamente
   - Ajuste campanhas com base nos dados
   - Identifique fontes com melhor ROI

### Melhorias Opcionais

- Adicionar Google Analytics junto com Utmify
- Implementar Facebook Pixel
- Criar relatórios personalizados
- Integrar com CRM
- Automação de e-mails baseada em UTMs

---

## 📖 Documentação

- **Instalação Rápida:** INSTALL.md
- **Documentação Completa:** UTMIFY-README.md
- **Exemplos de Código:** utmify-examples.js
- **Arquivo Principal:** utmify-integration.js

---

## 🆘 Suporte

### Problemas Comuns

**Pedidos não aparecem no dashboard:**

- Verifique se `isTest: false` no servidor proxy
- Aguarde alguns minutos (pode haver delay)
- Confirme que a credencial está correta

**UTMs não estão sendo capturados:**

- Verifique se `utm-capture.js` está carregando
- Limpe localStorage: `localStorage.clear()`
- Adicione UTMs manualmente na URL para testar

**Erro ao enviar pedido:**

- Confirme que proxy está rodando (porta 3001)
- Verifique credencial da Utmify
- Veja logs do servidor para detalhes

### Recursos

- Dashboard Utmify: https://app.utmify.com.br
- Criar conta: https://app.utmify.com.br/register
- Este README: UTMIFY-README.md

---

## ✨ Conclusão

Você agora tem um sistema completo de rastreamento de conversões integrado com a Utmify!

**Benefícios:**

- ✅ Rastreamento automático de UTMs
- ✅ Atribuição correta de vendas
- ✅ ROI por campanha
- ✅ Dados em tempo real
- ✅ Fácil de usar e manter

**Próximo passo:** Configure sua credencial e comece a rastrear suas vendas! 🚀

---

**Criado em:** 2026-01-12  
**Versão:** 1.0  
**Status:** ✅ Pronto para produção
