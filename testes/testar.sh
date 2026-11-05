#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Testes do kit.
#   bash testes/testar.sh              leves (sem navegador e sem rede): sintaxe, portão, paleta e trava do repositório
#   bash testes/testar.sh --completo   também instala e compila o modelo nos três modos e prova que as guardas
#                                      do build recusam o que devem (precisa de rede na primeira vez)
#   bash testes/portao-no-runtime.sh   o portão no runtime de verdade da Cloudflare (wrangler dev local)
set -euo pipefail
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"
COMPLETO=0
[ "${1:-}" = "--completo" ] && COMPLETO=1
passo() { printf '\n== %s\n' "$1"; }

passo "sintaxe dos scripts"
while IFS= read -r arq; do node --check "$arq"; done < <(find skills testes -name '*.mjs' -o -name '*.cjs' | grep -v node_modules)
node --check skills/propostas/publicacao/_worker.template.js
while IFS= read -r arq; do bash -n "$arq"; done < <(find . -name '*.sh' -not -path './.git/*' -not -path '*/node_modules/*')
python3 -m py_compile ferramentas-do-repo/conferir-publico.py ferramentas-do-repo/teste_conferir_publico.py
echo "ok"

passo "portão (propostas fictícias)"
node skills/propostas/publicacao/teste-worker.mjs | tail -1

passo "paleta"
node testes/teste-paleta.mjs

passo "trava de autoria"
node skills/propostas/ferramentas/autoria.mjs --conferir
node testes/teste-autoria.mjs | tail -1

passo "trava do repositório"
python3 ferramentas-do-repo/teste_conferir_publico.py
if [ -f .git/info/termos-proibidos.txt ]; then python3 ferramentas-do-repo/conferir-publico.py
else python3 ferramentas-do-repo/conferir-publico.py --sem-lista; fi

[ "$COMPLETO" = 1 ] || { printf '\nTestes leves ok. Para compilar o modelo nos três modos: bash testes/testar.sh --completo\n'; exit 0; }

TMP="$(mktemp -d)"
trap 'cd "$RAIZ"' EXIT
passo "modelo nos três modos (em $TMP)"
cp -R skills/propostas/modelo "$TMP/base"
(cd "$TMP/base" && { command -v pnpm >/dev/null && pnpm install --prefer-offline --silent || npm install --no-audit --no-fund --silent; })
node skills/propostas/ferramentas/reactbits.mjs "$TMP/base" >/dev/null
for modo in ancora ancora-acima direto; do
  mkdir -p "$TMP/$modo"
  (cd "$TMP/base" && tar --exclude node_modules --exclude variantes --exclude exemplo -cf - .) | (cd "$TMP/$modo" && tar -xf -)
  ln -s "$TMP/base/node_modules" "$TMP/$modo/node_modules"
  [ "$modo" = ancora ] || cp "skills/propostas/modelo/variantes/$modo/data.ts" "$TMP/$modo/src/data.ts"
  (cd "$TMP/$modo" && KIT_ENSAIO=1 node build.mjs >/dev/null 2>&1) && echo "ok    $modo compila" || { echo "FALHA $modo não compila"; (cd "$TMP/$modo" && KIT_ENSAIO=1 node build.mjs | tail -20); exit 1; }
done

passo "o build recusa o que deve"
cd "$TMP/ancora"
cp src/data.ts .build/data.original.ts
recusa() {
  local nome="$1" de="$2" para="$3" espera="$4"
  cp .build/data.original.ts src/data.ts
  node -e 'const fs=require("fs");const [a,de,para]=process.argv.slice(1);const t=fs.readFileSync(a,"utf8");if(!t.includes(de)){console.error("trecho não achado: "+de);process.exit(3)}fs.writeFileSync(a,t.replace(de,para))' src/data.ts "$de" "$para"
  if SAIDA=$(KIT_ENSAIO=1 node build.mjs 2>&1); then echo "FALHA não recusou: $nome"; exit 1; fi
  echo "$SAIDA" | grep -q "$espera" && echo "ok    recusa $nome" || { echo "FALHA recusou $nome, mas sem \"$espera\":"; echo "$SAIDA" | tail -5; exit 1; }
}
recusa "soma dos módulos" 'precos: [4000, 5000, 6000]' 'precos: [4000, 5000, 6500]' "módulos somam"
recusa "parcelas que não fecham" 'valor: 5000, itens: ["Imersão e protótipo"]' 'valor: 5500, itens: ["Imersão e protótipo"]' "parcelas somam"
recusa "linha sem pedido" 'ref: ["AG.1"], c: [S(), S(), S()] },' 'ref: [], c: [S(), S(), S()] },' "não aponta para nenhum item"
recusa "travessão no texto" 'Marcação pelo celular, confirmação' "Marcação pelo celular $(printf '\xe2\x80\x94') confirmação" "travessão"
recusa "cliente na prévia pública" 'titulo: "Plataforma de Agendamento Online"' 'titulo: "Agenda da Clínica Bem Viver"' "a tela de acesso e a imagem da prévia são públicas"
recusa "recomendada fora do lugar" 'export const ordem = [2, 1, 0] as const;' 'export const ordem = [1, 2, 0] as const;' "a recomendada vem primeiro"
recusa "modo direto com opções" 'export const modo: "ancora" | "direto" = "ancora";' 'export const modo: "ancora" | "direto" = "direto";' "modo direto tem 1 opção"
recusa "texto de rascunho" 'titulo: "Agenda online para *as três unidades*"' 'titulo: "Agenda TODO *as três unidades*"' "texto de rascunho"
cp .build/data.original.ts src/data.ts
if node build.mjs >/dev/null 2>&1; then echo "FALHA o build sem ensaio aceitou os termos do exemplo"; exit 1; else echo "ok    recusa os termos do exemplo sem KIT_ENSAIO"; fi
printf '\nTodos os testes passaram.\n'
