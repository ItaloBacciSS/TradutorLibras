# Tradutor de Libras

Site para traduzir de Português para Libras com um avatar 3D (VLibras),
feito para alunos ouvintes de uma escola traduzirem e aprenderem Libras.

## Estrutura de pastas

```
TradutorLibras/
├── servidor.py                  Servidor local para testar (Python)
├── vercel.json                  Rotas do site (usadas pelo Vercel E pelo servidor.py)
├── .vercelignore                Arquivos que não vão para o site publicado
├── .gitignore                   Arquivos que o Git ignora
├── README.md                    Este arquivo
│
├── html/                        Páginas
│   ├── index.html               Página inicial (descrição + os dois caminhos)
│   ├── portugues-libras.html    Tradutor Português → Libras
│   └── libras-portugues.html    Libras → Português ("em desenvolvimento")
│
├── css/                         Estilos
│   ├── base.css                 Cores (variáveis), reset, tipografia, acessibilidade
│   ├── layout.css               Container, cabeçalho, menu e rodapé
│   ├── componentes.css          Cartão, selo, botões, chips, campo, status, dica
│   └── paginas/                 Estilos exclusivos de cada página
│       ├── inicio.css
│       ├── portugues-libras.css
│       └── libras-portugues.css
│
└── js/                          JavaScript
    ├── modulos/                 Peças reutilizáveis, uma responsabilidade cada
    │   ├── config.js            Configurações gerais (limites, tempos, chaves)
    │   ├── vlibras.js           Integração com o avatar do VLibras
    │   ├── frases.js            Frases prontas para praticar
    │   ├── historico.js         Últimas traduções (salvas no navegador)
    │   ├── voz.js               Entrada por voz (microfone)
    │   └── status.js            Mensagens para o usuário
    └── paginas/                 Script principal de cada página
        └── portugues-libras.js
```

**Regras de organização**
- Cada página HTML carrega `base.css`, `layout.css`, `componentes.css` e o seu CSS em `css/paginas/`.
- Cada página com lógica tem um script em `js/paginas/`, que importa o que precisa de `js/modulos/`.
- Nomes de classes CSS: `bloco`, `bloco__parte` e `bloco--variacao` (ex.: `caminho__acao`, `botao--secundario`).
- Endereços dos arquivos começam com `/` (ex.: `/css/base.css`), por isso o site precisa rodar num servidor.

## Rotas

| Endereço | Arquivo |
|---|---|
| `/` | `html/index.html` |
| `/portugues-libras` | `html/portugues-libras.html` |
| `/libras-portugues` | `html/libras-portugues.html` |

Para criar uma página nova: crie o HTML em `html/`, o CSS em `css/paginas/`,
o JS em `js/paginas/` (se precisar) e adicione a rota no `vercel.json`.
O `servidor.py` lê o mesmo arquivo, então funciona igual nos dois lugares.

## Como testar no seu computador

Dentro da pasta do projeto:

```bash
python servidor.py
```

O navegador abre em http://localhost:8000. Use Chrome ou Edge.
Na primeira tradução o avatar pode levar alguns segundos para carregar.

## Como publicar no Vercel

**Pelo GitHub (recomendado)**
1. Crie um repositório no GitHub e envie esta pasta.
2. No Vercel: **Add New → Project**, escolha o repositório.
3. *Framework Preset*: **Other**. Não precisa de comando de build.
4. **Deploy**. A cada `git push` o site atualiza sozinho.

**Pela linha de comando**
```bash
npm i -g vercel
vercel          # primeira vez
vercel --prod   # publicar
```

## Como a tradução funciona

1. A página carrega o widget oficial do VLibras.
2. Ao clicar em **Traduzir**, `js/modulos/vlibras.js` abre o avatar e espera ele carregar.
3. O texto vai para o quadro "Sendo sinalizado agora" e o script simula um clique nele.
   O VLibras traduz o texto clicado e o avatar faz os sinais.

Detalhes:
- Botões e links do tradutor têm a classe `vlibras-links`, para o avatar não "traduzir"
  o botão em vez de executar a ação.
- Com o avatar aberto, clicar em qualquer texto da página também o traduz.
- A tradução depende da internet e dos servidores do VLibras.
- O VLibras não tem comando oficial para "traduzir este texto"; usamos um comportamento
  interno do widget (versão 7.12.2). Se parar de funcionar, revise `widgetPronto()`.

## Próximos passos

- Validar as frases com a comunidade surda e ampliar a lista em `js/modulos/frases.js`.
- Seção "Aprender": alfabeto manual, números e vocabulário por tema.
- Depois: Libras → Português (câmera com MediaPipe e um teclado visual de Libras).
