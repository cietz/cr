/**
 * UTM Capture Script
 * Captura parâmetros UTM da URL e salva no localStorage
 * Este script deve ser incluído em todas as páginas de entrada do site
 */

(function () {
  "use strict";

  /**
   * Captura parâmetros UTM e outros parâmetros de tracking da URL
   */
  function captureUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    const params = {
      src: urlParams.get("src") || null,
      sck: urlParams.get("sck") || null,
      utm_source: urlParams.get("utm_source") || null,
      utm_campaign: urlParams.get("utm_campaign") || null,
      utm_medium: urlParams.get("utm_medium") || null,
      utm_content: urlParams.get("utm_content") || null,
      utm_term: urlParams.get("utm_term") || null,
    };

    // Verifica se há algum parâmetro de tracking
    const hasTrackingParams = Object.values(params).some((v) => v !== null);

    if (hasTrackingParams) {
      // Salva no localStorage
      localStorage.setItem("utmParams", JSON.stringify(params));

      // Salva timestamp de captura
      localStorage.setItem("utmCaptureTime", Date.now().toString());

      // Salva URL de referência
      if (document.referrer) {
        localStorage.setItem("utmReferrer", document.referrer);
      }

      console.log("📊 UTM Parameters capturados:", params);
      console.log("🔗 Referrer:", document.referrer);

      return params;
    } else {
      // Se não tem parâmetros na URL, verifica se já existe no localStorage
      const savedParams = localStorage.getItem("utmParams");
      if (savedParams) {
        console.log("📊 UTM Parameters carregados do localStorage");
        return JSON.parse(savedParams);
      }

      console.log("⚠️ Nenhum parâmetro UTM encontrado");
      return params;
    }
  }

  /**
   * Retorna os parâmetros UTM salvos
   */
  function getStoredUTMParameters() {
    const savedParams = localStorage.getItem("utmParams");
    if (savedParams) {
      return JSON.parse(savedParams);
    }
    return null;
  }

  /**
   * Limpa parâmetros UTM salvos (útil para testes)
   */
  function clearUTMParameters() {
    localStorage.removeItem("utmParams");
    localStorage.removeItem("utmCaptureTime");
    localStorage.removeItem("utmReferrer");
    console.log("🗑️ Parâmetros UTM limpos");
  }

  /**
   * Anexa parâmetros UTM a uma URL
   */
  function appendUTMToURL(url, params) {
    const urlObj = new URL(url, window.location.origin);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null) {
          urlObj.searchParams.set(key, params[key]);
        }
      });
    }

    return urlObj.toString();
  }

  /**
   * Verifica se os parâmetros UTM estão expirados (opcional)
   * Por padrão, expira após 30 dias
   */
  function areUTMParametersExpired(expirationDays = 30) {
    const captureTime = localStorage.getItem("utmCaptureTime");
    if (!captureTime) return true;

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const expirationTime = parseInt(captureTime) + expirationDays * dayInMs;

    return now > expirationTime;
  }

  // Executa captura automaticamente ao carregar a página
  const currentUTM = captureUTMParameters();

  // Expõe funções globalmente
  window.UTMCapture = {
    capture: captureUTMParameters,
    get: getStoredUTMParameters,
    clear: clearUTMParameters,
    appendToURL: appendUTMToURL,
    isExpired: areUTMParametersExpired,
    current: currentUTM,
  };

  // Log de debug
  console.log("📊 UTM Capture inicializado");

  // Adiciona listener para links internos para propagar UTMs
  document.addEventListener("DOMContentLoaded", function () {
    const internalLinks = document.querySelectorAll(
      'a[href^="/"], a[href^="./"], a[href^="../"]'
    );

    internalLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const storedUTM = getStoredUTMParameters();
        if (storedUTM) {
          const currentHref = this.getAttribute("href");
          if (currentHref && !currentHref.includes("utm_")) {
            // Não modifica a URL, apenas garante que UTMs estão no localStorage
            console.log("📊 UTMs serão propagados via localStorage");
          }
        }
      });
    });
  });
})();
