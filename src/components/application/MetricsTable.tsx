'use client';

import React from 'react';
import {
  ApplicationResults,
  PAGE_CONVERSION_BENCHMARK,
} from '@/calculations/applicationFunnel';
import { formatCurrency, formatInteger, formatPercent } from '@/utils/formatters';
import { SectionCard, TierChip } from './shared';

export default function MetricsTable({ results }: { results: ApplicationResults }) {
  const { inputs } = results;

  const absolutes: { label: string; value: number }[] = [
    { label: 'Impressões', value: inputs.impressions },
    { label: 'Cliques', value: inputs.clicks },
    { label: 'Visualizações de Página', value: inputs.pageViews },
    { label: 'Iniciaram a Aplicação', value: inputs.applicationStarts },
    { label: 'Cadastros', value: inputs.registrations },
    { label: 'Leads Qualificados (estimado)', value: results.qualified },
    { label: 'Reuniões Agendadas', value: inputs.scheduled },
    { label: 'Reuniões Realizadas', value: inputs.attended },
    { label: 'Fechamentos', value: inputs.closed },
  ];

  return (
    <SectionCard
      title="Matriz de Métricas"
      subtitle="Todas as métricas primárias e secundárias do funil: volumes absolutos, taxas relativas com alvo bom/ótimo, e custos com o teto para a meta 7x."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Absolutas ── */}
        <div>
          <GroupTitle>Métricas Absolutas</GroupTitle>
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            {absolutes.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-3.5 py-2 ${
                  i % 2 === 1 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <span className="text-xs text-gray-400">{row.label}</span>
                <span className="text-xs font-bold tabular-nums text-white">
                  {formatInteger(row.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-emerald-500/[0.05] px-3.5 py-2">
              <span className="text-xs font-medium text-emerald-300">Receita Total</span>
              <span className="text-xs font-bold tabular-nums text-emerald-400">
                {formatCurrency(results.revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Relativas ── */}
        <div>
          <GroupTitle>Métricas Relativas (taxas)</GroupTitle>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full min-w-[380px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[9px] font-semibold uppercase tracking-wider text-gray-600">
                  <th className="px-3.5 py-2 font-semibold">Métrica</th>
                  <th className="px-2 py-2 text-right font-semibold">Atual</th>
                  <th className="px-2 py-2 text-right font-semibold">Bom</th>
                  <th className="px-2 py-2 text-right font-semibold">Ótimo</th>
                  <th className="px-3.5 py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.rates.map((r, i) => (
                  <tr key={r.key} className={i % 2 === 1 ? 'bg-white/[0.02]' : ''}>
                    <td className="px-3.5 py-2">
                      <p className="text-xs text-gray-300">{r.shortLabel}</p>
                      <p className="text-[9px] text-gray-600">
                        {r.fromLabel} → {r.toLabel}
                      </p>
                    </td>
                    <td className="px-2 py-2 text-right text-xs font-bold tabular-nums text-white">
                      {formatPercent(r.value)}
                    </td>
                    <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-500">
                      {r.isAssumption ? '—' : `≥ ${r.benchmark.good.min}%`}
                    </td>
                    <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-500">
                      {r.isAssumption ? '—' : `≥ ${r.benchmark.excellent.min}%`}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      {r.isAssumption ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                          Premissa
                        </span>
                      ) : (
                        <TierChip tier={r.tier} />
                      )}
                    </td>
                  </tr>
                ))}
                {/* secundárias */}
                <tr className="border-t border-white/[0.06] bg-white/[0.02]">
                  <td className="px-3.5 py-2">
                    <p className="text-xs text-gray-300">Conversão da Página</p>
                    <p className="text-[9px] text-gray-600">Visualizações → Cadastros</p>
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-bold tabular-nums text-white">
                    {formatPercent(results.pageConversionRate)}
                  </td>
                  <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-500">
                    ≥ {PAGE_CONVERSION_BENCHMARK.good.min}%
                  </td>
                  <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-500">
                    ≥ {PAGE_CONVERSION_BENCHMARK.excellent.min}%
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <TierChip tier={results.pageConversionTier} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Custos ── */}
      <div className="mt-6">
        <GroupTitle>Métricas de Custo</GroupTitle>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {results.costs.map((c) => (
            <div
              key={c.key}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12]"
            >
              <p className="min-h-[2rem] text-[10px] font-medium leading-tight text-gray-500">
                {c.label}
              </p>
              <p className="mt-1 text-base font-bold tabular-nums text-white">
                {c.key === 'costPerImpression'
                  ? `R$ ${c.value.toFixed(4).replace('.', ',')}`
                  : formatCurrency(c.value)}
              </p>
              {c.maxForGoal != null && (
                <p
                  className={`mt-0.5 text-[10px] font-medium tabular-nums ${
                    c.withinGoal ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {c.withinGoal ? '✓ dentro da meta' : '✗ acima do teto'} · máx{' '}
                  {c.key === 'costPerImpression'
                    ? `R$ ${c.maxForGoal.toFixed(4).replace('.', ',')}`
                    : formatCurrency(c.maxForGoal)}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-gray-600">
          O teto de cada custo é calculado a partir da meta: com a receita atual de{' '}
          {formatCurrency(results.revenue)}, o investimento máximo saudável é{' '}
          {formatCurrency(results.idealInvestment)} (receita ÷ 7). Acima disso, a relação 7x quebra.
        </p>
      </div>
    </SectionCard>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
      {children}
    </h3>
  );
}
