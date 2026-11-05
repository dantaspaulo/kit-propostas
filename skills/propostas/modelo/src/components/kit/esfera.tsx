// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import Orb from "@/components/reactbits/Orb";
import { SobDemanda } from "@/components/kit/sob-demanda";
import { marca } from "@/lib/marca";
import { cn, modoPdf } from "@/lib/utils";

const poucoMovimento = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// O centro da solução: o Orb (React Bits gratuito, baixado pelo kit) nas cores da marca. Só desenha perto da
// tela. No PDF e para quem pede menos movimento, fica um brilho parado no mesmo lugar.
export function Esfera({ className }: { className?: string }) {
  const c = marca.cores;
  if (modoPdf() || poucoMovimento())
    return (
      <div
        className={cn("rounded-full", className)}
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 30%, color-mix(in oklab, ${c.destaque} 70%, transparent) 46%, color-mix(in oklab, ${c.destaque} 18%, transparent) 58%, transparent 70%)`,
        }}
      />
    );
  return (
    <SobDemanda className={className}>
      <Orb colors={[c.destaque, c.marca, c.destaqueForte]} backgroundColor={c.noite} followCursor={false} clickPulse={false} glow={1.15} />
    </SobDemanda>
  );
}
