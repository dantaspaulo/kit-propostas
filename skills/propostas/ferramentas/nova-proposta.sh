#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Abre uma proposta nova no espaço de trabalho, a partir do modelo do kit, já com a marca do negócio.
#
#   nova-proposta.sh <pasta> <caminho> <ancora|ancora-acima|direto> [--de <pasta de outra proposta>]
#   ex.: nova-proposta.sh site-padaria-sol site-novo ancora
#
# <pasta>        nome da pasta da proposta no espaço de trabalho (também vira o nome dos arquivos)
# <caminho>      endereço: <seu endereço de propostas>/<caminho>/ (curto, sem o nome do cliente)
# ancora         2 ou 3 opções, a recomendada é o pedido inteiro e vem primeiro (as outras, reduzidas)
# ancora-acima   3 opções: uma mais cara para ancorar, a recomendada no meio, uma menor perto dela
# direto         o valor já combinado com o cliente, numa opção só, sem preço por módulo
# --de <pasta>   parte de outra proposta sua, em vez do exemplo do kit (os termos dela entram no herdado.json)
set -euo pipefail

FERRAMENTAS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$(dirname "$FERRAMENTAS")"
MODELO="$SKILL/modelo"
CASA="${KIT_PROPOSTAS_HOME:-$HOME/.kit-propostas}"
PASTA="${1:-}"; CAMINHO="${2:-}"; MODO="${3:-}"; DE=""
shift $(( $# < 3 ? $# : 3 ))
while [ $# -gt 0 ]; do
  case "$1" in
    --de) DE="${2:-}"; shift 2 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$PASTA" ] || [ -z "$CAMINHO" ] || [[ ! "$MODO" =~ ^(ancora|ancora-acima|direto)$ ]]; then
  sed -n 4,15p "$0" | sed 's/^# \{0,1\}//'
  [ -n "$PASTA" ] && echo "falta o modo: ancora, ancora-acima ou direto (já combinou o valor com o cliente? então direto)" >&2
  exit 2
fi
for V in "$PASTA" "$CAMINHO"; do
  [[ "$V" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "\"$V\": use só letras minúsculas, números e hífen" >&2; exit 2; }
done
[ "$CAMINHO" != "publico" ] || { echo "\"publico\" é reservado para as imagens da prévia" >&2; exit 2; }

[ -f "$CASA/config.json" ] || { echo "sem espaço de trabalho: faça a entrevista antes (skill propostas-configurar)" >&2; exit 1; }
ESPACO=$(node -p "require('$CASA/config.json').espaco.replace(/^~(?=\/|\$)/, require('os').homedir())")
PERFIL="$ESPACO/meu-negocio/perfil.json"
[ -f "$PERFIL" ] || { echo "sem perfil do negócio em $PERFIL: faça a entrevista antes (skill propostas-configurar)" >&2; exit 1; }
DEST="$ESPACO/$PASTA"
[ ! -e "$DEST" ] || { echo "já existe: $DEST (escolha outro nome; nada foi mexido)" >&2; exit 1; }
REGISTRO="$ESPACO/publicacao/propostas.json"
if [ -f "$REGISTRO" ] && node -e "process.exit(require('$REGISTRO').propostas?.['$CAMINHO'] ? 0 : 1)"; then
  echo "o caminho \"$CAMINHO\" já está em uso no registro ($REGISTRO)" >&2; exit 1
fi

if [ -n "$DE" ]; then
  [ -f "$DE/src/data.ts" ] || { echo "não achei $DE/src/data.ts (a pasta de --de é a de uma proposta?)" >&2; exit 1; }
fi

mkdir -p "$DEST"
( cd "$MODELO" && tar --exclude node_modules --exclude dist --exclude .build --exclude variantes --exclude exemplo -cf - . ) | ( cd "$DEST" && tar -xf - )
case "$MODO" in
  direto) cp "$MODELO/variantes/direto/data.ts" "$DEST/src/data.ts" ;;
  ancora-acima) cp "$MODELO/variantes/ancora-acima/data.ts" "$DEST/src/data.ts" ;;
esac

if [ -n "$DE" ]; then
  ORIGEM="$(cd "$DE" && pwd)"
  cp "$ORIGEM/src/data.ts" "$DEST/src/data.ts"
  # Os termos da proposta de origem (cliente, caminho, referência) passam a ser recusados na nova.
  node - "$ORIGEM" "$DEST" <<'NODE'
const fs = require("fs"), path = require("path");
const [origem, dest] = process.argv.slice(2);
const pubArq = path.join(origem, ".build", "publicacao.json");
const herdArq = path.join(dest, "herdado.json");
const herdado = JSON.parse(fs.readFileSync(herdArq, "utf8"));
const termos = new Set(herdado.termos);
if (fs.existsSync(pubArq)) {
  const pub = JSON.parse(fs.readFileSync(pubArq, "utf8"));
  for (const t of [...(pub.cliente || []), pub.caminho, path.basename(origem)]) if (t) termos.add(t);
}
const dados = fs.readFileSync(path.join(origem, "src", "data.ts"), "utf8");
const ref = dados.match(/referencia:\s*`?[^,\n]*?(\d{4}-\d{4}-[A-Z0-9]+)/);
if (ref) termos.add(ref[1]);
herdado.origem = `a proposta ${path.basename(origem)}`;
herdado.termos = [...termos];
fs.writeFileSync(herdArq, JSON.stringify(herdado, null, 2) + "\n");
NODE
fi

MODO_DATA=$( [ "$MODO" = direto ] && echo direto || echo ancora )
grep -q "export const modo: \"ancora\" | \"direto\" = \"$MODO_DATA\";" "$DEST/src/data.ts" \
  || { echo "o src/data.ts não ficou no modo $MODO_DATA (confira a proposta de origem)" >&2; exit 1; }

# Caminho, nome dos arquivos e do pacote. O resto do conteúdo é trabalho da proposta: o build recusa
# enquanto sobrar termo da origem (herdado.json).
node - "$DEST" "$CAMINHO" "$PASTA" <<'NODE'
const fs = require("fs"), path = require("path");
const [dest, caminho, pasta] = process.argv.slice(2);
const dataArq = path.join(dest, "src", "data.ts");
let t = fs.readFileSync(dataArq, "utf8");
const antes = t;
t = t.replace(/(\n  caminho: )"[a-z0-9-]*"/, `$1"${caminho}"`).replace(/(\n  slug: )"[a-z0-9-]*"/, `$1"${pasta}"`);
if (t === antes) { console.error("não consegui trocar caminho e slug no src/data.ts"); process.exit(1); }
fs.writeFileSync(dataArq, t);
const pkgArq = path.join(dest, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgArq, "utf8"));
pkg.name = `proposta-${pasta}`;
fs.writeFileSync(pkgArq, JSON.stringify(pkg, null, 2) + "\n");
NODE

node "$FERRAMENTAS/aplicar-marca.mjs" "$PERFIL" "$DEST"

cd "$DEST"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prefer-offline --silent
else
  npm install --no-audit --no-fund --silent
fi

cat <<FIM

ok: $DEST (modo $MODO)

Próximos passos (skill propostas):
  1. src/data.ts: o pedido item por item, os módulos, as opções, as etapas, os custos, as condições e as dúvidas.
  2. npm run build até passar. A primeira recusa lista o que sobrou da origem: é a lista de trabalho.
  3. Capturas no computador e no celular, a imagem da prévia (node scripts/og.cjs) e o PDF (node scripts/pdf.cjs).
  4. Código de acesso: node $SKILL/publicacao/senha.mjs $DEST --gerar
  5. Registro em $REGISTRO e a publicação: node $SKILL/publicacao/publicar.mjs --enviar
FIM
