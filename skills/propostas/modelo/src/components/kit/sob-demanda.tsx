import { useEffect, useRef, useState, type ReactNode } from "react";

// Peça pesada (WebGL, shader, vídeo) só existe perto da tela: monta ao se aproximar e desmonta ao se
// afastar, então nada fica desenhando fora de vista. No PDF, uma vez montada, fica.
export function SobDemanda({ children, margem = "300px 0px", className = "" }: { children: ReactNode; margem?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pdf = document.documentElement.classList.contains("modo-pdf");
    const obs = new IntersectionObserver(([e]) => setPerto((antes) => (pdf ? antes || e.isIntersecting : e.isIntersecting)), {
      rootMargin: margem,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [margem]);

  return (
    <div ref={ref} className={className}>
      {perto ? children : null}
    </div>
  );
}
