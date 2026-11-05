#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Liga ou desliga a memória do negócio em TODAS as conversas do Claude Code: põe (ou tira) no ~/.claude/CLAUDE.md
// um bloco que importa o <espaço>/meu-negocio/negocio.md. Só com o sim da pessoa.
//
//   node lembrar-negocio.mjs --ligar      acrescenta o bloco (se já existir, só atualiza o caminho)
//   node lembrar-negocio.mjs --desligar   tira o bloco; o resto do arquivo fica como estava
//   node lembrar-negocio.mjs --ver        diz se está ligado
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const INICIO = "<!-- kit-propostas: início (memória do negócio; para tirar, rode a entrevista ou o desinstalar.sh) -->";
const FIM = "<!-- kit-propostas: fim -->";
const claudeDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const arq = join(claudeDir, "CLAUDE.md");
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
const acao = process.argv[2];

const atual = existsSync(arq) ? readFileSync(arq, "utf8") : "";
const re = new RegExp(`\\n?${INICIO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${FIM.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`);

if (acao === "--ver") {
  console.log(re.test(atual) ? `ligado em ${arq}` : "desligado");
  process.exit(0);
}
if (acao !== "--ligar" && acao !== "--desligar") {
  console.error("uso: node lembrar-negocio.mjs --ligar | --desligar | --ver");
  process.exit(2);
}
if (acao === "--desligar") {
  if (!re.test(atual)) {
    console.log("já estava desligado: nada mudou");
    process.exit(0);
  }
  copyFileSync(arq, arq + ".antes-do-kit-propostas");
  writeFileSync(arq, atual.replace(re, "\n"));
  console.log(`ok: memória do negócio desligada (cópia de antes em ${arq}.antes-do-kit-propostas)`);
  process.exit(0);
}

const cfg = JSON.parse(readFileSync(join(casa, "config.json"), "utf8"));
const negocio = `${cfg.espaco.replace(/\/$/, "")}/meu-negocio/negocio.md`;
const bloco = `${INICIO}\n## Meu negócio\n\nQuando o assunto for o meu negócio, os meus clientes ou as minhas propostas, use isto:\n\n@${negocio}\n${FIM}\n`;
mkdirSync(dirname(arq), { recursive: true });
if (existsSync(arq)) copyFileSync(arq, arq + ".antes-do-kit-propostas");
const novo = re.test(atual) ? atual.replace(re, "\n" + bloco) : `${atual.replace(/\n*$/, "")}${atual ? "\n\n" : ""}${bloco}`;
writeFileSync(arq, novo);
console.log(`ok: memória do negócio ligada em ${arq} (importa ${negocio})`);
