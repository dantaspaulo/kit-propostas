# O visual

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

Página clara, seções escuras intercaladas, olho em letra mono com uma bolinha na cor da marca, títulos pesados e
apertados com um trecho em serifa, cartões com borda fina e a cor da marca só nos destaques. É o visual das
propostas da PSD Software, com as cores, as fontes e o logo de quem usa o kit.

## A marca de quem usa

A entrevista grava o perfil; o `aplicar-marca.mjs` transforma o perfil em `src/marca.json` (dados e logo) e
`src/marca.css` (tokens do Tailwind). **Não edite esses dois à mão:** mude o perfil e aplique de novo.

A paleta inteira sai de uma cor (`ferramentas/paleta.mjs`), com o contraste de cada par conferido:

| Token (Tailwind) | Papel | Regra |
|---|---|---|
| `tinta` | texto, botão escuro | escuro no tom da marca; a cor escura do site, se tiver contraste |
| `fundo`, `papel` | fundo da página, cartões | claros, levemente puxados para o tom da marca |
| `destaque` | destaque em seção escura, botão de destaque, selo "Recomendado" | a cor da marca, ou o tom mais perto dela com contraste com o texto escuro e com a seção escura |
| `destaque-forte` | trecho em serifa, bolinha do olho, barra de leitura, links | a cor da marca, ou o tom mais perto dela legível sobre o fundo claro |
| `noite`, `tinta-2` | seções escuras, cartão escuro | escuros no tom da marca |
| `apoio`, `linha` | texto de apoio, bordas | neutros no tom da marca, apoio com contraste mínimo de 4,5:1 |
| `tom-1`, `tom-2`, `tom-3` | fundos de apoio e selos dos níveis | claros |
| `noite-linha`, `noite-apoio` | linhas e texto de apoio no escuro | |
| `neutral-50` a `neutral-950` | a escala neutra do Tailwind, no tom da marca | faz bloco novo (shadcn ou React Bits Pro) já entrar no tom |

Também valem os tokens do shadcn/ui (`bg-background`, `text-muted-foreground`, `bg-primary`, `border`, `ring`),
ligados aos da marca em `src/styles.css`.

**Fontes:** `font-sans` (texto), `font-titulo`, `font-mono` (olhos e rótulos) e `font-serif` (o trecho em
destaque do título). Padrão: Manrope, DM Mono e Georgia. A entrevista pode trocar pelas do site, se forem do Google
Fonts. No texto, o trecho em serifa se escreve entre asteriscos: `"Agenda online para *as três unidades*"`.

## Peças prontas (`src/styles.css` e `src/components/kit/`)

- Texto: `.kit-olho` (com `.claro` no escuro), `.kit-titulo` (com `em` em serifa), `.kit-lead`, `.kit-mono`.
- Botões: `.kit-btn` com `.kit-btn-escuro`, `.kit-btn-destaque` ou `.kit-btn-borda`.
- Superfícies: `.kit-cartao`, `.kit-ui` (cartão escuro com `.kit-ui-barra`), `.fundo-noite`, `.fundo-noite-brilho`,
  `.kit-grade` (grade sutil), `.kit-ponto-vivo`.
- Componentes: `Marca` (logo ou monograma), `Titulo` (olho + título + apoio), `TextoRevelado` (título que entra
  palavra por palavra, saindo do desfoque), `Revelar` (entrada suave), `Numero` (conta até o valor e anda do valor
  antigo ao novo ao trocar de opção), `GradeViva` (fundo de quadrados que acendem, em canvas, parado fora da tela),
  `Mapa` (o núcleo da solução e as partes em volta), `SobDemanda` (monta peça pesada só perto da tela).
- shadcn/ui em `src/components/ui/`: `Accordion`, `Tabs` e `Badge`, nas cores da marca. Para mais componentes:
  `npx shadcn@latest add <nome>` (o `components.json` já está pronto).

## As seções

