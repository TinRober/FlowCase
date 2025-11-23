/**
 * TRATAMENTO PRINCIPAL DE MENSAGENS (versão SEM IA)
 * - Pausa automática de 30 minutos quando VOCÊ ou a Arena Emige envia mensagem
 * - Filtra mensagens inválidas
 * - Evita duplicadas
 * - Respeita atendimento humano e pausas
 * - Roda apenas fluxo CASES
 */

const { logger } = require("../core/logger");
const { processarMensagemId } = require("../core/messageDeduplicator");
const { contatoEmAtendimento, marcarAtendimento } = require("./atendimentoHumano");
const { isBloqueado } = require("../core/ownerBlock");
const { flowRouter } = require("../flow/flowRouter");

// Números que, ao enviar mensagem, ativam pausa automática
const NUMEROS_PAUSA = [
  "553172329057@c.us"    // Arena Emige
                         // Rafael
];

async function processarMensagem(msg, client, atendimentoTemp) {
    const contato = msg.from;
    const texto = msg.body?.trim();
    const clienteId = client.clienteId;

    if (!texto) return;

    // ============================
    // 1. Ignorar grupos
    // ============================
    if (msg.isGroupMsg || contato.includes("@g.us")) return;

    // ============================
    // 2. Ignorar status
    // ============================
    if (contato.includes("@status")) return;

    // ============================
    // 3. Ignorar duplicadas
    // ============================
    if (processarMensagemId(client, msg)) return;

    // ============================
    // 4. Ignorar mensagens antigas
    // ============================
    if (client.startTimestamp && msg.timestamp < client.startTimestamp) return;

    // ============================
    // 5. PAUSA AUTOMÁTICA → 30 min
    // Se VOCÊ ou a ARENA EMIGE enviar para um contato,
    // esse contato fica bloqueado por 30 minutos
    // ============================
    if (msg.fromMe || NUMEROS_PAUSA.includes(contato)) {

        const target = msg.fromMe ? msg.to : contato;

        logger.info(
            `[${clienteId}] Pausa de 30 minutos ativada porque ${contato} enviou mensagem para ${target}`
        );

        marcarAtendimento(atendimentoTemp, target, 30 * 60_000);
        return; 
    }

    // ============================
    // 6. Bloqueados manualmente
    // ============================
    if (isBloqueado(contato)) return;

    // ============================
    // 7. Em atendimento humano / pausa
    // ============================
    if (contatoEmAtendimento(atendimentoTemp, contato)) {
        logger.info(`[${clienteId}] Ignorado → contato em pausa/atendimento.`);
        return;
    }

    // ============================
    // 8. CHAMAR FLUXO CASES (único modo)
    // ============================
    try {
        await flowRouter(
            msg,
            client,
            "case",              // modo fixo
            null,                
            atendimentoTemp,
            marcarAtendimento
        );
    } catch (err) {
        logger.error(`[${clienteId}] Erro no flowRouter: ${err.message}`);
    }
}

module.exports = { processarMensagem };
