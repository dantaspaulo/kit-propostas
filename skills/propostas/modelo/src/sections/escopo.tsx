// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Check, CircleDashed, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { exemploNiveis, modulos, opcoes, ordem, secoes } from "@/data";
import { useOpcao } from "@/estado";
import { ehAncora, nivelDoModulo, varianteNivel } from "@/lib/proposta";
import type { Celula as TipoCelula, Modulo } from "@/lib/tipos";
import { brl, cn } from "@/lib/utils";

function Celula({ c }: { c: TipoCelula }) {
  if (c.s === "sim")
    return (
      <span className="flex items-start gap-2">
        <Check className="mt-0.5 size-4 shrink-0 text-destaque-forte" aria-label="Incluso" />
        {c.n && <span className="text-[0.8rem] leading-snug text-apoio">{c.n}</span>}
      </span>
    );
  if (c.s === "parcial")
    return (
      <span className="flex items-start gap-2">
        <CircleDashed className="mt-0.5 size-4 shrink-0 text-apoio" aria-label="Versão reduzida" />
        <span className="text-[0.8rem] leading-snug font-semibold text-tinta">{c.n}</span>
      </span>
    );
  return (
    <span className="flex items-center gap-2 text-apoio/60">
      <Minus className="size-4" aria-label="Fora desta opção" />
    </span>
  );
}

function PrecoModulo({ m, i }: { m: Modulo; i: number }) {
  if (!m.precos) return null;
  const nivel = nivelDoModulo(m, i);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variante={varianteNivel(i, nivel)}>{nivel}</Badge>
      {nivel !== "Fora" && (
        <span className="tabular text-[0.82rem] font-extrabold">{m.semCustoProprio ? "na base" : brl(m.precos[i])}</span>
      )}
    </div>
  );
}

function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] text-apoio">
      <span className="flex items-center gap-2">
        <Check className="size-4 text-destaque-forte" /> Incluso
      </span>
      <span className="flex items-center gap-2">
        <CircleDashed className="size-4" /> Versão reduzida (diz o que entra)
      </span>
      <span className="flex items-center gap-2">
        <Minus className="size-4" /> Fora desta opção
      </span>
    </div>
  );
}

