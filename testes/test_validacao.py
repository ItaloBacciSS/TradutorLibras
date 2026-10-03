"""
test_validacao.py
=================
Testes da função prepararTexto (js/modulos/validacao.js),
rodando o JavaScript de verdade dentro do navegador.
"""

import pytest

CHAMAR_VALIDACAO = """
async (texto) => {
  const modulo = await import("/js/modulos/validacao.js");
  return modulo.prepararTexto(texto);
}
"""


@pytest.fixture(scope="module")
def validar(navegador, servidor_local):
    contexto = navegador.new_context()
    pagina = contexto.new_page()
    pagina.goto(servidor_local + "/css/base.css")  # qualquer página do site serve
    yield lambda texto: pagina.evaluate(CHAMAR_VALIDACAO, texto)
    contexto.close()


@pytest.mark.parametrize(
    "entrada, esperado",
    [
        ("Bom dia", "Bom dia"),
        ("  Bom   dia  ", "Bom dia"),  # espaços repetidos
        ("Bom\n\n dia\t!", "Bom dia !"),  # quebras de linha e tab
        ("Ação é ótima", "Ação é ótima"),  # acentos
        ("Sala 12", "Sala 12"),  # números
        ("1", "1"),  # só um número também vale
        ("Oi 👋", "Oi 👋"),  # emoji junto com palavra
        ("<b>oi</b>", "<b>oi</b>"),  # HTML é tratado como texto comum
    ],
)
def test_textos_validos(validar, entrada, esperado):
    resultado = validar(entrada)
    assert resultado == {"ok": True, "texto": esperado}


@pytest.mark.parametrize("entrada", ["", "   ", "\n\n\t", None, 123, ["oi"]])
def test_texto_vazio_ou_de_tipo_errado(validar, entrada):
    resultado = validar(entrada)
    assert resultado["ok"] is False
    assert resultado["codigo"] == "vazio"


@pytest.mark.parametrize("entrada", ["!!!", "???  ...", "👋👋", "😀 🎉", "#@$%"])
def test_texto_sem_palavras(validar, entrada):
    resultado = validar(entrada)
    assert resultado["ok"] is False
    assert resultado["codigo"] == "semPalavras"


def test_limite_exato_e_aceito(validar):
    assert validar("a" * 500)["ok"] is True


def test_texto_longo_demais(validar):
    resultado = validar("a" * 501)
    assert resultado["ok"] is False
    assert resultado["codigo"] == "longo"


def test_espacos_nao_contam_para_o_limite(validar):
    """600 caracteres, mas quase tudo espaço: depois de limpar fica curto."""
    assert validar("oi" + " " * 598)["ok"] is True
