# O código

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

## Pilha

- **Página:** React 19, motion, lucide-react, shadcn/ui (Radix) e clsx com tailwind-merge.
- **Build:** Tailwind v4 pela CLI e esbuild. Tudo vai embutido num **HTML único** (`build.mjs`): abre com dois cliques,
  sobe como um arquivo só e não depende de servidor.
- **Fora da proposta**, em `~/.kit-propostas/runtime` (o `ambiente.sh` prepara): `playwright-core` (o navegador sem
  tela, para capturas, PDF e imagem) e `pdf-lib` (junta o PDF). Node 20 ou mais novo.

## Estrutura

```
<espaço>/                       padrão ~/Propostas (o ~/.kit-propostas/config.json aponta)
├── meu-negocio/                perfil.json, negocio.md, marca/ (logo, prévia)
├── publicacao/                 propostas.json (o que está no ar), cloudflare.json, saida/ e .build/ (gerados)
└── <pasta-da-proposta>/
    ├── build.mjs               build + guardas → dist/proposta-<slug>.html e .build/publicacao.json
    ├── herdado.json            termos da origem: o build recusa enquanto sobrar algum
    ├── afirmacoes.json         frases que já foram verdade e deixaram de ser
    ├── components.json         shadcn (com os registros do React Bits Pro, que pedem a chave da própria pessoa)
    ├── reactbits.json          os componentes gratuitos do React Bits que a página usa (baixados, não versionados)
    ├── src/
    │   ├── data.ts             TODO o conteúdo
    │   ├── marca.json, marca.css   a marca (gerados pelo aplicar-marca)
    │   ├── index.html          título, prévia e cores saem do data.ts e do marca.json
    │   ├── styles.css          tokens, peças e os modos tela, PDF e impressão
    │   ├── App.tsx, main.tsx, estado.tsx
    │   ├── lib/                tipos, utilitários, a marca com tipo e as contas das seções
    │   ├── components/ui/      shadcn: accordion, tabs, badge
    │   ├── components/kit/     peças próprias: marca, título, revelar, número, grade viva, mapa, esfera, cartão do
    │   │                       fluxo e barra de aceite
    │   ├── components/reactbits/  Orb, StarBorder, HoldButton e SoftAurora, baixados do registro oficial (fora do git)
    │   └── sections/           uma por seção
    ├── scripts/                capturas, pdf, og, foto, conferir-tela, navegador, publicacao
    ├── publicar/og.html        a imagem da prévia
    └── dist/                   a página e o PDF (os entregáveis)
```

## `src/data.ts`: a fonte única

| Campo | O que é |
|---|---|
| `modo`, `ancora` | `"ancora"` (com `"abaixo"` ou `"acima"`) ou `"direto"`; o build confere o resto contra eles |
| `unidadePrazo` | `"semanas"` ou `"dias"` |
| `proposta` | referência, datas (emissão e validade calculadas), cliente (empresa, contato, cargo), projeto |
| `publicacao` | `caminho`, `slug`, `titulo` e `descricao` da tela de acesso e `imagem` (textos da prévia): PÚBLICOS |
| `termosPermitidos` | termos do `herdado.json` liberados de propósito |
| `extrasRetirados` | recursos que o cliente não pediu e já saíram: não voltam |
| `pedido` | id → `{ texto, onde }` (`"matriz"` ou a seção que responde) |
| `modulos` | `rotulo`, `titulo`, `resumo`, `precos` (âncora), `semCustoProprio` e `itens` `{ t, ref, c }` |
| `etapas` | id, nome, curto, texto, entregas e o que o cliente faz (`voce`) |
| `opcoes` | nome, `artigo` ("o"/"a"), nível, selo, recomendada, preço, prazo, `duracao`, equipe, ritmo, frase, para, inclui, depois, demos, garantia, pagamento, `fases`, `marcos` |
| `ordem`, `recomendada` | a ordem de apresentação e o índice da recomendada (a que abre selecionada) |
| `exemploNiveis` | âncora: o exemplo de por que o mesmo módulo custa diferente |
| `secoes` | olho, título e texto das seções de estrutura (escopo, etapas, investimento, condições, dúvidas) |
| `fluxo` | o cartão ao lado do título: `titulo`, `selo`, `passos` (3 a 5, `{ olho, texto, estado, nucleo? }`) e `rodape` |
| `topo`, `respostas`, `solucao`, `custos`, `condicoes`, `duvidas` | o texto de cada seção |
| `chamada` | o aceite: olho, título, texto e `passos` (o que acontece depois de aceitar, em ordem) |

