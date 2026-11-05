#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// A trava de autoria. A licença (LICENSE, cláusulas 1 e 3) pede manter os avisos de autoria: o nome do autor, o
// endereço do repositório oficial, a impressão da obra e a linha de crédito no topo dos arquivos. As ferramentas do
// kit (instalar, abrir proposta, entrevista, publicar) chamam esta conferência e param se os créditos foram trocados.
//
// Os créditos esperados ficam guardados como impressão digital (SHA-256), não como texto: trocar o nome ou o
// endereço com um "localizar e substituir" no kit inteiro não engana a trava.
//
//   node autoria.mjs --conferir [pasta do kit]   confere os créditos (padrão: o kit onde este arquivo está)
//   node autoria.mjs --gerar                     refaz o AUTORIA.json (a lista de arquivos e a impressão de cada um)
//
// As propostas que você gera são suas: nada aqui olha a página, o PDF ou a imagem da prévia.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const impressao = (t) => createHash("sha256").update(t).digest("base64url");
// Em base64url, não em hexadecimal: a trava do repositório recusa sequência hexadecimal longa (parece segredo).
const impressaoDoArquivo = (arq) => createHash("sha256").update(readFileSync(arq)).digest("base64url");
const ESPERADO = {
  linha: "1MLydxsc25vZEGZxrXEh7pt1-c14c03zEV2san2ZRq4",
  autor: "0cRJLwlij3fGL5wZ1PA97GzHZVrPyojsv7-SO8Ru8Ac",
  repositorio: "2GQe5GrpgxhMKar3Tyqmato_oV7UwiPQVSawn2ZbERw",
  obra: "a-yuoRghRiZX75a8V3UxDng9J4d4UPEMaEMWaWFZuQE",
};
const KIT_PADRAO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// Conferidos sempre, mesmo que o AUTORIA.json some ou seja editado.
const NUCLEO = [
  "LICENSE",
  "NOTICE.md",
  "README.md",
  "instalar.sh",
  "skills/propostas/SKILL.md",
  "skills/propostas-configurar/SKILL.md",
  "skills/propostas/ferramentas/autoria.mjs",
  "skills/propostas/ferramentas/nova-proposta.sh",
  "skills/propostas/modelo/build.mjs",
  "skills/propostas/publicacao/publicar.mjs",
  "skills/propostas/publicacao/_worker.template.js",
  "skills/propostas-configurar/ferramentas/gravar-perfil.mjs",
];
// Sem linha de crédito de propósito: dados, configuração e imagens (o JSON não aceita comentário).
const SEM_LINHA = /(\.json|\.jpg|\.png|\.gitignore|marca\.css)$/;

/** A linha de crédito do arquivo, do jeito que estiver escrita (ou "" se não houver). */
function linhaDeCredito(texto) {
  const m = texto.match(/Kit de Propostas · [^\n]*?KPR-[A-Z]+-\d{4}/);
  return m ? m[0] : "";
}

function campo(texto, nome) {
  const m = texto.match(new RegExp(`^\\s*${nome}:\\s*(.+?)\\s*$`, "m"));
  return m ? m[1] : "";
}

/** Lista o que está errado nos créditos do kit em <raiz>. Vazio: tudo certo. */
export function conferirAutoria(raiz = KIT_PADRAO) {
  const problemas = [];
  const ler = (rel) => {
    const arq = join(raiz, rel);
    return existsSync(arq) ? readFileSync(arq, "utf8") : null;
  };
  let manifesto = null;
  const textoManifesto = ler("AUTORIA.json");
  if (textoManifesto === null) problemas.push("AUTORIA.json: o manifesto de autoria sumiu");
  else {
    try {
      manifesto = JSON.parse(textoManifesto);
    } catch {
      problemas.push("AUTORIA.json: o manifesto de autoria não é um JSON válido");
    }
  }
  if (manifesto) {
    if (impressao(manifesto.autor ?? "") !== ESPERADO.autor) problemas.push("AUTORIA.json: o autor foi trocado");
    if (impressao(manifesto.repositorio ?? "") !== ESPERADO.repositorio) problemas.push("AUTORIA.json: o repositório foi trocado");
    if (impressao(manifesto.impressao ?? "") !== ESPERADO.obra) problemas.push("AUTORIA.json: a impressão da obra foi trocada");
  }

  const arquivos = new Set([...NUCLEO, ...Object.keys(manifesto?.arquivos ?? {}).filter((rel) => !SEM_LINHA.test(rel))]);
  for (const rel of arquivos) {
    const texto = ler(rel);
    if (texto === null) {
      if (NUCLEO.includes(rel)) problemas.push(`${rel}: o arquivo sumiu`);
      continue;
    }
    const linha = linhaDeCredito(texto);
    if (!linha) problemas.push(`${rel}: a linha de crédito foi retirada`);
    else if (impressao(linha) !== ESPERADO.linha) problemas.push(`${rel}: a linha de crédito foi alterada`);
  }

  for (const rel of ["skills/propostas/SKILL.md", "skills/propostas-configurar/SKILL.md"]) {
    const texto = ler(rel);
    if (texto === null) continue;
    if (impressao(campo(texto, "author")) !== ESPERADO.autor) problemas.push(`${rel}: o autor nos metadados foi trocado`);
    if (impressao(campo(texto, "repository")) !== ESPERADO.repositorio) problemas.push(`${rel}: o repositório nos metadados foi trocado`);
    if (impressao(campo(texto, "fingerprint")) !== ESPERADO.obra) problemas.push(`${rel}: a impressão nos metadados foi trocada`);
  }

  const plugin = ler(".claude-plugin/plugin.json");
  if (plugin) {
    try {
      const p = JSON.parse(plugin);
      if (impressao(p.author?.name ?? "") !== ESPERADO.autor) problemas.push(".claude-plugin/plugin.json: o autor foi trocado");
      if (impressao(p.repository ?? "") !== ESPERADO.repositorio) problemas.push(".claude-plugin/plugin.json: o repositório foi trocado");
    } catch {
      problemas.push(".claude-plugin/plugin.json: não é um JSON válido");
    }
  }
  return problemas;
}

