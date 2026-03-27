'use client';

import { FunnelTypeConfig } from '@/calculations/funnelTypes';
import {
  GenericInputs,
  GenericResults,
  calculateFunnelHealth,
  getHealthStatus,
  getHealthColor,
  getHealthLabel,
} from '@/calculations/genericEngine';
import { formatCurrency, formatPercent } from '@/utils/formatters';

interface DiagnosticPanelProps {
  config: FunnelTypeConfig;
  results: GenericResults;
  inputs: GenericInputs;
}

const statusConfig = {
  validated: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'FUNIL VALIDADO' },
  healthy: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'FUNIL SAUDAVEL' },
  attention: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'ATENCAO' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRITICO' },
};

export default function DiagnosticPanel({ config, results, inputs }: DiagnosticPanelProps) {
  const health = calculateFunnelHealth(results, config);
  const cfg = statusConfig[health.overallStatus];
  const pricing = health.pricingAnalysis;

  // Get stages with benchmarks for the benchmark section
  const stagesWithBenchmarks = config.stages.filter((s) => s.benchmark);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 space-y-5">
      <h2 className="text-base font-semibold text-white">Diagnostico do Funil</h2>

      {/* Overall Status */}
      <div className={`${cfg.bg} border ${cfg.border} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">{health.message}</p>
      </div>

      {/* Scale readiness */}
      {results.roas >= 10 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
              PRONTO PARA ESCALAR
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            ROAS de {results.roas.toFixed(2)}x esta acima de 10x. O funil tem margem para escalar o investimento em midia.
          </p>
        </div>
      )}

      {results.roas >= 7 && results.roas < 10 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-yellow-400 bg-yellow-500/10 border border-yellow-500/30">
              ESCALAR COM CUIDADO
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            ROAS de {results.roas.toFixed(2)}x esta entre 7x e 10x. Escale em incrementos de 20-30% e aguarde 3-5 dias para avaliar.
          </p>
        </div>
      )}

      {/* Biggest Opportunity */}
      {health.biggestOpportunity && (
        <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-blue-400 bg-blue-500/10 border border-blue-500/30">
              MAIOR OPORTUNIDADE
            </span>
          </div>
          <p className="text-white text-sm font-semibold mb-1">{health.biggestOpportunity.metricLabel}</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 text-xs font-bold">{health.biggestOpportunity.currentValue.toFixed(1)}%</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-emerald-400 text-xs font-bold">{health.biggestOpportunity.targetValue.toFixed(1)}%</span>
            </div>
            <span className="text-emerald-400 text-xs font-bold">+{health.biggestOpportunity.revenueGainPercent.toFixed(0)}% receita</span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">{health.biggestOpportunity.description}</p>
        </div>
      )}

      {/* Pricing Analysis */}
      {pricing.isUnderpriced && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30">
              TICKET ABAIXO DO IDEAL
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">{pricing.message}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ticket Atual</p>
              <p className="text-base font-bold text-white mt-0.5">{formatCurrency(inputs.averageTicket)}</p>
            </div>
            <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
              <p className="text-[10px] text-amber-400 uppercase tracking-wide">Ticket Ideal Estimado</p>
              <p className="text-base font-bold text-amber-300 mt-0.5">
                {formatCurrency(pricing.idealTicketMin)} - {formatCurrency(pricing.idealTicketMax)}
              </p>
            </div>
          </div>
        </div>
      )}

      {pricing.status === 'correct' && !health.costPerMeetingHealthy && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/30">
              CONSIDERE AUMENTAR O TICKET
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {pricing.message} Porem, o custo por comparecimento esta acima do ideal. Considere aumentar o ticket medio e melhorar o processo comercial.
          </p>
        </div>
      )}

      {pricing.status === 'correct' && health.costPerMeetingHealthy && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
              TICKET CORRETO
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">{pricing.message}</p>
        </div>
      )}

      {pricing.status === 'low_conversion' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-500/10 border border-red-500/30">
              PROCESSO COMERCIAL PRECISA MELHORAR
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">{pricing.message}</p>
        </div>
      )}

      {/* Priority Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={`rounded-lg p-4 border ${health.costPerMeetingHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 1</span>
          <p className="text-xs text-gray-400 mt-1">Custo por Comparecimento</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(results.costPerMeeting)}</p>
          <p className="text-[10px] text-gray-600 mt-1">
            Ideal: ate {formatCurrency(results.revenuePerMeeting / 7)}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            Ratio: {health.meetingToRevenueRatio.toFixed(1)}x (meta: {'>'}= 7x)
          </p>
        </div>

        <div className={`rounded-lg p-4 border ${health.roasHealthy ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 2</span>
          <p className="text-xs text-gray-400 mt-1">ROAS</p>
          <p className="text-lg font-bold text-white mt-0.5">{results.roas.toFixed(2)}x</p>
          <p className="text-[10px] text-gray-600 mt-2">Meta: {'>'}= 7x</p>
        </div>

        <div className="rounded-lg p-4 border bg-white/[0.02] border-white/[0.06]">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Prioridade 3</span>
          <p className="text-xs text-gray-400 mt-1">Faturamento por Reuniao</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(results.revenuePerMeeting)}</p>
          <p className="text-[10px] text-gray-600 mt-2">
            {health.meetingToRevenueRatio.toFixed(1)}x o custo por comparecimento
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Recomendacoes (ordem de otimizacao)
          </h3>
          <div className="space-y-2">
            {health.recommendations.map((rec, i) => {
              const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-300', badge: 'bg-red-500/10 text-red-400 border-red-500/30' },
                amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-300', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-300', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
              };
              const c = colorMap[rec.color] ?? colorMap.amber;
              return (
                <div key={i} className={`${c.bg} border ${c.border} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-gray-500">#{rec.priority}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${c.badge}`}>
                      {rec.areaLabel}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${c.text} mb-1`}>{rec.title}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ideal Costs per Stage */}
      {results.idealCosts && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Custo Maximo por Etapa (meta ROAS 7x)
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            {results.roas >= 7
              ? 'Com o volume atual, voce pode pagar ate os valores abaixo e manter ROAS de 7x:'
              : 'Para atingir ROAS de 7x com o volume atual, voce deveria pagar no maximo:'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {config.stages.map((stage) => {
              const ideal = results.idealCosts![stage.key] ?? 0;
              const current = results.costs[stage.key] ?? 0;
              const overBudget = current > ideal;
              return (
                <div
                  key={stage.key}
                  className={`rounded-lg p-3 border ${overBudget ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}
                >
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{stage.costLabel}</p>
                  <p className={`text-sm font-bold mt-0.5 ${overBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(ideal)}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Atual: {formatCurrency(current)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Close Rate vs Pricing Table */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Close Rate vs Precificacao
        </h3>
        <div className="space-y-1">
          {[
            { range: '80%+', rule: '3x-4x abaixo do ideal', min: 80, max: 100 },
            { range: '60%-80%', rule: '2x-3x abaixo do ideal', min: 60, max: 80 },
            { range: '50%-60%', rule: '1x-2x abaixo do ideal', min: 50, max: 60 },
            { range: '40%-50%', rule: '1x-1.5x abaixo do ideal', min: 40, max: 50 },
            { range: '20%-40%', rule: 'Corretamente precificado', min: 20, max: 40 },
          ].map((row) => {
            const lastStageKey = config.stages[config.stages.length - 1].key;
            const closeRate = results.rates[lastStageKey] ?? 0;
            const isActive = closeRate >= row.min && closeRate < row.max;
            const isActiveTop = row.max === 100 && closeRate >= row.min;
            const highlighted = isActive || isActiveTop;
            return (
              <div
                key={row.range}
                className={`flex items-center justify-between rounded-lg px-4 py-2 ${highlighted ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/[0.02]'}`}
              >
                <span className={`text-xs font-bold ${highlighted ? 'text-amber-300' : 'text-gray-400'}`}>{row.range}</span>
                <span className={`text-xs ${highlighted ? 'text-amber-300 font-semibold' : 'text-gray-500'}`}>{row.rule}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark Analysis */}
      {stagesWithBenchmarks.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Benchmarks
          </h3>
          <div className="space-y-2">
            {stagesWithBenchmarks.map((stage) => {
              const value = results.rates[stage.key] ?? 0;
              const status = getHealthStatus(stage, value);
              const color = getHealthColor(status);
              const label = getHealthLabel(status);
              const b = stage.benchmark!;

              return (
                <div key={stage.key} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-gray-300">{b.label}</p>
                    <p className="text-[10px] text-gray-600">
                      {'<'}{b.bad.max}% ruim | {b.good.min}-{b.good.max}% bom | {'>'}{b.excellent.min}% excelente
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
      )}

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
