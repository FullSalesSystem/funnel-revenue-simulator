import type { Metadata } from "next";
import { DiagnosticoClient } from "./DiagnosticoClient";

export const metadata: Metadata = {
  title: "Avaliação Metabólica do Emagrecimento",
  description:
    "Avaliação personalizada baseada em marcadores sanguíneos, hábitos e literatura científica. Identifique os principais obstáculos ao seu emagrecimento.",
};

export default function DiagnosticoPage() {
  return (
    <main className="min-h-screen bg-[#0b0f1a] text-[#f9fafb]">
      <DiagnosticoClient />
    </main>
  );
}
