#!/usr/bin/env python3
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
"""Trava do repositório público: recusa o que não pode ir para o GitHub.

Uso:
    python3 ferramentas-do-repo/conferir-publico.py                 # com a lista privada (padrão: .git/info/termos-proibidos.txt)
    python3 ferramentas-do-repo/conferir-publico.py --termos <arq>  # outra lista privada
    python3 ferramentas-do-repo/conferir-publico.py --sem-lista     # só os padrões genéricos (CI, onde a lista não existe)

O que procura, em todo arquivo que iria para o repositório (o que o git versiona ou versionaria):
  1. a lista PRIVADA de termos (nomes de clientes, domínios, identificadores internos), uma expressão regular por
     linha, sem diferenciar maiúsculas. A lista fica fora do repositório: ela própria é dado de cliente;
  2. padrões genéricos: telefone, e-mail, IPv4, sequência hexadecimal longa, chave privada, chaves de API com cara
     conhecida, chave do React Bits Pro, endereço workers.dev ou pages.dev real e travessão;
  3. código derivado do React Bits Pro (licença paga, nunca em repositório público): import do registro, comentário
     dizendo que o código foi adaptado de um bloco, pastas de blocos;
  4. arquivos que nunca entram: .env, chaves, hash de código de acesso, configuração de publicação preenchida.

Achou: imprime arquivo:linha e a categoria, nunca o trecho, e sai com 1. Tudo limpo: sai com 0.
"""
import argparse
import fnmatch
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LISTA_PADRAO = RAIZ / ".git" / "info" / "termos-proibidos.txt"

PASTAS_FORA = {".git", "node_modules", "dist", ".build", "saida", "__pycache__"}
BINARIOS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".woff", ".woff2", ".zip", ".skill"}
ARQUIVOS_PROIBIDOS = [
    ".env", ".env.*", "*.env", ".dev.vars", "*.pem", "*.key", "*.p12", "*-keys", "*_keys", "id_rsa*", "id_ed25519*",
    "*.sha256", "senha*.txt", "cloudflare.json", "perfil.json", "negocio.md", "wrangler.jsonc", "wrangler.toml",
]
# Arquivos de modelo com nome parecido que são de propósito (exemplos sem dado real).
ARQUIVOS_PERMITIDOS = {"cloudflare.exemplo.json", "perfil.exemplo.json", "negocio.exemplo.md", "wrangler.modelo.jsonc"}

CODIGO = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".html"}

OCTETO = r"(?:25[0-5]|2[0-4]\d|1?\d?\d)"
GENERICOS = [
    ("telefone com DDD", re.compile(r"(?<![\w.+/-])(?:\+?55[\s.-]?)?\(?[1-9][1-9]\)?[\s.-]?9?\d{4}[\s.-]\d{4}(?![\w.-])")),
    ("telefone com DDD", re.compile(r"(?<![\w.+/-])(?:\+?55)?[1-9][1-9]9\d{8}(?![\w.-])")),
    ("e-mail", re.compile(r"[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})")),
    ("IPv4", re.compile(rf"(?<![\d.])({OCTETO})\.({OCTETO})\.({OCTETO})\.({OCTETO})(?![\d.])")),
    ("32 ou mais caracteres hexadecimais", re.compile(r"(?<![0-9A-Fa-f])[0-9A-Fa-f]{32,}(?![0-9A-Fa-f])")),
    ("chave privada", re.compile(r"-{5}BEGIN [A-Z ]*PRIVATE")),
    ("chave de API (sk-)", re.compile(r"(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{16,}")),
    ("chave de API (sk_live, sk_test)", re.compile(r"(?<![A-Za-z0-9])sk_(?:live|test)_[A-Za-z0-9]{10,}")),
    ("token do GitHub", re.compile(r"(?<![A-Za-z0-9])gh[pousr]_[A-Za-z0-9]{20,}")),
    ("token do Slack", re.compile(r"(?<![A-Za-z0-9])xox[bpas]-[A-Za-z0-9-]{10,}")),
    ("chave da AWS", re.compile(r"(?<![A-Z0-9])AKIA[0-9A-Z]{16}(?![A-Z0-9])")),
    ("token da Meta", re.compile(r"(?<![A-Za-z0-9])EAA[A-Za-z0-9]{30,}")),
    ("JWT", re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}")),
    ("chave do React Bits Pro", re.compile(r"\brbp[a-z]{0,2}-(?=[0-9a-z-]*\d)[0-9a-z-]{8,}", re.I)),
    ("endereço workers.dev ou pages.dev real", re.compile(r"\b([a-z0-9-]+)\.([a-z0-9-]+\.)?(workers|pages)\.dev\b", re.I)),
    ("travessão", re.compile("[" + chr(0x2014) + chr(0x2013) + "]")),
]
EMAIL_OK = re.compile(
    r"(^|\.)(example\.(com|org|net)|exemplo\.com(\.br)?|seunegocio\.com(\.br)?|[a-z0-9-]+\.(example|test|invalid|exemplo))$", re.I)
EMAILS_PUBLICOS = {"contato@paulosdantas.adv.br"}  # contato público do autor, nos créditos
DEV_OK = re.compile(r"exemplo|seu-|sua-|<|\{|\$")

