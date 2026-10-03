/* ==========================================================
   voz.js
   Entrada por voz: o aluno fala e o texto aparece no campo.
   Funciona no Chrome e no Edge. Em navegadores sem suporte,
   o botão "Falar" continua escondido.
   ========================================================== */

import { IDIOMA_VOZ } from "./config.js";

const MENSAGENS_DE_ERRO = {
  "not-allowed": "Permita o uso do microfone para falar.",
  "no-speech": "Não ouvi nada. Tente de novo.",
  network: "Sem conexão para reconhecer a voz.",
};

/**
 * Liga o botão de voz.
 * @param {object} opcoes
 * @param {HTMLButtonElement} opcoes.botao  botão "Falar"
 * @param {HTMLTextAreaElement} opcoes.campo  campo de texto
 * @param {() => void} opcoes.aoMudarTexto  chamado quando o texto muda
 * @param {(mensagem: string, tipo?: string) => void} opcoes.aoStatus  mostra mensagens
 */
export function configurarVoz({ botao, campo, aoMudarTexto, aoStatus }) {
  const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Reconhecimento) return;

  const reconhecimento = new Reconhecimento();
  reconhecimento.lang = IDIOMA_VOZ;
  reconhecimento.interimResults = true;
  reconhecimento.continuous = false;

  let gravando = false;
  let textoAnterior = "";

  botao.hidden = false;

  botao.addEventListener("click", () => {
    if (gravando) {
      reconhecimento.stop();
      return;
    }
    textoAnterior = campo.value.trim();
    try {
      reconhecimento.start();
    } catch {
      /* já estava gravando */
    }
  });

  reconhecimento.addEventListener("start", () => {
    gravando = true;
    botao.textContent = "Parar";
    botao.classList.add("botao--gravando");
    aoStatus("Ouvindo… fale em português.");
  });

  reconhecimento.addEventListener("result", (evento) => {
    let falado = "";
    for (const resultado of evento.results) falado += resultado[0].transcript;
    campo.value = (textoAnterior ? textoAnterior + " " : "") + falado.trim();
    aoMudarTexto();
  });

  reconhecimento.addEventListener("end", () => {
    gravando = false;
    botao.textContent = "Falar";
    botao.classList.remove("botao--gravando");
    if (campo.value.trim()) aoStatus("Pronto! Confira o texto e clique em Traduzir.");
  });

  reconhecimento.addEventListener("error", (evento) => {
    aoStatus(MENSAGENS_DE_ERRO[evento.error] || "Não foi possível usar o microfone.", "erro");
  });
}
