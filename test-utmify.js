/**
 * Script de Teste da Integração UTMify
 * Execute este arquivo no console do navegador para testar a integração
 */

(function () {
  "use strict";

  console.log("🧪 Iniciando testes da integração UTMify...\n");

  let testsPass = 0;
  let testsFail = 0;

  function test(name, condition, errorMsg) {
    if (condition) {
      console.log(`✅ ${name}`);
      testsPass++;
      return true;
    } else {
      console.error(`❌ ${name}`);
      if (errorMsg) console.error(`   Erro: ${errorMsg}`);
      testsFail++;
      return false;
    }
  }

  // ==========================================
  // TESTES DE SCRIPTS
  // ==========================================
  console.log("\n📦 Testando carregamento de scripts...\n");

  test(
    "Script utm-capture.js carregado",
    typeof window.UTMCapture !== "undefined",
    "O arquivo utm-capture.js não foi carregado. Verifique se está incluído no HTML."
  );

  test(
    "Script utmify-integration.js carregado",
    typeof window.UTMifyTracker !== "undefined",
    "O arquivo utmify-integration.js não foi carregado. Verifique se está incluído no checkout.html."
  );

  // ==========================================
  // TESTES DE CAPTURA DE UTM
  // ==========================================
  console.log("\n🎯 Testando captura de UTMs...\n");

  if (typeof window.UTMCapture !== "undefined") {
    const utmData = window.UTMCapture.current;

    test(
      "UTMCapture.current existe",
      utmData !== null && typeof utmData === "object",
      "UTMCapture.current não retornou um objeto válido"
    );

    test(
      "UTMCapture.get() funciona",
      typeof window.UTMCapture.get === "function",
      "Método get() não está disponível"
    );

    test(
      "UTMCapture.clear() funciona",
      typeof window.UTMCapture.clear === "function",
      "Método clear() não está disponível"
    );

    // Testa se há UTMs na URL atual
    const urlParams = new URLSearchParams(window.location.search);
    const hasUTM =
      urlParams.has("utm_source") ||
      urlParams.has("utm_campaign") ||
      urlParams.has("utm_medium");

    if (hasUTM) {
      console.log("ℹ️  UTMs detectados na URL atual:");
      console.log("   utm_source:", urlParams.get("utm_source"));
      console.log("   utm_campaign:", urlParams.get("utm_campaign"));
      console.log("   utm_medium:", urlParams.get("utm_medium"));
    } else {
      console.log(
        "⚠️  Nenhum UTM na URL atual. Adicione ?utm_source=TEST para testar"
      );
    }
  }

  // ==========================================
  // TESTES DO TRACKER
  // ==========================================
  console.log("\n🔧 Testando UTMifyTracker...\n");

  if (typeof window.UTMifyTracker !== "undefined") {
    try {
      const tracker = new UTMifyTracker({
        platform: "TestPlatform",
        isTestMode: true,
      });

      test(
        "UTMifyTracker instancia criada",
        tracker !== null,
        "Não foi possível criar instância do tracker"
      );

      test(
        "Método generateOrderId() existe",
        typeof tracker.generateOrderId === "function",
        "Método generateOrderId() não encontrado"
      );

      test(
        "Método formatDateUTC() existe",
        typeof tracker.formatDateUTC === "function",
        "Método formatDateUTC() não encontrado"
      );

      test(
        "Método sendOrder() existe",
        typeof tracker.sendOrder === "function",
        "Método sendOrder() não encontrado"
      );

      // Testa geração de Order ID
      const orderId = tracker.generateOrderId();
      test(
        "generateOrderId() retorna string válida",
        typeof orderId === "string" && orderId.length > 0,
        "Order ID gerado é inválido"
      );

      console.log("   Order ID de exemplo:", orderId);

      // Testa formatação de data
      const dateUTC = tracker.formatDateUTC(new Date());
      test(
        "formatDateUTC() retorna formato correto",
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateUTC),
        "Formato de data inválido"
      );

      console.log("   Data UTC de exemplo:", dateUTC);

      // Testa conversão para centavos
      const cents = tracker.toCents(29.9);
      test(
        "toCents() converte corretamente",
        cents === 2990,
        "Conversão para centavos falhou"
      );
    } catch (error) {
      console.error("❌ Erro ao testar UTMifyTracker:", error);
      testsFail++;
    }
  }

  // ==========================================
  // TESTES DE LOCALSTORAGE
  // ==========================================
  console.log("\n💾 Testando localStorage...\n");

  try {
    // Testa se localStorage está disponível
    test(
      "localStorage está disponível",
      typeof localStorage !== "undefined",
      "localStorage não está disponível neste navegador"
    );

    // Verifica se há UTMs salvos
    const savedUTMs = localStorage.getItem("utmParams");
    test(
      "UTMs salvos no localStorage",
      savedUTMs !== null,
      "Nenhum UTM salvo. Acesse uma URL com UTMs primeiro."
    );

    if (savedUTMs) {
      const utmObj = JSON.parse(savedUTMs);
      console.log("   UTMs salvos:", utmObj);
    }

    // Verifica timestamp de captura
    const captureTime = localStorage.getItem("utmCaptureTime");
    if (captureTime) {
      const date = new Date(parseInt(captureTime));
      console.log("   Capturados em:", date.toLocaleString("pt-BR"));
    }
  } catch (error) {
    console.error("❌ Erro ao testar localStorage:", error);
    testsFail++;
  }

  // ==========================================
  // TESTE DE CONEXÃO COM PROXY
  // ==========================================
  console.log("\n🌐 Testando conexão com proxy...\n");

  fetch("http://localhost:3001/health")
    .then((response) => response.json())
    .then((data) => {
      test(
        "Servidor proxy respondendo",
        data.status === "OK",
        "Servidor proxy não está respondendo corretamente"
      );
      console.log("   Status:", data.status);
      console.log("   Serviço:", data.service);
    })
    .catch((error) => {
      console.error("❌ Proxy não está rodando");
      console.error("   Execute: npm run utmify");
      testsFail++;
    })
    .finally(() => {
      // ==========================================
      // RESULTADO FINAL
      // ==========================================
      console.log("\n" + "=".repeat(50));
      console.log("📊 RESULTADO DOS TESTES");
      console.log("=".repeat(50));
      console.log(`✅ Passou: ${testsPass}`);
      console.log(`❌ Falhou: ${testsFail}`);
      console.log("=".repeat(50));

      if (testsFail === 0) {
        console.log("\n🎉 TODOS OS TESTES PASSARAM!");
        console.log("Sua integração UTMify está funcionando corretamente.\n");
      } else {
        console.log("\n⚠️  ALGUNS TESTES FALHARAM");
        console.log("Verifique os erros acima e corrija os problemas.\n");
      }

      // ==========================================
      // INSTRUÇÕES
      // ==========================================
      console.log("📝 PRÓXIMOS PASSOS:");
      console.log("");
      console.log("1. Se o proxy não está rodando:");
      console.log("   npm run utmify");
      console.log("");
      console.log("2. Para testar com UTMs:");
      console.log(
        "   " + window.location.origin + "/?utm_source=FB&utm_campaign=TESTE"
      );
      console.log("");
      console.log("3. Para limpar UTMs e testar novamente:");
      console.log("   window.UTMCapture.clear()");
      console.log("");
      console.log("4. Para ver UTMs salvos:");
      console.log("   window.UTMCapture.get()");
      console.log("");
    });
})();

