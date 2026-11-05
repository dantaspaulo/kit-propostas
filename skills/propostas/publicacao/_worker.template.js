// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Portão das propostas (Cloudflare Workers com arquivos estáticos, run_worker_first). Cada proposta mora em
// /<caminho>/ e só abre com o código de acesso dela. O código não fica aqui: só o SHA-256 dele. O cookie de
// acesso é assinado (HMAC) com o segredo SEGREDO do Worker, que nunca sai da Cloudflare.
// PROPOSTAS e MARCA são montados pelo publicar.mjs.

const PROPOSTAS = /*__PROPOSTAS__*/ {};
const MARCA = /*__MARCA__*/ {};

const DIAS_DE_ACESSO = 30;
const LIMITE_CORPO = 2048;

const CABECALHOS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
};
const CSP_PORTAO =
  "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'";

const texto = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (t) => hex(await crypto.subtle.digest("SHA-256", texto.encode(t)));
const esc = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

async function assinar(segredo, mensagem) {
  const chave = await crypto.subtle.importKey("raw", texto.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", chave, texto.encode(mensagem)));
}

function iguais(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function lerCookie(request, nome) {
  for (const parte of (request.headers.get("Cookie") || "").split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nome) return v.join("=");
  }
  return null;
}

/** O código é comparado sem espaços e em minúsculas ("LUA-MAR-SOL-42" abre o mesmo que "lua-mar-sol-42"). Igual ao senha.mjs. */
const normalizar = (codigo) => String(codigo || "").trim().toLowerCase().replace(/\s+/g, "");

/**
 * O corpo do formulário, contando os bytes enquanto lê: o Content-Length pode faltar (envio em pedaços).
 * Passou de LIMITE_CORPO: null.
 */
async function lerCorpo(request) {
  if (Number(request.headers.get("Content-Length") || 0) > LIMITE_CORPO) return null;
  if (!request.body) return "";
  const leitor = request.body.getReader();
  const pedacos = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > LIMITE_CORPO) {
      await leitor.cancel();
      return null;
    }
    pedacos.push(value);
  }
  const bytes = new Uint8Array(total);
  let pos = 0;
  for (const p of pedacos) {
    bytes.set(p, pos);
    pos += p.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Quem conta para o limite de tentativas: o IPv4, ou o bloco /64 do IPv6. Quem tem um endereço IPv6 costuma ter o
 * bloco inteiro, e contar endereço por endereço deixaria trocar de endereço a cada tentativa.
 */
function chaveDoIp(ip) {
  const v4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (v4) return v4[1];
  if (!ip.includes(":")) return ip;
  const [antes, depois] = ip.split("::");
  const a = antes ? antes.split(":") : [];
  const b = depois ? depois.split(":") : [];
  const grupos = depois === undefined ? a : [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill("0"), ...b];
  return grupos.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

function marcaHtml() {
  if (MARCA.logo) return `<img class="logo" src="${esc(MARCA.logo)}" alt="${esc(MARCA.nome)}">`;
  return `<span class="monograma">${esc(MARCA.inicial)}</span><span>${esc(MARCA.nome)}</span>`;
}

function pagina(status, titulo, corpo, cabeca = "") {
  const c = MARCA.cores || {};
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titulo)}</title>
${cabeca}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(MARCA.fontesUrl)}" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100svh;display:grid;place-items:center;padding:24px 16px;background:${esc(c.fundo)};color:${esc(c.tinta)};font-family:"${esc(MARCA.fonteTexto)}",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.cartao{width:min(440px,100%);background:${esc(c.papel)};border:1px solid ${esc(c.linha)};border-radius:24px;padding:36px 30px;box-shadow:0 24px 70px rgba(0,0,0,.10),0 2px 8px rgba(0,0,0,.04)}
.marca{display:inline-flex;align-items:center;gap:10px;font-family:"${esc(MARCA.fonteTitulo)}",Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:-.05em}
.logo{height:34px;width:auto;max-width:200px;object-fit:contain}
.monograma{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:${esc(c.noite)};color:${esc(c.destaque)};font-size:16px}
.olho{display:flex;align-items:center;gap:8px;margin:34px 0 12px;color:${esc(c.apoio)};font:500 11px/1.2 "${esc(MARCA.fonteMono)}",monospace;letter-spacing:.06em;text-transform:uppercase}
.olho:before{content:"";width:8px;height:8px;border-radius:50%;background:${esc(c.destaqueForte)}}
h1{margin:0;font-family:"${esc(MARCA.fonteTitulo)}",Arial,sans-serif;font-size:30px;line-height:1.02;font-weight:800;letter-spacing:-.05em}
h1 span{display:block;font-family:"${esc(MARCA.fonteSerifa)}",Georgia,serif;font-weight:400;color:${esc(c.destaqueForte)};letter-spacing:-.03em}
p{margin:14px 0 0;color:${esc(c.apoio)};font-size:15px;line-height:1.6}
label{display:block;margin-top:26px;font:500 11px "${esc(MARCA.fonteMono)}",monospace;letter-spacing:.06em;text-transform:uppercase;color:${esc(c.apoio)}}
input{width:100%;margin-top:8px;padding:14px 16px;border:1px solid ${esc(c.linha)};border-radius:12px;background:#fff;font:700 17px "${esc(MARCA.fonteTexto)}",Arial,sans-serif;color:${esc(c.tinta)};letter-spacing:.04em}
input:focus{outline:2px solid ${esc(c.destaqueForte)};outline-offset:1px;border-color:${esc(c.destaqueForte)}}
button{width:100%;margin-top:14px;min-height:52px;border:0;border-radius:999px;background:${esc(c.tinta)};color:${esc(c.papel)};font:800 15px "${esc(MARCA.fonteTexto)}",Arial,sans-serif;cursor:pointer}
.erro{margin-top:14px;padding:12px 14px;border-radius:12px;background:#fbe4e1;color:#7a2416;font-size:14px;font-weight:700}
.pe{margin-top:26px;padding-top:18px;border-top:1px solid ${esc(c.linha)};font-size:12px;color:${esc(c.apoio)}}
.validade{margin-top:8px;font:500 12px "${esc(MARCA.fonteMono)}",monospace;letter-spacing:.04em;color:${esc(c.destaqueForte)}}
</style>
</head>
<body>
<main class="cartao">
<span class="marca">${marcaHtml()}</span>
${corpo}
<div class="pe">${esc(MARCA.nome)}${MARCA.site ? ` · ${esc(MARCA.site)}` : ""}</div>
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": CSP_PORTAO, ...CABECALHOS },
  });
}

