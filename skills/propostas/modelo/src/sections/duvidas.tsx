// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { duvidas, negocio, secoes } from "@/data";
import { mensagem } from "@/lib/proposta";
import { dois, modoPdf } from "@/lib/utils";

// As objeções respondidas antes de virar pergunta. No PDF, todas abertas.
export function Duvidas() {
  const todas = duvidas.map((_, i) => `d${i}`);
  return (
    <section id="duvidas" className="py-20 sm:py-24 lg:py-32">
      <div className="kit-wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="kit-olho">{secoes.duvidas.olho}</p>
          <TextoRevelado texto={secoes.duvidas.titulo} className="kit-titulo max-w-[12ch]" />
          <p className="kit-lead mt-6">{secoes.duvidas.texto}</p>
          <div className="nao-imprimir mt-8 rounded-2xl border border-linha bg-papel p-6">
            <p className="font-bold">Falar com {negocio.assinatura.nome || negocio.nome}</p>
            {negocio.whatsappVisivel && <p className="tabular mt-1 text-[0.9rem] text-apoio">{negocio.whatsappVisivel}</p>}
            <a href={mensagem("Tenho uma dúvida.")} target="_blank" rel="noreferrer" className="kit-btn kit-btn-escuro mt-5 w-full">
              <MessageCircle className="size-4" />
              Mandar uma pergunta
            </a>
          </div>
        </div>
        <Accordion type="multiple" defaultValue={modoPdf() ? todas : ["d0"]} className="border-t border-linha">
          {duvidas.map((d, i) => (
            <AccordionItem key={d.q} value={`d${i}`} className="sem-quebra">
              <AccordionTrigger className="text-[1.05rem] tracking-[-0.02em]">
                <span className="flex gap-4">
                  <span className="mt-1 font-mono text-[0.7rem] font-medium text-destaque-forte">{dois(i + 1)}</span>
                  {d.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-9 text-[0.96rem] leading-relaxed text-apoio">{d.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
