<!-- Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026 -->
# Mudanças

Cada versão tem a sua página em [Releases](https://github.com/dantaspaulo/kit-propostas/releases). Para atualizar o
kit, rode o instalador de novo (ou `/plugin marketplace update kit-propostas`, se instalou como plugin).

## 1.1.0 (04/11/2026)

A página passou a conduzir o cliente da leitura ao aceite, com componentes animados do React Bits gratuito.

- **Topo em duas colunas:** o título, o resumo e quem, quando, até quando (com quantos dias faltam) e a referência
  à esquerda; à direita, o cartão com o caminho da solução em degraus (`fluxo` no `data.ts`).
- **Solução numa vitrine escura,** com a esfera viva no centro do mapa (Orb).
- **Opção recomendada com uma estrela** percorrendo o contorno (StarBorder).
- **"Quero seguir" leva ao aceite,** e "Tenho uma dúvida antes" leva ao WhatsApp.
- **Seção de aceite nova:** o que acontece depois do sim (`chamada.passos`), o resumo da opção em foco e o botão de
  segurar para aceitar (HoldButton), que abre o WhatsApp com a opção, o valor e o pagamento já escritos. Ao fundo, a
  aurora (SoftAurora). No PDF, o caminho para aceitar por escrito.
- **Barra de aceite:** aparece depois do investimento e acompanha a leitura até o aceite. **Botão Aceitar** no
  cabeçalho.
- **React Bits gratuito sem redistribuir:** o `ferramentas/reactbits.mjs` baixa os quatro componentes do registro
  oficial quando a proposta nasce (lista em `reactbits.json`) e guarda uma cópia local. O código deles fica fora do
  git, e a trava do repositório recusa a pasta.
- **Imagens do README refeitas,** com a seção de aceite.
- **Trava de autoria:** o instalador, a abertura de proposta, a entrevista, o build e a publicação conferem os
  créditos (nome do autor, repositório oficial, impressão da obra e a linha de crédito de cada arquivo) pela
  impressão digital e param se eles foram trocados. O manifesto `AUTORIA.json` registra cada arquivo da versão
  oficial. Testado com 7 adulterações (`testes/teste-autoria.mjs`).
- **Correções:** a página não vaza mais para o lado no celular; a barra de aceite não cobre as opções enquanto o
  cliente escolhe; o teste do limite de tentativas não falha mais na virada do minuto.

## 1.0.0 (04/11/2026)

Primeira versão.

- Skill `propostas`: o método das propostas da PSD Software (topo que responde como, em quanto tempo e por quanto;
  escopo 100% preso ao pedido; âncora abaixo, âncora acima e valor direto; parcelas presas a entregas; custos de
  terceiros com fonte; condições; dúvidas), o modelo da página com as guardas do build, o PDF igual à tela, a imagem
  da prévia do WhatsApp e a publicação num Worker da Cloudflare com código de acesso, limite de tentativas e
  conferência no ar.
- Skill `propostas-configurar`: a entrevista que lê o site do negócio, monta a paleta com contraste conferido,
  mostra a prévia da marca, grava a memória do negócio e prepara o espaço de trabalho.
- Instalador para o Claude Code e para a pasta que outras IAs leem, desinstalador que não apaga propostas, e plugin
  do Claude Code.
- Portão: código sorteado (3 palavras e 2 algarismos, cerca de 926 milhões de combinações) guardado só como
  SHA-256, cookie assinado preso a cada proposta, limite de tentativas por endereço (o bloco /64 no IPv6) e por
  proposta, e envio limitado a 2 KB. Testado também no runtime da Cloudflare (`testes/portao-no-runtime.sh`).
- Imagens do README geradas a partir do modelo, com negócios inventados (`ferramentas-do-repo/gerar-imagens.mjs`).
