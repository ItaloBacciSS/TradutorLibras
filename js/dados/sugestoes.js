/* ==========================================================
   dados/sugestoes.js
   Lista de regras de sugestão ("Você quis dizer…?").
   ----------------------------------------------------------
   Este arquivo é SÓ DE DADOS: pode editar à vontade, sem
   mexer em mais nada. O site lê esta lista sozinho.

   COMO ESCREVER UMA REGRA

   1) Troca simples: sugere trocar um trecho por outro.
      {
        categoria: "giria",          // uma das CATEGORIAS abaixo
        procurar: ["mó"],            // palavras/expressões que disparam a regra
        trocar: "muito",             // o que sugerir no lugar
        explicacao: "…",             // (opcional) se faltar, usa a da categoria
        validado: false,             // mude para true depois de conferir
      }

   2) Escolha: a palavra tem mais de um sentido; o aluno escolhe.
      {
        categoria: "ambigua",
        procurar: ["manga"],
        opcoes: [
          { rotulo: "Fruta", trocar: "fruta manga" },
          { rotulo: "Da camisa", trocar: "manga da camisa" },
        ],
        validado: false,
      }

   3) Exceções: "exceto" lista frases em que a regra NÃO vale.
      { procurar: ["que dia é"], exceto: ["que dia é hoje"], trocar: "quando é" }

   REGRAS DA BUSCA
   - Não importa maiúscula/minúscula. Acento importa ("vó" ≠ "vo"),
     então coloque as duas formas em "procurar" se precisar.
   - Só acha palavras inteiras ("vc" não acha dentro de "vcxyz").
   - Se duas regras batem no mesmo lugar, vale a expressão mais longa
     ("que pena" ganha de "pena").
   - Uma palavra que já faz parte de uma sugestão não é sugerida de
     novo (ex.: depois de escolher "manga da camisa", "manga" não
     volta a perguntar).

   IMPORTANTE: todas as regras começaram como validado: false.
   Revise com pessoas surdas/intérpretes e ajuste.
   ========================================================== */

/** Categorias: nome mostrado na tela e explicação padrão. */
export const CATEGORIAS = {
  abreviacao: {
    nome: "Abreviação",
    explicacao:
      "O avatar não conhece abreviações de internet e pode soletrar letra por letra. Escrever a palavra inteira ajuda a tradução.",
  },
  informal: {
    nome: "Fala informal",
    explicacao:
      "Formas faladas do dia a dia (\"tô\", \"pra\", \"tava\") podem não ser reconhecidas pelo avatar. A forma completa traduz melhor.",
  },
  giria: {
    nome: "Gíria",
    explicacao:
      "Gírias mudam muito e quase nunca têm sinal próprio no tradutor automático. Uma palavra comum passa a ideia com mais clareza.",
  },
  expressao: {
    nome: "Expressão",
    explicacao:
      "Expressões não são literais. Traduzidas palavra por palavra, o sentido se perde em Libras. Dizer a ideia diretamente funciona melhor.",
  },
  natural: {
    nome: "Mais natural em Libras",
    explicacao:
      "Libras é uma língua direta e visual. Algumas construções do português ficam mais claras quando ditas de forma mais simples.",
  },
  ambigua: {
    nome: "Palavra com mais de um sentido",
    explicacao:
      "Em Libras, cada sentido desta palavra tem um sinal diferente. Escolha o que você quis dizer para o avatar fazer o sinal certo.",
  },
};