// Matriz do computador (e do PDF): uma coluna por opção, a opção em foco destacada.
function Matriz() {
  const { ativa, setAtiva } = useOpcao();
  const colunas = `minmax(0,1.55fr) repeat(${opcoes.length}, minmax(0,1fr))`;
  return (
    <div className="kit-cartao overflow-clip">
      <div className="sticky top-[68px] z-10 grid border-b border-linha bg-papel" style={{ gridTemplateColumns: colunas }}>
        <div className="p-5 font-mono text-[0.68rem] tracking-[0.05em] text-apoio uppercase">Item do pedido</div>
        {ordem.map((i) => (
          <button
            key={opcoes[i].id}
            type="button"
            onClick={() => setAtiva(i)}
            className={cn(
              "border-l border-linha p-5 text-left transition-colors",
              ativa === i ? "bg-tinta text-papel" : "hover:bg-tom-2/60",
            )}
          >
            <span className="flex items-center gap-2 font-extrabold tracking-[-0.02em]">
              {opcoes[i].nome}
              {opcoes[i].recomendada && <span className="size-2 rounded-full bg-destaque" aria-label="Recomendada" />}
            </span>
            <span className={cn("tabular mt-1 block text-[0.78rem]", ativa === i ? "text-noite-apoio" : "text-apoio")}>
              {brl(opcoes[i].preco)} · {opcoes[i].prazo}
            </span>
          </button>
        ))}
      </div>
      {modulos.map((m) => (
        <div key={m.id} className="sem-quebra border-b border-linha last:border-b-0">
          <div className="grid bg-tom-2/50" style={{ gridTemplateColumns: colunas }}>
            <div className="p-5">
              <p className="font-mono text-[0.66rem] tracking-[0.05em] text-destaque-forte uppercase">{m.rotulo}</p>
              <h3 className="mt-1 text-[1.05rem] font-extrabold tracking-[-0.03em]">{m.titulo}</h3>
              <p className="mt-1 text-[0.85rem] text-apoio">{m.resumo}</p>
            </div>
            {ordem.map((i) => (
              <div key={i} className={cn("flex items-center border-l border-linha p-5", ativa === i && "bg-tom-3/60")}>
                <PrecoModulo m={m} i={i} />
              </div>
            ))}
          </div>
          {m.itens.map((it) => (
            <div key={it.t} className="grid border-t border-linha/70" style={{ gridTemplateColumns: colunas }}>
              <div className="p-5 text-[0.92rem] leading-snug">{it.t}</div>
              {ordem.map((i) => (
                <div key={i} className={cn("border-l border-linha p-5", ativa === i && "bg-tom-3/35")}>
                  <Celula c={it.c[i]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="grid border-t-2 border-tinta bg-papel" style={{ gridTemplateColumns: colunas }}>
        <div className="p-5 font-extrabold">Total da opção</div>
        {ordem.map((i) => (
          <div key={i} className={cn("tabular border-l border-linha p-5 text-[1.05rem] font-extrabold", ativa === i && "bg-tom-3/60")}>
            {brl(opcoes[i].preco)}
          </div>
        ))}
      </div>
    </div>
  );
}

// No celular: uma opção por vez, escolhida nas abas, sem rolagem lateral.
function PorOpcao() {
  const { ativa, setAtiva } = useOpcao();
  return (
    <Tabs value={String(ativa)} onValueChange={(v) => setAtiva(Number(v))}>
      <TabsList>
        {ordem.map((i) => (
          <TabsTrigger key={i} value={String(i)}>
            {opcoes[i].nome}
          </TabsTrigger>
        ))}
      </TabsList>
      {ordem.map((i) => (
        <TabsContent key={i} value={String(i)} className="grid gap-4">
          <p className="tabular px-1 text-[0.85rem] text-apoio">
            {brl(opcoes[i].preco)} · {opcoes[i].prazo} · {opcoes[i].equipe}
          </p>
          {modulos.map((m) => (
            <div key={m.id} className="kit-cartao p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.64rem] tracking-[0.05em] text-destaque-forte uppercase">{m.rotulo}</p>
                  <h3 className="mt-1 font-extrabold tracking-[-0.03em]">{m.titulo}</h3>
                </div>
                <PrecoModulo m={m} i={i} />
              </div>
              <ul className="mt-4 grid gap-3 border-t border-linha pt-4">
                {m.itens.map((it) => {
                  const c = it.c[i];
                  const Icone = c.s === "sim" ? Check : c.s === "parcial" ? CircleDashed : Minus;
                  return (
                    <li key={it.t} className={cn("flex gap-2.5", c.s === "nao" && "opacity-55")}>
                      <Icone className={cn("mt-0.5 size-4 shrink-0", c.s === "sim" ? "text-destaque-forte" : "text-apoio")} />
                      <span className="text-[0.9rem] leading-snug">
                        {it.t}
                        {c.n && <span className={cn("block text-[0.8rem]", c.s === "parcial" ? "font-semibold text-tinta" : "text-apoio")}>{c.n}</span>}
                        {c.s === "nao" && <span className="block text-[0.8rem] text-apoio">fora desta opção</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Valor direto: os módulos em cartões, item por item, sem preço por módulo.
function Lista() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modulos.map((m, k) => (
        <Revelar key={m.id} atraso={(k % 2) * 0.06}>
          <article className="kit-cartao sem-quebra h-full p-6 sm:p-7">
            <p className="font-mono text-[0.66rem] tracking-[0.05em] text-destaque-forte uppercase">{m.rotulo}</p>
            <h3 className="mt-1 text-[1.15rem] font-extrabold tracking-[-0.03em]">{m.titulo}</h3>
            <p className="mt-1 text-[0.88rem] text-apoio">{m.resumo}</p>
            <ul className="mt-5 grid gap-3 border-t border-linha pt-5">
              {m.itens.map((it) => (
                <li key={it.t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-destaque-forte" />
                  <span className="text-[0.92rem] leading-snug">
                    {it.t}
                    {it.c[0].n && <span className="block text-[0.8rem] text-apoio">{it.c[0].n}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </Revelar>
      ))}
    </div>
  );
}

export function Escopo() {
  return (
    <section id="escopo" className="border-y border-linha bg-tom-2/40 py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={secoes.escopo.olho} titulo={secoes.escopo.titulo} texto={secoes.escopo.texto} />
        <div className="mt-12">
          {ehAncora ? (
            <>
              <div className="mb-5">
                <Legenda />
              </div>
              <div className="hidden md:block">
                <Matriz />
              </div>
              <div className="so-tela md:hidden">
                <PorOpcao />
              </div>
              {exemploNiveis && (
                <p className="sem-quebra mt-6 max-w-[52rem] rounded-2xl border border-linha bg-papel p-5 text-[0.92rem] leading-relaxed text-apoio">
                  <strong className="text-tinta">Por que o mesmo módulo custa diferente? Porque não é o mesmo módulo.</strong> {exemploNiveis}{" "}
                  Os valores por módulo compõem cada opção e não são vendidos separados.
                </p>
              )}
            </>
          ) : (
            <Lista />
          )}
        </div>
      </div>
    </section>
  );
}
