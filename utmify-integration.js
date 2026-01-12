/**
 * UTMify Integration Module
 * Gerencia o rastreamento e envio de pedidos para a API da Utmify
 * Documentação: https://api.utmify.com.br/api-credentials/orders
 */

class UTMifyTracker {
  constructor(config = {}) {
    this.apiToken = config.apiToken || "";
    this.platform = config.platform || "ClashRoyaleStore";
    this.endpoint = "https://api.utmify.com.br/api-credentials/orders";
    this.isTestMode = config.isTestMode || false;

    // Carrega UTM params se disponíveis
    this.trackingParams = this.loadUTMParams();

    // Carrega IP do cliente (será enviado via backend por segurança)
    this.customerIp = null;
    this.getCustomerIP();
  }

  /**
   * Captura parâmetros UTM da URL atual
   */
  getUTMParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      src: urlParams.get("src") || null,
      sck: urlParams.get("sck") || null,
      utm_source: urlParams.get("utm_source") || null,
      utm_campaign: urlParams.get("utm_campaign") || null,
      utm_medium: urlParams.get("utm_medium") || null,
      utm_content: urlParams.get("utm_content") || null,
      utm_term: urlParams.get("utm_term") || null,
    };
  }

  /**
   * Carrega parâmetros UTM (da URL ou localStorage)
   */
  loadUTMParams() {
    // Primeiro tenta da URL atual
    const currentUTM = this.getUTMParamsFromURL();
    const hasCurrentUTM = Object.values(currentUTM).some((v) => v !== null);

    if (hasCurrentUTM) {
      // Salva no localStorage para uso futuro
      localStorage.setItem("utmParams", JSON.stringify(currentUTM));
      console.log("📊 UTM capturado da URL:", currentUTM);
      return currentUTM;
    }

    // Se não tem na URL, tenta pegar do localStorage
    const savedUTM = localStorage.getItem("utmParams");
    if (savedUTM) {
      console.log("📊 UTM carregado do localStorage");
      return JSON.parse(savedUTM);
    }

    console.log("⚠️ Nenhum parâmetro UTM encontrado");
    return currentUTM; // Retorna objeto com nulls
  }

  /**
   * Obtém IP do cliente
   */
  async getCustomerIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      this.customerIp = data.ip;
      console.log("📍 IP do cliente:", this.customerIp);
    } catch (error) {
      console.error("Erro ao obter IP:", error);
    }
  }

  /**
   * Gera ID único para o pedido
   */
  generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CR-${timestamp}-${random}`;
  }

  /**
   * Formata data para UTC no formato esperado pela Utmify
   * @param {Date} date
   * @returns {string} Formato: YYYY-MM-DD HH:MM:SS
   */
  formatDateUTC(date) {
    const d = date || new Date();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const seconds = String(d.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Converte valor BRL para centavos
   * @param {number} value
   */
  toCents(value) {
    return Math.round(value * 100);
  }

  /**
   * Envia pedido para a Utmify
   * @param {Object} orderData Dados do pedido
   * @returns {Promise<Object>}
   */
  async sendOrder(orderData) {
    try {
      const {
        orderId,
        status,
        paymentMethod = "pix",
        createdAt,
        approvedDate = null,
        refundedAt = null,
        customer,
        products,
        commission,
        currency = "BRL",
      } = orderData;

      // Validações básicas
      if (!this.apiToken) {
        throw new Error("API Token da Utmify não configurado");
      }

      if (!orderId) {
        throw new Error("Order ID é obrigatório");
      }

      // Monta payload no formato da Utmify
      const payload = {
        orderId: orderId,
        platform: this.platform,
        paymentMethod: paymentMethod,
        status: status,
        createdAt: createdAt,
        approvedDate: approvedDate,
        refundedAt: refundedAt,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          document: customer.document || null,
          country: customer.country || "BR",
          ip: customer.ip || this.customerIp || null,
        },
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          planId: p.planId || null,
          planName: p.planName || null,
          quantity: p.quantity,
          priceInCents: p.priceInCents,
        })),
        trackingParameters: this.trackingParams,
        commission: {
          totalPriceInCents: commission.totalPriceInCents,
          gatewayFeeInCents: commission.gatewayFeeInCents,
          userCommissionInCents: commission.userCommissionInCents,
          currency: currency,
        },
        isTest: this.isTestMode,
      };

      console.log("📤 Enviando pedido para Utmify:", payload);

      // Envia para a API
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": this.apiToken,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Erro Utmify:", responseData);
        return {
          success: false,
          error: responseData.error || "Erro ao enviar para Utmify",
          details: responseData,
        };
      }

      console.log("✅ Pedido enviado com sucesso para Utmify:", responseData);
      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("❌ Erro ao enviar para Utmify:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cria pedido com status waiting_payment
   * Usado quando PIX é gerado mas ainda não foi pago
   */
  async createPendingOrder(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents
  ) {
    const createdAt = this.formatDateUTC(new Date());

    return await this.sendOrder({
      orderId,
      status: "waiting_payment",
      paymentMethod: "pix",
      createdAt,
      approvedDate: null,
      refundedAt: null,
      customer,
      products,
      commission: {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: gatewayFeeInCents,
        userCommissionInCents: totalInCents - gatewayFeeInCents,
      },
    });
  }

  /**
   * Atualiza pedido para status paid
   * Usado quando o PIX é confirmado
   */
  async markOrderAsPaid(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents,
    createdAt
  ) {
    const approvedDate = this.formatDateUTC(new Date());

    return await this.sendOrder({
      orderId,
      status: "paid",
      paymentMethod: "pix",
      createdAt,
      approvedDate,
      refundedAt: null,
      customer,
      products,
      commission: {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: gatewayFeeInCents,
        userCommissionInCents: totalInCents - gatewayFeeInCents,
      },
    });
  }

  /**
   * Atualiza pedido para status refunded
   */
  async markOrderAsRefunded(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents,
    createdAt,
    approvedDate
  ) {
    const refundedAt = this.formatDateUTC(new Date());

    return await this.sendOrder({
      orderId,
      status: "refunded",
      paymentMethod: "pix",
      createdAt,
      approvedDate,
      refundedAt,
      customer,
      products,
      commission: {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: gatewayFeeInCents,
        userCommissionInCents: totalInCents - gatewayFeeInCents,
      },
    });
  }

  /**
   * Atualiza pedido para status refused
   */
  async markOrderAsRefused(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents,
    createdAt
  ) {
    return await this.sendOrder({
      orderId,
      status: "refused",
      paymentMethod: "pix",
      createdAt,
      approvedDate: null,
      refundedAt: null,
      customer,
      products,
      commission: {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: gatewayFeeInCents,
        userCommissionInCents: totalInCents - gatewayFeeInCents,
      },
    });
  }
}

// Torna disponível globalmente
window.UTMifyTracker = UTMifyTracker;
