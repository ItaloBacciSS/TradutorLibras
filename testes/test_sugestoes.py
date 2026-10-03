"""
test_sugestoes.py
=================
Testes das sugestões ("Dica de Libras"):
- a lista de regras (js/dados/sugestoes.js) está bem escrita;
- o motor (js/modulos/sugestoes.js) acha e aplica do jeito certo;
- o cartão na página funciona (usar, escolher, manter).
"""

import pytest
from playwright.sync_api import expect

IMPORTAR = """
async () => {
  window.motor = await import("/js/modulos/sugestoes.js");
  window.dados = await import("/js/dados/sugestoes.js");
}
"""

PROCURAR = """
(texto) => motor.encontrarSugestoes(texto).map((s) => ({
  trecho: s.trecho, tipo: s.tipo, opcoes: s.opcoes.map((o) => o.trocar)
}))
"""

APLICAR_PRIMEIRA = """
(texto) => {
  const [s] = motor.encontrarSugestoes(texto);
  return s ? motor.aplicarSugestao(texto, s, s.opcoes[0].trocar) : null;
}
"""


@pytest.fixture(scope="module")
def js(navegador, servidor_local):
    """Página em branco do site com o motor de sugestões carregado."""
    contexto = navegador.new_context()
    pagina = contexto.new_page()
    pagina.goto(servidor_local + "/css/base.css")
    pagina.evaluate(IMPORTAR)
    yield pagina
    contexto.close()


def trechos(js, texto):
    return [s["trecho"] for s in js.evaluate(PROCURAR, texto)]


# ==========================================================
# A lista de regras
# ==========================================================
def test_regras_sem_problemas(js):
    problemas = js.evaluate("motor.conferirRegras()")
    assert problemas == [], "\n".join(problemas)


def test_tem_bastante_regras(js):
    assert js.evaluate("dados.REGRAS.length") >= 200


def test_toda_categoria_tem_nome_e_explicacao(js):
    categorias = js.evaluate("dados.CATEGORIAS")
    for chave, categoria in categorias.items():
        assert categoria["nome"], chave
        assert len(categoria["explicacao"]) > 20, chave


def test_sugestao_aplicada_nao_gera_a_mesma_sugestao_de_novo(js):
    """Depois de usar qualquer sugestão, a mesma regra não pode disparar de novo (laço infinito)."""
    repetidas = js.evaluate(
        """() => {
          const problemas = [];
          dados.REGRAS.forEach((regra, i) => {
            for (const termo of regra.procurar) {
              const texto = `ok ${termo} ok`;
              const [s] = motor.encontrarSugestoes(texto, { regras: dados.REGRAS });
              if (!s || s.trecho.toLowerCase() !== termo.toLowerCase()) continue;
              for (const opcao of s.opcoes) {
                const novo = motor.aplicarSugestao(texto, s, opcao.trocar);
                if (novo === texto) continue; // opção igual ao texto: o cartão trata como "manter"
                const deNovo = motor.encontrarSugestoes(novo).some((x) => x.chave.startsWith(i + "|"));
                if (deNovo) problemas.push(`${termo} -> ${opcao.trocar}`);
              }
            }
          });
          return problemas;
        }"""
    )
    assert repetidas == []


# ==========================================================
# O motor: o que ele acha
# ==========================================================
@pytest.mark.parametrize(
    "texto, esperado",
    [
        ("Que dia é sua prova?", ["Que dia é"]),
        ("vc vem tb?", ["vc", "tb"]),
        ("Caiu a ficha", ["Caiu a ficha"]),
        ("a gente vai sair", ["a gente"]),
        ("tô morto de fome kkkk", ["tô", "morto de fome", "kkkk"]),
    ],
)
def test_acha_trechos(js, texto, esperado):
    assert trechos(js, texto) == esperado


@pytest.mark.parametrize(
    "texto",
    [
        "Bom dia, tudo bem?",
        "Qual é o seu nome?",
        "Eu gosto de estudar matemática.",
        "",
        "   ",
    ],
)
def test_frases_normais_nao_tem_sugestao(js, texto):
    assert trechos(js, texto) == []


def test_so_acha_palavras_inteiras(js):
    assert trechos(js, "vcxyz quero tbm") == ["tbm"]  # "q" não acha dentro de "quero"


