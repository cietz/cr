# 🚀 Guia de Instalação Rápida - Integração UTMify

## ⚡ Passo a Passo

### 1️⃣ Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```powershell
npm install
```

Isso irá instalar:

- express
- cors
- node-fetch
- concurrently

### 2️⃣ Obter Credencial da Utmify

1. Acesse: https://app.utmify.com.br/register
2. Crie uma conta gratuita
3. Navegue: **Integrações > Webhooks > Credenciais de API**
4. Clique: **Adicionar Credencial > Criar Credencial**
5. Copie a credencial (ex: `KVRxalfMiBfm8Rm1nP5YxfwYzArNsA0VLeWC`)

### 3️⃣ Configurar Credencial

Abra o arquivo **utmify-proxy-server.js** e localize:

```javascript
const UTMIFY_CONFIG = {
    apiToken: 'SUA_CREDENCIAL_AQUI', // <-- COLE SUA CREDENCIAL AQUI
    ...
};
```

Substitua `'SUA_CREDENCIAL_AQUI'` pela credencial que você copiou.

### 4️⃣ Iniciar os Servidores

**Opção A - Executar ambos os servidores juntos:**

```powershell
npm run dev
```

**Opção B - Executar separadamente:**

Terminal 1 - Servidor principal:

```powershell
npm start
```

Terminal 2 - Proxy Utmify:

```powershell
npm run utmify
```

### 5️⃣ Testar a Integração

1. Abra o navegador em: `http://localhost:8080`

2. Adicione parâmetros UTM na URL para testar:

   ```
   http://localhost:8080/?utm_source=FB&utm_campaign=TESTE&utm_medium=ABO
   ```

3. Abra o Console do navegador (F12) e verifique:

   ```
   📊 UTM Parameters capturados: {utm_source: "FB", utm_campaign: "TESTE", ...}
   ```

4. Adicione itens ao carrinho e vá para o checkout

5. Clique em "Pagar" e verifique os logs:
   - No **console do navegador**: verá as requisições à Utmify
   - No **terminal do proxy**: verá os payloads enviados

### 6️⃣ Verificar no Dashboard da Utmify

1. Acesse: https://app.utmify.com.br
2. Faça login
3. Vá em **Resumo** ou **Vendas**
4. Você deverá ver os pedidos de teste aparecendo

## ✅ Checklist

- [ ] Dependências instaladas (`npm install`)
- [ ] Credencial da Utmify obtida
- [ ] Credencial configurada no `utmify-proxy-server.js`
- [ ] Servidores rodando (porta 8080 e 3001)
- [ ] Teste com UTMs na URL funciona
- [ ] Pedido de teste enviado com sucesso
- [ ] Pedido aparece no dashboard da Utmify

## 🐛 Problemas Comuns

### Erro: "Cannot find module 'cors'" ou similar

**Solução:** Execute `npm install` novamente

### Erro: "UTMIFY_API_TOKEN não configurado"

**Solução:** Verifique se você configurou a credencial no arquivo `utmify-proxy-server.js`

### Erro: "Failed to fetch" ao enviar pedido

**Solução:** Verifique se o servidor proxy está rodando na porta 3001:

```powershell
npm run utmify
```

### Pedidos não aparecem no dashboard da Utmify

**Solução 1:** Verifique se `isTest: false` no arquivo `utmify-proxy-server.js`  
**Solução 2:** Aguarde alguns minutos, pode haver delay na atualização

### UTMs não estão sendo capturados

**Solução:**

1. Verifique se o script `utm-capture.js` está carregando (veja na aba Network do DevTools)
2. Limpe o localStorage e teste novamente:
   ```javascript
   localStorage.clear();
   ```

## 📝 Comandos Úteis

```powershell
# Instalar dependências
npm install

# Iniciar servidor principal
npm start

# Iniciar proxy Utmify
npm run utmify

# Iniciar ambos ao mesmo tempo
npm run dev
```

## 🧪 Modo de Teste

Para testar sem salvar dados reais na Utmify, edite `utmify-proxy-server.js`:

```javascript
isTest: true; // Apenas valida, não salva no dashboard
```

Lembre-se de mudar para `false` quando for para produção!

## 📚 Documentação Completa

Para mais detalhes, consulte: **UTMIFY-README.md**

---

**Precisa de ajuda?** Consulte a documentação da Utmify ou verifique os logs dos servidores.
