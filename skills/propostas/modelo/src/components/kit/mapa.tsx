// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Esfera } from "@/components/kit/esfera";
import { cn } from "@/lib/utils";

// O mapa da solução, sobre fundo escuro: a esfera viva no centro com o nome do núcleo, e as partes em volta,
// ligadas a ela. Os nós flutuam devagar (CSS) e o anel tracejado gira; tudo parado no PDF.
export function Mapa({ nucleo, nos, className }: { nucleo: string; nos: string[]; className?: string }) {
  const raio = 41;
  const pontos = nos.map((no, i) => {
    const angulo = (-90 + (360 / nos.length) * i) * (Math.PI / 180);
    return { no, x: 50 + raio * Math.cos(angulo), y: 50 + raio * Math.sin(angulo) };
  });
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[520px]", className)}>
      <div className="absolute inset-[9%] rounded-full border border-noite-linha" />
      <div className="absolute inset-[22%] rounded-full border border-dashed border-noite-linha [animation:kit-girar_80s_linear_infinite]" />
      <svg className="absolute inset-0 size-full text-noite-linha" viewBox="0 0 100 100" aria-hidden>
        {pontos.map((p) => (
          <line key={p.no} x1={50 + (p.x - 50) * 0.6} y1={50 + (p.y - 50) * 0.6} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.3" strokeDasharray="1.2 1.6" />
        ))}
      </svg>
      <Esfera className="absolute inset-[27%]" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-titulo text-[clamp(1.05rem,2.2vw,1.55rem)] leading-none font-extrabold tracking-[-0.05em] text-papel">
        {nucleo}
      </span>
      {pontos.map((p, i) => (
        <span
          key={p.no}
          className="absolute rounded-lg border border-noite-linha bg-noite/90 px-3 py-2 font-mono text-[0.66rem] whitespace-nowrap text-papel shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur"
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
