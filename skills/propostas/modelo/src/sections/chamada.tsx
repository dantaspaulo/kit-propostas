// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Download, MessageCircle } from "lucide-react";
import { GradeViva } from "@/components/kit/grade-viva";
import { Revelar } from "@/components/kit/revelar";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { chamada, negocio, opcoes, proposta } from "@/data";
import { useOpcao } from "@/estado";
import { ehAncora, mensagem, pdf } from "@/lib/proposta";

// O fechamento: o próximo passo em uma frase, o WhatsApp com a mensagem pronta (com a opção em foco) e o PDF.
export function Chamada() {
  const { ativa } = useOpcao();
  const o = opcoes[ativa];
  const quem = [negocio.assinatura.nome, negocio.assinatura.cargo].filter(Boolean).join(", ");
  return (
    <section id="chamada" className="fundo-noite-brilho relative isolate overflow-hidden">
      <GradeViva className="absolute inset-0 -z-10 size-full opacity-60 [mask-image:radial-gradient(60%_70%_at_80%_40%,black,transparent_75%)]" />
      <div className="kit-wrap fundo-noite bg-transparent py-24 sm:py-28 lg:py-36">
        <Revelar>
          <p className="kit-olho claro">{chamada.olho}</p>
        </Revelar>
        <TextoRevelado texto={chamada.titulo} className="kit-titulo max-w-[15ch] text-papel" />
        <Revelar atraso={0.2}>
          <p className="kit-lead mt-7 max-w-[40rem] text-noite-apoio">{chamada.texto}</p>
        </Revelar>
        <Revelar atraso={0.3} className="nao-imprimir mt-10 flex flex-wrap gap-3">
          <a
            href={mensagem(ehAncora ? `Quero seguir com a opção ${o.nome}.` : "Quero seguir com a proposta.")}
            target="_blank"
            rel="noreferrer"
            className="kit-btn kit-btn-destaque"
          >
            <MessageCircle className="size-4" />
            {ehAncora ? `Quero seguir com ${o.artigo ?? "o"} ${o.nome}` : "Quero seguir"}
          </a>
          <a href={pdf} download className="kit-btn border border-noite-linha text-papel hover:bg-papel/5">
            <Download className="size-4" />
            Baixar em PDF
          </a>
        </Revelar>
        <p className="mt-10 font-mono text-[0.7rem] tracking-[0.04em] text-noite-apoio uppercase">
          Válida até {proposta.validade}
          {quem && ` · ${quem}`}
        </p>
      </div>
    </section>
  );
}
