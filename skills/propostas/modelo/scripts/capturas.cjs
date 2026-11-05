// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Percorre a página rolando (para disparar as animações) e salva uma captura por tela em .build/cap/.
//   node scripts/capturas.cjs <largura> <altura> <prefixo> [maxTelas]
//   node scripts/capturas.cjs 1440 900 desk     e     node scripts/capturas.cjs 390 844 cel 60
// Sai com 1 se a página tiver erro, rolagem lateral ou texto proibido na tela.
const { chromium } = require('./navegador.cjs');
const pub = require('./publicacao.cjs');
const conferirTela = require('./conferir-tela.cjs');
const path = require('path');
const fs = require('fs');

(async () => {
  const [, , w = '1440', h = '900', prefixo = 'desk', max = '40'] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const erros = [];
  page.on('pageerror', (e) => erros.push('erro na página: ' + String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) erros.push('console: ' + m.text());
  });
  fs.mkdirSync('.build/cap', { recursive: true });
  for (const f of fs.readdirSync('.build/cap')) if (f.startsWith(prefixo + '-')) fs.rmSync(path.join('.build/cap', f));
  await page.goto('file://' + path.resolve(pub.html));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  const larguraDoc = await page.evaluate(() => document.documentElement.scrollWidth);
  let i = 0;
  for (let y = 0; y < altura && i < +max; y += +h - 60, i++) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `.build/cap/${prefixo}-${String(i).padStart(2, '0')}.png` });
  }
  erros.push(...(await conferirTela(page)));
  if (larguraDoc > +w) erros.push(`rolagem lateral: a página tem ${larguraDoc}px numa tela de ${w}px`);
  console.log(JSON.stringify({ altura, larguraDoc, tela: +w, capturas: i, pasta: '.build/cap' }));
  if (erros.length) {
    console.log('ERROS:\n' + [...new Set(erros)].join('\n'));
    process.exitCode = 1;
  }
  await browser.close();
})();
