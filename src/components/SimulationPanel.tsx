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
}

const inputGroups: { title: string; fields: InputFieldConfig[] }[] = [
  {
    title: "Investimento",
    fields: [
      { key: "impressions", label: "Impressoes", step: 1000, min: 0 },
      { key: "mediaCost", label: "Custo de Midia R$", step: 100, min: 0 },
    ],
  },
  {
    title: "Taxas de Conversao",
    fields: [
      { key: "ctr", label: "CTR %", step: 0.1, min: 0, max: 100 },
      { key: "connectionRate", label: "Taxa de Conexao %", step: 0.1, min: 0, max: 100 },
      { key: "pageConversionRate", label: "Conv. da Pagina %", step: 0.1, min: 0, max: 100 },
      { key: "checkoutConversionRate", label: "Conv. do Checkout %", step: 0.1, min: 0, max: 100 },
      { key: "appointmentRate", label: "Taxa de Agendamento %", step: 0.1, min: 0, max: 100 },
      { key: "showUpRate", label: "Taxa de Comparecimento %", step: 0.1, min: 0, max: 100 },
      { key: "closeRate", label: "Taxa de Fechamento %", step: 0.1, min: 0, max: 100 },
    ],
  },
  {
    title: "Receita",
    fields: [
      { key: "averageTicket", label: "Ticket Medio R$", step: 100, min: 0 },
    ],
  },
];

export default function SimulationPanel({ inputs, onInputChange, onReset }: SimulationPanelProps) {
  return (
    <div className="space-y-6">
      {inputGroups.map((group) => (
        <div key={group.title} className="rounded-2xl bg-gray-800 p-5 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            {group.title}
          </h3>
          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="mb-1 block text-sm font-medium text-gray-300">
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type="number"
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  value={inputs[field.key]}
                  onChange={(e) => onInputChange(field.key, parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
      >
        Resetar Valores
      </button>
    </div>
  );
}
