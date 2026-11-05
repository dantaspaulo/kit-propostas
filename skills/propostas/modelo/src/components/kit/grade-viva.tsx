// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { useEffect, useRef } from "react";
import { cn, modoPdf } from "@/lib/utils";

// Fundo de grade com quadrados que acendem e apagam devagar, na cor de destaque da marca. Canvas 2D leve:
// só desenha quando está na tela e com a aba visível; com movimento reduzido ou no PDF, fica parado.
export function GradeViva({ className, celula = 28, densidade = 0.0045 }: { className?: string; celula?: number; densidade?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cor = getComputedStyle(canvas).getPropertyValue("--color-destaque").trim() || "#888888";
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches || modoPdf();
    let largura = 0;
    let altura = 0;
    let cols = 0;
    let brilho = new Float32Array(0);
    let alvo = new Float32Array(0);
    let rodando = false;
    let quadro = 0;
    let ultimo = 0;

    const desenhar = () => {
      ctx.clearRect(0, 0, largura, altura);
      ctx.fillStyle = cor;
      for (let i = 0; i < brilho.length; i++) {
        const b = brilho[i];
        if (b < 0.015) continue;
        ctx.globalAlpha = b;
        ctx.fillRect((i % cols) * celula + 2, Math.floor(i / cols) * celula + 2, celula - 4, celula - 4);
      }
      ctx.globalAlpha = 1;
    };
    const semear = (quantos: number) => {
      for (let k = 0; k < quantos; k++) alvo[Math.floor(Math.random() * alvo.length)] = 0.25 + Math.random() * 0.5;
    };
    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = r.width;
      altura = r.height;
      canvas.width = Math.max(1, Math.round(largura * dpr));
      canvas.height = Math.max(1, Math.round(altura * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(largura / celula));
      const total = cols * Math.max(1, Math.ceil(altura / celula));
      brilho = new Float32Array(total);
      alvo = new Float32Array(total);
      if (parado) {
        semear(Math.round(total * 0.06));
        brilho.set(alvo);
      }
      desenhar();
    };
    const passo = (t: number) => {
      if (!rodando) return;
      if (t - ultimo > 1000 / 30) {
        ultimo = t;
        semear(Math.max(1, Math.round(brilho.length * densidade)));
        for (let i = 0; i < brilho.length; i++) {
          brilho[i] += (alvo[i] - brilho[i]) * 0.07;
          alvo[i] *= 0.968;
        }
        desenhar();
      }
      quadro = requestAnimationFrame(passo);
    };
    const ligar = (sim: boolean) => {
      if (parado) return;
      if (sim && !rodando && !document.hidden) {
        rodando = true;
        quadro = requestAnimationFrame(passo);
      } else if (!sim && rodando) {
        rodando = false;
        cancelAnimationFrame(quadro);
      }
    };

    medir();
    const obs = new IntersectionObserver(([e]) => ligar(e.isIntersecting));
    obs.observe(canvas);
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    const aba = () => ligar(!document.hidden && canvas.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", aba);
    return () => {
      rodando = false;
      cancelAnimationFrame(quadro);
      obs.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", aba);
    };
  }, [celula, densidade]);

  return <canvas ref={ref} className={cn("pointer-events-none block", className)} aria-hidden />;
}
