// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Acha as ferramentas que ficam fora da proposta (o navegador sem tela e o montador de PDF): primeiro na
// própria proposta, depois no ambiente do kit (~/.kit-propostas/runtime, preparado pelo ambiente.sh).
const path = require('path');
const os = require('os');

const casa = process.env.KIT_PROPOSTAS_HOME || path.join(os.homedir(), '.kit-propostas');

function carregar(nome) {
  for (const base of [process.cwd(), path.join(casa, 'runtime')]) {
    try {
      return require(require.resolve(nome, { paths: [base] }));
    } catch {}
  }
  throw new Error(
    `${nome} não encontrado. Prepare o ambiente uma vez: bash <pasta do kit>/skills/propostas/ferramentas/ambiente.sh`,
  );
}

module.exports = { carregar, casa };
Object.defineProperty(module.exports, 'chromium', { get: () => carregar('playwright-core').chromium });
