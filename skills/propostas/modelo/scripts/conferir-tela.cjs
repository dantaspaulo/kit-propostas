// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Confere o texto como ele aparece na tela (não no código): sobra de conta quebrada e, no valor direto,
// qualquer menção a "opção". O código carrega o texto dos dois modos; quem decide o que aparece é a tela.
const pub = require('./publicacao.cjs');

module.exports = async function conferirTela(page) {
  await page.waitForTimeout(1500); // números que contam até o valor terminam de contar
  const texto = await page.evaluate(() => document.body.innerText);
  const erros = [];
  for (const [re, nome] of [
    [/\bundefined\b/, 'undefined'],
    [/\bNaN\b/, 'NaN'],
    [/\[object Object\]/, '[object Object]'],
    [/Invalid Date/, 'Invalid Date'],
    [/R\$\s*0(?![,.\d])/, 'valor R$ 0'],
  ]) {
    if (re.test(texto)) erros.push(`a página mostra "${nome}": algum campo do data.ts está faltando ou com o tipo errado`);
  }
  if (pub.modo === 'direto') {
    const m = texto.match(/[^.\n]{0,60}\bop[çc](ão|ões|ao|oes)\b[^.\n]{0,40}/i);
    if (m) erros.push(`valor direto não fala em opção, e a página diz: "${m[0].trim()}"`);
  }
  return erros;
};
