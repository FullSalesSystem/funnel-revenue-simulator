'use client';

import React from 'react';
import {
  ApplicationResults,
  META_TARGET,
  getOverallHealth,
} from '@/calculations/applicationFunnel';
import { formatCurrency } from '@/utils/formatters';

const STATUS_STYLES = {
  validado: {
    ring: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/25',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    number: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  'quase-la': {
    ring: 'from-amber-500/20 via-amber-500/5 to-transparent',
    border: 'border-amber-500/25',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    number: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  atencao: {
    ring: 'from-amber-500/20 via-amber-500/5 to-transparent',
    border: 'border-amber-500/25',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    number: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  critico: {
    ring: 'from-red-500/20 via-red-500/5 to-transparent',
    border: 'border-red-500/25',
    badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    number: 'text-red-400',
    bar: 'bg-red-400',
  },
} as const;

const STATUS_LABEL = {
  validado: 'Meta batida',
  'quase-la': 'Quase lá',
  atencao: 'Atenção',
  critico: 'Crítico',
} as const;

export default function MetaHero({ results }: { results: ApplicationResults }) {
  const health = getOverallHealth(results);
  const s = STATUS_STYLES[health.status];
  const ratio = results.metaRatio;
  // barra vai de 0 a 10x para dar contexto de "passou da meta"
  const barMax = 10;
  const fillPct = Math.min(100, (ratio / barMax) * 100);
  const targetPct = (META_TARGET / barMax) * 100;
  const missingPct = ratio > 0 && ratio < META_TARGET ? (META_TARGET / ratio - 1) * 100 : 0;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border ${s.border} bg-white/[0.03]`}
    >
      {/* atmosfera */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.ring}`} />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative grid gap-6 p-6 sm:p-7 lg:grid-cols-[1.2fr_1fr]">
        {/* ── Lado esquerdo: a meta ── */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              Meta nº 1
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.bar} ${health.status !== 'validado' ? 'animate-pulse' : ''}`} />
              {STATUS_LABEL[health.status]}
            </span>
          </div>

          <p className="text-sm leading-snug text-gray-400">
            O faturamento por reunião realizada precisa ser{' '}
            <span className="font-semibold text-white">pelo menos 7x maior</span> que o custo por
            reunião realizada.
          </p>

          <div className="mt-4 flex items-end gap-3">
            <span className={`text-6xl font-bold leading-none tracking-tighter tabular-nums ${s.number}`}>
              {ratio.toFixed(1).replace('.', ',')}x
            </span>
            <div className="mb-1.5">
              <p className="text-xs font-medium text-gray-500">meta: {META_TARGET}x</p>
              {!results.metaOk && missingPct > 0 && (
                <p className="text-xs font-semibold text-gray-300">
                  falta +{missingPct.toFixed(0)}% de resultado
                </p>
              )}
              {results.metaOk && (
                <p className="text-xs font-semibold text-emerald-300">
                  {((ratio / META_TARGET - 1) * 100).toFixed(0)}% acima da meta
                </p>
              )}
            </div>
          </div>

          {/* régua até a meta */}
          <div className="mt-4">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${s.bar} transition-all duration-700`}
                style={{ width: `${fillPct}%` }}
              />
              {/* marcador da meta */}
              <div
                className="absolute top-0 h-full w-[2px] bg-white/80"
                style={{ left: `${targetPct}%` }}
              />
            </div>
            <div className="relative mt-1 h-4 text-[10px] font-medium text-gray-600">
              <span className="absolute left-0">0x</span>
              <span className="absolute -translate-x-1/2 text-gray-300" style={{ left: `${targetPct}%` }}>
                7x meta
              </span>
              <span className="absolute right-0">10x+</span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-400">{health.message}</p>
        </div>

        {/* ── Lado direito: as duas métricas da meta + ROAS ── */}
        <div className="flex flex-col justify-center gap-3">
          <div className="grid grid-cols-2 gap-3">
            <HeroTile
              label="Custo por Reunião Realizada"
              value={formatCurrency(results.costPerAttended)}
              hint={
                results.revenue > 0
                  ? `máx. p/ meta: ${formatCurrency(results.revenuePerAttended / META_TARGET)}`
                  : undefined
              }
              tone={results.metaOk ? 'good' : 'bad'}
            />
            <HeroTile
              label="Faturamento por Reunião Realizada"
              value={formatCurrency(results.revenuePerAttended)}
              hint={`mín. p/ meta: ${formatCurrency(results.costPerAttended * META_TARGET)}`}
              tone="neutral"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeroTile
              label="Receita Total"
              value={formatCurrency(results.revenue)}
              hint={`${results.inputs.closed} fechamento(s) × ${formatCurrency(results.inputs.averageTicket)}`}
              tone="neutral"
            />
            <HeroTile
              label="ROAS"
              value={`${results.roas.toFixed(2).replace('.', ',')}x`}
              hint="nesse funil, ROAS = a própria meta 7x"
              tone={results.roas >= META_TARGET ? 'good' : 'neutral'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: 'good' | 'bad' | 'neutral';
}) {
  const valueColor =
    tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0b0f1a]/60 p-3.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1.5 text-lg font-bold tracking-tight tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1 text-[10px] leading-snug text-gray-600">{hint}</p>}
    </div>
  );
}
