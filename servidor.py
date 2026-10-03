"""
servidor.py
===========
Servidor local para testar o site no seu computador.

Ele usa as MESMAS rotas do Vercel (lidas do vercel.json), então
os endereços funcionam igual aqui e no site publicado:

    http://localhost:8000/                  -> html/index.html
    http://localhost:8000/portugues-libras  -> html/portugues-libras.html
    http://localhost:8000/libras-portugues  -> html/libras-portugues.html

Como usar (dentro da pasta do projeto):

    python servidor.py            # porta 8000
    python servidor.py 5000       # outra porta

Para parar: Ctrl + C.
Não precisa instalar nada: só usa a biblioteca padrão do Python.
"""

from __future__ import annotations

import errno
import json
import sys
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PASTA_DO_PROJETO = Path(__file__).resolve().parent
ARQUIVO_DE_ROTAS = PASTA_DO_PROJETO / "vercel.json"
PORTA_PADRAO = 8000
PORTA_MINIMA = 1
PORTA_MAXIMA = 65535


# ==========================================================
# Erros com mensagem amigável
# ==========================================================
class ErroDeConfiguracao(Exception):
    """Problema no vercel.json (arquivo faltando, JSON inválido, rotas erradas)."""


class ErroDePorta(Exception):
    """Porta inválida ou já em uso."""


# ==========================================================
# Funções (separadas do servidor para poder testar)
# ==========================================================
def carregar_rotas(arquivo: Path = ARQUIVO_DE_ROTAS, pasta: Path | None = PASTA_DO_PROJETO) -> dict[str, str]:
    """
    Lê as rotas do vercel.json e devolve {"/endereco": "/arquivo.html"}.
    Se "pasta" for informada, confere se cada arquivo de destino existe nela.
    """
    try:
        texto = arquivo.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise ErroDeConfiguracao(f"Não achei o arquivo {arquivo.name}. Ele precisa ficar na pasta do projeto.")
    except OSError as erro:
        raise ErroDeConfiguracao(f"Não consegui ler {arquivo.name}: {erro}")

    try:
        configuracao = json.loads(texto)
    except json.JSONDecodeError as erro:
        raise ErroDeConfiguracao(
            f"O {arquivo.name} tem um erro de digitação na linha {erro.lineno}, coluna {erro.colno}."
        )

    regras = configuracao.get("rewrites") if isinstance(configuracao, dict) else None
    if not isinstance(regras, list) or not regras:
        raise ErroDeConfiguracao(f'O {arquivo.name} precisa ter uma lista "rewrites" com as rotas.')

    rotas = {}
    for posicao, regra in enumerate(regras, start=1):
        origem = regra.get("source") if isinstance(regra, dict) else None
        destino = regra.get("destination") if isinstance(regra, dict) else None
        if not isinstance(origem, str) or not isinstance(destino, str):
            raise ErroDeConfiguracao(f'A rota nº {posicao} do {arquivo.name} precisa de "source" e "destination".')
        if pasta is not None and not (pasta / destino.lstrip("/")).is_file():
            raise ErroDeConfiguracao(f"A rota {origem} aponta para {destino}, mas esse arquivo não existe.")
        rotas[origem] = destino

    return rotas


def resolver_caminho(caminho_pedido: str, rotas: dict[str, str]) -> str:
    """
    Troca o endereço pedido pelo arquivo certo, se for uma rota.
    Ex.: "/portugues-libras?x=1" -> "/html/portugues-libras.html?x=1"
    """
    caminho, separador, consulta = caminho_pedido.partition("?")
    caminho_limpo = caminho.rstrip("/") or "/"

    if caminho_limpo in rotas:
        return rotas[caminho_limpo] + (separador + consulta if separador else "")
    return caminho_pedido


def ler_porta(argumentos: list[str]) -> int:
    """Usa a porta passada no comando ou a padrão. Recusa valores inválidos."""
    if not argumentos:
        return PORTA_PADRAO

    valor = argumentos[0]
    if not valor.isdigit():
        raise ErroDePorta(f'"{valor}" não é uma porta válida. Use um número, ex.: python servidor.py 5000')

    porta = int(valor)
    if not PORTA_MINIMA <= porta <= PORTA_MAXIMA:
        raise ErroDePorta(f"A porta precisa estar entre {PORTA_MINIMA} e {PORTA_MAXIMA}.")
    return porta


# ==========================================================
# Servidor
# ==========================================================
class ManipuladorComRotas(SimpleHTTPRequestHandler):
    """Serve os arquivos da pasta, trocando os endereços das rotas pelo HTML certo."""

    rotas: dict[str, str] = {}

    def do_GET(self):
        self.path = resolver_caminho(self.path, self.rotas)
        super().do_GET()

    def do_HEAD(self):
        self.path = resolver_caminho(self.path, self.rotas)
        super().do_HEAD()

    def end_headers(self):
        # Evita que o navegador guarde versões antigas enquanto você edita
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, formato, *args):
        # Mostra só os erros (ex.: 404) para não poluir o terminal
        if len(args) > 1 and str(args[1]).startswith(("4", "5")):
            super().log_message(formato, *args)


def criar_servidor(porta: int, rotas: dict[str, str]) -> ThreadingHTTPServer:
    """Cria o servidor. Transforma 'porta em uso' numa mensagem clara."""
    # Cada servidor ganha a sua própria cópia das rotas (um não interfere no outro)
    manipulador_deste_servidor = type("Manipulador", (ManipuladorComRotas,), {"rotas": dict(rotas)})
    manipulador = partial(manipulador_deste_servidor, directory=str(PASTA_DO_PROJETO))
    try:
        return ThreadingHTTPServer(("localhost", porta), manipulador)
    except OSError as erro:
        if erro.errno in (errno.EADDRINUSE, 10048):  # 10048 = "porta em uso" no Windows
            raise ErroDePorta(
                f"A porta {porta} já está sendo usada (talvez o servidor já esteja aberto). "
                f"Feche o outro ou use outra porta: python servidor.py {porta + 1}"
            )
        if erro.errno in (errno.EACCES, 10013):  # 10013 = "sem permissão" no Windows
            raise ErroDePorta(f"Sem permissão para usar a porta {porta}. Tente uma porta acima de 1024.")
        raise


def main(argumentos: list[str] | None = None) -> int:
    """Liga o servidor. Devolve 0 se tudo certo, 1 se deu erro."""
    try:
        porta = ler_porta(sys.argv[1:] if argumentos is None else argumentos)
        rotas = carregar_rotas()
        servidor = criar_servidor(porta, rotas)
    except (ErroDePorta, ErroDeConfiguracao) as erro:
        print(f"Erro: {erro}", file=sys.stderr)
        return 1

    endereco = f"http://localhost:{porta}"
    print(f"Tradutor de Libras rodando em {endereco}")
    print("Rotas:")
    for origem, destino in rotas.items():
        print(f"  {endereco}{origem:<20} -> {destino}")
    print("Para parar, aperte Ctrl + C.")

    try:
        webbrowser.open(endereco)
    except Exception:
        pass  # sem navegador disponível: tudo bem, é só abrir o endereço na mão

    with servidor:
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
