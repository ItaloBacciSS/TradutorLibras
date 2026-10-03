/* ==========================================================
   paginas/aprender.js
   Script principal da página "Aprender Libras".

   A página tem 3 telas (só uma aparece por vez):
     trilha     → lista de lições + pontos e sequência de dias
     licao      → os exercícios (js/modulos/licao.js)
     resultado  → estrelas e pontos ganhos
   ========================================================== */

import { LICOES } from "../dados/licoes.js";
import { conferirLicoes } from "../modulos/exercicios.js";
import { iniciarLicao } from "../modulos/licao.js";
import { desenharTrilha, estrelas } from "../modulos/trilha.js";
import { lerProgresso, registrarLicao, apagarProgresso, sequenciaAtual } from "../modulos/progresso.js";
import {
  iniciarVLibras,
  vlibrasDisponivel,
  garantirWidgetAberto,
  sinalizar,
  ErroVLibras,
  MENSAGENS_VLIBRAS,
} from "../modulos/vlibras.js";

// ==========================================================
// Elementos da página
// ==========================================================
const telas = {
  trilha: document.getElementById("tela-trilha"),
  carregando: document.getElementById("tela-carregando"),
  licao: document.getElementById("tela-licao"),
  resultado: document.getElementById("tela-resultado"),
};

const el = {
  trilha: document.getElementById("trilha"),
  xp: document.getElementById("placar-xp"),
  sequencia: document.getElementById("placar-sequencia"),
  concluidas: document.getElementById("placar-licoes"),
  apagar: document.getElementById("btn-apagar-progresso"),
  aviso: document.getElementById("aviso-trilha"),
  carregandoTexto: document.getElementById("carregando-texto"),
  carregandoAcoes: document.getElementById("carregando-acoes"),
  // Elemento escondido que o VLibras "lê" para fazer o sinal (a resposta não aparece na tela)
  alvo: document.getElementById("alvo-libras"),
};

let licaoAtual = null;

// ==========================================================
// Telas
// ==========================================================
function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, tela]) => (tela.hidden = chave !== nome));
  document.body.dataset.tela = nome;
  window.scrollTo({ top: 0 });
}

function atualizarPlacar(progresso = lerProgresso()) {
  const concluidas = LICOES.filter((l) => progresso.licoes[l.id]?.concluida).length;
  el.xp.textContent = String(progresso.xp);
  el.sequencia.textContent = String(sequenciaAtual(progresso));
  el.concluidas.textContent = `${concluidas}/${LICOES.length}`;
}

function mostrarTrilha() {
  const progresso = lerProgresso();
  atualizarPlacar(progresso);
  desenharTrilha(el.trilha, { licoes: LICOES, progresso, aoEscolher: comecarLicao });
  mostrarTela("trilha");
}

// ==========================================================
// Começar uma lição (abre o avatar antes)
// ==========================================================
async function comecarLicao(licao) {
  licaoAtual = licao;
  mostrarCarregando("Abrindo o avatar… na primeira vez leva alguns segundos.");

  try {
    await garantirWidgetAberto();
  } catch (erro) {
    mostrarErroAoAbrir(erro);
    return;
  }

  mostrarTela("licao");
  iniciarLicao({
    elemento: telas.licao,
    licao,
    todasLicoes: LICOES,
    sinalizar: sinalizarEscondido,
    aoTerminar: terminarLicao,
    aoSair: mostrarTrilha,
  });
}

/** Faz o avatar sinalizar sem mostrar a palavra na tela. */
async function sinalizarEscondido(texto) {
  await garantirWidgetAberto(); // reabre se o aluno fechou o avatar
  sinalizar(el.alvo, texto);
}

function mostrarCarregando(mensagem) {
  el.carregandoTexto.textContent = mensagem;
  el.carregandoAcoes.hidden = true;
  telas.carregando.dataset.estado = "carregando";
  mostrarTela("carregando");
}

function mostrarErroAoAbrir(erro) {
  const mensagem = erro instanceof ErroVLibras ? erro.message : "Algo deu errado ao abrir o avatar.";
  if (!(erro instanceof ErroVLibras)) console.error(erro);
  el.carregandoTexto.textContent = mensagem;
  el.carregandoAcoes.hidden = false;
  telas.carregando.dataset.estado = "erro";
}

// ==========================================================
// Fim da lição
// ==========================================================
function terminarLicao({ acertos, total }) {
  const resultado = registrarLicao(licaoAtual.id, acertos, total);
  const porcentagem = total ? Math.round((acertos / total) * 100) : 100;

  const caixaEstrelas = document.getElementById("resultado-estrelas");
  caixaEstrelas.replaceChildren(estrelas(resultado.estrelas, "estrelas estrelas--grandes"));
  caixaEstrelas.setAttribute("aria-label", `${resultado.estrelas} de 3 estrelas`);

  document.getElementById("resultado-titulo").textContent =
    resultado.estrelas === 3 ? "Perfeito!" : resultado.estrelas === 2 ? "Muito bem!" : "Lição concluída!";
  document.getElementById("resultado-licao").textContent = licaoAtual.titulo;
  document.getElementById("resultado-acertos").textContent = `${porcentagem}%`;
  document.getElementById("resultado-xp").textContent = `+${resultado.xpGanho}`;
  document.getElementById("resultado-sequencia").textContent = String(resultado.sequencia);

  atualizarPlacar();
  mostrarTela("resultado");
}

// ==========================================================
// Botões fixos
// ==========================================================
document.getElementById("btn-tentar-abrir").addEventListener("click", () => comecarLicao(licaoAtual));
document.getElementById("btn-voltar-trilha").addEventListener("click", mostrarTrilha);
document.getElementById("btn-resultado-trilha").addEventListener("click", mostrarTrilha);
document.getElementById("btn-resultado-repetir").addEventListener("click", () => comecarLicao(licaoAtual));

el.apagar.addEventListener("click", () => {
  if (el.apagar.dataset.confirmar !== "sim") {
    el.apagar.dataset.confirmar = "sim";
    el.apagar.textContent = "Clique de novo para apagar tudo";
    setTimeout(() => {
      el.apagar.dataset.confirmar = "";
      el.apagar.textContent = "Recomeçar do zero";
    }, 4000);
    return;
  }
  apagarProgresso();
  el.apagar.dataset.confirmar = "";
  el.apagar.textContent = "Recomeçar do zero";
  mostrarTrilha();
});

// ==========================================================
// Início
// ==========================================================
const problemas = conferirLicoes(LICOES);
if (problemas.length) console.warn("Problemas em js/dados/licoes.js:\n- " + problemas.join("\n- "));

if (!vlibrasDisponivel() || !iniciarVLibras()) {
  el.aviso.hidden = false;
  el.aviso.textContent = MENSAGENS_VLIBRAS.naoCarregou;
}

mostrarTrilha();
