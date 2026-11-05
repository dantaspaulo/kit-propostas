#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Publica TODAS as propostas do registro (<espaço>/publicacao/propostas.json) num Worker da Cloudflare, atrás
// do portão com código de acesso.
//
// Uma publicação SUBSTITUI o site inteiro. Por isso ela é central: toda proposta que deve continuar no ar
// precisa estar no registro. A que sair do registro sai do ar na próxima publicação.
//
//   node publicar.mjs [--espaco <pasta>]              ensaio: confere tudo, monta a saída e roda os testes; não envia nada
//   node publicar.mjs --enviar [--espaco <pasta>]     o mesmo, e publica com o wrangler (login antes: npx wrangler@4 login)
//   node publicar.mjs --conferir [--espaco <pasta>]   confere no ar: tela de acesso, imagem da prévia, código errado
//
// O espaço de trabalho padrão vem de ~/.kit-propostas/config.json (a entrevista grava).
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { montarWorker, testar } from "./teste-worker.mjs";
import { lerPerfil, montarMarca } from "../ferramentas/aplicar-marca.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const LIMITE_IMAGEM_KB = 290; // o WhatsApp não mostra prévia com imagem acima de ~300 KB
const WRANGLER = ["--yes", "wrangler@4"];

const args = process.argv.slice(2);
const arg = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const tem = (nome) => args.includes(nome);
const casa = process.env.KIT_PROPOSTAS_HOME || join(homedir(), ".kit-propostas");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const recusar = (titulo, lista) => {
  console.error(`\n${titulo}\n- ` + lista.join("\n- "));
  process.exit(1);
};

function espaco() {
  if (arg("--espaco")) return resolve(arg("--espaco"));
  const cfg = join(casa, "config.json");
  if (existsSync(cfg)) return resolve(JSON.parse(readFileSync(cfg, "utf8")).espaco.replace(/^~(?=\/)/, homedir()));
  recusar("Sem espaço de trabalho:", ["passe --espaco <pasta>, ou faça a entrevista (skill propostas-configurar)"]);
}

const ESPACO = espaco();
const PUB = join(ESPACO, "publicacao");
const BUILD = join(PUB, ".build");
const SAIDA = join(PUB, "saida");
const registroArq = join(PUB, "propostas.json");
const cfArq = join(PUB, "cloudflare.json");
const perfilArq = join(ESPACO, "meu-negocio", "perfil.json");
for (const [nome, arq] of [["registro", registroArq], ["perfil do negócio", perfilArq]])
  if (!existsSync(arq)) recusar("Falta arquivo:", [`${nome}: ${arq}`]);
mkdirSync(BUILD, { recursive: true });

const registro = JSON.parse(readFileSync(registroArq, "utf8"));
const cf = existsSync(cfArq) ? JSON.parse(readFileSync(cfArq, "utf8")) : {};
const perfil = lerPerfil(perfilArq);
const { marca } = montarMarca(perfil, dirname(perfilArq));
const hoje = new Date().toLocaleDateString("sv-SE");

