#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Gera as imagens do README (docs/img) a partir do modelo do kit, com negócios e clientes INVENTADOS: nenhum dado
// real entra nelas. Rode de novo quando o visual do modelo mudar.
//
//   node ferramentas-do-repo/gerar-imagens.mjs
//
// Precisa do navegador do kit (bash skills/propostas/ferramentas/ambiente.sh) e de rede na primeira vez
// (dependências do modelo e fontes do Google). Trabalha numa pasta temporária; só escreve em docs/img.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = join(RAIZ, "skills", "propostas");
const MODELO = join(KIT, "modelo");
const DESTINO = join(RAIZ, "docs", "img");
const TMP = mkdtempSync(join(tmpdir(), "kit-imagens-"));
const { chromium } = createRequire(import.meta.url)(join(MODELO, "scripts", "navegador.cjs"));
const { montarMarca } = await import(pathToFileURL(join(KIT, "ferramentas", "aplicar-marca.mjs")).href);
const { montarWorker } = await import(pathToFileURL(join(KIT, "publicacao", "teste-worker.mjs")).href);
const passo = (t) => console.log(`\n== ${t}`);

// Três negócios inventados, para mostrar a mesma proposta com marcas diferentes. O primeiro é o principal.
const MARCAS = [
  {
    id: "indigo",
    negocio: { nome: "Estúdio Exemplo", site: "exemplo.com.br", sigla: "EXE", whatsappVisivel: "(11) 90000-0000", assinatura: { nome: "Ana Exemplo", cargo: "Sócia-diretora" } },
    cores: { marca: "#5B5BD6", destaque: null, escura: null, clara: null },
    fontes: { texto: "Manrope", titulo: "Manrope", mono: "DM Mono", serifa: "Georgia" },
  },
  {
    id: "verde",
    negocio: { nome: "Oficina Exemplo", site: "exemplo.com.br", sigla: "OFE", whatsappVisivel: "(11) 90000-0000", assinatura: { nome: "Rui Exemplo", cargo: "Diretor" } },
    cores: { marca: "#1E7F5C", destaque: "#B8E986", escura: "#0F2A21", clara: null },
    fontes: { texto: "Plus Jakarta Sans", titulo: "Plus Jakarta Sans", mono: "JetBrains Mono", serifa: "Fraunces" },
  },
  {
    id: "coral",
    negocio: { nome: "Ateliê Exemplo", site: "exemplo.com.br", sigla: "ATE", whatsappVisivel: "(11) 90000-0000", assinatura: { nome: "Bia Exemplo", cargo: "Fundadora" } },
    cores: { marca: "#E4572E", destaque: null, escura: "#2A1A14", clara: "#FBF6F1" },
    fontes: { texto: "DM Sans", titulo: "DM Sans", mono: "DM Mono", serifa: "DM Serif Display" },
  },
];
const perfilDe = (m) => ({
  versao: 1,
  negocio: { ...m.negocio, whatsapp: "5511900000000", cidade: "São Paulo/SP" },
  marca: { cores: m.cores, fontes: m.fontes, logo: null, logoClaro: null },
  comercial: { validadeDias: 14, pagamento: "Pix, boleto ou transferência", notaFiscal: true, garantiaDias: 30, sustentacao: "contratada à parte" },
  publicacao: { worker: `propostas-${m.id}`, dominio: null },
});

// 1. Modelo instalado uma vez; cada marca e cada modo numa cópia com as dependências ligadas.
passo("modelo");
const BASE = join(TMP, "base");
cpSync(MODELO, BASE, { recursive: true, filter: (o) => !/\/(node_modules|dist|\.build)(\/|$)/.test(o) });
execSync("command -v pnpm >/dev/null && pnpm install --prefer-offline --silent || npm install --no-audit --no-fund --silent", { cwd: BASE, stdio: "inherit", shell: "/bin/bash" });
execFileSync("node", [join(KIT, "ferramentas", "reactbits.mjs"), BASE], { stdio: "inherit" });