def test_maiuscula_ou_minuscula_tanto_faz(js):
    assert trechos(js, "VC") == ["VC"]
    assert trechos(js, "Vc") == ["Vc"]


def test_acento_importa(js):
    assert trechos(js, "minha vó") == []  # "vó" (avó) não é "vô"/"vou"


def test_expressao_mais_longa_ganha(js):
    assert trechos(js, "que pena!") == ["que pena"]  # não pergunta sobre "pena"


def test_excecao_da_regra(js):
    """"Que dia é hoje?" é uma pergunta normal: não sugere "quando é"."""
    assert trechos(js, "Que dia é hoje?") == []
    assert trechos(js, "Que dia é a prova?") == ["Que dia é"]


def test_palavra_ambigua_vira_escolha(js):
    [sugestao] = js.evaluate(PROCURAR, "a manga caiu")
    assert sugestao["tipo"] == "escolha"
    assert sugestao["opcoes"] == ["fruta manga", "manga da camisa"]


def test_escolher_o_sentido_que_ja_estava_escrito(abrir_pagina):
    """Em "papel", a opção "Folha" mantém a palavra: o cartão some e não pergunta de novo."""
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "pegue o papel")
    pagina.get_by_role("button", name="Folha").click()
    expect(pagina.locator("#sugestao")).to_be_hidden()
    expect(pagina.locator("#texto")).to_have_value("pegue o papel")


def test_escolha_feita_nao_pergunta_de_novo(js):
    assert trechos(js, "a manga da camisa rasgou") == []
    assert trechos(js, "comi uma fruta manga") == []


def test_mantidas_nao_aparecem(js):
    resultado = js.evaluate(
        """() => {
          const texto = "vc vem tb?";
          const [primeira] = motor.encontrarSugestoes(texto);
          return motor.encontrarSugestoes(texto, { ignoradas: new Set([primeira.chave]) }).map((s) => s.trecho);
        }"""
    )
    assert resultado == ["tb"]


@pytest.mark.parametrize("valor", [None, 123, ["vc"], {"a": 1}])
def test_entrada_de_tipo_errado_nao_quebra(js, valor):
    assert js.evaluate("(v) => motor.encontrarSugestoes(v)", valor) == []


def test_texto_enorme_responde_rapido(js):
    milissegundos = js.evaluate(
        """() => {
          const texto = "vc tb a gente que pena manga ".repeat(20);
          const inicio = performance.now();
          motor.encontrarSugestoes(texto);
          return performance.now() - inicio;
        }"""
    )
    assert milissegundos < 200


# ==========================================================
# O motor: aplicar a sugestão
# ==========================================================
@pytest.mark.parametrize(
    "texto, esperado",
    [
        ("Que dia é sua prova?", "Quando é sua prova?"),  # mantém maiúscula no começo
        ("que dia é sua prova?", "quando é sua prova?"),
        ("VC VEM?", "VOCÊ VEM?"),  # tudo maiúsculo continua maiúsculo
        ("Oi, vc vem?", "Oi, você vem?"),  # meio da frase
        ("caiu a ficha agora", "entendi agora"),
    ],
)
def test_aplicar_sugestao(js, texto, esperado):
    assert js.evaluate(APLICAR_PRIMEIRA, texto) == esperado


def test_regras_personalizadas(js):
    """Dá para testar regras novas antes de colocar no arquivo."""
    resultado = js.evaluate(
        """() => {
          const regras = [{ categoria: "giria", procurar: ["xpto"], trocar: "coisa", validado: false }];
          return motor.encontrarSugestoes("olha o xpto", { regras }).map((s) => s.opcoes[0].trocar);
        }"""
    )
    assert resultado == ["coisa"]