// O que o portão precisa da marca. O logo vira arquivo público (/publico/logo.*), fora do worker.
const site = marca.negocio.site ? (/^https?:\/\//.test(marca.negocio.site) ? marca.negocio.site : `https://${marca.negocio.site}`) : "";
const logoArq = perfil.marca.logo ? resolve(dirname(perfilArq), perfil.marca.logo) : null;
const marcaPortao = {
  nome: marca.negocio.nome,
  inicial: marca.negocio.nome.trim().charAt(0).toUpperCase(),
  site: site ? new URL(site).href : "",
  logo: logoArq && existsSync(logoArq) ? `/publico/logo${extname(logoArq).toLowerCase()}` : null,
  favicon: marca.favicon,
  fontesUrl: marca.fontes.url,
  fonteTexto: marca.fontes.texto,
  fonteTitulo: marca.fontes.titulo,
  fonteMono: marca.fontes.mono,
  fonteSerifa: marca.fontes.serifa,
  cores: marca.cores,
};

// 1. Confere cada proposta do registro.
const falhas = [];
const avisos = [];
const entradas = {};
const esperado = {};
const copias = [];
const chaveRb = process.env.REACTBITS_LICENSE_KEY;
for (const [caminho, item] of Object.entries(registro.propostas ?? {})) {
  const f = (m) => falhas.push(`${caminho}: ${m}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(caminho)) {
    f("caminho só com letras minúsculas, números e hífen");
    continue;
  }
  if (caminho === "publico") {
    f('"publico" é reservado para as imagens da prévia');
    continue;
  }
  const pasta = resolve(PUB, item.pasta);
  const pubArq = join(pasta, ".build", "publicacao.json");
  if (!existsSync(pubArq)) {
    f(`falta ${pubArq}: rode o build na pasta da proposta`);
    continue;
  }
  const pub = JSON.parse(readFileSync(pubArq, "utf8"));
  if (pub.caminho !== caminho) f(`o data.ts diz caminho "${pub.caminho}", o registro diz "${caminho}"`);
  if (pub.ensaio) f("a página foi gerada em modo de ensaio (KIT_ENSAIO=1), com termos do modelo: gere de novo sem ele");
  const html = join(pasta, pub.html);
  const pdf = join(pasta, pub.pdf);
  const imagem = join(pasta, pub.imagem);
  for (const [nome, arq] of [["página", html], ["PDF", pdf], ["imagem da prévia", imagem]]) if (!existsSync(arq)) f(`falta ${nome}: ${arq}`);
  const senhaArq = join(pasta, ".build", "senha.sha256");
  const senha = existsSync(senhaArq) ? readFileSync(senhaArq, "utf8").trim() : "";
  if (!/^[0-9a-f]{64}$/.test(senha)) f(`sem código de acesso: node ${join(AQUI, "senha.mjs")} ${pasta} --gerar`);
  for (const campo of ["titulo", "descricao", "validade"]) {
    if (!pub[campo]) f(`sem ${campo} em publicacao`);
    else if (/["<>]/.test(pub[campo])) f(`${campo} não pode ter aspas nem < >: vai para a tela de acesso`);
  }
  if (!existsSync(html) || !existsSync(pdf) || !existsSync(imagem)) continue;

  const pagina = readFileSync(html, "utf8");
  if (!pagina.includes('data-cfasync="false"')) f('o <script> da página precisa de data-cfasync="false"');
  if (!pagina.includes(`/publico/og-${caminho}.jpg`)) f(`a página não aponta a imagem /publico/og-${caminho}.jpg`);
  if (!pagina.includes(basename(pdf))) f(`a página não cita o PDF ${basename(pdf)} (botão Baixar PDF)`);
  if ((chaveRb && pagina.includes(chaveRb)) || /\brbp[a-z]{0,2}-[0-9a-f]{8}-/i.test(pagina)) f("a chave do React Bits Pro está na página");
  const origemPdf = join(pasta, ".build", "pdf-origem.txt");
  if (!existsSync(origemPdf) || readFileSync(origemPdf, "utf8").trim() !== sha256(readFileSync(html)))
    f("o PDF não foi gerado desta versão da página: rode node scripts/pdf.cjs na pasta da proposta");
  const kb = statSync(imagem).size / 1024;
  const cabeca = readFileSync(imagem).subarray(0, 2);
  if (kb > LIMITE_IMAGEM_KB) f(`imagem da prévia com ${kb.toFixed(0)} KB (máximo ${LIMITE_IMAGEM_KB})`);
  if (cabeca[0] !== 0xff || cabeca[1] !== 0xd8) f("imagem da prévia precisa ser JPEG");
  if (pub.validadeISO && pub.validadeISO < hoje) avisos.push(`${caminho}: venceu em ${pub.validade} e continua no registro. Tirar do ar é decisão sua.`);

  copias.push([html, `${caminho}/index.html`], [pdf, `${caminho}/${basename(pdf)}`], [imagem, `publico/og-${caminho}.jpg`]);
  entradas[caminho] = { titulo: pub.titulo, descricao: pub.descricao, imagem: `/publico/og-${caminho}.jpg`, validade: pub.validade, senhaSha256: senha };
  esperado[caminho] = { validade: pub.validade, cliente: pub.cliente ?? [], pdf: basename(pdf) };
}
if (!Object.keys(entradas).length && !falhas.length) falhas.push("registro vazio: publicar assim tiraria todas as propostas do ar");
if (falhas.length) recusar("Publicação recusada:", falhas);

// 2. Monta a saída do zero, com todas as propostas, e o portão.
rmSync(SAIDA, { recursive: true, force: true });
for (const [origem, destino] of copias) {
  mkdirSync(dirname(join(SAIDA, destino)), { recursive: true });
  cpSync(origem, join(SAIDA, destino));
}
if (marcaPortao.logo) cpSync(logoArq, join(SAIDA, marcaPortao.logo));
const workerArq = join(BUILD, "worker.js");
writeFileSync(workerArq, montarWorker(entradas, marcaPortao));

const listar = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? listar(join(dir, n)) : [join(dir, n)]));
const falhasTeste = await testar({ pasta: SAIDA, workerArq, esperado, silencioso: true });
if (falhasTeste.length) recusar("Publicação recusada, o portão falhou nos testes:", falhasTeste);

const manifesto = Object.fromEntries(listar(SAIDA).map((p) => ["/" + relative(SAIDA, p).split("\\").join("/"), sha256(readFileSync(p))]));
const anteriorArq = join(BUILD, "manifest.json");
const anterior = existsSync(anteriorArq) ? JSON.parse(readFileSync(anteriorArq, "utf8")) : {};
console.log(`\nTestes do portão: ok. Propostas: ${Object.keys(entradas).join(", ")}`);
console.log("Em relação à última publicação:");
for (const [rel, h] of Object.entries(manifesto)) console.log(`  ${!anterior[rel] ? "novo   " : anterior[rel] === h ? "igual  " : "mudou  "} ${rel}`);
for (const rel of Object.keys(anterior)) if (!manifesto[rel]) console.log(`  SAI     ${rel}`);
for (const a of avisos) console.log(`\naviso: ${a}`);

// 3. Configuração do Worker. O nome e o domínio vêm do cloudflare.json do espaço (a entrevista grava).
const worker = cf.worker || perfil.publicacao?.worker;
if (!worker || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(worker))
  recusar("Configuração recusada:", [`nome do Worker inválido ou ausente ("${worker}") em ${cfArq}: minúsculas, números e hífen`]);
const dominio = cf.dominio || perfil.publicacao?.dominio || null;
if (!cf.limiteNamespace) cf.limiteNamespace = String(1000 + (parseInt(sha256(worker).slice(0, 6), 16) % 900000));
const config = {
  $schema: "https://unpkg.com/wrangler/config-schema.json",
  name: worker,
  main: "worker.js",
  compatibility_date: "2026-10-01",
  ...(cf.contaId ? { account_id: cf.contaId } : {}),
  workers_dev: !dominio,
  preview_urls: false,
  ...(dominio ? { routes: [{ pattern: dominio, custom_domain: true }] } : {}),
  assets: { directory: "../saida", binding: "ASSETS", run_worker_first: true },
  // Tentativas de código por minuto: 10 por IP (ou bloco IPv6) e 30 por proposta, somando todos os endereços.
  ratelimits: [
    { name: "LIMITE", namespace_id: cf.limiteNamespace, simple: { limit: 10, period: 60 } },
    { name: "LIMITE_GERAL", namespace_id: String(Number(cf.limiteNamespace) + 1), simple: { limit: 30, period: 60 } },
  ],
};
const configArq = join(BUILD, "wrangler.jsonc");
writeFileSync(configArq, JSON.stringify(config, null, 2) + "\n");

function wrangler(params, { mostrar = false } = {}) {
  const r = spawnSync("npx", [...WRANGLER, ...params, "--config", configArq], {
    cwd: BUILD,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
  const saida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  if (mostrar) process.stdout.write(saida);
  return { ok: r.status === 0, saida };
}

async function conferirNoAr(endereco) {
  const base = endereco.replace(/\/$/, "");
  const problemas = [];
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const caminho of Object.keys(entradas)) {
    let r;
    for (let i = 0; i < 12; i++) {
      try {
        r = await fetch(`${base}/${caminho}/`, { redirect: "manual", headers: { "User-Agent": "WhatsApp/2.24 A" } });
        if (r.status === 200) break;
      } catch {}
      await esperar(5000);
    }
    const t = r ? await r.text() : "";
    if (!r || r.status !== 200 || !t.includes("Código de acesso")) problemas.push(`${caminho}: tela de acesso não respondeu 200 (${r?.status ?? "sem resposta"})`);
    else if (!t.includes(`/publico/og-${caminho}.jpg`)) problemas.push(`${caminho}: a tela de acesso não aponta a imagem da prévia`);
    const img = await fetch(`${base}/publico/og-${caminho}.jpg`).catch(() => null);
    if (!img || img.status !== 200 || !String(img.headers.get("content-type")).includes("image/jpeg"))
      problemas.push(`${caminho}: imagem da prévia não abriu (${img?.status ?? "sem resposta"})`);
    const errado = await fetch(`${base}/${caminho}/entrar`, {
      method: "POST",
      redirect: "manual",
      body: new URLSearchParams({ codigo: "codigo-errado-de-teste" }),
    }).catch(() => null);
    if (!errado || ![401, 429].includes(errado.status)) problemas.push(`${caminho}: código errado não foi recusado (${errado?.status ?? "sem resposta"})`);
  }
  return problemas;
}

if (tem("--conferir") && !tem("--enviar")) {
  if (!cf.endereco) recusar("Sem endereço:", [`${cfArq} não tem "endereco": publique uma vez com --enviar`]);
  const problemas = await conferirNoAr(cf.endereco);
  if (problemas.length) recusar(`Conferência no ar (${cf.endereco}) com problemas:`, problemas);
  console.log(`\nNo ar e conferido: ${cf.endereco} (tela de acesso, imagem da prévia e código errado recusado em todas as propostas).`);
  process.exit(0);
}

if (!tem("--enviar")) {
  writeFileSync(cfArq, JSON.stringify(cf, null, 2) + "\n");
  console.log(`\nEnsaio ok. Saída em ${SAIDA}. Nada foi enviado: para publicar, rode de novo com --enviar.`);
  process.exit(0);
}

// 4. Publica. Login pelo navegador, uma vez por computador: npx wrangler@4 login.
const quem = wrangler(["whoami"]);
if (!quem.ok || /not authenticated|não autenticado|wrangler login/i.test(quem.saida))
  recusar("Sem login na Cloudflare:", ["peça para a pessoa rodar  npx wrangler@4 login  (abre o navegador; no Claude Code: ! npx wrangler@4 login)"]);

const segredos = wrangler(["secret", "list"]);
const temSegredo = segredos.ok && segredos.saida.includes('"SEGREDO"');
const segredoArq = join(BUILD, "segredo-temporario.json");
let deploy;
try {
  const params = ["deploy"];
  if (!temSegredo) {
    // Primeira publicação: o segredo que assina os cookies nasce aqui, vai direto para a Cloudflare e o
    // arquivo temporário some logo depois. Ninguém precisa conhecê-lo.
    writeFileSync(segredoArq, JSON.stringify({ SEGREDO: randomBytes(32).toString("hex") }), { mode: 0o600 });
    chmodSync(segredoArq, 0o600);
    params.push("--secrets-file", segredoArq);
  }
  deploy = wrangler(params, { mostrar: true });
} finally {
  rmSync(segredoArq, { force: true });
}
if (!deploy.ok) {
  const dicas = [];
  if (/more than one account/i.test(deploy.saida))
    dicas.push(`há mais de uma conta na Cloudflare: rode npx wrangler@4 whoami, escolha a conta e grave "contaId" em ${cfArq}`);
  if (/custom domain|zone/i.test(deploy.saida) && dominio) dicas.push(`o domínio ${dominio} precisa estar na Cloudflare e sem registro CNAME com o mesmo nome`);
  recusar("A publicação falhou (saída do wrangler acima).", dicas.length ? dicas : ["leia a mensagem do wrangler acima"]);
}
writeFileSync(anteriorArq, JSON.stringify(manifesto));
const endereco = dominio ? `https://${dominio}` : deploy.saida.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/i)?.[0];
if (endereco) cf.endereco = endereco;
cf.worker = worker;
writeFileSync(cfArq, JSON.stringify(cf, null, 2) + "\n");
if (!endereco) recusar("Publicado, mas não achei o endereço na saída do wrangler:", [`grave "endereco" em ${cfArq} e rode --conferir`]);

const problemas = await conferirNoAr(endereco);
if (problemas.length) recusar(`Publicado em ${endereco}, mas a conferência no ar achou problemas:`, problemas);
console.log(`\nNo ar e conferido: ${endereco}`);
for (const caminho of Object.keys(entradas)) console.log(`  ${endereco}/${caminho}/`);
