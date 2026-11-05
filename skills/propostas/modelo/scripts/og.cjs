// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Gera a imagem da prévia do link (WhatsApp mostra até ~300 KB) a partir de publicar/og.html, com os textos
// públicos do data.ts (publicacao.imagem) e a marca do src/marca.json. Ela fica fora do portão: nada de
// nome do cliente nem de valores nela (o build confere).
const { chromium } = require('./navegador.cjs');
const pub = require('./publicacao.cjs');
const path = require('path');
const fs = require('fs');

const LIMITE_KB = 290;

function endereco() {
  // O endereço das propostas vem da publicação do espaço de trabalho, quando já foi configurada.
  for (const arq of ['../publicacao/cloudflare.json', '../../publicacao/cloudflare.json']) {
    try {
      const cfg = JSON.parse(fs.readFileSync(arq, 'utf8'));
      if (cfg.endereco) return new URL(cfg.endereco).host;
    } catch {}
  }
  return '';
}

(async () => {
  const marca = JSON.parse(fs.readFileSync('src/marca.json', 'utf8'));
  const c = marca.cores;
  const t = pub.imagemTexto || {};
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve('publicar/og.html'));
  await p.evaluate(
    ({ c, f, t, nome, logo, logoClaro, end }) => {
      const r = document.documentElement.style;
      for (const [k, v] of Object.entries({ noite: c.noite, papel: c.papel, tinta: c.tinta, destaque: c.destaque, 'noite-apoio': c.noiteApoio, 'noite-linha': c.noiteLinha }))
        r.setProperty(`--${k}`, v);
      for (const [k, v] of Object.entries({ texto: f.texto, titulo: f.titulo, mono: f.mono, serifa: f.serifa })) r.setProperty(`--fonte-${k}`, `"${v}"`);
      document.getElementById('fontes').href = f.url;
      const campo = (n) => document.querySelector(`[data-campo="${n}"]`);
      const marca = campo('marca');
      if (logoClaro) marca.innerHTML = `<img src="${logoClaro}" alt="">`;
      else if (logo) marca.innerHTML = `<span class="chip"><img src="${logo}" alt=""></span>`;
      else {
        marca.innerHTML = '<span class="monograma"></span><span></span>';
        marca.children[0].textContent = nome.trim().charAt(0).toUpperCase();
        marca.children[1].textContent = nome;
      }
      campo('titulo').textContent = t.titulo || '';
      campo('destaque').textContent = t.destaque || '';
      campo('frase').textContent = t.frase || '';
      campo('nucleo').textContent = t.nucleo || '';
      (t.nos || []).forEach((no, i) => campo(`no${i}`) && (campo(`no${i}`).textContent = no));
      for (let i = (t.nos || []).length; i < 4; i++) campo(`no${i}`).classList.add('vazio');
      if (end) campo('endereco').textContent = end;
      else campo('endereco').classList.add('vazio');
    },
    { c, f: marca.fontes, t, nome: marca.negocio.nome, logo: marca.logo, logoClaro: marca.logoClaro, end: endereco() },
  );
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);
  const saida = pub.imagem;
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  await p.screenshot({ path: saida, type: 'jpeg', quality: 86 });
  await b.close();
  const kb = fs.statSync(saida).size / 1024;
  console.log(`ok ${saida} (${kb.toFixed(0)} KB)`);
  if (kb > LIMITE_KB) {
    console.error(`imagem acima de ${LIMITE_KB} KB: o WhatsApp pode não mostrar a prévia`);
    process.exit(1);
  }
})();
