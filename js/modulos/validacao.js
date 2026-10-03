/* ==========================================================
   validacao.js
   Confere e limpa o texto ANTES de mandar para o VLibras.
   Não mexe na tela: só recebe um texto e devolve o resultado.
   ========================================================== */

import { LIMITE_CARACTERES } from "./config.js";

/** Mensagens mostradas para o aluno em cada problema. */
export const MENSAGENS_VALIDACAO = {
  vazio: "Escreva uma frase antes de traduzir.",
  semPalavras: "Use palavras. Só símbolos ou emojis não dá para traduzir.",
  longo: `A frase passou de ${LIMITE_CARACTERES} caracteres. Diminua um pouco.`,
};

/**
 * Limpa e valida o texto digitado.
 *
 * - Junta espaços e quebras de linha repetidos num espaço só.
 * - Recusa texto vazio, sem nenhuma letra/número ou longo demais.
 *
 * @param {unknown} textoBruto  o que veio do campo (pode ser qualquer coisa)
 * @param {number} [limite]     tamanho máximo
 * @returns {{ ok: true, texto: string } | { ok: false, codigo: string, mensagem: string }}
 */
export function prepararTexto(textoBruto, limite = LIMITE_CARACTERES) {
  const texto = typeof textoBruto === "string" ? textoBruto.replace(/\s+/g, " ").trim() : "";

  if (texto === "") {
    return falha("vazio");
  }

  // \p{L} = qualquer letra (inclui acentos), \p{N} = qualquer número
  if (!/[\p{L}\p{N}]/u.test(texto)) {
    return falha("semPalavras");
  }

  if (texto.length > limite) {
    return falha("longo");
  }

  return { ok: true, texto };
}

function falha(codigo) {
  return { ok: false, codigo, mensagem: MENSAGENS_VALIDACAO[codigo] };
}
