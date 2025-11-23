/**
 * Sistema simples de bloqueio de atendimento por número.
 * - Único bot, sem persistência em disco.
 * - Bloqueio padrão de 30 minutos.
 */

const bloqueios = new Map();
const BLOQUEIO_PADRAO_MS = 30 * 60_000; // 30 minutos

function normalizarNumero(numero) {
  return numero ? String(numero).replace(/\D+/g, "") : null;
}

function limparExpirados() {
  const agora = Date.now();
  for (const [numero, ate] of bloqueios.entries()) {
    if (agora >= ate) {
      bloqueios.delete(numero);
    }
  }
}

function bloquearAtendimento(numero, tempoMs = BLOQUEIO_PADRAO_MS) {
  const n = normalizarNumero(numero);
  if (!n) return;

  limparExpirados();
  bloqueios.set(n, Date.now() + tempoMs);
}

function isBloqueado(numero) {
  const n = normalizarNumero(numero);
  if (!n) return false;

  limparExpirados();
  const ate = bloqueios.get(n);
  return ate && Date.now() < ate;
}

function tempoRestante(numero) {
  const n = normalizarNumero(numero);
  if (!n) return null;

  limparExpirados();
  const ate = bloqueios.get(n);
  if (!ate) return null;

  const restante = ate - Date.now();
  return restante > 0 ? Math.ceil(restante / 1000) : null;
}

function removerBloqueio(numero) {
  const n = normalizarNumero(numero);
  if (!n) return;

  bloqueios.delete(n);
}

module.exports = {
  bloquearAtendimento,
  isBloqueado,
  tempoRestante,
  removerBloqueio
};
