"""
test_aprender.py
================
Testes da área "Aprender Libras":
- as lições (js/dados/licoes.js) estão bem escritas;
- a criação e correção dos exercícios (js/modulos/exercicios.js);
- o progresso salvo (js/modulos/progresso.js);
- a página: trilha, lição completa, erros, resultado e falhas do avatar.

Usa o VLibras FALSO do conftest.py. Ele anota em window.__vlibras.traduzidos
tudo o que o avatar "sinalizou"; os testes usam isso para saber a resposta.
"""

import json
import re

import pytest
from playwright.sync_api import expect

IMPORTAR = """
async () => {
  window.dados = await import("/js/dados/licoes.js");
  window.ex = await import("/js/modulos/exercicios.js");
  window.prog = await import("/js/modulos/progresso.js");
}
"""

CHAVE = "tradutor-libras:aprender"


@pytest.fixture(scope="module")
def js(navegador, servidor_local):
    contexto = navegador.new_context()
    pagina = contexto.new_page()
    pagina.goto(servidor_local + "/css/base.css")
    pagina.evaluate(IMPORTAR)
    yield pagina
    contexto.close()


# ==========================================================
# Lições (dados)
# ==========================================================
def test_licoes_sem_problemas(js):
    problemas = js.evaluate("ex.conferirLicoes(dados.LICOES)")
    assert problemas == [], "\n".join(problemas)


def test_tem_pelo_menos_10_licoes(js):
    assert js.evaluate("dados.LICOES.length") >= 10


def test_conferir_licoes_acha_erros(js):
    problemas = "\n".join(
        js.evaluate(
            """() => ex.conferirLicoes([
              { id: "Com Espaço", titulo: "A", palavras: ["a", "b", "c", "d"], frases: ["um dois"], validado: false },
              { id: "x", titulo: "", palavras: ["a", "b"], frases: ["um dois"], validado: false },
              { id: "x", titulo: "C", palavras: ["a", "a", "c", "d"], frases: ["sozinha"], validado: "sim" },
              { id: "y", titulo: "D", palavras: ["a", "b", "c", "d"], frases: ["Oi, tudo bem?"], validado: false },
            ])"""
        )
    )
    assert "minúsculo, sem espaço" in problemas
    assert "falta \"titulo\"" in problemas
    assert "de 4 a 8 itens" in problemas
    assert "id repetido" in problemas
    assert "palavra repetida" in problemas
    assert "de 2 a 6 palavras" in problemas
    assert "não deve ter pontuação" in problemas
    assert '"validado" precisa ser true ou false' in problemas


# ==========================================================
# Exercícios
# ==========================================================
def gerar(js, indice=0, semente=1):
    """Gera os exercícios com um "aleatório" previsível."""
    return js.evaluate(
        """([indice, semente]) => {
          let s = semente;
          const aleatorio = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
          return ex.gerarExercicios(dados.LICOES[indice], dados.LICOES, aleatorio);
        }""",
        [indice, semente],
    )


def test_cada_palavra_tem_ver_e_que_sinal(js):
    lista = gerar(js)
    palavras = js.evaluate("dados.LICOES[0].palavras")
    assert sorted(e["palavra"] for e in lista if e["tipo"] == "ver") == sorted(palavras)
    assert sorted(e["resposta"] for e in lista if e["tipo"] == "que-sinal") == sorted(palavras)


def test_ver_vem_antes_de_praticar_a_mesma_palavra(js):
    lista = gerar(js)
    for i, exercicio in enumerate(lista):
        if exercicio["tipo"] == "que-sinal":
            vistas = {e["palavra"] for e in lista[:i] if e["tipo"] == "ver"}
            assert exercicio["resposta"] in vistas


def test_quantidades_por_tipo(js):
    tipos = [e["tipo"] for e in gerar(js)]
    assert tipos.count("qual-sinal") == 2
    assert tipos.count("monte-frase") == 2


