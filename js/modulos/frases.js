/* ==========================================================
   frases.js
   Frases prontas para praticar e o desenho dos "chips".
   Para adicionar um grupo ou uma frase, edite só a lista
   GRUPOS_DE_FRASES. Valide as frases com a comunidade surda.
   ========================================================== */

export const GRUPOS_DE_FRASES = [
  {
    id: "cumprimentos",
    titulo: "Cumprimentos",
    frases: [
      "Bom dia!",
      "Boa tarde!",
      "Oi, tudo bem?",
      "Qual é o seu nome?",
      "Obrigado!",
      "Tchau, até amanhã!",
    ],
  },
  {
    id: "escola",
    titulo: "Escola",
    frases: [
      "Posso ir ao banheiro?",
      "Eu não entendi.",
      "Pode repetir, por favor?",
      "Onde fica a biblioteca?",
      "Que horas é o intervalo?",
      "A prova é amanhã.",
    ],
  },
];

/**
 * Desenha uma lista de frases como chips clicáveis.
 * @param {HTMLElement} recipiente
 * @param {string[]} frases
 * @param {(frase: string) => void} aoEscolher
 * @param {{ suave?: boolean }} [opcoes]  suave = visual mais discreto
 */
export function desenharChips(recipiente, frases, aoEscolher, opcoes = {}) {
  const chips = document.createElement("div");
  chips.className = "chips";

  frases.forEach((frase) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip vlibras-links" + (opcoes.suave ? " chip--suave" : "");
    chip.textContent = frase; // textContent: nunca interpreta HTML
    chip.addEventListener("click", () => aoEscolher(frase));
    chips.appendChild(chip);
  });

  recipiente.appendChild(chips);
}
