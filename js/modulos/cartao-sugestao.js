/* ==========================================================
   cartao-sugestao.js
   O cartão "Dica de Libras" que aparece embaixo do campo
   quando a frase tem algo que pode ficar melhor em Libras.

   Mostra UMA sugestão por vez (com "1 de 3" se tiver mais).
   - Troca:   [Usar sugestão] [Manter como está]
   - Escolha: um botão para cada sentido + [Manter como está]
   O aluno sempre decide: nada é trocado sozinho.
   ========================================================== */

import { aplicarSugestao } from "./sugestoes.js";

/**
 * @param {object} opcoes
 * @param {HTMLElement} opcoes.elemento  onde o cartão é desenhado
 * @param {(novoTexto: string) => void} opcoes.aoAplicar
 * @param {(sugestao: object) => void} opcoes.aoManter
 */
export function criarCartaoSugestao({ elemento, aoAplicar, aoManter }) {
  function esconder() {
    elemento.hidden = true;
    elemento.innerHTML = "";
  }

  /**
   * @param {object[]} sugestoes  resultado de encontrarSugestoes()
   * @param {string} texto        texto atual do campo
   */
  function mostrar(sugestoes, texto) {
    if (!sugestoes.length) {
      esconder();
      return;
    }

    const sugestao = sugestoes[0];
    elemento.innerHTML = "";
    elemento.hidden = false;
    elemento.dataset.tipo = sugestao.tipo;

    elemento.append(
      criarCabecalho(sugestao, sugestoes.length),
      criarCorpo(sugestao, texto),
      criarAcoes(sugestao, texto),
      criarPorque(sugestao),
    );
  }

  // ---------- Partes do cartão ----------
  function criarCabecalho(sugestao, total) {
    const cabecalho = criar("div", "sugestao__cabecalho");

    const titulo = criar("span", "sugestao__titulo");
    titulo.append(icone(), texto(`Dica de Libras · ${sugestao.categoria}`));
    cabecalho.append(titulo);

    if (total > 1) {
      cabecalho.append(criar("span", "sugestao__contador", `1 de ${total}`));
    }
    return cabecalho;
  }

  function criarCorpo(sugestao, textoAtual) {
    const corpo = criar("div", "sugestao__corpo");

    if (sugestao.tipo === "troca") {
      const novo = sugestao.opcoes[0].trocar;
      const linha = criar("p", "sugestao__linha");
      linha.append(
        texto("Troque "),
        criar("del", "sugestao__antes", sugestao.trecho),
        texto(" por "),
        criar("ins", "sugestao__depois", novo),
      );
      const previa = criar("p", "sugestao__previa", `“${aplicarSugestao(textoAtual, sugestao, novo)}”`);
      corpo.append(linha, previa);
    } else {
      const linha = criar("p", "sugestao__linha");
      linha.append(
        criar("strong", "sugestao__palavra", `“${sugestao.trecho}”`),
        texto(" tem mais de um sentido. Qual você quis dizer?"),
      );
      corpo.append(linha);
    }
    return corpo;
  }

  function criarAcoes(sugestao, textoAtual) {
    const acoes = criar("div", "sugestao__acoes");

    if (sugestao.tipo === "troca") {
      const usar = botao("Usar sugestão", "botao botao--pequeno");
      usar.addEventListener("click", () =>
        aoAplicar(aplicarSugestao(textoAtual, sugestao, sugestao.opcoes[0].trocar)),
      );
      acoes.append(usar);
    } else {
      sugestao.opcoes.forEach((opcao) => {
        const escolher = botao(opcao.rotulo, "chip chip--opcao");
        escolher.title = `Vai ficar: “${opcao.trocar}”`;
        escolher.addEventListener("click", () => {
          const novoTexto = aplicarSugestao(textoAtual, sugestao, opcao.trocar);
          // Escolheu o sentido que já estava escrito (ex.: "papel" = folha): só marca como resolvida
          if (novoTexto === textoAtual) aoManter(sugestao);
          else aoAplicar(novoTexto);
        });
        acoes.append(escolher);
      });
    }

    const manter = botao("Manter como está", "botao-link sugestao__manter");
    manter.addEventListener("click", () => aoManter(sugestao));
    acoes.append(manter);
    return acoes;
  }

  function criarPorque(sugestao) {
    const detalhes = criar("details", "sugestao__porque");
    const resumo = criar("summary", "vlibras-links", "Por quê?");
    detalhes.append(resumo, criar("p", "", sugestao.explicacao));
    return detalhes;
  }

  return { mostrar, esconder };
}

// ==========================================================
// Ajudantes para criar elementos (sempre com textContent,
// nunca innerHTML com texto do aluno)
// ==========================================================
function criar(tag, classe, conteudo) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (conteudo !== undefined) elemento.textContent = conteudo;
  return elemento;
}

function texto(conteudo) {
  return document.createTextNode(conteudo);
}

function botao(rotulo, classe) {
  const elemento = criar("button", `${classe} vlibras-links`, rotulo);
  elemento.type = "button";
  return elemento;
}

function icone() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icone icone--pequeno");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>';
  return svg;
}
