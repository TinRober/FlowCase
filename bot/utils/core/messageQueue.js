/**
 * Fila simples de envio de mensagens para o WhatsApp.
 * - Apenas 1 fila global (ArenaEmige)
 * - Mensagens enviadas com delay configurável
 * - Evita flood e bloqueio do WhatsApp
 */

const { logger } = require("./logger");

let queue = [];
let isProcessing = false;

function addToQueue(client, to, message, delay = 2000) {
  queue.push({ client, to, message, delay });
  processQueue();
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const { client, to, message, delay } = queue.shift();

  try {
    // Delay configurável
    await new Promise(resolve => setTimeout(resolve, delay));

    // Envia mensagem
    await client.sendMessage(to, message);

    logger.info(`Mensagem enviada para ${to}: ${message}`);
  } catch (err) {
    logger.error(`Erro ao enviar mensagem para ${to}: ${err.message}`);
  } finally {
    isProcessing = false;
    processQueue(); // Processa próximo
  }
}

function getQueueStatus() {
  return {
    size: queue.length,
    isProcessing
  };
}

function clearQueue() {
  queue = [];
  isProcessing = false;
  logger.warn("Fila global limpa.");
}

module.exports = { addToQueue, getQueueStatus, clearQueue };
