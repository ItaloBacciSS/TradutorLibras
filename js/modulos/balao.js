/* ==========================================================
   balao.js
   Controla o "balão" de resultado embaixo do botão Traduzir.
   Ele tem 4 estados (atributo data-estado no HTML):

     inicial      → instrução para começar
     carregando   → spinner enquanto o avatar abre
     sinalizando  → mostra a frase + botão "Repetir"
     erro         → mensagem vermelha + botão de ação (opcional)

   As cores e o que aparece em cada estado ficam no CSS
   (css/paginas/portugues-libras.css).
   ========================================================== */

const MENSAGEM_INICIAL = "Escreva uma frase ou escolha uma das frases abaixo.";

/**
 * @param {object} elementos
 * @param {HTMLElement} elementos.balao
 * @param {HTMLElement} elementos.mensagem
 * @param {HTMLElement} elementos.frase        alvo do clique do VLibras
 * @param {HTMLButtonElement} elementos.botao  botão de ação do balão
 * @param {HTMLElement} elementos.textoBotao
 */
export function criarBalao({ balao, mensagem, frase, botao, textoBotao }) {
  let aoClicarNoBotao = null;

  botao.addEventListener("click", () => aoClicarNoBotao?.());

  function mudarEstado(estado, texto) {
    balao.dataset.estado = estado;
    mensagem.textContent = texto;
  }

  function configurarBotao(rotulo, acao) {
    textoBotao.textContent = rotulo ?? "";
    aoClicarNoBotao = acao ?? null;
    botao.hidden = !acao;
  }

  return {
    estado: () => balao.dataset.estado,

    inicial() {
      mudarEstado("inicial", MENSAGEM_INICIAL);
      frase.textContent = "";
      configurarBotao(null, null);
    },

    carregando(texto = "Abrindo o avatar… na primeira vez leva alguns segundos.") {
      mudarEstado("carregando", texto);
      configurarBotao(null, null);
    },

    /**
     * Mostra a frase que está sendo sinalizada.
     * @returns {HTMLElement} o elemento da frase (alvo do VLibras)
     */
    sinalizando(aoRepetir) {
      mudarEstado("sinalizando", "Em Libras agora (olhe o avatar):");
      configurarBotao("Repetir", aoRepetir);
      return frase;
    },

    /**
     * @param {string} texto
     * @param {{ rotulo: string, acao: () => void }} [botaoDeAcao]
     */
    erro(texto, botaoDeAcao) {
      mudarEstado("erro", texto);
      frase.textContent = "";
      configurarBotao(botaoDeAcao?.rotulo, botaoDeAcao?.acao);
    },
  };
}
