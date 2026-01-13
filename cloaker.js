/**
 * Cloaker Middleware para Express
 * Redireciona para Google se:
 * - User-Agent for de bot
 * - Não estiver em mobile
 * - Não tiver UTMs válidas do Facebook/Ads
 */

const REDIRECT_URL = "https://www.google.com";

// Lista de bots conhecidos - EVITAR padrões genéricos que pegam navegadores reais
const BOT_PATTERNS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "slackbot",
  "telegrambot",
  "linkedinbot",
  "googlebot",
  "bingbot",
  "adsbot-google",
  "crawl",
  "spider",
  "curl/",
  "wget/",
  "python-requests",
  "python-urllib",
  "httpie",
  "postman",
  "insomnia",
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "lighthouse",
  "pagespeed",
  "gtmetrix",
  "pingdom",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "screaming frog",
  "sitebulb",
  "yandexbot",
  "baiduspider",
  "duckduckbot",
  "bytespider",
  "petalbot",
  "applebot",
  "amazonbot",
  "gptbot",
  "chatgpt",
  "claudebot",
  "anthropic",
  "ccbot",
];

// Padrão para detectar mobile
const MOBILE_PATTERN =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;

/**
 * Verifica se o User-Agent é de um bot
 */
function isBot(userAgent) {
  if (!userAgent) return true; // Sem UA = suspeito
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((bot) => ua.includes(bot));
}

/**
 * Verifica se é um dispositivo mobile
 */
function isMobile(userAgent) {
  if (!userAgent) return false;
  return MOBILE_PATTERN.test(userAgent);
}

/**
 * Verifica se tem UTMs válidas (tráfego de ads)
 */
function hasValidUtms(query, referer) {
  const fbclid = query.fbclid;
  const utmSource = query.utm_source?.toLowerCase();
  const utmMedium = query.utm_medium?.toLowerCase();
  const utmCampaign = query.utm_campaign;

  // Verifica se veio do Facebook
  const isFromFacebook =
    fbclid !== undefined ||
    utmSource === "facebook" ||
    utmSource === "fb" ||
    utmSource === "ig" ||
    utmSource === "instagram" ||
    (referer &&
      (referer.includes("facebook.com") || referer.includes("instagram.com")));

  // Verifica se é tráfego de ads
  const isAdTraffic =
    fbclid !== undefined ||
    utmMedium === "paid" ||
    utmMedium === "cpc" ||
    utmMedium === "ppc" ||
    utmMedium === "paidsocial" ||
    utmMedium === "paid_social";

  // Precisa ter campaign definida junto com fonte/mídia
  const hasCampaign = utmCampaign !== undefined && utmCampaign !== "";

  // Aceita se tem fbclid OU (fonte válida + mídia válida + campanha)
  return fbclid !== undefined || (isFromFacebook && isAdTraffic && hasCampaign);
}

/**
 * Middleware principal do Cloaker
 */
function cloakerMiddleware(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  const referer = req.headers["referer"] || "";

  // Log para debug (pode remover em produção)
  const debugInfo = {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: userAgent.substring(0, 100),
    path: req.path,
    query: req.query,
    referer: referer,
  };

  // 1. Verifica se é bot
  if (isBot(userAgent)) {
    console.log("🤖 Cloaker: Bot detectado, redirecionando...", debugInfo.ip);
    return res.redirect(REDIRECT_URL);
  }

  // 2. Verifica se é mobile
  if (!isMobile(userAgent)) {
    console.log("💻 Cloaker: Não é mobile, redirecionando...", debugInfo.ip);
    return res.redirect(REDIRECT_URL);
  }

  // 3. Verifica UTMs
  if (!hasValidUtms(req.query, referer)) {
    console.log("🔗 Cloaker: UTMs inválidas, redirecionando...", debugInfo.ip);
    return res.redirect(REDIRECT_URL);
  }

  // Passou em todas as verificações - permite acesso
  console.log("✅ Cloaker: Acesso permitido", debugInfo.ip);
  next();
}

/**
 * Versão configurável do middleware
 * @param {Object} options - Opções de configuração
 * @param {string} options.redirectUrl - URL para redirecionar (default: Google)
 * @param {boolean} options.enabled - Se o cloaker está ativo (default: true)
 * @param {boolean} options.debug - Se deve logar informações de debug (default: true)
 * @param {string} options.bypassKey - Chave secreta para bypass (default: "clashcerto123")
 */
function createCloaker(options = {}) {
  const {
    redirectUrl = REDIRECT_URL,
    enabled = true,
    debug = true,
    bypassKey = "clashcerto123",
  } = options;

  return function (req, res, next) {
    // Se desabilitado, passa direto
    if (!enabled) {
      return next();
    }

    // Bypass secreto - adicione ?bypass=clashcerto123 na URL
    if (req.query.bypass === bypassKey) {
      console.log("🔓 Cloaker: Bypass ativado!");
      return next();
    }

    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || "";

    if (debug) {
      console.log("\n=== CLOAKER DEBUG ===");
      console.log("📱 User-Agent:", userAgent);
      console.log("🔗 Referer:", referer);
      console.log("📊 Query params:", req.query);
      console.log("🌐 IP:", req.ip || req.connection?.remoteAddress);
    }

    // 1. Verifica se é bot
    const botDetected = isBot(userAgent);
    if (botDetected) {
      if (debug) {
        console.log("🤖 Cloaker: Bot detectado!");
        console.log("   UA checado:", userAgent);
      }
      return res.redirect(redirectUrl);
    }

    // 2. Verifica se é mobile
    const mobileDetected = isMobile(userAgent);
    if (!mobileDetected) {
      if (debug) {
        console.log("💻 Cloaker: Não é mobile!");
        console.log("   UA checado:", userAgent);
      }
      return res.redirect(redirectUrl);
    }

    // 3. Verifica UTMs
    const validUtms = hasValidUtms(req.query, referer);
    if (!validUtms) {
      if (debug) {
        console.log("🔗 Cloaker: UTMs inválidas!");
        console.log("   fbclid:", req.query.fbclid);
        console.log("   utm_source:", req.query.utm_source);
        console.log("   utm_medium:", req.query.utm_medium);
        console.log("   utm_campaign:", req.query.utm_campaign);
      }
      return res.redirect(redirectUrl);
    }

    if (debug) console.log("✅ Cloaker: Acesso permitido\n");
    next();
  };
}

module.exports = {
  cloakerMiddleware,
  createCloaker,
  isBot,
  isMobile,
  hasValidUtms,
};