@pytest.mark.parametrize("indice", range(10))
def test_opcoes_validas_em_todas_as_licoes(js, indice):
    for exercicio in gerar(js, indice, semente=indice + 7):
        if exercicio["tipo"] in ("que-sinal", "qual-sinal"):
            opcoes = exercicio["opcoes"]
            assert exercicio["resposta"] in opcoes
            assert len(opcoes) == len({o.lower() for o in opcoes}), "opção repetida"
            assert len(opcoes) == (4 if exercicio["tipo"] == "que-sinal" else 3)
        if exercicio["tipo"] == "monte-frase":
            pecas = exercicio["pecas"]
            for palavra in exercicio["resposta"].split():
                assert palavra in pecas
            assert len(pecas) == len(exercicio["resposta"].split()) + 2


@pytest.mark.parametrize(
    "resposta, certo",
    [
        (["Bom", "dia", "professor"], True),
        (["bom", "DIA", "professor"], True),  # maiúscula não importa
        (["dia", "Bom", "professor"], False),  # ordem importa
        (["Bom", "dia"], False),  # incompleta
        (["Bom", "dia", "professor", "eu"], False),  # sobrando
        ([], False),
    ],
)
def test_conferir_monte_a_frase(js, resposta, certo):
    exercicio = {"tipo": "monte-frase", "resposta": "Bom dia professor"}
    assert js.evaluate("([e, r]) => ex.conferirResposta(e, r)", [exercicio, resposta]) is certo


@pytest.mark.parametrize("resposta, certo", [("Obrigado", True), ("obrigado", True), ("Tchau", False), (None, False)])
def test_conferir_escolha(js, resposta, certo):
    exercicio = {"tipo": "que-sinal", "resposta": "Obrigado"}
    assert js.evaluate("([e, r]) => ex.conferirResposta(e, r)", [exercicio, resposta]) is certo


# ==========================================================
# Progresso
# ==========================================================
@pytest.mark.parametrize("acertos, total, estrelas", [(10, 10, 3), (9, 10, 3), (8, 10, 2), (7, 10, 2), (6, 10, 1), (0, 10, 1), (0, 0, 3)])
def test_estrelas(js, acertos, total, estrelas):
    assert js.evaluate("([a, t]) => prog.calcularEstrelas(a, t)", [acertos, total]) == estrelas


def test_sequencia_de_dias(js):
    resultado = js.evaluate(
        """() => {
          localStorage.removeItem("tradutor-libras:aprender");
          const dia = (d) => new Date(2026, 9, d, 15, 0);
          const r = [];
          r.push(prog.registrarLicao("a", 10, 10, dia(1)).sequencia);  // 1º dia
          r.push(prog.registrarLicao("a", 10, 10, dia(1)).sequencia);  // mesmo dia: não soma
          r.push(prog.registrarLicao("a", 10, 10, dia(2)).sequencia);  // dia seguinte: +1
          r.push(prog.registrarLicao("a", 10, 10, dia(5)).sequencia);  // pulou dias: volta a 1
          r.push(prog.sequenciaAtual(prog.lerProgresso(), dia(6)));    // ontem estudou: continua
          r.push(prog.sequenciaAtual(prog.lerProgresso(), dia(8)));    // passou um dia sem: zera
          return r;
        }"""
    )
    assert resultado == [1, 1, 2, 1, 1, 0]


def test_guarda_a_melhor_nota(js):
    estrelas = js.evaluate(
        """() => {
          localStorage.removeItem("tradutor-libras:aprender");
          prog.registrarLicao("a", 10, 10);
          prog.registrarLicao("a", 1, 10);
          return prog.lerProgresso().licoes.a;
        }"""
    )
    assert estrelas == {"concluida": True, "estrelas": 3, "vezes": 2}


