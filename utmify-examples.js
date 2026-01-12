/**
 * Exemplo de Uso da Integração UTMify
 * Este arquivo demonstra como usar o sistema de tracking em produção
 */

// ==========================================
// EXEMPLO 1: Capturar UTMs da URL
// ==========================================

// Quando o usuário acessa: https://seusite.com/?utm_source=FB&utm_campaign=PROMO2024
// O script utm-capture.js automaticamente captura e salva no localStorage

// Você pode acessar os UTMs salvos assim:
const utmParams = window.UTMCapture.get();
console.log("UTMs salvos:", utmParams);
/*
Resultado:
{
  src: null,
  sck: null,
  utm_source: "FB",
  utm_campaign: "PROMO2024",
  utm_medium: null,
  utm_content: null,
  utm_term: null
}
*/

// ==========================================
// EXEMPLO 2: Enviar Pedido Pendente (PIX Gerado)
// ==========================================

async function criarPedidoPendente() {
  const utmifyTracker = new UTMifyTracker({
    platform: "ClashRoyaleStore",
    isTestMode: false, // false em produção
  });

  // Gera ID único
  const orderId = utmifyTracker.generateOrderId();
  // Exemplo: CR-1234567890-ABC123

  // Dados do cliente
  const customer = {
    name: "João Silva",
    email: "joao@example.com",
    phone: "11999999999",
    document: "12345678900",
    country: "BR",
    ip: null, // Será preenchido automaticamente
  };

  // Produtos no carrinho
  const products = [
    {
      id: "prod-passe-royale-2024",
      name: "Passe Royale",
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: 2990, // R$ 29,90
    },
    {
      id: "prod-gemas-500",
      name: "Pacote de 500 Gemas",
      planId: null,
      planName: null,
      quantity: 2,
      priceInCents: 1490, // R$ 14,90 cada
    },
  ];

  // Total: R$ 29,90 + R$ 29,80 = R$ 59,70
  const totalInCents = 5970;

  // Taxa do gateway (3% do total)
  const gatewayFeeInCents = Math.round(totalInCents * 0.03); // 179 centavos

  // Envia para UTMify
  const result = await utmifyTracker.createPendingOrder(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents
  );

  if (result.success) {
    console.log("✅ Pedido criado na Utmify:", result);
    // Salva orderId para uso posterior
    localStorage.setItem("currentOrderId", orderId);
    localStorage.setItem(
      "orderCreatedAt",
      utmifyTracker.formatDateUTC(new Date())
    );
  } else {
    console.error("❌ Erro ao criar pedido:", result.error);
  }
}

// ==========================================
// EXEMPLO 3: Marcar Pedido como Pago
// ==========================================

async function marcarPedidoComoPago() {
  const utmifyTracker = new UTMifyTracker({
    platform: "ClashRoyaleStore",
  });

  // Recupera dados do pedido
  const orderId = localStorage.getItem("currentOrderId");
  const createdAt = localStorage.getItem("orderCreatedAt");

  // Dados que foram enviados anteriormente (devem ser os mesmos)
  const customer = {
    name: "João Silva",
    email: "joao@example.com",
    phone: "11999999999",
    document: "12345678900",
    country: "BR",
  };

  const products = [
    {
      id: "prod-passe-royale-2024",
      name: "Passe Royale",
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: 2990,
    },
    {
      id: "prod-gemas-500",
      name: "Pacote de 500 Gemas",
      planId: null,
      planName: null,
      quantity: 2,
      priceInCents: 1490,
    },
  ];

  const totalInCents = 5970;
  const gatewayFeeInCents = 179;

  // Atualiza para status "paid"
  const result = await utmifyTracker.markOrderAsPaid(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents,
    createdAt // Data de criação original
  );

  if (result.success) {
    console.log("✅ Pedido marcado como pago:", result);
    // Aqui você pode redirecionar para página de sucesso, liberar produto, etc.
  } else {
    console.error("❌ Erro ao atualizar pedido:", result.error);
  }
}

// ==========================================
// EXEMPLO 4: Integração Completa no Checkout
// ==========================================

// Este exemplo mostra como integrar no fluxo de checkout
class CheckoutFlowExample {
  constructor() {
    this.utmifyTracker = new UTMifyTracker({
      platform: "ClashRoyaleStore",
      isTestMode: false,
    });

    this.orderId = null;
    this.createdAt = null;
  }

