require("dotenv").config({ override: true });

console.log(">>> INICIANDO BOT ARENA EMIGE <<<");

const { WhatsAppClientHandler } = require("./bot/manager/WhatsAppClientHandler");

// Captura o ID do cliente via argumento 
const clienteId =
  process.argv.find((arg) => arg.startsWith("--id="))?.split("=")[1] ||
  "XXXXXX"; // valor padrão

console.log(`>>> BOT INICIALIZANDO PARA O CLIENTE: ${clienteId} <<<`);

(async () => {
  try {
    const handler = new WhatsAppClientHandler(clienteId);

    console.log(">>> CARREGANDO WHATSAPP CLIENT... <<<");
    await handler.initialize();

    console.log(">>> BOT DA XXXX INICIADO COM SUCESSO <<<");
  } catch (error) {
    console.error("❌ Erro ao iniciar bot:", error.message);
    console.error(error.stack);
  }
})();
