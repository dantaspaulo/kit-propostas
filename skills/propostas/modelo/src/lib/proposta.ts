// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// Contas e textos que as seções de estrutura usam. Nada de texto de projeto aqui: ele mora no data.ts.
import { arquivoPdf, modo, opcoes, proposta, publicacao, recomendada, unidadePrazo, wa } from "@/data";
import type { Modulo, Opcao } from "@/lib/tipos";
import { brl } from "@/lib/utils";
import type { VarianteSelo } from "@/components/ui/badge";

export const ehAncora = modo === "ancora" && opcoes.length > 1;

export const unidade = (n: number) =>
  unidadePrazo === "dias" ? (n === 1 ? "dia" : "dias") : n === 1 ? "semana" : "semanas";
export const Unidade = (n: number) => unidade(n).charAt(0).toUpperCase() + unidade(n).slice(1);

/** Prazo da opção em dias corridos, para comparar opções ("entrega 30 dias depois"). */
export const emDias = (o: Opcao) => (unidadePrazo === "dias" ? o.duracao : o.duracao * 7);

/** "Semanas 3 a 5" para uma fase da opção, contando as fases anteriores. */
export function periodo(o: Opcao, faseId: string) {
  let inicio = 1;
  for (const f of o.fases) {
    if (f.id === faseId) {
      const fim = inicio + f.duracao - 1;
      return fim === inicio ? `${Unidade(1)} ${inicio}` : `${Unidade(2)} ${inicio} a ${fim}`;
    }
    inicio += f.duracao;
  }
  return "";
}

/** Para quem é a proposta, sem vírgula solta quando falta cargo ou empresa. */
export function para() {
  const c = proposta.cliente;
  const pessoa = [c.contato, c.cargo].filter(Boolean).join(", ");
  return [pessoa, c.empresa].filter(Boolean).join(" · ") || c.empresa || c.contato;
}

export const quem = () => proposta.cliente.empresa || proposta.cliente.contato;

export const mensagem = (texto: string) => wa(`Olá! Li a proposta ${proposta.referencia} (${publicacao.titulo}). ${texto}`);

/** A mensagem de aceite, com a opção, o valor e a forma de pagamento: o cliente só envia. */
export const mensagemAceite = (o: Opcao) =>
  mensagem(`Quero aceitar a proposta${ehAncora ? ` na opção ${o.nome}` : ""}: ${brl(o.preco)}, ${o.pagamento}. Qual é o próximo passo?`);

/** Quanto falta para a proposta vencer, contado no dia de quem lê ("faltam 12 dias", "vence hoje"). */
export function faltam() {
  const hoje = new Date(`${new Date().toLocaleDateString("sv-SE")}T00:00:00`);
  const dias = Math.round((new Date(`${proposta.validadeISO}T00:00:00`).getTime() - hoje.getTime()) / 86400000);
  if (dias > 1) return `faltam ${dias} dias`;
  if (dias === 1) return "vence amanhã";
  if (dias === 0) return "vence hoje";
  return "prazo vencido: fale com a gente";
}
export const pdf = `./${arquivoPdf}`;

/** Comparação de uma opção com a recomendada, no painel de investimento. */
export function comparada(o: Opcao) {
  const r = opcoes[recomendada];
  const dif = emDias(o) - emDias(r);
  const quando = dif > 0 ? `${dif} dias depois` : dif < 0 ? `${-dif} dias antes` : "no mesmo prazo";
  return `Entrega ${quando} da recomendada (${r.nome}), com garantia de ${o.garantia.dias} dias em vez de ${r.garantia.dias}.`;
}

/** Nível de um módulo numa opção, como aparece no selo da matriz. */
export function nivelDoModulo(m: Modulo, i: number) {
  const temAlgo = m.itens.some((it) => it.c[i].s !== "nao");
  if (!temAlgo) return "Fora";
  if (m.semCustoProprio) return "Na base";
  return opcoes[i].nivel;
}

/** Cor do selo de nível: a recomendada no tom escuro, a âncora acima no destaque, as menores nos tons claros. */
export function varianteNivel(i: number, nivel: string): VarianteSelo {
  if (nivel === "Fora") return "borda";
  if (i === recomendada) return "escuro";
  if (opcoes[i].preco > opcoes[recomendada].preco) return "destaque";
  const maisBarata = opcoes.reduce((m, o, k) => (o.preco < opcoes[m].preco ? k : m), 0);
  return i === maisBarata ? "neutro" : "suave";
}
