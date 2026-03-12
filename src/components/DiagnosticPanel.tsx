'use client';

import { FunnelResults, FunnelInputs } from '@/calculations/funnelEngine';
import {
  benchmarks,
  getHealthStatus,
  getHealthColor,
  getHealthLabel,
  calculateFunnelHealth,
} from '@/calculations/benchmarks';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface DiagnosticPanelProps {
  results: FunnelResults;
  inputs: FunnelInputs;
}

const statusConfig = {
  validated: { bg: 'bg-emerald-900/50', border: 'border-emerald-500', text: 'text-emerald-400', label: 'FUNIL VALIDADO' },
  healthy: { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-400', label: 'FUNIL SAUDAVEL' },
  attention: { bg: 'bg-yellow-900/50', border: 'border-yellow-500', text: 'text-yellow-400', label: 'ATENCAO' },
  critical: { bg: 'bg-red-900/50', border: 'border-red-500', text: 'text-red-400', label: 'CRITICO' },
};

export default function DiagnosticPanel({ results, inputs }: DiagnosticPanelProps) {
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
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Funnel Health Score</h2>

      {/* Overall Status */}
      <div className={`${config.bg} border ${config.border} rounded-xl p-5`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
            {config.label}
          </span>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed">{health.message}</p>
      </div>

      {/* Priority Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1st Priority: Cost per Appointment */}
        <div className={`rounded-xl p-4 border ${health.costPerAppointmentHealthy ? 'bg-emerald-900/30 border-emerald-700' : 'bg-red-900/30 border-red-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400">PRIORIDADE 1</span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Custo por Agendamento</p>
          <p className="text-xl font-bold text-white">{formatCurrency(results.financials.costPerAppointment)}</p>
          <p className="text-xs text-gray-400 mt-2">
            Ratio: {health.appointmentToRevenueRatio.toFixed(1)}x (meta: {'>'}= 7x)
          </p>
        </div>

        {/* 2nd Priority: ROAS */}
        <div className={`rounded-xl p-4 border ${health.roasHealthy ? 'bg-emerald-900/30 border-emerald-700' : 'bg-red-900/30 border-red-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400">PRIORIDADE 2</span>
          </div>
          <p className="text-sm text-gray-300 mb-1">ROAS</p>
          <p className="text-xl font-bold text-white">{results.indicators.roas.toFixed(2)}x</p>
          <p className="text-xs text-gray-400 mt-2">Meta: {'>'}= 7x</p>
        </div>

        {/* 3rd Priority: Revenue per Meeting */}
        <div className="rounded-xl p-4 border bg-gray-700/30 border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400">PRIORIDADE 3</span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Faturamento por Reuniao</p>
          <p className="text-xl font-bold text-white">{formatCurrency(results.revenue.revenuePerMeeting)}</p>
          <p className="text-xs text-gray-400 mt-2">
            {health.appointmentToRevenueRatio.toFixed(1)}x o custo por agendamento
          </p>
        </div>
      </div>

      {/* Benchmark Analysis */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Conversoes Intermediarias (Benchmarks)
        </h3>
        <div className="space-y-3">
          {benchmarks.map((benchmark) => {
            const value = ratesMap[benchmark.key] ?? 0;
            const status = getHealthStatus(benchmark, value);
            const color = getHealthColor(status);
            const label = getHealthLabel(status);

            return (
              <div key={benchmark.key} className="flex items-center justify-between bg-gray-700/30 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-200">{benchmark.label}</p>
                  <p className="text-xs text-gray-400">
                    Ruim: {'<'}{benchmark.bad.max}% | Bom: {benchmark.good.min}-{benchmark.good.max}% | Excelente: {'>'}{benchmark.excellent.min}%
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{formatPercent(value)}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: color + '20', color: color }}
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
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Detalhes</h3>
        <ul className="space-y-2">
          {health.details.map((detail, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-gray-500 mt-0.5">-</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
