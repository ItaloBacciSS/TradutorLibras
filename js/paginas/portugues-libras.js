/* ==========================================================
   paginas/portugues-libras.js
   Script principal da página Português → Libras.
   Junta os módulos de js/modulos/ e liga os elementos da tela.
   ========================================================== */

import { LIMITE_CARACTERES } from "../modulos/config.js";
import { prepararTexto } from "../modulos/validacao.js";
import {
  iniciarVLibras,
  vlibrasDisponivel,
  widgetPronto,
  garantirWidgetAberto,
  sinalizar,
  ErroVLibras,
  MENSAGENS_VLIBRAS,
} from "../modulos/vlibras.js";
import { lerHistorico, adicionarAoHistorico, apagarHistorico } from "../modulos/historico.js";
import { GRUPOS_DE_FRASES, desenharChips } from "../modulos/frases.js";
import { criarAbas } from "../modulos/abas.js";
import { criarBalao } from "../modulos/balao.js";
import { configurarVoz } from "../modulos/voz.js";
import { encontrarSugestoes, conferirRegras } from "../modulos/sugestoes.js";
import { criarCartaoSugestao } from "../modulos/cartao-sugestao.js";

// ==========================================================
// Elementos da página
// ==========================================================
const tela = {
  campo: document.getElementById("campo"),
  texto: document.getElementById("texto"),
  contador: document.getElementById("contador"),
  btnTraduzir: document.getElementById("btn-traduzir"),
  btnLimpar: document.getElementById("btn-limpar"),
  btnFalar: document.getElementById("btn-falar"),
  abas: document.getElementById("abas"),
  painelFrases: document.getElementById("painel-frases"),
};

const balao = criarBalao({
  balao: document.getElementById("balao"),
  mensagem: document.getElementById("balao-mensagem"),
  frase: document.getElementById("alvo-libras"),
  botao: document.getElementById("btn-acao-balao"),
  textoBotao: document.getElementById("btn-acao-balao-texto"),
});

const cartaoSugestao = criarCartaoSugestao({
  elemento: document.getElementById("sugestao"),
  aoAplicar: (novoTexto) => {
    tela.texto.value = novoTexto;
    aoMudarTexto();
    atualizarSugestoes();
    tela.texto.focus();
  },
  aoManter: (sugestao) => {
    sugestoesMantidas.add(sugestao.chave);
    atualizarSugestoes();
  },
});

const ROTULO_TRADUZIR = tela.btnTraduzir.firstChild.textContent.trim();

// ==========================================================
// Estado
// ==========================================================
let traduzindo = false;
let abas;
let esperaSugestoes;
/** Sugestões que o aluno mandou "manter como está" (valem até recarregar a página). */
const sugestoesMantidas = new Set();

// ==========================================================
// Tradução
// ==========================================================
async function traduzir(textoBruto = tela.texto.value) {
  if (traduzindo) return; // evita cliques repetidos

  const resultado = prepararTexto(textoBruto);
  if (!resultado.ok) {
    marcarErroNoCampo();
    balao.erro(resultado.mensagem);
    tela.texto.focus();
    return;
  }

  const texto = resultado.texto;
  definirTraduzindo(true);

  try {
    if (!widgetPronto()) balao.carregando();
    await garantirWidgetAberto();

    const alvo = balao.sinalizando(() => traduzir(texto));
    sinalizar(alvo, texto);

    adicionarAoHistorico(texto);
    if (abas?.abaAtiva() === "recentes") abas.redesenhar();
  } catch (erro) {
    mostrarErroDeTraducao(erro, texto);
  } finally {
    definirTraduzindo(false);
  }
}

function mostrarErroDeTraducao(erro, texto) {
  if (erro instanceof ErroVLibras && erro.codigo === "naoCarregou") {
    balao.erro(erro.message, { rotulo: "Recarregar", acao: () => location.reload() });
    return;
  }

  // Erro conhecido (sem internet, demorou) ou inesperado: oferece tentar de novo
  const mensagem = erro instanceof ErroVLibras ? erro.message : "Algo deu errado na tradução. Tente de novo.";
  if (!(erro instanceof ErroVLibras)) console.error(erro);
  balao.erro(mensagem, { rotulo: "Tentar de novo", acao: () => traduzir(texto) });
}

function definirTraduzindo(ativo) {
  traduzindo = ativo;
  tela.btnTraduzir.disabled = ativo;
  tela.btnTraduzir.firstChild.textContent = ativo ? "Traduzindo… " : `${ROTULO_TRADUZIR} `;
}

