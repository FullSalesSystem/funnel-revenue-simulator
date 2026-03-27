"use client";

import { useState, useEffect, useCallback } from "react";
import { FunnelTypeConfig } from "@/calculations/funnelTypes";
import { GenericInputs, GenericResults } from "@/calculations/genericEngine";

interface SimulationPanelProps {
  config: FunnelTypeConfig;
  inputs: GenericInputs;
  results: GenericResults;
  onInputChange: (key: string, value: number) => void;
  onReset: () => void;
}

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all hover:border-white/[0.12]";

function RateCostRow({
  stageKey,
  rateLabel,
  costLabel,
  rateValue,
  computedCost,
  mediaCost,
  previousVolume,
  onRateChange,
}: {
  stageKey: string;
  rateLabel: string;
  costLabel: string;
  rateValue: number;
  computedCost: number;
  mediaCost: number;
  previousVolume: number;
  onRateChange: (key: string, value: number) => void;
}) {
  const displayCost = computedCost > 0 && isFinite(computedCost) ? parseFloat(computedCost.toFixed(2)) : 0;
  const [costText, setCostText] = useState(displayCost.toString());
  const [isEditingCost, setIsEditingCost] = useState(false);

  useEffect(() => {
    if (!isEditingCost) {
      setCostText(displayCost.toString());
    }
  }, [displayCost, isEditingCost]);

  const handleCostChange = useCallback(
    (rawValue: string) => {
      setCostText(rawValue);
      const cost = parseFloat(rawValue);
      if (!isNaN(cost) && cost > 0 && mediaCost > 0 && previousVolume > 0) {
        const volume = mediaCost / cost;
        const rate = (volume / previousVolume) * 100;
        if (rate >= 0 && rate <= 100) {
          onRateChange(stageKey, Math.round(rate * 1000) / 1000);
        }
      }
    },
    [mediaCost, previousVolume, onRateChange, stageKey]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <label className="mb-0.5 block text-[10px] font-medium text-gray-500">
          {rateLabel} <span className="text-gray-600">%</span>
        </label>
        <input
          type="number"
          step={0.1}
          min={0}
          max={100}
          value={rateValue}
          onChange={(e) => onRateChange(stageKey, Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
          className={inputClass}
        />
      </div>
      <div className="flex-1 min-w-0">
        <label className="mb-0.5 block text-[10px] font-medium text-gray-500">
          {costLabel} <span className="text-gray-600">R$</span>
        </label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={costText}
          onFocus={() => setIsEditingCost(true)}
          onBlur={() => {
            setIsEditingCost(false);
            setCostText(displayCost.toString());
          }}
          onChange={(e) => handleCostChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function SimulationPanel({ config, inputs, results, onInputChange, onReset }: SimulationPanelProps) {
  // Build previous volume lookup: for stage i, previous volume is stage i-1 (or impressions for i=0)
  const getPreviousVolume = (stageIndex: number): number => {
    if (stageIndex === 0) return results.impressions;
    return results.volumes[config.stages[stageIndex - 1].key] ?? 0;
  };

  return (
    <div className="space-y-4">
      {/* Investimento */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Investimento
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="mediaCost" className="mb-1 block text-xs font-medium text-gray-400">
              Custo de Midia <span className="text-gray-600 ml-1">R$</span>
            </label>
            <input
              id="mediaCost"
              type="number"
              step={100}
              min={0}
              value={inputs.mediaCost}
              onChange={(e) => onInputChange("mediaCost", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cpm" className="mb-1 block text-xs font-medium text-gray-400">
              CPM <span className="text-gray-600 ml-1">R$</span>
            </label>
            <input
              id="cpm"
              type="number"
              step={10}
              min={1}
              value={inputs.cpm}
              onChange={(e) => onInputChange("cpm", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Taxas de Conversao */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Taxas de Conversao
        </h3>
        <div className="space-y-3">
          {config.stages.map((stage, index) => (
            <RateCostRow
              key={stage.key}
              stageKey={stage.key}
              rateLabel={stage.rateLabel}
              costLabel={stage.costLabel}
              rateValue={inputs.rates[stage.key] ?? 0}
              computedCost={results.costs[stage.key] ?? 0}
              mediaCost={results.mediaCost}
              previousVolume={getPreviousVolume(index)}
              onRateChange={onInputChange}
            />
          ))}
        </div>
      </div>

      {/* Receita */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Receita
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="averageTicket" className="mb-1 block text-xs font-medium text-gray-400">
              Ticket Medio (High-Ticket) <span className="text-gray-600 ml-1">R$</span>
            </label>
            <input
              id="averageTicket"
              type="number"
              step={100}
              min={0}
              value={inputs.averageTicket}
              onChange={(e) => onInputChange("averageTicket", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          {config.hasLowTicket && (
            <div>
              <label htmlFor="lowTicket" className="mb-1 block text-xs font-medium text-gray-400">
                {config.lowTicketLabel ?? 'Ticket Baixo'} <span className="text-gray-600 ml-1">R$</span>
              </label>
              <input
                id="lowTicket"
                type="number"
                step={1}
                min={0}
                value={inputs.lowTicket ?? 0}
                onChange={(e) => onInputChange("lowTicket", parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-2 text-xs font-medium text-gray-500 transition-all hover:bg-white/[0.08] hover:text-gray-300"
      >
        Resetar Valores
      </button>
    </div>
  );
}
