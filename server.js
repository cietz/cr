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

// Rota para player API (mock)
app.get("/player", (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    return res.status(400).json({ error: "Tag é obrigatória" });
  }

  // Retorna dados mockados do jogador
  res.json({
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
  });
});

// API mock para criar PIX
app.post("/api/create-pix", (req, res) => {
  const { amount, customer, items } = req.body;

  // Simula geração de PIX
  const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${amount.toFixed(
    2
  )}5802BR5925CLASH ROYALE STORE6009SAO PAULO62070503***6304`;

  res.json({
    success: true,
    pix: {
      qrcode: pixCode,
    },
    transactionId: `TX-${Date.now()}`,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
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
