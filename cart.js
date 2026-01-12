// ==========================================
// SISTEMA DE CARRINHO - SUPERCELL STORE CLONE
// Tema Claro - Design Moderno
// ==========================================

(function() {
  'use strict';

  // Estado do carrinho
  let cart = JSON.parse(localStorage.getItem('scCart') || '[]');
  let creatorCode = localStorage.getItem('scCreatorCode') || '';

  // Estilos do carrinho - Tema Claro
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    /* Overlay */
    .sc-cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99998;
      display: none;
      backdrop-filter: blur(4px);
    }
    .sc-cart-overlay.open {
      display: block;
    }
    
    /* Sidebar do carrinho */
    .sc-cart-sidebar {
      position: fixed;
      top: 0;
      right: -480px;
      width: 450px;
      max-width: 100vw;
      height: 100vh;
      background: #ffffff;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
      box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
      font-family: 'Inter', sans-serif;
    }
    .sc-cart-sidebar.open {
      right: 0;
    }
    
    /* Header */
    .sc-cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #1a1a1a;
      border-bottom: 1px solid #333;
    }
    .sc-cart-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sc-cart-title-icon {
      width: 28px;
      height: 28px;
      color: #ffffff;
    }
    .sc-cart-title-count {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
    }
    .sc-cart-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sc-cart-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    /* Banner Código do Criador */
    .sc-creator-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #f8fdf8;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: background 0.2s;
    }
    .sc-creator-banner:hover {
      background: #f0faf0;
    }
    .sc-creator-icon {
      width: 24px;
      height: 24px;
      color: #00c853;
    }
    .sc-creator-text {
      color: #00c853;
      font-size: 14px;
      font-weight: 600;
    }
    .sc-creator-applied {
      background: #e8f5e9;
    }
    .sc-creator-code {
      color: #212121;
      font-weight: 700;
    }
    
    /* Lista de itens */
    .sc-cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      background: #fafafa;
    }
    .sc-cart-items::-webkit-scrollbar {
      width: 6px;
    }
    .sc-cart-items::-webkit-scrollbar-track {
      background: #f0f0f0;
    }
    .sc-cart-items::-webkit-scrollbar-thumb {
      background: #d0d0d0;
      border-radius: 3px;
    }
    
    /* Item do carrinho */
    .sc-cart-item {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      gap: 16px;
      align-items: center;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .sc-cart-item:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    .sc-cart-item-image {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      flex-shrink: 0;
    }
    .sc-cart-item-info {
      flex: 1;
      min-width: 0;
    }
    .sc-cart-item-name {
      color: #212121;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .sc-cart-item-desc {
      color: #757575;
      font-size: 12px;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .sc-cart-item-price {
      color: #00c853;
      font-size: 18px;
      font-weight: 800;
    }
    
    /* Controles de quantidade */
    .sc-cart-item-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 6px 10px;
    }
    .sc-cart-qty-btn {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      color: #212121;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sc-cart-qty-btn:hover {
      background: #00e676;
      border-color: #00e676;
      color: #ffffff;
    }
    .sc-cart-qty-value {
      color: #212121;
      font-size: 16px;
      font-weight: 700;
      min-width: 24px;
      text-align: center;
    }
    .sc-cart-item-remove {
      background: transparent;
      border: none;
      color: #ef4444;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }
    .sc-cart-item-remove:hover {
      color: #dc2626;
      transform: scale(1.1);
    }
    
    /* Carrinho vazio */
    .sc-cart-empty {
      text-align: center;
      padding: 60px 30px;
      color: #757575;
    }
    .sc-cart-empty-icon {
      font-size: 60px;
      margin-bottom: 20px;
      opacity: 0.4;
    }
    .sc-cart-empty-text {
      font-size: 16px;
      font-weight: 500;
    }
    
    /* Seção de Bônus */
    .sc-bonus-section {
      padding: 16px 24px;
      background: #ffffff;
      border-top: 1px solid #e0e0e0;
    }
    .sc-bonus-title {
      color: #212121;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sc-bonus-title::before {
      content: "🎁";
    }
    .sc-bonus-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .sc-bonus-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #f8fdf8;
      border-radius: 10px;
      border: 1px solid #c8e6c9;
    }
    .sc-bonus-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 18px;
    }
    .sc-bonus-text {
      color: #212121;
      font-size: 13px;
      font-weight: 500;
    }
    
    /* Footer do carrinho */
    .sc-cart-footer {
      padding: 20px 24px;
      background: #1a1a1a;
      border-top: 1px solid #333;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .sc-cart-total {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sc-cart-total-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
    }
    .sc-cart-total-value {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
    }
    .sc-cart-checkout {
      background: #ffffff;
      border: none;
      color: #1a1a1a;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .sc-cart-checkout:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.25);
    }
    .sc-cart-checkout:disabled {
      background: #444;
      color: #888;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    /* Toast de notificação */
    .sc-toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #212121;
      color: #fff;
      padding: 14px 28px;
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      transition: transform 0.3s ease;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sc-toast.show {
      transform: translateX(-50%) translateY(0);
    }
    .sc-toast::before {
      content: "✓";
      background: #00e676;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #212121;
    }
    
    /* Modal do código do criador */
    .sc-creator-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: #ffffff;
      border-radius: 20px;
      padding: 30px;
      width: 90%;
      max-width: 400px;
      z-index: 1000000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }
    .sc-creator-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .sc-creator-modal-title {
      color: #212121;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .sc-creator-modal-desc {
      color: #757575;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .sc-creator-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .sc-creator-input:focus {
      outline: none;
      border-color: #00c853;
    }
    .sc-creator-modal-btns {
      display: flex;
      gap: 12px;
    }
    .sc-creator-modal-btn {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sc-creator-modal-btn.cancel {
      background: #f5f5f5;
      border: none;
      color: #757575;
    }
    .sc-creator-modal-btn.confirm {
      background: #00e676;
      border: none;
      color: #ffffff;
    }
    .sc-creator-modal-btn:hover {
      transform: translateY(-1px);
    }
    
    /* Mobile */
    @media (max-width: 480px) {
      .sc-cart-sidebar {
        width: 100%;
        right: -100%;
      }
    }
  `;

  // Adiciona os estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Cria o overlay
  const overlay = document.createElement('div');
  overlay.className = 'sc-cart-overlay';
  overlay.onclick = () => window.scCart.close();
  document.body.appendChild(overlay);

  // Cria o sidebar do carrinho
  const sidebar = document.createElement('div');
  sidebar.className = 'sc-cart-sidebar';
  sidebar.innerHTML = `
    <div class="sc-cart-header">
      <div class="sc-cart-title">
        <svg class="sc-cart-title-icon" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 26.0002H5L7.14285 12.0715L20 6.04834V26.0002Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 6.04834L25 10.1126L27 26.0002H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.5239 9.79013L16.5239 8.00974C16.5239 6.20552 15.2184 4.60759 13.3811 5.08582C10.9769 5.71158 10.2382 8.1223 10.2382 11.4349L10.2382 12.4651" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="sc-cart-title-count" id="sc-cart-count">0 itens</span>
      </div>
      <button class="sc-cart-close" onclick="window.scCart.close()">✕</button>
    </div>
    <div class="sc-creator-banner" id="sc-creator-banner" onclick="window.scCart.openCreatorModal()">
      <svg class="sc-creator-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <span class="sc-creator-text" id="sc-creator-text">Inserir código de criador</span>
    </div>
    <div class="sc-cart-items" id="sc-cart-items"></div>
    <div class="sc-cart-footer">
      <div class="sc-cart-total">
        <span class="sc-cart-total-label">Subtotal:</span>
        <span class="sc-cart-total-value" id="sc-cart-total">0,00 R$</span>
      </div>
      <button class="sc-cart-checkout" id="sc-cart-checkout" onclick="window.scCart.checkout()">
        Finalizar a compra
      </button>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Cria o toast
  const toast = document.createElement('div');
  toast.className = 'sc-toast';
  toast.id = 'sc-toast';
  document.body.appendChild(toast);

  // Cria o modal do código do criador
  const creatorModal = document.createElement('div');
  creatorModal.className = 'sc-creator-modal';
  creatorModal.id = 'sc-creator-modal';
  creatorModal.innerHTML = `
    <div class="sc-creator-modal-title">Código do Criador</div>
    <div class="sc-creator-modal-desc">Apoie seu criador favorito inserindo o código abaixo:</div>
    <input type="text" class="sc-creator-input" id="sc-creator-input" placeholder="Digite o código">
    <div class="sc-creator-modal-btns">
      <button class="sc-creator-modal-btn cancel" onclick="window.scCart.closeCreatorModal()">Cancelar</button>
      <button class="sc-creator-modal-btn confirm" onclick="window.scCart.applyCreatorCode()">Aplicar</button>
    </div>
  `;
  document.body.appendChild(creatorModal);

  // Funções do carrinho
  window.scCart = {
    open: function() {
      overlay.classList.add('open');
      sidebar.classList.add('open');
      this.render();
      document.body.style.overflow = 'hidden';
    },
    close: function() {
      overlay.classList.remove('open');
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    },
    add: function(item) {
      const existing = cart.find(i => i.name === item.name);
      if (!existing) {
        item.qty = 1;
        cart.push(item);
        localStorage.setItem('scCart', JSON.stringify(cart));
        this.showToast(`${item.name} adicionado!`);
        this.updateBadge();
      } else {
        existing.qty = (existing.qty || 1) + 1;
        localStorage.setItem('scCart', JSON.stringify(cart));
        this.showToast(`${item.name} +1`);
      }
      this.render();
    },
    remove: function(index) {
      cart.splice(index, 1);
      localStorage.setItem('scCart', JSON.stringify(cart));
      this.render();
      this.updateBadge();
    },
    updateQty: function(index, delta) {
      const item = cart[index];
      const newQty = (item.qty || 1) + delta;
      if (newQty <= 0) {
        // Remove o item se a quantidade for 0
        this.remove(index);
      } else {
        item.qty = newQty;
        localStorage.setItem('scCart', JSON.stringify(cart));
        this.render();
      }
    },
    render: function() {
      const container = document.getElementById('sc-cart-items');
      const totalEl = document.getElementById('sc-cart-total');
      const checkoutBtn = document.getElementById('sc-cart-checkout');
      const countEl = document.getElementById('sc-cart-count');

      // Atualiza contagem
      const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      countEl.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;

      if (cart.length === 0) {
        container.innerHTML = `
          <div class="sc-cart-empty">
            <div class="sc-cart-empty-icon">🛒</div>
            <p class="sc-cart-empty-text">Sua sacola está vazia</p>
          </div>
        `;
        totalEl.textContent = '0,00 R$';
        checkoutBtn.disabled = true;
        return;
      }

      let total = 0;
      container.innerHTML = cart.map((item, index) => {
        const priceStr = item.price || 'R$ 0,00';
        const priceMatch = priceStr.match(/([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace('.', '').replace(',', '.')) : 0;
        const qty = item.qty || 1;
        total += price * qty;
        return `
          <div class="sc-cart-item">
            <img class="sc-cart-item-image" src="${item.image || ''}" alt="${item.name}" onerror="this.style.background='linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'">
            <div class="sc-cart-item-info">
              <div class="sc-cart-item-name">${item.name}</div>
              <div class="sc-cart-item-price">${item.price}</div>
            </div>
            <div class="sc-cart-item-controls">
              <button class="sc-cart-qty-btn" onclick="window.scCart.updateQty(${index}, -1)">−</button>
              <span class="sc-cart-qty-value">${qty}</span>
              <button class="sc-cart-qty-btn" onclick="window.scCart.updateQty(${index}, 1)">+</button>
            </div>
          </div>
        `;
      }).join('');

      totalEl.textContent = `${total.toFixed(2).replace('.', ',')} R$`;
      checkoutBtn.disabled = false;
    },
    updateBadge: function() {
      const buttons = document.querySelectorAll('.CartButton_CartButton__bZo9Y button, .header_cart__bSEVC button, [class*="CartButton"] button');
      const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      buttons.forEach(btn => {
        btn.setAttribute('data-after-content', totalItems.toString());
      });
    },
    showToast: function(message) {
      const t = document.getElementById('sc-toast');
      t.textContent = message;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    },
    openCreatorModal: function() {
      document.getElementById('sc-creator-modal').classList.add('open');
      document.getElementById('sc-creator-input').focus();
    },
    closeCreatorModal: function() {
      document.getElementById('sc-creator-modal').classList.remove('open');
    },
    applyCreatorCode: function() {
      const code = document.getElementById('sc-creator-input').value.trim();
      if (code) {
        creatorCode = code;
        localStorage.setItem('scCreatorCode', code);
        const banner = document.getElementById('sc-creator-banner');
        const text = document.getElementById('sc-creator-text');
        banner.classList.add('sc-creator-applied');
        text.innerHTML = `Código aplicado: <span class="sc-creator-code">${code}</span>`;
        this.closeCreatorModal();
        this.showToast(`Código "${code}" aplicado!`);
      }
    },
    checkout: function() {
      // Redireciona para a página de checkout
      // Fecha o carrinho primeiro
      this.close();
      window.location.href = 'checkout.html';
    }
  };

  // Extrai informações do produto
  function extractProductInfo(element) {
    // Primeiro, tenta encontrar o link do produto
    let card = element.closest('a[href*="/product"]');
    if (!card) {
      card = element.closest('.OfferCard_offerCardContainer__tXsBD, .PassRoyaleCard_Container__BFPbj, [class*="OfferCard"], [class*="Card"], [class*="card"]');
    }
    if (!card) card = element.closest('a');
    if (!card) card = element;
    if (!card) return null;

    // Detecta se é uma evolução
    const isEvolution = card.querySelector('[class*="evolution"], [class*="Evolution"]') !== null;

    // Nome - busca em múltiplos lugares
    let name = '';
    
    // Primeiro tenta h3 (pode conter o nome real)
    const h3El = card.querySelector('h3');
    if (h3El) {
      const text = h3El.textContent.trim();
      // Ignora se for só número ou texto muito curto
      if (text && !/^\d+$/.test(text) && text.length > 2) {
        name = text;
      }
    }
    
    // Se não encontrou, tenta pelo alt da imagem que NÃO seja "product flare"
    if (!name || name.length < 3) {
      const imgs = card.querySelectorAll('img[alt]');
      for (const img of imgs) {
        const alt = img.alt?.toLowerCase() || '';
        // Ignora "product flare", "clock", "icon", e textos curtos/números
        if (alt && 
            alt.length > 3 && 
            !alt.includes('flare') && 
            !alt.includes('clock') && 
            !alt.includes('icon') &&
            !alt.includes('timer') &&
            !/^\d+$/.test(alt)) {
          name = img.alt;  // Usa o original (não lowercase)
          break;
        }
      }
    }
    
    // Se ainda não encontrou, tenta extrair do href
    if (!name || name.length < 3) {
      const href = card.href || card.querySelector('a')?.href || '';
      const match = href.match(/\/product\/([^/?]+)/);
      if (match) {
        // Converte "gems-360" para "Gems 360" ou "evolution-skeleton-army" para "Evolution Skeleton Army"
        name = match[1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    
    // Se ainda não encontrou
    if (!name || name.length < 3) {
      name = isEvolution ? 'Evolução' : 'Produto';
    }

    // Preço - busca em múltiplos lugares
    let price = '0,00 R$';
    
    // 1. Tenta o botão de compra
    const buyButton = card.querySelector('button[data-type="buy"]');
    if (buyButton) {
      const text = buyButton.textContent.trim();
      // Busca padrão XX,XX R$ ou R$ XX,XX
      const match = text.match(/(\d+[,\.]\d{2})\s*R\$|R\$\s*(\d+[,\.]\d{2})/);
      if (match) {
        price = `${match[1] || match[2]} R$`;
      }
    }
    
    // 2. Se não encontrou, busca em qualquer elemento que contenha preço
    if (price === '0,00 R$') {
      const priceElements = card.querySelectorAll('span, p, div');
      for (const el of priceElements) {
        const text = el.textContent.trim();
        const match = text.match(/^(?:R\$\s*)?(\d+[,\.]\d{2})(?:\s*R\$)?$/);
        if (match) {
          price = `${match[1]} R$`;
          break;
        }
      }
    }
    
    // 3. Busca em toda a área do card por texto de preço
    if (price === '0,00 R$') {
      const allText = card.textContent || '';
      const match = allText.match(/(\d+[,\.]\d{2})\s*R\$|R\$\s*(\d+[,\.]\d{2})/);
      if (match) {
        price = `${match[1] || match[2]} R$`;
      }
    }

    // Imagem - busca imagem que NÃO seja "product flare"
    let image = '';
    const allImages = card.querySelectorAll('img[src]');
    for (const img of allImages) {
      const alt = img.alt?.toLowerCase() || '';
      const src = img.src || '';
      // Ignora product flare
      if (alt.includes('flare')) continue;
      // Prioriza event-assets ou game-assets
      if (src.includes('event-assets') || src.includes('game-assets')) {
        image = src;
        break;
      }
    }
    
    // Se não encontrou imagem válida, tenta qualquer uma que não seja flare
    if (!image) {
      for (const img of allImages) {
        const alt = img.alt?.toLowerCase() || '';
        if (!alt.includes('flare') && img.src) {
          image = img.src;
          break;
        }
      }
    }

    console.log('📦 Extraído:', { name, price, isEvolution, image: image ? '✓' : '✗' });
    return { name, price, image, desc: '' };
  }

  // Intercepta cliques
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // Clique no botão do carrinho
    if (target.closest('.CartButton_CartButton__bZo9Y, .header_cart__bSEVC, [class*="CartButton"]')) {
      e.preventDefault();
      e.stopPropagation();
      window.scCart.open();
      return;
    }

    // Clique no botão de compra
    if (target.closest('[class*="BuyButton"], button[data-type="buy"]')) {
      e.preventDefault();
      e.stopPropagation();
      const info = extractProductInfo(target);
      if (info && info.price !== 'R$ 0,00') {
        window.scCart.add(info);
      }
      return;
    }

    // Clique em link de produto (captura TODOS os cliques em links de produto)
    const productLink = target.closest('a[href*="/product"]');
    if (productLink) {
      // Ignora se clicou em um botão dentro do link
      if (target.closest('button')) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      const info = extractProductInfo(productLink);
      console.log('🔍 Clique em produto:', info);
      
      if (info && info.name) {
        window.scCart.add(info);
      } else {
        console.log('⚠️ Não foi possível extrair informações do produto');
      }
      return;
    }

    // Clique em qualquer área do card de produto (fallback)
    const productCard = target.closest('.OfferCard_offerCardContainer__tXsBD, .PassRoyaleCard_Container__BFPbj, [class*="OfferCard"], [class*="ClashRoyaleOfferCard"]');
    if (productCard && !target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      const info = extractProductInfo(productCard);
      if (info && info.name) {
        window.scCart.add(info);
      }
      return;
    }
  }, true);

  // Inicializa
  window.scCart.updateBadge();
  
  // Aplica código salvo
  if (creatorCode) {
    const banner = document.getElementById('sc-creator-banner');
    const text = document.getElementById('sc-creator-text');
    banner.classList.add('sc-creator-applied');
    text.innerHTML = `Código aplicado: <span class="sc-creator-code">${creatorCode}</span>`;
  }
  
  console.log('🛒 Sistema de Carrinho (Tema Claro) carregado!');
})();
