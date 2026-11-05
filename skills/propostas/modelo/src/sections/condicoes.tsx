// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Check, Minus, ShieldCheck } from "lucide-react";
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { condicoes, opcoes, ordem, proposta, secoes } from "@/data";
import { ehAncora } from "@/lib/proposta";
import { dois, lista } from "@/lib/utils";

function Lista({ titulo, itens, icone }: { titulo: string; itens: string[]; icone: "sim" | "nao" }) {
  return (
    <div className="kit-cartao sem-quebra h-full p-6 sm:p-7">
      <p className="kit-olho">{titulo}</p>
      <ul className="grid gap-3">
        {itens.map((x) => (
          <li key={x} className="flex items-start gap-2.5 text-[0.92rem] leading-snug">
            {icone === "sim" ? (
              <Check className="mt-0.5 size-4 shrink-0 text-destaque-forte" />
            ) : (
              <Minus className="mt-0.5 size-4 shrink-0 text-apoio" />
            )}
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

// O combinado por escrito: como cada entrega é aceita, a garantia, o que não está na proposta, de quem é o
// quê e as condições gerais. A validade fecha a seção, num bloco que o PDF não corta.
export function Condicoes() {
  const dias = ehAncora
    ? lista(ordem.map((i) => `${opcoes[i].garantia.dias} dias ${opcoes[i].artigo === "a" ? "na" : "no"} ${opcoes[i].nome}`))
    : `${opcoes[0].garantia.dias} dias`;
  return (
    <section id="condicoes" className="border-y border-linha bg-tom-2/40 py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={secoes.condicoes.olho} titulo={secoes.condicoes.titulo} texto={secoes.condicoes.texto} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {condicoes.aceite.map((a, i) => (
            <Revelar key={a.titulo} atraso={i * 0.05} className="h-full">
              <article className="kit-cartao sem-quebra h-full p-6">
                <span className="font-mono text-[0.72rem] text-destaque-forte">{dois(i + 1)}</span>
                <h3 className="mt-4 font-extrabold tracking-[-0.02em]">{a.titulo}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-apoio">{a.texto}</p>
              </article>
            </Revelar>
          ))}
        </div>

        <Revelar className="mt-6">
          <div className="kit-ui sem-quebra grid gap-0 md:grid-cols-[auto_1fr_1fr]">
            <div className="flex items-center gap-3 border-b border-noite-linha p-7 md:border-r md:border-b-0">
              <ShieldCheck className="size-7 text-destaque" />
              <div>
                <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Garantia</p>
                <p className="mt-1 max-w-[14rem] font-extrabold tracking-[-0.02em]">{dias}</p>
              </div>
            </div>
            <div className="border-b border-noite-linha p-7 md:border-r md:border-b-0">
              <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Cobre</p>
              <p className="mt-2 leading-relaxed">{condicoes.garantia.cobre}</p>
              <p className="mt-3 text-[0.88rem] text-destaque">{condicoes.garantia.sla}</p>
            </div>
            <div className="p-7">
              <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Não cobre</p>
              <p className="mt-2 leading-relaxed text-noite-apoio">{condicoes.garantia.naoCobre.charAt(0).toUpperCase() + condicoes.garantia.naoCobre.slice(1)}</p>
            </div>
          </div>
        </Revelar>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Lista titulo="Fora desta proposta" itens={condicoes.exclusoes} icone="nao" />
          <Lista titulo="De quem é o quê" itens={condicoes.propriedade} icone="sim" />
          <Lista titulo="Condições gerais" itens={condicoes.gerais} icone="sim" />
        </div>

        <div className="sem-quebra mt-6 flex flex-wrap items-end justify-between gap-6 rounded-2xl border-2 border-tinta bg-papel p-7 sm:p-9">
          <div>
            <p className="kit-olho">Validade</p>
            <p className="font-titulo text-[clamp(1.8rem,3.6vw,2.6rem)] leading-none font-extrabold tracking-[-0.045em]">
              Válida até <span className="kit-serifa">{proposta.validade}</span>
            </p>
          </div>
          <p className="max-w-[26rem] text-[0.92rem] text-apoio">
            {proposta.validadeDias} dias corridos a partir de {proposta.data}. Depois disso, valores e prazos podem ser revistos.
          </p>
        </div>
      </div>
    </section>
  );
}
