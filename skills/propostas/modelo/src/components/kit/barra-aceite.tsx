// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { opcoes } from "@/data";
import { useOpcao } from "@/estado";
import { ehAncora } from "@/lib/proposta";
import { brl, modoPdf } from "@/lib/utils";

// A barra que acompanha a leitura: aparece depois que o cliente passou pelo investimento e some quando ele chega
// ao aceite. Mostra a opção em foco e o valor, e leva ao aceite. Nunca no PDF.
export function BarraAceite() {
  const { ativa } = useOpcao();
  const o = opcoes[ativa];
  const [ver, setVer] = useState(false);

  useEffect(() => {
    if (modoPdf()) return;
    const atualizar = () => {
      const investimento = document.getElementById("opcoes")?.getBoundingClientRect();
      const aceite = document.getElementById("chamada")?.getBoundingClientRect();
      // Só depois de o cliente terminar o investimento: enquanto ele escolhe, a barra não cobre as opções.
      const passou = investimento ? investimento.bottom < window.innerHeight * 0.6 : false;
      const chegou = aceite ? aceite.top < window.innerHeight * 0.9 : false;
      setVer(passou && !chegou);
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return (
    <div className="nao-imprimir pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-5">
      <AnimatePresence>
        {ver && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="pointer-events-auto flex w-full max-w-[560px] items-center gap-3 rounded-2xl border border-noite-linha bg-noite/95 p-2 pl-4 text-papel shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.58rem] tracking-[0.06em] text-noite-apoio uppercase">
                {ehAncora ? "Opção em foco" : "Investimento"}
              </p>
              <p className="tabular truncate text-[0.95rem] font-extrabold tracking-[-0.02em]">
                {ehAncora && `${o.nome} · `}
                {brl(o.preco)}
                <span className="font-medium text-noite-apoio"> · {o.pagamento}</span>
              </p>
            </div>
            <a href="#chamada" className="kit-btn kit-btn-destaque shrink-0">
              Aceitar
              <ArrowDown className="size-4" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
