// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// O que o build gravou para os scripts e para a publicação: caminho, arquivos, validade e modo.
const fs = require('fs');
const arq = '.build/publicacao.json';
if (!fs.existsSync(arq)) {
  console.error('falta .build/publicacao.json: rode o build primeiro (npm run build ou pnpm build)');
  process.exit(1);
}
module.exports = JSON.parse(fs.readFileSync(arq, 'utf8'));
