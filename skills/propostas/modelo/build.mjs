// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Gera a proposta como UM arquivo HTML completo (CSS e JS embutidos), depois de conferir os dados.
// Uso: npm run build (ou pnpm build)  →  dist/proposta-<slug>.html e .build/publicacao.json
//
// Cada recusa é um erro de verdade, não um aviso: a proposta não sai enquanto sobrar algum.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
mkdirSync(".build", { recursive: true });
mkdirSync("dist", { recursive: true });

// 0. Os componentes gratuitos do React Bits vêm do registro oficial, não do kit (a licença não deixa redistribuir).
const faltamRb = JSON.parse(readFileSync("reactbits.json", "utf8")).componentes.filter((n) => !existsSync(`src/components/reactbits/${n}.tsx`));
if (faltamRb.length) {
  console.error(`Faltam componentes do React Bits (${faltamRb.join(", ")}). Rode: node <pasta do kit>/skills/propostas/ferramentas/reactbits.mjs .`);
  process.exit(1);
}

// 1. Guardas sobre os DADOS, antes de gastar tempo com o resto.
await build({
  entryPoints: ["src/data.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: ".build/data.mjs",
  logLevel: "error",
});
const dados = await import(`./.build/data.mjs?t=${Date.now()}`);
const marca = JSON.parse(readFileSync("src/marca.json", "utf8"));
const falhas = [];

// Publicação: caminho no endereço, nome dos arquivos e textos da tela de acesso (que são PÚBLICOS).
const pub = dados.publicacao ?? {};
const SAIDA = `dist/proposta-${pub.slug}.html`;
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pub.caminho ?? "")) falhas.push("publicacao.caminho: só minúsculas, números e hífen");
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pub.slug ?? "")) falhas.push("publicacao.slug: só minúsculas, números e hífen");
const publicos = {
  titulo: pub.titulo,
  descricao: pub.descricao,
  "imagem.titulo": pub.imagem?.titulo,
  "imagem.destaque": pub.imagem?.destaque,
  "imagem.frase": pub.imagem?.frase,
};
for (const [campo, valor] of Object.entries(publicos)) {
  if (!valor) falhas.push(`publicacao.${campo} vazio`);
  else if (/["<>]/.test(valor)) falhas.push(`publicacao.${campo} não pode ter aspas nem < >`);
}
for (const no of dados.solucao?.nos ?? []) if (/["<>]/.test(no)) falhas.push(`solucao.nos: "${no}" não pode ter aspas nem < >`);
if (dados.arquivoPdf !== `proposta-${pub.slug}.pdf`)
  falhas.push(`arquivoPdf deveria ser "proposta-${pub.slug}.pdf", está "${dados.arquivoPdf}"`);
const validadeISO = dados.proposta.validadeISO;
if (validadeISO < new Date().toLocaleDateString("sv-SE"))
  falhas.push(`a proposta venceu em ${dados.proposta.validadeCurta}: atualize emitidaEm no data.ts antes de gerar de novo`);
const cliente = [dados.proposta.cliente.empresa, dados.proposta.cliente.contato].filter(Boolean);
const textoPublico = [...Object.values(publicos), dados.solucao?.nucleo, ...(dados.solucao?.nos ?? [])].join(" ").toLowerCase();
for (const c of cliente) {
  if (textoPublico.includes(c.toLowerCase()))
    falhas.push(`publicacao ou solucao.nos cita "${c}": a tela de acesso e a imagem da prévia são públicas`);
}
if (/\d[\d.]*\s*(mil|reais)|R\$/i.test(textoPublico)) falhas.push("publicacao não pode ter valores: a tela de acesso e a imagem da prévia são públicas");
if (!marca.negocio?.nome) falhas.push("src/marca.json sem o nome do negócio: rode o aplicar-marca (skill propostas)");

// Valor: âncora (duas ou três opções, preço por módulo) ou direto (o valor já combinado, uma opção só).
const n = dados.opcoes.length;
const comPrecos = dados.modulos.filter((m) => m.precos).length;
if (comPrecos && comPrecos !== dados.modulos.length)
  falhas.push(`${comPrecos} de ${dados.modulos.length} módulos têm precos: ou todos têm, ou nenhum (valor direto)`);
for (const m of dados.modulos)
  for (const it of m.itens)
    if (it.c.length !== n) falhas.push(`"${it.t}" (${m.titulo}) tem ${it.c.length} células para ${n} opções`);
const ordemOk = [...dados.ordem].sort().join() === [...Array(n).keys()].join();
if (!ordemOk) falhas.push(`ordem [${dados.ordem}] não lista cada opção uma vez`);
const recomendadas = dados.opcoes.flatMap((o, i) => (o.recomendada ? [i] : []));
if (dados.modo === "direto") {
  if (n !== 1) falhas.push(`modo direto tem 1 opção, e o data.ts tem ${n}`);
  if (comPrecos) falhas.push("modo direto não tem preço por módulo: tire os precos dos módulos");
} else if (dados.modo === "ancora") {
  if (![2, 3].includes(n)) falhas.push(`modo âncora tem 2 ou 3 opções, e o data.ts tem ${n}`);
  if (!comPrecos) falhas.push("modo âncora tem preço por módulo em todos os módulos");
  for (const m of comPrecos ? dados.modulos : [])
    if (m.precos.length !== n) falhas.push(`"${m.titulo}" tem ${m.precos.length} preços para ${n} opções`);
  if (recomendadas.length !== 1) falhas.push(`modo âncora tem 1 opção recomendada, e o data.ts tem ${recomendadas.length}`);
  else {
    const rec = recomendadas[0];
    const maisCara = dados.opcoes.reduce((m, o, i) => (o.preco > dados.opcoes[m].preco ? i : m), 0);
    if (dados.ancora === "acima") {
      // Âncora acima: uma opção mais cara, para não ser escolhida, faz a recomendada parecer o melhor negócio.
      if (n !== 3) falhas.push("âncora acima tem 3 opções: a mais cara, a recomendada e uma menor");
      if (maisCara === rec) falhas.push("âncora acima: a recomendada não pode ser a mais cara");
      if (dados.ordem[0] !== maisCara || dados.ordem[1] !== rec)
        falhas.push("âncora acima: a ordem começa pela mais cara e segue pela recomendada");
    } else if (dados.ancora === "abaixo") {
      // Âncora abaixo: a recomendada é o pedido inteiro, e as outras são o mesmo pedido reduzido.
      if (maisCara !== rec) falhas.push("âncora abaixo: a recomendada é a mais cara (as outras são o pedido reduzido)");
      if (dados.ordem[0] !== rec) falhas.push("âncora abaixo: a recomendada vem primeiro em ordem");
    } else falhas.push(`ancora "${dados.ancora}": use "abaixo" ou "acima" no data.ts`);
    if (dados.recomendada !== rec) falhas.push("exporte `recomendada` com o índice da opção recomendada");
  }
} else {
  falhas.push(`modo "${dados.modo}": declare export const modo = "ancora" ou "direto" no data.ts`);
}

// Contas: módulos, parcelas e prazo fecham com o preço e o prazo de cada opção.
for (const [i, opcao] of dados.opcoes.entries()) {
  const somaModulos = comPrecos ? dados.modulos.reduce((s, m) => s + (m.precos[i] ?? 0), 0) : opcao.preco;
  if (somaModulos !== opcao.preco) falhas.push(`${opcao.nome}: módulos somam ${somaModulos}, mas o preço é ${opcao.preco}`);
  const somaParcelas = opcao.marcos.reduce((s, m) => s + m.valor, 0);
  if (somaParcelas !== opcao.preco) falhas.push(`${opcao.nome}: parcelas somam ${somaParcelas}, mas o preço é ${opcao.preco}`);
  const prazo = opcao.fases.reduce((s, f) => s + f.duracao, 0);
  if (prazo !== opcao.duracao)
    falhas.push(`${opcao.nome}: as fases somam ${prazo} ${dados.unidadePrazo}, mas o prazo é ${opcao.duracao}`);
  for (const f of opcao.fases)
    if (!dados.etapas.some((e) => e.id === f.id)) falhas.push(`${opcao.nome}: fase "${f.id}" não existe em etapas`);
  for (const m of comPrecos ? dados.modulos : []) {
    const temAlgo = m.itens.some((it) => it.c[i].s !== "nao");
    if (m.precos[i] === 0 && temAlgo && !m.semCustoProprio) falhas.push(`${opcao.nome}: "${m.titulo}" tem item incluso, mas custa 0`);
    if (m.precos[i] > 0 && !temAlgo) falhas.push(`${opcao.nome}: "${m.titulo}" custa ${m.precos[i]}, mas nenhum item está incluso`);
  }
}

// O escopo é 100% do que o cliente pediu: toda linha da matriz aponta para um item do pedido, e todo
// item do pedido que é funcionalidade aparece em alguma linha.
const referenciados = new Set();
for (const m of dados.modulos) {
  for (const it of m.itens) {
    if (!it.ref?.length) falhas.push(`"${it.t}" (${m.titulo}) não aponta para nenhum item do pedido`);
    for (const r of it.ref ?? []) {
      if (!dados.pedido[r]) falhas.push(`"${it.t}" aponta para "${r}", que não existe no pedido`);
      referenciados.add(r);
    }
  }
}
for (const [id, item] of Object.entries(dados.pedido)) {
  if (item.onde === "matriz" && !referenciados.has(id)) falhas.push(`item ${id} do pedido ("${item.texto}") não aparece na matriz`);
}

// Travessão soa como texto de IA: nada de travessão em texto nenhum.
const TRAVESSAO = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)}]`);
function arquivos(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}
for (const f of arquivos("src").filter((f) => /\.(tsx?|html|json|css)$/.test(f))) {
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((linha, i) => {
      if (TRAVESSAO.test(linha) && !linha.trim().startsWith("//")) falhas.push(`${f}:${i + 1} tem travessão`);
    });
}

if (falhas.length) {
  console.error("\nBuild recusado:\n- " + falhas.join("\n- "));
  process.exit(1);
}

// 2. CSS (Tailwind v4 com as cores e fontes da marca).
const tailwind = join(dirname(require.resolve("@tailwindcss/cli/package.json")), "dist", "index.mjs");
execFileSync(process.execPath, [tailwind, "-i", "src/styles.css", "-o", ".build/app.css", "--minify"], {
  stdio: ["ignore", "ignore", "inherit"],
});

// 3. JS (React e as seções) num bundle só.
await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  outfile: ".build/app.js",
  define: { "process.env.NODE_ENV": '"production"' },
  jsx: "automatic",
  legalComments: "none",
  logLevel: "error",
});

// 4. Tudo embutido num HTML completo. Título, prévia e cores saem do data.ts e do src/marca.json.
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const css = readFileSync(".build/app.css", "utf8");
const js = readFileSync(".build/app.js", "utf8").replace(/<\/script/gi, "<\\/script");
const trocas = {
  __TITULO__: esc(`Proposta ${pub.titulo} · ${marca.negocio.nome}`),
  __DESCRICAO__: esc(pub.descricao),
  __OG_TITULO__: esc(`Proposta comercial · ${pub.titulo}`),
  __OG_IMAGEM__: esc(`/publico/og-${pub.caminho}.jpg`),
  __SITE_NOME__: esc(marca.negocio.nome),
  __COR_TEMA__: esc(marca.cores.tinta),
  __FAVICON__: esc(marca.favicon),
  __FONTES__: esc(marca.fontes.url),
  __CONTATO__: esc(marca.negocio.whatsappVisivel || marca.negocio.email || marca.negocio.site || marca.negocio.nome),
  // Escrito no HTML (o botão monta o nome na hora): a publicação confere que a página aponta o PDF certo.
  __PDF__: esc(dados.arquivoPdf),
};
let html = readFileSync("src/index.html", "utf8");
for (const [chave, valor] of Object.entries(trocas)) html = html.split(chave).join(valor);
html = html.replace("/*__CSS__*/", () => css).replace("/*__JS__*/", () => js);

// 5. Guardas sobre a SAÍDA: o texto como o cliente vai ler.
// O bundle escapa os acentos ("a\xE7\xF5es"): sem decodificar, termo acentuado nunca casa.
const visivel = html
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const minusculo = visivel.toLowerCase();
const achadas = [];

// Texto de rascunho que não pode chegar ao cliente. A busca é nos textos do data.ts e do marca.json, e não
// no HTML, porque o código do React tem palavras como "undefined" e "placeholder" de propósito. O texto
// renderizado é conferido de novo nas capturas e no PDF (scripts/conferir-tela.cjs).
const sobras = [/lorem/i, /\bTODO\b/, /\[(cliente|empresa|nome|valor|data)\]/i, /XXX/, /\bundefined\b/, /\bNaN\b/, /\bA DEFINIR\b/];
const textos = [];
const juntarTextos = (v, onde) => {
  if (typeof v === "string") textos.push([onde, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => juntarTextos(x, `${onde}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) juntarTextos(x, `${onde}.${k}`);
};
for (const [nome, valor] of Object.entries(dados)) if (typeof valor !== "function") juntarTextos(valor, nome);
juntarTextos(marca.negocio, "marca.negocio");
for (const [onde, t] of textos)
  for (const s of sobras) if (s.test(t)) achadas.push(`${onde}: texto de rascunho (${s.source})`);
