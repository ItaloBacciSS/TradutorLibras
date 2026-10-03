"""
conftest.py
===========
Peças compartilhadas pelos testes (o pytest carrega este arquivo sozinho).

- servidor: liga o servidor.py numa porta livre durante os testes.
- navegador: abre um Chromium invisível (Playwright).
- abrir_pagina: abre uma página do site com um VLibras FALSO,
  para testar sem internet e simular falhas.
"""

import sys
import threading
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

PASTA_DO_PROJETO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PASTA_DO_PROJETO))

import servidor  # noqa: E402  (precisa vir depois do sys.path)


# ==========================================================
# VLibras falso
# ----------------------------------------------------------
# Imita o comportamento do widget real:
#  - VLibrasWidget.open() "carrega" o avatar e cria o <style> de pronto;
#  - com o avatar aberto, cliques em textos são "traduzidos";
#  - com o avatar aberto, cliques em BOTÕES e LINKS sem a classe vlibras-links
#    são "roubados" pelo avatar (o botão não funciona), igual ao widget real;
#  - elementos com a classe vlibras-links são ignorados (funcionam normal).
#    Como no widget real, a classe precisa estar no próprio elemento clicado.
# Tudo fica registrado em window.__vlibras para os testes conferirem.
# ==========================================================
VLIBRAS_FALSO = """
window.__vlibras = { aberturas: 0, traduzidos: [] };
window.VLibras = {
  Widget: function () {
    window.VLibrasWidget = {
      open: function () {
        window.__vlibras.aberturas += 1;
        if (window.__vlibras.modo === "nunca_abre") return;
        if (window.__vlibras.modo === "open_quebra") throw new Error("quebrou");
        setTimeout(function () {
          var estilo = document.createElement("style");
          estilo.id = "@text-capture.style";
          document.head.appendChild(estilo);
        }, 300);
      }
    };
  }
};
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (evento) {
    if (!document.getElementById("@text-capture.style")) return;
    var alvo = evento.target;
    if (alvo.matches(".vlibras-links")) return;
    var botaoOuLink = alvo.closest("button, a");
    if (botaoOuLink) {
      // O widget real "rouba" o clique e mostra um balão perguntando se quer traduzir
      evento.preventDefault();
      evento.stopPropagation();
      window.__vlibras.cliquesRoubados = (window.__vlibras.cliquesRoubados || 0) + 1;
      return;
    }
    var texto = alvo.textContent.trim();
    if (texto) window.__vlibras.traduzidos.push(texto);
  }, true);
});
"""


@pytest.fixture(scope="session")
def servidor_local():
    """Liga o servidor do projeto numa porta livre (porta 0 = o sistema escolhe)."""
    rotas = servidor.carregar_rotas()
    http = servidor.criar_servidor(0, rotas)
    porta = http.server_address[1]
    thread = threading.Thread(target=http.serve_forever, daemon=True)
    thread.start()
    yield f"http://localhost:{porta}"
    http.shutdown()
    http.server_close()


@pytest.fixture(scope="session")
def navegador():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        yield browser
        browser.close()


@pytest.fixture
def abrir_pagina(navegador, servidor_local):
    """
    Abre uma página do site e devolve (pagina, erros_js).

    Parâmetros:
      caminho          ex.: "/portugues-libras"
      vlibras          "ok" (padrão), "fora_do_ar", "nunca_abre" ou "open_quebra"
      antes_de_abrir   código JS rodado antes da página carregar
      relogio_falso    True para controlar o tempo (testes de "demorou demais")
    """
    contextos = []

    def _abrir(caminho="/portugues-libras", vlibras="ok", antes_de_abrir=None, relogio_falso=False):
        contexto = navegador.new_context(viewport={"width": 1280, "height": 900})
        contextos.append(contexto)
        pagina = contexto.new_page()

        erros_js = []
        pagina.on("pageerror", lambda erro: erros_js.append(str(erro)))

        # Fontes externas não são necessárias nos testes
        pagina.route("**/fonts.googleapis.com/**", lambda rota: rota.abort())
        pagina.route("**/fonts.gstatic.com/**", lambda rota: rota.abort())

        if vlibras == "fora_do_ar":
            pagina.route("**/vlibras-plugin.js", lambda rota: rota.fulfill(status=503, body=""))
        else:
            pagina.route(
                "**/vlibras-plugin.js",
                lambda rota: rota.fulfill(body=VLIBRAS_FALSO, content_type="application/javascript"),
            )
            if vlibras != "ok":
                pagina.add_init_script(
                    f"Object.defineProperty(window, '__modoVlibras', {{value: '{vlibras}'}});"
                )

        if antes_de_abrir:
            pagina.add_init_script(antes_de_abrir)

        if relogio_falso:
            pagina.clock.install()

        pagina.goto(servidor_local + caminho)
        pagina.wait_for_load_state("networkidle")

        if vlibras not in ("ok", "fora_do_ar"):
            pagina.evaluate("window.__vlibras.modo = window.__modoVlibras")

        return pagina, erros_js

    yield _abrir

    for contexto in contextos:
        contexto.close()
