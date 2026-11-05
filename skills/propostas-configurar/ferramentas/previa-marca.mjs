#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Monta a prévia da marca para a pessoa aprovar olhando: a paleta com o contraste de cada par, o topo de uma
// proposta, os botões, o selo, uma seção escura e a tela do código de acesso, tudo com as cores, as fontes e o
// logo do perfil.
//
//   node previa-marca.mjs <perfil.json> [--abrir]
//
// Grava <pasta do perfil>/marca/previa.html e previa.png. Com --abrir, abre a prévia no navegador.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_SKILL = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "propostas");
const { lerPerfil, montarMarca } = await import(join(KIT_SKILL, "ferramentas", "aplicar-marca.mjs"));

const [arquivo, opcao] = process.argv.slice(2);
if (!arquivo) {
  console.error("uso: node previa-marca.mjs <perfil.json> [--abrir]");
  process.exit(2);
}
const perfil = lerPerfil(arquivo);
const base = dirname(resolve(arquivo));
const { marca, avisos, relatorio } = montarMarca(perfil, base);
const c = marca.cores;
const f = marca.fontes;
const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const logo = (claro) =>
  claro && marca.logoClaro
    ? `<img class="logo" src="${marca.logoClaro}" alt="">`
    : marca.logo
      ? claro
        ? `<span class="chip"><img class="logo" src="${marca.logo}" alt=""></span>`
        : `<img class="logo" src="${marca.logo}" alt="">`
      : `<span class="mono">${esc(marca.negocio.nome.charAt(0).toUpperCase())}</span><b>${esc(marca.negocio.nome)}</b>`;

