'use client';

import React from 'react';
import { FunnelResults } from '@/calculations/funnelEngine';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface FunnelVisualizationProps {
  results: FunnelResults;
  baseline: FunnelResults | null;
}

const stages = [
  { key: 'impressions', label: 'Impressoes', volumeKey: 'impressions' as const, costLabel: 'CPM', costKey: 'cpm' as const },
  { key: 'clicks', label: 'Cliques', volumeKey: 'clicks' as const, costLabel: 'CPC', costKey: 'cpc' as const },
  { key: 'pageLoads', label: 'Pagina Carregada', volumeKey: 'pageLoads' as const, costLabel: 'Custo/Pag', costKey: 'costPerPage' as const },
  { key: 'checkoutStarts', label: 'Inicio de Checkout', volumeKey: 'checkoutStarts' as const, costLabel: 'Custo/Check', costKey: 'costPerCheckout' as const },
  { key: 'appointmentPurchases', label: 'Compra de Agendamento', volumeKey: 'appointmentPurchases' as const, costLabel: 'Custo/Agend', costKey: 'costPerAppointment' as const },
  { key: 'consultationsAttended', label: 'Consulta Comparecida', volumeKey: 'consultationsAttended' as const, costLabel: 'Custo/Cons', costKey: 'costPerConsultation' as const },
  { key: 'treatmentsClosed', label: 'Tratamento Fechado', volumeKey: 'treatmentsClosed' as const, costLabel: 'CPA', costKey: 'cpa' as const },
];

const ratesBetween = [
  { label: 'CTR', key: 'ctr' as const },
  { label: 'Conexao', key: 'connectionRate' as const },
  { label: 'Conv. Pagina', key: 'pageConversionRate' as const },
  { label: 'Conv. Checkout', key: 'checkoutConversionRate' as const },
  { label: 'Agendamento', key: 'appointmentRate' as const },
  { label: 'Comparecimento', key: 'showUpRate' as const },
];

const COLORS = [
  'from-indigo-500/80 to-indigo-400/60',
  'from-blue-500/80 to-blue-400/60',
  'from-cyan-500/80 to-cyan-400/60',
  'from-teal-500/80 to-teal-400/60',
  'from-emerald-500/80 to-emerald-400/60',
  'from-green-500/80 to-green-400/60',
  'from-lime-500/80 to-lime-400/60',
];

const WIDTHS = [100, 88, 76, 64, 52, 42, 34];

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

export default function FunnelVisualization({ results, baseline }: FunnelVisualizationProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
      <h2 className="text-base font-semibold text-white mb-6">Funil de Vendas</h2>
      <div className="flex flex-col items-center space-y-0.5">
        {stages.map((stage, index) => {
          const volume = results.volumes[stage.volumeKey];
          const cost = results.financials[stage.costKey];
          const widthPercent = WIDTHS[index];
          const baselineVol = baseline?.volumes[stage.volumeKey];

          return (
            <React.Fragment key={stage.key}>
              {index > 0 && (
                <div className="flex items-center justify-center w-full py-0.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5">
                    <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {ratesBetween[index - 1].label}: {formatPercent(results.rates[ratesBetween[index - 1].key])}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`bg-gradient-to-r ${COLORS[index]} backdrop-blur-sm rounded-lg px-4 py-2.5 flex items-center justify-between text-white transition-all duration-300 hover:scale-[1.01]`}
                style={{ width: `${widthPercent}%`, minWidth: '260px' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium opacity-70 uppercase tracking-wide">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{formatNumber(volume, volume < 10 ? 2 : 0)}</span>
                    <VolumeDelta current={volume} baselineVal={baselineVol} />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] opacity-60">{stage.costLabel}</span>
                  <span className="text-xs font-semibold">{formatCurrency(cost)}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Conv. Total</p>
          <p className="text-base font-bold text-blue-400">{formatPercent(results.rates.funnelConversionRate)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Receita</p>
          <p className="text-base font-bold text-emerald-400">{formatCurrency(results.indicators.totalRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">ROAS</p>
          <p className="text-base font-bold text-yellow-400">{results.indicators.roas.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  );
}
