export type HealthStatus = 'excellent' | 'good' | 'acceptable' | 'bad';

export interface BenchmarkRange {
  label: string;
  key: string;
  bad: { max: number };
  acceptable?: { min: number; max: number };
  good: { min: number; max: number };
  excellent: { min: number };
}

export const benchmarks: BenchmarkRange[] = [
  {
    label: 'CTR (Taxa de Clique)',
    key: 'ctr',
    bad: { max: 0.7 },
    acceptable: { min: 0.7, max: 1.5 },
    good: { min: 1.5, max: 3 },
    excellent: { min: 3 },
  },
  {
    label: 'Taxa de Conexao (Pagina)',
    key: 'connectionRate',
    bad: { max: 60 },
    good: { min: 60, max: 80 },
    excellent: { min: 80 },
  },
  {
    label: 'Conversao da Pagina',
    key: 'pageConversionRate',
    bad: { max: 5 },
    acceptable: { min: 5, max: 10 },
    good: { min: 10, max: 20 },
    excellent: { min: 20 },
  },
  {
    label: 'Conversao de Checkout',
    key: 'checkoutConversionRate',
    bad: { max: 20 },
    acceptable: { min: 20, max: 35 },
    good: { min: 35, max: 50 },
    excellent: { min: 50 },
  },
  {
    label: 'Taxa de Comparecimento',
    key: 'showUpRate',
    bad: { max: 50 },
    good: { min: 50, max: 70 },
    excellent: { min: 70 },
  },
  {
    label: 'Taxa de Fechamento',
    key: 'closeRate',
    bad: { max: 20 },
    good: { min: 20, max: 35 },
    excellent: { min: 35 },
  },
];

export function getHealthStatus(benchmark: BenchmarkRange, value: number): HealthStatus {
  if (value >= benchmark.excellent.min) return 'excellent';
  if (value >= benchmark.good.min) return 'good';
  if (benchmark.acceptable && value >= benchmark.acceptable.min) return 'acceptable';
  return 'bad';
}

export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'excellent': return '#10b981';
    case 'good': return '#3b82f6';
    case 'acceptable': return '#f59e0b';
    case 'bad': return '#ef4444';
  }
}

export function getHealthLabel(status: HealthStatus): string {
  switch (status) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Bom';
    case 'acceptable': return 'Aceitavel';
    case 'bad': return 'Ruim';
  }
}

export interface FunnelHealthScore {
  overallStatus: 'validated' | 'healthy' | 'attention' | 'critical';
  costPerAppointmentHealthy: boolean;
  roasHealthy: boolean;
  appointmentToRevenueRatio: number;
  message: string;
  details: string[];
}

export function calculateFunnelHealth(
  costPerAppointment: number,
  revenuePerMeeting: number,
  roas: number,
  rates: Record<string, number>
): FunnelHealthScore {
  const ratio = costPerAppointment > 0 ? revenuePerMeeting / costPerAppointment : 0;
  const costPerAppointmentHealthy = ratio >= 7;
  const roasHealthy = roas >= 7;

  const details: string[] = [];

  if (costPerAppointmentHealthy) {
    details.push(
      `Faturamento por reuniao (R$${revenuePerMeeting.toFixed(2)}) e ${ratio.toFixed(1)}x maior que o Custo por Agendamento (R$${costPerAppointment.toFixed(2)}). Meta: >= 7x.`
    );
  } else {
    details.push(
      `Faturamento por reuniao (R$${revenuePerMeeting.toFixed(2)}) e apenas ${ratio.toFixed(1)}x o Custo por Agendamento (R$${costPerAppointment.toFixed(2)}). Meta: >= 7x.`
    );
  }

  if (roasHealthy) {
    details.push(`ROAS de ${roas.toFixed(2)}x esta acima do minimo recomendado de 7x.`);
  } else {
    details.push(`ROAS de ${roas.toFixed(2)}x esta abaixo do minimo recomendado de 7x.`);
  }

  // Check intermediate conversions
  const weakMetrics: string[] = [];
  for (const b of benchmarks) {
    const val = rates[b.key];
    if (val !== undefined) {
      const status = getHealthStatus(b, val);
      if (status === 'bad') {
        weakMetrics.push(b.label);
      }
    }
  }

  if (weakMetrics.length > 0) {
    details.push(`Metricas abaixo do benchmark: ${weakMetrics.join(', ')}.`);
  }

  let overallStatus: FunnelHealthScore['overallStatus'];
  let message: string;

  if (costPerAppointmentHealthy && roasHealthy) {
    overallStatus = 'validated';
    message = 'Funil validado economicamente. Mesmo que algumas metricas secundarias estejam abaixo do benchmark, o modelo e economicamente viavel.';
  } else if (costPerAppointmentHealthy) {
    overallStatus = 'healthy';
    message = 'Funil saudavel. O custo por agendamento esta dentro do ideal. Melhore o ROAS para maximizar resultados.';
  } else if (roasHealthy) {
    overallStatus = 'attention';
    message = 'ROAS saudavel, mas o custo por agendamento precisa de atencao. Otimize as conversoes intermediarias.';
  } else {
    overallStatus = 'critical';
    message = 'Funil precisa de otimizacao urgente. Custo por agendamento e ROAS estao abaixo do ideal.';
  }

  return {
    overallStatus,
    costPerAppointmentHealthy,
    roasHealthy,
    appointmentToRevenueRatio: ratio,
    message,
    details,
  };
}
