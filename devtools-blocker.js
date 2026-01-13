/**
 * DevTools Blocker
 * Detecta e bloqueia o uso de DevTools
 */

(function () {
  "use strict";

  // Redireciona para Google se DevTools for detectado
  const REDIRECT_URL = "https://www.google.com";

  let devtoolsOpen = false;
  let redirected = false;

  // Função para redirecionar
  function redirectToGoogle() {
    if (redirected) return;
    redirected = true;
    window.location.href = REDIRECT_URL;
  }

  // Método 1: Detecta pela diferença de tamanho da janela
  const threshold = 160;
  let checkDevTools = function () {
    if (redirected) return;

    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      devtoolsOpen = true;
      redirectToGoogle();
    }
  };

  // Método 2: Detecta debug usando console
  const devtools = { open: false, orientation: null };
  const detectDevTools = function () {
    if (redirected) return;

    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? "vertical" : "horizontal";

    if (
      !(heightThreshold && widthThreshold) &&
      ((window.Firebug &&
        window.Firebug.chrome &&
        window.Firebug.chrome.isInitialized) ||
        widthThreshold ||
        heightThreshold)
    ) {
      if (!devtools.open || devtools.orientation !== orientation) {
        devtoolsOpen = true;
        redirectToGoogle();
      }

      devtools.open = true;
      devtools.orientation = orientation;
    } else {
      devtools.open = false;
      devtools.orientation = null;
    }
  };

  // Método 3: Detecta debugger
  function detectDebugger() {
    if (redirected) return;

    const before = new Date();
    debugger; // eslint-disable-line no-debugger
    const after = new Date();

    if (after - before > 100) {
      devtoolsOpen = true;
      redirectToGoogle();
    }
  }

  // Método 4: Console.log override
  const element = new Image();
  Object.defineProperty(element, "id", {
    get: function () {
      devtoolsOpen = true;
      redirectToGoogle();
      throw new Error("DevTools detected");
    },
  });

  // Método 5: Detecta via toString
  const devtoolsDetector = function () {
    if (redirected) return;

    const startTime = performance.now();
    const check = /./;
    check.toString = function () {
      devtoolsOpen = true;
      redirectToGoogle();
    };
    console.log("%c", check);
    const endTime = performance.now();

    if (endTime - startTime > 0.5) {
      redirectToGoogle();
    }
  };

  // Desabilita teclas de atalho
  document.addEventListener("keydown", function (e) {
    if (redirected) return;

    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      redirectToGoogle();
      return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)
    ) {
      e.preventDefault();
      redirectToGoogle();
      return false;
    }

    // Ctrl+U (view source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      redirectToGoogle();
      return false;
    }

    // Ctrl+S (salvar página)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
  });

  // Desabilita menu de contexto (botão direito)
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  // Desabilita seleção de texto
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
    return false;
  });

  // Desabilita copiar
  document.addEventListener("copy", function (e) {
    e.preventDefault();
    return false;
  });

  // Bloqueia Ctrl+A
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.keyCode === 65) {
      e.preventDefault();
      return false;
    }
  });

  // Loop de verificação contínua
  setInterval(checkDevTools, 500);
  setInterval(detectDevTools, 500);
  setInterval(detectDebugger, 1000);
  setInterval(devtoolsDetector, 1000);

  // Verifica ao redimensionar janela
  window.addEventListener("resize", function () {
    checkDevTools();
    detectDevTools();
  });

  // Bloqueia console.log para usuários
  const noop = function () {};
  const methods = [
    "log",
    "debug",
    "info",
    "warn",
    "error",
    "table",
    "trace",
    "dir",
    "group",
    "groupCollapsed",
    "groupEnd",
    "clear",
  ];

  methods.forEach(function (method) {
    console[method] = noop;
  });

  // Anti-tamper: verifica se o script foi modificado
  Object.freeze(window);

  // Detecta ferramentas de automação
  if (window.navigator.webdriver) {
    redirectToGoogle();
  }

  // Detecta headless browsers
  if (navigator.plugins.length === 0 || !navigator.plugins) {
    if (!window.chrome || !window.chrome.runtime) {
      // Possível headless Chrome
      setTimeout(redirectToGoogle, 2000);
    }
  }

  console.log("🔒 DevTools protection enabled");
})();
