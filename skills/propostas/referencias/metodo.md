# O método: como expor as informações

Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026

A proposta é lida por alguém ocupado, no celular, entre uma reunião e outra. Ela precisa responder em segundos
o que essa pessoa quer saber e, depois, sustentar cada número quando ela voltar com calma. Tudo abaixo serve a isso.

## 1. O topo responde as três perguntas

Todo cliente quer saber **como**, **em quanto tempo** e **por quanto**. O topo responde as três em três cartões
(`respostas` no `data.ts`), cada um levando à seção que aprofunda. Depois do título vem para quem é, a data e a
validade. Ninguém precisa rolar a página para saber o essencial.

A ordem da página segue as perguntas: como fazemos, o escopo item por item, as etapas e o prazo, o investimento,
os custos de terceiros, as condições, as dúvidas e o próximo passo. O que não ajuda a decidir fica fora: página
objetiva vende mais que página longa.

## 2. O pedido é o contrato

Antes de qualquer tela, o pedido vira uma lista (`pedido` no `data.ts`): um id, o texto nas palavras do cliente e
onde ele é respondido. Toda linha da matriz de escopo aponta para um ou mais ids (`ref`), e o build recusa linha
sem dono e item do pedido sem resposta.

- **Nada além do pedido.** Recurso que o cliente não pediu não entra, nem para valorizar a opção mais cara. Se
  um extra sair numa revisão, ponha o nome dele em `extrasRetirados`: o build não deixa voltar.
- **O que deve ter e não foi dito** (segurança, backup, testes, garantia) entra como um item próprio do pedido,
  com a fonte dizendo isso ("o que deve ter e não foi dito, combinado com a pessoa em DD/MM").
- **Pedido falado, sem documento:** o pedido vem do que a pessoa contou, e o comentário do topo do `data.ts` diz
  de onde veio.

## 3. Três jeitos de mostrar o valor

A primeira pergunta à pessoa, junto com os valores: **você já falou de valor com esse cliente?** Se falou, é
direto. Se não, é âncora, e a pessoa escolhe para que lado ancorar.

| | Âncora abaixo | Âncora acima | Valor direto |
|---|---|---|---|
| Quando | o valor ainda não foi falado, e a recomendada é o pedido inteiro | o valor ainda não foi falado, e a pessoa quer que o valor dela pareça o melhor negócio | o valor já foi combinado ("não quero discutir valor, já passei") |
| Opções | 2 ou 3; a recomendada é a mais cara | 3: a âncora (mais cara), a recomendada (o valor da pessoa) e uma menor | 1 |
| Ordem na página | a recomendada primeiro | a mais cara primeiro, a recomendada logo depois, abrindo selecionada | uma só |
| Preço por módulo | sim, com o selo do nível em cada célula | sim | não |
| Texto | "nas três opções", "escolha a opção" | idem | nunca "opção" (as capturas e o PDF recusam) |
| No `data.ts` | `modo = "ancora"`, `ancora = "abaixo"` | `modo = "ancora"`, `ancora = "acima"` | `modo = "direto"` |
| Abrir com | `nova-proposta.sh ... ancora` | `nova-proposta.sh ... ancora-acima` | `nova-proposta.sh ... direto` |

### Âncora abaixo: o cliente quer a recomendada

- A recomendada é o pedido inteiro, no menor prazo, e vem primeiro em tudo (`ordem = [2, 1, 0]`).
- **As outras são o mesmo pedido, reduzido:** mais limitadas e mais simples, não só mais baratas. Com menos gente
  no time, demoram mais. Cada uma diz o que entra (`inclui`) e "o que fica de fora nesta opção" (`depois`), só com
  itens do pedido.
- O painel das menores mostra a diferença, calculada: "Entrega 56 dias depois da recomendada, com garantia de 30
  dias em vez de 90".
- Com duas opções: a recomendada e uma reduzida ("quero cobrar esse valor, mas pode ter um outro de âncora").

### Âncora acima: o valor da pessoa parece o melhor negócio

Pedido típico: "um mais alto, para não ser escolhido, o médio que é o que eu quero cobrar, e um mais barato,
perto do médio, embora mais limitado".

- **A âncora cresce dentro do pedido:** mais gente, prazo menor, limites maiores (quantidade, volume, unidades),
  garantia maior, meses de acompanhamento inclusos, treinamento presencial. **Nada de recurso novo**, pela regra do
  100% do pedido.
- **A recomendada fica no meio** e é a que abre selecionada (`recomendada` no `data.ts`), mesmo não sendo a primeira
  da ordem (`ordem = [2, 1, 0]`, com a âncora em 2).
- **A menor fica perto no preço e longe no que entrega:** por exemplo, R$ 41 mil contra R$ 48 mil, sem o Pix, sem o
  faturamento no painel, com uma pessoa a menos e um mês a mais. Uma dúvida própria faz a conta por escrito: "Por que
  o Completo, e não o Essencial? Por R$ 7.000 a mais, leva..."
- O build confere: três opções, a recomendada não é a mais cara, a ordem começa pela mais cara e segue pela
  recomendada.

### Valor direto: o valor que já foi combinado

- Uma opção, com o valor combinado, e nenhum outro. Sem opções, sem preço por módulo: opções convidam a renegociar
  o que já foi fechado.
- **Tudo o que é do pedido entra nesse valor.** Se o escopo parecer grande para o valor, sugira à pessoa reduzir um
  item específico, nunca criar opções.
- A matriz continua item a item, numa coluna: o cliente vê tudo o que recebe, só não vê o preço por parte.
- Valor maior só para o que custa mais de verdade (mais gente, algo mais complexo), e isso é outra conversa.