def test_desbloqueio_em_ordem(js):
    resultado = js.evaluate(
        """() => {
          localStorage.removeItem("tradutor-libras:aprender");
          const L = dados.LICOES;
          const antes = L.map((_, i) => prog.licaoLiberada(i, L, prog.lerProgresso()));
          prog.registrarLicao(L[0].id, 5, 10);
          const depois = L.map((_, i) => prog.licaoLiberada(i, L, prog.lerProgresso()));
          return [antes.filter(Boolean).length, depois.filter(Boolean).length];
        }"""
    )
    assert resultado == [1, 2]


@pytest.mark.parametrize(
    "estragado",
    [
        "{{{",
        "42",
        '"texto"',
        '{"xp": -50, "licoes": "x", "sequencia": {"dias": "dois"}}',
        '{"xp": 30, "licoes": {"a": {"concluida": true, "estrelas": 99}}}',
    ],
)
def test_progresso_estragado_vira_valido(js, estragado):
    progresso = js.evaluate(
        "(v) => { localStorage.setItem('tradutor-libras:aprender', v); return prog.lerProgresso(); }",
        estragado,
    )
    assert progresso["xp"] >= 0
    assert isinstance(progresso["licoes"], dict)
    for licao in progresso["licoes"].values():
        assert 0 <= licao["estrelas"] <= 3
    assert progresso["sequencia"]["dias"] >= 0


# ==========================================================
# A página
# ==========================================================
def abrir_aprender(abrir_pagina, progresso=None, **extras):
    antes = f"localStorage.setItem('{CHAVE}', {json.dumps(json.dumps(progresso))});" if progresso else None
    return abrir_pagina("/aprender", antes_de_abrir=antes, **extras)


def ultimo_sinal(pagina):
    pagina.wait_for_function("window.__vlibras.traduzidos.length > 0")
    return pagina.evaluate("window.__vlibras.traduzidos.at(-1)")


def responder(pagina, acertar=True):
    """Responde o exercício atual (certo ou errado) e aperta Continuar."""
    tipo = pagina.get_attribute(".licao__conteudo", "data-tipo")
    principal = pagina.locator(".licao__principal")

    if tipo == "ver":
        principal.click()
        return tipo

    if tipo == "que-sinal":
        pagina.wait_for_timeout(50)
        certa = ultimo_sinal(pagina)
        opcoes = pagina.locator("[data-opcao]")
        alvo = certa if acertar else next(o for o in opcoes.evaluate_all("l => l.map(b => b.dataset.opcao)") if o != certa)
        pagina.click(f'[data-opcao="{alvo}"]')
    elif tipo == "qual-sinal":
        certa = pagina.inner_text(".licao__destaque").strip("“”")
        opcoes = pagina.locator("[data-opcao]").evaluate_all("l => l.map(b => b.dataset.opcao)")
        alvo = certa if acertar else next(o for o in opcoes if o != certa)
        pagina.click(f'[data-opcao="{alvo}"]')
    elif tipo == "monte-frase":
        pagina.wait_for_timeout(50)
        frase = ultimo_sinal(pagina)
        palavras = frase.split() if acertar else frase.split()[::-1]
        for palavra in palavras:
            pagina.locator(".banco-pecas .peca").filter(has_text=re.compile(f"^{re.escape(palavra)}$")).first.click()

    principal.click()  # Verificar
    expect(pagina.locator(".licao__rodape")).to_have_attribute("data-estado", "certo" if acertar else "errado")
    principal.click()  # Continuar
    return tipo


def fazer_licao(pagina, errar_tipos=()):
    """Faz a lição inteira. Erra (uma vez) os tipos pedidos."""
    expect(pagina.locator("#tela-licao")).to_be_visible()  # espera o avatar abrir
    erros_feitos = set()
    vistos = []
    for _ in range(60):
        if pagina.evaluate("document.body.dataset.tela") != "licao":
            break
        tipo = pagina.get_attribute(".licao__conteudo", "data-tipo")
        errar = tipo in errar_tipos and tipo not in erros_feitos
        if errar:
            erros_feitos.add(tipo)
        vistos.append(responder(pagina, acertar=not errar))
    return vistos


