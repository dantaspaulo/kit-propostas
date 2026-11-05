<!-- Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026 -->
# Componentes de terceiros

O Kit de Propostas usa estes componentes, cada um sob a licença do próprio autor. Nenhum deles é vendido aqui.

| Componente | Uso | Licença |
|---|---|---|
| [shadcn/ui](https://ui.shadcn.com) | base de `accordion`, `tabs` e `badge` em `src/components/ui/`, adaptados às cores da marca | MIT, © shadcn |
| [Radix UI](https://www.radix-ui.com) | acordeão e abas acessíveis | MIT, © WorkOS |
| [React](https://react.dev) | a página | MIT, © Meta Platforms |
| [Motion](https://motion.dev) | animações de entrada e números | MIT |
| [Lucide](https://lucide.dev) | ícones | ISC |
| [Tailwind CSS](https://tailwindcss.com) | estilos | MIT, © Tailwind Labs |
| [esbuild](https://esbuild.github.io) | empacota a página num HTML só | MIT |
| [clsx](https://github.com/lukeed/clsx) e [tailwind-merge](https://github.com/dcastil/tailwind-merge) | classes | MIT |
| [Playwright](https://playwright.dev) (`playwright-core`) | navegador sem tela para capturas, PDF, imagem e leitura do site | Apache 2.0, © Microsoft |
| [pdf-lib](https://pdf-lib.js.org) | junta as páginas do PDF | MIT |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | publica na Cloudflare (baixado na hora, pelo `npx`) | MIT ou Apache 2.0, © Cloudflare |
| Manrope e DM Mono | fontes padrão, carregadas do Google Fonts | SIL Open Font License |

**React Bits Pro:** o kit não inclui código do React Bits Pro. O arquivo `skills/propostas/referencias/react-bits-pro.md` só cita
nomes de blocos, para quem tem a própria licença.

**React Bits (gratuito):** o kit também não inclui código do React Bits gratuito ([reactbits.dev](https://reactbits.dev), de David
Haz, licença MIT + Commons Clause). Quatro componentes dele (Orb, StarBorder, HoldButton e SoftAurora) são baixados
do registro oficial, na máquina de quem usa, quando uma proposta é criada. A licença permite usá-los em sites e
produtos, inclusive comerciais, e proíbe redistribuir os componentes: não suba `src/components/reactbits/` para um
repositório público.

O texto da licença MIT do shadcn/ui, exigido em cópias dos componentes:

```
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
