// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// A paleta tem que passar no contraste para qualquer cor de marca, das claras às escuras, das vivas às cinzas.
import { contraste, derivarPaleta, marcaCss, urlDasFontes } from "../skills/propostas/ferramentas/paleta.mjs";

const cores = ["#5B5BD6", "#B8DF70", "#0B3D91", "#FFD400", "#E53935", "#111111", "#FFFFFF", "#00A884", "#7C3AED", "#F97316", "#0EA5E9", "#8B5E3C"];
let falhas = 0;
const checar = (nome, cond) => {
  if (!cond) {
    falhas++;
    console.log("FALHA " + nome);
  }
};
for (const c of cores) {
  const p = derivarPaleta({ marca: c });
  for (const r of p.relatorio) checar(`${c}: ${r.par} (${r.contraste}:1, mínimo ${r.minimo})`, r.ok);
  for (const [k, v] of Object.entries(p.cores)) checar(`${c}: ${k} em #rrggbb`, /^#[0-9a-f]{6}$/.test(v));
  checar(`${c}: CSS com os tokens`, marcaCss(p).includes("--color-destaque-forte:") && marcaCss(p).includes("--color-neutral-950:"));
}
checar("cor quase cinza avisa", derivarPaleta({ marca: "#777777" }).avisos.some((a) => a.includes("quase cinza")));
checar("destaque separado é usado", derivarPaleta({ marca: "#0B3D91", destaque: "#F97316" }).cores.destaque !== derivarPaleta({ marca: "#0B3D91" }).cores.destaque);
checar("escura sem contraste é recusada", derivarPaleta({ marca: "#5B5BD6", escura: "#777777" }).avisos.some((a) => a.includes("não tem contraste")));
checar("contraste preto e branco é 21", Math.round(contraste("#000000", "#ffffff")) === 21);
checar("fontes sem repetir família", (urlDasFontes({ texto: "Manrope", titulo: "Manrope", mono: "DM Mono", serifa: "Georgia" }).match(/family=/g) || []).length === 2);
let invalida = false;
try {
  derivarPaleta({ marca: "azul" });
} catch {
  invalida = true;
}
checar("cor inválida é recusada", invalida);
console.log(falhas ? `\n${falhas} falha(s) na paleta` : `paleta: ${cores.length} cores de marca, todos os pares com contraste`);
process.exit(falhas ? 1 : 0);
