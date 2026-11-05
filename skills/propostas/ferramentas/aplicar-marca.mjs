#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Aplica a marca do negócio numa proposta: grava src/marca.json (dados do negócio, cores, fontes, logo)
// e src/marca.css (tokens do Tailwind) a partir do perfil feito na entrevista.
//
//   node aplicar-marca.mjs <perfil.json> <pasta-da-proposta>
//
// A proposta guarda uma cópia da marca: mudar o perfil depois não muda proposta já enviada. Para trazer a
// marca nova para uma proposta, rode de novo e gere a página de novo.
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { derivarPaleta, favicon, FONTES_PADRAO, marcaCss, urlDasFontes } from "./paleta.mjs";

const TIPOS = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const LIMITE_LOGO_KB = 200;

export function lerPerfil(arquivo) {
  const perfil = JSON.parse(readFileSync(arquivo, "utf8"));
  const faltas = [];
  if (!perfil.negocio?.nome) faltas.push("negocio.nome");
  if (!perfil.marca?.cores?.marca) faltas.push("marca.cores.marca");
  if (faltas.length) throw new Error(`perfil incompleto (${arquivo}): falta ${faltas.join(", ")}`);
  return perfil;
}

function logoComoDado(base, rel, avisos) {
  if (!rel) return null;
  const arq = resolve(base, rel);
  if (!existsSync(arq)) {
    avisos.push(`logo não encontrado: ${arq}`);
    return null;
  }
  const tipo = TIPOS[extname(arq).toLowerCase()];
  if (!tipo) {
    avisos.push(`formato de logo não aceito (${extname(arq)}): use SVG, PNG, JPG ou WebP`);
    return null;
  }
  const kb = statSync(arq).size / 1024;
  if (kb > LIMITE_LOGO_KB) avisos.push(`logo com ${kb.toFixed(0)} KB: acima de ${LIMITE_LOGO_KB} KB a página fica pesada. Prefira SVG ou PNG menor.`);
  return `data:${tipo};base64,${readFileSync(arq).toString("base64")}`;
}

export function montarMarca(perfil, base) {
  const avisos = [];
  const c = perfil.marca.cores;
  const paleta = derivarPaleta({ marca: c.marca, destaque: c.destaque || undefined, escura: c.escura || undefined, clara: c.clara || undefined });
  avisos.push(...paleta.avisos);
  const fontes = { ...FONTES_PADRAO, ...(perfil.marca.fontes ?? {}) };
  const n = perfil.negocio;
  const marca = {
    _leia: "Gerado pelo aplicar-marca do Kit de Propostas a partir do perfil do negócio. Não edite aqui: mude o perfil e aplique de novo.",
    negocio: {
      nome: n.nome,
      razaoSocial: n.razaoSocial ?? "",
      cnpj: n.cnpj ?? "",
      endereco: n.endereco ?? "",
      cidade: n.cidade ?? "",
      site: n.site ?? "",
      email: n.email ?? "",
      whatsapp: String(n.whatsapp ?? "").replace(/\D/g, ""),
      whatsappVisivel: n.whatsappVisivel ?? "",
      assinatura: { nome: n.assinatura?.nome ?? "", cargo: n.assinatura?.cargo ?? "" },
      sigla: (n.sigla ?? n.nome.replace(/[^A-Za-z]/g, "").slice(0, 3)).toUpperCase(),
    },
    cores: paleta.cores,
    fontes: { ...fontes, url: urlDasFontes(fontes) },
    logo: logoComoDado(base, perfil.marca.logo, avisos),
    logoClaro: logoComoDado(base, perfil.marca.logoClaro, avisos),
    favicon: favicon(paleta.cores, n.nome),
    comercial: {
      validadeDias: 14,
      pagamento: "Pix, boleto ou transferência",
      notaFiscal: true,
      garantiaDias: 30,
      sustentacao: "contratada à parte",
      ...(perfil.comercial ?? {}),
    },
  };
  return { marca, css: marcaCss(paleta, fontes), avisos, relatorio: paleta.relatorio };
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
  const [arquivoPerfil, pasta] = process.argv.slice(2);
  if (!arquivoPerfil || !pasta) {
    console.error("uso: node aplicar-marca.mjs <perfil.json> <pasta-da-proposta>");
    process.exit(2);
  }
  try {
    const perfil = lerPerfil(arquivoPerfil);
    const destino = resolve(pasta);
    if (!existsSync(join(destino, "src"))) throw new Error(`não achei ${join(destino, "src")}: é a pasta de uma proposta?`);
    const { marca, css, avisos } = montarMarca(perfil, dirname(resolve(arquivoPerfil)));
    writeFileSync(join(destino, "src", "marca.json"), JSON.stringify(marca, null, 2) + "\n");
    writeFileSync(join(destino, "src", "marca.css"), css);
    console.log(`ok: marca de "${marca.negocio.nome}" aplicada em ${destino}/src (marca.json e marca.css)`);
    for (const a of avisos) console.log(`aviso: ${a}`);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }
}
