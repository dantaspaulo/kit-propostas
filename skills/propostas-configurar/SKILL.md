---
name: propostas-configurar
description: Entrevista de personalização do Kit de Propostas. Pergunta o nome do negócio e o site, lê o site sozinha (o que o negócio faz, serviços, contatos, cores, fontes e logo), monta a paleta da marca com contraste conferido, mostra uma prévia para aprovar, grava a memória do negócio e prepara o espaço de trabalho e a publicação na Cloudflare. Use logo depois de instalar o kit, quando a pessoa disser "configurar o kit de propostas", "personalizar as propostas", "minha marca", "trocar o logo", "mudar as cores das propostas", "atualizar os dados do meu negócio", e sempre que a skill propostas não achar o perfil do negócio.
license: Licença de Uso com Atribuição v1.0 (LICENSE na raiz do kit)
metadata:
  author: Paulo Sérgio Dantas
  repository: https://github.com/dantaspaulo/kit-propostas
  fingerprint: KPR-PSD-2026
---

# Configurar o Kit de Propostas

Kit de Propostas, de Paulo Sérgio Dantas (github.com/dantaspaulo/kit-propostas). A entrevista deixa o kit com a cara
do negócio de quem usa: a memória do negócio (o que faz, para quem, como fala), a marca (cores, fontes e logo) e o
lugar onde as propostas moram e de onde são publicadas.

**Como conduzir:** conversa curta, em português simples, uma rodada de perguntas por vez, sempre com o que você já
descobriu para a pessoa só confirmar ou corrigir. Ela pode não ser técnica: nada de jargão. Ela não precisa abrir
arquivo nenhum para decidir: o que for decisão vai escrito na conversa, curto, com a sua recomendação. O roteiro
completo, com as perguntas e o modelo da memória, está em [referencias/entrevista.md](referencias/entrevista.md).

As ferramentas desta skill ficam em `ferramentas/`; as da skill irmã, em `../propostas/ferramentas/`.

## Passo a passo

1. **Preparar o computador.** `bash ../propostas/ferramentas/ambiente.sh --conferir`. Se faltar algo, diga o que
   é e, com o ok da pessoa, rode sem `--conferir` (baixa o navegador sem tela, cerca de 200 MB, uma vez só).
2. **Abrir a conversa** com duas perguntas: o nome do negócio e o endereço do site (ou o Instagram, se não tiver
   site). Diga em uma linha o que vai acontecer: "vou ler o seu site, montar a memória do seu negócio e as cores
   das suas propostas, e te mostrar uma prévia para aprovar".
3. **Ler o site:** `node ferramentas/ler-site.mjs <site> <espaço>/meu-negocio/site` (se ainda não houver espaço,
   use uma pasta temporária e mova depois). Leia o `site.json`, olhe o `site.png` e a folha `logos.png`. Se faltar
   texto, complete com a sua ferramenta de ler páginas. Sem site: pergunte o essencial (o que vende, para quem, o
   que diferencia) e siga.
4. **Mostrar o que entendeu e perguntar o que faltou**, numa mensagem só: o que o negócio faz, os serviços, para
   quem, o tom, os contatos achados; e pergunte quem assina as propostas (nome e cargo), o WhatsApp comercial, o
   e-mail, a razão social e o CNPJ (opcionais), a cidade, a forma de pagamento de costume, a validade (padrão 14
   dias), a garantia de costume e se suporte ou sustentação são cobrados à parte.
5. **Marca.** Proponha a cor principal (a que mais aparece em botões e no logo, nunca branco, preto ou cinza), a
   cor de destaque se for outra, as fontes (as do site, se forem do Google Fonts; senão, o par padrão) e o logo
   (o melhor candidato, e o claro para fundo escuro, se houver). Monte o rascunho do perfil, grave e gere a prévia:
   - `node ../propostas/ferramentas/preparar-espaco.mjs [<pasta>]` (padrão `~/Propostas`; pergunte se quer outro lugar)
   - `node ferramentas/gravar-perfil.mjs <rascunho.json> --logo <arquivo> [--logo-claro <arquivo>]`
   - `node ferramentas/previa-marca.mjs <espaço>/meu-negocio/perfil.json --abrir`

   Olhe o `marca/previa.png` antes de falar com a pessoa. Se houver aviso de contraste ou de cor quase cinza,
   resolva primeiro (escolha outra cor de destaque) e gere de novo. Depois pergunte: "Abri no navegador a prévia
   com as suas cores. Está bom, ou quer ajustar alguma coisa?" Ajuste e gere de novo até ela aprovar.
6. **Escrever a memória do negócio** em `<espaço>/meu-negocio/negocio.md`, no modelo do roteiro: quem é, o que
   vende, para quem, diferenciais, como fala, provas públicas (casos e números que estão no site, com a fonte),
   condições comerciais de sempre e o que não faz. Cada fato com de onde veio e quando ("site, lido em 04/11/2026").
   Nada que a pessoa não confirmou entra como certo.
7. **Lembrar sempre?** Pergunte se ela quer que o Claude lembre do negócio em todas as conversas, não só nas
   propostas. Com o sim: `node ferramentas/lembrar-negocio.mjs --ligar` (acrescenta um bloco ao `~/.claude/CLAUDE.md`
   que importa o `negocio.md`; `--desligar` tira).
8. **Publicação:** explique em duas linhas que as propostas ficam num link com código, na Cloudflare (grátis), e
   pergunte se ela já tem conta e se o domínio do site está na Cloudflare. Com domínio lá, sugira
   `propostas.<domínio>` e grave em `<espaço>/publicacao/cloudflare.json` (`"dominio"`). O login (`! npx wrangler@4
   login`) pode ficar para a primeira publicação.
9. **Mostrar o resultado:** `bash ../propostas/ferramentas/nova-proposta.sh exemplo-da-minha-marca exemplo ancora`
   cria, no espaço, a proposta de exemplo do kit já com a marca dela. Gere com `KIT_ENSAIO=1 npm run build` dentro
   da pasta (o exemplo tem um cliente inventado, por isso o modo de ensaio, que nunca é publicado) e abra o HTML de
   `dist/` no navegador. Diga que essa pasta é só para ver e pode ser apagada quando ela quiser (só com o ok dela).
10. **Fechar** com 3 a 5 linhas: o que ficou guardado, onde, e como pedir a primeira proposta ("me mande o pedido do
    cliente e diga se já falou de valor com ele").

## Atualizar depois

Rodar de novo atualiza o perfil (o anterior fica em `perfil.anterior.json`) e a memória. Proposta já feita guarda a
marca da época: para trazer a marca nova para uma proposta, `node ../propostas/ferramentas/aplicar-marca.mjs
<perfil.json> <pasta da proposta>` e gerar de novo.

## Privacidade

O kit não tem servidor e não manda nada para o autor. O site é lido da máquina da pessoa. Contato e documento só
entram no perfil com a confirmação dela, e nada de terceiros (clientes, funcionários) entra na memória.
