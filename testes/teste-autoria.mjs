// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Prova da trava de autoria: copia o kit para uma pasta temporária, adultera os créditos de vários jeitos e confere
// que as ferramentas param. A cópia limpa tem de passar.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = mkdtempSync(join(tmpdir(), "kit-autoria-"));
const ARQUIVOS = execFileSync("git", ["-C", RAIZ, "ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
const TEXTO = /\.(md|mjs|cjs|js|ts|tsx|sh|py|yml|json|html|css)$|LICENSE$/;

let n = 0;
function copia() {
  const destino = join(TMP, `kit-${++n}`);
  for (const rel of ARQUIVOS) cpSync(join(RAIZ, rel), join(destino, rel));
  return destino;
}
function trocarEmTudo(kit, de, para) {
  for (const rel of ARQUIVOS.filter((r) => TEXTO.test(r))) {
    const arq = join(kit, rel);
    const t = readFileSync(arq, "utf8");
    if (t.includes(de)) writeFileSync(arq, t.split(de).join(para));
  }
}
const rodar = (kit, rel, args = []) => spawnSync("node", [join(kit, rel), ...args], { cwd: kit, encoding: "utf8" });
const conferir = (kit) => rodar(kit, "skills/propostas/ferramentas/autoria.mjs", ["--conferir", kit]);

let falhas = 0;
function espera(nome, r, recusa, trecho = "Trava de autoria") {
  const saida = (r.stdout || "") + (r.stderr || "");
  const ok = recusa ? r.status === 3 && saida.includes(trecho) : r.status === 0;
  if (ok) console.log(`ok    ${nome}`);
  else {
    falhas++;
    console.log(`FALHA ${nome} (saiu com ${r.status})\n${saida.split("\n").slice(0, 6).join("\n")}`);
  }
}

try {
  espera("o kit oficial passa", conferir(copia()), false);

  let kit = copia();
  trocarEmTudo(kit, "dantaspaulo", "fulano");
  espera("localizar e substituir o usuário do GitHub em tudo: recusa", conferir(kit), true);
  espera("  e a publicação também para", rodar(kit, "skills/propostas/publicacao/publicar.mjs"), true);
  espera("  e o build da proposta também para", rodar(kit, "skills/propostas/modelo/build.mjs"), true);

  kit = copia();
  trocarEmTudo(kit, "Paulo Sérgio Dantas", "Fulano de Tal");
  espera("trocar o nome do autor em tudo: recusa", conferir(kit), true);

  kit = copia();
  const publicar = join(kit, "skills/propostas/publicacao/publicar.mjs");
  writeFileSync(publicar, readFileSync(publicar, "utf8").replace(/^\/\/ Kit de Propostas · .*\n/m, ""));
  espera("tirar a linha de crédito de um arquivo: recusa e diz qual", conferir(kit), true, "publicar.mjs: a linha de crédito foi retirada");

  kit = copia();
  rmSync(join(kit, "AUTORIA.json"));
  espera("apagar o manifesto de autoria: recusa", conferir(kit), true, "AUTORIA.json");

  kit = copia();
  const skill = join(kit, "skills/propostas/SKILL.md");
  writeFileSync(skill, readFileSync(skill, "utf8").replace(/^ {2}author: .*$/m, "  author: Outra Pessoa"));
  espera("trocar o autor nos metadados da skill: recusa", conferir(kit), true, "SKILL.md: o autor nos metadados foi trocado");
} finally {
  rmSync(TMP, { recursive: true, force: true });
}
console.log(falhas ? `\n${falhas} falha(s) na trava de autoria` : "trava de autoria: as 7 adulterações foram recusadas e o oficial passou");
process.exit(falhas ? 1 : 0);
