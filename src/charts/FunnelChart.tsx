'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FunnelResults } from '@/calculations/funnelEngine';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface FunnelChartProps {
  results: FunnelResults;
}

const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#22c55e', '#84cc16', '#eab308'];

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
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Volume por Etapa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [formatNumber(Number(value), 0), 'Volume']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Custo por Etapa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Custo']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {costData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
