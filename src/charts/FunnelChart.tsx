'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FunnelResults } from '@/calculations/funnelEngine';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface FunnelChartProps {
  results: FunnelResults;
}

const COLORS = ['#818cf8', '#60a5fa', '#22d3ee', '#2dd4bf', '#34d399', '#a3e635', '#facc15'];

export default function FunnelBarChart({ results }: FunnelChartProps) {
  const data = [
    { name: 'Impressoes', value: results.volumes.impressions },
    { name: 'Cliques', value: results.volumes.clicks },
    { name: 'Pagina', value: results.volumes.pageLoads },
    { name: 'Checkout', value: results.volumes.checkoutStarts },
    { name: 'Agendamento', value: results.volumes.appointmentPurchases },
    { name: 'Consulta', value: results.volumes.consultationsAttended },
    { name: 'Venda', value: results.volumes.treatmentsClosed },
  ];

  const costData = [
    { name: 'CPM', value: results.financials.cpm },
    { name: 'CPC', value: results.financials.cpc },
    { name: 'Custo/Pag', value: results.financials.costPerPage },
    { name: 'Custo/Check', value: results.financials.costPerCheckout },
    { name: 'Custo/Agend', value: results.financials.costPerAppointment },
    { name: 'Custo/Cons', value: results.financials.costPerConsultation },
    { name: 'CPA', value: results.financials.cpa },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Volume por Etapa</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              formatter={(value) => [formatNumber(Number(value), 0), 'Volume']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Custo por Etapa</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={costData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Custo']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {costData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
