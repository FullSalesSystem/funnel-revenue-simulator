'use client';

import { useState, useRef, useMemo } from 'react';
import { FunnelInputs, FunnelResults, getDefaultInputs, calculateFunnel } from '@/calculations/funnelEngine';
import SimulationPanel from '@/components/SimulationPanel';
import FunnelVisualization from '@/components/FunnelVisualization';
import MetricsDisplay from '@/components/MetricsDisplay';
import DiagnosticPanel from '@/components/DiagnosticPanel';
import FunnelBarChart from '@/charts/FunnelChart';
import ExportButton from '@/components/ExportButton';
import ComparisonBadge from '@/components/ComparisonBadge';

export default function Home() {
  const [inputs, setInputs] = useState<FunnelInputs>(getDefaultInputs());
  const [baseline, setBaseline] = useState<FunnelResults | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

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
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Funnel Revenue Simulator
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Sistema inteligente de analise e simulacao de funil de vendas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {baseline ? (
              <button
                onClick={handleClearBaseline}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-lg text-sm font-medium transition-colors"
              >
                Limpar Comparacao
              </button>
            ) : null}
            <button
              onClick={handleSaveBaseline}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {baseline ? 'Atualizar Baseline' : 'Salvar Baseline'}
            </button>
            <ExportButton targetRef={exportRef} />
          </div>
        </div>
      </header>

      {/* Baseline indicator */}
      {baseline && (
        <div className="bg-violet-900/30 border-b border-violet-700/50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs text-violet-300">
              Modo comparacao ativo - Altere qualquer campo para ver o impacto nas metricas
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            label="Receita Total"
            value={`R$ ${results.indicators.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            color="text-emerald-400"
            current={results.indicators.totalRevenue}
            baselineValue={baseline?.indicators.totalRevenue ?? null}
          />
          <SummaryCard
            label="ROAS"
            value={`${results.indicators.roas.toFixed(2)}x`}
            color={results.indicators.roas >= 7 ? 'text-emerald-400' : results.indicators.roas >= 3 ? 'text-yellow-400' : 'text-red-400'}
            current={results.indicators.roas}
            baselineValue={baseline?.indicators.roas ?? null}
          />
          <SummaryCard
            label="Custo por Agendamento"
            value={`R$ ${results.financials.costPerAppointment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            color="text-blue-400"
            current={results.financials.costPerAppointment}
            baselineValue={baseline?.financials.costPerAppointment ?? null}
            higherIsBetter={false}
          />
          <SummaryCard
            label="Vendas"
            value={results.volumes.treatmentsClosed.toFixed(1)}
            color="text-purple-400"
            current={results.volumes.treatmentsClosed}
            baselineValue={baseline?.volumes.treatmentsClosed ?? null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <SimulationPanel
              inputs={inputs}
              onInputChange={handleInputChange}
              onReset={handleReset}
            />
          </div>

          <div className="lg:col-span-9 space-y-8" ref={exportRef}>
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
  current,
  baselineValue,
  higherIsBetter = true,
}: {
  label: string;
  value: string;
  color: string;
  current: number;
  baselineValue: number | null;
  higherIsBetter?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="flex items-center mt-1">
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <ComparisonBadge current={current} baseline={baselineValue} higherIsBetter={higherIsBetter} />
      </div>
    </div>
  );
}
