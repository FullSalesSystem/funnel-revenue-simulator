'use client';

import React from 'react';
import { Tier, getTierLabel } from '@/calculations/applicationFunnel';

export const TIER_STYLES: Record<Tier, { chip: string; dot: string; text: string }> = {
  otimo: {
    chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
  },
  bom: {
    chip: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    dot: 'bg-blue-400',
    text: 'text-blue-400',
  },
  aceitavel: {
    chip: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
  },
  ruim: {
    chip: 'bg-red-500/10 text-red-300 border-red-500/25',
    dot: 'bg-red-400',
    text: 'text-red-400',
  },
};

export function TierChip({ tier, className = '' }: { tier: Tier; className?: string }) {
  const s = TIER_STYLES[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.chip} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {getTierLabel(tier)}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-100 tabular-nums placeholder-gray-600 transition-all hover:border-white/[0.12] focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30';
