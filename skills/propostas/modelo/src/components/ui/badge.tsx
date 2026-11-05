// Origem: shadcn/ui (licença MIT, ui.shadcn.com), com as cores da marca e sem dependência extra. Ver THIRD-PARTY.md.
import * as React from "react";
import { cn } from "@/lib/utils";

const variantes = {
  destaque: "bg-destaque text-tinta",
  escuro: "bg-tinta text-papel",
  suave: "bg-tom-3 text-tinta",
  neutro: "bg-tom-1 text-tinta",
  borda: "border border-linha bg-papel text-apoio",
  noite: "border border-noite-linha bg-transparent text-noite-apoio",
} as const;

export type VarianteSelo = keyof typeof variantes;

function Badge({ className, variante = "suave", ...props }: React.ComponentProps<"span"> & { variante?: VarianteSelo }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.62rem] font-medium tracking-[0.05em] whitespace-nowrap uppercase",
        variantes[variante],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