for (const [onde, t] of textos) if (TRAVESSAO.test(t)) achadas.push(`${onde}: travessão`);

// Recursos que o cliente não pediu e já saíram uma vez: não podem voltar (lista no data.ts).
for (const s of dados.extrasRetirados ?? [])
  if (minusculo.includes(s.toLowerCase())) achadas.push(`"${s}" está em extrasRetirados no data.ts e voltou ao texto`);

// Frases que já foram verdade e deixaram de ser (afirmacoes.json): o build recusa.
if (existsSync("afirmacoes.json")) {
  for (const a of JSON.parse(readFileSync("afirmacoes.json", "utf8")).vencidas ?? [])
    if (new RegExp(a.padrao, "i").test(visivel)) achadas.push(`afirmação vencida: ${a.motivo}`);
}

// Proposta aberta a partir do modelo ou de outra proposta: nenhum termo de lá pode sobrar, senão o
// cliente novo lê o nome ou o projeto de outro. Termo que vale também aqui vai em termosPermitidos.
// KIT_ENSAIO=1 (só para testar o próprio modelo) transforma esta recusa em aviso e marca a saída como
// ensaio: a publicação recusa proposta gerada assim.
const ensaio = process.env.KIT_ENSAIO === "1";
const herdadas = [];
if (existsSync("herdado.json")) {
  const herdado = JSON.parse(readFileSync("herdado.json", "utf8"));
  const permitidos = new Set((dados.termosPermitidos ?? []).map((t) => t.toLowerCase()));
  const fontes = [["", visivel]];
  if (existsSync("publicar/og.html")) fontes.push([" na imagem de compartilhamento (publicar/og.html)", readFileSync("publicar/og.html", "utf8")]);
  for (const [onde, texto] of fontes) {
    for (const termo of herdado.termos ?? [])
      if (!permitidos.has(termo.toLowerCase()) && texto.toLowerCase().includes(termo.toLowerCase()))
        herdadas.push(`"${termo}"${onde} sobrou da proposta de origem (${herdado.origem}): reescreva, ou ponha em termosPermitidos`);
    // Palavra inteira e com a mesma caixa, para nome curto que é pedaço de palavra comum.
    for (const palavra of herdado.palavras ?? [])
      if (!permitidos.has(palavra.toLowerCase()) && new RegExp(`\\b${palavra}\\b`).test(texto))
        herdadas.push(`"${palavra}"${onde} sobrou da proposta de origem (${herdado.origem}): reescreva, ou ponha em termosPermitidos`);
  }
}
if (ensaio && herdadas.length) console.warn(`\naviso (ensaio): ${herdadas.length} termos da proposta de origem ficaram; esta saída não pode ser publicada.`);
else achadas.push(...herdadas);