def test_conferir_regras_acha_erros(js):
    problemas = js.evaluate(
        """() => motor.conferirRegras([
          { categoria: "nao-existe", procurar: ["a"], trocar: "b", validado: false },
          { categoria: "giria", procurar: [], trocar: "b", validado: false },
          { categoria: "giria", procurar: ["c"], validado: false },
          { categoria: "giria", procurar: ["d"], trocar: "x", opcoes: [], validado: false },
          { categoria: "ambigua", procurar: ["e"], opcoes: [{ rotulo: "só uma", trocar: "x" }], validado: false },
          { categoria: "giria", procurar: ["f"], trocar: "f", validado: false },
          { categoria: "giria", procurar: ["a"], trocar: "z", validado: "sim" },
          { categoria: "giria", procurar: [" g "], trocar: "z", validado: false },
        ])"""
    )
    texto = "\n".join(problemas)
    assert 'categoria "nao-existe"' in texto
    assert "pelo menos um item" in texto
    assert 'use "trocar" OU "opcoes"' in texto
    assert "pelo menos 2 escolhas" in texto
    assert "trocado por ele mesmo" in texto
    assert "já aparece na regra nº 1" in texto
    assert '"validado" precisa ser true ou false' in texto
    assert "espaço sobrando" in texto


# ==========================================================
# O cartão na página
# ==========================================================
def cartao(pagina):
    return pagina.locator("#sugestao")


def test_cartao_aparece_ao_digitar_e_usar_troca(abrir_pagina):
    pagina, erros = abrir_pagina()
    pagina.type("#texto", "Que dia é sua prova?")

    expect(cartao(pagina)).to_be_visible()
    expect(cartao(pagina)).to_contain_text("Quando é sua prova?")

    pagina.get_by_role("button", name="Usar sugestão").click()
    expect(pagina.locator("#texto")).to_have_value("Quando é sua prova?")
    expect(cartao(pagina)).to_be_hidden()
    assert erros == []


def test_cartao_mostra_quantas_sugestoes_tem(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "vc vem tb?")
    expect(cartao(pagina).locator(".sugestao__contador")).to_have_text("1 de 2")

    pagina.get_by_role("button", name="Usar sugestão").click()
    expect(cartao(pagina)).to_contain_text("também")
    expect(cartao(pagina).locator(".sugestao__contador")).to_have_count(0)


def test_escolher_sentido_da_palavra(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "a manga rasgou")
    expect(cartao(pagina)).to_contain_text("tem mais de um sentido")

    pagina.get_by_role("button", name="Da camisa").click()
    expect(pagina.locator("#texto")).to_have_value("a manga da camisa rasgou")
    expect(cartao(pagina)).to_be_hidden()


def test_manter_como_esta(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "vc vem?")
    pagina.get_by_role("button", name="Manter como está").click()

    expect(cartao(pagina)).to_be_hidden()
    expect(pagina.locator("#texto")).to_have_value("vc vem?")

    # Continuar digitando não traz de volta a mesma sugestão
    pagina.type("#texto", " sim")
    pagina.wait_for_timeout(600)
    expect(cartao(pagina)).to_be_hidden()


def test_por_que_mostra_explicacao(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "Que dia é sua prova?")
    pagina.get_by_text("Por quê?").click()
    expect(cartao(pagina)).to_contain_text("QUANDO")


def test_limpar_esconde_cartao(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "vc vem?")
    expect(cartao(pagina)).to_be_visible()
    pagina.click("#btn-limpar")
    expect(cartao(pagina)).to_be_hidden()


def test_traduzir_com_sugestao_aberta_traduz_o_que_foi_escrito(abrir_pagina):
    """A sugestão nunca é aplicada sozinha."""
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "vc vem?")
    pagina.click("#btn-traduzir")
    expect(pagina.locator("#alvo-libras")).to_have_text("vc vem?")


def test_botoes_do_cartao_nao_sao_traduzidos_pelo_avatar(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.type("#texto", "Oi")
    pagina.click("#btn-traduzir")
    expect(pagina.locator("#balao")).to_have_attribute("data-estado", "sinalizando")

    pagina.fill("#texto", "")
    pagina.type("#texto", "vc vem?")
    pagina.get_by_role("button", name="Usar sugestão").click()
    assert pagina.evaluate("window.__vlibras.traduzidos") == ["Oi"]


def test_texto_do_aluno_no_cartao_nao_vira_html(abrir_pagina):
    pagina, erros = abrir_pagina()
    pagina.type("#texto", '<img src=x onerror="window.__invadiu=1"> vc')
    expect(cartao(pagina)).to_be_visible()
    assert cartao(pagina).locator("img").count() == 0
    assert pagina.evaluate("window.__invadiu") is None
    assert erros == []
