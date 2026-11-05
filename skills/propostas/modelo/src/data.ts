// Fonte única de todo o conteúdo da proposta. Preço, escopo, prazo e parcelas saem daqui; o build recusa
// se as somas não fecharem ou se algo fugir do pedido (build.mjs).
//
// EXEMPLO INVENTADO (a Clínica Bem Viver não existe): é o ponto de partida de toda proposta nova. O build
// recusa a página enquanto sobrar algum termo do exemplo (herdado.json).
import { marca } from "@/lib/marca";
import { N, P, S, type Destaque, type Etapa, type Modulo, type Opcao } from "@/lib/tipos";
import { brl, dataIso, dataLonga, somarDias } from "@/lib/utils";

export const negocio = marca.negocio;

/**
 * Como o valor aparece (ver referencias/metodo.md da skill):
 * - "ancora": duas ou três opções, com preço por módulo. `ancora = "abaixo"`: a recomendada é o pedido
 *   inteiro e vem primeiro; as outras são o mesmo pedido reduzido. `ancora = "acima"`: uma opção mais cara
 *   vem primeiro para ancorar, a recomendada fica no meio e abre selecionada, e a menor fica perto no preço
 *   e longe no que entrega.
 * - "direto": o valor que já foi combinado com o cliente, numa opção só, sem preço por módulo.
 */
export const modo: "ancora" | "direto" = "ancora";
export const ancora: "abaixo" | "acima" = "abaixo";

/** Prazo em semanas (padrão) ou em dias, para projeto curto. As fases e a `duracao` usam esta unidade. */
export const unidadePrazo: "semanas" | "dias" = "semanas";

const emitidaEm = new Date(2026, 10, 4); // 04/11/2026: troque pela data de hoje
const validadeDias = marca.comercial.validadeDias;
const venceEm = somarDias(emitidaEm, validadeDias);

export const proposta = {
  referencia: `${negocio.sigla}-2026-1104-BEMVIVER`,
  data: dataLonga(emitidaEm),
  validade: dataLonga(venceEm),
  validadeCurta: venceEm.toLocaleDateString("pt-BR"),
  validadeISO: dataIso(venceEm),
  validadeDias,
  cliente: {
    empresa: "Clínica Bem Viver",
    contato: "Marina Rocha",
    cargo: "Diretora de operações",
  },
  projeto: "plataforma de agendamento online",
};

/**
 * Endereço da proposta: <seu endereço de propostas>/<caminho>/. O título e a descrição aparecem na tela
 * de acesso e na prévia do WhatsApp, que são PÚBLICAS: nada de nome do cliente nem de valores aqui.
 */
export const publicacao = {
  caminho: "agenda-online",
  slug: "agenda-online-bem-viver",
  titulo: "Plataforma de Agendamento Online",
  descricao: `Proposta técnica e comercial de ${negocio.nome}. Abra com o código de acesso que você recebeu.`,
  /** A imagem da prévia no WhatsApp (publicar/og.html), também pública: sem cliente e sem valores. */
  imagem: {
    titulo: "Agendamento online",
    destaque: "em três unidades",
    frase: "Agenda, WhatsApp e Pix numa plataforma só.",
  },
};
export const arquivoPdf = `proposta-${publicacao.slug}.pdf`;

/** Termos do herdado.json que valem também nesta proposta, liberados de propósito. */
export const termosPermitidos: string[] = [];

/** Recursos que o cliente não pediu e já saíram uma vez: o build recusa se voltarem ao texto. */
export const extrasRetirados: string[] = [];

export const wa = (mensagem: string) => `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(mensagem)}`;

/* ------------------------------------------------------------------ */
/* O pedido, item por item                                              */
/* ------------------------------------------------------------------ */

/**
 * O contrato da proposta: tudo o que entra aponta para cá. Fonte: o e-mail da cliente (exemplo).
 * `onde` é "matriz" (aparece no escopo) ou o nome da seção que responde ao item.
 */