## 4. Preço por módulo (modos âncora)

- Cada módulo tem um preço em cada opção (`precos`, na ordem das opções do `data.ts`). A soma dos módulos é o preço
  da opção (o build garante).
- **Módulo ausente custa 0** e aparece como "Fora". Módulo já pago por outro usa `semCustoProprio` e aparece "na base".
- **O peso maior vai para o que dá mais trabalho e mais risco.** O módulo que só existe na recomendada concentra a
  diferença final.
- **Cada célula da matriz leva o selo do nível** (Básico, Avançado, Completo, Ampliado), e embaixo vem a nota "Por
  que o mesmo módulo custa diferente? Porque não é o mesmo módulo", com um exemplo do pedido (`exemploNiveis`).
- Os valores por módulo compõem cada opção e não são vendidos separados: a página diz isso.
- **Cada célula tem um de três estados:** incluso `S()`, versão reduzida `P("o que entra")` ou fora `N`. A reduzida
  sempre diz o que entra.

## 5. Parcelas presas a entregas

- A primeira na assinatura; as outras presas a marcos com entregas concretas. O aceite do marco libera a parcela, e
  a soma das parcelas é o preço (o build garante).
- Parcelas mensais em vez de por entrega: a primeira na assinatura e as outras a cada 30 dias depois do aceite do mês
  anterior. A última entrega, se não tiver parcela, entra com `valor: 0` e aparece como "Entrega, já quitado".

## 6. Etapas

As mesmas etapas em todas as opções, com durações diferentes. As fases somam o prazo (o build garante), e o gráfico
mostra cada opção. Cada etapa diz o que você faz, o que entrega e **o que o cliente faz** (valida o protótipo, testa,
dá o aceite em até 5 dias úteis). Projeto curto: `unidadePrazo = "dias"`.

Um jeito que funciona: imersão e desenho (protótipo, critérios de aceite), fundação técnica, construção em ciclos
curtos com demonstração gravada, testes e aceite, lançamento. Adapte ao tipo de negócio: num evento, numa obra ou
numa consultoria as etapas são outras, com a mesma lógica.

## 7. Custos de terceiros, à parte

Seção própria, separada do preço, porque o cliente pergunta e porque é onde a proposta mostra seriedade.

- O que o cliente providencia (acessos, contas, uma pessoa de referência) e o que paga direto aos fornecedores.
- Três números em destaque, cada um com a fonte (link) e a data da consulta. Valor em dólar convertido pela PTAX de
  venda do dia, com fonte (Banco Central).
- **Número sem fonte não entra.** Preço de fornecedor muda: confira na página oficial em português, no dia. Quando
  descobrir que uma regra mudou, acrescente a frase velha em `afirmacoes.json`: o build passa a recusar.
- "Nós cobramos só a implantação" fica escrito nos custos e nas exclusões.

## 8. Condições

- **Aceite:** demonstrações (frequência da opção, gravadas), aceite por marco em até 5 dias úteis (sem manifestação,
  o marco é aceito), integrações testadas primeiro com contas de teste, mudança de escopo só por escrito.
- **Garantia:** cobre defeito em relação ao escopo aprovado; não cobre funcionalidade nova, falha de terceiros,
  alteração de outra equipe nem a operação do dia a dia. **O tempo de resposta é o mesmo em todas as opções**
  (crítico em 1 dia útil, demais em 10): o que muda é o prazo da garantia. Ninguém se sente cliente de segunda.
- **Exclusões, ditas com clareza:** suporte e sustentação depois da garantia (à parte), custos de terceiros e o que
  for típico do tipo de projeto (aplicativo nativo, migração de dados, conteúdo, identidade visual, textos jurídicos).
- **De quem é o quê:** o que foi feito para o cliente é dele depois da quitação; ferramentas próprias e de terceiros
  continuam com os donos, licenciadas para uso; sigilo dos dois lados.
- **Condições gerais:** moeda, forma de pagamento e nota fiscal (do perfil), quando o prazo começa a contar, o que
  desloca o cronograma e a validade.

## 9. Dúvidas que respondem objeções

Seis a oito perguntas, nas palavras do cliente. No modo âncora, algumas empurram para a recomendada:

- "Por que o mesmo módulo custa diferente em cada opção?" (os níveis, com o exemplo do pedido)
- "Posso começar pela menor e evoluir depois?" ("Pode, mas sai mais caro no total": nova imersão, refazer o básico)
- "Como vocês entregam isso nesse prazo?" (mais gente, ciclos curtos, peças que já funcionam)
- Na âncora acima: "Por que a recomendada, e não a menor?", com a conta.
- Uma ou duas do domínio do cliente (no exemplo: "O WhatsApp é oficial? Existe risco de bloqueio?").
- "E depois da entrega?" (garantia; suporte à parte).

## 10. Texto

- Português do Brasil simples: frase curta, voz ativa, "você" para o cliente.
- Promessa vira entrega verificável: o quê, quando e como se aceita.
- Sem travessão e sem palavra de efeito. Número com fonte, ou calculado no `data.ts`.
- Dados do cliente: só nome, cargo e empresa. Nada de dado pessoal além disso, e nada de outro cliente.
- Referência no formato `SIGLA-AAAA-MMDD-CLIENTE` (a sigla vem do perfil).
- Ferramenta que a pessoa não quer revelar (um motor de IA, um parceiro) não aparece pelo nome: ponha o nome nos
  `termos` do `herdado.json` da proposta, e o build recusa se escapar.
