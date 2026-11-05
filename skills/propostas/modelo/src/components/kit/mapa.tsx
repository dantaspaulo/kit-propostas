// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { cn } from "@/lib/utils";

// O mapa da solução: o núcleo no centro, na cor de destaque, e as partes em volta, ligadas a ele.
// Os nós flutuam devagar (CSS), e o anel tracejado gira; parado no PDF e com movimento reduzido.
export function Mapa({ nucleo, nos, className }: { nucleo: string; nos: string[]; className?: string }) {
  const raio = 39;
  const pontos = nos.map((no, i) => {
    const angulo = (-90 + (360 / nos.length) * i) * (Math.PI / 180);
    return { no, x: 50 + raio * Math.cos(angulo), y: 50 + raio * Math.sin(angulo) };
  });
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[440px]", className)}>
      <div className="absolute inset-[6%] rounded-full border border-noite-linha" />
      <div className="absolute inset-[24%] rounded-full border border-dashed border-noite-linha [animation:kit-girar_70s_linear_infinite]" />
      <svg className="absolute inset-0 size-full text-noite-linha" viewBox="0 0 100 100" aria-hidden>
        {pontos.map((p) => (
          <line key={p.no} x1="50" y1="50" x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.35" strokeDasharray="1.2 1.6" />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-1/2 grid size-[34%] place-items-center rounded-full bg-destaque text-center text-tinta"
        style={{
          transform: "translate(-50%, -50%)",
          boxShadow:
            "0 0 0 14px color-mix(in oklab, var(--color-destaque) 12%, transparent), 0 0 0 34px color-mix(in oklab, var(--color-destaque) 6%, transparent)",
        }}
      >
        <span className="px-2 font-titulo text-[clamp(1rem,2.4vw,1.6rem)] leading-none font-extrabold tracking-[-0.05em]">{nucleo}</span>
      </div>
      {pontos.map((p, i) => (
        <span
          key={p.no}
          className="absolute rounded-lg border border-noite-linha bg-noite px-3 py-2 font-mono text-[0.66rem] whitespace-nowrap text-papel shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            animation: `kit-flutuar ${5 + (i % 3)}s ease-in-out ${i * 0.45}s infinite`,
          }}
        >
          {p.no}
        </span>
      ))}
    </div>
  );
}
