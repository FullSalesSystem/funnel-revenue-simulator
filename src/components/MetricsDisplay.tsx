'use client';

import { FunnelResults } from '@/calculations/funnelEngine';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface MetricsDisplayProps {
  results: FunnelResults;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-100">{value}</span>
    </div>
  );
}

function MetricCard({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${color}`}>{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export default function MetricsDisplay({ results }: MetricsDisplayProps) {
  const fmt = (v: number) => formatNumber(v, v < 10 ? 2 : v < 100 ? 1 : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard title="Volume" color="text-blue-400">
        <MetricRow label="Impressoes" value={fmt(results.volumes.impressions)} />
        <MetricRow label="Cliques" value={fmt(results.volumes.clicks)} />
        <MetricRow label="Paginas Carregadas" value={fmt(results.volumes.pageLoads)} />
        <MetricRow label="Iniciam Checkout" value={fmt(results.volumes.checkoutStarts)} />
        <MetricRow label="Compram Agendamento" value={fmt(results.volumes.appointmentPurchases)} />
        <MetricRow label="Comparecem a Consulta" value={fmt(results.volumes.consultationsAttended)} />
        <MetricRow label="Fecham Tratamento" value={fmt(results.volumes.treatmentsClosed)} />
      </MetricCard>

      <MetricCard title="Taxas" color="text-cyan-400">
        <MetricRow label="CTR" value={formatPercent(results.rates.ctr)} />
        <MetricRow label="Taxa de Conexao" value={formatPercent(results.rates.connectionRate)} />
        <MetricRow label="Conv. da Pagina" value={formatPercent(results.rates.pageConversionRate)} />
        <MetricRow label="Conv. do Checkout" value={formatPercent(results.rates.checkoutConversionRate)} />
        <MetricRow label="Taxa de Agendamento" value={formatPercent(results.rates.appointmentRate)} />
        <MetricRow label="Taxa de Comparecimento" value={formatPercent(results.rates.showUpRate)} />
        <MetricRow label="Taxa de Venda" value={formatPercent(results.rates.closeRate)} />
        <MetricRow label="Conv. do Funil" value={formatPercent(results.rates.funnelConversionRate)} />
      </MetricCard>

      <MetricCard title="Financeiro" color="text-amber-400">
        <MetricRow label="CPM" value={formatCurrency(results.financials.cpm)} />
        <MetricRow label="CPC" value={formatCurrency(results.financials.cpc)} />
        <MetricRow label="Custo por Pagina" value={formatCurrency(results.financials.costPerPage)} />
        <MetricRow label="Custo por Checkout" value={formatCurrency(results.financials.costPerCheckout)} />
        <MetricRow label="Custo por Agendamento" value={formatCurrency(results.financials.costPerAppointment)} />
        <MetricRow label="Custo por Consulta" value={formatCurrency(results.financials.costPerConsultation)} />
        <MetricRow label="CPA (Custo por Venda)" value={formatCurrency(results.financials.cpa)} />
      </MetricCard>

      <MetricCard title="Indicadores" color="text-emerald-400">
        <MetricRow label="Receita Total" value={formatCurrency(results.indicators.totalRevenue)} />
        <MetricRow label="ROAS" value={`${results.indicators.roas.toFixed(2)}x`} />
        <MetricRow label="Conv. Total do Funil" value={formatPercent(results.indicators.totalFunnelConversion)} />
        <MetricRow label="Ticket Medio" value={formatCurrency(results.revenue.averageTicket)} />
        <MetricRow label="Fat. por Clique" value={formatCurrency(results.revenue.revenuePerClick)} />
        <MetricRow label="Fat. por Consulta" value={formatCurrency(results.revenue.revenuePerConsultation)} />
        <MetricRow label="Fat. por Reuniao" value={formatCurrency(results.revenue.revenuePerMeeting)} />
      </MetricCard>
    </div>
  );
}
