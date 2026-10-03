/* ==========================================================
   status.js
   Mostra mensagens para o usuário (carregando, erro, sucesso).
   ========================================================== */

/**
 * @param {HTMLElement} elemento  parágrafo de status
 * @param {string} mensagem
 * @param {"erro" | "ok"} [tipo]  muda a cor da mensagem
 */
export function mostrarStatus(elemento, mensagem, tipo) {
  elemento.textContent = mensagem;
  elemento.className = "status" + (tipo ? ` status--${tipo}` : "");
}
