// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Check } from "lucide-react";
import { Mapa } from "@/components/kit/mapa";
import { Revelar } from "@/components/kit/revelar";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { solucao } from "@/data";
import { dois } from "@/lib/utils";

// Como fazemos, numa vitrine escura: o texto à esquerda e, à direita, o mapa com a esfera viva no centro (o
// núcleo) e as partes que ele liga. Embaixo, os pilares e o jeito de trabalhar, que dá segurança a quem paga.
export function Solucao() {
  return (
    <section id="solucao" className="fundo-noite-brilho relative isolate overflow-hidden">
      <div className="kit-wrap fundo-noite bg-transparent py-20 sm:py-24 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <Revelar>
              <p className="kit-olho claro">{solucao.olho}</p>
            </Revelar>
            <TextoRevelado texto={solucao.titulo} className="kit-titulo mt-5 max-w-[14ch] text-papel" />
            <Revelar atraso={0.2}>
              <p className="kit-lead mt-6 max-w-[36rem] text-noite-apoio">{solucao.texto}</p>
            </Revelar>
            <Revelar atraso={0.3}>
              <p className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-noite-linha bg-papel/5 px-4 py-2 font-mono text-[0.68rem] tracking-[0.04em] text-papel uppercase">
                <span className="kit-ponto-vivo" />
                {solucao.nucleo} no centro · {solucao.nos.length} partes ligadas
              </p>
            </Revelar>
          </div>
          <Revelar atraso={0.15}>
            <Mapa nucleo={solucao.nucleo} nos={solucao.nos} />
          </Revelar>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {solucao.pilares.map((p, i) => (
            <Revelar key={p.titulo} atraso={i * 0.08}>
              <article className="sem-quebra h-full rounded-2xl border border-noite-linha bg-papel/[0.04] p-6 sm:p-7">
                <span className="font-mono text-[0.72rem] text-destaque">{dois(i + 1)}</span>
                <h3 className="mt-3 text-[1.15rem] font-extrabold tracking-[-0.03em] text-papel">{p.titulo}</h3>
                <p className="mt-2 leading-relaxed text-noite-apoio">{p.texto}</p>
              </article>
            </Revelar>
          ))}
        </div>

        {solucao.jeito.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {solucao.jeito.map((j, i) => (
              <Revelar key={j.titulo} atraso={i * 0.08}>
                <div className="sem-quebra h-full rounded-2xl border border-noite-linha p-6">
                  <p className="kit-olho claro mb-4">{j.titulo}</p>
                  <ul className="grid gap-2.5">
                    {j.itens.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 font-semibold text-papel">
                        <Check className="mt-0.5 size-4 shrink-0 text-destaque" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Revelar>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
