const { WhatsAppClientHandler } = require("./WhatsAppClientHandler");
const { logger } = require("../utils/core/logger");

class ClientManager {
  constructor() {
    this.client = null;              // apenas 1 cliente
    this.clienteId = "arenaemige";   // fixo
  }

  /**
   * Inicia o único cliente do sistema
   */
  async startClient() {
    if (this.client) {
      logger.warn(`O cliente já está iniciado.`);
      return;
    }

    const handler = new WhatsAppClientHandler(this.clienteId);

    await handler.initialize();

    this.client = handler;

    logger.info(`Cliente ${this.clienteId} iniciado com sucesso.`);
  }

  /**
   * Reinicia o único cliente
   */
  async restartClient() {
    if (this.client) {
      await this.client.destroy();
      logger.info(`Cliente reiniciado…`);
      this.client = null;
    }

    await this.startClient();
  }

  /**
   * Status do único cliente
   */
  getClientStatus() {
    return this.client?.getStatus() || "Não iniciado";
  }

  /**
   * Para o cliente único
   */
  async stopClient() {
    if (this.client) {
      await this.client.destroy();
      logger.info(`Cliente parado.`);
      this.client = null;
    }
  }
}

module.exports = { ClientManager };
