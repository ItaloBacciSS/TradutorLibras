/* ==========================================================
   voz.js
   Entrada por voz: o aluno fala e o texto aparece no campo.
   Funciona no Chrome e no Edge. Em navegadores sem suporte,
   o botão do microfone continua escondido.
   ========================================================== */

import { IDIOMA_VOZ } from "./config.js";

/** Mensagens para cada erro que o navegador pode devolver. */
export const MENSAGENS_VOZ = {
  "not-allowed": "O microfone foi bloqueado. Libere o microfone no cadeado da barra de endereço.",
  "service-not-allowed": "O navegador não deixou usar o reconhecimento de voz.",
  "audio-capture": "Nenhum microfone encontrado. Confira se ele está conectado.",
  "no-speech": "Não ouvi nada. Clique no microfone e fale de novo.",
  network: "Sem internet para reconhecer a voz.",
  padrao: "Não foi possível usar o microfone.",
};

/**
 * Liga o botão de voz.
 * @param {object} opcoes
 * @param {HTMLButtonElement} opcoes.botao  botão do microfone
 * @param {HTMLTextAreaElement} opcoes.campo  campo de texto
 * @param {() => void} opcoes.aoMudarTexto  chamado quando o texto muda
 * @param {(mensagem: string) => void} opcoes.aoErro  mostra um erro
 * @param {() => void} opcoes.aoTerminar  chamado quando para de ouvir
 * @returns {boolean} true se o navegador tem suporte
 */
export function configurarVoz({ botao, campo, aoMudarTexto, aoErro, aoTerminar }) {
  const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Reconhecimento) return false;

  let reconhecimento;
  try {
    reconhecimento = new Reconhecimento();
  } catch {
    return false;
  }

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
      /* já estava gravando: ignora o clique repetido */
    }
  });

  reconhecimento.addEventListener("start", () => {
    gravando = true;
    botao.classList.add("botao-icone--gravando");
    botao.setAttribute("aria-label", "Parar de ouvir");
    campo.placeholder = "Ouvindo… fale em português";
  });

  reconhecimento.addEventListener("result", (evento) => {
    let falado = "";
    for (const resultado of evento.results) falado += resultado[0].transcript;
    const novoTexto = (textoAnterior ? textoAnterior + " " : "") + falado.trim();
    campo.value = novoTexto.slice(0, campo.maxLength > 0 ? campo.maxLength : undefined);
    aoMudarTexto();
  });

  reconhecimento.addEventListener("end", () => {
    gravando = false;
    botao.classList.remove("botao-icone--gravando");
    botao.setAttribute("aria-label", "Falar em vez de digitar");
    campo.placeholder = "Digite aqui… Ex.: Bom dia!";
    aoTerminar?.();
  });

  reconhecimento.addEventListener("error", (evento) => {
    if (evento.error === "aborted") return; // o próprio aluno parou
    aoErro(MENSAGENS_VOZ[evento.error] || MENSAGENS_VOZ.padrao);
  });

  return true;
}
