'use client';

import { FunnelResults } from '@/calculations/funnelEngine';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import ComparisonBadge from './ComparisonBadge';

interface MetricsDisplayProps {
  results: FunnelResults;
  baseline: FunnelResults | null;
}

function MetricRow({
  label,
  value,
  current,
  baselineValue,
  higherIsBetter = true,
  isPercent = false,
}: {
  label: string;
  value: string;
  current: number;
  baselineValue: number | null;
  higherIsBetter?: boolean;
  isPercent?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-gray-200">{value}</span>
        <ComparisonBadge
          current={current}
          baseline={baselineValue}
          higherIsBetter={higherIsBetter}
          isPercent={isPercent}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <h3 className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${color}`}>{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export default function MetricsDisplay({ results, baseline }: MetricsDisplayProps) {
  const fmt = (v: number) => formatNumber(v, v < 10 ? 2 : v < 100 ? 1 : 0);
  const b = baseline;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard title="Volume" color="text-blue-400/80">
        <MetricRow label="Impressoes" value={fmt(results.volumes.impressions)} current={results.volumes.impressions} baselineValue={b?.volumes.impressions ?? null} />
        <MetricRow label="Cliques" value={fmt(results.volumes.clicks)} current={results.volumes.clicks} baselineValue={b?.volumes.clicks ?? null} />
        <MetricRow label="Paginas Carregadas" value={fmt(results.volumes.pageLoads)} current={results.volumes.pageLoads} baselineValue={b?.volumes.pageLoads ?? null} />
        <MetricRow label="Iniciam Checkout" value={fmt(results.volumes.checkoutStarts)} current={results.volumes.checkoutStarts} baselineValue={b?.volumes.checkoutStarts ?? null} />
        <MetricRow label="Compram Agendamento" value={fmt(results.volumes.appointmentPurchases)} current={results.volumes.appointmentPurchases} baselineValue={b?.volumes.appointmentPurchases ?? null} />
        <MetricRow label="Comparecem a Consulta" value={fmt(results.volumes.consultationsAttended)} current={results.volumes.consultationsAttended} baselineValue={b?.volumes.consultationsAttended ?? null} />
        <MetricRow label="Fecham Tratamento" value={fmt(results.volumes.treatmentsClosed)} current={results.volumes.treatmentsClosed} baselineValue={b?.volumes.treatmentsClosed ?? null} />
      </MetricCard>

      <MetricCard title="Taxas" color="text-cyan-400/80">
        <MetricRow label="CTR" value={formatPercent(results.rates.ctr)} current={results.rates.ctr} baselineValue={b?.rates.ctr ?? null} isPercent />
        <MetricRow label="Taxa de Conexao" value={formatPercent(results.rates.connectionRate)} current={results.rates.connectionRate} baselineValue={b?.rates.connectionRate ?? null} isPercent />
        <MetricRow label="Conv. da Pagina" value={formatPercent(results.rates.pageConversionRate)} current={results.rates.pageConversionRate} baselineValue={b?.rates.pageConversionRate ?? null} isPercent />
        <MetricRow label="Conv. do Checkout" value={formatPercent(results.rates.checkoutConversionRate)} current={results.rates.checkoutConversionRate} baselineValue={b?.rates.checkoutConversionRate ?? null} isPercent />
        <MetricRow label="Taxa de Agendamento" value={formatPercent(results.rates.appointmentRate)} current={results.rates.appointmentRate} baselineValue={b?.rates.appointmentRate ?? null} isPercent />
        <MetricRow label="Taxa de Comparecimento" value={formatPercent(results.rates.showUpRate)} current={results.rates.showUpRate} baselineValue={b?.rates.showUpRate ?? null} isPercent />
        <MetricRow label="Taxa de Venda" value={formatPercent(results.rates.closeRate)} current={results.rates.closeRate} baselineValue={b?.rates.closeRate ?? null} isPercent />
        <MetricRow label="Conv. do Funil" value={formatPercent(results.rates.funnelConversionRate)} current={results.rates.funnelConversionRate} baselineValue={b?.rates.funnelConversionRate ?? null} isPercent />
      </MetricCard>

      <MetricCard title="Financeiro" color="text-amber-400/80">
        <MetricRow label="CPM" value={formatCurrency(results.financials.cpm)} current={results.financials.cpm} baselineValue={b?.financials.cpm ?? null} higherIsBetter={false} />
        <MetricRow label="CPC" value={formatCurrency(results.financials.cpc)} current={results.financials.cpc} baselineValue={b?.financials.cpc ?? null} higherIsBetter={false} />
        <MetricRow label="Custo por Pagina" value={formatCurrency(results.financials.costPerPage)} current={results.financials.costPerPage} baselineValue={b?.financials.costPerPage ?? null} higherIsBetter={false} />
        <MetricRow label="Custo por Checkout" value={formatCurrency(results.financials.costPerCheckout)} current={results.financials.costPerCheckout} baselineValue={b?.financials.costPerCheckout ?? null} higherIsBetter={false} />
        <MetricRow label="Custo por Agendamento" value={formatCurrency(results.financials.costPerAppointment)} current={results.financials.costPerAppointment} baselineValue={b?.financials.costPerAppointment ?? null} higherIsBetter={false} />
        <MetricRow label="Custo por Consulta" value={formatCurrency(results.financials.costPerConsultation)} current={results.financials.costPerConsultation} baselineValue={b?.financials.costPerConsultation ?? null} higherIsBetter={false} />
        <MetricRow label="CPA (Custo por Venda)" value={formatCurrency(results.financials.cpa)} current={results.financials.cpa} baselineValue={b?.financials.cpa ?? null} higherIsBetter={false} />
      </MetricCard>

      <MetricCard title="Indicadores" color="text-emerald-400/80">
        <MetricRow label="Receita Total" value={formatCurrency(results.indicators.totalRevenue)} current={results.indicators.totalRevenue} baselineValue={b?.indicators.totalRevenue ?? null} />
        <MetricRow label="ROAS" value={`${results.indicators.roas.toFixed(2)}x`} current={results.indicators.roas} baselineValue={b?.indicators.roas ?? null} />
        <MetricRow label="Conv. Total do Funil" value={formatPercent(results.indicators.totalFunnelConversion)} current={results.indicators.totalFunnelConversion} baselineValue={b?.indicators.totalFunnelConversion ?? null} isPercent />
        <MetricRow label="Ticket Medio" value={formatCurrency(results.revenue.averageTicket)} current={results.revenue.averageTicket} baselineValue={b?.revenue.averageTicket ?? null} />
        <MetricRow label="Fat. por Clique" value={formatCurrency(results.revenue.revenuePerClick)} current={results.revenue.revenuePerClick} baselineValue={b?.revenue.revenuePerClick ?? null} />
        <MetricRow label="Fat. por Consulta" value={formatCurrency(results.revenue.revenuePerConsultation)} current={results.revenue.revenuePerConsultation} baselineValue={b?.revenue.revenuePerConsultation ?? null} />
        <MetricRow label="Fat. por Reuniao" value={formatCurrency(results.revenue.revenuePerMeeting)} current={results.revenue.revenuePerMeeting} baselineValue={b?.revenue.revenuePerMeeting ?? null} />
      </MetricCard>
    </div>
  );
}
