// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { GradeViva } from "@/components/kit/grade-viva";
import { Revelar } from "@/components/kit/revelar";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { proposta, respostas, topo } from "@/data";
import { para, pdf } from "@/lib/proposta";

// O topo responde logo as três perguntas do cliente: como, em quanto tempo e por quanto. Cada resposta
// leva à seção que aprofunda. Atrás, a grade viva na cor da marca.
export function Hero() {
  return (
    <section id="topo" className="hero-altura relative isolate overflow-hidden border-b border-linha">
      <div className="kit-grade absolute inset-0 -z-20 [mask-image:linear-gradient(180deg,black,transparent_85%)]" />
      <GradeViva className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(70%_80%_at_85%_20%,black,transparent_75%)]" />
      <div className="kit-wrap pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-24">
        <Revelar>
          <p className="kit-olho">
            {topo.olho} · {proposta.referencia}
          </p>
        </Revelar>
        <TextoRevelado
          como="h1"
          texto={topo.titulo}
          className="kit-titulo max-w-[14ch] text-[clamp(2.9rem,7.4vw,6.6rem)] leading-[0.92]"
        />
        <Revelar atraso={0.25}>
          <p className="kit-lead mt-7 max-w-[44rem] text-[clamp(1.05rem,1.4vw,1.25rem)]">{topo.resumo}</p>
        </Revelar>
        <Revelar atraso={0.35}>
          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.72rem] tracking-[0.03em] text-apoio uppercase">
            <div className="flex gap-2">
              <dt>Para</dt>
              <dd className="font-medium text-tinta normal-case">{para()}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Emitida em</dt>
              <dd className="text-tinta">{proposta.data}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Válida até</dt>
              <dd className="text-destaque-forte">{proposta.validade}</dd>
            </div>
          </dl>
        </Revelar>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
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
