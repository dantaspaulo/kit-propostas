// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { Marca } from "@/components/kit/marca";
import { negocio, proposta, publicacao } from "@/data";
import { quem } from "@/lib/proposta";

// Rodapé: quem propõe, a referência e a validade, e os dados da empresa (só os que existem no perfil).
export function Rodape() {
  const empresa = [negocio.razaoSocial, negocio.cnpj && `CNPJ ${negocio.cnpj}`, negocio.endereco, negocio.cidade].filter(Boolean);
  const contato = [negocio.whatsappVisivel, negocio.email, negocio.site].filter(Boolean);
  return (
    <footer className="fundo-noite border-t border-noite-linha bg-tinta-2">
      <div className="kit-wrap grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Marca claro />
          <p className="mt-4 max-w-[22rem] text-[0.9rem] leading-relaxed text-noite-apoio">
            Proposta técnica e comercial para {quem()}: {publicacao.titulo}.
          </p>
        </div>
        <div>
          <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Proposta</p>
          <ul className="mt-3 grid gap-1.5 text-[0.9rem]">
            <li>{proposta.referencia}</li>
            <li>Emitida em {proposta.data}</li>
            <li className="text-destaque">Válida até {proposta.validade}</li>
          </ul>
        </div>
        {contato.length > 0 && (
          <div>
            <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Contato</p>
            <ul className="mt-3 grid gap-1.5 text-[0.9rem]">
              {contato.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {empresa.length > 0 && (
          <div>
            <p className="font-mono text-[0.64rem] tracking-[0.05em] text-noite-apoio uppercase">Empresa</p>
            <ul className="mt-3 grid gap-1.5 text-[0.9rem] text-noite-apoio">
              {empresa.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="kit-wrap flex flex-wrap justify-between gap-3 border-t border-noite-linha py-6 font-mono text-[0.64rem] tracking-[0.04em] text-noite-apoio uppercase">
        <span>
          © {new Date().getFullYear()} {negocio.nome}
        </span>
        <span>Documento confidencial · {proposta.referencia}</span>
      </div>
    </footer>
  );
}
