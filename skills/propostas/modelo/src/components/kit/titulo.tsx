// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import type { ReactNode } from "react";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { cn } from "@/lib/utils";

// Cabeçalho de seção: o olho em mono numa coluna, o título pesado com o trecho em *serifa* e o texto de
// apoio na outra. No celular, um embaixo do outro.
export function Titulo({
  olho,
  titulo,
  texto,
  claro,
  className,
}: {
  olho: string;
  titulo: string;
  texto?: ReactNode;
  claro?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-[0.9fr_1.5fr] lg:gap-16", className)}>
      <p className={cn("kit-olho self-start lg:pt-3", claro && "claro")}>{olho}</p>
      <div>
        <TextoRevelado texto={titulo} className="kit-titulo max-w-[17ch]" />
        {texto && <div className="kit-lead mt-6 max-w-[40rem]">{texto}</div>}
      </div>
    </div>
  );
}