// ==========================================
// FUNÇÕES AUXILIARES PARA TESTES MANUAIS
// ==========================================

window.testUTMify = {
  // Testa envio de pedido (modo teste)
  testOrder: async function () {
    console.log("🧪 Testando envio de pedido...");

    const tracker = new UTMifyTracker({
      platform: "TestPlatform",
      isTestMode: true,
    });

    const orderId = tracker.generateOrderId();

    const result = await tracker.createPendingOrder(
      orderId,
      {
        name: "Teste Usuario",
        email: "teste@example.com",
        phone: "11999999999",
        document: "12345678900",
        country: "BR",
      },
      [
        {
          id: "test-product-1",
          name: "Produto Teste",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: 1000,
        },
      ],
      1000,
      30
    );

    console.log("Resultado:", result);
    return result;
  },

  // Mostra UTMs atuais
  showUTMs: function () {
    const utms = window.UTMCapture.get();
    console.log("📊 UTMs salvos:");
    console.table(utms);
    return utms;
  },

  // Simula captura de UTMs
  simulateUTMs: function () {
    const testUTMs = {
      src: null,
      sck: null,
      utm_source: "TESTE",
      utm_campaign: "CAMPANHA_TESTE",
      utm_medium: "CPC",
      utm_content: "ANUNCIO_1",
      utm_term: "teste",
    };

    localStorage.setItem("utmParams", JSON.stringify(testUTMs));
    console.log("✅ UTMs de teste salvos!");
    console.table(testUTMs);
    return testUTMs;
  },

  // Limpa tudo
  reset: function () {
    window.UTMCapture.clear();
    console.log("🗑️  UTMs limpos. Recarregue a página para capturar novos.");
  },
};

console.log("\n💡 DICA: Use window.testUTMify para testes manuais:");
console.log("   - testUTMify.showUTMs()     → Mostra UTMs salvos");
console.log("   - testUTMify.simulateUTMs() → Cria UTMs de teste");
console.log("   - testUTMify.testOrder()    → Testa envio de pedido");
console.log("   - testUTMify.reset()        → Limpa tudo");
