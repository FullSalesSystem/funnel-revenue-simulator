'use client';

import React from 'react';
import { FunnelTypeConfig } from '@/calculations/funnelTypes';
import { GenericResults } from '@/calculations/genericEngine';
import { formatCurrency, formatPercent, formatInteger } from '@/utils/formatters';

interface FunnelVisualizationProps {
  config: FunnelTypeConfig;
  results: GenericResults;
  baseline: GenericResults | null;
}

const COLORS = [
  'from-indigo-500/80 to-indigo-400/60',
  'from-blue-500/80 to-blue-400/60',
  'from-cyan-500/80 to-cyan-400/60',
  'from-teal-500/80 to-teal-400/60',
  'from-emerald-500/80 to-emerald-400/60',
  'from-green-500/80 to-green-400/60',
  'from-lime-500/80 to-lime-400/60',
  'from-yellow-500/80 to-yellow-400/60',
  'from-amber-500/80 to-amber-400/60',
  'from-orange-500/80 to-orange-400/60',
];

function VolumeDelta({ current, baselineVal }: { current: number; baselineVal: number | undefined }) {
  if (baselineVal === undefined || baselineVal === 0) return null;
  const diff = current - baselineVal;
  const pct = (diff / Math.abs(baselineVal)) * 100;
  if (Math.abs(pct) < 0.01) return null;
  const isUp = diff > 0;
  return (
    <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-300' : 'text-red-300'}`}>
      {isUp ? '\u2191' : '\u2193'} {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

function getWidths(count: number): number[] {
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    widths.push(Math.max(30, 100 - i * Math.floor(60 / Math.max(count - 1, 1))));
  }
  return widths;
}

export default function FunnelVisualization({ config, results, baseline }: FunnelVisualizationProps) {
  // Build stages array: impressions + all config stages
  const allStages = [
    { key: 'impressions', label: 'Impressoes', costLabel: 'CPM', rateLabel: '' },
    ...config.stages,
  ];

  const widths = getWidths(allStages.length);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-base font-semibold text-white mb-6">Funil de Vendas</h2>
      <div className="flex flex-col items-center space-y-0.5">
        {allStages.map((stage, index) => {
          const volume = results.volumes[stage.key] ?? 0;
          const cost = results.costs[stage.key] ?? 0;
          const widthPercent = widths[index];
          const baselineVol = baseline?.volumes[stage.key];
          const idealCost = stage.key !== 'impressions' && results.idealCosts
            ? results.idealCosts[stage.key] ?? null
            : null;
          const colorIndex = index % COLORS.length;

          return (
            <React.Fragment key={stage.key}>
              {index > 0 && (
                <div className="flex items-center justify-center w-full py-0.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5">
                    <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {config.stages[index - 1].rateLabel}: {formatPercent(results.rates[config.stages[index - 1].key] ?? 0)}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`bg-gradient-to-r ${COLORS[colorIndex]} backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center justify-between text-white transition-all duration-300 hover:scale-[1.01]`}
                style={{ width: `${widthPercent}%`, minWidth: '260px' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium opacity-70 uppercase tracking-wide">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{formatInteger(Math.round(volume))}</span>
                    <VolumeDelta current={volume} baselineVal={baselineVol} />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] opacity-60">{stage.costLabel}</span>
                  <span className="text-xs font-semibold">{formatCurrency(cost)}</span>
                  {idealCost !== null && (
                    <span className={`text-[9px] font-medium ${cost > idealCost ? 'text-red-300' : 'text-emerald-300'}`}>
                      Max: {formatCurrency(idealCost)}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Conv. Total</p>
          <p className="text-base font-bold text-blue-400">{formatPercent(results.funnelConversionRate)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Receita</p>
          <p className="text-base font-bold text-emerald-400">{formatCurrency(results.totalRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">ROAS</p>
          <p className="text-base font-bold text-yellow-400">{results.roas.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  );
}
