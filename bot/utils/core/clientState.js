/**
 * Estado do cliente WhatsApp
 * Usado para monitorar estabilidade, bloqueios temporários e heartbeat (ping).
 */
function criarEstadoCliente() {
  let bloqueioTimeout = null;

  return {
    conexaoEstavel: false,
    bloqueado: false,
    ultimoPing: Date.now(),

    // Marca cliente como estável
    marcarEstavel() {
      this.conexaoEstavel = true;
    },

    // Marca cliente como instável
    marcarInstavel() {
      this.conexaoEstavel = false;
    },

    // Aplica bloqueio temporário
    bloquearPor(ms) {
      if (bloqueioTimeout) clearTimeout(bloqueioTimeout);

      this.bloqueado = true;

      bloqueioTimeout = setTimeout(() => {
        this.bloqueado = false;
      }, ms);
    },

    // Status resumido para logs/diagnóstico
    getStatus() {
      return {
        conexaoEstavel: this.conexaoEstavel,
        bloqueado: this.bloqueado,
        ultimoPing: this.ultimoPing
      };
    },

    // Reset básico utilizado no início do bot
    reset() {
      this.conexaoEstavel = false;
      this.bloqueado = false;
      this.ultimoPing = Date.now();
    }
  };
}

/* Atualiza timestamp do último ping */
function marcarPing(client) {
  if (client?.estado) {
    client.estado.ultimoPing = Date.now();
  }
}

/* Marca como estável */
function marcarConexaoEstavel(client) {
  if (client?.estado) {
    client.estado.marcarEstavel();
  }
}

/* Marca como instável */
function marcarConexaoInstavel(client) {
  if (client?.estado) {
    client.estado.marcarInstavel();
  }
}

module.exports = {
  criarEstadoCliente,
  marcarPing,
  marcarConexaoEstavel,
  marcarConexaoInstavel
};
