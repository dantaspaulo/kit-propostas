# Mudanças

## 1.0.0 (04/11/2026)

Primeira versão pública.

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
