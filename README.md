# Tradutor de Libras

Site para traduzir de Português para Libras com um avatar 3D (VLibras),
feito para alunos ouvintes de uma escola traduzirem e aprenderem Libras.

## Estrutura de pastas

```
TradutorLibras/
├── servidor.py                  Servidor local para testar (Python)
├── vercel.json                  Rotas do site (usadas pelo Vercel E pelo servidor.py)
├── pytest.ini                   Configuração dos testes
├── requirements-testes.txt      Bibliotecas dos testes (pytest, playwright)
├── .vercelignore                Arquivos que não vão para o site publicado
├── .gitignore                   Arquivos que o Git ignora
├── README.md                    Este arquivo
│
├── html/                        Páginas
│   ├── index.html               Página inicial (os dois caminhos + como funciona)
│   ├── portugues-libras.html    Tradutor Português → Libras
│   └── libras-portugues.html    Libras → Português ("em desenvolvimento")
│
├── css/                         Estilos
│   ├── base.css                 Cores (variáveis), fonte, reset, acessibilidade
│   ├── layout.css               Faixa colorida do topo, menu, rodapé
│   ├── componentes.css          Cartão, selo, botões, chips, abas, spinner, animações
│   └── paginas/                 Estilos exclusivos de cada página
│       ├── inicio.css
│       ├── portugues-libras.css
│       └── libras-portugues.css
│
├── js/                          JavaScript
│   ├── dados/                   Só dados (pode editar sem mexer no código)
│   │   └── sugestoes.js         Regras da "Dica de Libras" (gírias, expressões…)
│   ├── modulos/                 Peças reutilizáveis, uma responsabilidade cada
│   │   ├── config.js            Configurações gerais (limites, tempos, chaves)
│   │   ├── validacao.js         Confere e limpa o texto antes de traduzir
│   │   ├── vlibras.js           Integração com o avatar do VLibras (+ erros)
│   │   ├── balao.js             Balão de resultado (inicial/carregando/sinalizando/erro)
│   │   ├── sugestoes.js         Motor das sugestões: acha e aplica as regras
│   │   ├── cartao-sugestao.js   Cartão "Dica de Libras" na tela
│   │   ├── abas.js              Abas acessíveis (funcionam com o teclado)
│   │   ├── frases.js            Frases prontas para praticar
│   │   ├── historico.js         Frases recentes (salvas no navegador)
│   │   └── voz.js               Entrada por voz (microfone)
│   └── paginas/                 Script principal de cada página
│       └── portugues-libras.js
│
└── testes/                      Testes automáticos (pytest + Playwright)
    ├── conftest.py              Peças comuns: servidor, navegador, VLibras falso
    ├── test_servidor.py         servidor.py: porta, rotas, vercel.json com problema
    ├── test_validacao.py        Regras do texto (vazio, só emojis, longo…)
    ├── test_sugestoes.py        Regras de sugestão, motor e cartão
    └── test_tradutor.py         A página no navegador, com foco em exceções
```

**Regras de organização**
- Cada página HTML carrega `base.css`, `layout.css`, `componentes.css` e o seu CSS em `css/paginas/`.
- Cada página com lógica tem um script em `js/paginas/`, que importa o que precisa de `js/modulos/`.
- Nomes de classes CSS: `bloco`, `bloco__parte` e `bloco--variacao` (ex.: `balao__frase`, `botao--grande`).
- Cores ficam só nas variáveis de `css/base.css`. Para mudar a paleta, mude ali.
- Endereços dos arquivos começam com `/` (ex.: `/css/base.css`), por isso o site precisa rodar num servidor.

## Rotas

| Endereço | Arquivo |
|---|---|
| `/` | `html/index.html` |
| `/portugues-libras` | `html/portugues-libras.html` |
| `/libras-portugues` | `html/libras-portugues.html` |

Para criar uma página nova: crie o HTML em `html/`, o CSS em `css/paginas/`,
o JS em `js/paginas/` (se precisar) e adicione a rota no `vercel.json`.

## Como testar no seu computador

```bash
python servidor.py
```

O navegador abre em http://localhost:8000. Use Chrome ou Edge.
Se a porta estiver ocupada, o servidor avisa e sugere outra (ex.: `python servidor.py 8001`).

