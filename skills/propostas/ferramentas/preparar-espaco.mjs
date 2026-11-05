#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Cria (ou confere) o espaço de trabalho das propostas e grava onde ele fica em ~/.kit-propostas/config.json.
//
//   node preparar-espaco.mjs [<pasta>]        padrão: ~/Propostas
//
// O espaço fica assim:
//   <pasta>/meu-negocio/      perfil.json, negocio.md e marca/ (logo): o que a entrevista descobriu
//   <pasta>/publicacao/       propostas.json (o que está no ar) e cloudflare.json (nome do Worker, domínio)
//   <pasta>/<proposta>/       uma pasta por proposta, aberta pelo nova-proposta.sh
// Nada aqui apaga o que já existe.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
const pasta = resolve((process.argv[2] || join(homedir(), "Propostas")).replace(/^~(?=\/|$)/, homedir()));

const escrever = (arq, conteudo) => {
  if (existsSync(arq)) return false;
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(arq, conteudo);
  return true;
};

mkdirSync(join(pasta, "meu-negocio", "marca"), { recursive: true });
mkdirSync(join(pasta, "publicacao"), { recursive: true });
const criados = [
  escrever(
    join(pasta, "publicacao", "propostas.json"),
    JSON.stringify(
      {
        _leia: "Propostas no ar. Uma publicação substitui o site inteiro: toda proposta que deve continuar no ar precisa estar aqui. Para tirar uma do ar, remova a entrada e publique de novo.",
        propostas: {},
      },
      null,
      2,
    ) + "\n",
  ) && "publicacao/propostas.json",
  escrever(
    join(pasta, ".gitignore"),
    ["node_modules/", ".build/", "publicacao/saida/", ".DS_Store", "*.env", ".env*", ""].join("\n"),
  ) && ".gitignore",
  escrever(
    join(pasta, "LEIA-ME.md"),
    `# Propostas

Espaço de trabalho do [Kit de Propostas](https://github.com/dantaspaulo/kit-propostas).

- \`meu-negocio/\`: o perfil do negócio e a marca, feitos na entrevista (\`/propostas-configurar\` refaz).
- \`publicacao/\`: o que está no ar (\`propostas.json\`) e a configuração da Cloudflare (\`cloudflare.json\`).
- Cada outra pasta é uma proposta. O conteúdo está em \`src/data.ts\`; a página e o PDF, em \`dist/\`.

Os códigos de acesso não ficam em arquivo nenhum: só o hash deles, em \`<proposta>/.build/\`, fora do git.
Se este espaço for para o GitHub, que seja num repositório PRIVADO: as propostas têm valores e dados de clientes.
`,
  ) && "LEIA-ME.md",
].filter(Boolean);

mkdirSync(casa, { recursive: true });
const cfgArq = join(casa, "config.json");
const anterior = existsSync(cfgArq) ? JSON.parse(readFileSync(cfgArq, "utf8")) : {};
const espaco = pasta.startsWith(homedir() + "/") ? "~" + pasta.slice(homedir().length) : pasta;
writeFileSync(cfgArq, JSON.stringify({ ...anterior, espaco, kit: KIT, atualizadoEm: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");

console.log(`ok: espaço de trabalho em ${pasta}${criados.length ? ` (criado: ${criados.join(", ")})` : " (já existia, nada mudou)"}`);
console.log(`    ${cfgArq} aponta para ele`);