/** Usado pelas frases prontas e pelos recentes. */
function usarFrase(frase) {
  tela.texto.value = frase;
  aoMudarTexto();
  atualizarSugestoes();
  traduzir(frase);
}

// ==========================================================
// Sugestões ("Dica de Libras")
// ==========================================================
function atualizarSugestoes() {
  clearTimeout(esperaSugestoes);
  const texto = tela.texto.value;
  cartaoSugestao.mostrar(encontrarSugestoes(texto, { ignoradas: sugestoesMantidas }), texto);
}

/** Espera o aluno parar de digitar um instante antes de sugerir. */
function agendarSugestoes() {
  clearTimeout(esperaSugestoes);
  esperaSugestoes = setTimeout(atualizarSugestoes, 400);
}

// ==========================================================
// Campo de texto
// ==========================================================
function aoMudarTexto() {
  const tamanho = tela.texto.value.length;
  tela.contador.textContent = `${tamanho}/${LIMITE_CARACTERES}`;
  tela.contador.classList.toggle("campo__contador--limite", tamanho >= LIMITE_CARACTERES);
  tela.btnLimpar.hidden = tamanho === 0;
  tela.campo.classList.remove("campo--erro");
}

function marcarErroNoCampo() {
  tela.campo.classList.remove("campo--erro");
  void tela.campo.offsetWidth; // reinicia a animação de "tremer"
  tela.campo.classList.add("campo--erro");
}

tela.texto.addEventListener("input", () => {
  aoMudarTexto();
  agendarSugestoes();
});

// Enter traduz. Shift + Enter pula linha.
tela.texto.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter" && !evento.shiftKey && !evento.isComposing) {
    evento.preventDefault();
    traduzir();
  }
});

tela.btnTraduzir.addEventListener("click", () => traduzir());

tela.btnLimpar.addEventListener("click", () => {
  tela.texto.value = "";
  aoMudarTexto();
  cartaoSugestao.esconder();
  if (balao.estado() === "erro") balao.inicial();
  tela.texto.focus();
});

// ==========================================================
// Abas "Experimente": grupos de frases + recentes
// ==========================================================
function desenharRecentes(painel) {
  const recentes = lerHistorico();

  if (recentes.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "experimente__vazio";
    vazio.textContent = "As frases que você traduzir aparecem aqui.";
    painel.appendChild(vazio);
    return;
  }

  desenharChips(painel, recentes, usarFrase, { suave: true });

  const rodape = document.createElement("div");
  rodape.className = "experimente__rodape";
  const apagar = document.createElement("button");
  apagar.type = "button";
  apagar.className = "botao-link vlibras-links";
  apagar.textContent = "Apagar recentes";
  apagar.addEventListener("click", () => {
    apagarHistorico();
    abas.redesenhar();
  });
  rodape.appendChild(apagar);
  painel.appendChild(rodape);
}

abas = criarAbas(tela.abas, tela.painelFrases, [
  ...GRUPOS_DE_FRASES.map((grupo) => ({
    id: grupo.id,
    titulo: grupo.titulo,
    desenhar: (painel) => desenharChips(painel, grupo.frases, usarFrase),
  })),
  { id: "recentes", titulo: "Recentes", desenhar: desenharRecentes },
]);

// ==========================================================
// Microfone
// ==========================================================
configurarVoz({
  botao: tela.btnFalar,
  campo: tela.texto,
  aoMudarTexto: () => {
    aoMudarTexto();
    agendarSugestoes();
  },
  aoErro: (mensagem) => balao.erro(mensagem),
  aoTerminar: () => {
    if (balao.estado() !== "erro" && tela.texto.value.trim()) tela.btnTraduzir.focus();
  },
});

// ==========================================================
// Internet caiu / voltou
// ==========================================================
window.addEventListener("offline", () => {
  balao.erro(MENSAGENS_VLIBRAS.semInternet);
});

window.addEventListener("online", () => {
  if (balao.estado() === "erro") balao.inicial();
});

// ==========================================================
// Início
// ==========================================================
aoMudarTexto();
balao.inicial();

// Avisa no console (F12) se alguma regra de js/dados/sugestoes.js estiver mal escrita
const problemasNasRegras = conferirRegras();
if (problemasNasRegras.length) {
  console.warn("Problemas em js/dados/sugestoes.js:\n- " + problemasNasRegras.join("\n- "));
}

if (!vlibrasDisponivel() || !iniciarVLibras()) {
  balao.erro(MENSAGENS_VLIBRAS.naoCarregou, { rotulo: "Recarregar", acao: () => location.reload() });
} else if (!navigator.onLine) {
  balao.erro(MENSAGENS_VLIBRAS.semInternet);
}
