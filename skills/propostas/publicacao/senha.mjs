#!/usr/bin/env node
// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Grava o SHA-256 do código de acesso de uma proposta. O código em si não fica em arquivo nenhum: quem precisa
// dele é o cliente, que o recebe na mensagem junto com o link.
//
//   node senha.mjs <pasta-da-proposta> --gerar          sorteia um código (palavra-palavra-palavra-00), mostra UMA vez
//   printf '%s' 'CODIGO' | node senha.mjs <pasta>        usa o código dado (mínimo 12 caracteres)
//
// Por que sortear: um código montado com a data e o nome do projeto é fácil de adivinhar, porque a data e o
// título aparecem na própria tela de acesso. O sorteado tem centenas de milhões de combinações (3 palavras
// diferentes de uma lista de mais de 200, e 2 algarismos), e o portão limita as tentativas por endereço e por proposta.
import { createHash, randomInt } from "node:crypto";
import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PALAVRAS = `abelha agulha alface ameixa amora anzol arara areia arroz asfalto atum aveia azeite bala balde bambu banana
barco batata baleia bengala bicicleta biscoito bola bolo bombom borboleta brisa bule burro cabana cacau cacto cadeira
caderno cafe caju calda camelo caneca canela canoa capim caqui caracol carambola carvalho casaco castanha cavalo cebola
cenoura cereja chave chuva cidade cimento cipreste cobre coco coelho cometa concha coral corda coruja couve cravo
cristal cupim dado damasco dente diamante disco doce dragao duna eclipse elefante enxada escada esponja estrela farol
feijao figo flauta floresta foguete folha formiga fubá gaivota galho garfo gato geleia girafa girassol goiaba golfinho
granito grilo guarda guitarra horta hortela ilha ipe jabuti jacare janela jangada jarra jasmim jiboia joaninha
lagarta lago laranja lareira lata leque limao lince lirio lobo lontra lua macaco madeira manga marfim margarida
martelo mel melancia mesa milho mingau moinho montanha morango musgo navio neblina ninho nuvem oceano onda orvalho
ostra ouro ovelha palmeira panela papagaio pato pedra peixe pena pera perola pimenta pinheiro pipa piano pizza planeta
pombo ponte potro prata praia quiabo quintal raposa rede relogio rio rocha roda romã rosa sabia sapato seda serra
sino sol sorvete tapete tatu teia telha tigre tomate trem trevo trigo tucano tulipa uva vale vela veleiro vento
vulcao xicara zebra`
  .split(/\s+/)
  .map((p) => p.normalize("NFD").replace(/[̀-ͯ]/g, ""))
  .filter((p) => /^[a-z]{3,10}$/.test(p));

/** O mesmo jeito do portão: sem espaços e em minúsculas. */
const normalizar = (codigo) => String(codigo || "").trim().toLowerCase().replace(/\s+/g, "");

export function sortear() {
  const escolhidas = [];
  while (escolhidas.length < 3) {
    const palavra = PALAVRAS[randomInt(PALAVRAS.length)];
    if (!escolhidas.includes(palavra)) escolhidas.push(palavra);
  }
  return `${escolhidas.join("-")}-${String(randomInt(100)).padStart(2, "0")}`;
}

async function main() {
  const [pasta, opcao] = process.argv.slice(2);
  if (!pasta || !existsSync(resolve(pasta))) {
    console.error("uso: node senha.mjs <pasta-da-proposta> --gerar   (ou: printf '%s' 'CODIGO' | node senha.mjs <pasta>)");
    process.exit(2);
  }
  let codigo;
  if (opcao === "--gerar") codigo = sortear();
  else {
    let entrada = "";
    for await (const parte of process.stdin) entrada += parte;
    codigo = normalizar(entrada);
    if (codigo.length < 12) {
      console.error("código curto demais (mínimo 12 caracteres). Prefira --gerar.");
      process.exit(1);
    }
  }
  const hash = createHash("sha256").update(normalizar(codigo)).digest("hex");
  mkdirSync(join(resolve(pasta), ".build"), { recursive: true });
  writeFileSync(join(resolve(pasta), ".build", "senha.sha256"), hash + "\n");
  if (opcao === "--gerar") console.log(`código de acesso: ${codigo}\n(aparece só agora: vai na mensagem ao cliente e não fica em arquivo nenhum)`);
  console.log(`ok: hash ${hash.slice(0, 12)}… gravado em ${join(pasta, ".build", "senha.sha256")}`);
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
if (chamadoDireto()) await main();