// A chave do React Bits Pro nunca vai para a página.
const chave = process.env.REACTBITS_LICENSE_KEY;
if ((chave && html.includes(chave)) || /\brbp[a-z]{0,2}-[0-9a-f]{8}-/i.test(html)) achadas.push("CHAVE DO REACT BITS PRO na página");

// O script precisa passar pelo Rocket Loader da Cloudflare sem ser mexido.
if (!html.includes('<script data-cfasync="false">')) achadas.push('<script> sem data-cfasync="false" no index.html');
for (const chaveTroca of Object.keys(trocas)) if (html.includes(chaveTroca)) achadas.push(`${chaveTroca} sobrou no index.html`);

if (achadas.length) {
  console.error("\nBuild recusado. Sobrou ou faltou no HTML:\n- " + achadas.join("\n- "));
  process.exit(1);
}

writeFileSync(SAIDA, html);
writeFileSync(
  ".build/publicacao.json",
  JSON.stringify(
    {
      caminho: pub.caminho,
      titulo: pub.titulo,
      descricao: pub.descricao,
      html: SAIDA,
      pdf: `dist/${dados.arquivoPdf}`,
      imagem: `publicar/publico/og-${pub.caminho}.jpg`,
      validade: dados.proposta.validade,
      validadeISO,
      cliente,
      modo: dados.modo,
      negocio: marca.negocio.nome,
      imagemTexto: { ...pub.imagem, nucleo: dados.solucao?.nucleo ?? "", nos: (dados.solucao?.nos ?? []).slice(0, 4) },
      ensaio: ensaio && herdadas.length > 0,
    },
    null,
    2,
  ),
);
console.log(`ok  ${SAIDA}  (${(html.length / 1024).toFixed(0)} KB)`);
