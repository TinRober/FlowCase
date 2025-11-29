require("dotenv").config({ override: true });

console.log(">>> INICIANDO BOT ARENA EMIGE <<<");

const { WhatsAppClientHandler } = require("./bot/manager/WhatsAppClientHandler");

// Captura o ID do cliente via argumento (agora opcional)
const clienteId =
  process.argv.find((arg) => arg.startsWith("--id="))?.split("=")[1] ||
  "arenaemige"; // valor padrão

console.log(`>>> BOT INICIALIZANDO PARA O CLIENTE: ${clienteId} <<<`);

(async () => {
  try {
    const handler = new WhatsAppClientHandler(clienteId);

    console.log(">>> CARREGANDO WHATSAPP CLIENT... <<<");
    await handler.initialize();

    console.log(">>> BOT DA ARENA EMIGE INICIADO COM SUCESSO <<<");
  } catch (error) {
    console.error("❌ Erro ao iniciar bot:", error.message);
    console.error(error.stack);
  }
})();
