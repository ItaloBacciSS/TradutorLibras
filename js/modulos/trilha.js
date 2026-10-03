/* ==========================================================
   trilha.js
   Desenha a trilha de lições (estilo Duolingo):
   lições em ordem, em zigue-zague, com cadeado nas bloqueadas
   e estrelas nas concluídas.
   ========================================================== */

import { licaoLiberada } from "./progresso.js";

const ICONES = {
  cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  certo: '<polyline points="20 6 9 17 4 12"/>',
  jogar: '<polygon points="7 4 20 12 7 20 7 4"/>',
};

/**
 * @param {HTMLElement} lista  <ol> onde a trilha é desenhada
 * @param {object} dados
 * @param {object[]} dados.licoes
 * @param {object} dados.progresso  resultado de lerProgresso()
 * @param {(licao: object) => void} dados.aoEscolher
 */
export function desenharTrilha(lista, { licoes, progresso, aoEscolher }) {
  lista.innerHTML = "";
  let proximaMarcada = false;

  licoes.forEach((licao, indice) => {
    const salvo = progresso.licoes[licao.id];
    const concluida = Boolean(salvo?.concluida);
    const liberada = licaoLiberada(indice, licoes, progresso);
    const atual = liberada && !concluida && !proximaMarcada;
    if (atual) proximaMarcada = true;

    const item = document.createElement("li");
    item.className = "trilha__item";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "no-licao";
    botao.disabled = !liberada;
    botao.dataset.estado = concluida ? "concluida" : liberada ? "liberada" : "bloqueada";
    if (atual) botao.dataset.atual = "true";
    botao.setAttribute(
      "aria-label",
      `Lição ${indice + 1}: ${licao.titulo}` +
        (concluida ? `, concluída com ${salvo.estrelas} de 3 estrelas` : liberada ? "" : ", bloqueada"),
    );

    const circulo = document.createElement("span");
    circulo.className = "no-licao__circulo";
    circulo.setAttribute("aria-hidden", "true");
    circulo.innerHTML = svg(concluida ? ICONES.certo : liberada ? ICONES.jogar : ICONES.cadeado);

    const titulo = document.createElement("span");
    titulo.className = "no-licao__titulo";
    titulo.textContent = licao.titulo;

    const descricao = document.createElement("span");
    descricao.className = "no-licao__descricao";
    descricao.textContent = liberada ? licao.descricao ?? "" : "Termine a lição anterior";

    botao.append(circulo, titulo, descricao);
    if (concluida) botao.append(estrelas(salvo.estrelas));
    if (atual) {
      const selo = document.createElement("span");
      selo.className = "no-licao__comecar";
      selo.textContent = "Começar";
      botao.append(selo);
    }

    botao.addEventListener("click", () => aoEscolher(licao));
    item.append(botao);
    lista.append(item);
  });
}

/** Desenha ★★☆ (estrelas cheias e vazias). */
export function estrelas(quantidade, classe = "estrelas") {
  const caixa = document.createElement("span");
  caixa.className = classe;
  caixa.setAttribute("aria-hidden", "true");
  for (let i = 1; i <= 3; i++) {
    const estrela = document.createElement("span");
    estrela.className = i <= quantidade ? "estrela estrela--cheia" : "estrela";
    estrela.textContent = "★";
    caixa.append(estrela);
  }
  return caixa;
}

function svg(conteudo) {
  return `<svg class="icone" viewBox="0 0 24 24">${conteudo}</svg>`;
}
