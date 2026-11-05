// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { ArrowDown, Check, Minus, MessageCircle } from "lucide-react";
import StarBorder from "@/components/reactbits/StarBorder";
import { Badge } from "@/components/ui/badge";
import { Numero } from "@/components/kit/numero";
import { Revelar } from "@/components/kit/revelar";
import { Titulo } from "@/components/kit/titulo";
import { opcoes, ordem, secoes } from "@/data";
import { useOpcao } from "@/estado";
import { marca } from "@/lib/marca";
import { comparada, ehAncora, mensagem } from "@/lib/proposta";
import type { Opcao } from "@/lib/tipos";
import { brl, cn, modoPdf } from "@/lib/utils";

function Parcelas({ o, escuro }: { o: Opcao; escuro: boolean }) {
  return (
    <ol className="grid gap-0">
      {o.marcos.map((m, k) => (
        <li key={k} className={cn("sem-quebra grid grid-cols-[auto_1fr_auto] gap-x-4 border-t py-3.5", escuro ? "border-noite-linha" : "border-linha")}>
          <span className={cn("mt-1.5 size-2.5 rounded-full", m.valor ? "bg-destaque" : escuro ? "bg-noite-linha" : "bg-linha")} />
          <span>
            <span className="block text-[0.92rem] font-bold">
              {m.quando} · {m.titulo}
            </span>
            <span className={cn("block text-[0.8rem]", escuro ? "text-noite-apoio" : "text-apoio")}>{m.itens.join(" · ")}</span>
          </span>
          <span className="tabular text-right text-[0.92rem] font-extrabold">
            {m.valor ? brl(m.valor) : "Entrega"}
            <span className={cn("block text-[0.7rem] font-medium", escuro ? "text-noite-apoio" : "text-apoio")}>
              {m.valor ? m.tipo : "já quitado"}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Painel({ o, escuro, compacto = false }: { o: Opcao; escuro: boolean; compacto?: boolean }) {
  const apoio = escuro ? "text-noite-apoio" : "text-apoio";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[1.6rem] font-extrabold tracking-[-0.04em]">{o.nome}</h3>
        <Badge variante={o.recomendada ? "destaque" : escuro ? "noite" : "borda"}>{o.selo}</Badge>
      </div>
      <p className={cn("mt-2 leading-relaxed", apoio)}>{o.para}</p>
      <p className="mt-6 font-titulo text-[clamp(2.6rem,5vw,3.6rem)] leading-none font-extrabold tracking-[-0.05em]">
        <Numero valor={o.preco} formato={brl} />
      </p>
      <p className={cn("mt-2 text-[0.9rem]", apoio)}>Pagamento em {o.pagamento}.</p>

      <dl className={cn("mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border", escuro ? "border-noite-linha bg-noite-linha" : "border-linha bg-linha")}>
        {[
          ["Prazo", o.prazo],
          ["Equipe", o.ritmo ? `${o.equipe}, ${o.ritmo}` : o.equipe],
          ["Demonstração", o.demos],
          ["Garantia", `${o.garantia.dias} dias`],
        ].map(([k, v]) => (
          <div key={k} className={cn("p-4", escuro ? "bg-tinta-2" : "bg-papel")}>
            <dt className={cn("font-mono text-[0.62rem] tracking-[0.05em] uppercase", apoio)}>{k}</dt>
            <dd className="mt-1 text-[0.92rem] font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      {!o.recomendada && ehAncora && <p className={cn("mt-5 text-[0.9rem] font-semibold", escuro ? "text-destaque" : "text-destaque-forte")}>{comparada(o)}</p>}

      <div className={cn("mt-7 grid gap-6", !compacto && "sm:grid-cols-2")}>
        <div>
          <p className={cn("font-mono text-[0.64rem] tracking-[0.05em] uppercase", apoio)}>O que entra</p>
          <ul className="mt-3 grid gap-2">
            {o.inclui.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[0.9rem] font-semibold">
                <Check className={cn("mt-0.5 size-4 shrink-0", escuro ? "text-destaque" : "text-destaque-forte")} />
                {x}
              </li>
            ))}
          </ul>
        </div>
        {o.depois.length > 0 && (
          <div>
            <p className={cn("font-mono text-[0.64rem] tracking-[0.05em] uppercase", apoio)}>Fica de fora nesta opção</p>
            <ul className="mt-3 grid gap-2">
              {o.depois.map((x) => (
                <li key={x} className={cn("flex items-start gap-2 text-[0.9rem]", apoio)}>
                  <Minus className="mt-0.5 size-4 shrink-0" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-7">
        <p className={cn("mb-1 font-mono text-[0.64rem] tracking-[0.05em] uppercase", apoio)}>Parcelas, presas às entregas</p>
        <Parcelas o={o} escuro={escuro} />
      </div>
    </div>
  );
}

// A estrela que percorre o contorno da opção recomendada (StarBorder, React Bits gratuito), por cima do cartão e
// sem pegar clique. Puxa o olho para a recomendada sem gritar. Fora do PDF.
function EstrelaNaBorda() {
  if (modoPdf()) return null;
  const c = marca.cores;
  return (
    <StarBorder
      as="span"
      aria-hidden
      className="nao-imprimir"
      style={{ position: "absolute", inset: 0, padding: 0, pointerEvents: "none", zIndex: 0 }}
      radius={16}
      thickness={1.5}
      color={c.destaque}
      trailColor={c.destaqueForte}
      backgroundColor="transparent"
      borderColor="transparent"
      duration={5}
      glow={0.9}
      hover="none"
      clickPulse={false}
    />
  );
}

function Seletor() {
  const { ativa, setAtiva } = useOpcao();
  // No celular o painel fica embaixo dos cartões: ao escolher, a página desce até ele.
  const escolher = (i: number) => {
    setAtiva(i);
    if (window.innerWidth < 1024) document.getElementById("painel-opcao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="grid content-start gap-3 lg:sticky lg:top-24 lg:self-start" role="radiogroup" aria-label="Opções">
      {ordem.map((i) => {
        const o = opcoes[i];
        const ligada = ativa === i;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={ligada}
            onClick={() => escolher(i)}
            className={cn(
              "group relative isolate rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6",
              ligada ? "border-tinta bg-papel shadow-[var(--sombra)]" : "border-linha bg-papel/60 hover:border-apoio/40 hover:bg-papel",
            )}
          >
            {o.recomendada && <EstrelaNaBorda />}
            <span className="relative z-[1] flex items-start justify-between gap-4">
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[1.15rem] font-extrabold tracking-[-0.03em]">{o.nome}</span>
                  {o.recomendada && <Badge variante="destaque">Recomendado</Badge>}
                </span>
                <span className="mt-1 block text-[0.86rem] text-apoio">{o.frase}</span>
              </span>
              <span
                className={cn(
                  "mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  ligada ? "border-tinta" : "border-linha",
                )}
              >
                <span className={cn("size-2.5 rounded-full bg-tinta transition-transform", ligada ? "scale-100" : "scale-0")} />
              </span>
            </span>
            <span className="tabular relative z-[1] mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[1.45rem] font-extrabold tracking-[-0.04em]">{brl(o.preco)}</span>
              <span className="text-[0.84rem] text-apoio">
                {o.prazo} · {o.equipe}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Ancora() {
  const { ativa } = useOpcao();
  const o = opcoes[ativa];
  const escuro = !!o.recomendada;
  return (
    <>
      <div className="so-tela mt-12 grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <Seletor />
        <div
          id="painel-opcao"
          className={cn("scroll-mt-24 rounded-[22px] border p-6 transition-colors duration-500 sm:p-9", escuro ? "kit-ui border-noite-linha" : "kit-cartao")}
        >
          <Painel o={o} escuro={escuro} />
          <a href="#chamada" className={cn("kit-btn nao-imprimir mt-8 w-full", escuro ? "kit-btn-destaque" : "kit-btn-escuro")}>
            Quero seguir com {o.artigo ?? "o"} {o.nome}
            <ArrowDown className="size-4" />
          </a>
          <a
            href={mensagem(`Tenho uma dúvida sobre a opção ${o.nome}.`)}
            target="_blank"
            rel="noreferrer"
            className={cn("nao-imprimir mt-3 flex items-center justify-center gap-1.5 text-[0.8rem] font-bold", escuro ? "text-noite-apoio hover:text-papel" : "text-apoio hover:text-tinta")}
          >
            <MessageCircle className="size-4" />
            Tenho uma dúvida antes
          </a>
        </div>
      </div>
      {/* No PDF, as opções lado a lado, na ordem da página. */}
      <div className={cn("so-impressao mt-10 grid gap-5", opcoes.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {ordem.map((i) => (
          <div key={i} className={cn("sem-quebra rounded-[22px] border p-7", opcoes[i].recomendada ? "kit-ui border-noite-linha" : "kit-cartao")}>
            <Painel o={opcoes[i]} escuro={!!opcoes[i].recomendada} compacto />
          </div>
        ))}
      </div>
    </>
  );
}

// Valor direto: o valor combinado, as parcelas presas às entregas e o que entra, sem falar em opção.
function Unico() {
  const o = opcoes[0];
  return (
    <Revelar className="mt-12">
      <div className="kit-ui grid gap-0 lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-noite-linha p-7 sm:p-10 lg:border-r lg:border-b-0">
          <Badge variante="destaque">{o.selo}</Badge>
          <p className="mt-6 font-titulo text-[clamp(2.8rem,6vw,4.4rem)] leading-none font-extrabold tracking-[-0.05em]">
            <Numero valor={o.preco} formato={brl} />
          </p>
          <p className="mt-3 text-noite-apoio">Pagamento em {o.pagamento}.</p>
          <p className="mt-6 leading-relaxed text-papel/90">{o.para}</p>
          <ul className="mt-6 grid gap-2.5">
            {o.inclui.map((x) => (
              <li key={x} className="flex items-start gap-2.5 font-semibold">
                <Check className="mt-0.5 size-4 shrink-0 text-destaque" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-7 sm:p-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-noite-linha bg-noite-linha">
            {[
              ["Prazo", o.prazo],
              ["Equipe", o.ritmo ? `${o.equipe}, ${o.ritmo}` : o.equipe],
              ["Demonstração", o.demos],
              ["Garantia", `${o.garantia.dias} dias`],
            ].map(([k, v]) => (
              <div key={k} className="bg-tinta-2 p-4">
                <dt className="font-mono text-[0.62rem] tracking-[0.05em] text-noite-apoio uppercase">{k}</dt>
                <dd className="mt-1 text-[0.92rem] font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 mb-1 font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Parcelas, presas às entregas</p>
          <Parcelas o={o} escuro />
          <a href="#chamada" className="kit-btn kit-btn-destaque nao-imprimir mt-8 w-full">
            Quero seguir
            <ArrowDown className="size-4" />
          </a>
          <a
            href={mensagem("Tenho uma dúvida sobre a proposta.")}
            target="_blank"
            rel="noreferrer"
            className="nao-imprimir mt-3 flex items-center justify-center gap-1.5 text-[0.8rem] font-bold text-noite-apoio hover:text-papel"
          >
            <MessageCircle className="size-4" />
            Tenho uma dúvida antes
          </a>
        </div>
      </div>
    </Revelar>
  );
}

export function Opcoes() {
  return (
    <section id="opcoes" className="overflow-x-clip border-y border-linha bg-tom-2/40 py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap">
        <Titulo olho={secoes.investimento.olho} titulo={secoes.investimento.titulo} texto={secoes.investimento.texto} />
        {ehAncora ? <Ancora /> : <Unico />}
      </div>
    </section>
  );
}
