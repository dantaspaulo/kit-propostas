#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Grava o perfil do negócio que a entrevista montou: confere os campos, copia o logo para o espaço de trabalho,
// guarda a versão anterior do perfil (nada some) e prepara a configuração da publicação.
//
//   node gravar-perfil.mjs <rascunho.json> [--logo <arquivo>] [--logo-claro <arquivo>] [--espaco <pasta>]
//
// O rascunho tem o formato do perfil (modelo em skills/propostas/modelo/exemplo/perfil.exemplo.json).
// Sai em <espaço>/meu-negocio/perfil.json. O negocio.md (a memória em texto) é escrito pelo assistente.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_SKILL = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "propostas");
const { montarMarca } = await import(join(KIT_SKILL, "ferramentas", "aplicar-marca.mjs"));

const args = process.argv.slice(2);
const arg = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const rascunhoArq = args[0];
if (!rascunhoArq || rascunhoArq.startsWith("--")) {
  console.error("uso: node gravar-perfil.mjs <rascunho.json> [--logo <arquivo>] [--logo-claro <arquivo>] [--espaco <pasta>]");
  process.exit(2);
}
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
const cfgArq = join(casa, "config.json");
const espaco = resolve(
  (arg("--espaco") || (existsSync(cfgArq) ? JSON.parse(readFileSync(cfgArq, "utf8")).espaco : "") || "").replace(/^~(?=\/|$)/, homedir()),
);
if (!arg("--espaco") && !existsSync(cfgArq)) {
  console.error(`sem espaço de trabalho: rode antes node ${join(KIT_SKILL, "ferramentas", "preparar-espaco.mjs")} [pasta]`);
  process.exit(1);
}

const perfil = JSON.parse(readFileSync(rascunhoArq, "utf8"));
const erros = [];
const n = (perfil.negocio ??= {});
if (!n.nome?.trim()) erros.push("negocio.nome é obrigatório");
if (n.whatsapp && !/^\d{12,13}$/.test(String(n.whatsapp).replace(/\D/g, ""))) erros.push("negocio.whatsapp: só números, com 55 e DDD (ex.: 5511900000000)");
if (n.sigla && !/^[A-Z0-9]{2,8}$/.test(n.sigla)) erros.push("negocio.sigla: 2 a 8 letras maiúsculas ou números (vai na referência das propostas)");
const cores = perfil.marca?.cores ?? {};
for (const k of ["marca", "destaque", "escura", "clara"])
  if (cores[k] && !/^#[0-9a-f]{6}$/i.test(cores[k])) erros.push(`marca.cores.${k}: use #RRGGBB`);
if (!cores.marca) erros.push("marca.cores.marca é obrigatória");
if (erros.length) {
  console.error("Perfil recusado:\n- " + erros.join("\n- "));
  process.exit(1);
}
n.whatsapp = String(n.whatsapp ?? "").replace(/\D/g, "");
n.sigla ||= n.nome.normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "PRO";

const pasta = join(espaco, "meu-negocio");
mkdirSync(join(pasta, "marca"), { recursive: true });
for (const [opcao, campo, nome] of [["--logo", "logo", "logo"], ["--logo-claro", "logoClaro", "logo-claro"]]) {
  const origem = arg(opcao);
  if (!origem) continue;
  const ext = extname(origem).toLowerCase();
  if (![".svg", ".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    console.error(`${opcao}: use SVG, PNG, JPG ou WebP (veio ${ext || "sem extensão"})`);
    process.exit(1);
  }
  copyFileSync(origem, join(pasta, "marca", nome + ext));
  perfil.marca[campo] = `marca/${nome}${ext}`;
}
perfil.versao = 1;
perfil.atualizadoEm = new Date().toISOString().slice(0, 10);

const perfilArq = join(pasta, "perfil.json");
if (existsSync(perfilArq)) copyFileSync(perfilArq, join(pasta, "perfil.anterior.json"));
writeFileSync(perfilArq, JSON.stringify(perfil, null, 2) + "\n");

// Publicação: o nome do Worker nasce da sigla. O domínio próprio é opcional (precisa estar na Cloudflare).
const cfArq = join(espaco, "publicacao", "cloudflare.json");
mkdirSync(dirname(cfArq), { recursive: true });
const cf = existsSync(cfArq) ? JSON.parse(readFileSync(cfArq, "utf8")) : {};
cf.worker ||= perfil.publicacao?.worker || `propostas-${n.sigla.toLowerCase()}`;
if (perfil.publicacao?.dominio !== undefined) cf.dominio = perfil.publicacao.dominio || null;
writeFileSync(cfArq, JSON.stringify(cf, null, 2) + "\n");

const { relatorio, avisos } = montarMarca(perfil, pasta);
console.log(`ok: perfil de "${n.nome}" em ${perfilArq}`);
console.log(`    publicação: Worker "${cf.worker}"${cf.dominio ? ` no domínio ${cf.dominio}` : " (endereço workers.dev até ter domínio próprio)"}`);
console.log(`    contraste: ${relatorio.filter((r) => r.ok).length} de ${relatorio.length} pares ok`);
for (const a of avisos) console.log(`aviso: ${a}`);
if (!existsSync(join(pasta, "negocio.md"))) console.log(`falta: ${join(pasta, "negocio.md")} (a memória do negócio, em texto)`);
