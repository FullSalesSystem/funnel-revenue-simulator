'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFunnelConfig } from '@/calculations/funnelTypes';
import { GenericInputs, GenericResults, getDefaultInputs, calculateFunnel } from '@/calculations/genericEngine';
import SimulationPanel from '@/components/SimulationPanel';
import FunnelVisualization from '@/components/FunnelVisualization';
import DiagnosticPanel from '@/components/DiagnosticPanel';
import ComparisonBadge from '@/components/ComparisonBadge';
import { formatCurrency, formatInteger } from '@/utils/formatters';

export default function SimulatorPage() {
  const params = useParams();
  const typeId = params.type as string;
  const config = getFunnelConfig(typeId);

  if (!config) {
    return (
      <main className="min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Funil nao encontrado</h1>
          <p className="text-gray-500 mb-4">O tipo de funil &quot;{typeId}&quot; nao existe.</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            Voltar para selecao de funis
          </Link>
        </div>
      </main>
    );
  }

  return <SimulatorContent config={config} />;
}

function SimulatorContent({ config }: { config: ReturnType<typeof getFunnelConfig> & {} }) {
  const [inputs, setInputs] = useState<GenericInputs>(() => getDefaultInputs(config));
  const [baseline, setBaseline] = useState<GenericResults | null>(null);

  const results = useMemo(() => calculateFunnel(inputs, config), [inputs, config]);

  const handleInputChange = (key: string, value: number) => {
    setInputs((prev) => {
      const updated = { ...prev };
      if (key === 'mediaCost') {
        updated.mediaCost = value;
        updated.cpm = prev.cpm;
      } else if (key === 'cpm') {
        updated.cpm = value;
      } else if (key === 'averageTicket') {
        updated.averageTicket = value;
      } else if (key === 'lowTicket') {
        updated.lowTicket = value;
      } else {
        // It's a rate
        updated.rates = { ...prev.rates, [key]: Math.min(100, Math.max(0, value)) };
      }
      return updated;
    });
  };

  const handleReset = () => setInputs(getDefaultInputs(config));
  const handleSaveBaseline = () => setBaseline(structuredClone(results));
  const handleClearBaseline = () => setBaseline(null);

  // Summary card data
  const lastStageKey = config.stages[config.stages.length - 1].key;
  const salesVolume = results.volumes[lastStageKey] ?? 0;

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0b0f1a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">
                {config.name}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {config.subtitle}
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
            value={formatCurrency(results.totalRevenue)}
            color="text-emerald-400"
            accent="bg-emerald-500"
            current={results.totalRevenue}
            baselineValue={baseline?.totalRevenue ?? null}
          />
          <SummaryCard
            label="ROAS"
            value={`${results.roas.toFixed(2)}x`}
            color={results.roas >= 7 ? 'text-emerald-400' : results.roas >= 3 ? 'text-yellow-400' : 'text-red-400'}
            accent={results.roas >= 7 ? 'bg-emerald-500' : results.roas >= 3 ? 'bg-yellow-500' : 'bg-red-500'}
            current={results.roas}
            baselineValue={baseline?.roas ?? null}
          />
          <SummaryCard
            label="Custo por Comparecimento"
            value={formatCurrency(results.costPerMeeting)}
            color="text-blue-400"
            accent="bg-blue-500"
            current={results.costPerMeeting}
            baselineValue={baseline?.costPerMeeting ?? null}
            higherIsBetter={false}
          />
          <SummaryCard
            label="Vendas"
            value={formatInteger(Math.round(salesVolume))}
            color="text-purple-400"
            accent="bg-purple-500"
            current={salesVolume}
            baselineValue={baseline ? (baseline.volumes[lastStageKey] ?? null) : null}
          />
        </div>

        {/* Low ticket revenue info */}
        {config.hasLowTicket && results.lowTicketRevenue > 0 && (
          <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-medium">Receita Ticket Baixo:</span>
              <span className="text-sm font-bold text-amber-300">{formatCurrency(results.lowTicketRevenue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Receita High-Ticket:</span>
              <span className="text-sm font-bold text-emerald-400">{formatCurrency(results.highTicketRevenue)}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-20">
              <SimulationPanel
                config={config}
                inputs={inputs}
                results={results}
                onInputChange={handleInputChange}
                onReset={handleReset}
              />
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <FunnelVisualization config={config} results={results} baseline={baseline} />
            <DiagnosticPanel config={config} results={results} inputs={inputs} />
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
