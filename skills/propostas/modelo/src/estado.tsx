// Kit de Propostas · Paulo Sérgio Dantas · github.com/dantaspaulo/kit-propostas · KPR-PSD-2026
import { createContext, useContext, useState, type ReactNode } from "react";
import { recomendada } from "@/data";

// A opção em foco vale para a página toda: escolher uma no investimento destaca a mesma coluna no escopo
// e o mesmo prazo nas etapas. A página abre na recomendada (que, na âncora acima, fica no meio).
type Estado = { ativa: number; setAtiva: (i: number) => void };
const Ctx = createContext<Estado>({ ativa: recomendada, setAtiva: () => {} });

export function OpcaoProvider({ children }: { children: ReactNode }) {
  const [ativa, setAtiva] = useState<number>(recomendada);
  return <Ctx.Provider value={{ ativa, setAtiva }}>{children}</Ctx.Provider>;
}

export const useOpcao = () => useContext(Ctx);