function paginaDeAcesso(caminho, proposta, erro, origem) {
  const endereco = `${origem}/${caminho}/`;
  const titulo = `Proposta comercial · ${proposta.titulo}`;
  const imagem = `${origem}${proposta.imagem}`;
  const cabeca = `<meta name="description" content="${esc(proposta.descricao)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(MARCA.nome)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(proposta.descricao)}">
<meta property="og:url" content="${esc(endereco)}">
<meta property="og:image" content="${esc(imagem)}">
<meta property="og:image:secure_url" content="${esc(imagem)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(MARCA.nome)}: ${esc(proposta.titulo)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(proposta.descricao)}">
<meta name="twitter:image" content="${esc(imagem)}">
<link rel="icon" href="${esc(MARCA.favicon)}">`;
  const corpo = `<div class="olho">Proposta protegida</div>
<h1>Proposta comercial<span>${esc(proposta.titulo)}</span></h1>
<p>Digite o código de acesso que você recebeu junto com o link.</p>
<p class="validade">Proposta válida até ${esc(proposta.validade)}.</p>
<form method="post" action="/${esc(caminho)}/entrar">
<label for="codigo">Código de acesso</label>
<input id="codigo" name="codigo" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="80" required autofocus>
${erro ? `<div class="erro" role="alert">${esc(erro)}</div>` : ""}
<button type="submit">Abrir proposta</button>
</form>`;
  return pagina(erro === MUITAS ? 429 : erro ? 401 : 200, `Proposta protegida · ${MARCA.nome}`, corpo, cabeca);
}

