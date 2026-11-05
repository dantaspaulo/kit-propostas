// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Check } from "lucide-react";
import { Mapa } from "@/components/kit/mapa";
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { solucao } from "@/data";
import { dois } from "@/lib/utils";

// Como fazemos: os pilares da solução à esquerda, o mapa à direita (o núcleo e as partes que ele liga) e,
// embaixo, o jeito de trabalhar, que é o que dá segurança a quem vai pagar.
export function Solucao() {
  return (
    <section id="solucao" className="py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={solucao.olho} titulo={solucao.titulo} texto={solucao.texto} />

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <div className="grid content-start gap-4">
            {solucao.pilares.map((p, i) => (
              <Revelar key={p.titulo} atraso={i * 0.08}>
                <article className="kit-cartao flex gap-5 p-6 sm:p-7">
                  <span className="font-mono text-[0.72rem] text-destaque-forte">{dois(i + 1)}</span>
                  <div>
                    <h3 className="text-[1.15rem] font-extrabold tracking-[-0.03em]">{p.titulo}</h3>
                    <p className="mt-2 leading-relaxed text-apoio">{p.texto}</p>
                  </div>
                </article>
              </Revelar>
            ))}
          </div>

          <Revelar atraso={0.1} className="h-full">
            <figure className="kit-ui sem-quebra flex h-full flex-col">
              <figcaption className="kit-ui-barra">
                <span className="kit-ponto-vivo" />
                Mapa da solução
                <span className="fim">{solucao.nucleo}</span>
              </figcaption>
              <div className="kit-grade grid flex-1 place-items-center overflow-hidden px-6 py-10 sm:px-12">
                <Mapa nucleo={solucao.nucleo} nos={solucao.nos} className="max-w-[400px]" />
              </div>
            </figure>
          </Revelar>
        </div>

        {solucao.jeito.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {solucao.jeito.map((j, i) => (
              <Revelar key={j.titulo} atraso={i * 0.08}>
                <div className="sem-quebra h-full rounded-2xl border border-linha bg-tom-2/60 p-6">
                  <p className="kit-olho mb-4">{j.titulo}</p>
                  <ul className="grid gap-2.5">
                    {j.itens.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 font-semibold">
                        <Check className="mt-0.5 size-4 shrink-0 text-destaque-forte" />
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