export const pedido: Record<string, { texto: string; onde: "matriz" | string }> = {
  "AG.1": { texto: "Agenda online por profissional e por unidade, nas 3 unidades", onde: "matriz" },
  "AG.2": { texto: "Paciente marca, remarca e cancela pelo celular, sem precisar ligar", onde: "matriz" },
  "WA.1": { texto: "Confirmação e lembrete automáticos pelo WhatsApp", onde: "matriz" },
  "PG.1": { texto: "Sinal por Pix na hora de marcar, para reduzir as faltas", onde: "matriz" },
  "PN.1": { texto: "Painel do gestor com ocupação, faltas e faturamento por unidade", onde: "matriz" },
  "EQ.1": { texto: "Acesso por perfil: recepção, profissional e gestor", onde: "matriz" },
  "FIN.1": { texto: "Levar os atendimentos para o sistema financeiro que já usamos", onde: "matriz" },
  "LGPD.1": { texto: "Dados dos pacientes protegidos, de acordo com a LGPD", onde: "matriz" },
  "TR.1": { texto: "Treinamento da equipe das 3 unidades", onde: "matriz" },
  "PRZ.1": { texto: "Começar a usar em até 3 meses", onde: "etapas e investimento" },
};

/* ------------------------------------------------------------------ */
/* Escopo por módulo, com o preço de cada módulo em cada opção          */
/* ------------------------------------------------------------------ */

