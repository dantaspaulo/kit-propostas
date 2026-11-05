// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { ArrowUpRight } from "lucide-react";
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { custos } from "@/data";
import { cn, dois } from "@/lib/utils";

const TONS = ["bg-tom-1", "bg-tom-3", "bg-tinta text-papel"];

// O que fica com o cliente: o que ele providencia e os custos de terceiros, separados do preço, com a fonte
// de cada número. É onde a proposta mostra seriedade: nada escondido para depois.
export function Custos() {
  return (
    <section id="custos" className="py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={custos.olho} titulo={custos.titulo} texto={custos.texto} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {custos.porSuaConta.map((c, i) => (
            <Revelar key={c.titulo} atraso={i * 0.05} className="h-full">
              <article className="kit-cartao sem-quebra h-full p-6">
                <span className="font-mono text-[0.72rem] text-destaque-forte">{dois(i + 1)}</span>
                <h3 className="mt-4 font-extrabold tracking-[-0.02em]">{c.titulo}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-apoio">{c.texto}</p>
              </article>
            </Revelar>
          ))}
        </div>

        {custos.destaques.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {custos.destaques.map((d, i) => {
              const escuro = i % 3 === 2;
              return (
                <Revelar key={d.titulo} atraso={i * 0.08} className="h-full">
                  <article className={cn("sem-quebra flex h-full flex-col rounded-2xl p-7", TONS[i % 3])}>
                    <p className={cn("font-mono text-[0.66rem] tracking-[0.05em] uppercase", escuro ? "text-noite-apoio" : "text-apoio")}>{d.rotulo}</p>
                    <p className="tabular mt-5 font-titulo text-[clamp(2rem,3.6vw,2.8rem)] leading-none font-extrabold tracking-[-0.05em]">{d.valor}</p>
                    <p className="mt-3 font-bold">{d.titulo}</p>
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className={cn(
                        "mt-auto inline-flex items-center gap-1 pt-6 text-[0.78rem] font-semibold underline-offset-4 hover:underline",
                        escuro ? "text-destaque" : "text-destaque-forte",
                      )}
                    >
                      Fonte: {d.fonte}
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </article>
                </Revelar>
              );
            })}
          </div>
        )}

        {custos.notas.length > 0 && (
          <ul id="custos-notas" className="mt-8 grid max-w-[60rem] gap-3 text-[0.9rem] leading-relaxed text-apoio">
            {custos.notas.map((n) => (
              <li key={n} className="flex gap-3">
                <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-destaque-forte" />
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
