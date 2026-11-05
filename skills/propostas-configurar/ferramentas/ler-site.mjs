#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Lê o site do negócio com um navegador sem tela e junta o que a entrevista precisa: textos das páginas
// principais, contatos, cores que o site usa de verdade (medidas na tela, não adivinhadas), fontes e candidatos
// a logo. Só lê: não preenche formulário, não faz login, não guarda cookie.
//
//   node ler-site.mjs <endereço do site> <pasta de saída>
//
// Sai em <pasta>: site.json (tudo), site.png (o topo do site), logos/ (candidatos) e logos.png (folha com os
// candidatos lado a lado, para escolher olhando).
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
function carregar(nome) {
  for (const base of [process.cwd(), join(casa, "runtime")]) {
    try {
      return createRequire(join(base, "noop.js"))(nome);
    } catch {}
  }
  console.error(`${nome} não encontrado: prepare o ambiente (bash <kit>/skills/propostas/ferramentas/ambiente.sh)`);
  process.exit(2);
}

const [entrada, saidaArg] = process.argv.slice(2);
if (!entrada || !saidaArg) {
  console.error("uso: node ler-site.mjs <endereço do site> <pasta de saída>");
  process.exit(2);
}
const inicio = new URL(/^https?:\/\//.test(entrada) ? entrada : `https://${entrada}`);
const SAIDA = resolve(saidaArg);
mkdirSync(join(SAIDA, "logos"), { recursive: true });
const { chromium } = carregar("playwright-core");

const LIMITE_TEXTO = 7000;
const PAGINAS_EXTRAS = /sobre|quem-somos|quem|empresa|servi|solu|produt|cases|portf|clientes|contato|about|services/i;

async function lerPagina(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
  return page.evaluate(
    ({ limite }) => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || "";
      const texto = (document.body?.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
      const links = [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, texto: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 80) }));
      return {
        url: location.href,
        titulo: document.title,
        descricao: meta('meta[name="description"]') || meta('meta[property="og:description"]'),
        ogTitulo: meta('meta[property="og:title"]'),
        ogImagem: meta('meta[property="og:image"]'),
        siteNome: meta('meta[property="og:site_name"]'),
        corTema: meta('meta[name="theme-color"]'),
        idioma: document.documentElement.lang,
        titulos: [...document.querySelectorAll("h1,h2,h3")].map((h) => h.innerText.trim()).filter(Boolean).slice(0, 40),
        texto: texto.slice(0, limite),
        links,
      };
    },
    { limite: LIMITE_TEXTO },
  );
}

// Cores medidas na tela: de cada elemento visível, o fundo (pesado pela área), o texto e a borda dos botões.
function medirCores() {
  const paraHex = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) return null;
    return "#" + [m[1], m[2], m[3]].map((v) => Math.round(Number(v)).toString(16).padStart(2, "0")).join("");
  };
  const pesos = {};
  const somar = (hex, peso, papel) => {
    if (!hex) return;
    pesos[hex] ??= { hex, peso: 0, papeis: {} };
    pesos[hex].peso += peso;
    pesos[hex].papeis[papel] = (pesos[hex].papeis[papel] || 0) + peso;
  };
  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.3;
  };
  const botoes = new Set(document.querySelectorAll('button, [role="button"], input[type="submit"], a[class*="btn" i], a[class*="button" i], a[class*="cta" i]'));
  for (const el of document.querySelectorAll("body, body *")) {
    if (!visivel(el)) continue;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const area = Math.min(r.width * r.height, 1440 * 900) / 10000;
    const fundo = paraHex(s.backgroundColor);
    if (fundo) somar(fundo, botoes.has(el) ? area * 6 + 20 : area, botoes.has(el) ? "botao" : "fundo");
    const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (temTexto) somar(paraHex(s.color), el.matches("h1,h2,h3,a,strong") ? 4 : 1, el.matches("a") ? "link" : el.matches("h1,h2,h3") ? "titulo" : "texto");
    if (botoes.has(el)) somar(paraHex(s.borderTopColor), 3, "borda-botao");
  }
  const variaveis = {};
  for (const folha of document.styleSheets) {
    let regras;
    try {
      regras = folha.cssRules;
    } catch {
      continue;
    }
    for (const regra of regras || []) {
      if (!regra.selectorText || !/^(:root|html|body)$/.test(regra.selectorText.trim())) continue;
      for (const nome of regra.style) {
        if (nome.startsWith("--") && /primary|brand|accent|main|marca|destaque|secondary|cor-|color-/i.test(nome))
          variaveis[nome] = regra.style.getPropertyValue(nome).trim();
      }
    }
  }
  const fonte = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim() : "";
  };
  const googleFonts = [...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].flatMap((l) =>
    [...l.href.matchAll(/family=([^:&]+)/g)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, " ")),
  );
  return {
    cores: Object.values(pesos).sort((a, b) => b.peso - a.peso).slice(0, 24),
    variaveis,
    fontes: { texto: fonte("body"), titulos: fonte("h1") || fonte("h2"), googleFonts: [...new Set(googleFonts)] },
  };
}

