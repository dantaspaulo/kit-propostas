#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Instala o Kit de Propostas: as skills no Claude Code (e, se quiser, na pasta que outras IAs leem), as ferramentas
# do kit e o navegador sem tela. No fim, oferece começar a entrevista de personalização.
#
#   curl -fsSL https://raw.githubusercontent.com/dantaspaulo/kit-propostas/main/instalar.sh | bash
#   ou, de um clone:  ./instalar.sh
#
# Opções:
#   --agente claude|agents|todos   onde instalar as skills (padrão: claude; "agents" é ~/.agents/skills, que Codex,
#                                  Cursor, Copilot, Gemini CLI e outros leem; "todos" faz os dois)
#   --sem-navegador                não baixa o navegador sem tela agora (o kit baixa quando precisar)
#   --sem-entrevista               não oferece a entrevista no fim (é o que uma IA instalando deve usar)
#
# Atualizar: rode de novo. Desinstalar: ~/.kit-propostas/kit/desinstalar.sh (não apaga as suas propostas).
set -euo pipefail

REPO_URL="https://github.com/dantaspaulo/kit-propostas.git"
CASA="${KIT_PROPOSTAS_HOME:-$HOME/.kit-propostas}"
AGENTE="claude"
NAVEGADOR=1
ENTREVISTA=1
while [ $# -gt 0 ]; do
  case "$1" in
    --agente) AGENTE="${2:-}"; shift 2 ;;
    --sem-navegador) NAVEGADOR=0; shift ;;
    --sem-entrevista) ENTREVISTA=0; shift ;;
    -h|--help) sed -n 2,18p "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "opção desconhecida: $1 (veja --help)" >&2; exit 2 ;;
  esac
done
case "$AGENTE" in claude|agents|todos) ;; *) echo "--agente: claude, agents ou todos" >&2; exit 2 ;; esac

titulo() { printf '\n\033[1m%s\033[0m\n' "$1"; }
ok() { printf '  ok   %s\n' "$1"; }

titulo "Kit de Propostas"
echo "  Propostas que vendem, com a sua marca, num link com código de acesso."

for programa in git node npm; do
  command -v "$programa" >/dev/null 2>&1 || { echo "  falta o $programa. Node 20 ou mais novo: https://nodejs.org  ·  git: https://git-scm.com" >&2; exit 1; }
done
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "  o kit precisa do Node 20 ou mais novo (tem $(node -v)): https://nodejs.org" >&2; exit 1; }

# 1. O kit: o próprio clone, se este script veio de um; senão, ~/.kit-propostas/kit.
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$AQUI" ] && [ -f "$AQUI/skills/propostas/SKILL.md" ]; then
  KIT="$AQUI"
  ok "kit em $KIT"
else
  KIT="$CASA/kit"
  mkdir -p "$CASA"
  if [ -d "$KIT/.git" ]; then
    git -C "$KIT" pull --ff-only --quiet
    ok "kit atualizado em $KIT"
  elif [ -e "$KIT" ]; then
    echo "  $KIT já existe e não é um clone do kit. Renomeie a pasta e rode de novo (nada foi mexido)." >&2
    exit 1
  else
    git clone --depth 1 --quiet "$REPO_URL" "$KIT"
    ok "kit baixado em $KIT"
  fi
fi

# A trava de autoria: com os créditos trocados ou retirados, o kit não se instala (LICENSE, cláusulas 1 e 3).
node "$KIT/skills/propostas/ferramentas/autoria.mjs" --conferir "$KIT" >/dev/null || exit 3
ok "créditos do kit conferidos"

# 2. As skills: um atalho para a pasta do kit em cada lugar, para atualizar junto com ele.
instalar_em() {
  local destino="$1"
  mkdir -p "$destino"
  for skill in propostas propostas-configurar; do
    local alvo="$destino/$skill"
    local origem="$KIT/skills/$skill"
    if [ -L "$alvo" ]; then
      if [ "$(readlink "$alvo")" = "$origem" ]; then ok "skill $skill em $destino (já estava)"; continue; fi
      echo "  $alvo aponta para outra pasta ($(readlink "$alvo")). Tire esse atalho e rode de novo (nada foi mexido)." >&2
      exit 1
    elif [ -e "$alvo" ]; then
      echo "  já existe $alvo e não é do kit. Renomeie a pasta e rode de novo (nada foi mexido)." >&2
      exit 1
    fi
    if ln -s "$origem" "$alvo" 2>/dev/null; then ok "skill $skill em $destino"
    else cp -R "$origem" "$alvo" && ok "skill $skill copiada para $destino (sem atalho: rode de novo para atualizar)"; fi
  done
}
titulo "Skills"
case "$AGENTE" in
  claude) instalar_em "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills" ;;
  agents) instalar_em "$HOME/.agents/skills" ;;
  todos) instalar_em "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"; instalar_em "$HOME/.agents/skills" ;;
esac

# 3. As ferramentas do kit e, se não pediu para pular, o navegador sem tela.
titulo "Ferramentas"
if [ "$NAVEGADOR" = 1 ]; then bash "$KIT/skills/propostas/ferramentas/ambiente.sh" || true
else bash "$KIT/skills/propostas/ferramentas/ambiente.sh" --sem-navegador || true; fi

titulo "Pronto"
cat <<FIM
  Para começar, abra o Claude Code e peça:  /propostas-configurar
  (a entrevista: o nome do seu negócio e o seu site; o resto ela descobre)

  Depois, para cada cliente:  "faz uma proposta para <cliente>: <o pedido>"
FIM

# 4. A entrevista, se houver um terminal de verdade e o Claude Code instalado.
if [ "$ENTREVISTA" = 1 ] && [ -r /dev/tty ] && command -v claude >/dev/null 2>&1; then
  printf '\n  Quer fazer a entrevista agora? [S/n] '
  read -r RESPOSTA < /dev/tty || RESPOSTA="n"
  case "${RESPOSTA:-s}" in
    [sS]*) exec claude "/propostas-configurar" < /dev/tty ;;
  esac
fi
