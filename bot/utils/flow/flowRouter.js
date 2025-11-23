const fs = require("fs");
const path = require("path");
const { logger } = require("../core/logger");

// Cache para não recarregar o fluxo a cada mensagem
const fluxoCache = new Map();

/** Carrega fluxoCases.js do cliente usando cache */
function obterFluxoCases(clienteId) {
    if (fluxoCache.has(clienteId)) return fluxoCache.get(clienteId);

    const filePath = path.join(process.cwd(), "bot", "clientes", clienteId, "fluxoCases.js");

    if (!fs.existsSync(filePath)) {
        logger.error(`[FlowRouter] ❌ Cliente ${clienteId} está no modo CASE, mas não possui fluxoCases.js`);
        return null;
    }

    logger.info(`[FlowRouter] 📁 Carregando fluxo CASES do cliente (primeira vez): ${clienteId}`);

    delete require.cache[require.resolve(filePath)];
    const fluxo = require(filePath);

    if (!fluxo?.processarMensagem) {
        logger.error(`[FlowRouter] ❌ fluxoCases.js inválido para cliente ${clienteId}`);
        return null;
    }

    fluxoCache.set(clienteId, fluxo.processarMensagem);
    return fluxo.processarMensagem;
}

/** FlowRouter — apenas CASE */
async function flowRouter(msg, client, mode, contextoIA, atendimentoTemp) {
    const clienteId = client?.clienteId;
    logger.info(`[FlowRouter] Modo: CASE | Cliente: ${clienteId}`);

    const processarCases = obterFluxoCases(clienteId);

    if (!processarCases) {
        return client.sendMessage(msg.from, "Erro interno: fluxo CASE não encontrado.");
    }

    return processarCases(msg, client, atendimentoTemp);
}

module.exports = { flowRouter };
