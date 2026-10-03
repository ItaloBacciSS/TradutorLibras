"""
test_tradutor.py
================
Testes da página Português → Libras no navegador, com foco em exceções:
texto inválido, VLibras fora do ar, avatar que não abre, sem internet,
cliques repetidos, histórico estragado, microfone etc.

Usa um VLibras FALSO (veja conftest.py), então não precisa de internet.
"""

import json

import pytest
from playwright.sync_api import expect

from servidor import carregar_rotas


# ==========================================================
# Ajudantes
# ==========================================================
def balao(pagina):
    return pagina.locator("#balao")


def mensagem(pagina):
    return pagina.locator("#balao-mensagem")


def traduzidos(pagina):
    return pagina.evaluate("window.__vlibras ? window.__vlibras.traduzidos : []")


def aberturas(pagina):
    return pagina.evaluate("window.__vlibras ? window.__vlibras.aberturas : 0")


def esperar_traduzidos(pagina, esperado):
    """Espera a lista de frases enviadas ao avatar ficar igual à esperada."""
    pagina.wait_for_function(
        "esperado => JSON.stringify(window.__vlibras.traduzidos) === JSON.stringify(esperado)",
        arg=esperado,
        timeout=5000,
    )


def digitar_e_traduzir(pagina, texto):
    pagina.fill("#texto", texto)
    pagina.click("#btn-traduzir")


# ==========================================================
# Caminho feliz
# ==========================================================
def test_traduz_frase_normal(abrir_pagina):
    pagina, erros = abrir_pagina()
    digitar_e_traduzir(pagina, "Bom dia")

    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")
    expect(pagina.locator("#alvo-libras")).to_have_text("Bom dia")
    assert traduzidos(pagina) == ["Bom dia"]
    assert erros == []


