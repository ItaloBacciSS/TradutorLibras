"""
test_servidor.py
================
Testes do servidor.py: porta, rotas, vercel.json com problema e respostas HTTP.
"""

import json
import socket
import urllib.error
import urllib.request

import pytest

import servidor


# ==========================================================
# Porta
# ==========================================================
def test_porta_padrao_quando_nao_informada():
    assert servidor.ler_porta([]) == 8000


def test_porta_informada():
    assert servidor.ler_porta(["5000"]) == 5000


@pytest.mark.parametrize("valor", ["abc", "-1", "80.5", "", " "])
def test_porta_que_nao_e_numero(valor):
    with pytest.raises(servidor.ErroDePorta, match="não é uma porta válida"):
        servidor.ler_porta([valor])


@pytest.mark.parametrize("valor", ["0", "65536", "99999"])
def test_porta_fora_do_intervalo(valor):
    with pytest.raises(servidor.ErroDePorta, match="entre 1 e 65535"):
        servidor.ler_porta([valor])


def test_porta_ja_em_uso():
    ocupante = socket.socket()
    ocupante.bind(("localhost", 0))
    ocupante.listen()
    porta_ocupada = ocupante.getsockname()[1]
    try:
        with pytest.raises(servidor.ErroDePorta, match="já está sendo usada"):
            servidor.criar_servidor(porta_ocupada, {"/": "/html/index.html"})
    finally:
        ocupante.close()


def test_main_devolve_1_com_porta_invalida(capsys):
    assert servidor.main(["banana"]) == 1
    assert "não é uma porta válida" in capsys.readouterr().err


# ==========================================================
# Rotas (resolver_caminho)
# ==========================================================
ROTAS = {"/": "/html/index.html", "/portugues-libras": "/html/portugues-libras.html"}


@pytest.mark.parametrize(
    "pedido, esperado",
    [
        ("/", "/html/index.html"),
        ("/portugues-libras", "/html/portugues-libras.html"),
        ("/portugues-libras/", "/html/portugues-libras.html"),  # barra no final
        ("/portugues-libras?a=1", "/html/portugues-libras.html?a=1"),  # com parâmetros
        ("/css/base.css", "/css/base.css"),  # arquivo normal: não muda
        ("/nao-existe", "/nao-existe"),  # rota desconhecida: não muda (vira 404)
    ],
)
def test_resolver_caminho(pedido, esperado):
    assert servidor.resolver_caminho(pedido, ROTAS) == esperado


# ==========================================================
# vercel.json com problema
# ==========================================================
def test_vercel_json_do_projeto_e_valido():
    rotas = servidor.carregar_rotas()
    assert rotas["/"] == "/html/index.html"
    assert set(rotas) == {"/", "/portugues-libras", "/libras-portugues"}


def test_vercel_json_faltando(tmp_path):
    with pytest.raises(servidor.ErroDeConfiguracao, match="Não achei"):
        servidor.carregar_rotas(tmp_path / "vercel.json", pasta=None)


def test_vercel_json_com_erro_de_digitacao(tmp_path):
    arquivo = tmp_path / "vercel.json"
    arquivo.write_text('{ "rewrites": [ { "source": "/" ', encoding="utf-8")
    with pytest.raises(servidor.ErroDeConfiguracao, match="erro de digitação"):
        servidor.carregar_rotas(arquivo, pasta=None)


@pytest.mark.parametrize("conteudo", [[], {}, {"rewrites": []}, {"rewrites": "texto"}])
def test_vercel_json_sem_rotas(tmp_path, conteudo):
    arquivo = tmp_path / "vercel.json"
    arquivo.write_text(json.dumps(conteudo), encoding="utf-8")
    with pytest.raises(servidor.ErroDeConfiguracao, match='lista "rewrites"'):
        servidor.carregar_rotas(arquivo, pasta=None)


def test_vercel_json_com_rota_incompleta(tmp_path):
    arquivo = tmp_path / "vercel.json"
    arquivo.write_text(json.dumps({"rewrites": [{"source": "/"}]}), encoding="utf-8")
    with pytest.raises(servidor.ErroDeConfiguracao, match="nº 1"):
        servidor.carregar_rotas(arquivo, pasta=None)


def test_vercel_json_apontando_para_arquivo_que_nao_existe(tmp_path):
    arquivo = tmp_path / "vercel.json"
    arquivo.write_text(json.dumps({"rewrites": [{"source": "/", "destination": "/html/sumiu.html"}]}))
    with pytest.raises(servidor.ErroDeConfiguracao, match="não existe"):
        servidor.carregar_rotas(arquivo, pasta=tmp_path)


# ==========================================================
# Respostas HTTP do servidor ligado
# ==========================================================
@pytest.mark.parametrize("caminho", ["/", "/portugues-libras", "/libras-portugues", "/css/base.css"])
def test_paginas_respondem_200(servidor_local, caminho):
    with urllib.request.urlopen(servidor_local + caminho) as resposta:
        assert resposta.status == 200


def test_endereco_inexistente_responde_404(servidor_local):
    with pytest.raises(urllib.error.HTTPError) as erro:
        urllib.request.urlopen(servidor_local + "/pagina-que-nao-existe")
    assert erro.value.code == 404


def test_nao_sai_da_pasta_do_projeto(servidor_local):
    """Tentar acessar arquivos fora da pasta (../) não pode funcionar."""
    with pytest.raises(urllib.error.HTTPError) as erro:
        urllib.request.urlopen(servidor_local + "/../../etc/passwd")
    assert erro.value.code == 404