DERIVADO_RB = [
    ("código derivado do React Bits Pro", re.compile(r"(adaptad|derivad|copiad|tirad|baseado)[oa]s?\b.{0,60}react ?bits", re.I)),
    ("import do registro do React Bits", re.compile(r"""from\s+['"]@(reactbits|/components/(blocks|react-bits))""")),
]
PASTAS_RB = [re.compile(p) for p in (r"(^|/)components/blocks/", r"(^|/)components/react-bits/", r"(^|/)vendor/react-bits", r"(^|/)blocos-licenciados/")]


def arquivos_do_repositorio():
    try:
        saida = subprocess.run(
            ["git", "-C", str(RAIZ), "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            check=True, capture_output=True,
        ).stdout.decode("utf-8")
        rels = [Path(p) for p in saida.split("\0") if p]
    except (subprocess.CalledProcessError, FileNotFoundError):
        rels = []
        for p in RAIZ.rglob("*"):
            if p.is_file() and not any(parte in PASTAS_FORA for parte in p.relative_to(RAIZ).parts):
                rels.append(p.relative_to(RAIZ))
    return sorted(r for r in rels if (RAIZ / r).is_file() and not any(parte in PASTAS_FORA for parte in r.parts))


def ler_lista(caminho: Path):
    termos = []
    for n, linha in enumerate(caminho.read_text(encoding="utf-8").splitlines(), 1):
        linha = linha.strip()
        if not linha or linha.startswith("#"):
            continue
        try:
            termos.append(re.compile(linha, re.I))
        except re.error:
            sys.exit(f"RECUSADO: a linha {n} da lista privada não é uma expressão regular válida.")
    if not termos:
        sys.exit("RECUSADO: a lista privada está vazia.")
    return termos


def conferir(rel: Path, privados):
    achados = []
    nome = rel.name
    s = rel.as_posix()
    if nome not in ARQUIVOS_PERMITIDOS and any(fnmatch.fnmatch(nome, m) for m in ARQUIVOS_PROIBIDOS):
        achados.append((0, "arquivo que nunca entra no repositório"))
    if any(p.search(s) for p in PASTAS_RB):
        achados.append((0, "pasta de blocos do React Bits Pro"))
    if rel.suffix.lower() in BINARIOS:
        return achados
    try:
        texto = (RAIZ / rel).read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return achados
    eh_codigo = rel.suffix.lower() in CODIGO
    for n, linha in enumerate(texto.splitlines(), 1):
        for padrao in privados:
            if padrao.search(linha):
                achados.append((n, "termo da lista privada (cliente ou dado interno)"))
                break
        for categoria, padrao in GENERICOS:
            for m in padrao.finditer(linha):
                if categoria == "e-mail" and (EMAIL_OK.search(m.group(1)) or m.group(0).lower() in EMAILS_PUBLICOS):
                    continue
                if categoria.startswith("telefone") and re.search(r"0000[\s.-]?0000", m.group(0)):
                    continue
                if categoria.startswith("endereço") and DEV_OK.search(m.group(0)):
                    continue
                if categoria == "IPv4":
                    a, b, c, _ = (int(x) for x in m.groups())
                    if a == 127 or (a, b, c) in {(192, 0, 2), (198, 51, 100), (203, 0, 113)} or m.group(0) == "0.0.0.0":
                        continue
                achados.append((n, categoria))
                break
        if eh_codigo:
            for categoria, padrao in DERIVADO_RB:
                if padrao.search(linha):
                    achados.append((n, categoria))
    return achados


def main():
    ap = argparse.ArgumentParser(description="Trava do repositório público do Kit de Propostas.")
    ap.add_argument("--termos", type=Path, help="lista privada de termos proibidos (fora do repositório)")
    ap.add_argument("--sem-lista", action="store_true", help="só os padrões genéricos (CI)")
    args = ap.parse_args()

    privados = []
    if not args.sem_lista:
        lista = args.termos or LISTA_PADRAO
        if not lista.is_file():
            sys.exit(f"RECUSADO: não achei a lista privada ({lista}). Sem ela não confiro no escuro: "
                     "passe --termos <arquivo>, ou --sem-lista no CI.")
        lista_abs = lista.resolve()
        if RAIZ in lista_abs.parents and ".git" not in lista_abs.relative_to(RAIZ).parts:
            sys.exit("RECUSADO: a lista privada está dentro do repositório. Ela é dado de cliente: guarde fora (ou em .git/info).")
        privados = ler_lista(lista)

    total, problemas = 0, []
    for rel in arquivos_do_repositorio():
        total += 1
        for linha, categoria in conferir(rel, privados):
            problemas.append(f"{rel}:{linha}  {categoria}" if linha else f"{rel}  {categoria}")

    modo = "só padrões genéricos" if args.sem_lista else f"lista privada com {len(privados)} termos + padrões genéricos"
    if problemas:
        print(f"RECUSADO ({modo}). {len(problemas)} achado(s) em {total} arquivos:")
        print("\n".join(f"  {p}" for p in problemas))
        sys.exit(1)
    print(f"ok: {total} arquivos conferidos ({modo}), nada que não possa ir para o GitHub.")


if __name__ == "__main__":
    main()
