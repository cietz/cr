(function() {
  // Configuração e Estilos
  const styles = `
    #sc-checkout-container {
      font-family: "Supercell Text", sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 60vh;
      color: #333;
    }
    .sc-checkout-header {
      margin-bottom: 30px;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
    }
    .sc-checkout-title {
      font-size: 32px;
      font-weight: 800;
      color: #333;
      margin: 0;
    }
    .sc-checkout-content {
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
    }
    .sc-checkout-items {
      flex: 2;
      min-width: 300px;
    }
    .sc-checkout-summary {
      flex: 1;
      min-width: 300px;
      background: #f9f9f9;
      padding: 30px;
      border-radius: 12px;
      height: fit-content;
    }
    .sc-item-row {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .sc-item-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
      background: #f0f0f0;
      border-radius: 8px;
      margin-right: 20px;
    }
    .sc-item-details {
      flex: 1;
    }
    .sc-item-name {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .sc-item-price {
      font-size: 16px;
      color: #666;
    }
    .sc-item-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .sc-qty-control {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
    }
    .sc-qty-btn {
      background: #fff;
      border: none;
      padding: 5px 12px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }
    .sc-qty-btn:hover {
      background: #f0f0f0;
    }
    .sc-qty-val {
      padding: 5px 10px;
      font-weight: 600;
      min-width: 30px;
      text-align: center;
    }
    .sc-remove-btn {
      background: none;
      border: none;
      color: #ff4d4f;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
    }
    .sc-summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .sc-summary-total {
      font-size: 20px;
      font-weight: 800;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }
    .sc-checkout-btn {
      background: #000;
      color: #fff;
      border: none;
      width: 100%;
      padding: 15px;
      font-size: 18px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 20px;
      transition: opacity 0.2s;
    }
    .sc-checkout-btn:hover {
      opacity: 0.9;
    }
    .sc-empty-cart {
      text-align: center;
      padding: 60px;
      font-size: 18px;
      color: #666;
    }
    .sc-back-link {
      display: inline-block;
      margin-top: 20px;
      color: #333;
      text-decoration: underline;
    }
  `;

  function injectStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Lógica principal
  class CheckoutManager {
    constructor() {
      this.cart = JSON.parse(localStorage.getItem('scCart')) || [];
      this.container = null;
      this.init();
    }

    init() {
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        // Encontra o elemento main
        const main = document.querySelector('main') || document.body;
        
        // Limpa o conteúdo existente do main para substituir pelo checkout
        // Preserva header e footer se estiverem fora do main
        main.innerHTML = '';
        
        // Cria nosso container
        this.container = document.createElement('div');
        this.container.id = 'sc-checkout-container';
        main.appendChild(this.container);

        this.render();
    }

    updateCart() {
        localStorage.setItem('scCart', JSON.stringify(this.cart));
        this.render();
        // Atualiza o event dispatch para sincronizar com o carrinho lateral se necessário
        window.dispatchEvent(new Event('storage'));
    }

    updateQty(index, delta) {
        if (this.cart[index]) {
            this.cart[index].qty = (this.cart[index].qty || 1) + delta;
            if (this.cart[index].qty <= 0) {
                this.cart.splice(index, 1);
            }
            this.updateCart();
        }
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.updateCart();
    }

    formatPrice(val) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;
        const match = priceStr.match(/([\d.,]+)/);
        if (!match) return 0;
        return parseFloat(match[1].replace('.', '').replace(',', '.'));
    }

    calculateTotal() {
        return this.cart.reduce((sum, item) => {
            return sum + (this.parsePrice(item.price) * (item.qty || 1));
        }, 0);
    }

    render() {
        if (this.cart.length === 0) {
            this.container.innerHTML = `
                <div class="sc-empty-cart">
                    <h2>Sua sacola está vazia</h2>
                    <p>Adicione itens para prosseguir com a compra.</p>
                    <a href="index.html" class="sc-back-link">Voltar para a loja</a>
                </div>
            `;
            return;
        }

        const total = this.calculateTotal();

        const itemsHtml = this.cart.map((item, index) => `
            <div class="sc-item-row">
                <img src="${item.image || ''}" alt="${item.name}" class="sc-item-image" onerror="this.style.background='#eee'">
                <div class="sc-item-details">
                    <div class="sc-item-name">${item.name}</div>
                    <div class="sc-item-price">${item.price}</div>
                </div>
                <div class="sc-item-actions">
                    <div class="sc-qty-control">
                        <button class="sc-qty-btn" onclick="window.scCheckout.updateQty(${index}, -1)">-</button>
                        <span class="sc-qty-val">${item.qty || 1}</span>
                        <button class="sc-qty-btn" onclick="window.scCheckout.updateQty(${index}, 1)">+</button>
                    </div>
                    <button class="sc-remove-btn" onclick="window.scCheckout.removeItem(${index})">Remover</button>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="sc-checkout-header">
                <h1 class="sc-checkout-title">Finalizar Compra</h1>
            </div>
            <div class="sc-checkout-content">
                <div class="sc-checkout-items">
                    ${itemsHtml}
                </div>
                <div class="sc-checkout-summary">
                    <div class="sc-summary-row">
                        <span>Subtotal</span>
                        <span>${this.formatPrice(total)}</span>
                    </div>
                    <div class="sc-summary-row" style="color: #666; font-size: 14px;">
                        <span>Taxas estimadas</span>
                        <span>Calculado no pagamento</span>
                    </div>
                    <div class="sc-summary-total">
                        <div class="sc-summary-row">
                            <span>Total</span>
                            <span>${this.formatPrice(total)}</span>
                        </div>
                    </div>
                    <button class="sc-checkout-btn" onclick="alert('Funcionalidade de pagamento em desenvolvimento!')">
                        Pagar Agora
                    </button>
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="index.html" class="sc-back-link">Voltar para a loja</a>
                    </div>
                </div>
            </div>
        `;
    }
  }

  // Inicialização
  injectStyles();
  window.scCheckout = new CheckoutManager();

})();
