// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { marca } from "@/lib/marca";
import { cn } from "@/lib/utils";

// A marca do negócio: o logo, se houver, ou o monograma com o nome. No fundo escuro, usa o logo claro;
// sem ele, o logo vai num selo claro para não sumir.
export function Marca({ claro = false, className }: { claro?: boolean; className?: string }) {
  const nome = marca.negocio.nome;
  if (claro && marca.logoClaro)
    return (
      <span className={cn("kit-marca", className)}>
        <img src={marca.logoClaro} alt={nome} className="h-8 w-auto max-w-[190px] object-contain" />
      </span>
    );
  if (claro && marca.logo)
    return (
      <span className={cn("kit-marca", className)}>
        <span className="rounded-lg bg-papel px-2.5 py-1.5">
          <img src={marca.logo} alt={nome} className="h-6 w-auto max-w-[170px] object-contain" />
        </span>
      </span>
    );
  if (marca.logo)
    return (
      <span className={cn("kit-marca", className)}>
        <img src={marca.logo} alt={nome} className="h-8 w-auto max-w-[190px] object-contain" />
      </span>
    );
  return (
    <span className={cn("kit-marca", className)}>
      <span className="kit-monograma" aria-hidden>
        {nome.trim().charAt(0).toUpperCase()}
      </span>
      <span>{nome}</span>
    </span>
  );
}
