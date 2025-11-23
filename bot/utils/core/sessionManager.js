/**
 * Anti-flood simples para WhatsApp.
 * - Garante intervalo mínimo entre respostas.
 * - Remove registros antigos automaticamente.
 */

const sessions = new Map();
const TEMPO_PAUSA = 2000; // 2s
const LIMITE_LIMPEZA = 5000; // limpa sessões mais antigas que 5s

function normalizarNumero(numero) {
  return numero ? String(numero).replace(/\D+/g, "") : null;
}

function limparExpirados() {
  const agora = Date.now();
  for (const [numero, timestamp] of sessions.entries()) {
    if (agora - timestamp > LIMITE_LIMPEZA) {
      sessions.delete(numero);
    }
  }
}

function podeResponder(numero) {
  const n = normalizarNumero(numero);
  if (!n) return true;

  limparExpirados();

  const agora = Date.now();
  const ultima = sessions.get(n);

  return !ultima || (agora - ultima > TEMPO_PAUSA);
}

function registrarMensagem(numero) {
  const n = normalizarNumero(numero);
  if (!n) return;

  limparExpirados();
  sessions.set(n, Date.now());
}

module.exports = {
  podeResponder,
  registrarMensagem
};
