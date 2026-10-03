/* ==========================================================
   dados/licoes.js
   Lições da área "Aprender Libras".
   ----------------------------------------------------------
   Este arquivo é SÓ DE DADOS: pode editar à vontade.
   Os exercícios são criados sozinhos a partir destas listas.

   ORGANIZAÇÃO
   - As lições ficam dentro de UNIDADES (grupos de lições).
   - Cada unidade termina com uma REVISÃO, que mistura palavras
     das lições anteriores (sem palavra nova).
   - A ordem do arquivo é a ordem da trilha: a próxima lição só
     abre quando a anterior é concluída.

   REGRA DE OURO: o aluno nunca vê uma palavra que ainda não
   aprendeu. Por isso:
   - Nos exercícios, as opções erradas são sempre palavras já
     ensinadas (nesta lição ou nas anteriores).
   - As FRASES só podem usar palavras já ensinadas + os
     CONECTORES abaixo. O teste test_licoes_sem_problemas
     avisa se alguma frase usar palavra que ainda não foi ensinada.

   COMO É UMA LIÇÃO
   {
     id: "escola",                    // único, minúsculo, sem espaço nem acento
     titulo: "Na escola",             // nome na trilha
     descricao: "Livro, prova, aula…",
     palavras: ["Escola", …],         // de 4 a 8 palavras NOVAS (o avatar faz o sinal de cada uma)
     frases: ["Eu gosto da escola"],  // de 1 a 3 frases curtas, sem pontuação
     validado: false,                 // mude para true depois de conferir os sinais
   }

   COMO É UMA REVISÃO
   { id: "revisao-1", titulo: "Revisão", revisao: true,
     palavras: [...],  // de 4 a 10 palavras de lições ANTERIORES
     frases: [...], validado: false }
   ========================================================== */

/**
 * Palavras de ligação que podem aparecer nas frases sem ter sido ensinadas.
 * Em Libras, artigos e preposições normalmente não têm sinal próprio:
 * o sentido aparece na ordem dos sinais e no espaço.
 */
export const CONECTORES = ["o", "a", "os", "as", "um", "uma", "de", "da", "do", "e", "é", "em", "no", "na", "para", "ao", "com"];

