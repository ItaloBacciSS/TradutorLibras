/* ==========================================================
   sugestoes.js
   "Motor" das sugestões: procura na frase os trechos que
   aparecem em js/dados/sugestoes.js e monta as sugestões.
   Não mexe na tela: só recebe texto e devolve resultados.
   ========================================================== */

import { REGRAS, CATEGORIAS } from "../dados/sugestoes.js";

/** Letra (com acento) ou número. Usado para achar só palavras inteiras. */
const LETRA_OU_NUMERO = /[\p{L}\p{N}]/u;

/**
 * @typedef {object} Sugestao
 * @property {string} chave        identifica a sugestão (para "Manter como está")
 * @property {"troca" | "escolha"} tipo
 * @property {string} trecho       o que o aluno escreveu
 * @property {number} inicio       posição do trecho no texto
 * @property {number} fim
 * @property {string} categoria    nome da categoria (ex.: "Gíria")
 * @property {string} explicacao   o "por quê?"
 * @property {{ rotulo: string | null, trocar: string }[]} opcoes
 * @property {boolean} validado
 */

/**
 * Procura sugestões para um texto.
 * @param {string} texto
 * @param {object} [opcoes]
 * @param {object[]} [opcoes.regras]     lista de regras (padrão: js/dados/sugestoes.js)
 * @param {Set<string>} [opcoes.ignoradas]  chaves que o aluno mandou manter
 * @returns {Sugestao[]} em ordem de aparição no texto
 */
export function encontrarSugestoes(texto, { regras = REGRAS, ignoradas = new Set() } = {}) {
  if (typeof texto !== "string" || texto.trim() === "") return [];

  const base = minusculas(texto);
  const frasesProtegidas = frasesDeSubstituicao(regras);
  const candidatos = [];

  regras.forEach((regra, indice) => {
    for (const termo of regra.procurar ?? []) {
      const alvo = minusculas(termo);
      if (!alvo) continue;

      let posicao = base.indexOf(alvo);
      while (posicao !== -1) {
        const fim = posicao + alvo.length;
        if (ehBorda(base, posicao - 1) && ehBorda(base, fim)) {
          candidatos.push({ regra, indice, inicio: posicao, fim });
        }
        posicao = base.indexOf(alvo, posicao + 1);
      }
    }
  });

  // Mais longos primeiro: "que pena" ganha de "pena"
  candidatos.sort((a, b) => b.fim - b.inicio - (a.fim - a.inicio) || a.inicio - b.inicio);

  const ocupados = [];
  const resultado = [];

  for (const candidato of candidatos) {
    const sobrepoe = ocupados.some((o) => candidato.inicio < o.fim && o.inicio < candidato.fim);
    if (sobrepoe) continue;
    ocupados.push(candidato); // mesmo ignorado, o trecho continua "ocupado"

    const trecho = texto.slice(candidato.inicio, candidato.fim);
    const chave = `${candidato.indice}|${minusculas(trecho)}`;
    const protegidas = [...(candidato.regra.exceto ?? []).map(minusculas), ...frasesProtegidas];

    if (ignoradas.has(chave)) continue;
    if (estaDentroDeAlguma(base, candidato, protegidas)) continue;
    if (!candidato.regra.opcoes && minusculas(candidato.regra.trocar ?? "") === minusculas(trecho)) continue;

    resultado.push(montarSugestao(candidato, trecho, chave));
  }

  return resultado.sort((a, b) => a.inicio - b.inicio);
}

/**
 * Aplica uma sugestão no texto, mantendo a letra maiúscula do começo.
 * @param {string} texto
 * @param {Sugestao} sugestao
 * @param {string} trocarPor  uma das opcoes[].trocar
 */
export function aplicarSugestao(texto, sugestao, trocarPor) {
  const novo = ajustarMaiusculas(sugestao.trecho, trocarPor);
  return texto.slice(0, sugestao.inicio) + novo + texto.slice(sugestao.fim);
}

/**
 * Confere se a lista de regras está bem escrita.
 * Útil depois de editar js/dados/sugestoes.js.
 * @returns {string[]} lista de problemas (vazia = tudo certo)
 */