function montar(marca, modo = "ancora") {
  const pasta = join(TMP, `${marca.id}-${modo}`);
  cpSync(BASE, pasta, { recursive: true, filter: (o) => !/\/(node_modules|variantes|exemplo)(\/|$)/.test(o.slice(BASE.length)) });
  symlinkSync(join(BASE, "node_modules"), join(pasta, "node_modules"));
  if (modo !== "ancora") cpSync(join(BASE, "variantes", modo, "data.ts"), join(pasta, "src", "data.ts"));
  const perfilArq = join(TMP, `perfil-${marca.id}.json`);
  writeFileSync(perfilArq, JSON.stringify(perfilDe(marca), null, 2));
  execFileSync("node", [join(KIT, "ferramentas", "aplicar-marca.mjs"), perfilArq, pasta], { stdio: "ignore" });
  execFileSync("node", ["build.mjs"], { cwd: pasta, env: { ...process.env, KIT_ENSAIO: "1" }, stdio: "ignore" });
  const pub = JSON.parse(readFileSync(join(pasta, ".build", "publicacao.json"), "utf8"));
  return { pasta, html: join(pasta, pub.html), pub, perfilArq };
}

const browser = await chromium.launch();
async function abrir(arquivo, largura, altura, escala = 1) {
  const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala });
  await page.goto(pathToFileURL(arquivo).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3200); // o cartão do fluxo termina de entrar perto de 2,4 s
  return page;
}
// Rola até a seção (as animações de entrada e a contagem dos valores disparam ao aparecer) e espera assentar.
async function irPara(page, seletor, folga = 0) {
  await page.evaluate(([s, f]) => {
    const el = document.querySelector(s);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - f);
  }, [seletor, folga]);
  await page.waitForTimeout(3200);
}
const dataUri = (buf, tipo = "image/png") => `data:${tipo};base64,${buf.toString("base64")}`;
const FONTE = '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=DM+Mono:wght@500&display=swap" rel="stylesheet">';
async function compor(nome, largura, altura, corpo) {
  const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONTE}<style>*{box-sizing:border-box}body{margin:0;font-family:Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased}</style></head><body>${corpo}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const arq = join(DESTINO, nome);
  await page.screenshot({ path: arq, type: "jpeg", quality: 86 });
  await page.close();
  console.log(`ok ${nome} (${Math.round(statSync(arq).size / 1024)} KB)`);
}
const moldura = (img, endereco, fundo) => `
  <div style="padding:56px 64px 64px;background:${fundo}">
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 30px 70px -24px rgba(15,15,40,.35),0 0 0 1px rgba(15,15,40,.08);background:#fff">
      <div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 16px;background:#f3f3f5;border-bottom:1px solid #e4e4e8">
        <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57"></span><span style="width:12px;height:12px;border-radius:50%;background:#febc2e"></span><span style="width:12px;height:12px;border-radius:50%;background:#28c840"></span>
        <span style="margin:0 auto;padding:6px 18px;border-radius:8px;background:#fff;border:1px solid #e4e4e8;font-size:13px;color:#555;min-width:420px;text-align:center">🔒 ${endereco}</span>
      </div>
      <img src="${img}" style="display:block;width:100%">
    </div>
  </div>`;
const fone = (img, largura = 360) => `
  <div style="width:${largura + 24}px;padding:12px;border-radius:${Math.round(largura / 7.2)}px;background:#0d0d12;box-shadow:0 40px 80px -30px rgba(10,10,30,.45)">
    <img src="${img}" style="display:block;width:${largura}px;border-radius:${Math.round(largura / 8.6)}px">
  </div>`;

mkdirSync(DESTINO, { recursive: true });
const principal = MARCAS[0];
const { marca: marcaPrincipal } = montarMarca(perfilDe(principal), TMP);
const tom = marcaPrincipal.cores.tom2 || "#eef";
const ENDERECO = "propostas.exemplo.com.br/agenda-online/";