const nomes = {
  tinta: "Texto e botão escuro",
  fundo: "Fundo da página",
  papel: "Cartões",
  destaque: "Destaque (no escuro e nos botões)",
  destaqueForte: "Destaque no claro (títulos, bolinhas)",
  noite: "Seções escuras",
  apoio: "Texto de apoio",
  linha: "Linhas",
  tom1: "Tom de apoio 1",
  tom2: "Tom de apoio 2",
  tom3: "Tom de apoio 3",
  marca: "A cor da marca, exata",
};

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prévia da marca · ${esc(marca.negocio.nome)}</title>
<link href="${esc(f.url)}" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;background:${c.fundo};color:${c.tinta};font-family:"${f.texto}",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:40px 24px 64px}
.olho{display:flex;align-items:center;gap:8px;font:500 11px "${f.mono}",monospace;letter-spacing:.06em;text-transform:uppercase;color:${c.apoio};margin:0 0 14px}
.olho:before{content:"";width:8px;height:8px;border-radius:50%;background:${c.destaqueForte}}
.escuro .olho{color:${c.noiteApoio}}.escuro .olho:before{background:${c.destaque}}
h1,h2{font-family:"${f.titulo}",Arial,sans-serif;font-weight:800;letter-spacing:-.065em;line-height:.95;margin:0}
h1{font-size:clamp(44px,7vw,84px)}h2{font-size:clamp(34px,4.6vw,56px)}
em{font-family:"${f.serifa}",Georgia,serif;font-style:normal;font-weight:400;letter-spacing:-.04em;color:${c.destaqueForte}}
.escuro em{color:${c.destaque}}
p{color:${c.apoio};line-height:1.6;font-size:17px;max-width:640px}
.topo{display:flex;align-items:center;gap:10px;margin-bottom:44px;font-family:"${f.titulo}",Arial,sans-serif;font-size:19px;letter-spacing:-.04em}
.logo{height:36px;width:auto;max-width:220px;object-fit:contain}.chip{background:${c.papel};border-radius:10px;padding:6px 10px;display:inline-flex}
.mono{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:${c.noite};color:${c.destaque};font-weight:800}
.botoes{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:28px 0}
.btn{display:inline-flex;align-items:center;min-height:50px;padding:0 22px;border-radius:8px;font-weight:800;font-size:14px}
.btn.escuro-b{background:${c.tinta};color:${c.papel}}.btn.destaque{background:${c.destaque};color:${c.tinta}}.btn.borda{border:1px solid ${c.tinta};border-radius:99px}
.selo{display:inline-block;padding:5px 11px;border-radius:99px;font:500 11px "${f.mono}",monospace;letter-spacing:.05em;text-transform:uppercase;background:${c.destaque};color:${c.tinta}}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:22px}
.cor{border:1px solid ${c.linha};border-radius:14px;overflow:hidden;background:${c.papel}}.cor i{display:block;height:64px}.cor div{padding:10px 12px;font-size:12px}.cor b{display:block;font:500 12px "${f.mono}",monospace}
.cartoes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:28px}
.cartao{background:${c.papel};border:1px solid ${c.linha};border-radius:18px;padding:24px}
.escuro{background:${c.noite};color:${c.papel};border-radius:24px;padding:40px;margin-top:40px}.escuro p{color:${c.noiteApoio}}
table{border-collapse:collapse;margin-top:16px;font-size:14px;width:100%;max-width:760px}td{padding:8px 10px;border-bottom:1px solid ${c.linha}}
.ok{color:#1d7a3a;font-weight:700}.baixo{color:#b42318;font-weight:700}
.portao{max-width:420px;background:${c.papel};border:1px solid ${c.linha};border-radius:24px;padding:32px;box-shadow:0 24px 70px rgba(0,0,0,.1)}
.portao .campo{margin-top:16px;height:50px;border:1px solid ${c.linha};border-radius:12px}.portao .ir{margin-top:12px;height:50px;border-radius:99px;background:${c.tinta};color:${c.papel};display:grid;place-items:center;font-weight:800}
.lado{display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:start;margin-top:40px}@media(max-width:820px){.lado{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<div class="topo">${logo(false)}</div>
<p class="olho">Prévia da marca · ${esc(marca.negocio.nome)}</p>
<h1>Proposta para o seu <em>próximo cliente</em></h1>
<p>É assim que as suas propostas vão sair: fundo claro, seções escuras intercaladas, títulos fortes com um trecho em serifa e a cor da marca nos destaques.</p>
<div class="botoes"><span class="btn escuro-b">Ver o investimento</span><span class="btn destaque">Quero seguir</span><span class="btn borda">Baixar PDF</span><span class="selo">Recomendado</span></div>
<div class="cartoes"><div class="cartao"><p class="olho">Em quanto tempo</p><b>3 meses, com demonstração toda semana.</b></div><div class="cartao"><p class="olho">Com qual investimento</p><b>R$ 48.000, em 4 parcelas presas às entregas.</b></div></div>
<div class="escuro"><div class="topo">${logo(true)}</div><p class="olho">Seção escura</p><h2>Vamos colocar <em>no ar?</em></h2><p>O destaque precisa aparecer bem aqui também.</p><div class="botoes"><span class="btn destaque">Quero seguir</span></div></div>
<div class="lado"><div><p class="olho" style="margin-top:8px">As cores</p><div class="grade">${Object.entries(nomes)
  .map(([k, nome]) => `<div class="cor"><i style="background:${c[k]}"></i><div><b>${c[k]}</b>${nome}</div></div>`)
  .join("")}</div>
<p class="olho" style="margin-top:36px">Contraste (mínimo de leitura confortável)</p><table>${relatorio
  .map((r) => `<tr><td>${esc(r.par)}</td><td>${r.contraste}:1</td><td class="${r.ok ? "ok" : "baixo"}">${r.ok ? "ok" : "baixo"} (mín. ${r.minimo}:1)</td></tr>`)
  .join("")}</table>
${avisos.length ? `<p class="olho" style="margin-top:28px">Avisos</p><ul>${avisos.map((a) => `<li><p style="margin:4px 0">${esc(a)}</p></li>`).join("")}</ul>` : ""}
</div><div><p class="olho" style="margin-top:8px">Tela do código de acesso</p><div class="portao"><div class="topo" style="margin-bottom:24px">${logo(false)}</div><p class="olho">Proposta protegida</p><h2 style="font-size:28px">Proposta comercial<br><em>Nome do projeto</em></h2><div class="campo"></div><div class="ir">Abrir proposta</div></div>
<p style="font-size:13px;margin-top:18px">Fontes: ${esc(f.texto)} (texto), ${esc(f.titulo)} (títulos), ${esc(f.mono)} (rótulos) e ${esc(f.serifa)} (destaque em serifa).</p></div></div>
</div></body></html>`;

const pasta = join(base, "marca");
mkdirSync(pasta, { recursive: true });
const arqHtml = join(pasta, "previa.html");
writeFileSync(arqHtml, html);

// A imagem é para o assistente olhar; quem decide é a pessoa, na prévia aberta no navegador.
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
try {
  const { chromium } = createRequire(join(casa, "runtime", "noop.js"))("playwright-core");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto("file://" + arqHtml);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  await p.screenshot({ path: join(pasta, "previa.png"), fullPage: true });
  await b.close();
} catch (e) {
  console.log(`(sem a imagem da prévia: ${String(e.message || e).split("\n")[0]})`);
}

console.log(`ok: prévia em ${arqHtml}${relatorio.every((r) => r.ok) ? "" : " (há contraste baixo: veja os avisos)"}`);
for (const a of avisos) console.log(`aviso: ${a}`);
if (opcao === "--abrir") {
  const abrir = platform() === "darwin" ? "open" : platform() === "win32" ? "explorer" : "xdg-open";
  try {
    execFileSync(abrir, [arqHtml], { stdio: "ignore" });
  } catch {}
}
