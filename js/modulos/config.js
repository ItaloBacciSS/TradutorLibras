/* ==========================================================
   config.js
   Configurações gerais do site, num só lugar.
   ========================================================== */

// Endereço do VLibras (avatar 3D)
export const VLIBRAS_URL = "https://vlibras.gov.br/app";

// Lado da tela onde o avatar aparece: "R" (direita) ou "L" (esquerda)
export const VLIBRAS_POSICAO = "R";

// Tempo máximo esperando o avatar carregar (a 1ª vez é mais lenta)
export const TEMPO_MAXIMO_CARREGAR_MS = 90000;

// Limite de caracteres do campo de texto (igual ao maxlength do HTML)
export const LIMITE_CARACTERES = 500;

// Histórico de traduções (fica salvo só no navegador de quem usa)
export const CHAVE_HISTORICO = "tradutor-libras:historico";
export const TAMANHO_HISTORICO = 10;

// Idioma do reconhecimento de voz
export const IDIOMA_VOZ = "pt-BR";