// 2. O topo da proposta, numa janela de navegador.
passo("topo da proposta");
const abaixo = montar(principal, "ancora");
let page = await abrir(abaixo.html, 1440, 900);
const topo = await page.screenshot();
await page.close();
await compor("proposta.jpg", 1568, 1064, moldura(dataUri(topo), ENDERECO, `linear-gradient(160deg, ${tom}, #ffffff)`));

// 3. O investimento com âncora acima: a opção maior ancora, a recomendada no meio já vem escolhida.
passo("investimento (âncora acima)");
const acima = montar(principal, "ancora-acima");
page = await abrir(acima.html, 1440, 1000);
await irPara(page, "#opcoes", -8);
const invest = await page.screenshot();
await page.close();
await compor("investimento.jpg", 1568, 1164, moldura(dataUri(invest), ENDERECO, `linear-gradient(200deg, ${tom}, #ffffff)`));

// 4. No celular: topo, investimento e o aceite.
passo("celular");
page = await abrir(abaixo.html, 390, 844, 2);
const cel1 = await page.screenshot();
await irPara(page, "#painel-opcao", 90);
const cel2 = await page.screenshot();
await irPara(page, "#chamada .rounded-3xl", 90);
const cel3 = await page.screenshot();
await page.close();
await compor(
  "celular.jpg",
  1400,
  940,
  `<div style="height:940px;display:flex;align-items:center;justify-content:center;gap:56px;background:linear-gradient(135deg, ${tom}, #ffffff 70%)">${[cel1, cel2, cel3].map((c) => fone(dataUri(c))).join("")}</div>`,
);

// 5. O aceite: o que acontece depois, o resumo da opção e o botão de segurar para aceitar.
passo("aceite");
page = await abrir(abaixo.html, 1440, 1000);
await irPara(page, "#chamada", -40);
const aceite = await page.screenshot();
await page.close();
await compor("aceite.jpg", 1568, 1164, moldura(dataUri(aceite), ENDERECO, `linear-gradient(160deg, ${tom}, #ffffff)`));

