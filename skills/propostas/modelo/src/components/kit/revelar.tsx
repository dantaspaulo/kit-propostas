// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { modoPdf } from "@/lib/utils";

// Entrada suave, de baixo para cima, uma vez só. No PDF e com movimento reduzido, aparece pronto.
export function Revelar({
  children,
  atraso = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  atraso?: number;
  y?: number;
  className?: string;
}) {
  const reduzir = useReducedMotion();
  if (reduzir || modoPdf()) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
