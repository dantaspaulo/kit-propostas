# Privacidade

Última atualização: 4 de novembro de 2026.

O Kit de Propostas é feito de instruções em texto e de scripts que rodam no computador de quem usa. **O kit não
tem servidor, não coleta dados e não manda nada ao autor.** O autor não recebe, não vê e não guarda nenhum dado
de quem usa o kit nem dos clientes dessa pessoa.

## O que o kit lê

- **O site do seu negócio**, na entrevista, com um navegador sem tela que roda no seu computador: textos, contatos
  publicados, cores, fontes e o logo. Só leitura: não preenche formulário, não faz login, não guarda cookie.
- **O que você conta na conversa** (os dados do negócio, o pedido do cliente, valores e prazos) e os arquivos que
  você indicar (o pedido em PDF, por exemplo), lidos pelo seu assistente de IA, como em qualquer conversa.

## Para onde vão os dados

- **React Bits:** quando uma proposta nasce, o kit baixa quatro componentes gratuitos do registro oficial
  (reactbits.dev). É só um download: nada do seu negócio nem do cliente vai junto. Da segunda vez em diante, usa
  a cópia guardada no seu computador.
- **Cloudflare**, só quando você publica: a página da proposta, o PDF, a imagem da prévia e o logo vão para o
  Worker da **sua** conta, atrás do código de acesso (a imagem da prévia e o logo ficam públicos, sem cliente e sem
  valores). O comando de publicação desliga o envio de métricas do wrangler.
- **Google Fonts:** quem abre a proposta carrega as fontes do Google, como em qualquer site.
- **O seu assistente de IA** (Claude, Codex, Cursor e outros): o kit roda dentro das suas conversas, que seguem a
  política do fornecedor do assistente.

Os dados não vão para nenhum outro lugar.

## O que fica guardado, e onde

- No seu computador, no espaço de trabalho (padrão `~/Propostas`): o perfil do negócio, a memória em texto
  (`negocio.md`), o logo e as propostas. Você pode apagar quando quiser.
- Em `~/.kit-propostas`: o kit, as ferramentas e a indicação de onde fica o espaço de trabalho.
- Se você aceitar na entrevista, um bloco curto no `~/.claude/CLAUDE.md` que faz o Claude lembrar do seu negócio em
  todas as conversas. O `desinstalar.sh` tira.
- **O código de acesso de cada proposta não fica em arquivo nenhum.** Só o hash dele, numa pasta fora do git.

Se você guardar o espaço de trabalho no GitHub, use um repositório **privado**: as propostas têm valores e dados de
clientes.