// 6. O link no WhatsApp (prévia) e a tela do código de acesso, montada pelo próprio portão.
passo("prévia do link e tela de acesso");
execFileSync("node", ["scripts/og.cjs"], { cwd: abaixo.pasta, stdio: "ignore" });
const og = readFileSync(join(abaixo.pasta, abaixo.pub.imagem));
const marcaPortao = {
  nome: marcaPrincipal.negocio.nome,
  inicial: marcaPrincipal.negocio.nome.charAt(0).toUpperCase(),
  site: "https://exemplo.com.br/",
  logo: null,
  favicon: marcaPrincipal.favicon,
  fontesUrl: marcaPrincipal.fontes.url,
  fonteTexto: marcaPrincipal.fontes.texto,
  fonteTitulo: marcaPrincipal.fontes.titulo,
  fonteMono: marcaPrincipal.fontes.mono,
  fonteSerifa: marcaPrincipal.fontes.serifa,
  cores: marcaPrincipal.cores,
};
const propostas = {
  [abaixo.pub.caminho]: { titulo: abaixo.pub.titulo, descricao: abaixo.pub.descricao, imagem: `/publico/og-${abaixo.pub.caminho}.jpg`, validade: abaixo.pub.validade, senhaSha256: "0".repeat(64) },
};
const workerArq = join(TMP, "worker.mjs");
writeFileSync(workerArq, montarWorker(propostas, marcaPortao));
const worker = (await import(pathToFileURL(workerArq).href)).default;
const resposta = await worker.fetch(new Request(`https://propostas.exemplo.com.br/${abaixo.pub.caminho}/`), { SEGREDO: "s".repeat(40) });
const portaoHtml = await resposta.text();
page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.route("https://propostas.exemplo.com.br/**", (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: portaoHtml }));
await page.goto(`https://propostas.exemplo.com.br/${abaixo.pub.caminho}/`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
await page.fill("#codigo", "lua-mar-sol-42");
await page.evaluate(() => document.activeElement?.blur());
const portao = await page.screenshot();
await page.close();
const balao = `
  <div style="width:470px;padding:6px;border-radius:14px;background:#fff;box-shadow:0 2px 2px rgba(0,0,0,.06),0 20px 50px -24px rgba(0,0,0,.25)">
    <div style="border-radius:10px;overflow:hidden;background:#f2f4f3">
      <img src="${dataUri(og, "image/jpeg")}" style="display:block;width:100%">
      <div style="padding:12px 14px 14px">
        <div style="font-weight:800;font-size:16px;color:#111;line-height:1.3">Proposta comercial · ${abaixo.pub.titulo}</div>
        <div style="margin-top:4px;font-size:14px;color:#555;line-height:1.4">${abaixo.pub.descricao}</div>
        <div style="margin-top:6px;font-size:13px;color:#888">propostas.exemplo.com.br</div>
      </div>
    </div>
    <div style="padding:12px 10px 6px;font-size:16px;line-height:1.5;color:#111">
      Olá, Marina! Segue a proposta da agenda online, com as três opções e o PDF:<br>
      <span style="color:#027eb5">https://${ENDERECO}</span><br><br>
      🔒 Código de acesso: <b>lua-mar-sol-42</b>
      <div style="text-align:right;font-size:12px;color:#999;margin-top:4px">10:42 ✓✓</div>
    </div>
  </div>`;
await compor(
  "link-e-codigo.jpg",
  1400,
  940,
  `<div style="height:940px;display:flex;align-items:center;justify-content:center;gap:88px;background:linear-gradient(135deg, #efeae2, ${tom})">
    ${balao}
    <div style="font-size:44px;color:#999">→</div>
    ${fone(dataUri(portao))}
  </div>`,
);

// 7. A mesma proposta com três marcas: cores, fontes e nome mudam sozinhos a partir do perfil.
passo("três marcas");
const topos = [];
for (const m of MARCAS) {
  const p = m === principal ? abaixo : montar(m, "ancora");
  page = await abrir(p.html, 1440, 900);
  topos.push({ img: await page.screenshot(), m });
  await page.close();
}
const cartao = ({ img, m }) => {
  const { marca } = montarMarca(perfilDe(m), TMP);
  const chips = [marca.cores.tinta, marca.cores.marca, marca.cores.destaque, marca.cores.fundo]
    .map((c) => `<span style="width:18px;height:18px;border-radius:50%;background:${c};box-shadow:0 0 0 1px rgba(0,0,0,.12)"></span>`)
    .join("");
  return `<figure style="margin:0;width:480px">
    <img src="${dataUri(img)}" style="display:block;width:480px;border-radius:12px;box-shadow:0 24px 50px -24px rgba(10,10,30,.4),0 0 0 1px rgba(10,10,30,.08)">
    <figcaption style="display:flex;align-items:center;gap:8px;margin-top:16px;font-size:15px;color:#333"><b style="font-weight:800">${m.negocio.nome}</b><span style="color:#888">· ${m.fontes.titulo}</span><span style="margin-left:auto;display:flex;gap:6px">${chips}</span></figcaption>
  </figure>`;
};
await compor(
  "marcas.jpg",
  1600,
  420,
  `<div style="height:420px;display:flex;align-items:center;justify-content:center;gap:32px;background:linear-gradient(180deg,#f6f6f8,#ffffff)">${topos.map(cartao).join("")}</div>`,
);

// 8. A imagem de compartilhamento do repositório (1280 x 640): é a prévia quando alguém manda o link do GitHub no
// WhatsApp. Sobe pelo GitHub, em Settings > Social preview (não há API para isso).
passo("imagem de compartilhamento");
const selos = ["Âncora de valor", "PDF igual à tela", "Aceite no WhatsApp", "Cloudflare"]
  .map((s) => `<span style="padding:9px 14px;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);font:700 16px Manrope,sans-serif">${s}</span>`)
  .join("");
await compor(
  "social.jpg",
  1280,
  640,
  `<div style="position:relative;width:1280px;height:640px;overflow:hidden;color:#fff;background:radial-gradient(760px 460px at 88% 18%, #5B5BD6 0%, transparent 62%), linear-gradient(135deg, #15152B 0%, #1E1E46 58%, #2A2A6B 100%)">
    <div style="position:absolute;left:72px;top:78px;width:560px">
      <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:99px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);font:500 14px 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#C9C9FF"><span style="width:8px;height:8px;border-radius:50%;background:#9A9AF5"></span>Skills para Claude Code e outras IAs</div>
      <h1 style="margin:28px 0 0;font:800 80px/0.94 Manrope,sans-serif;letter-spacing:-0.06em">Kit de<br>Propostas</h1>
      <p style="margin:24px 0 0;max-width:500px;font:500 24px/1.4 Manrope,sans-serif;color:#D6D6F5">Propostas que vendem, com a sua marca, num link com código de acesso.</p>
      <div style="margin-top:30px;display:flex;flex-wrap:wrap;gap:10px;max-width:540px">${selos}</div>
    </div>
    <p style="position:absolute;left:72px;bottom:44px;margin:0;font:500 14px 'DM Mono',monospace;color:#A9A9E8">github.com/dantaspaulo/kit-propostas · por Paulo Sérgio Dantas</p>
    <div style="position:absolute;left:650px;top:96px;width:740px;transform:rotate(-4deg);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.18);box-shadow:0 40px 90px -20px rgba(0,0,0,.65)">
      <div style="display:flex;align-items:center;gap:6px;height:28px;padding:0 12px;background:#f3f3f5"><span style="width:10px;height:10px;border-radius:50%;background:#ff5f57"></span><span style="width:10px;height:10px;border-radius:50%;background:#febc2e"></span><span style="width:10px;height:10px;border-radius:50%;background:#28c840"></span></div>
      <img src="${dataUri(topo)}" style="display:block;width:100%">
    </div>
    <div style="position:absolute;left:1000px;top:206px;transform:rotate(4deg)">${fone(dataUri(cel3), 230)}</div>
  </div>`,
);

// 9. O ícone do plugin (quadrado, PNG): o catálogo de plugins do Claude Code mostra na listagem. Uma proposta com o
// selo de aceite, nas cores do kit.
passo("ícone do plugin");
{
  const icone = join(RAIZ, ".claude-plugin", "icon.png");
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  const barra = (largura, cor, altura = 22, topo = 18) =>
    `<div style="margin-top:${topo}px;height:${altura}px;width:${largura}%;border-radius:${altura / 2}px;background:${cor}"></div>`;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}</style></head><body>
    <div style="width:1024px;height:1024px;display:grid;place-items:center;background:radial-gradient(620px 520px at 75% 20%, #6B6BE8 0%, transparent 65%), linear-gradient(140deg, #15152B, #2A2A6B)">
      <div style="position:relative;box-sizing:border-box;width:520px;height:640px;padding:70px 64px;border-radius:44px;background:#F7F7FC;box-shadow:0 60px 120px -30px rgba(0,0,0,.6);transform:rotate(-4deg)">
        ${barra(62, "#1E1E46", 30, 0)}${barra(88, "#D9D9F0", 22, 34)}${barra(74, "#D9D9F0")}${barra(80, "#D9D9F0")}${barra(100, "#5B5BD6", 92, 46)}
        <div style="position:absolute;right:-70px;bottom:-60px;display:grid;place-items:center;width:250px;height:250px;border:14px solid #15152B;border-radius:50%;background:#9A9AF5;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)">
          <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="#15152B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
      </div>
    </div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: icone });
  await page.close();
  console.log(`ok .claude-plugin/icon.png (${Math.round(statSync(icone).size / 1024)} KB)`);
}

await browser.close();
console.log(`\nImagens em ${DESTINO}. Pasta de trabalho: ${TMP}`);
