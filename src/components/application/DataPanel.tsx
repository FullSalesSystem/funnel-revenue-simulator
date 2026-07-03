'use client';

import React from 'react';
import { ApplicationInputs } from '@/calculations/applicationFunnel';
import { inputClass } from './shared';

interface DataPanelProps {
  inputs: ApplicationInputs;
  onChange: (field: keyof ApplicationInputs, value: number) => void;
  onQuestionChange: (id: number, value: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (id: number) => void;
  onReset: () => void;
  warnings: string[];
}

function Field({
  label,
  value,
  onChange,
  prefix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-400">
        {label}
        {prefix && <span className="ml-1 text-gray-600">{prefix}</span>}
      </label>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className={inputClass}
      />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function DataPanel({
  inputs,
  onChange,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onReset,
  warnings,
}: DataPanelProps) {
  return (
    <div className="space-y-4">
      <Group title="Investimento & Oferta">
        <Field label="Investimento em Mídia" prefix="R$" step={100} value={inputs.investment} onChange={(v) => onChange('investment', v)} />
        <Field label="Ticket Médio" prefix="R$" step={100} value={inputs.averageTicket} onChange={(v) => onChange('averageTicket', v)} />
      </Group>

      <Group title="Tráfego">
        <Field label="Impressões" step={1000} value={inputs.impressions} onChange={(v) => onChange('impressions', v)} />
        <Field label="Cliques" step={10} value={inputs.clicks} onChange={(v) => onChange('clicks', v)} />
        <Field label="Visualizações de Página" step={10} value={inputs.pageViews} onChange={(v) => onChange('pageViews', v)} />
      </Group>

      <Group title="Aplicação">
        <Field label="Iniciaram a Aplicação" step={10} value={inputs.applicationStarts} onChange={(v) => onChange('applicationStarts', v)} />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Responderam cada pergunta</span>
            <button
              type="button"
              onClick={onAddQuestion}
              className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              + pergunta
            </button>
          </div>
          <div className="space-y-1.5">
            {inputs.questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-1.5">
                <span className="w-9 shrink-0 text-[10px] font-semibold uppercase text-gray-600">
                  P{i + 1}
                </span>
                <input
                  type="number"
                  min={0}
                  value={q.reached}
                  onChange={(e) => onQuestionChange(q.id, Math.max(0, parseFloat(e.target.value) || 0))}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(q.id)}
                  disabled={inputs.questions.length <= 1}
                  className="shrink-0 rounded-md px-1.5 py-1 text-xs text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  aria-label={`Remover pergunta ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Cadastros (aplicações concluídas)" step={10} value={inputs.registrations} onChange={(v) => onChange('registrations', v)} />
      </Group>

      <Group title="Comercial">
        <Field label="Leads Qualificados" step={5} value={inputs.qualified} onChange={(v) => onChange('qualified', v)} />
        <Field label="Reuniões Agendadas" step={5} value={inputs.scheduled} onChange={(v) => onChange('scheduled', v)} />
        <Field label="Reuniões Realizadas (compareceram)" step={5} value={inputs.attended} onChange={(v) => onChange('attended', v)} />
        <Field label="Fechamentos" step={1} value={inputs.closed} onChange={(v) => onChange('closed', v)} />
      </Group>

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3.5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Verifique os dados
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-[11px] leading-snug text-amber-200/80">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-xs font-medium text-gray-500 transition-all hover:bg-white/[0.08] hover:text-gray-300"
      >
        Restaurar exemplo
      </button>
    </div>
  );
}
