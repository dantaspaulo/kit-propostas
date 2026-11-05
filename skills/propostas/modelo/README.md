# Proposta

Proposta técnica e comercial feita com o [Kit de Propostas](https://github.com/dantaspaulo/kit-propostas): uma página
única em HTML, um PDF igual à tela e a publicação com código de acesso.

O jeito de montar (o método, o visual, a publicação e a mensagem) está na skill `propostas`. Este arquivo só diz
como mexer nesta pasta.

## Onde está cada coisa

| Arquivo | O que tem |
|---|---|
| `src/data.ts` | todo o conteúdo: pedido, opções, módulos, etapas, custos, condições, dúvidas |
| `src/marca.json` e `src/marca.css` | a marca do negócio (gerados pelo `aplicar-marca`, não edite à mão) |
| `src/sections/` | as seções da página (estrutura: leem tudo do `data.ts`) |
| `herdado.json` | termos da proposta de origem: o build recusa a página enquanto sobrar algum |
| `afirmacoes.json` | frases que já foram verdade e deixaram de ser: o build recusa |
| `publicar/og.html` | a imagem da prévia do link no WhatsApp (pública) |
| `dist/` | a página e o PDF, que é o que vai ao ar |

## Comandos

```bash
npm run build                                  # dist/proposta-<slug>.html, com todas as guardas
node scripts/capturas.cjs 1440 900 desk        # capturas do computador em .build/cap/
node scripts/capturas.cjs 390 844 cel 60       # capturas do celular
node scripts/og.cjs                            # imagem da prévia do WhatsApp
node scripts/pdf.cjs                           # PDF igual à tela
```

Com pnpm, troque `npm run build` por `pnpm build`. As capturas, a imagem e o PDF usam o navegador sem tela do
ambiente do kit (`~/.kit-propostas/runtime`).
