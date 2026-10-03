/* ==========================================================
   licao.js
   Tela de uma lição: mostra um exercício por vez, confere a
   resposta e dá o retorno (certo/errado), estilo Duolingo.

   Regras:
   - A nota conta só a PRIMEIRA tentativa de cada exercício.
   - Errou? O exercício volta no fim da lição (uma vez).
   - Atalhos: Enter = Verificar/Continuar; 1, 2, 3, 4 = escolher opção.
   ========================================================== */

import { gerarExercicios, refazerExercicio, conferirResposta } from "./exercicios.js";

const ELOGIOS = ["Mandou bem!", "Isso aí!", "Acertou!", "Muito bem!", "Arrasou!"];
const CONSOLOS = ["Quase!", "Não foi dessa vez.", "Vamos de novo depois."];

const ICONES = {
  fechar: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  repetir: '<polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
  olho: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
};

/**
 * @param {object} opcoes
 * @param {HTMLElement} opcoes.elemento         onde a lição é desenhada
 * @param {object} opcoes.licao
 * @param {object[]} opcoes.todasLicoes
 * @param {(texto: string) => Promise<void>} opcoes.sinalizar  faz o avatar sinalizar
 * @param {(resultado: { acertos: number, total: number }) => void} opcoes.aoTerminar
 * @param {() => void} opcoes.aoSair
 * @param {() => number} [opcoes.aleatorio]
 */