Células da matriz: `S(nota?)`, `P("o que entra")` e `N`, uma por opção, na ordem do array `opcoes`.

## As guardas do `build.mjs`

Antes de tudo, o build confere que os componentes do `reactbits.json` estão em `src/components/reactbits/`; se
faltar algum, manda rodar `ferramentas/reactbits.mjs` (precisa de rede na primeira vez).

O build recusa quando:

1. **Publicação:** caminho ou slug fora do padrão; título, descrição ou textos da imagem vazios, com aspas ou `< >`,
   citando o cliente ou com valor; `arquivoPdf` fora do padrão; marca sem nome.
2. **Validade:** a proposta já venceu (atualize `emitidaEm`).
3. **Modo:** direto com mais de uma opção ou com `precos`; âncora com menos de 2 ou mais de 3 opções, sem `precos`
   ou com preços a mais ou a menos, sem uma recomendada só; âncora abaixo com a recomendada que não é a mais cara ou
   não vem primeiro; âncora acima sem três opções, com a recomendada sendo a mais cara ou com a ordem errada;
   `recomendada` que não aponta a recomendada.
4. **Contas:** módulos ou parcelas que não somam o preço; fases que não somam o prazo; fase que não existe; módulo
   com preço sem item incluso, ou com item incluso custando 0 (fora `semCustoProprio`).
5. **Pedido:** linha da matriz sem `ref` ou apontando para item que não existe; item `"matriz"` sem linha.
6. **Travessão** em qualquer arquivo de `src/` (fora de comentário) e em qualquer texto do `data.ts`.
7. **Rascunho:** "lorem", "TODO", "[cliente]", "XXX", "undefined", "NaN" ou "A DEFINIR" nos textos.
8. **Extras retirados** que voltaram, **afirmações vencidas** (`afirmacoes.json`) e **termos herdados**
   (`herdado.json`) na página e na imagem da prévia.
9. **Chave do React Bits Pro** na página; `<script>` sem `data-cfasync="false"` (o Rocket Loader da Cloudflare
   mexeria nele); sobra de marcador no `index.html`.

`KIT_ENSAIO=1` transforma só a recusa dos termos herdados em aviso, para testar o próprio modelo, e marca a saída
como ensaio: a publicação recusa proposta gerada assim.

Toda guarda nova vem com teste: quebre de propósito, veja a recusa, desfaça.

## Scripts (na pasta da proposta, depois do build)

| Comando | O que faz |
|---|---|
| `node scripts/capturas.cjs 1440 900 desk` | rola a página, salva uma captura por tela em `.build/cap/` e sai com 1 se houver erro de página, rolagem lateral ou texto proibido na tela |
| `node scripts/capturas.cjs 390 844 cel 60` | o mesmo no celular |
| `node scripts/og.cjs` | a imagem da prévia; recusa acima de 290 KB |
| `node scripts/pdf.cjs` | o PDF igual à tela; grava `.build/pdf-origem.txt` (a publicação recusa PDF de outra versão) |
| `node scripts/foto.cjs <html> <png> [l] [a] [espera] [inteira]` | captura avulsa |

`conferir-tela.cjs` lê o texto como aparece na tela: "undefined", "NaN", "[object Object]", data inválida, "R$ 0"
e, no valor direto, qualquer "opção". A conferência é na tela porque o código carrega o texto dos dois modos.

### Como o PDF sai igual à tela

1. Abre a página com `?pdf` em 1440 de largura e escala 2, e recusa se ela der erro.
2. Rola a página inteira, troca cada canvas por uma imagem dele e congela as animações.
3. Calcula os pontos seguros de corte: topo de seção e de bloco, nunca dentro de cartão, linha, item de lista,
   título ou bloco `.sem-quebra`.
4. Fatia em páginas de no máximo 2036 px (proporção do papel A) e no mínimo 700 px, preferindo o topo de seção.
5. Gera uma página de PDF por fatia, com a altura exata, e junta tudo com o pdf-lib. O exemplo dá 8 páginas e 1,9 MB.

## Manter o modelo

Melhoria de máquina feita numa proposta (build, script, componente, seção de estrutura, guarda) volta para o modelo
do kit, se a pessoa mantém o kit; depois, rode o ensaio dos três modos (`testes/testar.sh` na raiz do kit).
