// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
// A marca do negócio, com tipo. O arquivo src/marca.json é gerado pelo aplicar-marca a partir do perfil.
import dados from "@/marca.json";

export type Marca = {
  negocio: {
    nome: string;
    razaoSocial: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    site: string;
    email: string;
    whatsapp: string;
    whatsappVisivel: string;
    assinatura: { nome: string; cargo: string };
    sigla: string;
  };
  cores: Record<string, string>;
  fontes: { texto: string; titulo: string; mono: string; serifa: string; url: string };
  logo: string | null;
  logoClaro: string | null;
  favicon: string;
  comercial: { validadeDias: number; pagamento: string; notaFiscal: boolean; garantiaDias: number; sustentacao: string };
};

export const marca = dados as unknown as Marca;
