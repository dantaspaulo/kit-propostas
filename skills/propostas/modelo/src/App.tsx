import { OpcaoProvider } from "@/estado";
import { Topo } from "@/sections/topo";
import { Hero } from "@/sections/hero";
import { Solucao } from "@/sections/solucao";
import { Escopo } from "@/sections/escopo";
import { Etapas } from "@/sections/etapas";
import { Opcoes } from "@/sections/opcoes";
import { Custos } from "@/sections/custos";
import { Condicoes } from "@/sections/condicoes";
import { Duvidas } from "@/sections/duvidas";
import { Chamada } from "@/sections/chamada";
import { Rodape } from "@/sections/rodape";
import { BarraAceite } from "@/components/kit/barra-aceite";

// A ordem segue as perguntas do cliente: o topo já responde como, em quanto tempo e por quanto, e cada
// seção abaixo aprofunda uma resposta. Página objetiva: o que não ajuda a decidir fica fora.
export function App() {
  return (
    <OpcaoProvider>
      <Topo />
      <main>
        <Hero />
        <Solucao />
        <Escopo />
        <Etapas />
        <Opcoes />
        <Custos />
        <Condicoes />
        <Duvidas />
        <Chamada />
      </main>
      <Rodape />
      <BarraAceite />
    </OpcaoProvider>
  );
}
