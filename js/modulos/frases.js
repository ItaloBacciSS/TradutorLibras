/* ==========================================================
   frases.js
   Frases prontas para praticar.
   Para adicionar um grupo ou uma frase, edite só a lista
   GRUPOS_DE_FRASES. Valide as frases com a comunidade surda.
   ========================================================== */

export const GRUPOS_DE_FRASES = [
  {
    titulo: "Cumprimentos",
    frases: [
      "Bom dia!",
      "Boa tarde!",
      "Oi, tudo bem?",
      "Qual é o seu nome?",
      "Meu nome é",
      "Obrigado!",
      "Desculpa.",
      "Tchau, até amanhã!",
    ],
  },
  {
    titulo: "Na escola",
    frases: [
      "Professor, posso ir ao banheiro?",
      "Eu não entendi.",
      "Pode repetir, por favor?",
      "Onde fica a biblioteca?",
      "Que horas é o intervalo?",
      "Vamos fazer o trabalho juntos?",
      "A prova é amanhã.",
    ],
  },
];

/**
 * Desenha os grupos de frases dentro de um elemento.
 * @param {HTMLElement} recipiente  onde os grupos serão criados
 * @param {(frase: string) => void} aoEscolher  chamado ao clicar numa frase
 */
export function desenharFrases(recipiente, aoEscolher) {
  recipiente.innerHTML = "";

  GRUPOS_DE_FRASES.forEach((grupo) => {
    const bloco = document.createElement("div");
    bloco.className = "grupo-frases";

    const titulo = document.createElement("h3");
    titulo.textContent = grupo.titulo;
    bloco.appendChild(titulo);

    const chips = document.createElement("div");
    chips.className = "chips";

    grupo.frases.forEach((frase) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip vlibras-links";
      chip.textContent = frase;
      chip.addEventListener("click", () => aoEscolher(frase));
      chips.appendChild(chip);
    });

    bloco.appendChild(chips);
    recipiente.appendChild(bloco);
  });
}
