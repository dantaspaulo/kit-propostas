#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Baixa os componentes GRATUITOS do React Bits que a proposta usa (lista em <pasta>/reactbits.json), do registro
// oficial (reactbits.dev), para <pasta>/src/components/reactbits/. O kit não leva o código deles: a licença do
// React Bits (MIT + Commons Clause) deixa usar em qualquer site, inclusive comercial, mas não redistribuir os
// componentes, nem de graça. Então cada pessoa baixa da fonte, como faria com uma biblioteca.
//
//   node reactbits.mjs <pasta-da-proposta>              usa a cópia guardada neste computador, ou baixa
//   node reactbits.mjs <pasta-da-proposta> --atualizar  baixa de novo a versão mais nova de cada um
//
// A cópia guardada (~/.kit-propostas/reactbits) faz as propostas deste computador usarem a mesma versão e
// dispensa a rede da segunda vez em diante.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REGISTRO = "https://reactbits.dev/r";
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
const GUARDADOS = join(casa, "reactbits");

async function baixar(nome) {
  const r = await fetch(`${REGISTRO}/${nome}-TS-TW.json`, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${nome}: o registro do React Bits respondeu ${r.status}`);
  const item = await r.json();
  const arquivo = (item.files || []).find((f) => f.path.endsWith(`/${nome}.tsx`));
  if (!arquivo?.content) throw new Error(`${nome}: o registro não trouxe o arquivo ${nome}.tsx`);
  if ((item.dependencies || []).length)
    throw new Error(`${nome}: passou a depender de ${item.dependencies.join(", ")}; o kit precisa ser atualizado para ele`);
  return arquivo.content;
}

// O componente só pode importar o React: qualquer outra coisa quebraria o build sem explicação.
function conferir(nome, codigo) {
  const externos = [...codigo.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((m) => m !== "react");
  if (externos.length) throw new Error(`${nome}: importa ${[...new Set(externos)].join(", ")}; o kit espera só o React`);
  if (!/export default/.test(codigo)) throw new Error(`${nome}: o arquivo não tem export default`);
}

export async function prepararReactBits(pasta, { atualizar = false } = {}) {
  const raiz = resolve(pasta);
  const lista = JSON.parse(readFileSync(join(raiz, "reactbits.json"), "utf8")).componentes;
  const destino = join(raiz, "src", "components", "reactbits");
  mkdirSync(destino, { recursive: true });
  mkdirSync(GUARDADOS, { recursive: true });
  const versoes = {};
  for (const nome of lista) {
    if (!/^[A-Za-z0-9]+$/.test(nome)) throw new Error(`nome de componente inválido no reactbits.json: ${nome}`);
    const guardado = join(GUARDADOS, `${nome}.tsx`);
    let codigo = !atualizar && existsSync(guardado) ? readFileSync(guardado, "utf8") : null;
    if (!codigo) {
      codigo = await baixar(nome);
      conferir(nome, codigo);
      writeFileSync(guardado, codigo);
    }
    conferir(nome, codigo);
    writeFileSync(join(destino, `${nome}.tsx`), codigo);
    versoes[nome] = createHash("sha256").update(codigo).digest("hex").slice(0, 16);
  }
  writeFileSync(
    join(destino, "ORIGEM.md"),
    [
      "# Componentes gratuitos do React Bits",
      "",
      "Baixados do registro oficial (https://reactbits.dev), de David Haz, pelo Kit de Propostas. Licença MIT +",
      "Commons Clause: use à vontade em sites e produtos, inclusive comerciais, mas não redistribua o código destes",
      "componentes (não suba esta pasta para um repositório público).",
      "",
      ...Object.entries(versoes).map(([n, h]) => `- ${n}: ${h}`),
      "",
    ].join("\n"),
  );
  return versoes;
}

// Chamado direto, inclusive pelo atalho da instalação (~/.claude/skills): o caminho real decide. Importado por
// outro script (ou lido da entrada padrão), não roda.
function chamadoDireto() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}
if (chamadoDireto()) {
  const [pasta, opcao] = process.argv.slice(2);
  if (!pasta || !existsSync(join(resolve(pasta), "reactbits.json"))) {
    console.error("uso: node reactbits.mjs <pasta-da-proposta> [--atualizar]   (a pasta precisa ter o reactbits.json)");
    process.exit(2);
  }
  try {
    const versoes = await prepararReactBits(pasta, { atualizar: opcao === "--atualizar" });
    console.log(`ok: ${Object.keys(versoes).length} componentes gratuitos do React Bits em ${join(pasta, "src/components/reactbits")}`);
  } catch (e) {
    console.error(`Não consegui preparar os componentes do React Bits: ${e.message}`);
    console.error("Sem rede na primeira vez não dá: o kit baixa os componentes do site oficial do React Bits.");
    process.exit(1);
  }
}
