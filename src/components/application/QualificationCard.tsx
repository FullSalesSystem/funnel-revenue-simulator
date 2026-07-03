'use client';

import React, { useState } from 'react';
import { ApplicationResults } from '@/calculations/applicationFunnel';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { SectionCard, TierChip, inputClass } from './shared';

/**
 * CPL ↔ Taxa de Qualificação ↔ CPLQ
 * A relação é: CPLQ = CPL ÷ Taxa de Qualificação
 * O card mostra a conta nos dois sentidos, com dois mini-calculadores.
 */
export default function QualificationCard({ results }: { results: ApplicationResults }) {
  const cpl = results.costsByKey['costPerLead']?.value ?? 0;
  const cplq = results.costsByKey['costPerQualified']?.value ?? 0;
  const qualRate = results.ratesByKey.qualification.value;

  const [simRate, setSimRate] = useState<number>(Math.round(qualRate * 10) / 10 || 35);
  const [targetCplq, setTargetCplq] = useState<number>(Math.round(cplq) || 100);

  const cplqFromRate = simRate > 0 ? cpl / (simRate / 100) : 0;
  const rateFromCplq = targetCplq > 0 ? (cpl / targetCplq) * 100 : 0;

  return (
    <SectionCard
      title="Qualificação: CPL ↔ CPLQ"
      subtitle="A taxa de qualificação liga o custo por lead ao custo por lead qualificado — nos dois sentidos."
    >
      {/* a equação com os números atuais */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/[0.06] bg-[#0b0f1a]/60 px-4 py-4">
        <EquationBlock label="CPL" value={formatCurrency(cpl)} />
        <span className="text-lg font-light text-gray-600">÷</span>
        <EquationBlock
          label="Taxa de Qualificação"
          value={formatPercent(qualRate)}
          chip={<TierChip tier={results.ratesByKey.qualification.tier} />}
        />
        <span className="text-lg font-light text-gray-600">=</span>
        <EquationBlock label="CPLQ" value={formatCurrency(cplq)} highlight />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* sentido 1: taxa → CPLQ */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Se a taxa de qualificação for…
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={simRate}
              onChange={(e) => setSimRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              className={`${inputClass} !w-24`}
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            …com o CPL atual de {formatCurrency(cpl)}, cada lead qualificado custa{' '}
            <span className="text-base font-bold tabular-nums text-white">
              {formatCurrency(cplqFromRate)}
            </span>
          </p>
        </div>

        {/* sentido 2: CPLQ alvo → taxa necessária */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Para um CPLQ alvo de…
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">R$</span>
            <input
              type="number"
              min={1}
              step={10}
              value={targetCplq}
              onChange={(e) => setTargetCplq(Math.max(0, parseFloat(e.target.value) || 0))}
              className={`${inputClass} !w-28`}
            />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            …a taxa de qualificação precisa ser de pelo menos{' '}
            <span
              className={`text-base font-bold tabular-nums ${
                rateFromCplq > 100 ? 'text-red-400' : 'text-white'
              }`}
            >
              {formatPercent(rateFromCplq)}
            </span>
            {rateFromCplq > 100 && (
              <span className="mt-1 block text-[10px] text-red-400">
                Impossível com o CPL atual — primeiro reduza o CPL para no máximo{' '}
                {formatCurrency(targetCplq)}.
              </span>
            )}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function EquationBlock({
  label,
  value,
  chip,
  highlight = false,
}: {
  label: string;
  value: string;
  chip?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">{label}</span>
      <span
        className={`text-lg font-bold tabular-nums ${highlight ? 'text-indigo-300' : 'text-white'}`}
      >
        {value}
      </span>
      {chip}
    </div>
  );
}