def test_trilha_inicial(abrir_pagina):
    pagina, erros = abrir_aprender(abrir_pagina)
    nos = pagina.locator(".no-licao")
    expect(nos).to_have_count(10)
    expect(nos.nth(0)).to_be_enabled()
    expect(nos.nth(0)).to_have_attribute("data-atual", "true")
    expect(nos.nth(1)).to_be_disabled()
    expect(pagina.locator("#placar-licoes")).to_have_text("0/10")
    assert erros == []


def test_licao_completa_sem_erros(abrir_pagina):
    pagina, erros = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    tipos = fazer_licao(pagina)

    assert {"ver", "que-sinal", "qual-sinal", "monte-frase"} <= set(tipos)
    expect(pagina.locator("#tela-resultado")).to_be_visible()
    expect(pagina.locator("#resultado-titulo")).to_have_text("Perfeito!")
    expect(pagina.locator("#resultado-acertos")).to_have_text("100%")
    expect(pagina.locator("#resultado-xp")).to_have_text("+25")
    expect(pagina.locator("#placar-xp")).to_have_text("25")

    pagina.click("#btn-resultado-trilha")
    nos = pagina.locator(".no-licao")
    expect(nos.nth(0)).to_have_attribute("data-estado", "concluida")
    expect(nos.nth(1)).to_be_enabled()
    expect(pagina.locator("#placar-licoes")).to_have_text("1/10")
    assert erros == []


