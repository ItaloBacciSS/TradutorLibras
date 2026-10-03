/* ==========================================================
   abas.js
   Abas simples e acessíveis (dá para usar com o teclado:
   setas ← → trocam de aba).
   ========================================================== */

/**
 * @typedef {object} Aba
 * @property {string} id
 * @property {string} titulo
 * @property {(painel: HTMLElement) => void} desenhar  preenche o painel
 */

/**
 * Cria as abas e devolve funções para controlá-las.
 * @param {HTMLElement} barra   onde os botões das abas ficam
 * @param {HTMLElement} painel  onde o conteúdo aparece
 * @param {Aba[]} abas
 */
export function criarAbas(barra, painel, abas) {
  let ativa = abas[0]?.id;
  const botoes = new Map();

  abas.forEach((aba) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "aba vlibras-links";
    botao.id = `aba-${aba.id}`;
    botao.setAttribute("role", "tab");
    botao.textContent = aba.titulo;
    botao.addEventListener("click", () => selecionar(aba.id));
    botao.addEventListener("keydown", (evento) => mudarComSetas(evento, aba.id));
    barra.appendChild(botao);
    botoes.set(aba.id, botao);
  });

  function selecionar(id) {
    if (!botoes.has(id)) return;
    ativa = id;

    botoes.forEach((botao, idBotao) => {
      const selecionada = idBotao === id;
      botao.setAttribute("aria-selected", String(selecionada));
      botao.tabIndex = selecionada ? 0 : -1;
    });

    painel.setAttribute("aria-labelledby", `aba-${id}`);
    redesenhar();
  }

  function redesenhar() {
    const aba = abas.find((item) => item.id === ativa);
    painel.innerHTML = "";
    aba?.desenhar(painel);
  }

  function mudarComSetas(evento, idAtual) {
    if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
    const indice = abas.findIndex((aba) => aba.id === idAtual);
    const passo = evento.key === "ArrowRight" ? 1 : -1;
    const proxima = abas[(indice + passo + abas.length) % abas.length];
    selecionar(proxima.id);
    botoes.get(proxima.id).focus();
  }

  selecionar(ativa);

  return {
    selecionar,
    /** Redesenha a aba atual (ex.: depois de mudar o histórico). */
    redesenhar,
    abaAtiva: () => ativa,
  };
}
