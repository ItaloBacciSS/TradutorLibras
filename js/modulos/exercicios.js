/* ==========================================================
   exercicios.js
   Cria os exercícios de uma lição e confere as respostas.
   Não mexe na tela: só recebe dados e devolve dados.

   Tipos de exercício:
     "ver"          Ver e aprender: apresenta a palavra e o sinal (sem nota)
     "que-sinal"    Que sinal é esse? O avatar faz o sinal, o aluno escolhe a palavra
     "qual-sinal"   Qual é o sinal? Aparece a palavra, o aluno escolhe entre sinais
     "monte-frase"  Monte a frase: o avatar sinaliza, o aluno monta em português

   REGRA DE OURO: o aluno nunca vê palavra que ainda não aprendeu.
   As opções erradas e as peças extras saem só de palavras já
   ensinadas (nesta lição, até aquele ponto, ou nas anteriores).
   ========================================================== */

/** Quantos exercícios de cada tipo (fora o "ver", que é um por palavra nova). */
export const QUANTIDADES = {
  opcoesQueSinal: 4, // palavras para escolher no "Que sinal é esse?"
  opcoesQualSinal: 3, // sinais para escolher no "Qual é o sinal?"
  qualSinal: 3, // quantos "Qual é o sinal?" por lição
  monteFrase: 3, // quantos "Monte a frase" por lição (se a lição tiver frases)
  pecasExtras: 2, // palavras "pegadinha" no "Monte a frase"
};

/**
 * Gera a lista de exercícios de uma lição.
 *
 * Lição normal: as palavras novas vêm de 2 em 2 (ver, ver, praticar,
 * praticar). Revisão: não tem "ver", só prática.
 * No fim entram "Qual é o sinal?" e "Monte a frase" misturados.
 *
 * @param {object} licao          uma lição de js/dados/licoes.js
 * @param {object[]} todasLicoes  todas as lições, em ordem
 * @param {() => number} [aleatorio]  troque nos testes para ter resultado previsível
 */
export function gerarExercicios(licao, todasLicoes, aleatorio = Math.random) {
  const embaralhar = (lista) => embaralharCom(lista, aleatorio);
  const anteriores = palavrasAnteriores(licao, todasLicoes);
  const palavras = [...licao.palavras];
  const exercicios = [];

  if (licao.revisao) {
    // Revisão: pratica todas as palavras, sem apresentar de novo
    embaralhar(palavras).forEach((palavra) =>
      exercicios.push(criarEscolha("que-sinal", palavra, palavras, anteriores, aleatorio)),
    );
  } else {
    // Lição normal: só usa como opção o que o aluno já viu
    const vistasNestaLicao = [];
    for (let i = 0; i < palavras.length; i += 2) {
      const dupla = palavras.slice(i, i + 2);
      dupla.forEach((palavra) => {
        exercicios.push({ tipo: "ver", palavra });
        vistasNestaLicao.push(palavra);
      });
      embaralhar(dupla).forEach((palavra) =>
        exercicios.push(criarEscolha("que-sinal", palavra, [...vistasNestaLicao], anteriores, aleatorio)),
      );
    }
  }

  // Final da lição: todas as palavras da lição já foram vistas
  const conhecidas = semRepetir([...palavras, ...anteriores]);
  const finais = [
    ...embaralhar(palavras)
      .slice(0, QUANTIDADES.qualSinal)
      .map((palavra) => criarEscolha("qual-sinal", palavra, palavras, anteriores, aleatorio)),
    ...embaralhar(licao.frases ?? [])
      .slice(0, QUANTIDADES.monteFrase)
      .map((frase) => criarMonteFrase(frase, conhecidas, aleatorio)),
  ];

  return [...exercicios, ...embaralhar(finais)];
}

/** Cria de novo o mesmo exercício com as opções em outra ordem (para repetir depois de um erro). */
export function refazerExercicio(exercicio, aleatorio = Math.random) {
  if (exercicio.tipo === "que-sinal" || exercicio.tipo === "qual-sinal") {
    const { preferidas, reserva } = exercicio.origem;
    return criarEscolha(exercicio.tipo, exercicio.resposta, preferidas, reserva, aleatorio);
  }
  if (exercicio.tipo === "monte-frase") {
    return criarMonteFrase(exercicio.resposta, exercicio.origem.conhecidas, aleatorio);
  }
  return { ...exercicio };
}

/**
 * Confere a resposta do aluno.
 * @param {object} exercicio
 * @param {string | string[]} resposta  palavra escolhida, ou lista de peças no "Monte a frase"
 */
export function conferirResposta(exercicio, resposta) {
  if (exercicio.tipo === "ver") return true;
  if (exercicio.tipo === "monte-frase") {
    const montada = Array.isArray(resposta) ? resposta.join(" ") : String(resposta ?? "");
    return normalizar(montada) === normalizar(exercicio.resposta);
  }
  return normalizar(resposta) === normalizar(exercicio.resposta);
}

