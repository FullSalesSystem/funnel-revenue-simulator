'use client';

import { useState, useMemo } from 'react';
import { FunnelInputs, FunnelResults, getDefaultInputs, calculateFunnel } from '@/calculations/funnelEngine';
import SimulationPanel from '@/components/SimulationPanel';
import FunnelVisualization from '@/components/FunnelVisualization';
import MetricsDisplay from '@/components/MetricsDisplay';
import DiagnosticPanel from '@/components/DiagnosticPanel';
import FunnelBarChart from '@/charts/FunnelChart';
import ComparisonBadge from '@/components/ComparisonBadge';

export default function Home() {
  const [inputs, setInputs] = useState<FunnelInputs>(getDefaultInputs());
  const [baseline, setBaseline] = useState<FunnelResults | null>(null);

  const results = useMemo(() => calculateFunnel(inputs), [inputs]);

  const handleInputChange = (key: keyof FunnelInputs, value: number) => {
    setInputs((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'impressions') {
        updated.mediaCost = (value * updated.cpm) / 1000;
      } else if (key === 'cpm') {
        updated.mediaCost = (updated.impressions * value) / 1000;
      }
      return updated;
    });
  };

  const handleReset = () => {
    setInputs(getDefaultInputs());
  };

  const handleSaveBaseline = () => {
    setBaseline(structuredClone(results));
  };

  const handleClearBaseline = () => {
    setBaseline(null);
  };

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0b0f1a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">
                Funnel Revenue Simulator
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Simulador inteligente de funil de vendas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {baseline && (
              <button
                onClick={handleClearBaseline}
                className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-all"
              >
                Limpar Baseline
              </button>
            )}
            <button
              onClick={handleSaveBaseline}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-all border border-white/10 hover:border-white/20 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {baseline ? 'Atualizar Baseline' : 'Salvar Baseline'}
            </button>
          </div>
        </div>
      </header>

      {/* Baseline indicator */}
      {baseline && (
        <div className="bg-violet-500/10 border-b border-violet-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] text-violet-300/80">
              Modo comparacao ativo — altere os campos para ver o impacto
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <SummaryCard
            label="Receita Total"
            value={`R$ ${results.indicators.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="text-emerald-400"
            accent="bg-emerald-500"
            current={results.indicators.totalRevenue}
            baselineValue={baseline?.indicators.totalRevenue ?? null}
          />
          <SummaryCard
            label="ROAS"
            value={`${results.indicators.roas.toFixed(2)}x`}
            color={results.indicators.roas >= 7 ? 'text-emerald-400' : results.indicators.roas >= 3 ? 'text-yellow-400' : 'text-red-400'}
            accent={results.indicators.roas >= 7 ? 'bg-emerald-500' : results.indicators.roas >= 3 ? 'bg-yellow-500' : 'bg-red-500'}
            current={results.indicators.roas}
            baselineValue={baseline?.indicators.roas ?? null}
          />
          <SummaryCard
            label="Custo por Agendamento"
            value={`R$ ${results.financials.costPerAppointment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="text-blue-400"
            accent="bg-blue-500"
            current={results.financials.costPerAppointment}
            baselineValue={baseline?.financials.costPerAppointment ?? null}
            higherIsBetter={false}
          />
          <SummaryCard
            label="Vendas"
            value={results.volumes.treatmentsClosed < 1
              ? results.volumes.treatmentsClosed.toFixed(2)
              : results.volumes.treatmentsClosed.toFixed(1)}
            color="text-purple-400"
            accent="bg-purple-500"
            current={results.volumes.treatmentsClosed}
            baselineValue={baseline?.volumes.treatmentsClosed ?? null}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-20">
              <SimulationPanel
                inputs={inputs}
                onInputChange={handleInputChange}
                onReset={handleReset}
              />
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <FunnelVisualization results={results} baseline={baseline} />
            <FunnelBarChart results={results} />
            <MetricsDisplay results={results} baseline={baseline} />
            <DiagnosticPanel results={results} inputs={inputs} />
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  color,
  accent,
  current,
  baselineValue,
  higherIsBetter = true,
}: {
  label: string;
  value: string;
  color: string;
  accent: string;
  current: number;
  baselineValue: number | null;
  higherIsBetter?: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06] hover:border-white/10 transition-all group">
      <div className={`absolute top-0 left-0 w-full h-[2px] ${accent} opacity-40 group-hover:opacity-70 transition-opacity`} />
      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <p className={`text-xl font-bold ${color} tracking-tight`}>{value}</p>
        <ComparisonBadge current={current} baseline={baselineValue} higherIsBetter={higherIsBetter} />
      </div>
    </div>
  );
}
