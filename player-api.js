// ==========================================
// CLASH ROYALE PLAYER API - Frontend
// Modal de entrada da tag e exibição de dados
// ==========================================

(function() {
  'use strict';

  // Usa o mesmo servidor (mock-server na porta 3000)
  const API_BASE_URL = '';
  
  // Estilos do modal
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    @font-face {
      font-family: 'Clash Royale';
      src: url('/_next/static/media/clash-heavy.0c306b59.woff2') format('woff2');
      font-weight: 800;
      font-style: normal;
      font-display: swap;
    }
    
    /* Overlay do Modal */
    .cr-player-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cr-player-overlay.open {
      opacity: 1;
      visibility: visible;
    }
    
    /* Modal */
    .cr-player-modal {
      background: linear-gradient(180deg, #1c3e66 0%, #0e2038 100%);
      border-radius: 28px;
      padding: 0;
      width: 90%;
      max-width: 400px;
      text-align: center;
      box-shadow: 
        0 40px 80px -12px rgba(0, 0, 0, 0.7),
        0 0 0 8px rgba(0, 0, 0, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
      border: 4px solid #3c7ab3;
      transform: scale(0.9) translateY(40px);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      position: relative;
    }
    .cr-player-overlay.open .cr-player-modal {
      transform: scale(1) translateY(0);
    }

    /* Modal Header Background */
    .cr-player-modal::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 140px;
      background: url('https://cdn.supercell.com/supercell.com/231214084725/supercell.com/files/games_thumbnail_clashroyale.jpg') center/cover;
      mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
      opacity: 0.4;
      z-index: 0;
    }
    
    /* Conteúdo Container */
    .cr-modal-content {
      position: relative;
      z-index: 1;
      padding: 40px 32px 32px;
    }
    
    /* Logo Imagem */
    .cr-player-logo-img {
      max-width: 160px;
      width: 100%;
      height: auto;
      margin: 0 auto 10px;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
      display: block;
      transition: transform 0.3s ease;
    }
    .cr-player-logo-img:hover {
      transform: scale(1.05);
    }
    
    /* Descrição com nova fonte se possível, ou Inter */
    .cr-player-desc {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      margin-bottom: 24px;
      line-height: 1.5;
      font-weight: 500;
      padding: 0 10px;
    }
    
    /* Input */
    .cr-player-input-group {
      position: relative;
      margin-bottom: 12px;
      transform: scale(1);
      transition: transform 0.2s;
    }
    .cr-player-input-group:focus-within {
      transform: scale(1.02);
    }
    .cr-player-input {
      width: 100%;
      padding: 16px 20px;
      padding-left: 55px;
      border: 3px solid #306090;
      border-radius: 16px;
      font-size: 20px;
      font-family: 'Clash Royale', 'Inter', sans-serif;
      font-weight: 800; /* Use a fonte CR aqui também */
      background: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.2s;
      box-sizing: border-box;
      box-shadow: inset 0 4px 8px rgba(0,0,0,0.2);
    }
    .cr-player-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
      text-transform: none;
      letter-spacing: normal;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }
    .cr-player-input:focus {
      outline: none;
      border-color: #4da0ff;
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 
        inset 0 4px 8px rgba(0,0,0,0.2),
        0 0 0 4px rgba(77, 160, 255, 0.2);
    }
    .cr-player-hash {
      position: absolute;
      left: 22px;
      top: 50%;
      transform: translateY(-50%);
      color: #ffd700;
      font-size: 24px;
      font-weight: 900;
      text-shadow: 0 2px 0 rgba(0,0,0,0.5);
      font-family: 'Clash Royale', sans-serif;
    }
    
    /* Erro */
    .cr-player-error {
      color: #ff6b6b;
      font-size: 13px;
      margin-bottom: 20px;
      background: rgba(255, 107, 107, 0.1);
      padding: 8px 12px;
      border-radius: 8px;
      display: none;
      font-weight: 600;
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    .cr-player-error.show {
      display: block;
    }
    
    /* Botão */
    .cr-player-btn {
      width: 100%;
      padding: 18px;
      background: linear-gradient(180deg, #53cbf1 0%, #2b99da 100%);
      border: none;
      border-radius: 16px;
      color: #fff;
      font-size: 18px;
      font-family: 'Clash Royale', 'Inter', sans-serif;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 
        0 6px 0 #1a6cb0,
        0 12px 12px rgba(0, 0, 0, 0.3);
      position: relative;
      top: 0;
      text-shadow: 0 2px 0 rgba(0,0,0,0.2);
    }
    .cr-player-btn:hover {
      background: linear-gradient(180deg, #65d5f6 0%, #3ca8e6 100%);
      transform: translateY(-2px);
      box-shadow: 
        0 8px 0 #1a6cb0,
        0 16px 20px rgba(0, 0, 0, 0.4);
    }
    .cr-player-btn:active {
      transform: translateY(4px);
      box-shadow: 
        0 2px 0 #1a6cb0,
        0 4px 4px rgba(0, 0, 0, 0.3);
    }
    .cr-player-btn:disabled {
      background: #4a5d70;
      color: #aaa;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    /* Botão Amarelo (Confirmar) */
    .cr-player-btn.yellow {
      background: linear-gradient(180deg, #ffdc00 0%, #ffb700 100%);
      color: #3e2600;
      text-shadow: none;
      box-shadow: 
        0 6px 0 #cc8400,
        0 12px 12px rgba(0, 0, 0, 0.3);
    }
    .cr-player-btn.yellow:hover {
      background: linear-gradient(180deg, #ffe545 0%, #ffc400 100%);
      box-shadow: 
        0 8px 0 #cc8400,
        0 16px 20px rgba(0, 0, 0, 0.4);
    }
    .cr-player-btn.yellow:active {
      box-shadow: 
        0 2px 0 #cc8400,
        0 4px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Loading */
    .cr-player-btn.loading {
      pointer-events: none;
      opacity: 0.8;
    }
    .cr-player-btn.loading::after {
      content: "";
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      margin-left: 12px;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Dica */
    .cr-player-hint {
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
      margin-top: 24px;
      font-weight: 500;
    }
    
    /* Player Info Display (após buscar) */
    .cr-player-info {
      display: none;
      text-align: center;
      padding-top: 10px;
    }
    .cr-player-info.show {
      display: block;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .cr-player-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .cr-player-avatar {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #4da0ff 0%, #2a5a8c 100%);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #fff;
      border: 4px solid #fff;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      font-family: 'Clash Royale', sans-serif;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }
    .cr-player-name {
      color: #ffffff;
      font-size: 26px;
      font-family: 'Clash Royale', sans-serif;
      font-weight: 900;
      margin-bottom: 4px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .cr-player-tag-display {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 12px;
      border-radius: 12px;
      color: #ffd700;
      font-size: 14px;
      font-family: 'Inter', monospace;
      font-weight: 700;
      letter-spacing: 1px;
    }
    
    .cr-player-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .cr-player-stat {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      padding: 12px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .cr-player-stat-value {
      color: #fff;
      font-size: 22px;
      font-family: 'Clash Royale', sans-serif;
      font-weight: 800;
      margin-bottom: 2px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .cr-player-stat-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    /* Arena Info Style */
    .cr-arena-info {
        background: linear-gradient(90deg, rgba(42, 90, 140, 0.3) 0%, rgba(42, 90, 140, 0.1) 100%);
        border-radius: 16px;
        padding: 16px;
        margin-top: 15px;
        margin-bottom: 25px;
        display: flex;
        align-items: center;
        gap: 15px;
        border: 1px solid rgba(255,255,255,0.1);
        text-align: left;
    }
    
    .cr-arena-icon {
        width: 48px;
        height: 48px;
        background: rgba(0,0,0,0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .cr-arena-details {
        flex-grow: 1;
    }

    .cr-arena-name {
        color: #fff;
        font-family: 'Clash Royale', sans-serif;
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 2px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .cr-arena-label {
        font-size: 11px;
        color: #ffd700;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    
    .cr-player-clan {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,0,0,0.25);
      padding: 6px 16px;
      border-radius: 20px;
      margin-top: -5px;
      margin-bottom: 15px;
    }
    .cr-player-clan-icon {
        font-size: 14px;
    }
    .cr-player-clan-name {
      color: #fff;
      font-weight: 600;
      font-size: 14px;
    }
  `;

  // Adiciona estilos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Cria o modal
  const overlay = document.createElement('div');
  overlay.className = 'cr-player-overlay';
  overlay.id = 'cr-player-overlay';
  overlay.innerHTML = `
    <div class="cr-player-modal">
      <div class="cr-modal-content">
        <div id="cr-input-section">
          <!-- Logo Imagem -->
          <img src="/_next/static/media/logo.e102c5d9.png" alt="Clash Royale" class="cr-player-logo-img">
          
          <p class="cr-player-desc">Insira sua Tag de Jogador para acessar ofertas personalizadas.</p>
          
          <div class="cr-player-input-group">
            <span class="cr-player-hash">#</span>
            <input type="text" class="cr-player-input" id="cr-player-tag-input" placeholder="TAG DO JOGADOR" maxlength="12">
          </div>
          
          <p class="cr-player-error" id="cr-player-error">Tag inválida. Tente novamente.</p>
          
          <button class="cr-player-btn" id="cr-player-btn">Buscar Jogador</button>
          
          <p class="cr-player-hint">Sua tag está no perfil do jogo, logo abaixo do nome.</p>
        </div>
        
        <div class="cr-player-info" id="cr-player-info">
            <div class="cr-player-header">
                <div class="cr-player-avatar" id="cr-player-avatar"></div>
                <div class="cr-player-name" id="cr-player-name">-</div>
                <div class="cr-player-tag-display" id="cr-player-tag-display">#-</div>
            </div>
          
            <div class="cr-player-clan" id="cr-player-clan" style="display:none;">
                <span class="cr-player-clan-icon">🛡️</span>
                <span class="cr-player-clan-name" id="cr-player-clan-name"></span>
            </div>

            <div class="cr-player-stats">
                <div class="cr-player-stat">
                    <div class="cr-player-stat-value" id="cr-player-trophies">0</div>
                    <div class="cr-player-stat-label">Troféus 🏆</div>
                </div>
                <div class="cr-player-stat">
                    <div class="cr-player-stat-value" id="cr-player-level">0</div>
                    <div class="cr-player-stat-label">Nível</div>
                </div>
            </div>
          
            <div class="cr-arena-info">
                <div class="cr-arena-icon">🏰</div>
                <div class="cr-arena-details">
                    <div class="cr-arena-label">Arena Atual</div>
                    <div class="cr-arena-name" id="cr-player-arena">Carregando...</div>
                </div>
            </div>

            <button class="cr-player-btn yellow" id="cr-player-confirm-btn">Confirmar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Estado
  let playerData = JSON.parse(localStorage.getItem('crPlayerData') || 'null');

  // Funções
  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.getElementById('cr-player-tag-input').focus();
    }, 300);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showError(message) {
    const errorEl = document.getElementById('cr-player-error');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    if (navigator.vibrate) navigator.vibrate(200);
  }

  function hideError() {
    document.getElementById('cr-player-error').classList.remove('show');
  }

  function showPlayerInfo(data) {
    document.getElementById('cr-input-section').style.display = 'none';
    document.getElementById('cr-player-info').classList.add('show');
    
    document.getElementById('cr-player-name').textContent = data.name;
    document.getElementById('cr-player-tag-display').textContent = data.tag;
    document.getElementById('cr-player-trophies').textContent = (data.trophies || 0).toLocaleString();
    document.getElementById('cr-player-level').textContent = data.expLevel || 1;
    
    // Arena
    const arenaName = data.arena ? data.arena.name : 'Desconhecida';
    document.getElementById('cr-player-arena').textContent = arenaName;

    // Avatar - usa primeira letra do nome
    const avatar = document.getElementById('cr-player-avatar');
    avatar.textContent = data.name.charAt(0).toUpperCase();
    
    // Clã
    const clanContainer = document.getElementById('cr-player-clan');
    if (data.clan) {
      clanContainer.style.display = 'inline-flex';
      document.getElementById('cr-player-clan-name').textContent = data.clan.name;
    } else {
      clanContainer.style.display = 'none';
    }
  }

  async function fetchPlayer(tag) {
    const btn = document.getElementById('cr-player-btn');
    btn.classList.add('loading');
    const originalText = btn.textContent;
    btn.textContent = 'Buscando...';
    hideError();

    try {
      tag = tag.replace('#', '').replace(/\s/g, '').toUpperCase();
      
      if (!tag || tag.length < 3) {
        throw new Error('Tag inválida');
      }

      const response = await fetch(`${API_BASE_URL}/player?tag=${tag}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Jogador não encontrado!');
        }
        throw new Error(data.message || 'Erro ao buscar');
      }

      playerData = data;
      localStorage.setItem('crPlayerData', JSON.stringify(data));
      localStorage.setItem('crPlayerTag', tag);

      showPlayerInfo(data);

    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      showError(error.message || 'Erro de conexão');
      btn.classList.remove('loading');
      btn.textContent = originalText;
    }
  }

  document.getElementById('cr-player-btn').addEventListener('click', () => {
    const tag = document.getElementById('cr-player-tag-input').value.trim();
    if (tag) {
      fetchPlayer(tag);
    } else {
      showError('Digite sua TAG');
    }
  });

  document.getElementById('cr-player-tag-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('cr-player-btn').click();
    }
  });

  document.getElementById('cr-player-tag-input').addEventListener('input', () => {
    hideError();
  });

  document.getElementById('cr-player-confirm-btn').addEventListener('click', () => {
    closeModal();
    window.dispatchEvent(new CustomEvent('playerDataLoaded', { detail: playerData }));
  });

  window.crPlayerAPI = {
    openModal: openModal,
    getPlayerData: () => playerData,
    getPlayerTag: () => localStorage.getItem('crPlayerTag'),
    clearData: () => {
      localStorage.removeItem('crPlayerData');
      localStorage.removeItem('crPlayerTag');
      playerData = null;
    }
  };

  if (!playerData) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(openModal, 800);
      });
    } else {
      setTimeout(openModal, 800);
    }
  } else {
    console.log('[CR Player] Jogador carregado:', playerData.name, playerData.tag);
    window.dispatchEvent(new CustomEvent('playerDataLoaded', { detail: playerData }));
  }

})();
