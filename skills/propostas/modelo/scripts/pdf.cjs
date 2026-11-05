// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
//
// Gera o PDF igual à tela: abre a página no modo PDF (?pdf), troca cada canvas por uma imagem dele, corta a
// página em fatias que só quebram entre blocos e junta as fatias num PDF só. A impressão do navegador sai
// com cara de celular, corta cartões e perde as animações; este caminho não.
//   node scripts/pdf.cjs [saida.pdf]
// Grava em .build/pdf-origem.txt o SHA-256 da página usada: a publicação recusa PDF de outra versão.
const { carregar, chromium } = require('./navegador.cjs');
const pub = require('./publicacao.cjs');
const conferirTela = require('./conferir-tela.cjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const LARGURA = 1440;
const ALTURA_MAX = 2036; // proporção do papel A (1:1,414)
const ALTURA_MIN = 700;

(async () => {
  const saida = process.argv[2] || pub.pdf;
  const { PDFDocument } = carregar('pdf-lib');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: LARGURA, height: 900 }, deviceScaleFactor: 2 });
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto('file://' + path.resolve(pub.html) + '?pdf=1');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  // Rola a página inteira para montar o que só aparece perto da tela.
  const alturaTotal = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alturaTotal; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  erros.push(...(await conferirTela(page)));
  if (erros.length) {
    console.error('Página com erro, PDF recusado:\n' + erros.join('\n'));
    await browser.close();
    process.exit(1);
  }

  // Canvas vira imagem: o PDF não imprime canvas de forma confiável.
  for (const c of await page.$$('canvas')) {
    await c.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const caixa = await c.boundingBox();
    if (!caixa || caixa.width < 2 || caixa.height < 2) continue;
    const jpg = await c.screenshot({ type: 'jpeg', quality: 86 });
    await c.evaluate((el, dados) => {
      const img = document.createElement('img');
      img.src = 'data:image/jpeg;base64,' + dados;
      const r = el.getBoundingClientRect();
      img.style.cssText = `position:absolute;left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${r.width}px;height:${r.height}px;pointer-events:none`;
      el.parentElement.appendChild(img);
      el.style.visibility = 'hidden';
    }, jpg.toString('base64'));
  }

  // Animações contínuas congeladas no estado atual.
  await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important}' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  // Pontos seguros de corte: topo de seção e de bloco, nunca no meio de um bloco que não pode ser cortado.
  const { altura, secoes, candidatos } = await page.evaluate(() => {
    const faixa = (el) => {
      const r = el.getBoundingClientRect();
      return [Math.round(r.top + window.scrollY), Math.round(r.bottom + window.scrollY)];
    };
    const secoes = [...document.querySelectorAll('main > section, footer')].map((el) => faixa(el)[0]);
    const atomicos = ['.sem-quebra', 'main section article', 'figure', '.kit-ui', '.kit-cartao', 'main section li', 'main section h2', 'main section dl'];
    const blocos = [...document.querySelectorAll(atomicos.join(','))].map(faixa).filter(([a, b]) => b - a > 4);
    const topos = [...document.querySelectorAll(atomicos.concat(['.kit-wrap > div']).join(','))].map((el) => faixa(el)[0]);
    const dentro = (y) => blocos.some(([a, b]) => y > a + 1 && y < b - 1);
    const candidatos = [...new Set([...secoes, ...topos])].filter((y) => !dentro(y) || secoes.includes(y));
    return { altura: document.documentElement.scrollHeight, secoes, candidatos };
  });
  candidatos.sort((a, b) => a - b);
  const ehSecao = new Set(secoes);

  const cortes = [0];
  let y = 0;
  while (altura - y > ALTURA_MAX) {
    const faixa = candidatos.filter((c) => c > 0 && c < altura && c >= y + ALTURA_MIN && c <= y + ALTURA_MAX);
    const secoesNaFaixa = faixa.filter((c) => ehSecao.has(c) && c >= y + ALTURA_MAX * 0.55);
    const corte = secoesNaFaixa.length ? secoesNaFaixa.at(-1) : faixa.length ? faixa.at(-1) : y + ALTURA_MAX;
    cortes.push(corte);
    y = corte;
  }
  cortes.push(altura);

  // Uma página de PDF por fatia, com a altura exata da fatia.
  await page.emulateMedia({ media: 'screen' });
  const final = await PDFDocument.create();
  for (let i = 0; i < cortes.length - 1; i++) {
    const a = cortes[i];
    const h = cortes[i + 1] - a;
    await page.evaluate(
      ({ a, h }) => {
        document.getElementById('root').style.transform = `translateY(-${a}px)`;
        for (const el of [document.documentElement, document.body]) {
          el.style.height = h + 'px';
          el.style.overflow = 'hidden';
        }
      },
      { a, h },
    );
    const fatia = await page.pdf({ width: `${LARGURA}px`, height: `${h}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
    const doc = await PDFDocument.load(fatia);
    const [pagina] = await final.copyPages(doc, [0]);
    final.addPage(pagina);
  }
  await browser.close();

  final.setTitle(`Proposta ${pub.titulo} · ${pub.negocio}`);
  final.setAuthor(pub.negocio);
  final.setCreator('Kit de Propostas (github.com/dantaspaulo/kit-propostas)');
  final.setProducer('Kit de Propostas');
  fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
  fs.writeFileSync(saida, await final.save({ useObjectStreams: true }));
  if (path.resolve(saida) === path.resolve(pub.pdf)) {
    fs.writeFileSync('.build/pdf-origem.txt', crypto.createHash('sha256').update(fs.readFileSync(pub.html)).digest('hex') + '\n');
  }
  const mb = fs.statSync(saida).size / 1048576;
  console.log(`ok ${saida}: ${cortes.length - 1} páginas, ${mb.toFixed(1)} MB (alturas ${cortes.slice(1).map((c, i) => c - cortes[i]).join(', ')})`);
})();
