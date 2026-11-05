# O que já deu errado, e o que segura agora

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

Cada linha é um erro que aconteceu numa proposta de verdade e o mecanismo que impede que ele volte. Mecanismo, não
lembrete: o build, as capturas ou o publicador recusam.

| Aconteceu | O que segura |
|---|---|
| Entraram recursos que o cliente não pediu, para valorizar a opção mais cara | toda linha da matriz aponta para o `pedido`; `extrasRetirados` impede a volta |
| A guarda de termos não via palavra com acento, porque o código escapa `ç` como `\xE7` | o build decodifica o HTML antes de comparar |
| "Por que é mais barato em uma que na outra?": a tabela confundia | selo do nível em cada célula, a nota "não é o mesmo módulo" e a dúvida no FAQ |
| O PDF pela impressão do navegador saiu feio: cara de celular, cartão cortado, animação sumida | `scripts/pdf.cjs`: modo `?pdf`, canvas vira imagem, fatias que só quebram entre blocos |
| PDF de uma versão velha da página foi ao ar | `.build/pdf-origem.txt`, e o publicador recusa |
| Proposta nova com o nome ou o projeto de outro cliente | `herdado.json`: o build recusa até reescrever; `--de` acrescenta os termos da origem |
| Publicar uma proposta tirou as outras do ar (a publicação substitui o site inteiro) | publicação central com registro; o publicador recusa registro vazio |
| A prévia do WhatsApp saiu sem imagem | quem monta a prévia é o celular de quem envia; a foto com legenda sempre funciona |
| O Rocket Loader da Cloudflare mexeu no script da página | `data-cfasync="false"`, conferido no build e na publicação |
| Soma de módulos, parcelas ou prazo que não fechava | o build recusa |
| Proposta vencida publicada sem ninguém ver | o build recusa proposta vencida; o publicador avisa das vencidas no registro |
| A página quebrou por um campo removido do `data.ts` | capturas e PDF recusam página com erro e com "undefined" ou "NaN" na tela |
| Proposta aberta no modo errado: três opções para quem já ouviu o valor | `nova-proposta.sh` exige o modo; o build confere o `data.ts` contra ele |
| Página de valor direto falando em "três opções" | `conferir-tela.cjs` recusa "opção" na tela, nas capturas e no PDF |
| Âncora acima com a recomendada fora do lugar ou abrindo a âncora selecionada | o build confere a ordem; a página abre na `recomendada` |
| Nome curto de cliente que é pedaço de palavra comum (um "Sol" dentro de "solução") | `palavras` no `herdado.json`: palavra inteira, com maiúscula |
| A prévia pública mostrava o nome do cliente ou o valor | o build recusa cliente e valor na `publicacao` e nos textos da imagem |
| Uma proposta disse que responder no WhatsApp em 24 horas era grátis, regra que tinha mudado (o resumo em inglês da página do fornecedor estava atrasado) | `afirmacoes.json`; preço de fornecedor se confere na página oficial em português, no dia |
| O código de acesso no formato data + projeto dava para adivinhar pela própria tela de acesso | `senha.mjs --gerar` sorteia; o portão limita tentativas |
| O texto "seguir com o Completa" saiu errado num nome feminino | `artigo` na opção |
| A chave do React Bits podia ir parar na página | o build e o publicador recusam |
| Uma ferramenta que a pessoa não queria revelar apareceu pelo nome | o nome nos `termos` do `herdado.json` da proposta |
| Na publicação de uma conta nova, o wrangler criou o projeto de um jeito inesperado | o kit publica como Worker com arquivos estáticos, pelo `wrangler deploy`, e confere no ar |
