// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { createElement, type ElementType } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn, modoPdf } from "@/lib/utils";

/** "Agenda para *três unidades*" vira trechos normais e trechos em serifa. */
export function partes(texto: string) {
  return texto
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((p) => (p.startsWith("*") && p.endsWith("*") ? { t: p.slice(1, -1), serifa: true } : { t: p, serifa: false }));
}

/** Texto com os trechos *assim* em serifa, sem animação (para cartões, selos e o PDF). */
export function ComSerifa({ texto }: { texto: string }) {
  return (
    <>
      {partes(texto).map((p, i) => (p.serifa ? <em key={i}>{p.t}</em> : <span key={i}>{p.t}</span>))}
    </>
  );
}

// Título que entra palavra por palavra, saindo do desfoque, uma vez só, quando aparece na tela.
// Sem animação no PDF e para quem pediu menos movimento no sistema.
export function TextoRevelado({
  texto,
  como = "h2",
  className,
  atraso = 0,
}: {
  texto: string;
  como?: ElementType;
  className?: string;
  atraso?: number;
}) {
  const reduzir = useReducedMotion();
  if (reduzir || modoPdf()) return createElement(como, { className }, <ComSerifa texto={texto} />);
  let n = 0;
  const filhos = partes(texto).map((p, i) => {
    const pedacos = p.t.split(/(\s+)/).map((w, j) =>
      /^\s*$/.test(w) ? (
        w
      ) : (
        <motion.span
          key={j}
          className="inline-block"
          initial={{ opacity: 0, y: "0.32em", filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: atraso + 0.045 * n++, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
        </motion.span>
      ),
    );
    return p.serifa ? <em key={i}>{pedacos}</em> : <span key={i}>{pedacos}</span>;
  });
  return createElement(como, { className: cn(className) }, filhos);
}