def test_enter_traduz_e_shift_enter_pula_linha(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.fill("#texto", "Oi")
    pagina.press("#texto", "Shift+Enter")
    assert aberturas(pagina) == 0  # Shift+Enter não traduz

    pagina.press("#texto", "Enter")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")


def test_frase_pronta_traduz_com_um_clique(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.get_by_role("button", name="Bom dia!").click()

    expect(pagina.locator("#alvo-libras")).to_have_text("Bom dia!")
    expect(pagina.locator("#texto")).to_have_value("Bom dia!")


def test_botao_repetir_traduz_de_novo(abrir_pagina):
    pagina, _ = abrir_pagina()
    digitar_e_traduzir(pagina, "Obrigado")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")

    pagina.click("#btn-acao-balao")
    esperar_traduzidos(pagina, ["Obrigado", "Obrigado"])


def test_botoes_nao_sao_traduzidos_pelo_avatar(abrir_pagina):
    """Com o avatar aberto, clicar nos botões não pode mandar o rótulo do botão para tradução."""
    pagina, _ = abrir_pagina()
    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")

    pagina.click("#aba-escola")
    pagina.click("#btn-limpar")
    assert traduzidos(pagina) == ["Oi"]


# ==========================================================
# Texto inválido
# ==========================================================
@pytest.mark.parametrize(
    "texto, trecho_da_mensagem",
    [
        ("", "Escreva uma frase"),
        ("     ", "Escreva uma frase"),
        ("\n\n\n", "Escreva uma frase"),
        ("!!! ???", "Use palavras"),
        ("👋👋👋", "Use palavras"),
    ],
)
def test_texto_invalido_mostra_erro_e_nao_chama_avatar(abrir_pagina, texto, trecho_da_mensagem):
    pagina, erros = abrir_pagina()
    pagina.fill("#texto", texto)
    pagina.click("#btn-traduzir")

    expect(balao(pagina)).to_have_attribute("data-estado", "erro")
    expect(mensagem(pagina)).to_contain_text(trecho_da_mensagem)
    expect(pagina.locator("#campo")).to_have_class("campo campo--erro")
    assert aberturas(pagina) == 0
    assert erros == []


def test_espacos_extras_sao_limpos_antes_de_traduzir(abrir_pagina):
    pagina, _ = abrir_pagina()
    digitar_e_traduzir(pagina, "   Bom     dia   ")
    expect(pagina.locator("#alvo-libras")).to_have_text("Bom dia")


def test_campo_nao_aceita_mais_que_500_caracteres(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.fill("#texto", "a" * 600)
    assert len(pagina.input_value("#texto")) == 500
    expect(pagina.locator("#contador")).to_have_text("500/500")
    expect(pagina.locator("#contador")).to_have_class("campo__contador campo__contador--limite")


def test_html_digitado_aparece_como_texto(abrir_pagina):
    """Ninguém consegue injetar HTML/JS pelo campo."""
    pagina, erros = abrir_pagina()
    digitar_e_traduzir(pagina, '<img src=x onerror="window.__invadiu=1">')
    expect(pagina.locator("#alvo-libras")).to_have_text('<img src=x onerror="window.__invadiu=1">')
    assert pagina.locator("#alvo-libras img").count() == 0
    assert pagina.evaluate("window.__invadiu") is None
    assert erros == []


def test_digitar_depois_do_erro_tira_o_vermelho(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.click("#btn-traduzir")
    expect(pagina.locator("#campo")).to_have_class("campo campo--erro")

    pagina.type("#texto", "o")
    expect(pagina.locator("#campo")).to_have_class("campo")


# ==========================================================
# VLibras com problema
# ==========================================================
def test_vlibras_fora_do_ar(abrir_pagina):
    pagina, erros = abrir_pagina(vlibras="fora_do_ar")

    expect(balao(pagina)).to_have_attribute("data-estado", "erro")
    expect(mensagem(pagina)).to_contain_text("não carregou")
    expect(pagina.locator("#btn-acao-balao")).to_contain_text("Recarregar")

    # Tentar traduzir mesmo assim continua mostrando o erro, sem quebrar a página
    digitar_e_traduzir(pagina, "Oi")
    expect(mensagem(pagina)).to_contain_text("não carregou")
    assert erros == []


def test_avatar_que_quebra_ao_abrir(abrir_pagina):
    pagina, erros = abrir_pagina(vlibras="open_quebra")
    digitar_e_traduzir(pagina, "Oi")

    expect(mensagem(pagina)).to_contain_text("não carregou")
    expect(pagina.locator("#btn-acao-balao")).to_contain_text("Recarregar")
    assert erros == []


def test_avatar_que_nunca_termina_de_abrir(abrir_pagina):
    """Depois de 2 minutos esperando, mostra erro e oferece tentar de novo."""
    pagina, erros = abrir_pagina(vlibras="nunca_abre", relogio_falso=True)
    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "carregando")
    expect(pagina.locator("#btn-traduzir")).to_be_disabled()

    pagina.clock.run_for(121_000)

    expect(balao(pagina)).to_have_attribute("data-estado", "erro")
    expect(mensagem(pagina)).to_contain_text("demorou demais")
    expect(pagina.locator("#btn-acao-balao")).to_contain_text("Tentar de novo")
    expect(pagina.locator("#btn-traduzir")).to_be_enabled()
    assert erros == []


def test_avatar_fechado_pelo_aluno_e_reaberto(abrir_pagina):
    """Se o aluno fechar o avatar, a próxima tradução abre ele de novo."""
    pagina, _ = abrir_pagina()
    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")

    pagina.evaluate("document.getElementById('@text-capture.style').remove()")  # simula fechar
    digitar_e_traduzir(pagina, "Tchau")

    expect(pagina.locator("#alvo-libras")).to_have_text("Tchau")
    assert aberturas(pagina) == 2
    esperar_traduzidos(pagina, ["Oi", "Tchau"])


def test_cliques_repetidos_abrem_o_avatar_uma_vez_so(abrir_pagina):
    pagina, _ = abrir_pagina()
    pagina.fill("#texto", "Oi")
    pagina.evaluate("for (let i = 0; i < 5; i++) document.getElementById('btn-traduzir').click()")

    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")
    assert aberturas(pagina) == 1
    assert traduzidos(pagina) == ["Oi"]


# ==========================================================
# Sem internet
# ==========================================================
def test_internet_cai_e_volta(abrir_pagina):
    pagina, erros = abrir_pagina()

    pagina.context.set_offline(True)
    expect(mensagem(pagina)).to_contain_text("Sem internet")

    digitar_e_traduzir(pagina, "Oi")
    expect(mensagem(pagina)).to_contain_text("Sem internet")
    assert aberturas(pagina) == 0

    pagina.context.set_offline(False)
    expect(balao(pagina)).to_have_attribute("data-estado", "inicial")

    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")
    assert erros == []


# ==========================================================
# Histórico (localStorage)
# ==========================================================
def abrir_recentes(pagina):
    pagina.click("#aba-recentes")
    return pagina.locator("#painel-frases")


def test_historico_guarda_ultimas_frases_sem_repetir(abrir_pagina):
    pagina, _ = abrir_pagina()
    for frase in ["Um", "Dois", "Um"]:
        digitar_e_traduzir(pagina, frase)
        expect(pagina.locator("#alvo-libras")).to_have_text(frase)

    painel = abrir_recentes(pagina)
    expect(painel.locator(".chip")).to_have_text(["Um", "Dois"])


def test_historico_guarda_no_maximo_10(abrir_pagina):
    lista = json.dumps([f"Frase {i}" for i in range(30)])
    pagina, _ = abrir_pagina(antes_de_abrir=f"localStorage.setItem('tradutor-libras:historico', '{lista}')")
    expect(abrir_recentes(pagina).locator(".chip")).to_have_count(10)


@pytest.mark.parametrize(
    "valor_estragado",
    ["{{{ isso não é json", '{"a": 1}', '"texto"', "42", "null"],
)
def test_historico_estragado_nao_quebra_a_pagina(abrir_pagina, valor_estragado):
    pagina, erros = abrir_pagina(
        antes_de_abrir=f"localStorage.setItem('tradutor-libras:historico', {json.dumps(valor_estragado)})"
    )
    expect(abrir_recentes(pagina)).to_contain_text("aparecem aqui")
    assert erros == []


def test_historico_com_itens_invalidos_e_filtrado(abrir_pagina):
    lista = json.dumps(["Oi", 5, None, "", "   ", {"a": 1}, "Tchau"])
    pagina, _ = abrir_pagina(antes_de_abrir=f"localStorage.setItem('tradutor-libras:historico', '{lista}')")
    expect(abrir_recentes(pagina).locator(".chip")).to_have_text(["Oi", "Tchau"])


def test_navegador_sem_armazenamento_continua_funcionando(abrir_pagina):
    bloquear = """
      Storage.prototype.getItem = () => { throw new Error("bloqueado"); };
      Storage.prototype.setItem = () => { throw new Error("bloqueado"); };
    """
    pagina, erros = abrir_pagina(antes_de_abrir=bloquear)
    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")
    expect(abrir_recentes(pagina)).to_contain_text("aparecem aqui")
    assert erros == []


def test_apagar_recentes(abrir_pagina):
    pagina, _ = abrir_pagina()
    digitar_e_traduzir(pagina, "Oi")
    expect(balao(pagina)).to_have_attribute("data-estado", "sinalizando")

    painel = abrir_recentes(pagina)
    painel.get_by_role("button", name="Apagar recentes").click()
    expect(painel).to_contain_text("aparecem aqui")


# ==========================================================
# Microfone
# ==========================================================
MICROFONE_FALSO = """
window.SpeechRecognition = class {
  constructor() { this.ouvintes = {}; }
  addEventListener(tipo, funcao) { (this.ouvintes[tipo] ||= []).push(funcao); }
  emitir(tipo, evento = {}) { (this.ouvintes[tipo] || []).forEach((f) => f(evento)); }
  start() { window.__microfone = this; this.emitir("start"); }
  stop() { this.emitir("end"); }
};
"""


def test_sem_suporte_a_voz_esconde_o_microfone(abrir_pagina):
    sem_voz = "delete window.SpeechRecognition; delete window.webkitSpeechRecognition;"
    pagina, erros = abrir_pagina(antes_de_abrir=sem_voz)
    expect(pagina.locator("#btn-falar")).to_be_hidden()
    assert erros == []


def test_voz_preenche_o_campo(abrir_pagina):
    pagina, _ = abrir_pagina(antes_de_abrir=MICROFONE_FALSO)
    pagina.click("#btn-falar")
    expect(pagina.locator("#btn-falar")).to_have_class("botao-icone vlibras-links botao-icone--gravando")

    pagina.evaluate("window.__microfone.emitir('result', { results: [[{ transcript: 'bom dia' }]] })")
    pagina.evaluate("window.__microfone.emitir('end')")

    expect(pagina.locator("#texto")).to_have_value("bom dia")
    expect(pagina.locator("#btn-falar")).to_have_class("botao-icone vlibras-links")


@pytest.mark.parametrize(
    "codigo, trecho",
    [
        ("not-allowed", "microfone foi bloqueado"),
        ("audio-capture", "Nenhum microfone"),
        ("no-speech", "Não ouvi nada"),
        ("network", "Sem internet"),
        ("erro-desconhecido", "Não foi possível usar o microfone"),
    ],
)
def test_erros_do_microfone(abrir_pagina, codigo, trecho):
    pagina, erros = abrir_pagina(antes_de_abrir=MICROFONE_FALSO)
    pagina.click("#btn-falar")
    pagina.evaluate(f"window.__microfone.emitir('error', {{ error: '{codigo}' }})")

    expect(balao(pagina)).to_have_attribute("data-estado", "erro")
    expect(mensagem(pagina)).to_contain_text(trecho)
    assert erros == []


def test_parar_o_microfone_nao_mostra_erro(abrir_pagina):
    pagina, _ = abrir_pagina(antes_de_abrir=MICROFONE_FALSO)
    pagina.click("#btn-falar")
    pagina.evaluate("window.__microfone.emitir('error', { error: 'aborted' })")
    expect(balao(pagina)).to_have_attribute("data-estado", "inicial")


# ==========================================================
# Todas as páginas
# ==========================================================
@pytest.mark.parametrize("caminho", sorted(carregar_rotas()))
def test_paginas_abrem_sem_erros_de_javascript(abrir_pagina, caminho):
    pagina, erros = abrir_pagina(caminho)
    expect(pagina.locator("h1")).to_be_visible()
    assert erros == []


@pytest.mark.parametrize("caminho", sorted(carregar_rotas()))
def test_celular_nao_tem_rolagem_para_o_lado(navegador, servidor_local, caminho):
    contexto = navegador.new_context(viewport={"width": 360, "height": 740})
    pagina = contexto.new_page()
    pagina.route("**/vlibras-plugin.js", lambda rota: rota.fulfill(body="", content_type="application/javascript"))
    pagina.goto(servidor_local + caminho)
    largura = pagina.evaluate("document.documentElement.scrollWidth")
    contexto.close()
    assert largura <= 360
