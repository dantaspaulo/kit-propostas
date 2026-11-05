// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn, modoPdf } from "@/lib/utils";

// Número que conta até o valor quando aparece, e que anda do valor antigo ao novo quando muda (ao trocar
// de opção). No PDF, na impressão e com movimento reduzido, mostra o valor pronto.
export function Numero({
  valor,
  formato = (v: number) => v.toLocaleString("pt-BR"),
  duracao = 1.1,
  className,
}: {
  valor: number;
  formato?: (v: number) => string;
  duracao?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduzir = useReducedMotion();
  const pronto = reduzir || modoPdf();
  const [atual, setAtual] = useState(pronto ? valor : 0);
  const anterior = useRef(pronto ? valor : 0);

  useEffect(() => {
    if (pronto) {
      setAtual(valor);
      return;
    }
    if (!emVista) return;
    const controle = animate(anterior.current, valor, {
      duration: duracao,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setAtual(Math.round(v)),
    });
    anterior.current = valor;
    return () => controle.stop();
  }, [emVista, valor, pronto, duracao]);

  // Ctrl+P antes de rolar a página: o papel sai com o valor certo.
  useEffect(() => {
    const final = () => setAtual(valor);
    window.addEventListener("beforeprint", final);
    return () => window.removeEventListener("beforeprint", final);
  }, [valor]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {formato(atual)}
    </span>
  );
}
