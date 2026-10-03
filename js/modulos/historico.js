/* ==========================================================
   historico.js
   Últimas frases traduzidas, salvas no navegador (localStorage).
   Cada computador/navegador tem o seu próprio histórico.
   Se o armazenamento estiver bloqueado ou com dados estragados,
   o site continua funcionando, só sem histórico.
   ========================================================== */

import { CHAVE_HISTORICO, TAMANHO_HISTORICO } from "./config.js";

/** Lê a lista salva. Dados inválidos são descartados. */
export function lerHistorico() {
  let dados;
  try {
    dados = JSON.parse(localStorage.getItem(CHAVE_HISTORICO) ?? "[]");
  } catch {
    // JSON estragado ou armazenamento bloqueado
    gravar([]);
    return [];
  }

  if (!Array.isArray(dados)) {
    gravar([]);
    return [];
  }

  return dados
    .filter((item) => typeof item === "string" && item.trim() !== "")
    .slice(0, TAMANHO_HISTORICO);
}

/** Coloca uma frase no topo do histórico (sem repetir). */
export function adicionarAoHistorico(texto) {
  const lista = lerHistorico().filter((item) => item !== texto);
  lista.unshift(texto);
  gravar(lista.slice(0, TAMANHO_HISTORICO));
}

/** Apaga todo o histórico. */
export function apagarHistorico() {
  gravar([]);
}

function gravar(lista) {
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista));
  } catch {
    /* navegador sem armazenamento (ex.: aba anônima bloqueada): segue sem salvar */
  }
}
