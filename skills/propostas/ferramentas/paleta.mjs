#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Monta a paleta inteira da proposta a partir da cor da marca, conferindo o contraste de cada par que
// aparece na página. Nada de cor escolhida no olho: cada token sai de uma regra e de uma conta.
//
//   node paleta.mjs --marca "#5B5BD6" [--destaque "#..."] [--escura "#..."] [--clara "#..."]
//
// --marca     a cor principal da marca (dá o tom dos neutros e, sem --destaque, dos destaques)
// --destaque  cor dos destaques, se for outra (por exemplo, a do botão do site)
// --escura    a cor escura da marca, se houver (vira o texto e o botão escuro, se tiver contraste)
// --clara     o fundo claro da marca, se houver (vira o fundo da página, se for claro o bastante)
//
// Sai um JSON com as cores, o relatório de contraste e os avisos. Também é módulo: derivarPaleta().
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const limitar = (x, a, b) => Math.min(b, Math.max(a, x));

function hexParaRgb(hex) {
  const h = String(hex).trim().replace(/^#/, "");
  const cheio = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(cheio)) throw new Error(`cor inválida: ${hex} (use #RRGGBB)`);
  return [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16) / 255);
}
const paraLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const deLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbParaOklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map(paraLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { L, C, h };
}

