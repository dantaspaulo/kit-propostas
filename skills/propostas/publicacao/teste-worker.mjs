// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Testes do portão. Rodam sozinhos (node teste-worker.mjs) e dentro do publicar.mjs, que recusa publicar com
// qualquer falha.
//  1. Lógica do portão, com duas propostas FICTÍCIAS e códigos de teste. Nenhum código real aparece aqui.
//  2. O worker montado para a publicação: cada proposta do registro está nele, com hash válido, e a tela de
//     acesso de cada uma tem a prévia do WhatsApp, a validade, e não cita o cliente.
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const BASE = "https://propostas.exemplo.com.br";
const sha = (t) => createHash("sha256").update(t).digest("hex");

export function montarWorker(propostas, marca) {
  const modelo = readFileSync(join(AQUI, "_worker.template.js"), "utf8");
  for (const m of ["/*__PROPOSTAS__*/ {}", "/*__MARCA__*/ {}"])
    if (!modelo.includes(m)) throw new Error(`o marcador ${m} sumiu do _worker.template.js`);
  return modelo
    .replace("/*__PROPOSTAS__*/ {}", () => JSON.stringify(propostas, null, 2))
    .replace("/*__MARCA__*/ {}", () => JSON.stringify(marca, null, 2));
}

async function importar(codigo, nome) {
  const dir = join(tmpdir(), "kit-propostas-teste");
  mkdirSync(dir, { recursive: true });
  const arq = join(dir, `${nome}-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(arq, codigo);
  try {
    return (await import(pathToFileURL(arq).href)).default;
  } finally {
    rmSync(arq, { force: true });
  }
}

const SEGREDO_TESTE = "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres";
const ambiente = (segredo = SEGREDO_TESTE, limite = null) => ({
  SEGREDO: segredo,
  ...(limite ? { LIMITE: limite } : {}),
  ASSETS: {
    fetch: async (req) => new Response("CONTEUDO " + new URL(req.url).pathname, { status: 200, headers: { "Content-Type": "text/html" } }),
  },
});

const pedir = (caminho, opcoes) => new Request(BASE + caminho, opcoes);
const entrar = (caminho, codigo, ip = "203.0.113.10") =>
  pedir(`/${caminho}/entrar`, {
    method: "POST",
    body: new URLSearchParams({ codigo }),
    headers: { "Content-Type": "application/x-www-form-urlencoded", "CF-Connecting-IP": ip },
  });

export const MARCA_TESTE = {
  nome: "Negócio de Teste",
  inicial: "N",
  site: "https://exemplo.com.br/",
  logo: null,
  favicon: "data:image/svg+xml,teste",
  fontesUrl: "https://fonts.googleapis.com/css2?family=Manrope&display=swap",
  fonteTexto: "Manrope",
  fonteTitulo: "Manrope",
  fonteMono: "DM Mono",
  fonteSerifa: "Georgia",
  cores: { fundo: "#f5f5f5", papel: "#ffffff", tinta: "#111111", apoio: "#555555", linha: "#dddddd", destaque: "#99cc33", destaqueForte: "#557711", noite: "#112211" },
};

async function logica(checar) {
  const propostas = {
    "teste-um": { titulo: "Projeto Um", descricao: "Descrição do projeto um.", imagem: "/publico/og-teste-um.jpg", validade: "1 de janeiro de 2099", senhaSha256: sha("lua-mar-11") },
    "teste-dois": { titulo: "Projeto <Dois>", descricao: "Descrição do projeto dois.", imagem: "/publico/og-teste-dois.jpg", validade: "2 de janeiro de 2099", senhaSha256: sha("sol-rio-22") },
  };
  const worker = await importar(montarWorker(propostas, MARCA_TESTE), "worker-teste");
  const env = ambiente();

  let r = await worker.fetch(pedir("/"), env);
  checar("raiz redireciona para o site do negócio", r.status === 302 && r.headers.get("Location") === "https://exemplo.com.br/");
  r = await worker.fetch(pedir("/outra-coisa/"), env);
  checar("caminho desconhecido redireciona", r.status === 302);
  const semSite = await importar(montarWorker(propostas, { ...MARCA_TESTE, site: "" }), "worker-sem-site");
  r = await semSite.fetch(pedir("/outra-coisa/"), env);
  checar("sem site, caminho desconhecido dá 404 com a marca", r.status === 404 && (await r.text()).includes("Negócio de Teste"));

  r = await worker.fetch(pedir("/teste-um/"), env);
  let t = await r.text();
  checar("sem cookie mostra a tela de acesso", r.status === 200 && t.includes("Código de acesso") && !t.includes("CONTEUDO"));
  checar("tela de acesso mostra o título e a marca", t.includes("<span>Projeto Um</span>") && t.includes("Negócio de Teste"));
  checar("tela de acesso não indexa e tem CSP", r.headers.get("X-Robots-Tag")?.includes("noindex") && !!r.headers.get("Content-Security-Policy"));
  checar(
    "prévia do WhatsApp: título, descrição e imagem com endereço completo",
    t.includes('property="og:title"') && t.includes('property="og:description"') && t.includes(`property="og:image" content="${BASE}/publico/og-teste-um.jpg"`),
  );
  checar("tela de acesso mostra a validade", t.includes("Proposta válida até 1 de janeiro de 2099."));
  r = await worker.fetch(pedir("/teste-dois/"), env);
  t = await r.text();
  checar("título com < > sai escapado na tela de acesso", t.includes("Projeto &lt;Dois&gt;") && !t.includes("<Dois>"));

  r = await worker.fetch(entrar("teste-um", "lua-mar-12"), env);
  t = await r.text();
  checar("código errado recusa com 401", r.status === 401 && t.includes("Código incorreto"));
  r = await worker.fetch(entrar("teste-dois", "lua-mar-11"), env);
  checar("código de uma proposta não abre a outra", r.status === 401);

  r = await worker.fetch(entrar("teste-um", " LUA-MAR-11 "), env);
  const cookie = r.headers.get("Set-Cookie") || "";
  checar("código certo (com espaço e maiúscula) entra", r.status === 303 && r.headers.get("Location") === "/teste-um/");
  checar("cookie seguro e preso ao caminho", cookie.includes("HttpOnly") && cookie.includes("Secure") && cookie.includes("Path=/teste-um;"));
  const valor = cookie.split(";")[0];

  r = await worker.fetch(pedir("/teste-um/", { headers: { Cookie: valor } }), env);
  checar("com cookie serve a proposta", r.status === 200 && (await r.text()) === "CONTEUDO /teste-um/");
  r = await worker.fetch(pedir("/teste-um/proposta.pdf", { headers: { Cookie: valor } }), env);
  checar("com cookie serve o PDF", (await r.text()) === "CONTEUDO /teste-um/proposta.pdf");
  r = await worker.fetch(pedir("/teste-um/proposta.pdf"), env);
  checar("PDF sem cookie fica protegido", !(await r.text()).includes("CONTEUDO"));

  r = await worker.fetch(pedir("/teste-dois/", { headers: { Cookie: valor } }), env);
  checar("cookie de uma proposta não abre a outra", !(await r.text()).includes("CONTEUDO"));
  r = await worker.fetch(pedir("/teste-dois/", { headers: { Cookie: valor.replace("p_teste_um", "p_teste_dois") } }), env);
  checar("cookie de uma proposta renomeado não abre a outra", !(await r.text()).includes("CONTEUDO"));
  r = await worker.fetch(pedir("/teste-um/", { headers: { Cookie: "p_teste_um=adulterado" } }), env);
  checar("cookie adulterado não entra", !(await r.text()).includes("CONTEUDO"));
  r = await worker.fetch(pedir("/teste-um/", { headers: { Cookie: valor } }), ambiente("outro-segredo-tambem-com-mais-de-trinta-e-dois"));
  checar("cookie de outro segredo não entra", !(await r.text()).includes("CONTEUDO"));
  const comCodigoNovo = { ...propostas, "teste-um": { ...propostas["teste-um"], senhaSha256: sha("codigo-novo-teste-99") } };
  const workerNovo = await importar(montarWorker(comCodigoNovo, MARCA_TESTE), "worker-codigo-novo");
  r = await workerNovo.fetch(pedir("/teste-um/", { headers: { Cookie: valor } }), env);
  checar("trocar o código derruba o acesso de quem já tinha entrado", !(await r.text()).includes("CONTEUDO"));
  r = await worker.fetch(pedir("/teste-um/"), ambiente(""));
  checar("sem segredo configurado, recusa com 500", r.status === 500);

  let chamadas = 0;
  const limite = { limit: async () => ({ success: ++chamadas <= 3 }) };
  const envLimite = ambiente(SEGREDO_TESTE, limite);
  for (let i = 0; i < 3; i++) await worker.fetch(entrar("teste-um", "errado-" + i), envLimite);
  r = await worker.fetch(entrar("teste-um", "lua-mar-11"), envLimite);
  checar("depois do limite de tentativas, recusa com 429 até o código certo", r.status === 429 && (await r.text()).includes("Muitas tentativas"));

  const chaves = [];
  const anota = { limit: async ({ key }) => (chaves.push(key), { success: true }) };
  for (const ip of ["2001:db8:1:2:aaaa::1", "2001:0DB8:0001:0002:bbbb:cccc:dddd:eeee", "2001:db8:1:3::1", "::ffff:198.51.100.7", "198.51.100.7"])
    await worker.fetch(entrar("teste-um", "errado", ip), ambiente(SEGREDO_TESTE, anota));
  checar("IPv6 do mesmo bloco /64 conta junto para o limite", chaves[0] === chaves[1] && chaves[0] === "2001:db8:1:2::/64:teste-um");
  checar("IPv6 de outro bloco conta separado", chaves[2] === "2001:db8:1:3::/64:teste-um");
  checar("IPv4 escrito como IPv6 conta como o IPv4", chaves[3] === chaves[4] && chaves[4] === "198.51.100.7:teste-um");

  let geral = 0;
  const envGeral = { ...ambiente(SEGREDO_TESTE, anota), LIMITE_GERAL: { limit: async () => ({ success: ++geral <= 3 }) } };
  for (let i = 0; i < 3; i++) await worker.fetch(entrar("teste-um", "errado-" + i, `203.0.113.${20 + i}`), envGeral);
  r = await worker.fetch(entrar("teste-um", "lua-mar-11", "203.0.113.99"), envGeral);
  checar("o limite por proposta segura tentativas espalhadas por vários endereços", r.status === 429);

  const formulario = { "Content-Type": "application/x-www-form-urlencoded" };
  r = await worker.fetch(pedir("/teste-um/entrar", { method: "POST", body: "codigo=" + "a".repeat(4000), headers: formulario }), env);
  checar("envio acima de 2 KB é recusado com 413", r.status === 413);
  const emPedacos = (texto) =>
    new ReadableStream({
      start(c) {
        for (let i = 0; i < texto.length; i += 500) c.enqueue(new TextEncoder().encode(texto.slice(i, i + 500)));
        c.close();
      },
    });
  r = await worker.fetch(pedir("/teste-um/entrar", { method: "POST", body: emPedacos("codigo=" + "a".repeat(4000)), duplex: "half", headers: formulario }), env);
  checar("envio em pedaços, sem Content-Length, acima de 2 KB também é recusado", r.status === 413);
  r = await worker.fetch(pedir("/teste-um/entrar", { method: "POST", body: emPedacos("codigo=LUA-MAR-11"), duplex: "half", headers: formulario }), env);
  checar("código certo enviado em pedaços entra", r.status === 303);

  r = await worker.fetch(pedir("/publico/og-teste-um.jpg"), env);
  checar("imagem da prévia abre sem código e com cache público", (await r.text()) === "CONTEUDO /publico/og-teste-um.jpg" && r.headers.get("Cache-Control")?.includes("public"));
  r = await worker.fetch(pedir("/robots.txt"), env);
  checar("robots.txt bloqueia tudo", (await r.text()).includes("Disallow: /"));
}

async function saida(checar, pasta, workerArq, esperado) {
  checar("worker montado", existsSync(workerArq));
  if (!existsSync(workerArq)) return;
  const codigo = readFileSync(workerArq, "utf8");
  const hashes = [...codigo.matchAll(/"senhaSha256": "([^"]*)"/g)].map((m) => m[1]);
  checar("toda proposta do registro está no portão, com hash de 64 hex", hashes.length === Object.keys(esperado).length && hashes.every((h) => /^[0-9a-f]{64}$/.test(h)));
  const worker = await importar(codigo, "worker-saida");
  const env = ambiente();
  for (const [caminho, e] of Object.entries(esperado)) {
    checar(
      `${caminho}: página, PDF e imagem na saída`,
      existsSync(join(pasta, caminho, "index.html")) && existsSync(join(pasta, caminho, e.pdf)) && existsSync(join(pasta, "publico", `og-${caminho}.jpg`)),
    );
    const r = await worker.fetch(pedir(`/${caminho}/`), env);
    const t = await r.text();
    checar(`${caminho}: tela de acesso`, r.status === 200 && t.includes("Código de acesso") && !t.includes("CONTEUDO"));
    checar(`${caminho}: prévia do WhatsApp`, t.includes('property="og:title"') && t.includes(`property="og:image" content="${BASE}/publico/og-${caminho}.jpg"`));
    checar(`${caminho}: validade na tela de acesso`, t.includes(`Proposta válida até ${e.validade}.`));
    const minusculo = t.toLowerCase();
    checar(`${caminho}: tela de acesso não cita o cliente`, e.cliente.every((c) => !minusculo.includes(c.toLowerCase())));
  }
}

/** Roda os dois grupos de teste e devolve a lista de falhas. */
export async function testar({ pasta, workerArq, esperado, silencioso = false }) {
  const falhas = [];
  const checar = (nome, cond) => {
    if (!silencioso || !cond) console.log((cond ? "ok    " : "FALHA ") + nome);
    if (!cond) falhas.push(nome);
  };
  await logica(checar);
  if (pasta) await saida(checar, pasta, workerArq, esperado);
  return falhas;
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
  const falhas = await testar({});
  console.log(falhas.length ? `\n${falhas.length} falha(s)` : "\ntodos os casos passaram");
  process.exit(falhas.length ? 1 : 0);
}
