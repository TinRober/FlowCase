/**
 * Watchdog simples para monitorar travamentos do WhatsApp Web.
 * - Reinicia se não houver ping por tempo demais.
 */

const { logger } = require("./logger");

function marcarPing(client) {
  if (!client.estado) client.estado = {};
  client.estado.ultimoPing = Date.now();
}

function iniciarWatchdog(client, reiniciarFn, intervaloMs = 30_000, timeoutMs = 5 * 60_000) {
  if (!client || typeof reiniciarFn !== "function") {
    logger.error("Parâmetros inválidos ao iniciar watchdog.");
    return;
  }

  // Evita múltiplos watchdogs no mesmo cliente
  if (client.estado?.watchdogInterval) {
    clearInterval(client.estado.watchdogInterval);
  }

  marcarPing(client);

  logger.info(`Watchdog iniciado (intervalo ${intervaloMs}ms | timeout ${timeoutMs}ms)`);

  const watchdog = setInterval(async () => {
    try {
      const agora = Date.now();
      const ultimo = client.estado?.ultimoPing || 0;
      const diff = agora - ultimo;

      if (diff > timeoutMs) {
        logger.error(`WATCHDOG: Sem ping há ${diff}ms → reiniciando bot.`);

        clearInterval(watchdog);

        try {
          await client.destroy();
        } catch (err) {
          logger.error("Erro ao destruir cliente: " + err.message);
        }

        reiniciarFn();
      }
    } catch (err) {
      logger.error("Erro no watchdog: " + err.message);
    }
  }, intervaloMs);

  client.estado.watchdogInterval = watchdog;
  return watchdog;
}

module.exports = { iniciarWatchdog, marcarPing };