function oklchParaLinear({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const dentro = (lin) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

// Cor dentro do sRGB: se a combinação pedida não existe na tela, reduz a saturação até existir.
function oklchParaHex({ L, C, h }) {
  let lin = oklchParaLinear({ L, C, h });
  if (!dentro(lin)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const meio = (lo + hi) / 2;
      if (dentro(oklchParaLinear({ L, C: meio, h }))) lo = meio;
      else hi = meio;
    }
    lin = oklchParaLinear({ L, C: lo, h });
  }
  return (
    "#" +
    lin
      .map((c) => Math.round(limitar(deLinear(limitar(c, 0, 1)), 0, 1) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function luminancia(hex) {
  const [r, g, b] = hexParaRgb(hex).map(paraLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const oklch = (hex) => rgbParaOklch(hexParaRgb(hex));
const cor = (L, C, h) => oklchParaHex({ L: limitar(L, 0, 1), C: Math.max(0, C), h: ((h % 360) + 360) % 360 });

// O tom mais perto do original que passa nas regras, andando só na luminosidade.
function maisPerto(hex, passa, direcao) {
  if (passa(hex)) return hex;
  const { L, C, h } = oklch(hex);
  for (let passo = 0.005; passo <= 1; passo += 0.005) {
    const candidato = cor(L + direcao * passo, C, h);
    if (passa(candidato)) return candidato;
    if (L + direcao * passo <= 0 || L + direcao * passo >= 1) break;
  }
  return null;
}

export function derivarPaleta({ marca, destaque, escura, clara } = {}) {
  if (!marca) throw new Error("falta --marca");
  const M = oklch(marca);
  const avisos = [];
  const quaseCinza = M.C < 0.035;
  if (quaseCinza && !destaque)
    avisos.push(
      "A cor da marca é quase cinza: os destaques vão sair cinza. Escolha uma cor de destaque (a do botão do site, por exemplo) e passe em --destaque.",
    );
  const h = M.h;
  const c = quaseCinza ? 0 : M.C;

  let fundo = cor(0.968, Math.min(0.012, c * 0.12), h);
  if (clara) {
    const K = oklch(clara);
    if (K.L >= 0.93 && K.C <= 0.04) fundo = clara.toLowerCase();
    else avisos.push(`O fundo claro ${clara} não serve de fundo de página (escuro ou colorido demais): usei um derivado da marca.`);
  }
  const papel = cor(0.993, Math.min(0.005, c * 0.05), h);
  let tinta = cor(0.235, Math.min(0.035, c * 0.3), h);
  if (escura) {
    if (contraste(escura, fundo) >= 10 && contraste(escura, papel) >= 10) tinta = escura.toLowerCase();
    else avisos.push(`A cor escura ${escura} não tem contraste para texto: usei um derivado da marca.`);
  }
  const tinta2 = cor(0.175, Math.min(0.03, c * 0.25), h);
  const noite = cor(0.215, Math.min(0.045, c * 0.35), h);
  const linha = cor(0.875, Math.min(0.02, c * 0.15), h);
  const apoio = maisPerto(cor(0.5, Math.min(0.025, c * 0.18), h), (x) => contraste(x, fundo) >= 4.6 && contraste(x, papel) >= 4.6, -1);
  const noiteLinha = cor(0.33, Math.min(0.035, c * 0.25), h);
  const noiteApoio = maisPerto(cor(0.76, Math.min(0.03, c * 0.2), h), (x) => contraste(x, noite) >= 4.8, 1);

  const base = (destaque || marca).toLowerCase();
  const D = oklch(base);
  // Destaque: em fundo escuro (título em destaque, selo) e como fundo de botão com texto escuro.
  const destaqueCor =
    (D.L >= 0.62 && contraste(tinta, base) >= 4.5 && contraste(base, noite) >= 4.8 ? base : null) ??
    maisPerto(base, (x) => contraste(tinta, x) >= 4.5 && contraste(x, noite) >= 4.8, 1) ??
    cor(0.86, Math.min(D.C, 0.12), D.h);
  // Destaque forte: texto e detalhes sobre o fundo claro (serifa do título, bolinha do olho, barra de leitura).
  const destaqueForte =
    maisPerto(base, (x) => contraste(x, fundo) >= 4.6 && contraste(x, papel) >= 4.6, -1) ?? cor(0.45, Math.min(D.C, 0.12), D.h);

  const tom1 = cor(0.935, Math.min(0.014, c * 0.1 + 0.004), h + 35);
  const tom2 = cor(0.94, Math.min(0.022, c * 0.18), h);
  const tom3 = cor(0.915, Math.min(0.06, D.C * 0.45), D.h);
  const selecao = cor(0.88, Math.min(0.09, D.C * 0.6), D.h);
  const passos = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const luzes = [0.985, 0.97, 0.925, 0.87, 0.72, 0.56, 0.44, 0.37, 0.27, 0.205, 0.145];
  const neutros = Object.fromEntries(passos.map((p, i) => [p, cor(luzes[i], Math.min(0.012, c * 0.08), h)]));

  const cores = {
    marca: marca.toLowerCase(),
    tinta,
    tinta2,
    fundo,
    papel,
    destaque: destaqueCor,
    destaqueForte,
    linha,
    apoio,
    noite,
    noiteLinha,
    noiteApoio,
    tom1,
    tom2,
    tom3,
    selecao,
  };
  const pares = [
    ["texto sobre o fundo", "tinta", "fundo", 7],
    ["texto de apoio sobre o fundo", "apoio", "fundo", 4.5],
    ["texto de apoio sobre o cartão", "apoio", "papel", 4.5],
    ["destaque forte sobre o fundo", "destaqueForte", "fundo", 4.5],
    ["texto escuro sobre o destaque (botão)", "tinta", "destaque", 4.5],
    ["destaque sobre a seção escura", "destaque", "noite", 4.5],
    ["texto claro sobre a seção escura", "papel", "noite", 7],
    ["apoio sobre a seção escura", "noiteApoio", "noite", 4.5],
    ["texto claro sobre o botão escuro", "papel", "tinta", 7],
  ];
  const relatorio = pares.map(([nome, a, b, minimo]) => {
    const r = contraste(cores[a], cores[b]);
    return { par: nome, cores: `${a} sobre ${b}`, contraste: Math.round(r * 100) / 100, minimo, ok: r >= minimo };
  });
  for (const r of relatorio) if (!r.ok) avisos.push(`Contraste baixo (${r.contraste}:1, mínimo ${r.minimo}:1): ${r.par}.`);
  if (destaqueCor !== base)
    avisos.push(`O destaque ficou ${destaqueCor} (a cor ${base} não tinha contraste com o texto escuro ou com a seção escura).`);
  if (destaqueForte !== base) avisos.push(`O destaque forte ficou ${destaqueForte} (a cor ${base} não tinha contraste sobre o fundo claro).`);
  return { cores, neutros, relatorio, avisos };
}

export const FONTES_PADRAO = { texto: "Manrope", titulo: "Manrope", mono: "DM Mono", serifa: "Georgia" };
const SISTEMA = new Set(["georgia", "times new roman", "arial", "helvetica", "system-ui", "verdana"]);

export function urlDasFontes(fontes = FONTES_PADRAO) {
  const pesos = { texto: "wght@400;500;600;700;800", titulo: "wght@500;600;700;800", mono: "wght@400;500", serifa: "wght@400" };
  const vistas = new Map();
  for (const papel of ["texto", "titulo", "mono", "serifa"]) {
    const nome = fontes[papel];
    if (!nome || SISTEMA.has(nome.toLowerCase())) continue;
    const anterior = vistas.get(nome);
    const lista = new Set([...(anterior ?? []), ...pesos[papel].replace("wght@", "").split(";")]);
    vistas.set(nome, [...lista].sort((a, b) => a - b));
  }
  const familias = [...vistas].map(([nome, p]) => `family=${nome.trim().replace(/ +/g, "+")}:wght@${p.join(";")}`);
  return `https://fonts.googleapis.com/css2?${familias.join("&")}&display=swap`;
}

const pilha = (nome, reserva) => `"${nome}", ${reserva}`;

// O CSS da marca para o Tailwind v4: tokens da proposta e os neutros puxados para o tom da marca, que é o
// que faz um bloco novo (shadcn ou React Bits Pro) já entrar com a cara da marca.
export function marcaCss({ cores, neutros }, fontes = FONTES_PADRAO) {
  const nomes = {
    tinta: "tinta",
    tinta2: "tinta-2",
    fundo: "fundo",
    papel: "papel",
    destaque: "destaque",
    destaqueForte: "destaque-forte",
    linha: "linha",
    apoio: "apoio",
    noite: "noite",
    noiteLinha: "noite-linha",
    noiteApoio: "noite-apoio",
    tom1: "tom-1",
    tom2: "tom-2",
    tom3: "tom-3",
    selecao: "selecao",
    marca: "marca",
  };
  const linhas = [
    "/* Gerado pelo aplicar-marca do Kit de Propostas a partir do perfil do negócio. Não edite aqui:",
    "   mude a marca no perfil e aplique de novo (skill propostas). */",
    "@theme {",
    `  --font-sans: ${pilha(fontes.texto, "Arial, sans-serif")};`,
    `  --font-titulo: ${pilha(fontes.titulo, "Arial, sans-serif")};`,
    `  --font-mono: ${pilha(fontes.mono, "ui-monospace, monospace")};`,
    `  --font-serif: ${pilha(fontes.serifa, 'Georgia, "Times New Roman", serif')};`,
    ...Object.entries(nomes).map(([k, v]) => `  --color-${v}: ${cores[k]};`),
    ...Object.entries(neutros).map(([k, v]) => `  --color-neutral-${k}: ${v};`),
    "}",
    "",
  ];
  return linhas.join("\n");
}

export function favicon(cores, inicial) {
  const letra = (inicial || "P").trim().charAt(0).toUpperCase().replace(/[<>&"']/g, "");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='${cores.noite}'/><text x='32' y='43' text-anchor='middle' font-family='Arial,sans-serif' font-size='34' font-weight='800' fill='${cores.destaque}'>${letra}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
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
  const args = process.argv.slice(2);
  const pegar = (nome) => {
    const i = args.indexOf(`--${nome}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  try {
    const paleta = derivarPaleta({ marca: pegar("marca"), destaque: pegar("destaque"), escura: pegar("escura"), clara: pegar("clara") });
    console.log(JSON.stringify(paleta, null, 2));
    if (paleta.relatorio.some((r) => !r.ok)) process.exitCode = 1;
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }
}
