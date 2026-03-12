'use client';

interface ComparisonBadgeProps {
  current: number;
  baseline: number | null;
  /** true = higher is better (revenue, ROAS), false = lower is better (costs) */
  higherIsBetter?: boolean;
  isPercent?: boolean;
}

export default function ComparisonBadge({
  current,
  baseline,
  higherIsBetter = true,
  isPercent = false,
}: ComparisonBadgeProps) {
  if (baseline === null || baseline === 0) return null;

  const diff = current - baseline;
  const pctChange = (diff / Math.abs(baseline)) * 100;

  if (Math.abs(pctChange) < 0.01) return null;

  const isPositive = diff > 0;
  const isGood = higherIsBetter ? isPositive : !isPositive;

  const arrow = isPositive ? '\u2191' : '\u2193';
  const color = isGood ? 'text-emerald-400' : 'text-red-400';
  const bg = isGood ? 'bg-emerald-400/10' : 'bg-red-400/10';

  const displayValue = isPercent
    ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)}pp`
    : `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%`;

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${color} ${bg} ml-2`}>
      {arrow} {displayValue}
    </span>
  );
}