export const UNIDADES = [
  // ========================================================
  {
    id: "unidade-1",
    titulo: "Unidade 1 · Primeiros passos",
    licoes: [
      {
        id: "cumprimentos",
        titulo: "Cumprimentos",
        descricao: "Oi, tchau, obrigado…",
        palavras: ["Oi", "Tchau", "Bom dia", "Boa tarde", "Boa noite", "Obrigado", "Desculpa", "Por favor"],
        frases: ["Oi bom dia", "Obrigado e tchau"],
        validado: false,
      },
      {
        id: "pessoas",
        titulo: "Pessoas",
        descricao: "Eu, você, amigo…",
        palavras: ["Eu", "Você", "Ele", "Ela", "Nós", "Amigo", "Professor", "Aluno"],
        frases: ["Oi professor", "Bom dia amigo", "Obrigado professor"],
        validado: false,
      },
      {
        id: "acoes",
        titulo: "Palavras de ação",
        descricao: "Sou, quero, gosto…",
        palavras: ["Sou", "Estou", "Quero", "Gosto", "Tenho", "Vou", "Posso", "Sei"],
        frases: ["Eu sou aluno", "Eu tenho um amigo", "Você é professor"],
        validado: false,
      },
      {
        id: "escola",
        titulo: "Na escola",
        descricao: "Livro, prova, aula…",
        palavras: ["Escola", "Sala", "Livro", "Caderno", "Lápis", "Prova", "Aula", "Biblioteca"],
        frases: ["Eu gosto da escola", "Eu tenho prova", "Eu vou para a biblioteca"],
        validado: false,
      },
      {
        id: "revisao-1",
        titulo: "Revisão da unidade 1",
        descricao: "Tudo o que você aprendeu até aqui",
        revisao: true,
        palavras: ["Oi", "Obrigado", "Por favor", "Professor", "Amigo", "Quero", "Gosto", "Livro", "Prova", "Escola"],
        frases: ["Eu quero o livro", "Obrigado amigo", "Eu gosto da aula"],
        validado: false,
      },
    ],
  },

  // ========================================================
  {
    id: "unidade-2",
    titulo: "Unidade 2 · Eu e minha casa",
    licoes: [
      {
        id: "familia",
        titulo: "Família",
        descricao: "Mãe, pai, irmão…",
        palavras: ["Família", "Mãe", "Pai", "Irmão", "Irmã", "Avó", "Avô", "Casa"],
        frases: ["Eu tenho uma irmã", "Eu gosto da família", "Eu vou para casa"],
        validado: false,
      },
      {
        id: "cores",
        titulo: "Cores",
        descricao: "Azul, verde, amarelo…",
        palavras: ["Azul", "Vermelho", "Verde", "Amarelo", "Branco", "Preto", "Rosa", "Cor"],
        frases: ["Eu gosto de azul", "O livro é vermelho", "Eu quero o caderno verde"],
        validado: false,
      },
      {
        id: "numeros",
        titulo: "Números",
        descricao: "Um, dois, três…",
        palavras: ["Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Dez"],
        frases: ["Eu tenho um irmão", "Eu quero um lápis azul", "Eu sou aluno da sala dez"],
        validado: false,
      },
      {
        id: "sentimentos",
        titulo: "Sentimentos",
        descricao: "Feliz, triste, cansado…",
        palavras: ["Feliz", "Triste", "Cansado", "Bravo", "Medo", "Calmo", "Nervoso", "Amor"],
        frases: ["Eu estou feliz", "Eu estou cansado", "Eu tenho medo"],
        validado: false,
      },
      {
        id: "revisao-2",
        titulo: "Revisão da unidade 2",
        descricao: "Família, cores, números e sentimentos",
        revisao: true,
        palavras: ["Mãe", "Pai", "Casa", "Azul", "Verde", "Dois", "Dez", "Feliz", "Triste", "Medo"],
        frases: ["A casa é azul", "Eu estou triste", "Eu tenho dez lápis"],
        validado: false,
      },
    ],
  },

  // ========================================================
  {
    id: "unidade-3",
    titulo: "Unidade 3 · Meu dia",
    licoes: [
      {
        id: "comida",
        titulo: "Comida",
        descricao: "Água, pão, arroz…",
        palavras: ["Água", "Comida", "Pão", "Arroz", "Feijão", "Fruta", "Leite", "Suco"],
        frases: ["Eu quero água", "Eu gosto de arroz e feijão", "Eu quero suco de fruta"],
        validado: false,
      },
      {
        id: "lugares",
        titulo: "Lugares",
        descricao: "Banheiro, parque, cidade…",
        palavras: ["Banheiro", "Refeitório", "Parque", "Rua", "Cidade", "Hospital", "Mercado", "Igreja"],
        frases: ["Eu vou ao banheiro", "Eu vou para o parque", "Eu gosto da cidade"],
        validado: false,
      },
      {
        id: "tempo",
        titulo: "Tempo",
        descricao: "Hoje, amanhã, agora…",
        palavras: ["Hoje", "Amanhã", "Ontem", "Agora", "Depois", "Manhã", "Tarde", "Noite"],
        frases: ["Hoje eu estou feliz", "Amanhã eu tenho prova", "Eu vou para casa agora"],
        validado: false,
      },
      {
        id: "semana",
        titulo: "Dias da semana",
        descricao: "Segunda, sexta, sábado…",
        palavras: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo", "Semana"],
        frases: ["Hoje é sexta-feira", "Amanhã é sábado", "Eu tenho prova na segunda-feira"],
        validado: false,
      },
      {
        id: "revisao-3",
        titulo: "Revisão da unidade 3",
        descricao: "Comida, lugares, tempo e semana",
        revisao: true,
        palavras: ["Água", "Pão", "Suco", "Banheiro", "Parque", "Hoje", "Amanhã", "Agora", "Sábado", "Domingo"],
        frases: ["Eu quero pão", "Hoje é domingo", "Eu vou ao parque amanhã"],
        validado: false,
      },
    ],
  },

  // ========================================================
  {
    id: "unidade-4",
    titulo: "Unidade 4 · Conversando",
    licoes: [
      {
        id: "perguntas",
        titulo: "Perguntas",
        descricao: "Quem, onde, quando…",
        palavras: ["Quem", "Onde", "Quando", "Por quê", "O que", "Quanto", "Como", "Qual"],
        frases: ["Onde é o banheiro", "Quando é a prova", "Quem é você"],
        validado: false,
      },
      {
        id: "estudar",
        titulo: "Na sala de aula",
        descricao: "Estudar, ler, escrever…",
        palavras: ["Estudar", "Ler", "Escrever", "Desenhar", "Brincar", "Aprender", "Entender", "Perguntar"],
        frases: ["Eu quero aprender", "Eu gosto de ler", "Eu vou estudar"],
        validado: false,
      },
      {
        id: "respostas",
        titulo: "Sim, não e ajuda",
        descricao: "Sim, não, licença…",
        palavras: ["Sim", "Não", "Ajuda", "Licença", "Certo", "Errado", "Talvez", "Pronto"],
        frases: ["Eu não sei", "Sim por favor", "Com licença professor"],
        validado: false,
      },
      {
        id: "animais",
        titulo: "Animais",
        descricao: "Cachorro, gato, peixe…",
        palavras: ["Cachorro", "Gato", "Pássaro", "Peixe", "Cavalo", "Vaca", "Coelho", "Animal"],
        frases: ["Eu tenho um cachorro", "Eu gosto de gato", "O peixe é azul"],
        validado: false,
      },
      {
        id: "revisao-4",
        titulo: "Revisão final",
        descricao: "Um pouco de tudo",
        revisao: true,
        palavras: ["Onde", "Quando", "Aprender", "Ler", "Sim", "Não", "Ajuda", "Cachorro", "Gato", "Obrigado"],
        frases: ["Onde é a escola", "Eu não sei ler", "Eu gosto de cachorro"],
        validado: false,
      },
    ],
  },
];

/** Todas as lições em ordem, cada uma com o nome da sua unidade. */
export const LICOES = UNIDADES.flatMap((unidade) =>
  unidade.licoes.map((licao) => ({ ...licao, unidade: unidade.titulo })),
);