export function conferirRegras(regras = REGRAS) {
  const problemas = [];
  const vistos = new Map();

  regras.forEach((regra, indice) => {
    const nome = `Regra nº ${indice + 1} (${JSON.stringify(regra.procurar)})`;

    if (!CATEGORIAS[regra.categoria]) problemas.push(`${nome}: categoria "${regra.categoria}" não existe.`);
    if (!Array.isArray(regra.procurar) || regra.procurar.length === 0) {
      problemas.push(`${nome}: "procurar" precisa ser uma lista com pelo menos um item.`);
      return;
    }

    const temTroca = typeof regra.trocar === "string" && regra.trocar.trim() !== "";
    const temOpcoes = Array.isArray(regra.opcoes);
    if (temTroca === temOpcoes) problemas.push(`${nome}: use "trocar" OU "opcoes" (um dos dois).`);
    if (temOpcoes && regra.opcoes.length < 2) problemas.push(`${nome}: "opcoes" precisa de pelo menos 2 escolhas.`);
    if (temOpcoes && regra.opcoes.some((o) => !o.rotulo || !o.trocar)) {
      problemas.push(`${nome}: toda opção precisa de "rotulo" e "trocar".`);
    }
    if (typeof regra.validado !== "boolean") problemas.push(`${nome}: "validado" precisa ser true ou false.`);

    regra.procurar.forEach((termo) => {
      const chave = minusculas(termo ?? "").trim();
      if (!chave) problemas.push(`${nome}: tem um termo vazio em "procurar".`);
      if (chave !== minusculas(termo ?? "")) problemas.push(`${nome}: "${termo}" tem espaço sobrando.`);
      if (vistos.has(chave)) problemas.push(`${nome}: "${termo}" já aparece na regra nº ${vistos.get(chave) + 1}.`);
      vistos.set(chave, indice);
      if (temTroca && minusculas(regra.trocar) === chave) problemas.push(`${nome}: "${termo}" é trocado por ele mesmo.`);
    });
  });

  return problemas;
}

// ==========================================================
// Funções internas
// ==========================================================
function minusculas(texto) {
  return String(texto).toLocaleLowerCase("pt-BR");
}

function ehBorda(texto, posicao) {
  if (posicao < 0 || posicao >= texto.length) return true;
  return !LETRA_OU_NUMERO.test(texto[posicao]);
}

/** Todas as frases que as regras sugerem (para não sugerir de novo dentro delas). */
const cacheDeFrases = new WeakMap();
function frasesDeSubstituicao(regras) {
  if (!cacheDeFrases.has(regras)) {
    const frases = new Set();
    regras.forEach((regra) => {
      if (regra.trocar) frases.add(minusculas(regra.trocar));
      (regra.opcoes ?? []).forEach((opcao) => frases.add(minusculas(opcao.trocar)));
    });
    cacheDeFrases.set(regras, [...frases]);
  }
  return cacheDeFrases.get(regras);
}

/** O trecho está dentro de uma frase protegida maior? (ex.: "manga" dentro de "manga da camisa") */
function estaDentroDeAlguma(base, candidato, frases) {
  const tamanho = candidato.fim - candidato.inicio;
  return frases.some((frase) => {
    if (frase.length <= tamanho) return false;
    let posicao = base.indexOf(frase);
    while (posicao !== -1) {
      if (posicao <= candidato.inicio && posicao + frase.length >= candidato.fim) return true;
      posicao = base.indexOf(frase, posicao + 1);
    }
    return false;
  });
}

function montarSugestao(candidato, trecho, chave) {
  const { regra } = candidato;
  const categoria = CATEGORIAS[regra.categoria] ?? { nome: "Dica", explicacao: "" };
  return {
    chave,
    tipo: regra.opcoes ? "escolha" : "troca",
    trecho,
    inicio: candidato.inicio,
    fim: candidato.fim,
    categoria: categoria.nome,
    explicacao: regra.explicacao ?? categoria.explicacao,
    opcoes: regra.opcoes ?? [{ rotulo: null, trocar: regra.trocar }],
    validado: regra.validado === true,
  };
}

/** "Vc" → "Você"; "VC" → "VOCÊ"; "vc" → "você". */
function ajustarMaiusculas(original, novo) {
  const letras = original.replace(/[^\p{L}]/gu, "");
  if (letras.length > 1 && letras === letras.toLocaleUpperCase("pt-BR")) {
    return novo.toLocaleUpperCase("pt-BR");
  }
  const primeira = original.charAt(0);
  if (primeira !== primeira.toLocaleLowerCase("pt-BR")) {
    return novo.charAt(0).toLocaleUpperCase("pt-BR") + novo.slice(1);
  }
  return novo;
}
