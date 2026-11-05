// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { CartaoFluxo } from "@/components/kit/cartao-fluxo";
import { Revelar } from "@/components/kit/revelar";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { proposta, respostas, topo } from "@/data";
import { faltam, pdf } from "@/lib/proposta";

// O topo em duas colunas: à esquerda, o título, o resumo e quem, quando e até quando; à direita, o cartão com
// o caminho da solução. Embaixo, as três perguntas do cliente (como, em quanto tempo e por quanto), cada uma
// levando à seção que aprofunda, e os dois próximos passos: ver o investimento ou baixar o PDF.
export function Hero() {
  const c = proposta.cliente;
  const meta: { rotulo: string; valor: string; sub?: string; alerta?: string }[] = [
    { rotulo: "Para", valor: c.contato || c.empresa, sub: c.contato ? [c.cargo, c.empresa].filter(Boolean).join(" · ") : "" },
    { rotulo: "Emitida em", valor: proposta.data },
    { rotulo: "Válida até", valor: proposta.validade, alerta: faltam() },
    { rotulo: "Referência", valor: proposta.referencia },
  ];
  return (
    <section id="topo" className="hero-altura relative isolate overflow-hidden border-b border-linha">
      <div className="kit-grade absolute inset-0 -z-20 [mask-image:linear-gradient(180deg,black,transparent_85%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[12%] top-[46%] -z-10 h-[520px] w-[140%] rounded-[50%] border border-tinta/[0.07]"
        style={{ transform: "rotate(-9deg)" }}
      />
      <div className="kit-wrap pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)] lg:gap-16">
          <div className="min-w-0">
            <Revelar>
              <p className="kit-olho">{topo.olho}</p>
            </Revelar>
            <TextoRevelado
              como="h1"
              texto={topo.titulo}
              className="kit-titulo mt-5 max-w-[14ch] text-[clamp(2.7rem,5.6vw,5.4rem)] leading-[0.93]"
            />
            <Revelar atraso={0.25}>
              <p className="kit-lead mt-7 max-w-[40rem] text-[clamp(1.02rem,1.3vw,1.18rem)]">{topo.resumo}</p>
            </Revelar>
            <Revelar atraso={0.35}>
              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-linha pt-6 sm:grid-cols-4">
                {meta.map((m) => (
                  <div key={m.rotulo} className="min-w-0">
                    <dt className="font-mono text-[0.62rem] tracking-[0.06em] text-apoio uppercase">{m.rotulo}</dt>
                    <dd className="mt-1.5 text-[0.86rem] leading-snug font-bold tracking-[-0.01em] break-words text-tinta">{m.valor}</dd>
                    {m.sub && <dd className="mt-0.5 text-[0.78rem] leading-snug text-apoio">{m.sub}</dd>}
                    {m.alerta && <dd className="nao-imprimir mt-0.5 font-mono text-[0.62rem] text-destaque-forte uppercase">{m.alerta}</dd>}
                  </div>
                ))}
              </dl>
            </Revelar>
          </div>
          <CartaoFluxo className="justify-self-center lg:justify-self-end" />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {respostas.map((r, i) => (
            <Revelar key={r.olho} atraso={0.4 + i * 0.08}>
              <a
                href={r.href}
                className="group sem-quebra flex h-full flex-col justify-between gap-6 rounded-2xl border border-linha bg-papel/90 p-6 shadow-[var(--sombra)] backdrop-blur transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  <p className="kit-olho mb-4">{r.olho}</p>
                  <p className="text-[1.05rem] leading-snug font-bold tracking-[-0.02em] text-tinta">{r.texto}</p>
                </div>
                <span className="nao-imprimir inline-flex items-center gap-1.5 text-[0.78rem] font-extrabold text-destaque-forte">
                  Ver os detalhes
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </Revelar>
          ))}
        </div>

        <Revelar atraso={0.6} className="nao-imprimir mt-10 flex flex-wrap gap-3">
          <a href="#opcoes" className="kit-btn kit-btn-escuro">
            Ver o investimento
            <ArrowDownRight className="size-4" />
          </a>
          <a href={pdf} download className="kit-btn border border-linha bg-papel text-tinta">
            <Download className="size-4" />
            Baixar em PDF
          </a>
        </Revelar>
      </div>
    </section>
  );
}
