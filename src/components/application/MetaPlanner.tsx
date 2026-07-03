'use client';

import React, { useMemo, useState } from 'react';
import {
  ApplicationResults,
  Benchmark,
  GoalAdjustment,
  GoalScenario,
  META_TARGET,
  PLAYBOOKS,
  planForGoal,
} from '@/calculations/applicationFunnel';
import { formatCurrency, formatInteger, formatNumber } from '@/utils/formatters';
import { SectionCard, TierChip, inputClass } from './shared';

const QUICK_GOALS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

/** % sem casas decimais desnecessárias (1,5% em vez de 1,50%) */
const fmtRate = (v: number) => `${formatNumber(v, v % 1 === 0 ? 0 : 1)}%`;

export default function MetaPlanner({ results }: { results: ApplicationResults }) {
  const [goal, setGoal] = useState(100_000);

  const plan = useMemo(() => planForGoal(results, goal), [results, goal]);

  const atual = plan.scenarios[0];
  const otimo = plan.scenarios[2];
  const savings =
    atual.feasible && otimo.feasible && atual.requiredInvestment !== null && otimo.requiredInvestment !== null
      ? atual.requiredInvestment - otimo.requiredInvestment
      : null;

  const handleGoalInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setGoal(digits ? Math.min(parseInt(digits, 10), 999_000_000) : 0);
  };

  return (
    <SectionCard
      title="Planejador de Meta"
      subtitle="Digite sua meta de faturamento e veja o que o funil precisa entregar em cada etapa — e o que ajustar em cada métrica. Benchmarks: os mesmos do funil High-Ticket de aplicação."
    >
      {/* ── Input da meta ── */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-[240px]">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Meta de faturamento (R$/mês)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
              R$
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={goal > 0 ? formatInteger(goal) : ''}
              onChange={(e) => handleGoalInput(e.target.value)}
              placeholder="100.000"
              className={`${inputClass} pl-9 text-base font-bold`}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pb-0.5">
          {QUICK_GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums transition-colors ${
                goal === g
                  ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
                  : 'border-white/[0.08] bg-white/[0.03] text-gray-400 hover:border-white/[0.16] hover:text-gray-200'
              }`}
            >
              {g >= 1_000_000 ? `R$ ${g / 1_000_000} mi` : `R$ ${g / 1_000} mil`}
            </button>
          ))}
        </div>
      </div>

      {goal <= 0 || plan.ticket <= 0 ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200/90">
          {plan.ticket <= 0
            ? 'Preencha o ticket médio no painel de dados para calcular o plano.'
            : 'Digite uma meta de faturamento para gerar o plano.'}
        </p>
      ) : (
        <>
          {/* ── Tradução da meta ── */}
          <p className="mb-5 text-xs leading-relaxed text-gray-400">
            Com ticket médio de{' '}
            <span className="font-bold tabular-nums text-white">{formatCurrency(plan.ticket)}</span>, bater{' '}
            <span className="font-bold tabular-nums text-white">{formatCurrency(plan.revenueGoal)}</span> exige{' '}
            <span className="font-bold tabular-nums text-emerald-400">
              {formatInteger(plan.closesNeeded)} fechamento{plan.closesNeeded === 1 ? '' : 's'}
            </span>{' '}
            no mês{plan.planRevenue > plan.revenueGoal ? ` (entrega ${formatCurrency(plan.planRevenue)})` : ''}.
            Abaixo, três caminhos até lá:
          </p>

          {/* ── Cenários ── */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {plan.scenarios.map((sc) => (
              <PlanScenarioCard key={sc.level} scenario={sc} featured={sc.level === 'otimo'} />
            ))}
          </div>

          {savings !== null && savings > 0 && (
            <p className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3 text-xs leading-relaxed text-emerald-200/90">
              <span className="font-bold text-emerald-300">
                Otimizar antes de escalar vale {formatCurrency(savings)}/mês.{' '}
              </span>
              É a diferença de investimento entre perseguir a meta com as taxas de hoje e persegui-la com
              cada métrica no nível ótimo do benchmark. Verba não resolve taxa ruim — ela multiplica o
              desperdício junto com o resultado.
            </p>
          )}

          {/* ── Volumes por etapa ── */}
          <div className="mb-6 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Etapa
                  </th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Hoje
                  </th>
                  {plan.scenarios.map((sc) => (
                    <th
                      key={sc.level}
                      className={`px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider ${
                        sc.level === 'otimo' ? 'text-emerald-400' : 'text-gray-500'
                      }`}
                    >
                      {sc.level === 'atual' ? 'Meta c/ taxas atuais' : sc.level === 'bom' ? 'Meta no bom' : 'Meta no ótimo'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(otimo.feasible ? otimo : atual).stages.map((_, i) => {
                  const ref = (otimo.feasible ? otimo : atual).stages[i];
                  return (
                    <tr key={ref.key} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-3 py-2 text-xs font-medium text-gray-300">{ref.label}</td>
                      <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-500">
                        {formatInteger(ref.today)}
                      </td>
                      {plan.scenarios.map((sc) => (
                        <td
                          key={sc.level}
                          className={`px-3 py-2 text-right text-xs font-semibold tabular-nums ${
                            sc.level === 'otimo' ? 'text-emerald-300' : 'text-gray-300'
                          }`}
                        >
                          {sc.feasible ? formatInteger(Math.ceil(sc.stages[i].required)) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── O que ajustar ── */}
          {plan.adjustments.length > 0 ? (
            <>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">O que ajustar, métrica por métrica</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Só as métricas abaixo do “ótimo”, ordenadas pelo dinheiro que devolvem à sua meta.
                  Clique para abrir o bench e o playbook de otimização.
                </p>
              </div>
              <div className="space-y-2">
                {plan.adjustments.map((adj) => (
                  <AdjustmentRow key={adj.key} adjustment={adj} />
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-xs text-emerald-200/90">
              Todas as taxas do funil já estão no nível ótimo do benchmark — daqui pra frente, a meta é
              questão de volume (verba) e de ticket.
            </p>
          )}
        </>
      )}
    </SectionCard>
  );
}

// ─── Cenário ─────────────────────────────────────────────────────────────────

function PlanScenarioCard({ scenario, featured }: { scenario: GoalScenario; featured: boolean }) {
  if (!scenario.feasible) {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/[0.05] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-300">{scenario.label}</p>
        <p className="mt-2 text-xs leading-relaxed text-red-200/80">
          Impossível calcular: alguma taxa do funil está em 0%. Preencha todas as etapas no painel de
          dados — sem conversão em uma etapa, nenhum volume chega ao fim do funil.
        </p>
      </div>
    );
  }

  const impressions = scenario.stages[0];
  const attended = scenario.stages.find((s) => s.key === 'attended')!;

  return (
    <div
      className={`rounded-xl border p-4 ${
        featured ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${
          featured ? 'text-emerald-300' : 'text-gray-500'
        }`}
      >
        {scenario.label}
      </p>
      <p className="text-[10px] text-gray-600">{scenario.sublabel}</p>

      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-white">
        {scenario.requiredInvestment !== null ? formatCurrency(scenario.requiredInvestment) : '—'}
      </p>
      <p className="text-[10px] font-medium text-gray-600">
        {scenario.requiredInvestment !== null
          ? `investimento/mês estimado (CPM atual)${
              scenario.investmentMultiplier !== null
                ? ` · ${formatNumber(scenario.investmentMultiplier, 1)}x o atual`
                : ''
            }`
          : 'sem CPM: preencha investimento e impressões'}
      </p>

      <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-2.5">
        <PlanMiniRow
          label="Impressões"
          value={`${formatInteger(Math.ceil(impressions.required))}${
            impressions.multiplier > 0 ? ` (${formatNumber(impressions.multiplier, 1)}x)` : ''
          }`}
        />
        <PlanMiniRow label="Reuniões Realizadas" value={formatInteger(Math.ceil(attended.required))} />
        <PlanMiniRow
          label="Custo/Reunião Realizada"
          value={scenario.costPerAttended !== null ? formatCurrency(scenario.costPerAttended) : '—'}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">Relação {META_TARGET}x</span>
          {scenario.metaRatio !== null ? (
            <span
              className={`text-[11px] font-bold tabular-nums ${
                scenario.metaOk ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {formatNumber(scenario.metaRatio, 1)}x {scenario.metaOk ? '✓' : `(meta: ${META_TARGET}x)`}
            </span>
          ) : (
            <span className="text-[11px] text-gray-600">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanMiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-gray-600">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums text-gray-300">{value}</span>
    </div>
  );
}

// ─── Ajuste por métrica ──────────────────────────────────────────────────────

function AdjustmentRow({ adjustment }: { adjustment: GoalAdjustment }) {
  const [open, setOpen] = useState(false);
  const playbook = PLAYBOOKS[adjustment.playbookKey];

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.12]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left"
      >
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
            <p className="text-xs font-semibold text-white">{adjustment.label}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[11px] font-bold tabular-nums text-gray-300">
                {fmtRate(adjustment.current)}
              </span>
              <TierChip tier={adjustment.tier} />
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600">Alvo do bench</p>
          <p className="text-[11px] font-bold tabular-nums text-gray-300">
            bom ≥ {fmtRate(adjustment.targetGood)}{' '}
            <span className="text-emerald-400">· ótimo ≥ {fmtRate(adjustment.targetExcellent)}</span>
          </p>
        </div>

        {adjustment.investmentSaved !== null && adjustment.investmentSaved > 0 && (
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-600">
              Devolve à meta
            </p>
            <p className="text-sm font-bold tabular-nums text-emerald-400">
              {formatCurrency(adjustment.investmentSaved)}/mês
              {adjustment.impressionsReduction !== null && (
                <span className="text-[10px] font-medium text-gray-500">
                  {' '}
                  (−{formatNumber(adjustment.impressionsReduction, 0)}% impressões)
                </span>
              )}
            </p>
          </div>
        )}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#0b0f1a]/50 px-4 py-4 sm:px-5">
          <BenchStrip benchmark={adjustment.benchmark} current={adjustment.current} />
          {playbook && (
            <>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Faixa do benchmark (mesmos tiers do funil High-Ticket) com marcador de onde o cliente está */
function BenchStrip({ benchmark, current }: { benchmark: Benchmark; current: number }) {
  const tiers: { label: string; range: string; cls: string; active: boolean }[] = [
    {
      label: 'Ruim',
      range: `< ${fmtRate(benchmark.bad.max)}`,
      cls: 'border-red-500/25 bg-red-500/10 text-red-300',
      active: current < (benchmark.acceptable?.min ?? benchmark.good.min),
    },
    ...(benchmark.acceptable
      ? [
          {
            label: 'Aceitável',
            range: `${fmtRate(benchmark.acceptable.min)}–${fmtRate(benchmark.acceptable.max)}`,
            cls: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
            active: current >= benchmark.acceptable.min && current < benchmark.good.min,
          },
        ]
      : []),
    {
      label: 'Bom',
      range: `${fmtRate(benchmark.good.min)}–${fmtRate(benchmark.good.max)}`,
      cls: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
      active: current >= benchmark.good.min && current < benchmark.excellent.min,
    },
    {
      label: 'Ótimo',
      range: `≥ ${fmtRate(benchmark.excellent.min)}`,
      cls: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
      active: current >= benchmark.excellent.min,
    },
  ];

  return (
    <div>
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-gray-600">
        Bench (funil High-Ticket) · você está em{' '}
        <span className="font-bold text-gray-300">{fmtRate(current)}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map((t) => (
          <span
            key={t.label}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold tabular-nums ${t.cls} ${
              t.active ? 'ring-1 ring-inset ring-current' : 'opacity-50'
            }`}
          >
            {t.active && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {t.label} {t.range}
          </span>
        ))}
      </div>
    </div>
  );
}
