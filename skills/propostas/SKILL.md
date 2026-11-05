---
name: propostas
description: Faz propostas técnicas e comerciais bonitas e que vendem, do pedido do cliente até o link protegido por código no WhatsApp. Página única no visual da marca de quem usa (fundo claro, seções escuras, título forte com serifa, animações), escopo 100% preso ao pedido, três jeitos de mostrar o valor (âncora abaixo, âncora acima e valor direto), PDF igual à tela, imagem de prévia para o WhatsApp e publicação na Cloudflare com código de acesso. Use quando a pessoa pedir "proposta", "orçamento", "cotação", "proposta comercial", "proposta técnica", "precificar", "ancoragem de preço", "valor âncora", ou mandar o pedido de um cliente para orçar; e também para ajustar, republicar ou tirar do ar uma proposta, trocar valor, prazo, validade ou código de acesso. Se o perfil do negócio ainda não existir, faça antes a entrevista da skill propostas-configurar.
license: Licença de Uso com Atribuição v1.0 (LICENSE na raiz do kit)
metadata:
  author: Paulo Sérgio Dantas
  repository: https://github.com/dantaspaulo/kit-propostas
  fingerprint: KPR-PSD-2026
---

# Propostas

Kit de Propostas, de Paulo Sérgio Dantas (github.com/dantaspaulo/kit-propostas). O método nasceu das propostas da
PSD Software: uma página que responde logo o que o cliente quer saber, um escopo que não promete nada além do
pedido, um valor apresentado do jeito certo para cada cliente e um link bonito, protegido, que chega pelo WhatsApp.

## Antes de tudo

1. **O perfil do negócio existe?** Leia `~/.kit-propostas/config.json` (campo `espaco`, padrão `~/Propostas`) e
   `<espaço>/meu-negocio/perfil.json` e `negocio.md`. Sem eles, faça antes a entrevista (skill
   `propostas-configurar`) e volte aqui. O `negocio.md` diz quem é o negócio, o que vende, o tom e as condições
   de sempre: leia antes de escrever qualquer proposta.
2. **O computador está pronto?** `bash <esta pasta>/ferramentas/ambiente.sh --conferir`. Se faltar algo, rode sem
   `--conferir` (baixa o navegador sem tela, cerca de 200 MB, uma vez só: avise antes).
3. **Fale a língua da pessoa.** Ela pode não ser técnica: notícia curta entre os passos, sem jargão, e no fim o que
   mudou para ela. Decisão técnica é sua; decisão de negócio (valor, prazo, o que entra) é dela.

## Onde está cada coisa

| Preciso de... | Onde |
|---|---|
| O método: como expor o valor (âncora abaixo, âncora acima, direto), reduzir sem inventar, parcelas, etapas, custos, condições, dúvidas, texto | [referencias/metodo.md](referencias/metodo.md) |
| O visual, as seções, a UX, os três modos de exibição (tela, PDF, impressão) | [referencias/design.md](referencias/design.md) |
| O código: `data.ts`, guardas do build, scripts de captura, PDF e imagem | [referencias/codigo.md](referencias/codigo.md) |
| Publicar na Cloudflare com código de acesso e conferir no ar | [referencias/publicacao.md](referencias/publicacao.md) |
| A mensagem do WhatsApp e o jeito de mandar | [referencias/mensagens.md](referencias/mensagens.md) |
| Blocos do React Bits Pro (opcional, com a licença da própria pessoa) | [referencias/react-bits-pro.md](referencias/react-bits-pro.md) |
| O que já deu errado e o mecanismo que segura cada coisa | [referencias/licoes.md](referencias/licoes.md) |
| O modelo que vira cada proposta | `modelo/` (exemplo inventado; variações em `modelo/variantes/`) |
| Abrir uma proposta | `ferramentas/nova-proposta.sh` |
| Código de acesso, publicação, testes do portão | `publicacao/` |

## Regras que não se quebram

1. **O escopo é 100% do que o cliente pediu, e nada além.** Cada linha da matriz aponta para um item do `pedido`,
   e o build recusa o resto. Recurso que o cliente não pediu não entra nem para valorizar a opção mais cara.
2. **O jeito de mostrar o valor é escolhido por cliente** (ver [metodo.md](referencias/metodo.md)):
   - **valor direto** se o valor já foi combinado com o cliente: uma opção, sem preço por módulo, e a página
     nunca fala em "opção";
   - **âncora abaixo**: a recomendada é o pedido inteiro e vem primeiro; as outras são o mesmo pedido reduzido,
     mais baratas e mais lentas;
   - **âncora acima**: uma opção mais cara vem primeiro para ancorar, a recomendada fica no meio e abre
     selecionada, e a menor fica perto no preço e longe no que entrega.
3. **Valores, prazos, equipe e o que entra vêm da pessoa.** O que você sugerir (parcelas, garantia, prazos das
   opções menores) é apresentado como sugestão até ela confirmar, e vai na lista do fim.
