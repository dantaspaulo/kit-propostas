// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { useState } from "react";
import { Check, Download, MessageCircle, Repeat } from "lucide-react";
import HoldButton from "@/components/reactbits/HoldButton";
import SoftAurora from "@/components/reactbits/SoftAurora";
import { Revelar } from "@/components/kit/revelar";
import { SobDemanda } from "@/components/kit/sob-demanda";
import { TextoRevelado } from "@/components/kit/texto-revelado";
import { Badge } from "@/components/ui/badge";
import { chamada, negocio, opcoes, proposta } from "@/data";
import { useOpcao } from "@/estado";
import { marca } from "@/lib/marca";
import { ehAncora, faltam, mensagem, mensagemAceite, pdf } from "@/lib/proposta";
import { brl, dois, modoPdf } from "@/lib/utils";

// O aceite, onde a leitura termina: o que acontece depois de aceitar (tira o "e agora?"), o resumo da opção em
// foco e o botão de segurar para aceitar (HoldButton, React Bits gratuito), que abre o WhatsApp com a mensagem
// de aceite pronta. Segurar é de propósito: aceitar é um compromisso, não um clique sem querer. Ao fundo, a
// aurora (SoftAurora) nas cores da marca. No PDF, no lugar do botão, o caminho para aceitar por escrito.
export function Chamada() {
  const { ativa } = useOpcao();
  const o = opcoes[ativa];
  const c = marca.cores;
  const [aceito, setAceito] = useState(false);
  const [dica, setDica] = useState(false);
  const link = mensagemAceite(o);
  const aceitar = () => {
    setAceito(true);
    window.setTimeout(() => window.location.assign(link), 700);
  };
  const quem = [negocio.assinatura.nome, negocio.assinatura.cargo].filter(Boolean).join(", ");

  return (
    <section id="chamada" className="fundo-noite-brilho relative isolate overflow-hidden">
      {!modoPdf() && (
        <SobDemanda className="absolute inset-0 -z-10 opacity-45">
          <SoftAurora color1={c.destaque} color2={c.marca} brightness={0.9} enableMouseInteraction={false} clickPulse={false} />
        </SobDemanda>
      )}
      <div className="kit-wrap fundo-noite bg-transparent py-24 sm:py-28 lg:py-32">
        {/* No celular: título, o cartão com o botão e só depois os passos. No computador, o cartão fica ao lado. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:gap-x-16">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Revelar>
              <p className="kit-olho claro">{chamada.olho}</p>
            </Revelar>
            <TextoRevelado texto={chamada.titulo} className="kit-titulo mt-5 max-w-[15ch] text-papel" />
            <Revelar atraso={0.2}>
              <p className="kit-lead mt-6 max-w-[38rem] text-noite-apoio">{chamada.texto}</p>
            </Revelar>
          </div>

          <Revelar atraso={0.2} className="min-w-0 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <div className="sem-quebra rounded-3xl border border-noite-linha bg-noite/70 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)] backdrop-blur-md sm:p-8">
              <p className="kit-olho claro">{ehAncora ? "Você está aceitando" : "O que você aceita"}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <h3 className="text-[1.6rem] font-extrabold tracking-[-0.04em] text-papel">{ehAncora ? o.nome : "A proposta"}</h3>
                {o.recomendada && ehAncora && <Badge variante="destaque">Recomendado</Badge>}
              </div>
              <p className="tabular mt-5 text-[clamp(2.4rem,4.4vw,3.3rem)] leading-none font-extrabold tracking-[-0.05em] text-papel">
                {brl(o.preco)}
              </p>
              <p className="mt-2 text-noite-apoio">{o.pagamento}</p>
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-noite-linha bg-noite-linha text-[0.86rem]">
                {[
                  ["Prazo", o.prazo],
                  ["Garantia", `${o.garantia.dias} dias`],
                  ["Equipe", o.equipe],
                  ["Válida até", proposta.validadeCurta, faltam()],
                ].map(([r, v, extra]) => (
                  <div key={r} className="bg-noite p-3.5">
                    <dt className="font-mono text-[0.58rem] tracking-[0.06em] text-noite-apoio uppercase">{r}</dt>
                    <dd className="mt-1 font-bold text-papel">{v}</dd>
                    {extra && <dd className="nao-imprimir mt-0.5 font-mono text-[0.58rem] text-destaque uppercase">{extra}</dd>}
                  </div>
                ))}
              </dl>

              <div className="nao-imprimir mt-7">
                <HoldButton
                  className="w-full"
                  size="lg"
                  radius={999}
                  holdTime={1100}
                  resetAfter={600000}
                  backgroundColor={c.destaque}
                  fillColor={c.papel}
                  textColor={c.tinta}
                  fillTextColor={c.tinta}
                  icon={<Check className="size-5" />}
                  doneIcon={<Check className="size-5" />}
                  doneLabel="Aceite enviado"
                  onHold={aceitar}
                  onTap={() => setDica(true)}
                >
                  Segure para aceitar
                </HoldButton>
                <p className="mt-3 text-center text-[0.8rem] text-noite-apoio" aria-live="polite">
                  {aceito ? (
                    <>
                      Abrindo o WhatsApp com a mensagem de aceite.{" "}
                      <a href={link} className="font-bold text-destaque underline">
                        Se não abrir, toque aqui.
                      </a>
                    </>
                  ) : dica ? (
                    "Segure o botão por um segundo: é o seu aceite."
                  ) : (
                    "Segure por um segundo: a mensagem de aceite vai pronta para o nosso WhatsApp."
                  )}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.8rem] font-bold">
                  <a href={mensagem("Antes de aceitar, quero tirar uma dúvida.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-papel hover:text-destaque">
                    <MessageCircle className="size-4" />
                    Prefiro conversar antes
                  </a>
                  {ehAncora && (
                    <a href="#opcoes" className="inline-flex items-center gap-1.5 text-papel hover:text-destaque">
                      <Repeat className="size-4" />
                      Trocar a opção
                    </a>
                  )}
                  <a href={pdf} download className="inline-flex items-center gap-1.5 text-papel hover:text-destaque">
                    <Download className="size-4" />
                    Baixar o PDF
                  </a>
                </div>
              </div>
              <p className="so-impressao mt-6 leading-relaxed text-noite-apoio">
                Para aceitar, responda a mensagem em que esta proposta chegou ou fale com {quem || negocio.nome}
                {negocio.whatsappVisivel ? `, pelo WhatsApp ${negocio.whatsappVisivel}` : ""}. Válida até {proposta.validade}.
              </p>
            </div>
          </Revelar>

          <ol className="grid gap-3 lg:col-start-1 lg:row-start-2">
            {chamada.passos.map((p, i) => (
              <Revelar key={p.titulo} atraso={0.25 + i * 0.08}>
                <li className="sem-quebra flex gap-4 rounded-2xl border border-noite-linha bg-papel/[0.04] p-5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-destaque/60 font-mono text-[0.7rem] text-destaque">
                    {dois(i + 1)}
                  </span>
                  <span>
                    <strong className="block text-[1.02rem] tracking-[-0.02em] text-papel">{p.titulo}</strong>
                    <span className="mt-1 block leading-relaxed text-noite-apoio">{p.texto}</span>
                  </span>
                </li>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
