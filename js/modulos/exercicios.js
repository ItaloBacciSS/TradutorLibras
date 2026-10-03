/* ==========================================================
   exercicios.js
   Cria os exercícios de uma lição e confere as respostas.
   Não mexe na tela: só recebe dados e devolve dados.

   Tipos de exercício:
     "ver"          Ver e aprender: apresenta a palavra e o sinal (sem nota)
     "que-sinal"    Que sinal é esse? O avatar faz o sinal, o aluno escolhe a palavra
     "qual-sinal"   Qual é o sinal? Aparece a palavra, o aluno escolhe entre sinais
     "monte-frase"  Monte a frase: o avatar sinaliza, o aluno monta em português
   ========================================================== */

/** Quantos exercícios de cada tipo (fora o "ver", que é um por palavra). */
export const QUANTIDADES = {
  opcoesQueSinal: 4, // palavras para escolher no "Que sinal é esse?"
  opcoesQualSinal: 3, // sinais para escolher no "Qual é o sinal?"
  qualSinal: 2, // quantos "Qual é o sinal?" por lição
  monteFrase: 2, // quantos "Monte a frase" por lição
  pecasExtras: 2, // palavras "pegadinha" no "Monte a frase"
};

/**
 * Gera a lista de exercícios de uma lição.
 *
 * Ordem: as palavras vêm de 2 em 2 (ver, ver, praticar, praticar),
 * e no fim entram "Qual é o sinal?" e "Monte a frase" misturados.
 *
 * @param {object} licao          uma lição de js/dados/licoes.js
 * @param {object[]} todasLicoes  todas as lições (para pegar opções erradas)
 * @param {() => number} [aleatorio]  troque nos testes para ter resultado previsível
 */
export function gerarExercicios(licao, todasLicoes, aleatorio = Math.random) {
  const embaralhar = (lista) => embaralharCom(lista, aleatorio);
  const palavras = [...licao.palavras];
  const exercicios = [];

  // 1) Palavras de 2 em 2: ver as duas, depois praticar as duas
  for (let i = 0; i < palavras.length; i += 2) {
    const dupla = palavras.slice(i, i + 2);
    dupla.forEach((palavra) => exercicios.push({ tipo: "ver", palavra }));
    embaralhar(dupla).forEach((palavra) =>
      exercicios.push(criarQueSinal(palavra, licao, todasLicoes, aleatorio)),
    );
  }

  // 2) Final da lição: "Qual é o sinal?" + "Monte a frase"
  const finais = [
    ...embaralhar(palavras)
      .slice(0, QUANTIDADES.qualSinal)
      .map((palavra) => criarQualSinal(palavra, licao, todasLicoes, aleatorio)),
    ...embaralhar(licao.frases ?? [])
      .slice(0, QUANTIDADES.monteFrase)
      .map((frase) => criarMonteFrase(frase, licao, todasLicoes, aleatorio)),
  ];

  return [...exercicios, ...embaralhar(finais)];
}

/** Cria de novo o mesmo exercício com as opções em outra ordem (para repetir depois de um erro). */
export function refazerExercicio(exercicio, licao, todasLicoes, aleatorio = Math.random) {
  if (exercicio.tipo === "que-sinal") return criarQueSinal(exercicio.resposta, licao, todasLicoes, aleatorio);
  if (exercicio.tipo === "qual-sinal") return criarQualSinal(exercicio.resposta, licao, todasLicoes, aleatorio);
  if (exercicio.tipo === "monte-frase") return criarMonteFrase(exercicio.resposta, licao, todasLicoes, aleatorio);
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

// ==========================================================
// Criação de cada tipo
// ==========================================================
function criarQueSinal(palavra, licao, todasLicoes, aleatorio) {
  const erradas = escolherErradas(palavra, licao, todasLicoes, QUANTIDADES.opcoesQueSinal - 1, aleatorio);
  return { tipo: "que-sinal", resposta: palavra, opcoes: embaralharCom([palavra, ...erradas], aleatorio) };
}

function criarQualSinal(palavra, licao, todasLicoes, aleatorio) {
  const erradas = escolherErradas(palavra, licao, todasLicoes, QUANTIDADES.opcoesQualSinal - 1, aleatorio);
  return { tipo: "qual-sinal", resposta: palavra, opcoes: embaralharCom([palavra, ...erradas], aleatorio) };
}

function criarMonteFrase(frase, licao, todasLicoes, aleatorio) {
  const pecas = separarEmPecas(frase);
  const naFrase = new Set(pecas.map(normalizar));

  // Pegadinhas: palavras soltas de outras frases/palavras, que não estão nesta frase
  const candidatas = [
    ...todasLicoes.flatMap((l) => (l.frases ?? []).flatMap(separarEmPecas)),
    ...todasLicoes.flatMap((l) => l.palavras.filter((p) => !p.includes(" "))),
  ].filter((p) => !naFrase.has(normalizar(p)));
  const extras = semRepetir(embaralharCom(candidatas, aleatorio)).slice(0, QUANTIDADES.pecasExtras);

  return {
    tipo: "monte-frase",
    resposta: frase,
    pecas: embaralharCom([...pecas, ...extras.map((p) => p.toLocaleLowerCase("pt-BR"))], aleatorio),
  };
}

/** Opções erradas: primeiro da mesma lição (mais desafiador), depois das outras. */
function escolherErradas(certa, licao, todasLicoes, quantidade, aleatorio) {
  const mesmaLicao = embaralharCom(licao.palavras.filter((p) => p !== certa), aleatorio);
  const outras = embaralharCom(
    todasLicoes.filter((l) => l.id !== licao.id).flatMap((l) => l.palavras),
    aleatorio,
  );
  return semRepetir([...mesmaLicao, ...outras].filter((p) => normalizar(p) !== normalizar(certa))).slice(
    0,
    quantidade,
  );
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
 * @returns {string[]} problemas encontrados (vazia = tudo certo)
 */
export function conferirLicoes(licoes) {
  const problemas = [];
  const ids = new Set();

  licoes.forEach((licao, indice) => {
    const nome = `Lição nº ${indice + 1} (${licao.id ?? "sem id"})`;
    if (!licao.id || !/^[a-z0-9-]+$/.test(licao.id)) problemas.push(`${nome}: "id" precisa ser minúsculo, sem espaço nem acento.`);
    if (ids.has(licao.id)) problemas.push(`${nome}: id repetido.`);
    ids.add(licao.id);
    if (!licao.titulo) problemas.push(`${nome}: falta "titulo".`);
    if (!Array.isArray(licao.palavras) || licao.palavras.length < 4 || licao.palavras.length > 8) {
      problemas.push(`${nome}: "palavras" precisa ter de 4 a 8 itens.`);
    } else if (semRepetir(licao.palavras).length !== licao.palavras.length) {
      problemas.push(`${nome}: tem palavra repetida.`);
    }
    if (!Array.isArray(licao.frases) || licao.frases.length < 1 || licao.frases.length > 3) {
      problemas.push(`${nome}: "frases" precisa ter de 1 a 3 itens.`);
    } else {
      licao.frases.forEach((frase) => {
        const tamanho = separarEmPecas(frase).length;
        if (tamanho < 2 || tamanho > 6) problemas.push(`${nome}: a frase "${frase}" precisa ter de 2 a 6 palavras.`);
        if (/[.,!?;:]/.test(frase)) problemas.push(`${nome}: a frase "${frase}" não deve ter pontuação.`);
      });
    }
    if (typeof licao.validado !== "boolean") problemas.push(`${nome}: "validado" precisa ser true ou false.`);
  });

  return problemas;
}
