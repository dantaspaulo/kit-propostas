// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Download, MessageCircle } from "lucide-react";
import { Marca } from "@/components/kit/marca";
import { mensagem, pdf } from "@/lib/proposta";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "solucao", rotulo: "Como fazemos" },
  { id: "escopo", rotulo: "Escopo" },
  { id: "etapas", rotulo: "Etapas" },
  { id: "opcoes", rotulo: "Investimento" },
  { id: "condicoes", rotulo: "Condições" },
  { id: "duvidas", rotulo: "Dúvidas" },
];

// Barra do topo: a marca, as seções com o sublinhado na que está na tela, a barra de leitura, o PDF e o
// WhatsApp. Fica fora do PDF.
export function Topo() {
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [ativa, setAtiva] = useState("");
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const secoes = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el);
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setAtiva(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    secoes.forEach((s) => obs.observe(s));
    const rolagem = () => setRolou(window.scrollY > 12);
    rolagem();
    window.addEventListener("scroll", rolagem, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", rolagem);
    };
  }, []);

  return (
    <header
      className={cn(
        "nao-imprimir sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300",
        rolou ? "border-b border-linha bg-fundo/85 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <motion.div className="kit-progresso" style={{ scaleX: progresso }} />
      <div className="kit-wrap flex h-[68px] items-center justify-between gap-6">
        <a href="#topo" aria-label="Voltar ao início">
          <Marca />
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Seções da proposta">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={cn(
                "relative rounded-full px-3 py-2 text-[0.8rem] font-bold text-apoio transition-colors hover:text-tinta",
                ativa === l.id && "text-tinta",
              )}
            >
              {l.rotulo}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-px h-[2px] origin-left rounded-full bg-destaque-forte transition-transform duration-300",
                  ativa === l.id ? "scale-x-100" : "scale-x-0",
                )}
              />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={pdf} download className="kit-btn kit-btn-borda" aria-label="Baixar a proposta em PDF">
            <Download className="size-4" />
            <span className="hidden sm:inline">PDF</span>
          </a>
          <a
            href={mensagem("Quero conversar sobre ela.")}
            target="_blank"
            rel="noreferrer"
            className="kit-btn kit-btn-escuro min-h-[44px] px-4 text-[0.76rem]"
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Conversar</span>
          </a>
        </div>
      </div>
    </header>
  );
}
