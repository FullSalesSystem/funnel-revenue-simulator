'use client';

import React, { useState } from 'react';
import {
  ApplicationResults,
  META_TARGET,
  PLAYBOOKS,
  Feasibility,
  Lever,
  analyzeTicketPricing,
  computeLevers,
  projectAllAt,
} from '@/calculations/applicationFunnel';
import { formatCurrency, formatInteger, formatPercent } from '@/utils/formatters';
import { SectionCard, TierChip } from './shared';

const FEASIBILITY_META: Record<Feasibility, { label: string; cls: string }> = {
  'ja-bateu': { label: 'meta já batida', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  realista: { label: 'alcançável (dentro do ótimo)', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  agressivo: { label: 'agressivo — combine alavancas', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
  inviavel: { label: 'impossível sozinha', cls: 'bg-red-500/10 text-red-300 border-red-500/25' },
};

export default function GoalPlan({ results }: { results: ApplicationResults }) {
  const levers = computeLevers(results);
  const allGood = projectAllAt(results, 'good');
  const allExcellent = projectAllAt(results, 'excellent');
  const pricing = analyzeTicketPricing(results.ratesByKey.close.value);

  return (
    <SectionCard
      title="Plano para Bater a Meta"
      subtitle={`Cada alavanca abaixo mostra o que acontece com a relação 7x se você levá-la ao nível "ótimo" — e qual valor seria necessário para bater a meta só com ela. Priorizado por impacto.`}
    >
      {/* ── Cenários: Atual vs Tudo Bom vs Tudo Ótimo ── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <ScenarioCard
          title="Cenário Atual"
          subtitle="seus números de hoje"
          ratio={results.metaRatio}
          revenue={results.revenue}
          closed={results.inputs.closed}
          costPerAttended={results.costPerAttended}
          muted
        />
        <ScenarioCard
          title="Tudo no Bom"
          subtitle="cada taxa no piso do benchmark bom"
          ratio={allGood.metaRatio}
          revenue={allGood.revenue}
          closed={allGood.closed}
          costPerAttended={allGood.costPerAttended}
        />
        <ScenarioCard
          title="Tudo no Ótimo"
          subtitle="cada taxa no piso do benchmark ótimo"
          ratio={allExcellent.metaRatio}
          revenue={allExcellent.revenue}
          closed={allExcellent.closed}
          costPerAttended={allExcellent.costPerAttended}
          featured
        />
      </div>

      <p className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3 text-xs leading-relaxed text-indigo-200/90">
        <span className="font-bold text-indigo-200">A diferença entre “bom” e “ótimo” é o jogo. </span>
        Com as mesmas impressões e o mesmo investimento, o funil com métricas ótimas gera{' '}
        <span className="font-bold tabular-nums">{formatCurrency(allExcellent.revenue)}</span> contra{' '}
        <span className="font-bold tabular-nums">{formatCurrency(allGood.revenue)}</span> do funil “apenas bom” —{' '}
        {allGood.revenue > 0 && (
          <span className="font-bold tabular-nums">
            {(allExcellent.revenue / allGood.revenue).toFixed(1).replace('.', ',')}x mais receita
          </span>
        )}{' '}
        sem gastar um real a mais em mídia. O efeito é composto (cada taxa multiplica as seguintes),
        então trate esses cenários como teto de referência — na prática, otimize 1–2 alavancas por vez.
      </p>

      {/* ── Precificação ── */}
      {pricing.isUnderpriced && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
          <span className="mt-0.5 text-amber-400">⚠</span>
          <div>
            <p className="text-xs font-bold text-amber-300">
              Ticket provavelmente {pricing.multiplierRange} abaixo do ideal
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-200/80">{pricing.message}</p>
          </div>
        </div>
      )}

      {/* ── Alavancas ── */}
      <div className="space-y-2">
        {levers.map((lever) => (
          <LeverRow key={lever.key} lever={lever} results={results} />
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Cenário ─────────────────────────────────────────────────────────────────

function ScenarioCard({
  title,
  subtitle,
  ratio,
  revenue,
  closed,
  costPerAttended,
  muted = false,
  featured = false,
}: {
  title: string;
  subtitle: string;
  ratio: number;
  revenue: number;
  closed: number;
  costPerAttended: number;
  muted?: boolean;
  featured?: boolean;
}) {
  const ok = ratio >= META_TARGET;
  return (
    <div
      className={`rounded-xl border p-4 ${
        featured
          ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-wider ${featured ? 'text-emerald-300' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className="text-[10px] text-gray-600">{subtitle}</p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${
          ok ? 'text-emerald-400' : muted ? 'text-gray-300' : 'text-amber-400'
        }`}
      >
        {ratio.toFixed(1).replace('.', ',')}x
      </p>
      <p className="text-[10px] font-medium text-gray-600">
        {ok ? '✓ bate a meta de 7x' : `abaixo da meta de ${META_TARGET}x`}
      </p>
      <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-2.5">
        <MiniRow label="Receita" value={formatCurrency(revenue)} />
        <MiniRow label="Fechamentos" value={formatInteger(Math.round(closed))} />
        <MiniRow label="Custo/Reunião Realizada" value={formatCurrency(costPerAttended)} />
      </div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-gray-600">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums text-gray-300">{value}</span>
    </div>
  );
}

// ─── Alavanca ────────────────────────────────────────────────────────────────

function LeverRow({ lever, results }: { lever: Lever; results: ApplicationResults }) {
  const [open, setOpen] = useState(false);
  const playbook = PLAYBOOKS[lever.playbookKey];
  const feas = FEASIBILITY_META[lever.soloFeasibility];
  const alreadyExcellent = lever.isRate && lever.tier === 'otimo';

  const fmtValue = (v: number) =>
    lever.isRate ? formatPercent(v) : formatCurrency(v);

  return (
    <div
      id={`playbook-${lever.playbookKey}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.12]"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left"
      >
        {/* nome + status */}
        <div className="flex min-w-[180px] flex-1 items-center gap-2.5">
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-white">{lever.label}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[11px] font-bold tabular-nums text-gray-300">
                {fmtValue(lever.currentValue)}
              </span>
              {lever.tier && <TierChip tier={lever.tier} />}
              {alreadyExcellent && (
                <span className="text-[10px] text-gray-600">já está no ótimo</span>
              )}
            </div>
          </div>
        </div>

        {/* impacto no ótimo */}
        {lever.isRate && !alreadyExcellent && lever.ratioAtExcellent !== null && (
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600">
              No ótimo ({`≥ ${lever.excellentTarget}%`})
            </p>
            <p
              className={`text-sm font-bold tabular-nums ${
                lever.ratioAtExcellent >= META_TARGET ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              relação vira {lever.ratioAtExcellent.toFixed(1).replace('.', ',')}x
              {lever.ratioAtExcellent >= META_TARGET && ' ✓'}
            </p>
          </div>
        )}

        {/* necessário para meta sozinha */}
        {!results.metaOk && (
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600">
              P/ meta só com ela
            </p>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-bold tabular-nums text-white">
                {lever.soloRequired <= (lever.isRate ? 100 : Infinity)
                  ? fmtValue(lever.soloRequired)
                  : '—'}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${feas.cls}`}>
                {feas.label}
              </span>
            </div>
          </div>
        )}
      </button>

      {/* playbook */}
      {open && playbook && (
        <div className="border-t border-white/[0.06] bg-[#0b0f1a]/50 px-4 py-4 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            {playbook.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{playbook.diagnosis}</p>
          <ul className="mt-3 space-y-2">
            {playbook.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-300">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[9px] font-bold text-indigo-300">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
