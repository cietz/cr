/**
 * Proxy Backend para integração com Utmify
 * Este servidor Node.js atua como intermediário entre o frontend e a API da Utmify
 * para manter o API Token seguro
 */

const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURAÇÃO DA UTMIFY
// ============================================
const UTMIFY_CONFIG = {
  apiToken: process.env.UTMIFY_API_TOKEN || "SUA_CREDENCIAL_AQUI", // Substituir pela credencial real
  endpoint: "https://api.utmify.com.br/api-credentials/orders",
  platform: "ClashRoyaleStore",
};

// ============================================
// ENDPOINT: Enviar pedido para Utmify
// ============================================
app.post("/api/utmify/order", async (req, res) => {
  try {
    const {
      orderId,
      status,
      paymentMethod,
      customer,
      products,
      trackingParameters,
      totalPriceInCents,
      approvedDate = null,
      refundedAt = null,
    } = req.body;

    // Validações
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "orderId é obrigatório",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "status é obrigatório",
      });
    }

    // Calcula comissão (exemplo: taxa de 3% do gateway)
    const gatewayFeeInCents = Math.round(totalPriceInCents * 0.03);
    const userCommissionInCents = totalPriceInCents - gatewayFeeInCents;

    // Formata data de criação no formato UTC
    const createdAt = formatDateUTC(new Date());

    // Monta payload para Utmify
    const utmifyPayload = {
      orderId,
      platform: UTMIFY_CONFIG.platform,
      paymentMethod,
      status,
      createdAt,
      approvedDate,
      refundedAt,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        document: customer.document || null,
        country: customer.country || "BR",
        ip: req.ip || req.headers["x-forwarded-for"] || null,
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.title || p.name,
        planId: p.planId || null,
        planName: p.planName || null,
        quantity: p.quantity,
        priceInCents: p.unitPrice || p.priceInCents,
      })),
      trackingParameters: trackingParameters || {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null,
      },
      commission: {
        totalPriceInCents,
        gatewayFeeInCents,
        userCommissionInCents,
        currency: "BRL",
      },
      isTest: false, // Mudar para true durante testes
    };

    console.log(
      "📤 Enviando para Utmify:",
      JSON.stringify(utmifyPayload, null, 2)
    );

    // Envia para Utmify
    const response = await fetch(UTMIFY_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": UTMIFY_CONFIG.apiToken,
      },
      body: JSON.stringify(utmifyPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Erro Utmify:", responseData);
      return res.status(response.status).json({
        success: false,
        error: "Erro ao enviar para Utmify",
        details: responseData,
      });
    }

    console.log("✅ Sucesso Utmify:", responseData);

    res.json({
      success: true,
      data: responseData,
      orderId,
    });
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// ENDPOINT: Atualizar status do pedido
// ============================================
app.post("/api/utmify/update-status", async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        error: "orderId e newStatus são obrigatórios",
      });
    }

    // Recupera dados do pedido do localStorage do cliente ou banco de dados
    // (este é um exemplo simplificado)

    // Aqui você enviaria novamente para a Utmify com o novo status
    // Seguindo o mesmo formato do endpoint acima

    res.json({
      success: true,
      message: "Status atualizado",
      orderId,
      newStatus,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// ENDPOINT: Webhook para receber confirmações de pagamento
// ============================================
app.post("/api/webhook/payment-confirmation", async (req, res) => {
  try {
    console.log("🔔 Webhook recebido:", req.body);

    const { orderId, status } = req.body;

    // Aqui você pode:
    // 1. Validar o webhook
    // 2. Atualizar seu banco de dados
    // 3. Enviar atualização para Utmify se necessário
    // 4. Notificar o cliente

    if (status === "paid") {
      console.log(`✅ Pagamento confirmado para pedido ${orderId}`);
      // Lógica para liberar o produto/serviço
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Utmify Proxy",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Formata data para UTC no formato esperado pela Utmify
 * @param {Date} date
 * @returns {string} Formato: YYYY-MM-DD HH:MM:SS
 */
function formatDateUTC(date) {
  const d = date || new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log("🚀 Servidor Utmify Proxy rodando na porta", PORT);
  console.log("📊 Platform:", UTMIFY_CONFIG.platform);
  console.log(
    "🔑 API Token configurado:",
    UTMIFY_CONFIG.apiToken ? "Sim" : "Não"
  );
  console.log("⚠️  Lembre-se de configurar a variável UTMIFY_API_TOKEN");
});

module.exports = app;
