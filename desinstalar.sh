#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Tira o Kit de Propostas do Claude Code e das outras IAs. NÃO apaga as suas propostas nem o perfil do negócio:
# o espaço de trabalho (padrão ~/Propostas) fica como está.
#
#   ~/.kit-propostas/kit/desinstalar.sh           tira as skills e a memória do negócio do ~/.claude/CLAUDE.md
#   ~/.kit-propostas/kit/desinstalar.sh --tudo    também apaga ~/.kit-propostas (o kit, as ferramentas e a config),
#                                                 depois de perguntar
set -euo pipefail

CASA="${KIT_PROPOSTAS_HOME:-$HOME/.kit-propostas}"
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TUDO=0
[ "${1:-}" = "--tudo" ] && TUDO=1

for destino in "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills" "$HOME/.agents/skills"; do
  for skill in propostas propostas-configurar; do
    alvo="$destino/$skill"
    if [ -L "$alvo" ] && [ "$(readlink "$alvo")" = "$KIT/skills/$skill" ]; then
      unlink "$alvo" && echo "  tirada: $alvo"
    elif [ -e "$alvo" ]; then
      echo "  ficou: $alvo (não é um atalho para este kit; confira e apague à mão, se for o caso)"
    fi
  done
done

if [ -f "$CASA/config.json" ]; then
  node "$KIT/skills/propostas-configurar/ferramentas/lembrar-negocio.mjs" --desligar || true
  ESPACO=$(node -p "require('$CASA/config.json').espaco" 2>/dev/null || echo "")
  [ -n "$ESPACO" ] && echo "  as suas propostas e o perfil continuam em $ESPACO"
fi

if [ "$TUDO" = 1 ] && [ -d "$CASA" ]; then
  printf '  Apagar %s (o kit, as ferramentas e a configuração)? As propostas NÃO são apagadas. [s/N] ' "$CASA"
  read -r RESPOSTA < /dev/tty || RESPOSTA="n"
  case "$RESPOSTA" in
    [sS]*)
      case "$CASA" in
        "$HOME"/.kit-propostas|"$HOME"/.kit-propostas/) rm -rf -- "$HOME/.kit-propostas" && echo "  apagado: $HOME/.kit-propostas" ;;
        *) echo "  pasta fora do padrão ($CASA): apague à mão, se for o caso" ;;
      esac ;;
    *) echo "  nada apagado" ;;
  esac
fi
echo "  Kit de Propostas desinstalado."
