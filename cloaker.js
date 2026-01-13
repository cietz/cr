/**
 * Cloaker Middleware para Express
 * Redireciona para Google se:
 * - User-Agent for de bot
 * - Não estiver em mobile
 * - Não tiver UTMs válidas do Facebook/Ads
 */

const REDIRECT_URL = "https://www.google.com";

// Lista de bots conhecidos
const BOT_PATTERNS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "slackbot",
  "whatsapp",
  "telegrambot",
  "linkedinbot",
  "googlebot",
  "bingbot",
  "adsbot",
  "crawler",
  "bot",
  "spider",
  "curl",
  "wget",
  "python",
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
  "semrush",
  "ahrefs",
  "moz",
  "screaming frog",
  "sitebulb",
  "yandex",
  "baidu",
  "duckduckbot",
  "bytespider",
  "petalbot",
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
 */
function createCloaker(options = {}) {
  const { redirectUrl = REDIRECT_URL, enabled = true, debug = true } = options;

  return function (req, res, next) {
    // Se desabilitado, passa direto
    if (!enabled) {
      return next();
    }

    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || "";

    // 1. Verifica se é bot
    if (isBot(userAgent)) {
      if (debug) console.log("🤖 Cloaker: Bot detectado");
      return res.redirect(redirectUrl);
    }

    // 2. Verifica se é mobile
    if (!isMobile(userAgent)) {
      if (debug) console.log("💻 Cloaker: Não é mobile");
      return res.redirect(redirectUrl);
    }

    // 3. Verifica UTMs
    if (!hasValidUtms(req.query, referer)) {
      if (debug) console.log("🔗 Cloaker: UTMs inválidas");
      return res.redirect(redirectUrl);
    }

    if (debug) console.log("✅ Cloaker: Acesso permitido");
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
