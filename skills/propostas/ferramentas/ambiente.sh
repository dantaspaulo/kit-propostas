#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Confere e prepara o computador para o kit. Roda quantas vezes quiser: o que já está pronto fica como está.
#
#   bash ambiente.sh                  confere e prepara (instala o navegador sem tela, cerca de 200 MB, se faltar)
#   bash ambiente.sh --conferir       só confere, não instala nada
#   bash ambiente.sh --sem-navegador  prepara tudo menos o navegador sem tela
#
# O que fica fora da proposta mora em ~/.kit-propostas/runtime (KIT_PROPOSTAS_HOME muda a pasta):
# playwright-core (abre a página para as capturas, o PDF e a imagem da prévia) e pdf-lib (junta o PDF).
set -euo pipefail

CASA="${KIT_PROPOSTAS_HOME:-$HOME/.kit-propostas}"
RUNTIME="$CASA/runtime"
PLAYWRIGHT_VERSAO="1.63.0"
PDFLIB_VERSAO="1.17.1"
CONFERIR=0
NAVEGADOR=1
for a in "$@"; do
  case "$a" in
    --conferir) CONFERIR=1 ;;
    --sem-navegador) NAVEGADOR=0 ;;
    -h|--help) sed -n 2,13p "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
  esac
done

ok() { printf '  ok     %s\n' "$1"; }
falta() { printf '  FALTA  %s\n' "$1"; FALTOU=1; }
FALTOU=0

echo "Kit de Propostas: conferindo o computador"
if command -v node >/dev/null 2>&1; then
  V=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$V" -ge 20 ]; then ok "Node $(node -v)"; else falta "Node 20 ou mais novo (tem $(node -v)): https://nodejs.org"; fi
else
  falta "Node 20 ou mais novo: https://nodejs.org"
fi
command -v npm >/dev/null 2>&1 && ok "npm $(npm -v)" || falta "npm (vem com o Node)"
command -v pnpm >/dev/null 2>&1 && ok "pnpm $(pnpm -v) (opcional, mais rápido)" || printf '  -      pnpm não instalado (opcional: o kit usa o npm)\n'
command -v git >/dev/null 2>&1 && ok "git" || falta "git: https://git-scm.com"

if [ -d "$RUNTIME/node_modules/playwright-core" ] && [ -d "$RUNTIME/node_modules/pdf-lib" ]; then
  ok "ferramentas do kit em $RUNTIME"
elif [ "$CONFERIR" = 1 ]; then
  falta "ferramentas do kit (rode: bash $0)"
else
  echo "  ...    instalando as ferramentas do kit em $RUNTIME"
  mkdir -p "$RUNTIME"
  [ -f "$RUNTIME/package.json" ] || printf '{ "name": "kit-propostas-runtime", "private": true }\n' > "$RUNTIME/package.json"
  (cd "$RUNTIME" && npm install --no-audit --no-fund --silent "playwright-core@$PLAYWRIGHT_VERSAO" "pdf-lib@$PDFLIB_VERSAO")
  ok "ferramentas do kit em $RUNTIME"
fi

# O kit abre o navegador sem tela (headless shell): só ele é baixado, e a conferência é abrir e fechar de verdade.
navegador_pronto() {
  (cd "$RUNTIME" && node -e 'require("playwright-core").chromium.launch().then((b) => b.close()).then(() => process.exit(0), () => process.exit(1))') >/dev/null 2>&1
}
if [ -d "$RUNTIME/node_modules/playwright-core" ]; then
  if navegador_pronto; then
    ok "navegador sem tela"
  elif [ "$CONFERIR" = 1 ] || [ "$NAVEGADOR" = 0 ]; then
    falta "navegador sem tela, cerca de 200 MB (rode: bash $0)"
  else
    echo "  ...    baixando o navegador sem tela (cerca de 200 MB, uma vez só)"
    (cd "$RUNTIME" && node node_modules/playwright-core/cli.js install --only-shell chromium)
    if navegador_pronto; then ok "navegador sem tela"; else falta "navegador sem tela: o download terminou, mas ele não abriu"; fi
  fi
fi

if [ -f "$CASA/config.json" ]; then
  ok "espaço de trabalho: $(node -p "require('$CASA/config.json').espaco")"
else
  printf '  -      sem espaço de trabalho ainda: a entrevista (skill propostas-configurar) cria\n'
fi

if [ "$FALTOU" = 1 ]; then
  echo "Falta alguma coisa (acima)."
  exit 1
fi
echo "Tudo pronto."