4. **Número com fonte e data, ou calculado no próprio `data.ts`.** Custo de terceiro sem fonte não entra.
5. **Validade em todo lugar** (padrão do perfil, normalmente 14 dias): topo, condições, fechamento, rodapé e tela
   de acesso.
6. **A tela de acesso e a imagem da prévia são públicas:** sem nome do cliente e sem valores (o build recusa).
7. **O código de acesso nunca vai para arquivo.** Só o hash. Ele aparece na conversa e na mensagem ao cliente.
8. **Sem travessão** em texto nenhum (soa como texto de IA; o build recusa) e sem palavra de efeito ("robusto",
   "potencializar", "jornada", "solução completa").
9. **O PDF sai igual à tela** (scripts/pdf.cjs), nunca pela impressão do navegador.
10. **Nada vai ao cliente sem a pessoa.** Você entrega o link, o PDF, a imagem e a mensagem; quem envia é ela.

## Fluxo, do pedido ao link

0. **Ler o pedido inteiro** (e-mail, PDF, áudio transcrito, conversa) e montar o `pedido`: id, texto e onde
   aparece. Ele é o contrato da proposta. Se o cliente tem site, leia: às vezes mostra o que o pedido não diz
   (isso vai para a pessoa decidir, não direto para a proposta).
1. **Perguntar só o que só a pessoa sabe, numa mensagem só, antes de montar:** nome do cliente (empresa, contato e
   cargo), se já falou de valor com ele (então é direto), os valores e prazos, quantas pessoas no time, se entra
   suporte ou sustentação, se há bônus e qual jeito de ancoragem prefere (se for âncora). Sugira o modo com uma
   linha de porquê. O resto você propõe e marca como sugestão.
2. **Abrir a proposta:** `bash ferramentas/nova-proposta.sh <pasta> <caminho> <ancora|ancora-acima|direto>`.
   `<caminho>` é o endereço, curto e sem o nome do cliente. Para partir de outra proposta da pessoa, `--de <pasta>`.
3. **Escrever o `src/data.ts`** seguindo o [método](referencias/metodo.md): pedido, módulos com a matriz, opções,
   etapas, custos de terceiros com fonte, condições, dúvidas, topo e textos das seções.
4. **`npm run build` (ou `pnpm build`) até passar.** Cada recusa é erro de verdade. A primeira lista o que sobrou do
   exemplo: é a lista de trabalho.
5. **Olhar a página:** `node scripts/capturas.cjs 1440 900 desk` e `node scripts/capturas.cjs 390 844 cel 60`, e ver
   as capturas em `.build/cap/`, seção por seção. Os scripts saem com erro se a página quebrar, tiver rolagem lateral
   ou, no valor direto, falar em "opção".
6. **Imagem da prévia:** `node scripts/og.cjs` e olhar `publicar/publico/og-<caminho>.jpg`.
7. **PDF:** `node scripts/pdf.cjs` e conferir o número de páginas e o tamanho.
8. **Código de acesso:** `node <esta pasta>/publicacao/senha.mjs <pasta da proposta> --gerar`. Guarde o código só
   na conversa.
9. **Publicar** ([publicacao.md](referencias/publicacao.md)): entrada no `publicacao/propostas.json` do espaço,
   ensaio (`node publicacao/publicar.mjs`), depois `--enviar`. Na primeira vez, a pessoa faz o login na Cloudflare.
   Provado é o que foi conferido no ar, não o que o script disse.
10. **Mensagem** ([mensagens.md](referencias/mensagens.md)), com a imagem da prévia separada para ir como foto.
11. **Registro:** escreva no `README.md` da pasta da proposta o resumo (cliente, modo, valores, link, validade), o
    que foi sugestão sua e o que está pendente. Sem o código de acesso. Se o espaço for um repositório git
    (privado), faça o commit.

## Antes de entregar

- [ ] Toda linha da matriz aponta para o pedido, e não há nada além dele.
- [ ] O modo é o que a pessoa disse. Âncora abaixo: a recomendada primeiro. Âncora acima: a cara primeiro e a
      recomendada abrindo selecionada. Direto: o valor combinado, e nenhuma menção a opção.
- [ ] As somas fecham (o build garante) e batem com o texto corrido: prazo, equipe e parcelas.
- [ ] A validade está certa em todos os lugares.
- [ ] Olhei as capturas no celular e no computador, a imagem da prévia e o PDF.
- [ ] Publicado e conferido no ar, com as outras propostas do registro ainda abrindo.
- [ ] A mensagem está pronta, com o código, e a imagem está separada para ir como foto.
- [ ] Tenho a lista curta do que foi sugestão minha, para a pessoa confirmar.

Se esta skill e o código divergirem, vale o código, e a skill se corrige na mesma tarefa.
