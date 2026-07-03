'use client';

import React from 'react';
import { ApplicationResults, getTierColor } from '@/calculations/applicationFunnel';
import { formatInteger, formatPercent } from '@/utils/formatters';
import { SectionCard } from './shared';

export default function QuestionDropoff({ results }: { results: ApplicationResults }) {
  const { inputs, questionFlow, totalApplicationDrop } = results;

  return (
    <SectionCard
      title="Drop-off por Pergunta"
      subtitle="Onde as pessoas desistem da aplicação. Cada barra mostra quantos chegaram até a pergunta; o badge mostra quanto foi perdido em relação à etapa anterior."
      right={
        <div className="shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Perda total</p>
          <p className={`text-sm font-bold tabular-nums ${totalApplicationDrop > 50 ? 'text-red-400' : totalApplicationDrop > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatPercent(totalApplicationDrop)}
          </p>
        </div>
      }
    >
      <div className="space-y-2">
        {/* linha base: quem iniciou */}
        <Row
          label="Iniciaram a aplicação"
          reached={inputs.applicationStarts}
          retention={100}
          badge={null}
          isBase
        />

        {questionFlow.map((row) => (
          <Row
            key={row.label}
            label={row.label}
            reached={row.reached}
            retention={row.retentionFromStart}
            isWorst={row.isWorst}
            badge={
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{
                  color: getTierColor(row.tier),
                  backgroundColor: `${getTierColor(row.tier)}1a`,
                }}
              >
                −{row.dropFromPrevious.toFixed(1).replace('.', ',')}%
              </span>
            }
          />
        ))}
      </div>

      {/* legenda de benchmark */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Drop-off por pergunta:
        </span>
        <Legend color="#10b981" label="Ótimo ≤ 5%" />
        <Legend color="#3b82f6" label="Bom 5–10%" />
        <Legend color="#f59e0b" label="Atenção 10–20%" />
        <Legend color="#ef4444" label="Crítico > 20%" />
      </div>
    </SectionCard>
  );
}

function Row({
  label,
  reached,
  retention,
  badge,
  isBase = false,
  isWorst = false,
}: {
  label: string;
  reached: number;
  retention: number;
  badge: React.ReactNode;
  isBase?: boolean;
  isWorst?: boolean;
}) {
  return (
    <div
      className={`relative rounded-lg px-3 py-2 transition-colors ${
        isWorst ? 'bg-red-500/[0.06] ring-1 ring-red-500/30' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`truncate text-xs font-medium ${isBase ? 'text-gray-300' : 'text-gray-400'}`}>
            {label}
          </span>
          {isWorst && (
            <span className="shrink-0 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-300">
              maior vazamento
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          <span className="w-16 text-right text-xs font-bold tabular-nums text-white">
            {formatInteger(Math.round(reached))}
          </span>
          <span className="w-14 text-right text-[10px] font-medium tabular-nums text-gray-500">
            {retention.toFixed(1).replace('.', ',')}%
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isBase ? 'bg-indigo-400/80' : isWorst ? 'bg-red-400/70' : 'bg-indigo-500/60'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, retention))}%` }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