## Testes automáticos

Instale uma vez:

```bash
pip install -r requirements-testes.txt
python -m playwright install chromium
```

Rode sempre que mudar algo:

```bash
python -m pytest
```

Os testes usam um VLibras **falso**, então funcionam sem internet. Eles conferem, entre outros:

| Situação | O que o site deve fazer |
|---|---|
| Texto vazio, só espaços, só símbolos/emojis | Mostrar erro, tremer o campo, não chamar o avatar |
| Mais de 500 caracteres | Campo não aceita; contador fica vermelho |
| HTML digitado (`<img onerror=…>`) | Mostrar como texto, nunca executar |
| VLibras fora do ar | Erro com botão "Recarregar" |
| Avatar não abre em 90 s | Erro com botão "Tentar de novo" |
| Aluno fechou o avatar | Próxima tradução abre de novo |
| Vários cliques seguidos | Traduz uma vez só |
| Internet caiu / voltou | Avisa e volta ao normal sozinho |
| Histórico estragado ou armazenamento bloqueado | Página funciona, recentes ficam vazios |
| Microfone bloqueado, sem microfone, sem fala | Mensagem clara para cada caso |
| Navegador sem reconhecimento de voz | Esconde o botão do microfone |
| Porta inválida/ocupada, `vercel.json` com erro | Mensagem clara no terminal |
| Celular (360 px) | Nenhuma página com rolagem para o lado |

## Dica de Libras (sugestões)

Enquanto o aluno digita, o site procura trechos que costumam ficar ruins em Libras
e mostra um cartão com uma sugestão. **Nada é trocado sozinho**: o aluno escolhe
"Usar sugestão", um dos sentidos da palavra, ou "Manter como está".

As regras ficam em **`js/dados/sugestoes.js`**, divididas em categorias:

| Categoria | Exemplo |
|---|---|
| Abreviação | vc → você, pq → porque, kkkk → engraçado |
| Fala informal | tô → estou, pra → para, cadê → onde está |
| Gíria | mó → muito, rolê → passeio, trampo → trabalho |
| Expressão | caiu a ficha → entendi, pagar mico → passar vergonha |
| Mais natural em Libras | que dia é → quando é, a gente → nós |
| Palavra com mais de um sentido | manga → fruta / da camisa (o aluno escolhe) |

**Todas as regras começaram com `validado: false`.** Conforme você revisar com a
comunidade surda, corrija o que precisar e mude para `validado: true`.

Para editar:
1. Abra `js/dados/sugestoes.js` (o começo do arquivo explica o formato).
2. Adicione, apague ou corrija regras.
3. Rode `python -m pytest testes/test_sugestoes.py`. O teste `test_regras_sem_problemas`
   avisa se alguma regra ficou mal escrita (termo repetido, opção faltando…).
   O mesmo aviso aparece no console do navegador (F12).

## Como publicar no Vercel

1. Envie as mudanças para o GitHub (`git add .`, `git commit -m "..."`, `git push`).
2. No Vercel: **Add New → Project**, escolha o repositório.
3. *Framework Preset*: **Other**. Não precisa de comando de build.
4. **Deploy**. A cada `git push` o site atualiza sozinho.

## Como a tradução funciona

1. A página carrega o widget oficial do VLibras.
2. Ao clicar em **Traduzir**, `validacao.js` confere o texto e `vlibras.js` abre o avatar.
3. O texto vai para o balão de resultado e o script simula um clique nele.
   O VLibras traduz o texto clicado e o avatar faz os sinais.

Detalhes:
- Botões e links do tradutor têm a classe `vlibras-links`, para o avatar não "traduzir"
  o botão em vez de executar a ação. Ícones dentro deles têm `pointer-events: none`.
- A tradução depende da internet e dos servidores do VLibras.
- O VLibras não tem comando oficial para "traduzir este texto"; usamos um comportamento
  interno do widget (versão 7.12.2). Se parar de funcionar, revise `widgetPronto()`.

## Próximos passos

- Validar as frases com a comunidade surda e ampliar a lista em `js/modulos/frases.js`.
- Seção "Aprender": alfabeto manual, números e vocabulário por tema.
- Depois: Libras → Português (câmera com MediaPipe e um teclado visual de Libras).
