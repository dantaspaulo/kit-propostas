#!/usr/bin/env python3
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
"""Prova da trava do repositório: planta cada tipo de problema num repositório de mentira e confere que a trava
recusa, e que um repositório limpo passa. Os valores com cara de segredo são montados aqui na hora (nenhum fica
escrito neste arquivo), para o próprio teste não disparar a trava nem a proteção do GitHub."""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
TRAVA = AQUI / "conferir-publico.py"

TRAVESSAO = chr(0x2014)
CASOS = [
    ("travessão", "texto.md", f"uma frase {TRAVESSAO} com travessão\n"),
    ("e-mail", "contato.md", "fale com " + "fulano" + "@" + "empresa-real.com.br\n"),
    ("telefone com DDD", "contato.md", "WhatsApp (84) 9" + "8123-4567\n"),
    ("32 ou mais caracteres hexadecimais", "conta.md", "conta " + "a1" * 16 + "\n"),
    ("token do GitHub", "x.md", "gh" + "p_" + "A" * 36 + "\n"),
    ("chave do React Bits Pro", "x.md", "rb" + "pp-1a2b3c4d-5e6f\n"),
    ("código derivado do React Bits Pro", "secao.tsx", "// Adaptado do bloco pricing-13 do React" + " Bits Pro\n"),
    ("import do registro do React Bits", "secao.tsx", 'import X from "@reactbits' + '-pro/pricing-13";\n'),
    ("endereço workers.dev ou pages.dev real", "x.md", "veja em https://propostas-acme." + "conta-real." + "workers" + ".dev\n"),
    ("termo da lista privada", "x.md", "proposta da Empresa Segredo Ltda\n"),
    ("arquivo que nunca entra", ".env", "NADA=1\n"),
    ("pasta de blocos do React Bits Pro", "src/components/blocks/pricing.tsx", "export {}\n"),
]


def rodar(raiz: Path, lista: Path):
    copia = raiz / "ferramentas-do-repo"
    copia.mkdir(parents=True, exist_ok=True)
    shutil.copy(TRAVA, copia / "conferir-publico.py")
    subprocess.run(["git", "init", "-q", str(raiz)], check=True)
    r = subprocess.run([sys.executable, str(copia / "conferir-publico.py"), "--termos", str(lista)], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def main():
    falhas = 0
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        lista = tmp / "termos.txt"
        lista.write_text("empresa segredo\n", encoding="utf-8")
        limpo = tmp / "limpo"
        (limpo).mkdir()
        (limpo / "README.md").write_text("Um texto limpo, com exemplo em contato@exemplo.com.br e (11) 90000-0000.\n", encoding="utf-8")
        codigo, saida = rodar(limpo, lista)
        if codigo != 0:
            falhas += 1
            print("FALHA repositório limpo foi recusado:\n" + saida)
        for categoria, arquivo, conteudo in CASOS:
            raiz = tmp / f"caso-{abs(hash(categoria))}"
            (raiz / Path(arquivo).parent).mkdir(parents=True, exist_ok=True)
            (raiz / arquivo).write_text(conteudo, encoding="utf-8")
            codigo, saida = rodar(raiz, lista)
            if codigo != 1 or categoria not in saida:
                falhas += 1
                print(f"FALHA a trava não recusou: {categoria}\n{saida}")
            elif conteudo.strip() in saida:
                falhas += 1
                print(f"FALHA a trava imprimiu o trecho achado ({categoria})")
    print(f"trava do repositório: {len(CASOS)} casos recusados e o limpo passou" if not falhas else f"{falhas} falha(s) na trava")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
