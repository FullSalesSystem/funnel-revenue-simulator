'use client';

import React from 'react';
import { ApplicationResults, getTierColor } from '@/calculations/applicationFunnel';
import { formatCurrency, formatInteger, formatPercent } from '@/utils/formatters';
import { SectionCard } from './shared';

// rampa sequencial de um só matiz (azul → índigo), do topo ao fundo do funil
const LAYER_COLORS = [
  'from-sky-400/70 to-sky-500/55',
  'from-sky-500/70 to-blue-500/55',
  'from-blue-500/70 to-blue-600/55',
  'from-blue-600/70 to-indigo-500/55',
  'from-indigo-500/70 to-indigo-600/55',
  'from-indigo-600/75 to-indigo-700/60',
  'from-indigo-700/80 to-indigo-800/65',
  'from-indigo-800/85 to-indigo-900/70',
  'from-indigo-900/90 to-slate-900/80',
];

interface Layer {
  key: string;
  label: string;
  volume: number;
  costKey: string;
  costLabel: string;
}

export default function FunnelBoard({ results }: { results: ApplicationResults }) {
  const { inputs, ratesByKey, costsByKey } = results;

  const layers: Layer[] = [
    { key: 'impressions', label: 'Impressões', volume: inputs.impressions, costKey: 'cpm', costLabel: 'CPM' },
    { key: 'clicks', label: 'Cliques', volume: inputs.clicks, costKey: 'cpc', costLabel: 'CPC' },
    { key: 'pageViews', label: 'Visualizações de Página', volume: inputs.pageViews, costKey: 'costPerPageView', costLabel: 'Custo/Visualização' },
    { key: 'starts', label: 'Iniciaram a Aplicação', volume: inputs.applicationStarts, costKey: 'costPerStart', costLabel: 'Custo/Início' },
    { key: 'registrations', label: 'Cadastros', volume: inputs.registrations, costKey: 'costPerLead', costLabel: 'CPL' },
    { key: 'qualified', label: 'Leads Qualificados (estimado)', volume: results.qualified, costKey: 'costPerQualified', costLabel: 'CPLQ' },
    { key: 'scheduled', label: 'Reuniões Agendadas', volume: inputs.scheduled, costKey: 'costPerScheduled', costLabel: 'Custo/Agendada' },
    { key: 'attended', label: 'Reuniões Realizadas', volume: inputs.attended, costKey: 'costPerAttended', costLabel: 'Custo/Realizada' },
    { key: 'closed', label: 'Fechamentos', volume: inputs.closed, costKey: 'costPerClose', costLabel: 'CPA' },
  ];

  // taxa entre a camada i-1 e i (índice 1..8 → RATE_DEFS 0..7)
  const rateForGap = (i: number) => results.rates[i - 1];

  const widths = layers.map((_, i) => 100 - i * 7.5);

  return (
    <SectionCard
      title="Funil Completo"
      subtitle="Cada etapa com volume absoluto, taxa de conversão vs. etapa anterior e custo por resultado. O custo máximo é o teto para a meta 7x com os volumes atuais."
    >
      <div className="flex flex-col items-center">
        {layers.map((layer, i) => {
          const cost = costsByKey[layer.costKey];
          const pctOfPageViews =
            i >= 3 && inputs.pageViews > 0 ? (layer.volume / inputs.pageViews) * 100 : null;

          return (
            <React.Fragment key={layer.key}>
              {i > 0 && (
                <div className="flex w-full items-center justify-center py-1">
                  {(() => {
                    const rate = rateForGap(i);
                    if (rate.isAssumption) {
                      return (
                        <span
                          className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1"
                          title="Premissa fixa: metade dos qualificados agenda"
                        >
                          <span className="text-[11px] font-medium text-gray-400">
                            {rate.shortLabel}:{' '}
                            <span className="font-bold tabular-nums text-gray-300">
                              {formatPercent(rate.value)}
                            </span>{' '}
                            <span className="text-gray-600">· premissa</span>
                          </span>
                        </span>
                      );
                    }
                    const color = getTierColor(rate.tier);
                    return (
                      <a
                        href={`#playbook-${rate.playbookKey}`}
                        className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 transition-colors hover:border-white/[0.15]"
                        title={`Ver como otimizar: ${rate.label}`}
                      >
                        <svg className="h-2.5 w-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-[11px] font-medium text-gray-400">
                          {rate.shortLabel}:{' '}
                          <span className="font-bold tabular-nums" style={{ color }}>
                            {formatPercent(rate.value)}
                          </span>
                        </span>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </a>
                    );
                  })()}
                </div>
              )}

              <div
                className={`flex items-center justify-between rounded-lg bg-gradient-to-r px-4 py-2.5 text-white transition-transform duration-300 hover:scale-[1.01] ${LAYER_COLORS[i]}`}
                style={{ width: `${widths[i]}%`, minWidth: '270px' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                    {layer.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold tabular-nums">
                      {formatInteger(Math.round(layer.volume))}
                    </span>
                    {pctOfPageViews !== null && (
                      <span className="text-[10px] font-medium tabular-nums opacity-60">
                        {formatPercent(pctOfPageViews)} das visualizações
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] opacity-60">{layer.costLabel}</span>
                  <span className="text-xs font-semibold tabular-nums">{formatCurrency(cost?.value ?? 0)}</span>
                  {cost?.maxForGoal != null && (
                    <span
                      className={`text-[9px] font-medium tabular-nums ${
                        cost.withinGoal ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      máx p/ meta: {formatCurrency(cost.maxForGoal)}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
        <FooterStat label="Conversão Página → Cadastro" value={formatPercent(results.pageConversionRate)} />
        <FooterStat label="Conversão Visualização → Fechamento" value={formatPercent(results.overallConversion)} />
        <FooterStat label="Receita" value={formatCurrency(results.revenue)} accent="text-emerald-400" />
        <FooterStat label="ROAS" value={`${results.roas.toFixed(2).replace('.', ',')}x`} accent={results.roas >= 7 ? 'text-emerald-400' : 'text-amber-400'} />
      </div>
    </SectionCard>
  );
}

function FooterStat({ label, value, accent = 'text-blue-400' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-0.5 text-base font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}
