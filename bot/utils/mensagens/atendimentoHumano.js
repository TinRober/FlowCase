function contatoEmAtendimento(atendimentoTemp, contato) {
    const expiraEm = atendimentoTemp[contato];
    if (!expiraEm) return false;

    // Expirado → limpa e libera
    if (Date.now() > expiraEm) {
        delete atendimentoTemp[contato];
        return false;
    }

    return true; // ainda em atendimento
}

function marcarAtendimento(atendimentoTemp, contato, tempoMs) {
    atendimentoTemp[contato] = Date.now() + tempoMs;
}

function resetAtendimento(atendimentoTemp) {
    Object.keys(atendimentoTemp).forEach(key => delete atendimentoTemp[key]);
}

module.exports = { contatoEmAtendimento, marcarAtendimento, resetAtendimento };