  // Quando usuário clica em "Finalizar Compra"
  async onCheckoutClick(cart, customerData) {
    try {
      // 1. Gera Order ID
      this.orderId = this.utmifyTracker.generateOrderId();
      this.createdAt = this.utmifyTracker.formatDateUTC(new Date());

      // 2. Calcula valores
      const totalInCents = this.calculateTotal(cart);
      const gatewayFeeInCents = Math.round(totalInCents * 0.03);

      // 3. Formata produtos
      const products = cart.map((item) => ({
        id: item.id,
        name: item.name,
        planId: null,
        planName: null,
        quantity: item.qty || 1,
        priceInCents: Math.round(item.price * 100),
      }));

      // 4. Gera PIX (sua API)
      const pixResponse = await this.generatePIX(totalInCents);

      // 5. Envia para Utmify com status "waiting_payment"
      await this.utmifyTracker.createPendingOrder(
        this.orderId,
        customerData,
        products,
        totalInCents,
        gatewayFeeInCents
      );

      // 6. Mostra PIX para o usuário
      this.displayPixCode(pixResponse.qrcode);

      // 7. Inicia polling para verificar pagamento
      this.startPaymentPolling();
    } catch (error) {
      console.error("Erro no checkout:", error);
    }
  }

  // Quando pagamento é confirmado
  async onPaymentConfirmed(cart, customerData) {
    try {
      const totalInCents = this.calculateTotal(cart);
      const gatewayFeeInCents = Math.round(totalInCents * 0.03);

      const products = cart.map((item) => ({
        id: item.id,
        name: item.name,
        planId: null,
        planName: null,
        quantity: item.qty || 1,
        priceInCents: Math.round(item.price * 100),
      }));

      // Atualiza para "paid" na Utmify
      await this.utmifyTracker.markOrderAsPaid(
        this.orderId,
        customerData,
        products,
        totalInCents,
        gatewayFeeInCents,
        this.createdAt
      );

      // Libera produto/serviço
      await this.releaseProduct();

      // Redireciona para página de sucesso
      window.location.href = "/obrigado";
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    }
  }

  calculateTotal(cart) {
    return cart.reduce((sum, item) => {
      return sum + item.price * 100 * (item.qty || 1);
    }, 0);
  }

  async generatePIX(amount) {
    // Implementação da sua API de pagamento
    const response = await fetch("/api/create-pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount / 100 }),
    });
    return response.json();
  }

  displayPixCode(qrcode) {
    // Mostra QR Code para o usuário
    console.log("Mostrando PIX:", qrcode);
  }

  startPaymentPolling() {
    // Verifica se o pagamento foi confirmado a cada 5 segundos
    const interval = setInterval(async () => {
      const paid = await this.checkPaymentStatus(this.orderId);
      if (paid) {
        clearInterval(interval);
        // Trigger onPaymentConfirmed
      }
    }, 5000);
  }

  async checkPaymentStatus(orderId) {
    // Implementação da verificação de status
    return false;
  }

  async releaseProduct() {
    // Lógica para liberar o produto/serviço
    console.log("Produto liberado!");
  }
}

// ==========================================
// EXEMPLO 5: Uso Direto via Backend
// ==========================================

// Se você preferir enviar diretamente do backend (Node.js)
async function enviarDiretoDaAPI() {
  const payload = {
    orderId: "CR-123456789-ABC",
    status: "paid",
    paymentMethod: "pix",
    customer: {
      name: "João Silva",
      email: "joao@example.com",
      phone: "11999999999",
      document: null,
    },
    products: [
      {
        id: "prod-1",
        title: "Passe Royale",
        quantity: 1,
        unitPrice: 2990,
      },
    ],
    trackingParameters: {
      src: null,
      sck: null,
      utm_source: "FB",
      utm_campaign: "PROMO2024",
      utm_medium: "ABO",
      utm_content: null,
      utm_term: null,
    },
    totalPriceInCents: 2990,
    approvedDate: "2024-07-26 14:35:13",
  };

  // Envia para o proxy
  const response = await fetch("http://localhost:3001/api/utmify/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Resultado:", result);
}

// ==========================================
// EXEMPLO 6: Reembolso
// ==========================================

async function processarReembolso() {
  const utmifyTracker = new UTMifyTracker({
    platform: "ClashRoyaleStore",
  });

  const orderId = "CR-123456789-ABC";
  const customer = {
    /* dados do cliente */
  };
  const products = [
    /* produtos */
  ];
  const totalInCents = 2990;
  const gatewayFeeInCents = 90;
  const createdAt = "2024-07-26 14:35:13";
  const approvedDate = "2024-07-26 14:43:37";

  // Marca como reembolsado
  await utmifyTracker.markOrderAsRefunded(
    orderId,
    customer,
    products,
    totalInCents,
    gatewayFeeInCents,
    createdAt,
    approvedDate
  );
}

// ==========================================
// EXPORTA PARA USO
// ==========================================

// Torna a classe de exemplo disponível globalmente
window.CheckoutFlowExample = CheckoutFlowExample;

console.log("📚 Exemplos de integração UTMify carregados!");
console.log("💡 Veja o código-fonte para mais detalhes.");
