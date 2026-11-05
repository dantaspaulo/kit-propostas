// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { etapas, opcoes, ordem, secoes, unidadePrazo } from "@/data";
import { useOpcao } from "@/estado";
import { ehAncora, periodo, Unidade, unidade } from "@/lib/proposta";
import { cn, dois } from "@/lib/utils";

// Régua do gráfico: de 1 em 1 até 8 semanas, de 4 em 4 acima disso; em dias, de 5 em 5 (de 10 em 10 acima de 60).
function marcas(maximo: number) {
  const passo = unidadePrazo === "dias" ? (maximo > 60 ? 10 : 5) : maximo > 8 ? 4 : 1;
  const xs: number[] = [];
  for (let v = passo; v <= maximo; v += passo) xs.push(v);
  if (xs.at(-1) !== maximo) xs.push(maximo);
  return xs;
}

// Tons das fases: do destaque forte ao tom claro, na ordem das etapas, com o texto que dá contraste.
const fracao = (k: number) => (etapas.length > 1 ? k / (etapas.length - 1) : 0);
const tom = (k: number) => `color-mix(in oklab, var(--color-destaque-forte) ${100 - Math.round(fracao(k) * 70)}%, var(--color-tom-3))`;
const tinta = (k: number) => (fracao(k) > 0.5 ? "var(--color-tinta)" : "var(--color-papel)");

function Grafico() {
  const { ativa, setAtiva } = useOpcao();
  const linhas = ehAncora ? ordem : [0];
  const maximo = Math.max(...opcoes.map((o) => o.duracao));
  return (
    <div className="kit-cartao sem-quebra p-5 sm:p-7">
      <div className="grid gap-4">
        {linhas.map((i) => {
          const o = opcoes[i];
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setAtiva(i)}
              className={cn(
                "grid items-center gap-3 rounded-xl p-2 text-left transition-colors sm:grid-cols-[180px_1fr]",
                ehAncora && ativa === i ? "bg-tom-2" : "hover:bg-tom-2/50",
              )}
            >
              <span>
                <span className="block font-extrabold tracking-[-0.02em]">{ehAncora ? o.nome : "Prazo"}</span>
                <span className="tabular text-[0.8rem] text-apoio">
                  {o.prazo} · {o.duracao} {unidade(o.duracao)}
                </span>
              </span>
              <span className="flex h-9 overflow-hidden rounded-lg bg-tom-2" style={{ width: `${(o.duracao / maximo) * 100}%` }}>
                {o.fases.map((f) => {
                  const k = etapas.findIndex((e) => e.id === f.id);
                  return (
                    <span
                      key={f.id}
                      title={`${etapas[k]?.nome}: ${f.duracao} ${unidade(f.duracao)}`}
                      className="flex min-w-0 items-center justify-center border-r border-papel/60 font-mono text-[0.6rem] last:border-r-0"
                      style={{ width: `${(f.duracao / o.duracao) * 100}%`, background: tom(k), color: tinta(k) }}
                    >
                      <span className="truncate px-1">{f.duracao >= 2 ? etapas[k]?.curto : ""}</span>
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid sm:grid-cols-[180px_1fr]">
        <span className="hidden sm:block" />
        <div className="relative h-5 border-t border-linha">
          {marcas(maximo).map((v) => (
            <span
              key={v}
              className="tabular absolute top-1 -translate-x-1/2 font-mono text-[0.6rem] text-apoio"
              style={{ left: `${(v / maximo) * 100}%` }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-right font-mono text-[0.62rem] tracking-[0.05em] text-apoio uppercase">{Unidade(2)}</p>
    </div>
  );
}

export function Etapas() {
  const { ativa } = useOpcao();
  const o = opcoes[ehAncora ? ativa : 0];
  return (
    <section id="etapas" className="py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={secoes.etapas.olho} titulo={secoes.etapas.titulo} texto={secoes.etapas.texto} />
        <div className="mt-12">
          <Grafico />
        </div>
        {ehAncora && (
          <p className="mt-6 font-mono text-[0.7rem] tracking-[0.04em] text-apoio uppercase">
            Prazo de cada etapa · {o.nome}
          </p>
        )}
        <div className={cn("mt-4 grid gap-4 sm:grid-cols-2", etapas.length >= 5 ? "xl:grid-cols-5" : "lg:grid-cols-4")}>
          {etapas.map((e, k) => (
            <Revelar key={e.id} atraso={k * 0.06} className="h-full">
              <article className="kit-cartao sem-quebra flex h-full flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.72rem] text-destaque-forte">{dois(k + 1)}</span>
                  <span className="tabular rounded-full bg-tom-2 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.03em] text-apoio uppercase">
                    {periodo(o, e.id) || "a combinar"}
                  </span>
                </div>
                <h3 className="mt-5 text-[1.08rem] leading-tight font-extrabold tracking-[-0.03em]">{e.nome}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-apoio">{e.texto}</p>
                <ul className="mt-4 grid gap-1.5 text-[0.86rem] font-semibold">
                  {e.entregas.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-destaque-forte" />
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <p className="border-t border-linha pt-4 text-[0.84rem] leading-snug text-apoio">
                    <strong className="text-tinta">Você:</strong> {e.voce}
                  </p>
                </div>
              </article>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
