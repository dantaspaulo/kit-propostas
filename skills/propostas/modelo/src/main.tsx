import { createRoot } from "react-dom/client";
import { App } from "@/App";

// O CSS é gerado pelo Tailwind no build.mjs e entra embutido no HTML; aqui é só o React.
// ?pdf liga o modo PDF (scripts/pdf.cjs): tudo aberto, sem botões e sem animação de entrada.
if (new URLSearchParams(location.search).has("pdf")) document.documentElement.classList.add("modo-pdf");

createRoot(document.getElementById("root")!).render(<App />);
