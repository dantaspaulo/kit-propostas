// Captura avulsa de qualquer HTML: node scripts/foto.cjs <html> <png> [largura] [altura] [espera ms] [inteira]
const { chromium } = require('./navegador.cjs');
const path = require('path');
(async () => {
  const [, , html, png, w = '1440', h = '900', espera = '1500', inteira] = process.argv;
  if (!html || !png) {
    console.error('uso: node scripts/foto.cjs <html> <png> [largura] [altura] [espera] [inteira]');
    process.exit(2);
  }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto(/^https?:/.test(html) ? html : 'file://' + path.resolve(html));
  await p.waitForTimeout(+espera);
  await p.screenshot({ path: png, fullPage: !!inteira });
  await b.close();
  console.log('ok', png);
})();
