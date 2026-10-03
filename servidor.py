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

import json
import sys
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PASTA_DO_PROJETO = Path(__file__).resolve().parent
ARQUIVO_DE_ROTAS = PASTA_DO_PROJETO / "vercel.json"
PORTA_PADRAO = 8000


def carregar_rotas() -> dict[str, str]:
    """Lê as rotas do vercel.json e devolve {"/endereco": "/arquivo.html"}."""
    configuracao = json.loads(ARQUIVO_DE_ROTAS.read_text(encoding="utf-8"))
    return {
        regra["source"]: regra["destination"]
        for regra in configuracao.get("rewrites", [])
    }


class ManipuladorComRotas(SimpleHTTPRequestHandler):
    """Serve os arquivos da pasta, trocando os endereços das rotas pelo HTML certo."""

    rotas: dict[str, str] = {}

    def do_GET(self):
        caminho, _, consulta = self.path.partition("?")
        caminho = caminho.rstrip("/") or "/"

        if caminho in self.rotas:
            self.path = self.rotas[caminho] + (f"?{consulta}" if consulta else "")

        super().do_GET()

    def end_headers(self):
        # Evita que o navegador guarde versões antigas enquanto você edita
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def ler_porta() -> int:
    """Usa a porta passada no comando ou a padrão."""
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        return int(sys.argv[1])
    return PORTA_PADRAO


def main():
    porta = ler_porta()
    ManipuladorComRotas.rotas = carregar_rotas()
    manipulador = partial(ManipuladorComRotas, directory=str(PASTA_DO_PROJETO))

    with ThreadingHTTPServer(("localhost", porta), manipulador) as servidor:
        endereco = f"http://localhost:{porta}"
        print(f"Tradutor de Libras rodando em {endereco}")
        print("Rotas:")
        for origem, destino in ManipuladorComRotas.rotas.items():
            print(f"  {endereco}{origem:<20} -> {destino}")
        print("Para parar, aperte Ctrl + C.")

        webbrowser.open(endereco)

        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")


if __name__ == "__main__":
    main()
