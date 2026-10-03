/* ==========================================================
   progresso.js
   Progresso do aluno na área "Aprender Libras":
   lições concluídas, estrelas, pontos (XP) e sequência de dias.

   Fica salvo no navegador (localStorage). Cada computador /
   navegador tem o seu progresso. Se o armazenamento estiver
   bloqueado ou estragado, tudo funciona, só não fica salvo.
   ========================================================== */

export const CHAVE_PROGRESSO = "tradutor-libras:aprender";

/** Pontos ganhos ao terminar uma lição. */
export const PONTOS = {
  porLicao: 10,
  porEstrela: 5,
};

function progressoVazio() {
  return { versao: 1, xp: 0, licoes: {}, sequencia: { dias: 0, ultimoDia: null } };
}

/** Lê o progresso salvo. Dados estragados viram progresso vazio. */
export function lerProgresso() {
  let dados;
  try {
    dados = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO) ?? "null");
  } catch {
    return progressoVazio();
  }
  return limpar(dados);
}

/** Apaga todo o progresso. */
export function apagarProgresso() {
  gravar(progressoVazio());
}

/**
 * 3 estrelas: acertou 90% ou mais de primeira
 * 2 estrelas: 70% ou mais
 * 1 estrela:  terminou a lição
 */
export function calcularEstrelas(acertos, total) {
  if (!total) return 3;
  const taxa = acertos / total;
  if (taxa >= 0.9) return 3;
  if (taxa >= 0.7) return 2;
  return 1;
}

/**
 * Registra uma lição terminada e salva.
 * @param {string} idLicao
 * @param {number} acertos  acertos de primeira
 * @param {number} total    exercícios com nota
 * @param {Date} [agora]
 * @returns {{ estrelas: number, xpGanho: number, sequencia: number, recorde: boolean }}
 */
export function registrarLicao(idLicao, acertos, total, agora = new Date()) {
  const progresso = lerProgresso();
  const estrelas = calcularEstrelas(acertos, total);
  const anterior = progresso.licoes[idLicao];
  const xpGanho = PONTOS.porLicao + PONTOS.porEstrela * estrelas;

  progresso.licoes[idLicao] = {
    concluida: true,
    estrelas: Math.max(estrelas, anterior?.estrelas ?? 0),
    vezes: (anterior?.vezes ?? 0) + 1,
  };
  progresso.xp += xpGanho;
  progresso.sequencia = atualizarSequencia(progresso.sequencia, agora);

  gravar(progresso);
  return {
    estrelas,
    xpGanho,
    sequencia: progresso.sequencia.dias,
    recorde: estrelas > (anterior?.estrelas ?? 0),
  };
}

/**
 * A lição na posição "indice" está liberada?
 * A primeira sempre está; as outras quando a anterior foi concluída
 * (ou quando a própria lição já foi feita antes).
 */
export function licaoLiberada(indice, licoes, progresso) {
  if (indice === 0) return true;
  if (progresso.licoes[licoes[indice]?.id]?.concluida) return true;
  const anterior = licoes[indice - 1];
  return Boolean(anterior && progresso.licoes[anterior.id]?.concluida);
}

/** Dias seguidos estudando. Se passou um dia sem estudar, volta a zero. */
export function sequenciaAtual(progresso, agora = new Date()) {
  const { dias, ultimoDia } = progresso.sequencia;
  if (!ultimoDia) return 0;
  const hoje = chaveDoDia(agora);
  const ontem = chaveDoDia(somarDias(agora, -1));
  return ultimoDia === hoje || ultimoDia === ontem ? dias : 0;
}

// ==========================================================
// Funções internas
// ==========================================================
function atualizarSequencia(sequencia, agora) {
  const hoje = chaveDoDia(agora);
  const ontem = chaveDoDia(somarDias(agora, -1));
  if (sequencia.ultimoDia === hoje) return sequencia;
  if (sequencia.ultimoDia === ontem) return { dias: sequencia.dias + 1, ultimoDia: hoje };
  return { dias: 1, ultimoDia: hoje };
}

/** "2026-10-03" no fuso do computador do aluno. */
export function chaveDoDia(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function somarDias(data, dias) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

/** Aceita só o formato esperado; o resto é descartado. */
function limpar(dados) {
  const limpo = progressoVazio();
  if (!dados || typeof dados !== "object") return limpo;

  if (Number.isFinite(dados.xp) && dados.xp >= 0) limpo.xp = Math.floor(dados.xp);

  if (dados.licoes && typeof dados.licoes === "object") {
    for (const [id, licao] of Object.entries(dados.licoes)) {
      if (!licao || typeof licao !== "object") continue;
      const estrelas = Number.isInteger(licao.estrelas) ? Math.min(Math.max(licao.estrelas, 0), 3) : 0;
      limpo.licoes[id] = {
        concluida: licao.concluida === true,
        estrelas,
        vezes: Number.isInteger(licao.vezes) && licao.vezes > 0 ? licao.vezes : 0,
      };
    }
  }

  const seq = dados.sequencia;
  if (seq && Number.isInteger(seq.dias) && seq.dias >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(seq.ultimoDia ?? "")) {
    limpo.sequencia = { dias: seq.dias, ultimoDia: seq.ultimoDia };
  }

  return limpo;
}

function gravar(progresso) {
  try {
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
  } catch {
    /* armazenamento bloqueado: segue sem salvar */
  }
}
