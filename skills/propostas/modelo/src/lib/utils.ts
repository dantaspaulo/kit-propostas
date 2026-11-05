// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Quantidade por extenso, de 1 a 4, no gênero da palavra: "duas opções", "dois níveis". */
export const quantos = (n: number, genero: "f" | "m") =>
  (genero === "f" ? ["zero", "uma", "duas", "três", "quatro"] : ["zero", "um", "dois", "três", "quatro"])[n] ?? String(n);

/** Junta com vírgulas e "e" no fim: "a, b e c". */
export const lista = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} e ${xs.at(-1)}` : (xs[0] ?? ""));

/** Muda só a primeira letra: "r$ 7.000" nunca acontece. */
export const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
export const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const reais = (v: number, casas = 2) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: casas, maximumFractionDigits: casas });

export const dataLonga = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
export const somarDias = (d: Date, dias: number) => new Date(d.getTime() + dias * 86400000);
export const dataIso = (d: Date) => d.toLocaleDateString("sv-SE");

/** Numeração das dúvidas e das etapas: 01, 02, ..., 10. */
export const dois = (n: number) => String(n).padStart(2, "0");

/** O modo PDF é ligado pelo ?pdf na abertura (scripts/pdf.cjs): tudo aparece pronto, sem animação. */
export const modoPdf = () => typeof document !== "undefined" && document.documentElement.classList.contains("modo-pdf");