// Candidatos a logo, do mais provável para o menos. O link para a página inicial no topo costuma ser o logo
// (imagem, desenho ou texto com CSS) e fica marcado para o recorte. Faixa com várias imagens juntas costuma ser de
// clientes ou parceiros: vai para o fim, com aviso.
function candidatosDeLogo() {
  const vistos = new Set();
  const lista = [];
  const add = (src, origem, peso, el) => {
    if (!src || vistos.has(src)) return;
    vistos.add(src);
    const r = el?.getBoundingClientRect?.();
    lista.push({ src, origem, peso, largura: r ? Math.round(r.width) : null, altura: r ? Math.round(r.height) : null });
  };
  const ehLogo = (el) => /logo|marca|brand/i.test(`${el.className?.baseVal ?? el.className} ${el.id} ${el.getAttribute("alt") || ""} ${el.getAttribute("src") || ""}`);
  const naFaixa = (el) => {
    for (let p = el.parentElement, i = 0; p && i < 4; p = p.parentElement, i++) if (p.querySelectorAll("img").length >= 4) return true;
    return false;
  };
  const ehInicio = (a) => {
    if (/in[ií]cio|home|p[aá]gina inicial/i.test(a.getAttribute("aria-label") || "")) return true;
    try {
      const u = new URL(a.getAttribute("href") || "", location.href);
      return u.origin === location.origin && (u.pathname === "/" || u.pathname === location.pathname) && /^(#(top|topo|inicio|home)?)?$/i.test(u.hash);
    } catch {
      return false;
    }
  };
  const inicio = [...document.querySelectorAll("a[href]")].find((a) => {
    const r = a.getBoundingClientRect();
    return r.top < 200 && r.width > 0 && r.height > 0 && ehInicio(a);
  });
  inicio?.setAttribute("data-kit-logo", "");

  for (const img of inicio?.querySelectorAll("img") ?? []) add(img.currentSrc || img.src, "imagem do logo no cabeçalho", 9, img);
  let naFaixaJa = 0;
  for (const img of document.querySelectorAll("img")) {
    if (lista.length >= 12) break;
    const src = img.currentSrc || img.src;
    if (naFaixa(img)) {
      if (naFaixaJa++ < 3) add(src, "faixa de logos (costuma ser de clientes ou parceiros)", 1, img);
    } else if (img.closest("header, nav")) add(src, "imagem no cabeçalho", 6, img);
    else if (ehLogo(img)) add(src, "imagem marcada como logo", 4, img);
  }
  const svgs = [...new Set([...(inicio?.querySelectorAll("svg") ?? []), ...document.querySelectorAll("header svg, nav svg")])];
  let desenhos = 0;
  for (const s of svgs) {
    const dentro = Boolean(inicio?.contains(s));
    const r = s.getBoundingClientRect();
    if ((!dentro && !ehLogo(s)) || r.width < 12 || r.height < 12 || desenhos >= 3) continue;
    desenhos++;
    const clone = s.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const cor = getComputedStyle(s).color;
    lista.push({
      svg: clone.outerHTML.replace(/currentColor/g, cor),
      origem: dentro ? "desenho (SVG) do logo no cabeçalho" : "desenho (SVG) marcado como logo",
      peso: dentro ? 9 : 4,
      largura: Math.round(r.width),
      altura: Math.round(r.height),
    });
  }
  for (const l of document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')) add(l.href, "ícone do site", /apple/.test(l.rel) ? 5 : 3, null);
  lista.sort((a, b) => b.peso - a.peso);
  return { lista: lista.slice(0, 9), inicio: Boolean(inicio) };
}

const browser = await chromium.launch();
// Densidade 2 para o recorte do logo sair nítido; as capturas de página saem em escala 1 (scale: "css").
const contexto = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "pt-BR", deviceScaleFactor: 2 });
const page = await contexto.newPage();
const resultado = { lidoEm: new Date().toISOString(), endereco: inicio.href, paginas: [], erros: [] };
try {
  const principal = await lerPagina(page, inicio.href);
  await page.screenshot({ path: join(SAIDA, "site.png"), scale: "css" });
  const medidas = await page.evaluate(medirCores);
  const { lista: logos, inicio: temInicio } = await page.evaluate(candidatosDeLogo);

  // O logo como aparece no cabeçalho: recorte do link da página inicial, sem os fundos em volta. Pega logo feito de
  // imagem, de desenho ou de texto com CSS. Grande demais para ser logo (o link envolve o cabeçalho todo): fica de fora.
  let recorte = null;
  if (temInicio) {
    try {
      const alvo = page.locator("[data-kit-logo]").first();
      const caixa = await alvo.boundingBox();
      if (caixa && caixa.width <= 600 && caixa.height <= 200) {
        // Some tudo que não é o logo (fundos, texturas, camadas fixas por cima); o logo fica com as cores dele.
        await page.addStyleTag({
          content: `*:not([data-kit-logo], [data-kit-logo] *) { visibility: hidden !important; background-color: transparent !important; background-image: none !important; backdrop-filter: none !important; box-shadow: none !important; }
            [data-kit-logo], [data-kit-logo] * { visibility: visible !important; }
            html, body { background: transparent !important; }`,
        });
        await alvo.screenshot({ path: join(SAIDA, "logos", "logo-cabecalho.png"), omitBackground: true, timeout: 10000 });
        recorte = { arquivo: "logos/logo-cabecalho.png", origem: "o logo como aparece no cabeçalho (recorte)", largura: Math.round(caixa.width), altura: Math.round(caixa.height), endereco: null };
      }
    } catch (e) {
      resultado.erros.push(`recorte do logo: ${String(e.message || e).split("\n")[0]}`);
    }
  }
  resultado.paginas.push({ ...principal, links: undefined });
  resultado.cores = medidas.cores;
  resultado.variaveisDeCor = medidas.variaveis;
  resultado.fontes = medidas.fontes;
  resultado.corTema = principal.corTema;

  // Contatos: links de WhatsApp, telefone e e-mail, CNPJ, CEP e redes no texto e nos links.
  const todosLinks = principal.links.map((l) => l.href);
  const texto = principal.texto;
  resultado.contatos = {
    whatsapp: [...new Set(todosLinks.filter((h) => /wa\.me|api\.whatsapp|whatsapp\.com\/send/i.test(h)).map((h) => (h.match(/(?:wa\.me\/|phone=)(\d{10,13})/) || [])[1]).filter(Boolean))],
    telefones: [...new Set(todosLinks.filter((h) => h.startsWith("tel:")).map((h) => h.slice(4)))],
    emails: [...new Set([...todosLinks.filter((h) => h.startsWith("mailto:")).map((h) => h.slice(7).split("?")[0]), ...(texto.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])])],
    cnpj: [...new Set(texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || [])],
    cep: [...new Set(texto.match(/\b\d{5}-\d{3}\b/g) || [])],
    redes: [...new Set(todosLinks.filter((h) => /instagram\.com|linkedin\.com|facebook\.com|youtube\.com|tiktok\.com/i.test(h)))],
  };

  // Até 4 páginas internas que costumam dizer o que o negócio faz.
  const extras = [...new Map(principal.links.filter((l) => {
    try {
      const u = new URL(l.href);
      return u.host === inicio.host && PAGINAS_EXTRAS.test(u.pathname + " " + l.texto) && u.pathname !== inicio.pathname;
    } catch {
      return false;
    }
  }).map((l) => [new URL(l.href).pathname, l.href])).values()].slice(0, 4);
  for (const url of extras) {
    try {
      const p = await lerPagina(page, url);
      resultado.paginas.push({ ...p, links: undefined, texto: p.texto.slice(0, 3500) });
    } catch (e) {
      resultado.erros.push(`${url}: ${String(e.message || e).split("\n")[0]}`);
    }
  }

  // Candidatos a logo: baixa, mede as cores de cada um e monta a folha para escolher olhando.
  resultado.logos = recorte ? [recorte] : [];
  for (const [i, l] of logos.entries()) {
    try {
      let arquivo;
      if (l.svg) {
        arquivo = `logo-${i + 1}.svg`;
        writeFileSync(join(SAIDA, "logos", arquivo), l.svg);
      } else {
        const r = await contexto.request.get(l.src, { timeout: 15000 });
        if (!r.ok()) continue;
        const tipo = r.headers()["content-type"] || "";
        const ext = /svg/.test(tipo) ? "svg" : /png/.test(tipo) ? "png" : /jpe?g/.test(tipo) ? "jpg" : /webp/.test(tipo) ? "webp" : /icon|ico/.test(tipo) ? "ico" : null;
        if (!ext) continue;
        arquivo = `logo-${i + 1}.${ext}`;
        writeFileSync(join(SAIDA, "logos", arquivo), await r.body());
      }
      resultado.logos.push({ arquivo: `logos/${arquivo}`, origem: l.origem, largura: l.largura, altura: l.altura, endereco: l.src || null });
    } catch (e) {
      resultado.erros.push(`logo ${i + 1}: ${String(e.message || e).split("\n")[0]}`);
    }
  }
  if (resultado.logos.length) {
    const folha = await contexto.newPage();
    await folha.setViewportSize({ width: 1200, height: 260 * Math.ceil(resultado.logos.length / 3) + 40 });
    const { readFileSync } = await import("node:fs");
    const tipos = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", webp: "image/webp", ico: "image/x-icon" };
    const cartoes = resultado.logos
      .map((l) => {
        const ext = l.arquivo.split(".").pop();
        const dado = `data:${tipos[ext]};base64,${readFileSync(join(SAIDA, l.arquivo)).toString("base64")}`;
        return `<figure><div class="claro"><img src="${dado}"></div><div class="escuro"><img src="${dado}"></div><figcaption>${l.arquivo} · ${l.origem}</figcaption></figure>`;
      })
      .join("");
    await folha.setContent(
      `<style>body{margin:20px;font:13px Arial;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0}div{height:90px;display:grid;place-items:center;border:1px solid #ddd}.claro{background:#fff}.escuro{background:#151515}img{max-height:70px;max-width:90%}figcaption{margin-top:6px;color:#444}</style>${cartoes}`,
    );
    await folha.waitForTimeout(500);
    await folha.screenshot({ path: join(SAIDA, "logos.png"), fullPage: true, scale: "css" });
    // Cores de cada logo (as que mais aparecem, fora branco, preto e cinza).
    for (const l of resultado.logos) {
      const ext = l.arquivo.split(".").pop();
      if (ext === "ico") continue;
      const dado = `data:${tipos[ext]};base64,${readFileSync(join(SAIDA, l.arquivo)).toString("base64")}`;
      l.cores = await folha.evaluate(async (src) => {
        const img = new Image();
        img.src = src;
        await img.decode().catch(() => {});
        const c = document.createElement("canvas");
        c.width = 120;
        c.height = Math.max(1, Math.round((120 * (img.naturalHeight || 1)) / (img.naturalWidth || 1)));
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        const contagem = {};
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 200) continue;
          const [r, g, b] = [d[i], d[i + 1], d[i + 2]].map((v) => Math.round(v / 16) * 16);
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min < 24) continue;
          const hex = "#" + [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("");
          contagem[hex] = (contagem[hex] || 0) + 1;
        }
        return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([hex]) => hex);
      }, dado);
    }
    await folha.close();
  }
} catch (e) {
  resultado.erros.push(String(e.message || e).split("\n")[0]);
} finally {
  await browser.close();
}

writeFileSync(join(SAIDA, "site.json"), JSON.stringify(resultado, null, 2));
const c = resultado.contatos || {};
console.log(`ok: ${resultado.paginas.length} página(s) lida(s) de ${inicio.host}, em ${SAIDA}/site.json`);
console.log(`   cores mais usadas: ${(resultado.cores || []).slice(0, 8).map((x) => x.hex).join(" ")}`);
console.log(`   fontes: texto "${resultado.fontes?.texto ?? ""}", títulos "${resultado.fontes?.titulos ?? ""}"`);
console.log(`   logos: ${(resultado.logos || []).length} candidato(s)${(resultado.logos || []).length ? " (veja logos.png; vêm do mais provável para o menos)" : ""}`);
console.log(`   contatos achados: ${["whatsapp", "telefones", "emails", "cnpj"].map((k) => `${k} ${(c[k] || []).length}`).join(", ")}`);
if (resultado.erros.length) console.log(`   avisos: ${resultado.erros.join(" | ")}`);
