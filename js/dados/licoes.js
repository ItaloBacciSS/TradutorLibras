/* ==========================================================
   dados/licoes.js
   Lições da área "Aprender Libras".
   ----------------------------------------------------------
   Este arquivo é SÓ DE DADOS: pode editar à vontade.
   Os exercícios são criados sozinhos a partir destas listas.

   COMO É UMA LIÇÃO
   {
     id: "escola",                 // único, sem espaço nem acento
     titulo: "Na escola",          // nome mostrado na trilha
     descricao: "…",               // frase curta embaixo do título
     palavras: ["Escola", …],      // de 4 a 8 palavras (o avatar faz o sinal de cada uma)
     frases: ["Eu gosto da escola", …],  // 1 a 3 frases curtas para "Monte a frase"
     validado: false,              // mude para true depois de conferir os sinais
   }

   DICAS
   - A ordem da lista é a ordem da trilha: a próxima lição só
     abre quando a anterior é concluída.
   - Frases: curtas (até 6 palavras), sem pontuação.
   - Confira com pessoas surdas se o avatar faz o sinal certo
     de cada palavra; troque as que ficarem estranhas.
   ========================================================== */

export const LICOES = [
  {
    id: "cumprimentos",
    titulo: "Cumprimentos",
    descricao: "Oi, tchau, obrigado…",
    palavras: ["Oi", "Tchau", "Obrigado", "Desculpa", "Por favor", "Bom dia"],
    frases: ["Bom dia professor", "Obrigado amigo"],
    validado: false,
  },
  {
    id: "escola",
    titulo: "Na escola",
    descricao: "Professor, aluno, livro…",
    palavras: ["Escola", "Professor", "Aluno", "Livro", "Caderno", "Prova"],
    frases: ["Eu gosto da escola", "A prova é amanhã"],
    validado: false,
  },
  {
    id: "familia",
    titulo: "Família",
    descricao: "Mãe, pai, irmão…",
    palavras: ["Mãe", "Pai", "Irmão", "Irmã", "Avó", "Avô"],
    frases: ["Minha mãe trabalha", "Eu tenho um irmão"],
    validado: false,
  },
  {
    id: "cores",
    titulo: "Cores",
    descricao: "Azul, verde, amarelo…",
    palavras: ["Azul", "Vermelho", "Verde", "Amarelo", "Branco", "Preto"],
    frases: ["O céu é azul", "Eu gosto de verde"],
    validado: false,
  },
  {
    id: "numeros",
    titulo: "Números",
    descricao: "Um, dois, três…",
    palavras: ["Um", "Dois", "Três", "Quatro", "Cinco", "Dez"],
    frases: ["Eu tenho dez anos", "Eu tenho dois livros"],
    validado: false,
  },
  {
    id: "tempo",
    titulo: "Dias e tempo",
    descricao: "Hoje, amanhã, sábado…",
    palavras: ["Hoje", "Amanhã", "Ontem", "Segunda-feira", "Sexta-feira", "Sábado"],
    frases: ["Hoje é sexta-feira", "Amanhã tem aula"],
    validado: false,
  },
  {
    id: "sentimentos",
    titulo: "Sentimentos",
    descricao: "Feliz, triste, cansado…",
    palavras: ["Feliz", "Triste", "Cansado", "Bravo", "Medo", "Amor"],
    frases: ["Eu estou feliz", "Ela está cansada"],
    validado: false,
  },
  {
    id: "comida",
    titulo: "Comida",
    descricao: "Água, pão, arroz…",
    palavras: ["Água", "Pão", "Arroz", "Feijão", "Fruta", "Leite"],
    frases: ["Eu quero água", "Eu gosto de arroz e feijão"],
    validado: false,
  },
  {
    id: "lugares",
    titulo: "Lugares",
    descricao: "Casa, banheiro, biblioteca…",
    palavras: ["Casa", "Banheiro", "Biblioteca", "Hospital", "Mercado", "Igreja"],
    frases: ["Onde fica o banheiro", "Eu vou para casa"],
    validado: false,
  },
  {
    id: "perguntas",
    titulo: "Perguntas",
    descricao: "Quem, onde, quando…",
    palavras: ["Quem", "Onde", "Quando", "Por quê", "O que", "Quanto"],
    frases: ["Onde você mora", "Quando é a prova"],
    validado: false,
  },
];