| # | Seção | O que faz |
|---|---|---|
| 1 | `topo` | barra fixa com a marca, as seções (sublinhado na que está na tela), a barra de leitura, PDF, Conversar e Aceitar |
| 2 | `hero` | em duas colunas: título animado, resumo, para quem, data, validade (com quantos dias faltam) e referência; ao lado, o cartão do fluxo (`fluxo` no `data.ts`), inclinado sobre a grade viva. Embaixo, as três respostas e as chamadas |
| 3 | `solucao` | vitrine escura: o texto e, ao lado, o mapa com a esfera viva (Orb) no centro e as partes em volta; embaixo, os pilares e o jeito de trabalhar |
| 4 | `escopo` | âncora: matriz módulo x opção, com preço e selo do nível; no celular, uma opção por vez em abas. Direto: os módulos em cartões |
| 5 | `etapas` | gráfico de duração por opção e um cartão por etapa, com o período da opção em foco |
| 6 | `opcoes` | âncora: seletor de opções (uma estrela, StarBorder, percorre o contorno da recomendada) e o painel da escolhida; "Quero seguir" leva ao aceite e "Tenho uma dúvida" ao WhatsApp; no PDF, todas lado a lado. Direto: o valor e as parcelas |
| 7 | `custos` | o que o cliente providencia, três números com fonte e as notas |
| 8 | `condicoes` | aceite, garantia (num cartão escuro), exclusões, de quem é o quê, condições gerais e a validade |
| 9 | `duvidas` | acordeão numerado, com o canal de contato ao lado |
| 10 | `chamada` | o aceite: o que acontece depois de aceitar (`chamada.passos`), o resumo da opção em foco e o botão de segurar para aceitar (HoldButton), que abre o WhatsApp com a mensagem de aceite pronta; ao fundo, a aurora (SoftAurora). No PDF, o caminho para aceitar por escrito |
| | barra de aceite | aparece depois que o cliente termina o investimento e some no aceite: a opção em foco, o valor e o botão Aceitar |
| 11 | `rodape` | a marca, a referência, a validade, o contato e os dados da empresa |

As seções são de estrutura: leem tudo do `data.ts` (inclusive os títulos, em `secoes`) e se adaptam ao modo e ao
número de opções. Texto de projeto não mora nelas.

## Padrões de UX

- **A opção em foco vale para a página toda** (`estado.tsx`): escolher uma opção destaca a mesma coluna no escopo, o
  mesmo prazo nas etapas e a mesma mensagem no WhatsApp. A página abre na recomendada.
- **No celular, nada de rolagem lateral:** a matriz vira abas, uma opção por vez; ao escolher uma opção no
  investimento, a página desce até o painel.
- **Botões de WhatsApp com a mensagem pronta**, citando a referência e a opção.
- **"Baixar PDF"** no topo, no começo e no fechamento.
- **Animações uma vez só**, com `prefers-reduced-motion` respeitado; o fundo animado para fora da tela e com a aba
  escondida.

## Três modos de exibição

- **Tela:** o que o cliente vê.
- **PDF** (`?pdf` na abertura, usado pelo `scripts/pdf.cjs`): tudo pronto, sem animação, dúvidas abertas, opções
  lado a lado, sem botões (`.nao-imprimir`) e sem o que é só da tela (`.so-tela`); `.so-impressao` aparece.
  Blocos com `.sem-quebra` nunca são cortados entre páginas.
- **Impressão do navegador:** plano B, parecido com o PDF.

## Armadilhas de CSS já resolvidas

- O Tailwind v4 lia pastas de saída: `@import "tailwindcss" source(none);` com `@source "./";`.
- CSS próprio fora de camada vencia o utilitário: tudo em `@layer base` e `@layer components`.
- Modo escuro automático de blocos importados: `@custom-variant dark` apontando para uma classe que não existe.
- `sticky` dentro de `overflow-hidden` não gruda: use `overflow-clip` (a matriz usa).
- Animação de `transform` em peça centralizada com `translate`: o Tailwind v4 usa a propriedade `translate`, que soma
  com o `transform` da animação. Centralize com `transform` no estilo (o `Mapa` faz assim).

## Imagem da prévia (WhatsApp)

`publicar/og.html`, preenchida pelo `scripts/og.cjs` com `publicacao.imagem` do `data.ts` e a marca: JPEG de
1200 x 630 abaixo de 290 KB, com o logo, "Proposta técnica e comercial", o título com o trecho em serifa, uma
frase, o núcleo com quatro partes da solução, "Acesso com código" e o endereço das propostas. **É pública:** sem
cliente e sem valores.

## Código próprio, React Bits gratuito e blocos pagos

As seções são código próprio, com shadcn/ui (licença MIT) onde cabe. Quatro peças animadas vêm do React Bits
gratuito: a esfera da solução (Orb), a estrela da opção recomendada (StarBorder), o botão de segurar para aceitar
(HoldButton) e a aurora do aceite (SoftAurora). A licença do React Bits deixa usar em qualquer site, mas não
redistribuir os componentes, então o kit não traz o código deles: o `ferramentas/reactbits.mjs` baixa do registro
oficial quando a proposta nasce (lista em `reactbits.json`). Quem tem licença do React Bits Pro pode trocar
seções por blocos pagos, na própria máquina: ver [react-bits-pro.md](react-bits-pro.md).
