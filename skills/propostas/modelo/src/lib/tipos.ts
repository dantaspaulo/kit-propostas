// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Tipos do conteúdo da proposta (src/data.ts). As seções leem só daqui.

/** Estado de um item numa opção: incluso, numa versão reduzida (com a nota do que entra) ou fora. */
export type Status = "sim" | "parcial" | "nao";
export type Celula = { s: Status; n?: string };
export const S = (n?: string): Celula => ({ s: "sim", n });
export const P = (n: string): Celula => ({ s: "parcial", n });
export const N: Celula = { s: "nao" };

/** Uma linha da matriz de escopo. `ref` aponta para os itens do pedido que ela atende; `c` tem uma célula por opção. */
export type Linha = { t: string; ref: string[]; c: Celula[] };

export type Modulo = {
  id: string;
  rotulo: string;
  titulo: string;
  resumo: string;
  /** Preço do módulo em cada opção (modo âncora). No modo direto, sem preços. */
  precos?: number[];
  /** Itens já pagos por outro módulo (o módulo aparece como "incluso na base"). */
  semCustoProprio?: boolean;
  itens: Linha[];
};

export type Etapa = {
  id: string;
  nome: string;
  curto: string;
  texto: string;
  entregas: string[];
  /** O que o cliente faz nesta etapa. */
  voce: string;
};

export type Marco = {
  quando: string;
  titulo: string;
  tipo: string;
  /** Valor da parcela. 0 = marco de entrega sem parcela (aparece como "já quitado"). */
  valor: number;
  itens: string[];
};

export type Opcao = {
  id: string;
  nome: string;
  /** Artigo do nome no texto ("seguir com o Completo", "seguir com a Completa"). Padrão: "o". */
  artigo?: "o" | "a";
  /** Nível dos módulos nesta opção (aparece como selo em cada célula da matriz). */
  nivel: string;
  selo: string;
  recomendada?: boolean;
  preco: number;
  /** Prazo por extenso, como aparece no texto ("3 meses"). */
  prazo: string;
  /** Prazo na unidade de `unidadePrazo` (semanas ou dias). As fases somam isto. */
  duracao: number;
  equipe: string;
  /** Ritmo de trabalho, quando a equipe é a mesma em todas as opções. */
  ritmo?: string;
  frase: string;
  para: string;
  inclui: string[];
  /** O que fica de fora nesta opção (só itens do pedido). */
  depois: string[];
  demos: string;
  garantia: { dias: number };
  pagamento: string;
  fases: { id: string; duracao: number }[];
  marcos: Marco[];
};

export type Destaque = { titulo: string; rotulo: string; valor: string; fonte: string; href: string };
