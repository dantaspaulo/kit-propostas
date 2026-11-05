# Roteiro da entrevista

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

## Rodada 1: o começo

> Vamos deixar o kit com a cara do seu negócio. Me diga duas coisas:
> 1. o nome do seu negócio;
> 2. o endereço do seu site (ou o Instagram, se não tiver site).
>
> Eu leio o site, monto a memória do seu negócio e as cores das suas propostas, e te mostro uma prévia para aprovar.

## Rodada 2: o que eu entendi, e o que falta

Mostre primeiro o que o site disse, em poucas linhas, e só depois pergunte o que faltou. Exemplo:

> Pelo seu site, entendi que:
> - a Exemplo faz <o quê> para <quem>, em <onde>;
> - os serviços são <a>, <b> e <c>;
> - o diferencial que vocês destacam é <x>;
> - achei o WhatsApp (11) 9xxxx-xxxx e o e-mail contato@... .
>
> Confere? O que eu errei? E me diga, por favor:
> 1. quem assina as propostas (nome e cargo);
> 2. o WhatsApp que deve aparecer nas propostas, se for outro;
> 3. razão social e CNPJ, se quiser que apareçam no rodapé (opcional);
> 4. como você costuma receber (Pix, boleto, cartão, parcelado?) e se emite nota fiscal;
> 5. por quantos dias as suas propostas valem (o padrão do kit é 14);
> 6. se você dá garantia depois da entrega, e de quantos dias;
> 7. se suporte ou manutenção depois da entrega é cobrado à parte.

Se a pessoa responder só parte, siga com o que tem e marque o resto como padrão do kit, que ela pode mudar depois.

## Rodada 3: a marca

Escolha você, com base no que mediu, e mostre a prévia. Não pergunte "qual cor você quer?" no vazio.

- **Cor principal:** a que mais aparece em botões, links e no logo (no `site.json`, `cores` com papel `botao` e
  `link`, e as `cores` de cada logo). Nunca branco, preto ou cinza: se o logo for preto e branco, use a cor dos
  botões do site; se o site também for neutro, proponha duas ou três opções na conversa.
- **Destaque** (`destaque` no perfil), só se for outra: por exemplo, um site azul-marinho com botões laranja.
- **Escura e clara** (`escura`, `clara`): só se o site tiver um fundo escuro ou claro marcante que valha manter.
- **Fontes:** as do site, se estiverem no Google Fonts (`fontes.googleFonts` no `site.json`); senão, o padrão
  (Manrope, DM Mono e Georgia). Título com fonte muito fina ou muito decorativa não segura o estilo: prefira o padrão.
- **Logo:** os candidatos vêm do mais provável para o menos. O primeiro costuma ser o recorte do logo como aparece
  no cabeçalho (`logo-cabecalho.png`, que pega até logo feito de texto). Entre dois bons, fique com o mais nítido,
  de preferência SVG ou PNG com fundo transparente. Os marcados como "faixa de logos" quase sempre são de clientes
  ou parceiros: nunca use um deles sem a pessoa confirmar que é dela. Se o logo for escuro e não aparecer no fundo
  escuro (veja a metade escura da folha `logos.png`), pergunte se há uma versão clara; sem ela, o kit põe o logo
  num selo claro nas seções escuras.

> Abri no seu navegador uma prévia com as suas cores, as fontes e o logo: o topo de uma proposta, os botões, uma
> seção escura e a tela do código de acesso. Está bom, ou quer ajustar alguma coisa (cor mais clara, outro logo,
> outra fonte)?

## O rascunho do perfil

Monte um JSON no formato do exemplo (`../propostas/modelo/exemplo/perfil.exemplo.json`) e grave com o
`gravar-perfil.mjs`. Campos:

| Campo | O que é |
|---|---|
| `negocio.nome` | o nome do negócio, como aparece nas propostas |
| `negocio.sigla` | 2 a 8 letras maiúsculas, para a referência das propostas (`EXE-2026-1104-CLIENTE`) |
| `negocio.razaoSocial`, `cnpj`, `endereco`, `cidade` | opcionais, para o rodapé |
| `negocio.site`, `email` | contato |
| `negocio.whatsapp`, `whatsappVisivel` | só números com 55 e DDD (para o link) e o jeito de mostrar |
| `negocio.assinatura` | nome e cargo de quem assina |
| `marca.cores` | `marca` (obrigatória), `destaque`, `escura`, `clara` (opcionais), em `#RRGGBB` |
| `marca.fontes` | `texto`, `titulo`, `mono`, `serifa` |
| `marca.logo`, `logoClaro` | preenchidos pelo `gravar-perfil.mjs` (`--logo`, `--logo-claro`) |
| `comercial` | `validadeDias`, `pagamento`, `notaFiscal`, `garantiaDias`, `sustentacao` |
| `publicacao` | `worker` (padrão `propostas-<sigla>`) e `dominio` (opcional, precisa estar na Cloudflare) |

## Modelo da memória (`meu-negocio/negocio.md`)

```markdown
# <Nome do negócio>

Memória do negócio para o Kit de Propostas. Feita na entrevista de <data>; fontes ao lado de cada fato.

## Quem somos
<duas ou três frases: o que o negócio faz, para quem, desde quando, onde> (site, lido em <data>)

## O que vendemos
- <serviço>: <o que entrega, em uma linha> (site, página <x>)

## Para quem
<o cliente típico: porte, setor, a dor que traz> (<site / a pessoa, na entrevista>)

## Diferenciais
- <o que o site destaca, nas palavras dele> (site)

## Como falamos
<tom: formal ou próximo, "você" ou "o senhor", palavras que usam e que evitam>

## Provas públicas
- <caso, cliente ou número que ESTÁ no site, com a página> (site, <data>)

## Condições de sempre
- Validade das propostas: <N> dias
- Pagamento: <...>; nota fiscal: <sim/não>
- Garantia: <N> dias depois da entrega; suporte e manutenção: <à parte / incluso>

## O que não fazemos
- <o que a pessoa disse que não faz, para a proposta não prometer>

## Quem assina
<nome>, <cargo>. WhatsApp <...>, e-mail <...>.
```

Regras da memória: nada inventado (o que não foi confirmado fica fora ou marcado "a confirmar"); nada de terceiros
(cliente, funcionário, fornecedor que não está no site); nada de senha, chave ou dado bancário.
