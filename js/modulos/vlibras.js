/* ==========================================================
   vlibras.js
   Integração com o avatar do VLibras.
   ----------------------------------------------------------
   Como funciona:
   1. O widget do VLibras é carregado no HTML.
   2. Com o avatar aberto, o VLibras "escuta" cliques na página
      e traduz o texto do elemento clicado.
   3. Para traduzir o que o aluno digitou, colocamos o texto num
      elemento e simulamos um clique nele.

   Observação: o VLibras não tem um comando oficial para
   "traduzir este texto". Se uma versão nova do widget mudar
   e a tradução parar, revise a função widgetPronto().
   (Testado com o widget versão 7.12.2.)
   ========================================================== */

import { VLIBRAS_URL, VLIBRAS_POSICAO, TEMPO_MAXIMO_CARREGAR_MS } from "./config.js";

/** Cria o botão/avatar do VLibras na página. Retorna false se não carregou. */
export function iniciarVLibras() {
  if (!window.VLibras || !window.VLibras.Widget) return false;
  new window.VLibras.Widget({ rootPath: VLIBRAS_URL, position: VLIBRAS_POSICAO });
  return true;
}

/**
 * O VLibras cria este <style> quando o avatar está carregado E aberto.
 * É o sinal de que ele já está escutando os cliques.
 */
export function widgetPronto() {
  return Boolean(document.getElementById("@text-capture.style"));
}

/** Abre o avatar (se estiver fechado) e espera ele ficar pronto. */
export async function garantirWidgetAberto() {
  if (widgetPronto()) return;

  if (!window.VLibrasWidget || typeof window.VLibrasWidget.open !== "function") {
    throw new Error("O VLibras não carregou. Verifique a conexão com a internet.");
  }

  window.VLibrasWidget.open();

  const inicio = Date.now();
  while (!widgetPronto()) {
    if (Date.now() - inicio > TEMPO_MAXIMO_CARREGAR_MS) {
      throw new Error("O avatar demorou demais para carregar. Tente de novo.");
    }
    await esperar(250);
  }

  // Pequena folga para o avatar terminar de iniciar
  await esperar(400);
}

/**
 * Faz o avatar sinalizar um texto.
 * @param {HTMLElement} elemento  elemento visível que vai receber o texto
 * @param {string} texto  frase em português
 */
export function sinalizar(elemento, texto) {
  elemento.textContent = texto;
  elemento.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
