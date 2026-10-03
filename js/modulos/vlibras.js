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

/** Erro com um código, para a página saber o que aconteceu. */
export class ErroVLibras extends Error {
  /**
   * @param {"semInternet" | "naoCarregou" | "tempoEsgotado"} codigo
   */
  constructor(codigo) {
    super(MENSAGENS_VLIBRAS[codigo]);
    this.name = "ErroVLibras";
    this.codigo = codigo;
  }
}

export const MENSAGENS_VLIBRAS = {
  semInternet: "Sem internet. O avatar precisa de conexão para traduzir.",
  naoCarregou: "O avatar do VLibras não carregou. Recarregue a página e tente de novo.",
  tempoEsgotado: "O avatar demorou demais para abrir. Tente de novo.",
};

/** Diz se o script do VLibras chegou a carregar. */
export function vlibrasDisponivel() {
  return Boolean(window.VLibras && typeof window.VLibras.Widget === "function");
}

/** Cria o botão/avatar do VLibras na página. Retorna false se não deu. */
export function iniciarVLibras() {
  if (!vlibrasDisponivel()) return false;
  try {
    new window.VLibras.Widget({ rootPath: VLIBRAS_URL, position: VLIBRAS_POSICAO });
    return true;
  } catch (erro) {
    console.error("Falha ao iniciar o VLibras:", erro);
    return false;
  }
}

/** Onde o VLibras guarda as preferências do avatar (velocidade, legenda, personagem). */
const CHAVE_PREFERENCIAS_VLIBRAS = "@vlibras/player";

/**
 * Liga ou desliga a legenda do avatar.
 * Precisa ser chamada ANTES do avatar abrir pela primeira vez na página:
 * o VLibras lê esta preferência quando carrega.
 * Mantém as outras preferências (velocidade, personagem) como estavam.
 * @param {boolean} ligada
 */
export function definirLegenda(ligada) {
  let salvo = null;
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS_VLIBRAS) ?? "null");
  } catch {
    /* preferências estragadas: começa do zero */
  }

  try {
    if (!salvo || typeof salvo !== "object" || typeof salvo.state !== "object" || salvo.state === null) {
      salvo = { state: {}, version: 1 };
    }
    salvo.state.showSubtitles = Boolean(ligada);
    localStorage.setItem(CHAVE_PREFERENCIAS_VLIBRAS, JSON.stringify(salvo));
  } catch {
    /* armazenamento bloqueado: o avatar usa o padrão dele (legenda ligada) */
  }
}

/**
 * O VLibras cria este <style> quando o avatar está carregado E aberto.
 * É o sinal de que ele já está escutando os cliques.
 */
export function widgetPronto() {
  return Boolean(document.getElementById("@text-capture.style"));
}

/**
 * Abre o avatar (se estiver fechado) e espera ele ficar pronto.
 * @throws {ErroVLibras}
 */
export async function garantirWidgetAberto() {
  if (widgetPronto()) return;

  if (!navigator.onLine) {
    throw new ErroVLibras("semInternet");
  }

  const widget = window.VLibrasWidget;
  if (!widget || typeof widget.open !== "function") {
    throw new ErroVLibras("naoCarregou");
  }

  try {
    widget.open();
  } catch (erro) {
    console.error("Falha ao abrir o VLibras:", erro);
    throw new ErroVLibras("naoCarregou");
  }

  const inicio = Date.now();
  while (!widgetPronto()) {
    if (!navigator.onLine) throw new ErroVLibras("semInternet");
    if (Date.now() - inicio > TEMPO_MAXIMO_CARREGAR_MS) throw new ErroVLibras("tempoEsgotado");
    await esperar(250);
  }

  // Pequena folga para o avatar terminar de iniciar
  await esperar(400);
}

/**
 * Faz o avatar sinalizar um texto.
 * @param {HTMLElement} elemento  elemento visível que vai receber o texto
 * @param {string} texto  frase em português (já validada)
 */
export function sinalizar(elemento, texto) {
  elemento.textContent = texto;
  elemento.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
