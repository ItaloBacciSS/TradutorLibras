/* ==========================================================
   paginas/portugues-libras.js
   Script principal da página Português → Libras.
   Junta os módulos de js/modulos/ e liga os botões da tela.
   ========================================================== */

import { LIMITE_CARACTERES } from "../modulos/config.js";
import { iniciarVLibras, widgetPronto, garantirWidgetAberto, sinalizar } from "../modulos/vlibras.js";
import { adicionarAoHistorico, apagarHistorico, desenharHistorico } from "../modulos/historico.js";
import { desenharFrases } from "../modulos/frases.js";
import { configurarVoz } from "../modulos/voz.js";
import { mostrarStatus } from "../modulos/status.js";

// ---------- Elementos da página ----------
const tela = {
  campo: document.getElementById("texto"),
  contador: document.getElementById("contador"),
  status: document.getElementById("status"),
  alvo: document.getElementById("alvo-libras"),
  frases: document.getElementById("lista-frases"),
  historico: document.getElementById("historico"),
  btnTraduzir: document.getElementById("btn-traduzir"),
  btnFalar: document.getElementById("btn-falar"),
  btnRepetir: document.getElementById("btn-repetir"),
  btnLimpar: document.getElementById("btn-limpar"),
  btnApagarHistorico: document.getElementById("btn-apagar-historico"),
};

// ---------- Estado ----------
let ultimaFrase = "";
let traduzindo = false;

// ---------- Funções da página ----------
function avisar(mensagem, tipo) {
  mostrarStatus(tela.status, mensagem, tipo);
}

function atualizarContador() {
  tela.contador.textContent = `${tela.campo.value.length}/${LIMITE_CARACTERES}`;
}

function atualizarHistorico() {
  desenharHistorico(tela.historico, usarFrase);
}

/** Coloca a frase no campo e já traduz (usado pelas frases e pelo histórico). */
function usarFrase(frase) {
  tela.campo.value = frase;
  atualizarContador();
  traduzir(frase);
}

async function traduzir(textoInformado) {
  const texto = (textoInformado ?? tela.campo.value).trim();

  if (!texto) {
    avisar("Digite uma frase para traduzir.", "erro");
    tela.campo.focus();
    return;
  }
  if (traduzindo) return;

  traduzindo = true;
  tela.btnTraduzir.disabled = true;

  try {
    if (!widgetPronto()) {
      avisar("Carregando o avatar… (na primeira vez pode levar alguns segundos)");
    }
    await garantirWidgetAberto();

    tela.alvo.classList.remove("em-libras--vazio");
    sinalizar(tela.alvo, texto);

    ultimaFrase = texto;
    tela.btnRepetir.disabled = false;
    adicionarAoHistorico(texto);
    atualizarHistorico();
    avisar("Traduzindo… acompanhe o avatar no canto da tela.", "ok");
  } catch (erro) {
    console.error(erro);
    avisar(erro.message, "erro");
  } finally {
    traduzindo = false;
    tela.btnTraduzir.disabled = false;
  }
}

// ---------- Eventos ----------
tela.campo.addEventListener("input", atualizarContador);

tela.campo.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
    evento.preventDefault();
    traduzir();
  }
});

tela.btnTraduzir.addEventListener("click", () => traduzir());

tela.btnRepetir.addEventListener("click", () => {
  if (ultimaFrase) traduzir(ultimaFrase);
});

tela.btnLimpar.addEventListener("click", () => {
  tela.campo.value = "";
  atualizarContador();
  avisar("");
  tela.campo.focus();
});

tela.btnApagarHistorico.addEventListener("click", () => {
  apagarHistorico();
  atualizarHistorico();
});

// ---------- Início ----------
if (!iniciarVLibras()) {
  avisar("O VLibras não carregou. Verifique a conexão com a internet.", "erro");
}
desenharFrases(tela.frases, usarFrase);
atualizarHistorico();
atualizarContador();
configurarVoz({
  botao: tela.btnFalar,
  campo: tela.campo,
  aoMudarTexto: atualizarContador,
  aoStatus: avisar,
});
