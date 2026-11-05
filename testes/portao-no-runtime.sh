#!/usr/bin/env bash
# Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
#
# Testa o portão no runtime de verdade da Cloudflare (wrangler dev, na sua máquina, sem enviar nada à Cloudflare),
# com uma proposta inventada. O código de acesso e o segredo são descartáveis, gerados aqui.
#   bash testes/portao-no-runtime.sh                                       usa npx wrangler@4 (baixa na primeira vez)
#   WRANGLER="node /caminho/node_modules/wrangler/bin/wrangler.js" bash testes/portao-no-runtime.sh
set -uo pipefail
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
PORTA="${PORTA:-8799}"
B="http://127.0.0.1:$PORTA"
CODIGO="ensaio-local-teste-$RANDOM"
export WRANGLER_SEND_METRICS=false

# Uma proposta inventada: página, PDF, imagem da prévia e logo (o conteúdo só precisa ser reconhecível).
node --input-type=module - "$RAIZ" "$TMP" "$CODIGO" <<'EOF'
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
const [raiz, tmp, codigo] = process.argv.slice(2);
const { montarWorker, MARCA_TESTE } = await import(join(raiz, "skills/propostas/publicacao/teste-worker.mjs"));
const saida = join(tmp, "saida");
mkdirSync(join(saida, "teste"), { recursive: true });
mkdirSync(join(saida, "publico"), { recursive: true });
writeFileSync(join(saida, "teste", "index.html"), "<!doctype html><title>Teste</title><p>Proposta de teste aberta</p>\n");
writeFileSync(join(saida, "teste", "proposta-teste.pdf"), "%PDF-1.4\n% proposta de teste\n%%EOF\n");
writeFileSync(join(saida, "publico", "og-teste.jpg"), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
writeFileSync(join(saida, "publico", "logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const propostas = {
  teste: {
    titulo: "Proposta de teste",
    descricao: "Uma proposta inventada para testar o portão.",
    imagem: "/publico/og-teste.jpg",
    validade: "31 de dezembro de 2099",
    senhaSha256: createHash("sha256").update(codigo).digest("hex"),
  },
};
writeFileSync(join(tmp, "worker.js"), montarWorker(propostas, { ...MARCA_TESTE, logo: "/publico/logo.png" }));
writeFileSync(join(tmp, "wrangler.jsonc"), JSON.stringify({
  name: "portao-teste-local",
  main: "worker.js",
  compatibility_date: "2026-10-01",
  assets: { directory: "./saida", binding: "ASSETS", run_worker_first: true },
  ratelimits: [
    { name: "LIMITE", namespace_id: "1001", simple: { limit: 10, period: 60 } },
    { name: "LIMITE_GERAL", namespace_id: "1002", simple: { limit: 30, period: 60 } },
  ],
}, null, 2));
EOF

SEGREDO_LOCAL=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')
cd "$TMP" || exit 1
# shellcheck disable=SC2086
${WRANGLER:-npx --yes wrangler@4} dev --config wrangler.jsonc --ip 127.0.0.1 --port "$PORTA" --var "SEGREDO:$SEGREDO_LOCAL" > "$TMP/wrangler.log" 2>&1 &
PID=$!
encerrar() { pkill -TERM -P "$PID" 2>/dev/null; kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; cd "$RAIZ" || true; }
trap encerrar EXIT
if ! curl -s -o /dev/null --retry 90 --retry-delay 1 --retry-connrefused --retry-all-errors "$B/teste/"; then
  echo "o wrangler dev não subiu:"; tail -20 "$TMP/wrangler.log"; exit 1
fi

FALHAS=0
confere() {
  if [ "$2" = "$3" ]; then printf 'ok    %s\n' "$1"
  else printf 'FALHA %s: veio "%s", esperado "%s"\n' "$1" "$2" "$3"; FALHAS=$((FALHAS + 1)); fi
}
sim() { [ "${1:-0}" -gt 0 ] && echo sim || echo não; }

confere "a raiz manda para o site do negócio" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B/")" "302 https://exemplo.com.br/"
confere "endereço que não existe também" "$(curl -s -o /dev/null -w '%{http_code}' "$B/nao-existe/")" "302"
confere "robots.txt fecha tudo" "$(curl -s "$B/robots.txt" | grep -c 'Disallow: /')" "1"
confere "a tela de acesso abre" "$(curl -s -o "$TMP/portao.html" -w '%{http_code}' "$B/teste/")" "200"
confere "a tela tem o campo do código" "$(grep -c 'name="codigo"' "$TMP/portao.html")" "1"
confere "a tela tem a imagem da prévia" "$(sim "$(grep -c 'og-teste.jpg' "$TMP/portao.html")")" "sim"
curl -s -D "$TMP/cab-portao.txt" -o /dev/null "$B/teste/"
confere "a tela não deixa indexar" "$(sim "$(grep -ci '^x-robots-tag: noindex' "$TMP/cab-portao.txt")")" "sim"
confere "a tela tem CSP" "$(sim "$(grep -ci '^content-security-policy:' "$TMP/cab-portao.txt")")" "sim"
confere "a imagem da prévia é pública" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$B/publico/og-teste.jpg")" "200 image/jpeg"
confere "o logo é público" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$B/publico/logo.png")" "200 image/png"
confere "sem código, o PDF não sai" "$(curl -s -o /dev/null -w '%{content_type}' "$B/teste/proposta-teste.pdf" | cut -d';' -f1)" "text/html"
confere "sem código, a página não sai" "$(curl -s "$B/teste/index.html" | grep -c 'Proposta de teste aberta')" "0"

T=$(curl -s -o /dev/null -w '%{http_code} %{time_total}' -X POST --data-urlencode "codigo=errado-errado-00" "$B/teste/entrar")
confere "código errado é recusado" "${T%% *}" "401"
confere "código errado espera ao menos 0,7 s" "$(awk -v t="${T##* }" 'BEGIN { print (t >= 0.7) ? "sim" : "não" }')" "sim"
MAIUSCULO=$(printf '%s' "$CODIGO" | tr '[:lower:]' '[:upper:]')
curl -s -D "$TMP/cab-entrar.txt" -o /dev/null -X POST --data-urlencode "codigo=  $MAIUSCULO " "$B/teste/entrar"
confere "código certo entra, mesmo com maiúsculas e espaços" "$(head -1 "$TMP/cab-entrar.txt" | awk '{ print $2 }')" "303"
confere "o cookie fica preso à proposta, HttpOnly e Secure" "$(grep -i '^set-cookie:' "$TMP/cab-entrar.txt" | grep -c 'Path=/teste; .*HttpOnly; Secure; SameSite=Lax')" "1"
COOKIE=$(grep -i '^set-cookie:' "$TMP/cab-entrar.txt" | head -1 | sed -E 's/^[Ss]et-[Cc]ookie: *([^;]+);.*/\1/')
confere "com o cookie, a proposta abre" "$(curl -s -H "Cookie: $COOKIE" "$B/teste/" | grep -c 'Proposta de teste aberta')" "1"
confere "com o cookie, o PDF sai" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' -H "Cookie: $COOKIE" "$B/teste/proposta-teste.pdf" | cut -d';' -f1)" "200 application/pdf"
confere "cookie adulterado não entra" "$(curl -s -H "Cookie: ${COOKIE%?}0" "$B/teste/" | grep -c 'Proposta de teste aberta')" "0"
confere "envio grande demais é recusado" "$(head -c 4000 /dev/zero | tr '\0' 'a' | curl -s -o /dev/null -w '%{http_code}' -X POST --data-binary @- -H 'Content-Type: application/x-www-form-urlencoded' "$B/teste/entrar")" "413"
confere "envio em pedaços (sem Content-Length) grande demais também" "$(head -c 4000 /dev/zero | tr '\0' 'a' | curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Transfer-Encoding: chunked' --data-binary @- -H 'Content-Type: application/x-www-form-urlencoded' "$B/teste/entrar")" "413"
ULTIMO=""
for i in $(seq 1 12); do ULTIMO=$(curl -s -o /dev/null -w '%{http_code}' -X POST --data-urlencode "codigo=tentativa-$i" "$B/teste/entrar"); done
confere "tentativas demais param no limite" "$ULTIMO" "429"

echo
if [ "$FALHAS" = 0 ]; then echo "Portão no runtime da Cloudflare: tudo ok."; else echo "Portão no runtime da Cloudflare: $FALHAS falha(s)."; exit 1; fi
