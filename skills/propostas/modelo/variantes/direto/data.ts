// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Fonte única de todo o conteúdo da proposta. Preço, escopo, prazo e parcelas saem daqui; o build recusa
// se as somas não fecharem ou se algo fugir do pedido (build.mjs).
//
// EXEMPLO INVENTADO, no modo VALOR DIRETO: o valor já foi combinado com o cliente, então a proposta tem uma
// opção só, sem preço por módulo, e o texto nunca fala em "opção" (as capturas e o PDF recusam).
import { marca } from "@/lib/marca";
import { S, type Destaque, type Etapa, type Modulo, type Opcao } from "@/lib/tipos";
import { brl, dataIso, dataLonga, somarDias } from "@/lib/utils";

export const negocio = marca.negocio;

/** Valor direto: o valor que já foi combinado com o cliente, numa opção só, sem preço por módulo. */
export const modo: "ancora" | "direto" = "direto";
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
  "VAL.1": { texto: "O valor combinado na conversa, em 3 parcelas", onde: "investimento e condições" },
};

/* ------------------------------------------------------------------ */
/* Escopo por módulo: valor direto, sem preço por módulo                */
/* ------------------------------------------------------------------ */

export const modulos: Modulo[] = [
  {
    id: "base",
    rotulo: "Base",
    titulo: "Base técnica e segurança",
    resumo: "Onde a plataforma mora, no nome da clínica.",
    itens: [
      { t: "Hospedagem no nome da clínica, com HTTPS e backup diário conferido", ref: ["LGPD.1"], c: [S()] },
      { t: "Login com senha forte e registro de quem fez o quê", ref: ["LGPD.1", "EQ.1"], c: [S()] },
      { t: "Termo de consentimento e aviso de privacidade no agendamento", ref: ["LGPD.1"], c: [S("revisado com a clínica")] },
    ],
  },
  {
    id: "agenda",
    rotulo: "Módulo 1",
    titulo: "Agenda online",
    resumo: "Uma agenda só, com cada profissional e cada unidade.",
    itens: [
      { t: "Agenda por profissional, com horários, intervalos e folgas", ref: ["AG.1"], c: [S()] },
      { t: "As 3 unidades na mesma agenda, com filtro por unidade", ref: ["AG.1"], c: [S()] },
      { t: "Bloqueios e encaixes feitos pela recepção", ref: ["AG.1"], c: [S()] },
    ],
  },
  {
    id: "paciente",
    rotulo: "Módulo 2",
    titulo: "Autoatendimento do paciente",
    resumo: "O paciente resolve pelo celular, sem ligar.",
    itens: [
      { t: "Marcação pelo celular, sem baixar aplicativo", ref: ["AG.2"], c: [S()] },
      { t: "Remarcação e cancelamento com regra de antecedência", ref: ["AG.2"], c: [S()] },
      { t: "Fila de espera que oferece o horário que vagou", ref: ["AG.2"], c: [S()] },
    ],
  },
  {
    id: "whatsapp",
    rotulo: "Módulo 3",
    titulo: "WhatsApp",
    resumo: "Confirmação e lembrete no número oficial da clínica.",
    itens: [
      { t: "Confirmação automática assim que o paciente marca", ref: ["WA.1"], c: [S()] },
      { t: "Lembrete na véspera, com resposta para confirmar ou remarcar", ref: ["WA.1", "AG.2"], c: [S()] },
      { t: "Número oficial da clínica na API do WhatsApp", ref: ["WA.1"], c: [S()] },
    ],
  },
  {
    id: "pix",
    rotulo: "Módulo 4",
    titulo: "Sinal por Pix",
    resumo: "O horário fica garantido quando o sinal cai.",
    itens: [
      { t: "Sinal por Pix ao marcar, com baixa automática", ref: ["PG.1"], c: [S()] },
      { t: "Devolução do sinal quando o cancelamento está dentro da regra", ref: ["PG.1"], c: [S("automática")] },
    ],
  },
  {
    id: "painel",
    rotulo: "Módulo 5",
    titulo: "Painel do gestor",
    resumo: "Ocupação, faltas e faturamento de cada unidade.",
    itens: [
      { t: "Ocupação e faltas por unidade e por profissional", ref: ["PN.1"], c: [S()] },
      { t: "Faturamento previsto e realizado", ref: ["PN.1"], c: [S()] },
      { t: "Exportação em planilha", ref: ["PN.1", "FIN.1"], c: [S()] },
    ],
  },
  {
    id: "perfis",
    rotulo: "Módulo 6",
    titulo: "Perfis e sistema financeiro",
    resumo: "Cada um vê o que precisa, e o financeiro recebe os atendimentos.",
    itens: [
      { t: "Perfis de recepção, profissional e gestor", ref: ["EQ.1"], c: [S()] },
      { t: "Atendimentos enviados ao sistema financeiro", ref: ["FIN.1"], c: [S("ligação direta, se o sistema permitir")] },
    ],
  },
  {
    id: "entrega",
    rotulo: "Entrega",
    titulo: "Implantação e treinamento",
    resumo: "Para a equipe usar desde o primeiro dia.",
    itens: [
      { t: "Treinamento da equipe das 3 unidades", ref: ["TR.1"], c: [S("1 sessão em cada unidade")] },
      { t: "Manual de uso em vídeos curtos", ref: ["TR.1"], c: [S()] },
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
/* O valor                                                             */
/* ------------------------------------------------------------------ */

export const opcoes: Opcao[] = [
  {
    id: "unica",
    nome: "Plataforma completa",
    artigo: "a",
    nivel: "Completo",
    selo: "Valor combinado",
    recomendada: true,
    preco: 42000,
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
    garantia: { dias: 60 },
    pagamento: "3 parcelas iguais",
    fases: [
      { id: "imersao", duracao: 1 },
      { id: "base", duracao: 2 },
      { id: "construcao", duracao: 6 },
      { id: "homologacao", duracao: 2 },
      { id: "implantacao", duracao: 1 },
    ],
    marcos: [
      { quando: "Assinatura", titulo: "Início", tipo: "1ª parcela", valor: 14000, itens: ["Imersão e protótipo"] },
      { quando: "Semana 6", titulo: "Agenda e WhatsApp", tipo: "2ª parcela", valor: 14000, itens: ["Agenda, autoatendimento e lembretes em teste"] },
      { quando: "Semana 12", titulo: "Lançamento", tipo: "3ª parcela", valor: 14000, itens: ["Plataforma no ar", "Equipe treinada"] },
    ],
  },
];

/** Valor direto: uma opção só. */
export const ordem = [0] as const;
export const recomendada = 0;

/** Só no modo âncora. */
export const exemploNiveis = "";

/* ------------------------------------------------------------------ */
/* Topo e estrutura                                                     */
/* ------------------------------------------------------------------ */

const rec = opcoes[recomendada];

/** Olho, título (com o trecho em *serifa*) e texto de apoio das seções de estrutura. Nunca "opção" aqui. */
export const secoes = {
  escopo: {
    olho: "Escopo",
    titulo: "Tudo o que *vocês pediram*",
    texto: "Módulo por módulo, item por item, tudo o que está incluso. Nada fica implícito.",
  },
  etapas: {
    olho: "Etapas e prazo",
    titulo: "Do primeiro dia *ao lançamento*",
    texto: "Em cada etapa, o que fazemos, o que entregamos e o que você faz.",
  },
  investimento: {
    olho: "Investimento",
    titulo: "O valor, *parcela por parcela*",
    texto: "O valor que conversamos, para tudo o que está nesta proposta, com as parcelas presas às entregas.",
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

export const respostas = [
  { olho: "Como fazemos", texto: "Uma agenda só para as 3 unidades, ligada ao WhatsApp e ao Pix da clínica.", href: "#solucao" },
  { olho: "Em quanto tempo", texto: `${rec.prazo}, com demonstração ${rec.demos} do que ficou pronto.`, href: "#etapas" },
  { olho: "Com qual investimento", texto: `${brl(rec.preco)}, em ${rec.pagamento} presas às entregas.`, href: "#opcoes" },
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
/* O que fica com vocês                                                 */
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
    { titulo: "Demonstrações", texto: "Ao vivo, toda semana, sempre gravadas, com o quadro de tarefas aberto para você." },
    { titulo: "Aceite por marco", texto: "Você valida cada marco em até 5 dias úteis. Sem manifestação nesse prazo, o marco é aceito." },
    { titulo: "Integrações", texto: "Testadas primeiro com contas de teste e depois com as contas reais da clínica." },
    { titulo: "Mudança de escopo", texto: "Tudo o que estiver fora desta proposta é estimado e só entra com a sua aprovação por escrito." },
  ],
  garantia: {
    cobre: "Defeito em relação ao escopo aprovado, por 60 dias a partir do aceite final.",
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
    q: "O valor pode mudar no meio do caminho?",
    a: "Não. É o valor que conversamos, para tudo o que está nesta proposta. Só muda se o escopo mudar, e aí com a sua aprovação por escrito antes.",
  },
  {
    q: "Como vocês entregam tudo isso em 3 meses?",
    a: "Com três especialistas no time, ciclos curtos com demonstração toda semana e peças que já usamos em produção. O tempo da equipe vai para o que é da clínica.",
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
    a: "A garantia cobre os defeitos por 60 dias. Suporte e evolução podem continuar com a gente, como serviço à parte.",
  },
];

export const chamada = {
  olho: "Aceite",
  titulo: "Vamos colocar a agenda *no ar?*",
  texto: "Está tudo aqui: o escopo, as etapas, o investimento e as condições. Se fizer sentido para vocês, o aceite leva um segundo, e a gente começa já na semana que vem.",
  /** O que acontece depois do aceite, em ordem: tira o "e agora?" na hora de decidir. */
  passos: [
    { titulo: "Você aceita", texto: "No link da proposta, segurando o botão de aceite: a mensagem, com o valor, vai pronta para o nosso WhatsApp." },
    { titulo: "Contrato no mesmo dia", texto: "Mandamos o contrato para assinar on-line; a primeira parcela vence na assinatura." },
    { titulo: "Imersão em até 5 dias úteis", texto: "Marcamos a imersão com a sua equipe e começamos pela unidade que você escolher." },
  ],
};
