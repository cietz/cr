/**
 * Servidor Principal para SquareCloud
 * Inicia ambos os servidores (mock-server e utmify-proxy) em um único processo
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Importa o servidor UTMify
const utmifyApp = require("./utmify-proxy-server");

// ==========================================
// CONFIGURAÇÃO
// ==========================================
const PORT = process.env.PORT || 80;
const UTMIFY_PORT = process.env.UTMIFY_PORT || 3001;

// ==========================================
// SERVIDOR PRINCIPAL (Mock Server)
// ==========================================
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Serve arquivos estáticos
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "checkout.html"));
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
  const manifest = JSON.parse(
    fs.readFileSync(path.join(apiDataPath, "manifest.json"), "utf-8")
  );

  manifest.apis.forEach((api) => {
    const filePath = path.join(apiDataPath, api.file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      app.get(api.path, (req, res) => {
        res.json(data);
      });
      app.post(api.path, (req, res) => {
        res.json(data);
      });
    }
  });
}

// Rota de saúde para Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Clash Royale Store",
    timestamp: new Date().toISOString(),
    port: PORT,
    utmifyProxy: `Running on port ${UTMIFY_PORT}`,
  });
});

// ==========================================
// INICIA SERVIDORES
// ==========================================
app.listen(PORT, "0.0.0.0", () => {
  console.log("🎮 Clash Royale Store rodando na porta", PORT);
  console.log("📊 UTMify Proxy rodando na porta", UTMIFY_PORT);
  console.log("🌐 Ambiente:", process.env.NODE_ENV || "development");
  console.log("✅ Servidor pronto e aceitando conexões!");
  console.log("🏥 Healthcheck disponível em /health");
});

// Inicia servidor UTMify na porta configurada
if (UTMIFY_PORT !== PORT) {
  utmifyApp.listen(UTMIFY_PORT, () => {
    console.log("📊 Servidor UTMify iniciado na porta", UTMIFY_PORT);
  });
}

module.exports = app;