/** "  Oi, Tudo BEM? " → "oi tudo bem" (ignora maiúsculas, pontuação e espaços extras). */
export function normalizar(texto) {
  return String(texto ?? "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Separa uma frase em peças (palavras) para o "Monte a frase". */
export function separarEmPecas(frase) {
  return normalizar(frase) === "" ? [] : String(frase).trim().split(/\s+/);
}

/**
 * Palavras ensinadas nas lições ANTES desta (na ordem da trilha).
 * Revisões não ensinam palavra nova, então não somam nada.
 */
export function palavrasAnteriores(licao, todasLicoes) {
  const indice = todasLicoes.findIndex((l) => l.id === licao.id);
  const antes = indice === -1 ? [] : todasLicoes.slice(0, indice);
  return semRepetir(antes.filter((l) => !l.revisao).flatMap((l) => l.palavras));
}

// ==========================================================
// Criação de cada tipo
// ==========================================================

/**
 * "Que sinal é esse?" ou "Qual é o sinal?".
 * Opções erradas: primeiro das "preferidas" (mesma lição, mais desafiador),
 * depois da "reserva" (lições anteriores).
 */
function criarEscolha(tipo, certa, preferidas, reserva, aleatorio) {
  const quantidade = (tipo === "que-sinal" ? QUANTIDADES.opcoesQueSinal : QUANTIDADES.opcoesQualSinal) - 1;
  const erradas = semRepetir([
    ...embaralharCom(preferidas, aleatorio),
    ...embaralharCom(reserva, aleatorio),
  ])
    .filter((p) => normalizar(p) !== normalizar(certa))
    .slice(0, quantidade);

  return {
    tipo,
    resposta: certa,
    opcoes: embaralharCom([certa, ...erradas], aleatorio),
    origem: { preferidas: [...preferidas], reserva: [...reserva] },
  };
}

function criarMonteFrase(frase, conhecidas, aleatorio) {
  const pecas = separarEmPecas(frase);
  const naFrase = new Set(pecas.map(normalizar));

  // Pegadinhas: palavras de UMA peça só, já ensinadas, que não estão nesta frase
  const candidatas = conhecidas.filter((p) => !p.includes(" ") && !naFrase.has(normalizar(p)));
  const extras = semRepetir(embaralharCom(candidatas, aleatorio)).slice(0, QUANTIDADES.pecasExtras);

  return {
    tipo: "monte-frase",
    resposta: frase,
    pecas: embaralharCom([...pecas, ...extras.map((p) => p.toLocaleLowerCase("pt-BR"))], aleatorio),
    origem: { conhecidas: [...conhecidas] },
  };
}

// ==========================================================
// Utilidades
// ==========================================================
/** Embaralha sem mudar a lista original (algoritmo de Fisher-Yates). */
export function embaralharCom(lista, aleatorio = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function semRepetir(lista) {
  const vistos = new Set();
  return lista.filter((item) => {
    const chave = normalizar(item);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/**
 * Confere se a lista de lições está bem escrita.
 * @param {object[]} licoes
 * @param {string[]} [conectores]  palavras de ligação liberadas nas frases
 * @returns {string[]} problemas encontrados (vazia = tudo certo)
 */
export function conferirLicoes(licoes, conectores = []) {
  const problemas = [];
  const ids = new Set();
  const ensinadas = new Map(); // palavra normalizada → lição onde foi ensinada
  const liberadasNasFrases = new Set(conectores.map(normalizar));

  licoes.forEach((licao, indice) => {
    const nome = `Lição nº ${indice + 1} (${licao.id ?? "sem id"})`;
    const ehRevisao = licao.revisao === true;

    if (!licao.id || !/^[a-z0-9-]+$/.test(licao.id)) problemas.push(`${nome}: "id" precisa ser minúsculo, sem espaço nem acento.`);
    if (ids.has(licao.id)) problemas.push(`${nome}: id repetido.`);
    ids.add(licao.id);
    if (!licao.titulo) problemas.push(`${nome}: falta "titulo".`);
    if (typeof licao.validado !== "boolean") problemas.push(`${nome}: "validado" precisa ser true ou false.`);

    // Palavras
    const [minimo, maximo] = ehRevisao ? [4, 10] : [4, 8];
    if (!Array.isArray(licao.palavras) || licao.palavras.length < minimo || licao.palavras.length > maximo) {
      problemas.push(`${nome}: "palavras" precisa ter de ${minimo} a ${maximo} itens.`);
      return;
    }
    if (semRepetir(licao.palavras).length !== licao.palavras.length) problemas.push(`${nome}: tem palavra repetida.`);

    licao.palavras.forEach((palavra) => {
      const chave = normalizar(palavra);
      if (ehRevisao && !ensinadas.has(chave)) {
        problemas.push(`${nome}: a revisão usa "${palavra}", que não foi ensinada antes.`);
      }
      if (!ehRevisao && ensinadas.has(chave)) {
        problemas.push(`${nome}: "${palavra}" já foi ensinada na lição ${ensinadas.get(chave)}.`);
      }
    });
    if (!ehRevisao) licao.palavras.forEach((palavra) => ensinadas.set(normalizar(palavra), licao.id));

    // Frases: só palavras já ensinadas (até esta lição) + conectores
    const conhecidas = new Set(liberadasNasFrases);
    ensinadas.forEach((_, palavra) => palavra.split(" ").forEach((parte) => conhecidas.add(parte)));

    if (!Array.isArray(licao.frases) || licao.frases.length < 1 || licao.frases.length > 3) {
      problemas.push(`${nome}: "frases" precisa ter de 1 a 3 itens.`);
      return;
    }
    licao.frases.forEach((frase) => {
      const pecas = separarEmPecas(frase);
      if (pecas.length < 2 || pecas.length > 6) problemas.push(`${nome}: a frase "${frase}" precisa ter de 2 a 6 palavras.`);
      if (/[.,!?;:]/.test(frase)) problemas.push(`${nome}: a frase "${frase}" não deve ter pontuação.`);
      pecas
        .filter((peca) => !conhecidas.has(normalizar(peca)))
        .forEach((peca) => problemas.push(`${nome}: a frase "${frase}" usa "${peca}", que ainda não foi ensinada.`));
    });
  });

  return problemas;
}
