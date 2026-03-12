"use client";

import { FunnelInputs } from "@/calculations/funnelEngine";

interface SimulationPanelProps {
  inputs: FunnelInputs;
  onInputChange: (key: keyof FunnelInputs, value: number) => void;
  onReset: () => void;
}

interface InputFieldConfig {
  key: keyof FunnelInputs;
  label: string;
  step: number;
  min?: number;
  max?: number;
  suffix?: string;
}

const inputGroups: { title: string; icon: string; fields: InputFieldConfig[] }[] = [
  {
    title: "Investimento",
    icon: "💰",
    fields: [
      { key: "impressions", label: "Impressoes", step: 1000, min: 0 },
      { key: "mediaCost", label: "Custo de Midia", step: 100, min: 0, suffix: "R$" },
    ],
  },
  {
    title: "Taxas de Conversao",
    icon: "📊",
    fields: [
      { key: "ctr", label: "CTR", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "connectionRate", label: "Taxa de Conexao", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "pageConversionRate", label: "Conv. da Pagina", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "checkoutConversionRate", label: "Conv. do Checkout", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "appointmentRate", label: "Taxa de Agendamento", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "showUpRate", label: "Taxa de Comparecimento", step: 0.1, min: 0, max: 100, suffix: "%" },
      { key: "closeRate", label: "Taxa de Fechamento", step: 0.1, min: 0, max: 100, suffix: "%" },
    ],
  },
  {
    title: "Receita",
    icon: "🎯",
    fields: [
      { key: "averageTicket", label: "Ticket Medio", step: 100, min: 0, suffix: "R$" },
    ],
  },
];

export default function SimulationPanel({ inputs, onInputChange, onReset }: SimulationPanelProps) {
  return (
    <div className="space-y-4">
      {inputGroups.map((group) => (
        <div key={group.title} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            {group.title}
          </h3>
          <div className="space-y-3">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="mb-1 block text-xs font-medium text-gray-400">
                  {field.label}
                  {field.suffix && <span className="text-gray-600 ml-1">{field.suffix}</span>}
                </label>
                <input
                  id={field.key}
                  type="number"
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  value={inputs[field.key]}
                  onChange={(e) => onInputChange(field.key, parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all hover:border-white/[0.12]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-2 text-xs font-medium text-gray-500 transition-all hover:bg-white/[0.08] hover:text-gray-300"
      >
        Resetar Valores
      </button>
    </div>
  );
}