const ERRADO = "Código incorreto. Confira a mensagem em que o link chegou.";
const MUITAS = "Muitas tentativas seguidas. Espere um minuto e tente de novo.";

function foraDoAr() {
  if (MARCA.site) return Response.redirect(MARCA.site, 302);
  return pagina(404, MARCA.nome, `<div class="olho">Propostas</div><h1>Endereço não encontrado<span>${esc(MARCA.nome)}</span></h1><p>Confira o link que você recebeu.</p>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });

    // Imagens da prévia e logo: públicos, para o WhatsApp montar a prévia do link.
    if (url.pathname.startsWith("/publico/")) {
      const resposta = await env.ASSETS.fetch(request);
      const saida = new Response(resposta.body, resposta);
      saida.headers.set("Cache-Control", "public, max-age=86400");
      saida.headers.set("X-Content-Type-Options", "nosniff");
      return saida;
    }

    const partes = url.pathname.split("/").filter(Boolean);
    const caminho = partes[0];
    const proposta = caminho && Object.prototype.hasOwnProperty.call(PROPOSTAS, caminho) ? PROPOSTAS[caminho] : null;
    if (!proposta) return foraDoAr();

    const segredo = env.SEGREDO;
    if (!segredo || segredo.length < 32) return new Response("Configuração incompleta.", { status: 500, headers: CABECALHOS });

    const nomeCookie = "p_" + caminho.replace(/[^a-z0-9]/g, "_");
    const valorEsperado = await assinar(segredo, caminho + ":" + proposta.senhaSha256);

    if (request.method === "POST" && partes[1] === "entrar") {
      // Dois limites: por quem tenta (IP ou bloco IPv6) e por proposta, somando todos. O segundo segura quem
      // espalha as tentativas por muitos endereços; no pior caso, quem ainda não entrou espera um minuto.
      if (env.LIMITE) {
        const ip = chaveDoIp(request.headers.get("CF-Connecting-IP") || "sem-ip");
        const { success } = await env.LIMITE.limit({ key: `${ip}:${caminho}` });
        if (!success) return paginaDeAcesso(caminho, proposta, MUITAS, url.origin);
      }
      if (env.LIMITE_GERAL) {
        const { success } = await env.LIMITE_GERAL.limit({ key: `proposta:${caminho}` });
        if (!success) return paginaDeAcesso(caminho, proposta, MUITAS, url.origin);
      }
      const corpo = await lerCorpo(request);
      if (corpo === null) return new Response("Pedido grande demais.", { status: 413, headers: CABECALHOS });
      const codigo = normalizar(new URLSearchParams(corpo).get("codigo"));
      if (codigo && iguais(await sha256(codigo), proposta.senhaSha256)) {
        return new Response(null, {
          status: 303,
          headers: {
            Location: `/${caminho}/`,
            "Set-Cookie": `${nomeCookie}=${valorEsperado}; Path=/${caminho}; Max-Age=${DIAS_DE_ACESSO * 86400}; HttpOnly; Secure; SameSite=Lax`,
            ...CABECALHOS,
          },
        });
      }
      await new Promise((r) => setTimeout(r, 700));
      return paginaDeAcesso(caminho, proposta, ERRADO, url.origin);
    }

    if (!iguais(lerCookie(request, nomeCookie), valorEsperado)) return paginaDeAcesso(caminho, proposta, "", url.origin);

    const resposta = await env.ASSETS.fetch(request);
    const saida = new Response(resposta.body, resposta);
    for (const [k, v] of Object.entries(CABECALHOS)) saida.headers.set(k, v);
    saida.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'none'; object-src 'none'");
    return saida;
  },
};
