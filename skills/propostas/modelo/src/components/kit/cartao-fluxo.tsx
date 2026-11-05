// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GradeViva } from "@/components/kit/grade-viva";
import { fluxo } from "@/data";
import { cn, modoPdf } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

// O cartão ao lado do título: o caminho da solução, do começo ao fim, em degraus ligados por um traço. O passo
// que é o coração da solução (nucleo) ganha a cor de destaque. É a primeira coisa que o cliente vê, antes de
// ler qualquer parágrafo. O cartão entra girando de leve e os passos aparecem um a um; parado no PDF.
export function CartaoFluxo({ className }: { className?: string }) {
  const parado = useReducedMotion() || modoPdf();
  const recuo = (i: number) => `${(i * 18) / Math.max(1, fluxo.passos.length - 1)}%`;
  return (
    <motion.figure
      initial={parado ? false : { opacity: 0, y: 30, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 2.2 }}
      transition={{ duration: 1, ease: EASE, delay: 0.35 }}
      className={cn("kit-ui sem-quebra relative w-full max-w-[560px] shadow-[18px_22px_0_var(--color-tom-3)]", className)}
    >
      <figcaption className="kit-ui-barra">
        <span className="kit-ponto-vivo" />
        {fluxo.titulo}
        <span className="fim">{fluxo.selo}</span>
      </figcaption>
      <div className="relative overflow-hidden px-5 py-8 sm:px-8">
        <GradeViva className="absolute inset-0 size-full opacity-50" />
        <ol className="relative z-10 flex flex-col">
          {fluxo.passos.map((p, i) => (
            <li key={p.olho}>
              <motion.div
                initial={parado ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.9 + i * 0.3 }}
                className={cn(
                  "ml-[calc(var(--recuo)*0.4)] grid max-w-[92%] grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg border p-3.5 shadow-[0_8px_15px_rgba(0,0,0,0.18)] sm:ml-[var(--recuo)] sm:max-w-[82%]",
                  p.nucleo ? "border-destaque-forte bg-noite" : "border-noite-linha bg-tinta-2/95",
                )}
                style={{ "--recuo": recuo(i) } as CSSProperties}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-md font-mono text-[0.72rem] font-medium",
                    p.nucleo ? "bg-destaque text-tinta" : "bg-papel/10 text-destaque",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <small className="block font-mono text-[0.56rem] tracking-[0.06em] text-noite-apoio uppercase">{p.olho}</small>
                  <strong className="block text-[0.82rem] leading-snug tracking-[-0.02em] text-papel sm:truncate">{p.texto}</strong>
                </span>
                <span
                  className={cn(
                    "hidden rounded-full border px-2 py-0.5 font-mono text-[0.55rem] sm:inline",
                    p.nucleo ? "border-destaque text-destaque" : "border-noite-linha text-noite-apoio",
                  )}
                >
                  {p.estado}
                </span>
              </motion.div>
              {i < fluxo.passos.length - 1 && (
                <div
                  className="ml-[calc(var(--recuo)*0.4+30px)] h-3 border-l border-dashed border-destaque-forte sm:ml-[calc(var(--recuo)+30px)]"
                  style={{ "--recuo": recuo(i + 1) } as CSSProperties}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="kit-ui-barra border-t border-b-0">
        <span className="kit-ponto-vivo" />
        <span className="tracking-normal normal-case">{fluxo.rodape}</span>
      </div>
    </motion.figure>
  );
}