def test_resposta_errada_mostra_a_certa_e_repete_depois(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()

    # Avança até o primeiro "Que sinal é esse?"
    while pagina.get_attribute(".licao__conteudo", "data-tipo") == "ver":
        pagina.click(".licao__principal")

    certa = ultimo_sinal(pagina)
    errada = next(o for o in pagina.locator("[data-opcao]").evaluate_all("l => l.map(b => b.dataset.opcao)") if o != certa)
    pagina.click(f'[data-opcao="{errada}"]')
    pagina.click(".licao__principal")

    expect(pagina.locator(".licao__rodape")).to_have_attribute("data-estado", "errado")
    expect(pagina.locator(".licao__retorno")).to_contain_text(f"Resposta certa: “{certa}”")
    expect(pagina.locator(f'[data-opcao="{certa}"]')).to_have_attribute("data-resultado", "certo")
    expect(pagina.locator(f'[data-opcao="{errada}"]')).to_have_attribute("data-resultado", "errado")

    pagina.click(".licao__principal")
    fazer_licao(pagina)
    # 1 erro em 10 exercícios com nota → 90% → ainda 3 estrelas
    expect(pagina.locator("#resultado-acertos")).to_have_text("90%")


def test_varios_erros_dao_menos_estrelas(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    fazer_licao(pagina, errar_tipos=("que-sinal", "qual-sinal", "monte-frase"))
    expect(pagina.locator("#resultado-acertos")).to_have_text("70%")
    expect(pagina.locator("#resultado-estrelas")).to_have_attribute("aria-label", "2 de 3 estrelas")


def test_verificar_desligado_sem_resposta(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    while pagina.get_attribute(".licao__conteudo", "data-tipo") == "ver":
        pagina.click(".licao__principal")
    expect(pagina.locator(".licao__principal")).to_be_disabled()


def test_atalhos_de_teclado(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    while pagina.get_attribute(".licao__conteudo", "data-tipo") == "ver":
        pagina.click(".licao__principal")

    pagina.locator(".licao__conteudo").press("2")
    expect(pagina.locator("[data-opcao]").nth(1)).to_have_attribute("aria-pressed", "true")


def test_sair_da_licao_volta_para_trilha_sem_salvar(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    pagina.get_by_role("button", name="Sair da lição").click()
    expect(pagina.locator("#tela-trilha")).to_be_visible()
    expect(pagina.locator("#placar-xp")).to_have_text("0")


def test_licao_bloqueada_nao_abre(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").nth(3).click(force=True)
    expect(pagina.locator("#tela-trilha")).to_be_visible()


def test_progresso_salvo_aparece_na_trilha(abrir_pagina):
    salvo = {"xp": 120, "licoes": {"cumprimentos": {"concluida": True, "estrelas": 2, "vezes": 1}}, "sequencia": {"dias": 0, "ultimoDia": None}}
    pagina, _ = abrir_aprender(abrir_pagina, progresso=salvo)
    expect(pagina.locator("#placar-xp")).to_have_text("120")
    expect(pagina.locator(".no-licao").nth(0).locator(".estrela--cheia")).to_have_count(2)
    expect(pagina.locator(".no-licao").nth(1)).to_have_attribute("data-atual", "true")


def test_recomecar_do_zero_pede_confirmacao(abrir_pagina):
    salvo = {"xp": 50, "licoes": {"cumprimentos": {"concluida": True, "estrelas": 3, "vezes": 1}}}
    pagina, _ = abrir_aprender(abrir_pagina, progresso=salvo)

    pagina.click("#btn-apagar-progresso")
    expect(pagina.locator("#placar-xp")).to_have_text("50")  # 1º clique só pede confirmação
    pagina.click("#btn-apagar-progresso")
    expect(pagina.locator("#placar-xp")).to_have_text("0")


def test_progresso_estragado_nao_quebra_a_pagina(abrir_pagina):
    pagina, erros = abrir_pagina("/aprender", antes_de_abrir=f"localStorage.setItem('{CHAVE}', '{{{{ estragado')")
    expect(pagina.locator(".no-licao")).to_have_count(10)
    assert erros == []


def test_navegador_sem_armazenamento(abrir_pagina):
    bloquear = """
      Storage.prototype.getItem = () => { throw new Error("bloqueado"); };
      Storage.prototype.setItem = () => { throw new Error("bloqueado"); };
    """
    pagina, erros = abrir_pagina("/aprender", antes_de_abrir=bloquear)
    pagina.locator(".no-licao").first.click()
    fazer_licao(pagina)
    expect(pagina.locator("#tela-resultado")).to_be_visible()
    assert erros == []


# ---------- Avatar com problema ----------
def test_vlibras_fora_do_ar(abrir_pagina):
    pagina, erros = abrir_pagina("/aprender", vlibras="fora_do_ar")
    expect(pagina.locator("#aviso-trilha")).to_contain_text("não carregou")

    pagina.locator(".no-licao").first.click()
    expect(pagina.locator("#carregando-texto")).to_contain_text("não carregou")
    expect(pagina.locator("#btn-tentar-abrir")).to_be_visible()

    pagina.click("#btn-voltar-trilha")
    expect(pagina.locator("#tela-trilha")).to_be_visible()
    assert erros == []


def test_avatar_que_nunca_abre(abrir_pagina):
    pagina, _ = abrir_pagina("/aprender", vlibras="nunca_abre", relogio_falso=True)
    pagina.locator(".no-licao").first.click()
    expect(pagina.locator("#tela-carregando")).to_be_visible()

    pagina.clock.run_for(121_000)
    expect(pagina.locator("#carregando-texto")).to_contain_text("demorou demais")
    expect(pagina.locator("#btn-tentar-abrir")).to_be_visible()


def test_sem_internet_ao_comecar(abrir_pagina):
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.context.set_offline(True)
    pagina.locator(".no-licao").first.click()
    expect(pagina.locator("#carregando-texto")).to_contain_text("Sem internet")

    pagina.context.set_offline(False)
    pagina.click("#btn-tentar-abrir")
    expect(pagina.locator("#tela-licao")).to_be_visible()


def test_avatar_fechado_no_meio_da_licao(abrir_pagina):
    """Se o aluno fechar o avatar, o próximo sinal abre ele de novo."""
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    expect(pagina.locator("#tela-licao")).to_be_visible()

    pagina.evaluate("document.getElementById('@text-capture.style').remove()")
    pagina.click(".licao__principal")  # próximo "ver" pede um sinal
    pagina.wait_for_function("window.__vlibras.aberturas === 2")


def test_resposta_nao_aparece_na_tela(abrir_pagina):
    """No "Que sinal é esse?", a palavra sinalizada não pode estar visível nem para leitor de tela."""
    pagina, _ = abrir_aprender(abrir_pagina)
    pagina.locator(".no-licao").first.click()
    while pagina.get_attribute(".licao__conteudo", "data-tipo") == "ver":
        pagina.click(".licao__principal")

    alvo = pagina.locator("#alvo-libras")
    expect(alvo).to_have_attribute("aria-hidden", "true")
    caixa = alvo.bounding_box()
    assert caixa["width"] <= 1 and caixa["height"] <= 1


# ---------- Menu e página inicial ----------
@pytest.mark.parametrize("caminho", ["/", "/portugues-libras", "/libras-portugues", "/aprender"])
def test_menu_tem_aprender(abrir_pagina, caminho):
    pagina, _ = abrir_pagina(caminho)
    expect(pagina.locator('.menu a[href="/aprender"]')).to_have_text("Aprender")


def test_pagina_inicial_tem_cartao_aprender(abrir_pagina):
    pagina, _ = abrir_pagina("/")
    cartao = pagina.locator(".caminho--aprender")
    expect(cartao).to_contain_text("Aprender Libras")
    cartao.click()
    expect(pagina).to_have_url(re.compile(r"/aprender$"))


@pytest.mark.parametrize("caminho", ["/", "/portugues-libras", "/libras-portugues", "/aprender"])
def test_menu_cabe_no_celular(navegador, servidor_local, caminho):
    contexto = navegador.new_context(viewport={"width": 360, "height": 740})
    pagina = contexto.new_page()
    pagina.route("**/vlibras-plugin.js", lambda rota: rota.fulfill(body="", content_type="application/javascript"))
    pagina.goto(servidor_local + caminho)
    fora = pagina.evaluate(
        """[...document.querySelectorAll('.menu a')]
             .filter((a) => a.offsetParent !== null)
             .filter((a) => { const r = a.getBoundingClientRect(); return r.left < 0 || r.right > 360; })
             .map((a) => a.textContent)"""
    )
    contexto.close()
    assert fora == []


# ---------- Legenda do avatar ----------
LER_LEGENDA = "JSON.parse(localStorage.getItem('@vlibras/player')).state.showSubtitles"


def test_aprender_desliga_a_legenda(abrir_pagina):
    pagina, _ = abrir_pagina("/aprender")
    assert pagina.evaluate(LER_LEGENDA) is False


def test_tradutor_liga_a_legenda(abrir_pagina):
    pagina, _ = abrir_pagina("/portugues-libras")
    assert pagina.evaluate(LER_LEGENDA) is True


def test_legenda_mantem_outras_preferencias_do_avatar(abrir_pagina):
    preferencias = '{"state":{"speed":1.5,"avatar":"hosana","showSubtitles":true},"version":1}'
    pagina, _ = abrir_pagina("/aprender", antes_de_abrir=f"localStorage.setItem('@vlibras/player', '{preferencias}')")
    salvo = pagina.evaluate("JSON.parse(localStorage.getItem('@vlibras/player'))")
    assert salvo == {"state": {"speed": 1.5, "avatar": "hosana", "showSubtitles": False}, "version": 1}


@pytest.mark.parametrize("estragado", ["{{{", "42", "null", '{"state": "x"}'])
def test_preferencias_do_avatar_estragadas(abrir_pagina, estragado):
    pagina, erros = abrir_pagina("/aprender", antes_de_abrir=f"localStorage.setItem('@vlibras/player', {json.dumps(estragado)})")
    assert pagina.evaluate(LER_LEGENDA) is False
    assert erros == []