export const REGRAS = [
  // ========================================================
  // ABREVIAÇÕES (internetês)
  // ========================================================
  { categoria: "abreviacao", procurar: ["vc", "vce"], trocar: "você", validado: false },
  { categoria: "abreviacao", procurar: ["vcs"], trocar: "vocês", validado: false },
  { categoria: "abreviacao", procurar: ["tb", "tbm", "tmb"], trocar: "também", validado: false },
  { categoria: "abreviacao", procurar: ["pq"], trocar: "porque", validado: false },
  { categoria: "abreviacao", procurar: ["q"], trocar: "que", validado: false },
  { categoria: "abreviacao", procurar: ["oq", "oque"], trocar: "o que", validado: false },
  { categoria: "abreviacao", procurar: ["n", "ñ", "nn"], trocar: "não", validado: false },
  { categoria: "abreviacao", procurar: ["blz"], trocar: "beleza", validado: false },
  { categoria: "abreviacao", procurar: ["vlw", "valeu"], trocar: "obrigado", validado: false },
  { categoria: "abreviacao", procurar: ["obg", "obgd", "obgda", "brigado", "brigada"], trocar: "obrigado", validado: false },
  { categoria: "abreviacao", procurar: ["pf", "pfv", "pfvr"], trocar: "por favor", validado: false },
  { categoria: "abreviacao", procurar: ["plmds", "pelamor"], trocar: "pelo amor de Deus", validado: false },
  { categoria: "abreviacao", procurar: ["msg"], trocar: "mensagem", validado: false },
  { categoria: "abreviacao", procurar: ["hj"], trocar: "hoje", validado: false },
  { categoria: "abreviacao", procurar: ["amn", "amnh"], trocar: "amanhã", validado: false },
  { categoria: "abreviacao", procurar: ["td"], trocar: "tudo", validado: false },
  { categoria: "abreviacao", procurar: ["tds"], trocar: "todos", validado: false },
  { categoria: "abreviacao", procurar: ["cmg"], trocar: "comigo", validado: false },
  { categoria: "abreviacao", procurar: ["ctg"], trocar: "contigo", validado: false },
  { categoria: "abreviacao", procurar: ["mt", "mto", "mtu"], trocar: "muito", validado: false },
  { categoria: "abreviacao", procurar: ["mta"], trocar: "muita", validado: false },
  { categoria: "abreviacao", procurar: ["mts", "mtos"], trocar: "muitos", validado: false },
  { categoria: "abreviacao", procurar: ["qnd", "qdo", "qndo"], trocar: "quando", validado: false },
  { categoria: "abreviacao", procurar: ["qto", "qnt"], trocar: "quanto", validado: false },
  { categoria: "abreviacao", procurar: ["ngm"], trocar: "ninguém", validado: false },
  { categoria: "abreviacao", procurar: ["kd"], trocar: "onde está", validado: false },
  { categoria: "abreviacao", procurar: ["fds"], trocar: "fim de semana", validado: false },
  { categoria: "abreviacao", procurar: ["dps", "dpois"], trocar: "depois", validado: false },
  { categoria: "abreviacao", procurar: ["agr"], trocar: "agora", validado: false },
  { categoria: "abreviacao", procurar: ["aq"], trocar: "aqui", validado: false },
  { categoria: "abreviacao", procurar: ["bjs", "bjo", "bjos"], trocar: "beijos", validado: false },
  { categoria: "abreviacao", procurar: ["abs", "abç"], trocar: "abraços", validado: false },
  { categoria: "abreviacao", procurar: ["sdds", "sdd"], trocar: "saudade", validado: false },
  { categoria: "abreviacao", procurar: ["d+", "dms"], trocar: "demais", validado: false },
  { categoria: "abreviacao", procurar: ["msm"], trocar: "mesmo", validado: false },
  { categoria: "abreviacao", procurar: ["vdd"], trocar: "verdade", validado: false },
  { categoria: "abreviacao", procurar: ["cel"], trocar: "celular", validado: false },
  { categoria: "abreviacao", procurar: ["prof", "fessor", "sor"], trocar: "professor", validado: false },
  { categoria: "abreviacao", procurar: ["profa", "fessora", "sora"], trocar: "professora", validado: false },
  { categoria: "abreviacao", procurar: ["facul"], trocar: "faculdade", validado: false },
  { categoria: "abreviacao", procurar: ["niver", "aniver"], trocar: "aniversário", validado: false },
  { categoria: "abreviacao", procurar: ["info"], trocar: "informação", validado: false },
  { categoria: "abreviacao", procurar: ["min"], trocar: "minutos", validado: false },
  { categoria: "abreviacao", procurar: ["obs"], trocar: "observação", validado: false },
  { categoria: "abreviacao", procurar: ["tmj"], trocar: "estamos juntos", validado: false },
  { categoria: "abreviacao", procurar: ["sla"], trocar: "não sei", validado: false },
  { categoria: "abreviacao", procurar: ["pdc", "pode crer"], trocar: "concordo", validado: false },
  { categoria: "abreviacao", procurar: ["nd"], trocar: "nada", validado: false },
  { categoria: "abreviacao", procurar: ["nda"], trocar: "nada", validado: false },
  { categoria: "abreviacao", procurar: ["eh"], trocar: "é", validado: false },
  { categoria: "abreviacao", procurar: ["neh"], trocar: "não é", validado: false },
  { categoria: "abreviacao", procurar: ["kkk", "kkkk", "kkkkk", "kkkkkk", "rs", "rsrs", "rsrsrs", "hahaha", "hahahaha", "kkkkkkk"], trocar: "engraçado", explicacao: "Risada escrita (kkkk, rsrs) não tem sinal. Em Libras a risada aparece na expressão do rosto. Se quiser dizer que algo foi engraçado, use a palavra.", validado: false },

  // ========================================================
  // FALA INFORMAL
  // ========================================================
  { categoria: "informal", procurar: ["tô", "to"], trocar: "estou", validado: false },
  { categoria: "informal", procurar: ["tá", "ta"], trocar: "está", validado: false },
  { categoria: "informal", procurar: ["tamo", "tamos", "tamu"], trocar: "estamos", validado: false },
  { categoria: "informal", procurar: ["tava"], trocar: "estava", validado: false },
  { categoria: "informal", procurar: ["tavam", "tavão"], trocar: "estavam", validado: false },
  { categoria: "informal", procurar: ["pra"], trocar: "para", validado: false },
  { categoria: "informal", procurar: ["pro"], trocar: "para o", validado: false },
  { categoria: "informal", procurar: ["pros"], trocar: "para os", validado: false },
  { categoria: "informal", procurar: ["prum"], trocar: "para um", validado: false },
  { categoria: "informal", procurar: ["pruma"], trocar: "para uma", validado: false },
  { categoria: "informal", procurar: ["né"], trocar: "não é", validado: false },
  { categoria: "informal", procurar: ["cê", "ocê"], trocar: "você", validado: false },
  { categoria: "informal", procurar: ["cês", "ocês"], trocar: "vocês", validado: false },
  { categoria: "informal", procurar: ["cadê"], trocar: "onde está", validado: false },
  { categoria: "informal", procurar: ["bora", "borá", "vambora", "vamo"], trocar: "vamos", validado: false },
  { categoria: "informal", procurar: ["peraí", "perai", "pera aí"], trocar: "espere", validado: false },
  { categoria: "informal", procurar: ["inda"], trocar: "ainda", validado: false },
  { categoria: "informal", procurar: ["dum"], trocar: "de um", validado: false },
  { categoria: "informal", procurar: ["duma"], trocar: "de uma", validado: false },
  { categoria: "informal", procurar: ["xô ver", "deixa eu ver", "deixa eu vê"], trocar: "vou ver", validado: false },
  { categoria: "informal", procurar: ["nóis", "nois"], trocar: "nós", validado: false },
  { categoria: "informal", procurar: ["mermo"], trocar: "mesmo", validado: false },

  // ========================================================
  // GÍRIAS
  // ========================================================
  { categoria: "giria", procurar: ["mó"], trocar: "muito", validado: false },
  { categoria: "giria", procurar: ["top", "show de bola", "daora", "da hora", "dahora", "maneiro"], trocar: "legal", validado: false },
  { categoria: "giria", procurar: ["zoar", "zoando", "zuar", "zuando"], trocar: "brincar", validado: false },
  { categoria: "giria", procurar: ["zoeira", "zuera", "zoera"], trocar: "brincadeira", validado: false },
  { categoria: "giria", procurar: ["mano", "véi", "vei", "brother", "bro", "parça", "mermão", "brô"], trocar: "amigo", validado: false },
  { categoria: "giria", procurar: ["mina"], trocar: "menina", validado: false },
  { categoria: "giria", procurar: ["moleque", "muleque"], trocar: "menino", validado: false },
  { categoria: "giria", procurar: ["galera", "rapaziada"], trocar: "pessoal", validado: false },
  { categoria: "giria", procurar: ["rolê", "role"], trocar: "passeio", validado: false },
  { categoria: "giria", procurar: ["trampo"], trocar: "trabalho", validado: false },
  { categoria: "giria", procurar: ["trampar"], trocar: "trabalhar", validado: false },
  { categoria: "giria", procurar: ["grana", "dindin", "bufunfa", "din din"], trocar: "dinheiro", validado: false },
  { categoria: "giria", procurar: ["busão", "buso"], trocar: "ônibus", validado: false },
  { categoria: "giria", procurar: ["treta", "barraco"], trocar: "briga", validado: false },
  { categoria: "giria", procurar: ["crush"], trocar: "pessoa de quem eu gosto", validado: false },
  { categoria: "giria", procurar: ["de boa", "deboa", "de boas", "susse", "sussa", "tranquilão"], trocar: "tranquilo", validado: false },
  { categoria: "giria", procurar: ["sextou"], trocar: "hoje é sexta-feira", validado: false },
  { categoria: "giria", procurar: ["bugou", "bugado", "travou"], trocar: "deu erro", validado: false },
  { categoria: "giria", procurar: ["flopou", "flopar"], trocar: "deu errado", validado: false },
  { categoria: "giria", procurar: ["shippar", "shippo"], trocar: "torcer pelo casal", validado: false },
  { categoria: "giria", procurar: ["stalkear", "stalkeando"], trocar: "olhar escondido as redes sociais de alguém", validado: false },
  { categoria: "giria", procurar: ["firmeza", "suave na nave"], trocar: "tudo bem", validado: false },
  { categoria: "giria", procurar: ["cringe"], trocar: "vergonha alheia", validado: false },
  { categoria: "giria", procurar: ["mancada", "vacilo", "vacilou"], trocar: "erro", validado: false },
  { categoria: "giria", procurar: ["vacilão", "vacilona"], trocar: "pessoa que errou", validado: false },
  { categoria: "giria", procurar: ["caô", "lorota", "papo furado"], trocar: "mentira", validado: false },
  { categoria: "giria", procurar: ["partiu"], trocar: "vamos", validado: false },
  { categoria: "giria", procurar: ["aff", "afe", "affs"], trocar: "que chato", validado: false },
  { categoria: "giria", procurar: ["eita", "vixe", "vish", "caramba"], trocar: "que surpresa", validado: false },
  { categoria: "giria", procurar: ["bagulho", "treco", "negócio"], trocar: "coisa", explicacao: "Palavras como \"bagulho\" e \"treco\" são usadas no lugar de \"coisa\". Diga o nome do objeto ou use \"coisa\".", validado: false },
  { categoria: "giria", procurar: ["sinistro", "brabo"], trocar: "incrível", validado: false },
  { categoria: "giria", procurar: ["mó legal"], trocar: "muito legal", validado: false },
  { categoria: "giria", procurar: ["tipo assim"], trocar: "por exemplo", validado: false },
  { categoria: "giria", procurar: ["pô", "poxa"], trocar: "que pena", validado: false },
  { categoria: "giria", procurar: ["oxe", "oxente"], trocar: "que estranho", validado: false },
  { categoria: "giria", procurar: ["uai"], trocar: "que estranho", validado: false },
  { categoria: "giria", procurar: ["bah", "tchê"], trocar: "que surpresa", validado: false },
  { categoria: "giria", procurar: ["rango", "boia"], trocar: "comida", validado: false },
  { categoria: "giria", procurar: ["rangar"], trocar: "comer", validado: false },
  { categoria: "giria", procurar: ["breja", "cerva"], trocar: "cerveja", validado: false },
  { categoria: "giria", procurar: ["bicho"], trocar: "animal", explicacao: "\"Bicho\" também é usado como chamamento (\"ô bicho\"). Se quis dizer um animal, diga qual; se foi chamamento, use \"amigo\".", validado: false },
  { categoria: "giria", procurar: ["sacou", "saquei", "manjou", "manjei"], trocar: "entendeu", validado: false },
  { categoria: "giria", procurar: ["tá ligado", "ta ligado", "tlg", "sacas"], trocar: "entendeu?", validado: false },
  { categoria: "giria", procurar: ["pegação"], trocar: "namoro", validado: false },
  { categoria: "giria", procurar: ["ficante"], trocar: "namorado", validado: false },
  { categoria: "giria", procurar: ["boladão", "bolado", "bolada"], trocar: "chateado", validado: false },
  { categoria: "giria", procurar: ["pistola", "bravo pra caramba"], trocar: "com raiva", validado: false },
  { categoria: "giria", procurar: ["morgando", "morgado"], trocar: "com preguiça", validado: false },
  { categoria: "giria", procurar: ["larica"], trocar: "fome", validado: false },
  { categoria: "giria", procurar: ["perrengue"], trocar: "dificuldade", validado: false },

  // ========================================================
  // EXPRESSÕES (não literais)
  // ========================================================
  { categoria: "expressao", procurar: ["caiu a ficha", "cair a ficha", "a ficha caiu"], trocar: "entendi", validado: false },
  { categoria: "expressao", procurar: ["pagar mico", "paguei mico", "pagou mico"], trocar: "passar vergonha", validado: false },
  { categoria: "expressao", procurar: ["pisar na bola", "pisei na bola", "pisou na bola"], trocar: "errar", validado: false },
  { categoria: "expressao", procurar: ["dar um bolo", "deu um bolo", "levei um bolo", "me deu bolo"], trocar: "não apareceu no encontro", validado: false },
  { categoria: "expressao", procurar: ["enfiar o pé na jaca", "enfiei o pé na jaca", "chutar o balde", "chutei o balde"], trocar: "exagerar", validado: false },
  { categoria: "expressao", procurar: ["chover no molhado"], trocar: "repetir o que todo mundo já sabe", validado: false },
  { categoria: "expressao", procurar: ["quebrar o galho", "quebra o galho", "quebrou o galho", "quebra um galho"], trocar: "ajudar", validado: false },
  { categoria: "expressao", procurar: ["matar aula", "matei aula", "matou aula"], trocar: "faltar na aula de propósito", validado: false },
  { categoria: "expressao", procurar: ["matar a saudade"], trocar: "ver de novo quem eu sinto falta", validado: false },
  { categoria: "expressao", procurar: ["cabeça nas nuvens", "cabeça na lua", "mundo da lua"], trocar: "distraído", validado: false },
  { categoria: "expressao", procurar: ["abrir o jogo", "abre o jogo", "abri o jogo"], trocar: "contar a verdade", validado: false },
  { categoria: "expressao", procurar: ["ficar de olho", "fica de olho", "fiquei de olho"], trocar: "prestar atenção", validado: false },
  { categoria: "expressao", procurar: ["dar uma mão", "dá uma mão", "me dá uma mão", "dar uma força", "dá uma força"], trocar: "ajudar", validado: false },
  { categoria: "expressao", procurar: ["pegar no pé", "pegando no pé", "pega no pé"], trocar: "incomodar", validado: false },
  { categoria: "expressao", procurar: ["encher o saco", "enchendo o saco", "encheu o saco"], trocar: "irritar", validado: false },
  { categoria: "expressao", procurar: ["encher linguiça", "enchendo linguiça"], trocar: "enrolar", validado: false },
  { categoria: "expressao", procurar: ["fazer uma vaquinha", "fazer vaquinha", "vaquinha"], trocar: "juntar dinheiro em grupo", validado: false },
  { categoria: "expressao", procurar: ["pão-duro", "pão duro", "mão de vaca", "mão-de-vaca"], trocar: "pessoa que não gosta de gastar dinheiro", validado: false },
  { categoria: "expressao", procurar: ["puxa-saco", "puxa saco", "puxar o saco"], trocar: "bajulador", validado: false },
  { categoria: "expressao", procurar: ["cara de pau"], trocar: "sem vergonha", validado: false },
  { categoria: "expressao", procurar: ["dar com a língua nos dentes", "deu com a língua nos dentes"], trocar: "contar um segredo", validado: false },
  { categoria: "expressao", procurar: ["ficar a ver navios", "fiquei a ver navios"], trocar: "esperar e não conseguir nada", validado: false },
  { categoria: "expressao", procurar: ["tirar o cavalinho da chuva", "tira o cavalinho da chuva"], trocar: "desistir", validado: false },
  { categoria: "expressao", procurar: ["custa os olhos da cara", "custou os olhos da cara", "os olhos da cara"], trocar: "muito caro", validado: false },
  { categoria: "expressao", procurar: ["nas coxas"], trocar: "malfeito", validado: false },
  { categoria: "expressao", procurar: ["de mão beijada"], trocar: "sem esforço", validado: false },
  { categoria: "expressao", procurar: ["botar a mão no fogo", "ponho a mão no fogo", "colocar a mão no fogo"], trocar: "confiar totalmente", validado: false },
  { categoria: "expressao", procurar: ["foi pro brejo", "ir pro brejo", "foi por água abaixo", "deu ruim"], trocar: "deu errado", validado: false },
  { categoria: "expressao", procurar: ["levar um fora", "levei um fora", "tomar um toco", "tomei um toco"], trocar: "ser rejeitado", validado: false },
  { categoria: "expressao", procurar: ["deu um branco", "me deu um branco", "dar um branco"], trocar: "esqueci", validado: false },
  { categoria: "expressao", procurar: ["morto de fome", "morta de fome", "morrendo de fome"], trocar: "com muita fome", validado: false },
  { categoria: "expressao", procurar: ["morto de cansado", "morta de cansada", "morrendo de cansaço"], trocar: "muito cansado", validado: false },
  { categoria: "expressao", procurar: ["morto de sono", "morta de sono", "morrendo de sono"], trocar: "com muito sono", validado: false },
  { categoria: "expressao", procurar: ["morrendo de rir", "morri de rir", "chorei de rir"], trocar: "rindo muito", validado: false },
  { categoria: "expressao", procurar: ["chutar a resposta", "chutei a resposta", "chutei na prova", "chutar na prova"], trocar: "adivinhar a resposta", explicacao: "Na escola, \"chutar\" a resposta quer dizer adivinhar. O avatar faria o sinal de chutar com o pé.", validado: false },
  { categoria: "expressao", procurar: ["colar na prova", "colei na prova", "colou na prova", "dar cola"], trocar: "copiar na prova", validado: false },
  { categoria: "expressao", procurar: ["deu zebra"], trocar: "aconteceu algo inesperado", validado: false },
  { categoria: "expressao", procurar: ["tirar de letra", "tirei de letra", "tirou de letra"], trocar: "fazer com facilidade", validado: false },
  { categoria: "expressao", procurar: ["ficar de molho", "fiquei de molho"], trocar: "descansar em casa", validado: false },
  { categoria: "expressao", procurar: ["pegar leve", "pega leve"], trocar: "ir com calma", validado: false },
  { categoria: "expressao", procurar: ["jogar conversa fora", "jogando conversa fora"], trocar: "conversar à toa", validado: false },
  { categoria: "expressao", procurar: ["bater papo", "batendo papo", "trocar ideia", "trocando ideia"], trocar: "conversar", validado: false },
  { categoria: "expressao", procurar: ["fazer as pazes", "fizemos as pazes"], trocar: "fazer amizade de novo", validado: false },
  { categoria: "expressao", procurar: ["mão na roda"], trocar: "muito útil", validado: false },
  { categoria: "expressao", procurar: ["quebrar a cara", "quebrei a cara", "quebrou a cara"], trocar: "se dar mal", validado: false },
  { categoria: "expressao", procurar: ["segurar vela", "segurando vela"], trocar: "ficar sozinho perto de um casal", validado: false },
  { categoria: "expressao", procurar: ["cabeça dura", "cabeça-dura"], trocar: "teimoso", validado: false },
  { categoria: "expressao", procurar: ["olho grande", "olho gordo"], trocar: "inveja", validado: false },
  { categoria: "expressao", procurar: ["conversa fiada", "conversa mole"], trocar: "mentira", validado: false },
  { categoria: "expressao", procurar: ["corpo mole", "fazer corpo mole"], trocar: "não se esforçar", validado: false },
  { categoria: "expressao", procurar: ["bater as botas", "bateu as botas", "abotoou o paletó"], trocar: "morrer", validado: false },
  { categoria: "expressao", procurar: ["no mesmo barco"], trocar: "na mesma situação", validado: false },
  { categoria: "expressao", procurar: ["falar pelos cotovelos", "fala pelos cotovelos"], trocar: "falar muito", validado: false },
  { categoria: "expressao", procurar: ["acertar na mosca", "acertou na mosca"], trocar: "acertar exatamente", validado: false },
  { categoria: "expressao", procurar: ["tempestade em copo d'água", "tempestade num copo d'água"], trocar: "exagero de um problema pequeno", validado: false },
  { categoria: "expressao", procurar: ["fiquei de cara", "ficou de cara", "fiquei passado", "fiquei chocado"], trocar: "fiquei surpreso", validado: false },
  { categoria: "expressao", procurar: ["cair na real", "caiu na real", "caí na real"], trocar: "perceber a verdade", validado: false },
  { categoria: "expressao", procurar: ["dar o braço a torcer", "dei o braço a torcer"], trocar: "admitir que errou", validado: false },
  { categoria: "expressao", procurar: ["tirar onda", "tirando onda", "se achando"], trocar: "se exibir", validado: false },
  { categoria: "expressao", procurar: ["levar na esportiva", "leva na esportiva"], trocar: "não ficar chateado", validado: false },
  { categoria: "expressao", procurar: ["está chovendo canivete", "chovendo canivete"], trocar: "chovendo muito", validado: false },
  { categoria: "expressao", procurar: ["frio de rachar", "um frio de lascar"], trocar: "muito frio", validado: false },
  { categoria: "expressao", procurar: ["calor de matar", "um calor de rachar"], trocar: "muito calor", validado: false },
  { categoria: "expressao", procurar: ["que pena"], trocar: "que triste", validado: false },
  { categoria: "expressao", procurar: ["tô nem aí", "to nem ai", "nem aí"], trocar: "não me importo", validado: false },
  { categoria: "expressao", procurar: ["tanto faz"], trocar: "não importa", validado: false },
  { categoria: "expressao", procurar: ["sei lá"], trocar: "não sei", validado: false },
  { categoria: "expressao", procurar: ["nada a ver"], trocar: "não tem relação", validado: false },
  { categoria: "expressao", procurar: ["fazer a egípcia", "fez a egípcia"], trocar: "fingir que não viu", validado: false },
  { categoria: "expressao", procurar: ["dar um gelo", "deu um gelo"], trocar: "ignorar", validado: false },
  { categoria: "expressao", procurar: ["perder a cabeça", "perdi a cabeça", "perdeu a cabeça"], trocar: "ficar com muita raiva", validado: false },
  { categoria: "expressao", procurar: ["com a pulga atrás da orelha"], trocar: "desconfiado", validado: false },
  { categoria: "expressao", procurar: ["dor de cotovelo"], trocar: "ciúme", validado: false },
  { categoria: "expressao", procurar: ["andar na linha", "anda na linha"], trocar: "se comportar", validado: false },
  { categoria: "expressao", procurar: ["dar o fora", "dá o fora", "vazei", "meter o pé", "meti o pé"], trocar: "ir embora", validado: false },
  { categoria: "expressao", procurar: ["de cabo a rabo"], trocar: "do começo ao fim", validado: false },
  { categoria: "expressao", procurar: ["num piscar de olhos"], trocar: "muito rápido", validado: false },
  { categoria: "expressao", procurar: ["rapidinho", "num instante", "em dois tempos"], trocar: "rápido", validado: false },
  { categoria: "expressao", procurar: ["pé de meia"], trocar: "dinheiro guardado", validado: false },
  { categoria: "expressao", procurar: ["estar na pior", "tô na pior"], trocar: "estar mal", validado: false },
  { categoria: "expressao", procurar: ["virar a noite", "virei a noite"], trocar: "ficar sem dormir a noite toda", validado: false },
  { categoria: "expressao", procurar: ["quebrar a cabeça", "quebrando a cabeça"], trocar: "pensar muito", validado: false },
  { categoria: "expressao", procurar: ["ir com a cara", "vou com a cara"], trocar: "gostar", validado: false },
  { categoria: "expressao", procurar: ["não vou com a cara"], trocar: "não gosto", validado: false },
  { categoria: "expressao", procurar: ["bola fora"], trocar: "erro", validado: false },
  { categoria: "expressao", procurar: ["fazer a cabeça", "fez a minha cabeça"], trocar: "convencer", validado: false },

  // ========================================================
  // MAIS NATURAL EM LIBRAS
  // ========================================================
  { categoria: "natural", procurar: ["que dia é", "qual dia é", "que dia vai ser", "qual o dia"], exceto: ["que dia é hoje", "qual dia é hoje", "qual o dia de hoje", "qual o dia da semana"], trocar: "quando é", explicacao: "Em Libras é mais natural perguntar QUANDO do que \"que dia\". O sinal de QUANDO já pede uma data como resposta.", validado: false },
  { categoria: "natural", procurar: ["que horas vai ser", "que horas é", "a que horas"], trocar: "que horas", validado: false },
  { categoria: "natural", procurar: ["a gente"], trocar: "nós", explicacao: "\"A gente\" pode virar o sinal de GENTE (pessoas). \"Nós\" tem sinal próprio e fica mais claro.", validado: false },
  { categoria: "natural", procurar: ["daqui a pouco", "já já", "logo mais"], trocar: "logo", validado: false },
  { categoria: "natural", procurar: ["agorinha", "agora mesmo"], trocar: "agora", validado: false },
  { categoria: "natural", procurar: ["você poderia me dizer", "você pode me dizer", "poderia me dizer"], trocar: "me diga", validado: false },
  { categoria: "natural", procurar: ["eu gostaria de", "eu queria"], trocar: "eu quero", validado: false },
  { categoria: "natural", procurar: ["por gentileza", "por obséquio", "se possível"], trocar: "por favor", validado: false },
  { categoria: "natural", procurar: ["estou a fim de", "tô a fim de", "to a fim de", "tô afim de", "afim de"], trocar: "eu quero", validado: false },
  { categoria: "natural", procurar: ["tem como", "dá pra", "da pra", "dá para"], trocar: "é possível", validado: false },
  { categoria: "natural", procurar: ["de vez em quando", "vez ou outra"], trocar: "às vezes", validado: false },
  { categoria: "natural", procurar: ["em cima da hora"], trocar: "quase sem tempo", validado: false },
  { categoria: "natural", procurar: ["um monte de", "uma pá de", "um bocado de"], trocar: "muitos", validado: false },
  { categoria: "natural", procurar: ["à beça", "a beça", "pra caramba", "demais da conta", "pra chuchu"], trocar: "muito", validado: false },
  { categoria: "natural", procurar: ["será que"], trocar: "acho que", explicacao: "\"Será que\" expressa dúvida. Em Libras a dúvida aparece no rosto; a frase fica mais clara com \"acho que\" ou como pergunta direta.", validado: false },
  { categoria: "natural", procurar: ["há muito tempo", "faz tempo", "faz muito tempo"], trocar: "muito tempo atrás", validado: false },
  { categoria: "natural", procurar: ["anteontem"], trocar: "dois dias atrás", validado: false },
  { categoria: "natural", procurar: ["depois de amanhã"], trocar: "daqui a dois dias", validado: false },
  { categoria: "natural", procurar: ["o senhor", "a senhora"], trocar: "você", explicacao: "Libras não tem pronome de tratamento como \"o senhor\". O respeito aparece na postura e na expressão; o sinal é o mesmo de VOCÊ.", validado: false },
  { categoria: "natural", procurar: ["vossa senhoria", "vossa excelência"], trocar: "você", validado: false },
  { categoria: "natural", procurar: ["não é verdade?", "não é mesmo?", "concorda?"], trocar: "certo?", validado: false },
  { categoria: "natural", procurar: ["eu acho que sim"], trocar: "acho que sim", validado: false },
  { categoria: "natural", procurar: ["com certeza absoluta", "sem sombra de dúvida", "sem dúvida nenhuma"], trocar: "com certeza", validado: false },
  { categoria: "natural", procurar: ["qual é a sua idade", "qual a sua idade"], trocar: "quantos anos você tem", validado: false },
  { categoria: "natural", procurar: ["você mora onde", "cê mora onde"], trocar: "onde você mora", validado: false },
  { categoria: "natural", procurar: ["que é isso", "o que que é isso", "que que é isso"], trocar: "o que é isso", validado: false },
  { categoria: "natural", procurar: ["o que que", "que que"], trocar: "o que", validado: false },

  // ========================================================
  // PALAVRAS COM MAIS DE UM SENTIDO (o aluno escolhe)
  // ========================================================
  { categoria: "ambigua", procurar: ["gato", "gata"], opcoes: [{ rotulo: "Animal", trocar: "gato animal" }, { rotulo: "Pessoa bonita", trocar: "pessoa bonita" }], validado: false },
  { categoria: "ambigua", procurar: ["trem"], opcoes: [{ rotulo: "Meio de transporte", trocar: "trem de ferro" }, { rotulo: "Coisa (jeito mineiro)", trocar: "coisa" }], validado: false },
  { categoria: "ambigua", procurar: ["manga"], opcoes: [{ rotulo: "Fruta", trocar: "fruta manga" }, { rotulo: "Da camisa", trocar: "manga da camisa" }], validado: false },
  { categoria: "ambigua", procurar: ["banco"], opcoes: [{ rotulo: "De sentar", trocar: "banco de sentar" }, { rotulo: "De dinheiro", trocar: "agência do banco" }], validado: false },
  { categoria: "ambigua", procurar: ["cara"], opcoes: [{ rotulo: "Rosto", trocar: "rosto" }, { rotulo: "Pessoa / homem", trocar: "homem" }, { rotulo: "Que custa muito", trocar: "caro" }], validado: false },
  { categoria: "ambigua", procurar: ["pena"], opcoes: [{ rotulo: "Sentir dó", trocar: "dó" }, { rotulo: "De pássaro", trocar: "pena de pássaro" }, { rotulo: "Castigo", trocar: "castigo" }], validado: false },
  { categoria: "ambigua", procurar: ["vela"], opcoes: [{ rotulo: "De acender", trocar: "vela de acender" }, { rotulo: "De barco", trocar: "vela do barco" }], validado: false },
  { categoria: "ambigua", procurar: ["rede"], opcoes: [{ rotulo: "De dormir", trocar: "rede de dormir" }, { rotulo: "Internet", trocar: "internet" }, { rotulo: "Rede social", trocar: "rede social" }, { rotulo: "De pesca", trocar: "rede de pesca" }], validado: false },
  { categoria: "ambigua", procurar: ["pilha"], opcoes: [{ rotulo: "Bateria", trocar: "bateria" }, { rotulo: "Monte de coisas", trocar: "monte" }], validado: false },
  { categoria: "ambigua", procurar: ["bateria"], opcoes: [{ rotulo: "Do celular", trocar: "bateria do celular" }, { rotulo: "Instrumento", trocar: "instrumento bateria" }], validado: false },
  { categoria: "ambigua", procurar: ["nota"], opcoes: [{ rotulo: "Da prova", trocar: "nota da prova" }, { rotulo: "Dinheiro", trocar: "dinheiro" }, { rotulo: "Musical", trocar: "nota musical" }, { rotulo: "Anotação", trocar: "anotação" }], validado: false },
  { categoria: "ambigua", procurar: ["folha"], opcoes: [{ rotulo: "De papel", trocar: "folha de papel" }, { rotulo: "De árvore", trocar: "folha da árvore" }], validado: false },
  { categoria: "ambigua", procurar: ["cola"], opcoes: [{ rotulo: "De colar", trocar: "cola de papel" }, { rotulo: "Na prova", trocar: "copiar na prova" }], validado: false },
  { categoria: "ambigua", procurar: ["ponto"], opcoes: [{ rotulo: "De ônibus", trocar: "ponto de ônibus" }, { rotulo: "Sinal (.)", trocar: "ponto final" }, { rotulo: "Pontuação no jogo", trocar: "pontos" }, { rotulo: "Matéria da aula", trocar: "matéria" }], validado: false },
  { categoria: "ambigua", procurar: ["canto"], opcoes: [{ rotulo: "Cantar", trocar: "eu canto" }, { rotulo: "Esquina / lado", trocar: "canto da sala" }], validado: false },
  { categoria: "ambigua", procurar: ["papel"], opcoes: [{ rotulo: "Folha", trocar: "papel" }, { rotulo: "Função / personagem", trocar: "função" }], validado: false },
  { categoria: "ambigua", procurar: ["massa"], opcoes: [{ rotulo: "Comida (macarrão)", trocar: "macarrão" }, { rotulo: "Legal (gíria)", trocar: "legal" }, { rotulo: "De pão / bolo", trocar: "massa de bolo" }], validado: false },
  { categoria: "ambigua", procurar: ["planta"], opcoes: [{ rotulo: "Vegetal", trocar: "planta" }, { rotulo: "Do pé", trocar: "sola do pé" }, { rotulo: "Desenho da casa", trocar: "desenho da casa" }], validado: false },
  { categoria: "ambigua", procurar: ["pasta"], opcoes: [{ rotulo: "De documentos", trocar: "pasta de documentos" }, { rotulo: "De dente", trocar: "pasta de dente" }, { rotulo: "No computador", trocar: "pasta do computador" }], validado: false },
  { categoria: "ambigua", procurar: ["mouse"], opcoes: [{ rotulo: "Do computador", trocar: "mouse do computador" }, { rotulo: "Animal", trocar: "rato" }], validado: false },
  { categoria: "ambigua", procurar: ["lima"], opcoes: [{ rotulo: "Fruta", trocar: "fruta lima" }, { rotulo: "Lixa de unha", trocar: "lixa" }], validado: false },
  { categoria: "ambigua", procurar: ["laranja"], opcoes: [{ rotulo: "Fruta", trocar: "fruta laranja" }, { rotulo: "Cor", trocar: "cor laranja" }], validado: false },
  { categoria: "ambigua", procurar: ["rosa"], opcoes: [{ rotulo: "Flor", trocar: "flor rosa" }, { rotulo: "Cor", trocar: "cor rosa" }], validado: false },
  { categoria: "ambigua", procurar: ["cravo"], opcoes: [{ rotulo: "Flor", trocar: "flor cravo" }, { rotulo: "Na pele", trocar: "cravo na pele" }, { rotulo: "Tempero", trocar: "cravo tempero" }], validado: false },
  { categoria: "ambigua", procurar: ["quadro"], opcoes: [{ rotulo: "Lousa da sala", trocar: "lousa" }, { rotulo: "Pintura", trocar: "pintura" }], validado: false },
  { categoria: "ambigua", procurar: ["serra"], opcoes: [{ rotulo: "Ferramenta", trocar: "serrote" }, { rotulo: "Montanha", trocar: "montanhas" }], validado: false },
  { categoria: "ambigua", procurar: ["cabo"], opcoes: [{ rotulo: "Fio", trocar: "fio" }, { rotulo: "Alça / cabo da panela", trocar: "cabo da panela" }, { rotulo: "Militar", trocar: "cabo do exército" }], validado: false },
];