export const modulos: Modulo[] = [
  {
    id: "base",
    rotulo: "Base",
    titulo: "Base técnica e segurança",
    resumo: "Onde a plataforma mora, no nome da clínica.",
    precos: [4000, 5000, 6000],
    itens: [
      { t: "Hospedagem no nome da clínica, com HTTPS e backup diário conferido", ref: ["LGPD.1"], c: [S(), S(), S()] },
      { t: "Login com senha forte e registro de quem fez o quê", ref: ["LGPD.1", "EQ.1"], c: [S(), S(), S()] },
      {
        t: "Termo de consentimento e aviso de privacidade no agendamento",
        ref: ["LGPD.1"],
        c: [P("modelo padrão"), S("revisado com a clínica"), S("revisado com a clínica")],
      },
    ],
  },
  {
    id: "agenda",
    rotulo: "Módulo 1",
    titulo: "Agenda online",
    resumo: "Uma agenda só, com cada profissional e cada unidade.",
    precos: [6000, 8000, 9000],
    itens: [
      { t: "Agenda por profissional, com horários, intervalos e folgas", ref: ["AG.1"], c: [S(), S(), S()] },
      { t: "As 3 unidades na mesma agenda, com filtro por unidade", ref: ["AG.1"], c: [P("1 unidade"), S(), S()] },
      { t: "Bloqueios e encaixes feitos pela recepção", ref: ["AG.1"], c: [S(), S(), S()] },
    ],
  },
  {
    id: "paciente",
    rotulo: "Módulo 2",
    titulo: "Autoatendimento do paciente",
    resumo: "O paciente resolve pelo celular, sem ligar.",
    precos: [3000, 5000, 7000],
    itens: [
      { t: "Marcação pelo celular, sem baixar aplicativo", ref: ["AG.2"], c: [S(), S(), S()] },
      { t: "Remarcação e cancelamento com regra de antecedência", ref: ["AG.2"], c: [P("só cancelamento"), S(), S()] },
      { t: "Fila de espera que oferece o horário que vagou", ref: ["AG.2"], c: [N, N, S()] },
    ],
  },
  {
    id: "whatsapp",
    rotulo: "Módulo 3",
    titulo: "WhatsApp",
    resumo: "Confirmação e lembrete no número oficial da clínica.",
    precos: [3000, 6000, 8000],
    itens: [
      { t: "Confirmação automática assim que o paciente marca", ref: ["WA.1"], c: [S(), S(), S()] },
      {
        t: "Lembrete na véspera, com resposta para confirmar ou remarcar",
        ref: ["WA.1", "AG.2"],
        c: [P("só o lembrete, sem resposta"), S(), S()],
      },
      { t: "Número oficial da clínica na API do WhatsApp", ref: ["WA.1"], c: [S(), S(), S()] },
    ],
  },
  {
    id: "pix",
    rotulo: "Módulo 4",
    titulo: "Sinal por Pix",
    resumo: "O horário fica garantido quando o sinal cai.",
    precos: [0, 4000, 5000],
    itens: [
      { t: "Sinal por Pix ao marcar, com baixa automática", ref: ["PG.1"], c: [N, S(), S()] },
      { t: "Devolução do sinal quando o cancelamento está dentro da regra", ref: ["PG.1"], c: [N, P("pelo painel, à mão"), S("automática")] },
    ],
  },
  {
    id: "painel",
    rotulo: "Módulo 5",
    titulo: "Painel do gestor",
    resumo: "Ocupação, faltas e faturamento de cada unidade.",
    precos: [2000, 4000, 7000],
    itens: [
      { t: "Ocupação e faltas por unidade e por profissional", ref: ["PN.1"], c: [P("total da clínica"), S(), S()] },
      { t: "Faturamento previsto e realizado", ref: ["PN.1"], c: [N, S(), S()] },
      { t: "Exportação em planilha", ref: ["PN.1", "FIN.1"], c: [S(), S(), S()] },
    ],
  },
  {
    id: "perfis",
    rotulo: "Módulo 6",
    titulo: "Perfis e sistema financeiro",
    resumo: "Cada um vê o que precisa, e o financeiro recebe os atendimentos.",
    precos: [1000, 2000, 4000],
    itens: [
      { t: "Perfis de recepção, profissional e gestor", ref: ["EQ.1"], c: [P("recepção e gestor"), S(), S()] },
      {
        t: "Atendimentos enviados ao sistema financeiro",
        ref: ["FIN.1"],
        c: [P("planilha semanal"), P("arquivo diário automático"), S("ligação direta, se o sistema permitir")],
      },
    ],
  },
  {
    id: "entrega",
    rotulo: "Entrega",
    titulo: "Implantação e treinamento",
    resumo: "Para a equipe usar desde o primeiro dia.",
    precos: [2000, 2000, 2000],
    itens: [
      {
        t: "Treinamento da equipe das 3 unidades",
        ref: ["TR.1"],
        c: [P("1 sessão online"), S("2 sessões online"), S("1 sessão em cada unidade")],
      },
      { t: "Manual de uso em vídeos curtos", ref: ["TR.1"], c: [N, S(), S()] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Etapas                                                              */
/* ------------------------------------------------------------------ */

export const etapas: Etapa[] = [
  {
    id: "imersao",
    nome: "Imersão e desenho",
    curto: "Imersão",
    texto: "Conhecemos a rotina das unidades e desenhamos as telas com você antes de construir.",
    entregas: ["Protótipo navegável", "Critérios de aceite de cada módulo"],
    voce: "Você valida o protótipo e as regras de agendamento.",
  },
  {
    id: "base",
    nome: "Fundação técnica",
    curto: "Fundação",
    texto: "Preparamos a hospedagem no nome da clínica, a segurança e o número oficial do WhatsApp.",
    entregas: ["Ambiente de testes no ar", "WhatsApp oficial aprovado"],
    voce: "Você libera os acessos e o número da clínica.",
  },
  {
    id: "construcao",
    nome: "Construção em ciclos curtos",
    curto: "Construção",
    texto: "Cada ciclo termina com uma demonstração ao vivo do que ficou pronto, gravada.",
    entregas: ["Módulos prontos para teste", "Demonstração gravada de cada ciclo"],
    voce: "Você testa cada módulo e diz o que ajustar.",
  },
  {
    id: "homologacao",
    nome: "Testes e aceite",
    curto: "Aceite",
    texto: "A equipe testa com casos reais da clínica, e corrigimos tudo antes de valer.",
    entregas: ["Roteiro de testes aprovado", "Correções feitas"],
    voce: "Você dá o aceite em até 5 dias úteis.",
  },
  {
    id: "implantacao",
    nome: "Lançamento nas unidades",
    curto: "Lançamento",
    texto: "Treinamos a equipe, ligamos a agenda para os pacientes e acompanhamos a primeira semana.",
    entregas: ["Plataforma no ar", "Equipe treinada"],
    voce: "Você avisa os pacientes do novo jeito de marcar.",
  },
];

/* ------------------------------------------------------------------ */
/* Opções                                                              */
/* ------------------------------------------------------------------ */

export const opcoes: Opcao[] = [
  {
    id: "essencial",
    nome: "Essencial",
    nivel: "Básico",
    selo: "Versão enxuta",
    preco: 21000,
    prazo: "5 meses",
    duracao: 20,
    equipe: "1 especialista",
    ritmo: "dedicação parcial",
    frase: "A agenda de uma unidade, para começar.",
    para: "Para começar por uma unidade, com a marcação pelo celular e o lembrete no WhatsApp, sem o sinal por Pix.",
    inclui: ["Agenda online de 1 unidade", "Marcação e cancelamento pelo celular", "Confirmação e lembrete no WhatsApp", "Painel com o total da clínica"],
    depois: ["As outras 2 unidades", "Sinal por Pix", "Faturamento no painel", "Fila de espera"],
    demos: "a cada 30 dias",
    garantia: { dias: 30 },
    pagamento: "entrada e 4 parcelas",
    fases: [
      { id: "imersao", duracao: 3 },
      { id: "base", duracao: 3 },
      { id: "construcao", duracao: 10 },
      { id: "homologacao", duracao: 2 },
      { id: "implantacao", duracao: 2 },
    ],
    marcos: [
      { quando: "Assinatura", titulo: "Início", tipo: "Entrada", valor: 5000, itens: ["Imersão e protótipo"] },
      { quando: "Semana 6", titulo: "Base pronta", tipo: "2ª parcela", valor: 4000, itens: ["Ambiente de testes", "WhatsApp aprovado"] },
      { quando: "Semana 11", titulo: "Agenda", tipo: "3ª parcela", valor: 4000, itens: ["Agenda e marcação em teste"] },
      { quando: "Semana 16", titulo: "Lembretes", tipo: "4ª parcela", valor: 4000, itens: ["WhatsApp e painel em teste"] },
      { quando: "Semana 20", titulo: "Lançamento", tipo: "5ª parcela", valor: 4000, itens: ["Plataforma no ar", "Equipe treinada"] },
    ],
  },
  {
    id: "profissional",
    nome: "Profissional",
    nivel: "Avançado",
    selo: "Versão avançada",
    preco: 36000,
    prazo: "4 meses",
    duracao: 16,
    equipe: "2 especialistas",
    frase: "As três unidades, com sinal por Pix.",
    para: "Para as 3 unidades, com o sinal por Pix e o painel completo, sem a fila de espera e com o financeiro por arquivo.",
    inclui: ["Agenda das 3 unidades", "Remarcação pelo celular", "Lembrete com resposta no WhatsApp", "Sinal por Pix", "Painel com faturamento"],
    depois: ["Fila de espera", "Devolução automática do sinal", "Ligação direta com o financeiro"],
    demos: "a cada 15 dias",
    garantia: { dias: 60 },
    pagamento: "entrada e 3 parcelas",
    fases: [
      { id: "imersao", duracao: 2 },
      { id: "base", duracao: 2 },
      { id: "construcao", duracao: 8 },
      { id: "homologacao", duracao: 2 },
      { id: "implantacao", duracao: 2 },
    ],
    marcos: [
      { quando: "Assinatura", titulo: "Início", tipo: "Entrada", valor: 9000, itens: ["Imersão e protótipo"] },
      { quando: "Semana 6", titulo: "Agenda", tipo: "2ª parcela", valor: 9000, itens: ["Agenda das 3 unidades em teste"] },
      { quando: "Semana 11", titulo: "Pix e WhatsApp", tipo: "3ª parcela", valor: 9000, itens: ["Sinal por Pix e lembretes em teste"] },
      { quando: "Semana 16", titulo: "Lançamento", tipo: "4ª parcela", valor: 9000, itens: ["Plataforma no ar", "Equipe treinada"] },
    ],
  },
  {
    id: "completo",
    nome: "Completo",
    nivel: "Completo",
    selo: "Recomendado",
    recomendada: true,
    preco: 48000,
    prazo: "3 meses",
    duracao: 12,
    equipe: "3 especialistas",
    frase: "Tudo o que vocês pediram, em 3 meses.",
    para: "Tudo o que a clínica pediu, nas 3 unidades, no prazo de 3 meses: agenda, autoatendimento, WhatsApp, Pix, painel e financeiro.",
    inclui: [
      "Agenda das 3 unidades",
      "Autoatendimento com fila de espera",
      "Lembrete com resposta no WhatsApp",
      "Sinal por Pix com devolução automática",
      "Painel completo do gestor",
      "Ligação direta com o financeiro",
    ],
    depois: [],
    demos: "toda semana",
    garantia: { dias: 90 },
    pagamento: "4 parcelas iguais",
    fases: [
      { id: "imersao", duracao: 1 },
      { id: "base", duracao: 2 },
      { id: "construcao", duracao: 6 },
      { id: "homologacao", duracao: 2 },
      { id: "implantacao", duracao: 1 },
    ],
    marcos: [
      { quando: "Assinatura", titulo: "Início", tipo: "1ª parcela", valor: 12000, itens: ["Imersão e protótipo"] },
      { quando: "Semana 4", titulo: "Agenda", tipo: "2ª parcela", valor: 12000, itens: ["Agenda e autoatendimento em teste"] },
      { quando: "Semana 8", titulo: "Pix e WhatsApp", tipo: "3ª parcela", valor: 12000, itens: ["Pix, lembretes e painel em teste"] },
      { quando: "Semana 12", titulo: "Lançamento", tipo: "4ª parcela", valor: 12000, itens: ["Plataforma no ar", "Equipe treinada"] },
    ],
  },
];

/** Ordem em que as opções aparecem. Âncora abaixo: a recomendada primeiro. */
export const ordem = [2, 1, 0] as const;
/** Índice da recomendada: é a que abre selecionada. */
export const recomendada = 2;

/** Embaixo da matriz: por que o mesmo módulo custa diferente em cada opção, com um exemplo do pedido. */
export const exemploNiveis =
  "No WhatsApp, o Básico manda só o lembrete; o Avançado e o Completo recebem a resposta do paciente e remarcam sozinhos. É o mesmo módulo, com trabalho diferente.";

/* ------------------------------------------------------------------ */
/* Topo e estrutura                                                     */
/* ------------------------------------------------------------------ */

const rec = opcoes[recomendada];

/** Olho, título (com o trecho em *serifa*) e texto de apoio das seções de estrutura. */
export const secoes = {
  escopo: {
    olho: "Escopo",
    titulo: "O que entra em *cada opção*",
    texto:
      "Cada módulo tem três níveis, um em cada opção. Item por item, o que está incluso, o que entra numa versão reduzida e o que fica de fora. Nada fica implícito.",
  },
  etapas: {
    olho: "Etapas e prazo",
    titulo: "Do primeiro dia *ao lançamento*",
    texto: "As mesmas etapas em todas as opções; o que muda é o ritmo. Em cada uma, o que fazemos, o que entregamos e o que você faz.",
  },
  investimento: {
    olho: "Investimento",
    titulo: "Três opções, *um só pedido*",
    texto: `O ${rec.nome} entrega tudo o que vocês pediram em ${rec.prazo}. As outras opções são o mesmo pedido, reduzido, com prazo maior.`,
  },
  condicoes: {
    olho: "Condições",
    titulo: "O combinado, *por escrito*",
    texto: "Como aceitamos cada entrega, o que a garantia cobre, o que não está nesta proposta e de quem é o quê.",
  },
  duvidas: {
    olho: "Dúvidas",
    titulo: "Perguntas que *costumam vir*",
    texto: "Se a sua não estiver aqui, mande pelo WhatsApp: respondemos no mesmo dia útil.",
  },
};

export const topo = {
  olho: "Proposta técnica e comercial",
  titulo: "Agenda online para *as três unidades*",
  resumo:
    "Marcação pelo celular, confirmação no WhatsApp e sinal por Pix, com o painel que mostra a ocupação e as faltas de cada unidade.",
};

/** As três perguntas que todo cliente faz, respondidas logo no topo. Cada uma leva à seção dela. */
export const respostas = [
  { olho: "Como fazemos", texto: "Uma agenda só para as 3 unidades, ligada ao WhatsApp e ao Pix da clínica.", href: "#solucao" },
  { olho: "Em quanto tempo", texto: `${rec.prazo}, com demonstração ${rec.demos} do que ficou pronto.`, href: "#etapas" },
  {
    olho: "Com qual investimento",
    texto: `${brl(rec.preco)} no ${rec.nome}, em ${rec.pagamento}. Há opções menores, mais lentas.`,
    href: "#opcoes",
  },
];

/**
 * O cartão ao lado do título: o caminho da solução do começo ao fim, em 3 a 5 passos curtos. O passo que é o
 * coração da solução leva nucleo: true. É a primeira coisa que o cliente olha, antes de ler qualquer texto.
 */
export const fluxo = {
  titulo: "Agenda / fluxo",
  selo: "Como vai funcionar",
  passos: [
    { olho: "Paciente", texto: "Marca pelo celular, sem ligar", estado: "marcado" },
    { olho: "Agenda", texto: "Acha a vaga nas três unidades", estado: "em tempo real", nucleo: true },
    { olho: "WhatsApp e Pix", texto: "Confirma e segura o horário", estado: "confirmado" },
    { olho: "Painel", texto: "Ocupação e faltas por unidade", estado: "ao vivo" },
  ],
  rodape: "Uma agenda só, do celular ao caixa",
};

export const solucao = {
  olho: "Como fazemos",
  titulo: "Uma agenda só, *do celular ao caixa*",
  texto:
    "O paciente marca pelo celular, recebe a confirmação no WhatsApp e garante o horário com o sinal por Pix. A recepção cuida dos encaixes, e o gestor vê cada unidade no painel.",
  nucleo: "Agenda",
  nos: ["Pacientes", "WhatsApp", "Pix", "Recepção", "Gestor", "Financeiro"],
  pilares: [
    { titulo: "O paciente resolve sozinho", texto: "Marca, remarca e cancela pelo celular, sem ligar e sem aplicativo." },
    { titulo: "Menos faltas", texto: "Lembrete na véspera e sinal por Pix, que segura o horário." },
    { titulo: "Cada unidade à vista", texto: "Ocupação, faltas e faturamento por unidade e por profissional." },
  ],
  jeito: [
    { titulo: "Antes de construir", itens: ["Protótipo navegável", "Critérios de aceite escritos"] },
    { titulo: "Durante", itens: ["Demonstração ao vivo e gravada", "Quadro de tarefas aberto para você"] },
    { titulo: "Depois", itens: ["Tudo no nome da clínica", "Garantia sobre o que foi aprovado"] },
  ],
};

/* ------------------------------------------------------------------ */
/* O que fica com vocês: o que a clínica providencia e os custos        */
/* ------------------------------------------------------------------ */

export const custos = {
  olho: "O que fica com vocês",
  titulo: "Custos de *terceiros*, à parte",
  texto: `${negocio.nome} cobra só a implantação. Hospedagem, WhatsApp e Pix são da clínica, pagos direto aos fornecedores.`,
  porSuaConta: [
    { titulo: "Hospedagem", texto: "Um servidor pequeno no nome da clínica. A configuração é nossa." },
    { titulo: "WhatsApp oficial", texto: "O número da clínica na API do WhatsApp, aprovado pela Meta." },
    { titulo: "Pix com API", texto: "A conta da clínica num banco que libere o Pix por API." },
    { titulo: "Uma pessoa de referência", texto: "Para validar o protótipo e dar o aceite em até 5 dias úteis." },
  ],
  destaques: [
    { titulo: "Hospedagem", rotulo: "Servidor pequeno, por mês", valor: "R$ 60", fonte: "Valor ilustrativo do exemplo", href: "#custos-notas" },
    { titulo: "WhatsApp", rotulo: "Por conversa iniciada, tabela da Meta", valor: "por uso", fonte: "Meta, tabela oficial", href: "https://developers.facebook.com/docs/whatsapp/pricing" },
    { titulo: "Pix", rotulo: "Tarifa do banco por Pix recebido", valor: "por uso", fonte: "Tarifas do banco da clínica", href: "#custos-notas" },
  ] satisfies Destaque[],
  notas: [
    "Valores ilustrativos do exemplo: numa proposta de verdade, cada número tem fonte e data de consulta.",
    "O WhatsApp é cobrado pela Meta conforme o tipo de conversa. Medimos o volume no primeiro mês e mostramos a conta.",
    "Cada banco cobra o Pix por API de um jeito. Conferimos o da clínica na imersão, antes de qualquer contratação.",
  ],
};

/* ------------------------------------------------------------------ */
/* Condições                                                           */
/* ------------------------------------------------------------------ */

export const condicoes = {
  aceite: [
    { titulo: "Demonstrações", texto: "Ao vivo, na frequência da opção escolhida, sempre gravadas, com o quadro de tarefas aberto para você." },
    { titulo: "Aceite por marco", texto: "Você valida cada marco em até 5 dias úteis. Sem manifestação nesse prazo, o marco é aceito." },
    { titulo: "Integrações", texto: "Testadas primeiro com contas de teste e depois com as contas reais da clínica." },
    { titulo: "Mudança de escopo", texto: "Tudo o que estiver fora desta proposta é estimado e só entra com a sua aprovação por escrito." },
  ],
  garantia: {
    cobre: "Defeito em relação ao escopo aprovado, a partir do aceite final, pelo prazo da opção escolhida.",
    naoCobre: "funcionalidade nova, falha de terceiros (Meta, banco, hospedagem), alteração feita por outra equipe e a operação do dia a dia.",
    sla: "Defeito crítico com resposta em até 1 dia útil; os demais corrigidos em até 10 dias úteis.",
  },
  exclusoes: [
    `Suporte e sustentação depois da garantia: ${marca.comercial.sustentacao}.`,
    "Custos de terceiros: hospedagem, WhatsApp e Pix.",
    "Aplicativo nas lojas: a marcação funciona pelo navegador do celular.",
    "Migração de agendas antigas, se houver: estimada à parte, depois da imersão.",
    "Identidade visual e textos jurídicos (termos de uso e política de privacidade completos).",
  ],
  propriedade: [
    "O código do projeto fica no repositório da clínica, com os direitos cedidos depois da quitação.",
    "Ferramentas e componentes de terceiros continuam com os donos e ficam licenciados para uso.",
    "Sigilo dos dois lados sobre o projeto e os dados da clínica.",
  ],
  gerais: [
    `Valores em reais. Pagamento por ${marca.comercial.pagamento}${marca.comercial.notaFiscal ? ", com nota fiscal" : ""}.`,
    "O prazo conta a partir da assinatura, do pagamento da primeira parcela e da liberação dos acessos.",
    "Atraso em acessos, aprovações ou fornecedores desloca o cronograma na mesma medida.",
    `Proposta válida por ${validadeDias} dias corridos, até ${proposta.validade}.`,
  ],
};

/* ------------------------------------------------------------------ */
/* Dúvidas                                                             */
/* ------------------------------------------------------------------ */

export const duvidas = [
  {
    q: "Por que o mesmo módulo custa diferente em cada opção?",
    a: `Porque não é o mesmo módulo. ${exemploNiveis} Os valores por módulo compõem cada opção e não são vendidos separados.`,
  },
  {
    q: "Posso começar pelo Essencial e evoluir depois?",
    a: "Pode, mas sai mais caro no total. Cada fase nova pede uma nova imersão, e parte do que é básico precisa ser refeita para chegar ao completo.",
  },
  {
    q: "Como vocês entregam tudo isso em 3 meses?",
    a: "Com mais gente no time, ciclos curtos com demonstração toda semana e peças que já usamos em produção. O tempo da equipe vai para o que é da clínica.",
  },
  {
    q: "O WhatsApp é oficial? Existe risco de bloqueio?",
    a: "É a API oficial da Meta, no número da clínica. As mensagens seguem os modelos aprovados pela Meta, que é o que evita bloqueio.",
  },
  {
    q: "Os dados dos pacientes ficam seguros?",
    a: "Ficam no servidor da clínica, com acesso por perfil, registro de quem fez o quê e backup diário. O agendamento pede o consentimento do paciente.",
  },
  {
    q: "E depois da entrega?",
    a: "A garantia cobre os defeitos pelo prazo da opção escolhida. Suporte e evolução podem continuar com a gente, como serviço à parte.",
  },
];

export const chamada = {
  olho: "Aceite",
  titulo: "Vamos colocar a agenda *no ar?*",
  texto: "Está tudo aqui: o escopo, as etapas, o investimento e as condições. Se fizer sentido para vocês, o aceite leva um segundo, e a gente começa já na semana que vem.",
  /** O que acontece depois do aceite, em ordem: tira o "e agora?" na hora de decidir. */
  passos: [
    { titulo: "Você aceita", texto: "No link da proposta, segurando o botão de aceite: a mensagem, com a opção e o valor, vai pronta para o nosso WhatsApp." },
    { titulo: "Contrato no mesmo dia", texto: "Mandamos o contrato para assinar on-line; a primeira parcela vence na assinatura." },
    { titulo: "Imersão em até 5 dias úteis", texto: "Marcamos a imersão com a sua equipe e começamos pela unidade que você escolher." },
  ],
};
