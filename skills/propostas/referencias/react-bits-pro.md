# Blocos do React Bits Pro (opcional)

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

O modelo já sai bonito sem nada pago: as seções são código próprio com shadcn/ui. Quem tem licença do
[React Bits Pro](https://pro.reactbits.dev) (plano Pro ou Ultimate) pode trocar seções por blocos animados dele,
como as propostas da PSD Software fazem.

## A regra da licença

- **Código do React Bits Pro (original ou adaptado) nunca vai para repositório público** nem para pacote que sai da
  máquina de quem tem a licença. O kit não traz nenhum: só os nomes dos blocos.
- A chave fica na variável `REACTBITS_LICENSE_KEY` (ou num `.env.local` fora do git). Nunca no `components.json`,
  nunca em arquivo da proposta, nunca na conversa. O build e o publicador recusam página com a chave.
- A página final, compilada, pode ir ao cliente: isso é uso normal, como num site. O que não pode é distribuir o
  código-fonte.
- Se o espaço de trabalho for para o GitHub, que seja privado.

## Como trocar uma seção

1. Na pasta da proposta, com a chave na variável: `npx shadcn@latest add @reactbits-pro/<bloco>` (o
   `components.json` já tem o registro). Componentes do plano Starter: `@reactbits-starter/<nome>-tw`.
2. Leia o arquivo instalado: o jeito de importar varia de bloco para bloco.
3. Adapte numa cópia, em `src/sections/`: os dados vêm do `data.ts` (a seção do kit mostra quais), o texto é em
   português e sem travessão, as cores são as da marca (a escala `neutral` já está no tom dela) e tudo o que for
   inventado sai (avatares, depoimentos, números de vitrine, "N pessoas na fila").
4. Animação pesada (WebGL, shader) dentro de `SobDemanda`, parada com movimento reduzido e no PDF.
5. Comentário no topo do arquivo dizendo de qual bloco veio. Build, capturas e PDF de novo.

## O que a PSD usa em cada seção

Referência de onde procurar, não obrigação. Compare a categoria inteira e prefira os animados.

| Seção | Bloco ou componente |
|---|---|
| topo | `navigation-15` |
| hero | componentes `staggered-text` e `square-matrix` |
| solução | `features-10` com o componente `agentic-ball` |
| escopo | `comparison-8` |
| etapas | `how-it-works-6` |
| investimento | `pricing-13` |
| custos | `stats-11` |
| dúvidas | `faq-6` |
| chamada | `cta-13` |
| rodapé | `footer-10` |

Descrição de cada item: `https://pro.reactbits.dev/api/r/pro/<bloco>.json` (com o cabeçalho
`Authorization: Bearer $REACTBITS_LICENSE_KEY`). Prévia visual: `pro.reactbits.dev/docs/blocks/<categoria>/<bloco>`.