export function iniciarLicao({ elemento, licao, todasLicoes, sinalizar, aoTerminar, aoSair, aleatorio = Math.random }) {
  // ---------- Estado ----------
  const fila = gerarExercicios(licao, todasLicoes, aleatorio).map((exercicio, id) => ({ ...exercicio, id }));
  const total = fila.filter((e) => e.tipo !== "ver").length;
  const jaRepetidos = new Set();
  let concluidos = 0;
  let acertos = 0;
  let atual = null;
  let resposta = null; // palavra escolhida ou lista de peças
  let fase = "respondendo"; // "respondendo" | "retorno"

  // ---------- Estrutura da tela ----------
  elemento.innerHTML = "";
  const raiz = criar("div", "licao");

  const topo = criar("div", "licao__topo");
  const sair = botaoIcone(ICONES.fechar, "Sair da lição");
  sair.addEventListener("click", aoSair);
  const barra = criar("div", "barra-progresso");
  barra.setAttribute("role", "progressbar");
  barra.setAttribute("aria-label", "Progresso da lição");
  barra.setAttribute("aria-valuemin", "0");
  barra.setAttribute("aria-valuemax", "100");
  const preenchimento = criar("div", "barra-progresso__cheia");
  barra.append(preenchimento);
  topo.append(sair, barra);

  const conteudo = criar("div", "licao__conteudo");
  conteudo.setAttribute("aria-live", "polite");

  const rodape = criar("div", "licao__rodape");
  const retorno = criar("div", "licao__retorno");
  retorno.setAttribute("role", "status");
  const principal = criar("button", "botao botao--grande licao__principal vlibras-links", "Verificar");
  principal.type = "button";
  principal.addEventListener("click", aoClicarPrincipal);
  rodape.append(retorno, principal);

  raiz.append(topo, conteudo, rodape);
  elemento.append(raiz);
  raiz.addEventListener("keydown", atalhos);

  proximo();

  // ==========================================================
  // Fluxo
  // ==========================================================
  function proximo() {
    atual = fila.shift();
    if (!atual) {
      aoTerminar({ acertos, total });
      return;
    }
    resposta = atual.tipo === "monte-frase" ? [] : null;
    fase = "respondendo";
    rodape.dataset.estado = "neutro";
    retorno.textContent = "";
    atualizarBarra();
    desenharExercicio();
  }

  function aoClicarPrincipal() {
    if (atual.tipo === "ver" || fase === "retorno") {
      concluidos++;
      proximo();
      return;
    }
    verificar();
  }

  function verificar() {
    if (!temResposta()) return;
    const acertou = conferirResposta(atual, resposta);
    const primeiraTentativa = !jaRepetidos.has(atual.id);

    if (acertou && primeiraTentativa) acertos++;
    if (!acertou && primeiraTentativa) {
      jaRepetidos.add(atual.id);
      fila.push({ ...refazerExercicio(atual, aleatorio), id: atual.id });
    }

    fase = "retorno";
    rodape.dataset.estado = acertou ? "certo" : "errado";
    retorno.innerHTML = "";
    retorno.append(
      criar("strong", "licao__retorno-titulo", sortear(acertou ? ELOGIOS : CONSOLOS)),
      ...(acertou ? [] : [criar("span", "licao__retorno-texto", `Resposta certa: “${atual.resposta}”`)]),
    );
    principal.textContent = "Continuar";
    principal.disabled = false;
    conteudo.querySelectorAll("[data-opcao], .peca").forEach((b) => (b.disabled = true));
    marcarOpcoes(acertou);
    principal.focus();
  }

  // ==========================================================
  // Desenho de cada tipo de exercício
  // ==========================================================
  function desenharExercicio() {
    conteudo.innerHTML = "";
    conteudo.dataset.tipo = atual.tipo;
    principal.textContent = atual.tipo === "ver" ? "Continuar" : "Verificar";
    principal.disabled = atual.tipo !== "ver";

    if (atual.tipo === "ver") desenharVer();
    if (atual.tipo === "que-sinal") desenharQueSinal();
    if (atual.tipo === "qual-sinal") desenharQualSinal();
    if (atual.tipo === "monte-frase") desenharMonteFrase();

    // Foco no primeiro botão útil (ajuda quem usa teclado)
    (conteudo.querySelector("[data-opcao], .peca") ?? principal).focus({ preventScroll: true });
  }

  function desenharVer() {
    conteudo.append(
      criar("span", "licao__etiqueta", "Palavra nova"),
      criar("p", "licao__palavra", atual.palavra),
      criar("p", "licao__instrucao", "Olhe o avatar fazendo o sinal desta palavra."),
      botaoRever(atual.palavra, "Ver o sinal de novo"),
    );
    mostrarSinal(atual.palavra);
  }

  function desenharQueSinal() {
    conteudo.append(
      criar("h2", "licao__pergunta", "Que sinal é esse?"),
      criar("p", "licao__instrucao", "Olhe o avatar e escolha a palavra."),
      botaoRever(atual.resposta, "Ver o sinal de novo"),
    );
    const grade = criar("div", "opcoes");
    atual.opcoes.forEach((opcao, i) => {
      const botao = criar("button", "opcao vlibras-links");
      botao.type = "button";
      botao.dataset.opcao = opcao;
      botao.append(criar("span", "opcao__numero", String(i + 1)), criar("span", "opcao__texto", opcao));
      botao.addEventListener("click", () => escolher(opcao));
      grade.append(botao);
    });
    conteudo.append(grade);
    mostrarSinal(atual.resposta);
  }

  function desenharQualSinal() {
    const pergunta = criar("h2", "licao__pergunta");
    pergunta.append(texto("Qual é o sinal de "), criar("span", "licao__destaque", `“${atual.resposta}”`), texto("?"));
    conteudo.append(pergunta, criar("p", "licao__instrucao", "Toque em cada opção para ver o sinal e escolha o certo."));

    const grade = criar("div", "opcoes opcoes--sinais");
    atual.opcoes.forEach((opcao, i) => {
      const botao = criar("button", "opcao opcao--sinal vlibras-links");
      botao.type = "button";
      botao.dataset.opcao = opcao;
      botao.setAttribute("aria-label", `Sinal ${i + 1}: ver e escolher`);
      const olho = criar("span", "opcao__olho");
      olho.innerHTML = svg(ICONES.olho);
      botao.append(criar("span", "opcao__numero", String(i + 1)), criar("span", "opcao__texto", `Sinal ${i + 1}`), olho);
      botao.addEventListener("click", () => {
        escolher(opcao);
        mostrarSinal(opcao);
      });
      grade.append(botao);
    });
    conteudo.append(grade);
  }

  function desenharMonteFrase() {
    conteudo.append(
      criar("h2", "licao__pergunta", "Monte a frase"),
      criar("p", "licao__instrucao", "Olhe o avatar e toque nas palavras na ordem certa."),
      botaoRever(atual.resposta, "Ver a frase de novo"),
    );

    const montada = criar("div", "frase-montada");
    montada.setAttribute("aria-label", "Sua resposta");
    const banco = criar("div", "banco-pecas");
    banco.setAttribute("aria-label", "Palavras disponíveis");

    atual.pecas.forEach((peca) => {
      const botao = criar("button", "peca vlibras-links", peca);
      botao.type = "button";
      botao.addEventListener("click", () => {
        if (fase !== "respondendo") return;
        const naResposta = botao.parentElement === montada;
        (naResposta ? banco : montada).append(botao);
        resposta = [...montada.querySelectorAll(".peca")].map((p) => p.textContent);
        principal.disabled = !temResposta();
      });
      banco.append(botao);
    });

    conteudo.append(montada, banco);
    mostrarSinal(atual.resposta);
  }

  // ==========================================================
  // Ajudantes
  // ==========================================================
  function escolher(opcao) {
    if (fase !== "respondendo") return;
    resposta = opcao;
    conteudo.querySelectorAll("[data-opcao]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.opcao === opcao));
    });
    principal.disabled = false;
  }

  function marcarOpcoes(acertou) {
    conteudo.querySelectorAll("[data-opcao]").forEach((b) => {
      if (b.dataset.opcao === atual.resposta) b.dataset.resultado = "certo";
      else if (b.dataset.opcao === resposta && !acertou) b.dataset.resultado = "errado";
    });
    conteudo.querySelector(".frase-montada")?.setAttribute("data-resultado", acertou ? "certo" : "errado");
  }

  function temResposta() {
    return Array.isArray(resposta) ? resposta.length > 0 : Boolean(resposta);
  }

  async function mostrarSinal(textoDoSinal) {
    conteudo.querySelector(".licao__aviso")?.remove();
    try {
      await sinalizar(textoDoSinal);
    } catch (erro) {
      const aviso = criar("p", "licao__aviso", `${erro.message ?? "Não consegui mostrar o sinal."} Toque em “ver de novo”.`);
      conteudo.append(aviso);
    }
  }

  function botaoRever(textoDoSinal, rotulo) {
    const botao = criar("button", "botao botao--secundario botao--pequeno licao__rever vlibras-links");
    botao.type = "button";
    botao.innerHTML = svg(ICONES.repetir);
    botao.append(texto(` ${rotulo}`));
    botao.addEventListener("click", () => mostrarSinal(textoDoSinal));
    return botao;
  }

  function atualizarBarra() {
    const porcentagem = Math.round((concluidos / (concluidos + fila.length + 1)) * 100);
    preenchimento.style.width = `${porcentagem}%`;
    barra.setAttribute("aria-valuenow", String(porcentagem));
  }

  function atalhos(evento) {
    if (evento.key === "Enter" && evento.target.tagName !== "BUTTON") {
      evento.preventDefault();
      if (!principal.disabled) principal.click();
      return;
    }
    if (/^[1-9]$/.test(evento.key) && fase === "respondendo") {
      const opcao = conteudo.querySelectorAll("[data-opcao]")[Number(evento.key) - 1];
      opcao?.click();
    }
  }

  function sortear(lista) {
    return lista[Math.floor(aleatorio() * lista.length)];
  }

  return {
    /** Para os testes: quantos exercícios faltam. */
    restantes: () => fila.length + (atual ? 1 : 0),
  };
}

// ==========================================================
// Criação de elementos (sempre com textContent)
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

function svg(conteudo) {
  return `<svg class="icone icone--pequeno" viewBox="0 0 24 24" aria-hidden="true">${conteudo}</svg>`;
}

function botaoIcone(icone, rotulo) {
  const botao = criar("button", "botao-icone botao-icone--pequeno vlibras-links");
  botao.type = "button";
  botao.setAttribute("aria-label", rotulo);
  botao.title = rotulo;
  botao.innerHTML = svg(icone);
  return botao;
}
