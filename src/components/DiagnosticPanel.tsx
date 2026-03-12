'use client';

import { FunnelResults, FunnelInputs } from '@/calculations/funnelEngine';
import {
  benchmarks,
  getHealthStatus,
  getHealthColor,
  getHealthLabel,
  calculateFunnelHealth,
} from '@/calculations/benchmarks';
import { formatCurrency, formatPercent } from '@/utils/formatters';

interface DiagnosticPanelProps {
  results: FunnelResults;
  inputs: FunnelInputs;
}

const statusConfig = {
  validated: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'FUNIL VALIDADO' },
  healthy: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'FUNIL SAUDAVEL' },
  attention: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'ATENCAO' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRITICO' },
};

export default function DiagnosticPanel({ results }: DiagnosticPanelProps) {
  const ratesMap: Record<string, number> = {
    ctr: results.rates.ctr,
    connectionRate: results.rates.connectionRate,
    pageConversionRate: results.rates.pageConversionRate,
    checkoutConversionRate: results.rates.checkoutConversionRate,
    showUpRate: results.rates.showUpRate,
    closeRate: results.rates.closeRate,
  };

  const health = calculateFunnelHealth(
    results.financials.costPerAppointment,
    results.revenue.revenuePerMeeting,
    results.indicators.roas,
    ratesMap
  );

  const config = statusConfig[health.overallStatus];

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 space-y-5">
      <h2 className="text-base font-semibold text-white">Diagnostico do Funil</h2>

      {/* Overall Status */}
      <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.text} ${config.bg} border ${config.border}`}>
            {config.label}
          </span>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">{health.message}</p>
      </div>

      {/* Priority Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`rounded-lg p-4 border ${health.costPerAppointmentHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 1</span>
          <p className="text-xs text-gray-400 mt-1">Custo por Agendamento</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(results.financials.costPerAppointment)}</p>
          <p className="text-[10px] text-gray-600 mt-2">
            Ratio: {health.appointmentToRevenueRatio.toFixed(1)}x (meta: {'>'}= 7x)
          </p>
        </div>

        <div className={`rounded-lg p-4 border ${health.roasHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 2</span>
          <p className="text-xs text-gray-400 mt-1">ROAS</p>
          <p className="text-lg font-bold text-white mt-0.5">{results.indicators.roas.toFixed(2)}x</p>
          <p className="text-[10px] text-gray-600 mt-2">Meta: {'>'}= 7x</p>
        </div>

        <div className="rounded-lg p-4 border bg-white/[0.02] border-white/[0.06]">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 3</span>
          <p className="text-xs text-gray-400 mt-1">Faturamento por Reuniao</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(results.revenue.revenuePerMeeting)}</p>
          <p className="text-[10px] text-gray-600 mt-2">
            {health.appointmentToRevenueRatio.toFixed(1)}x o custo por agendamento
          </p>
        </div>
      </div>

      {/* Benchmark Analysis */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Benchmarks
        </h3>
        <div className="space-y-2">
          {benchmarks.map((benchmark) => {
            const value = ratesMap[benchmark.key] ?? 0;
            const status = getHealthStatus(benchmark, value);
            const color = getHealthColor(status);
            const label = getHealthLabel(status);

            return (
              <div key={benchmark.key} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-xs font-medium text-gray-300">{benchmark.label}</p>
                  <p className="text-[10px] text-gray-600">
                    {'<'}{benchmark.bad.max}% ruim | {benchmark.good.min}-{benchmark.good.max}% bom | {'>'}{benchmark.excellent.min}% excelente
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{formatPercent(value)}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: color + '15', color: color }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details */}
      {health.details.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Insights</h3>
          <ul className="space-y-1.5">
            {health.details.map((detail, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">•</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