/** Quantos arquivos diferem da versão oficial registrada no AUTORIA.json (só informa, não trava). */
export function diferencas(raiz = KIT_PADRAO) {
  const arq = join(raiz, "AUTORIA.json");
  if (!existsSync(arq)) return null;
  const { arquivos = {} } = JSON.parse(readFileSync(arq, "utf8"));
  return Object.entries(arquivos).filter(([rel, h]) => {
    const alvo = join(raiz, rel);
    return !existsSync(alvo) || impressaoDoArquivo(alvo) !== h;
  }).length;
}

export const MENSAGEM = [
  "Trava de autoria: os créditos do Kit de Propostas foram trocados ou retirados.",
  "A licença deixa usar e modificar o kit de graça, desde que os avisos de autoria fiquem intactos: o nome de",
  "Paulo Sérgio Dantas, o endereço https://github.com/dantaspaulo/kit-propostas, a impressão KPR-PSD-2026 e a linha de",
  "crédito no topo dos arquivos (LICENSE, cláusulas 1 e 3). Restaure os créditos ou reinstale o kit oficial:",
  "  curl -fsSL https://raw.githubusercontent.com/dantaspaulo/kit-propostas/main/instalar.sh | bash",
].join("\n");

/** Para as ferramentas do kit: confere e, se os créditos foram trocados, para com a explicação. */
export function exigirAutoria(raiz = KIT_PADRAO) {
  const problemas = conferirAutoria(raiz);
  if (!problemas.length) return;
  console.error(`${MENSAGEM}\n\nO que foi achado:\n- ${problemas.slice(0, 12).join("\n- ")}`);
  process.exit(3);
}

function gerar(raiz) {
  const versionados = execFileSync("git", ["-C", raiz, "ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" }).split("\n").filter(Boolean);
  const arquivos = {};
  for (const rel of versionados.filter((r) => r !== "AUTORIA.json").sort())
    arquivos[rel] = impressaoDoArquivo(join(raiz, rel));
  const plugin = JSON.parse(readFileSync(join(raiz, ".claude-plugin", "plugin.json"), "utf8"));
  const manifesto = {
    _leia: "Manifesto de autoria do Kit de Propostas. A licença (LICENSE) pede manter os avisos de autoria; as ferramentas do kit conferem e param se eles forem trocados. A impressão de cada arquivo é a da versão oficial abaixo: serve para conferir se uma cópia foi modificada.",
    obra: "Kit de Propostas",
    autor: "Paulo Sérgio Dantas",
    repositorio: "https://github.com/dantaspaulo/kit-propostas",
    impressao: "KPR-PSD-2026",
    licenca: "Licença de Uso com Atribuição v1.0",
    versao: plugin.version,
    arquivos,
  };
  writeFileSync(join(raiz, "AUTORIA.json"), JSON.stringify(manifesto, null, 2) + "\n");
  console.log(`ok: AUTORIA.json com ${Object.keys(arquivos).length} arquivos (versão ${plugin.version})`);
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
  const [opcao, pasta] = process.argv.slice(2);
  const raiz = resolve(pasta || KIT_PADRAO);
  if (opcao === "--gerar") gerar(raiz);
  else if (opcao === "--conferir") {
    exigirAutoria(raiz);
    const mudados = diferencas(raiz);
    console.log(`ok: créditos do Kit de Propostas intactos${mudados ? ` (${mudados} arquivo(s) diferem da versão oficial)` : ""}`);
  } else {
    console.error("uso: node autoria.mjs --conferir [pasta do kit]   ou   node autoria.mjs --gerar");
    process.exit(2);
  }
}
