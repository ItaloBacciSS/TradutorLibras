/* ==========================================================
   historico.js
   Últimas frases traduzidas, salvas no navegador (localStorage).
   Cada computador/navegador tem o seu próprio histórico.
   ========================================================== */

import { CHAVE_HISTORICO, TAMANHO_HISTORICO } from "./config.js";

/** Lê a lista salva. Se não der para ler, devolve lista vazia. */
export function lerHistorico() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];
  } catch {
    return [];
  }
}

/** Coloca uma frase no topo do histórico (sem repetir). */
export function adicionarAoHistorico(texto) {
  const lista = lerHistorico().filter((item) => item !== texto);
  lista.unshift(texto);
  gravar(lista.slice(0, TAMANHO_HISTORICO));
}

/** Apaga todo o histórico. */
export function apagarHistorico() {
  gravar([]);
}

/**
 * Desenha o histórico numa lista <ul>.
 * @param {HTMLUListElement} lista
 * @param {(frase: string) => void} aoEscolher  chamado ao clicar num item
 */
export function desenharHistorico(lista, aoEscolher) {
  const frases = lerHistorico();
  lista.innerHTML = "";

  if (frases.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "historico__vazio";
    vazio.textContent = "Suas traduções aparecem aqui.";
    lista.appendChild(vazio);
    return;
  }

  frases.forEach((frase) => {
    const item = document.createElement("li");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "historico__item vlibras-links";
    botao.title = "Traduzir de novo";
    botao.textContent = frase;
    botao.addEventListener("click", () => aoEscolher(frase));
    item.appendChild(botao);
    lista.appendChild(item);
  });
}

function gravar(lista) {
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
  } catch {
    /* navegador sem armazenamento: segue sem salvar */
  }
}
