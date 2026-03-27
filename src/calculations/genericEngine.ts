import { FunnelTypeConfig, StageConfig } from './funnelTypes';

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface GenericInputs {
  mediaCost: number;
  cpm: number;
  rates: Record<string, number>;
  averageTicket: number;
  lowTicket?: number;
}

export interface GenericResults {
  volumes: Record<string, number>;
  rates: Record<string, number>;
  costs: Record<string, number>;
  idealCosts: Record<string, number> | null;
  mediaCost: number;
  impressions: number;
  totalRevenue: number;
  highTicketRevenue: number;
  lowTicketRevenue: number;
  roas: number;
  funnelConversionRate: number;
  revenuePerMeeting: number;
  costPerMeeting: number;
  meetingToRevenueRatio: number;
  averageTicket: number;
  salesVolume: number;
}

// ─── DEFAULTS ───────────────────────────────────────────────────────────────

export function getDefaultInputs(config: FunnelTypeConfig): GenericInputs {
  const rates: Record<string, number> = {};
  for (const stage of config.stages) {
    rates[stage.key] = stage.defaultRate;
  }
  return {
    mediaCost: config.defaultMediaCost,
    cpm: config.defaultCpm,
    rates,
    averageTicket: config.defaultAverageTicket,
    lowTicket: config.hasLowTicket ? config.defaultLowTicket : undefined,
  };
}

// ─── ENGINE ─────────────────────────────────────────────────────────────────

export function calculateFunnel(inputs: GenericInputs, config: FunnelTypeConfig): GenericResults {
  const { mediaCost, cpm, rates, averageTicket, lowTicket } = inputs;

  // Impressions (always first)
  const impressions = cpm > 0 ? (mediaCost / cpm) * 1000 : 0;

  // Calculate volumes stage by stage
  const volumes: Record<string, number> = { impressions };
  let prevVolume = impressions;
  for (const stage of config.stages) {
    const rate = rates[stage.key] ?? 0;
    const volume = prevVolume * (rate / 100);
    volumes[stage.key] = volume;
    prevVolume = volume;
  }

  // Last stage = sales
  const lastStageKey = config.stages[config.stages.length - 1].key;
  const salesVolume = volumes[lastStageKey] ?? 0;

  // Cost per stage
  const costs: Record<string, number> = {};
  costs['impressions'] = cpm;
  for (const stage of config.stages) {
    const vol = volumes[stage.key] ?? 0;
    costs[stage.key] = vol > 0 ? mediaCost / vol : 0;
  }

  // Revenue
  const highTicketRevenue = salesVolume * averageTicket;
  const lowTicketRevenue =
    config.hasLowTicket && lowTicket && config.lowTicketStageKey
      ? (volumes[config.lowTicketStageKey] ?? 0) * lowTicket
      : 0;
  const totalRevenue = highTicketRevenue + lowTicketRevenue;

  // ROAS
  const roas = mediaCost > 0 ? totalRevenue / mediaCost : 0;

  // Funnel conversion: clicks → sales
  const firstVolume = volumes[config.stages[0].key] ?? 0;
  const funnelConversionRate = firstVolume > 0 ? (salesVolume / firstVolume) * 100 : 0;

  // Meeting metrics
  const meetingVolume = volumes[config.meetingStageKey] ?? 0;
  const costPerMeeting = meetingVolume > 0 ? mediaCost / meetingVolume : 0;
  const revenuePerMeeting = meetingVolume > 0 ? highTicketRevenue / meetingVolume : 0;
  const meetingToRevenueRatio = costPerMeeting > 0 ? revenuePerMeeting / costPerMeeting : 0;

  // Ideal costs (ROAS 7x target)
  let idealCosts: Record<string, number> | null = null;
  if (salesVolume > 0) {
    const idealMediaCost = totalRevenue / 7;
    idealCosts = {};
    for (const stage of config.stages) {
      const vol = volumes[stage.key] ?? 0;
      idealCosts[stage.key] = vol > 0 ? idealMediaCost / vol : 0;
    }
  }

  return {
    volumes,
    rates: { ...rates },
    costs,
    idealCosts,
    mediaCost,
    impressions,
    totalRevenue,
    highTicketRevenue,
    lowTicketRevenue,
    roas,
    funnelConversionRate,
    revenuePerMeeting,
    costPerMeeting,
    meetingToRevenueRatio,
    averageTicket,
    salesVolume,
  };
}

// ─── HEALTH / DIAGNOSTICS ───────────────────────────────────────────────────

export type HealthStatus = 'excellent' | 'good' | 'acceptable' | 'bad';

export function getHealthStatus(stage: StageConfig, value: number): HealthStatus {
  if (!stage.benchmark) return 'good';
  const b = stage.benchmark;
  if (value >= b.excellent.min) return 'excellent';
  if (value >= b.good.min) return 'good';
  if (b.acceptable && value >= b.acceptable.min) return 'acceptable';
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

export interface PricingAnalysis {
  status: 'underpriced' | 'correct' | 'low_conversion';
  isUnderpriced: boolean;
  multiplierRange: string;
  idealTicketMin: number;
  idealTicketMax: number;
  message: string;
}

export function analyzePricing(closeRate: number, currentTicket: number): PricingAnalysis {
  if (closeRate >= 80) {
    return { status: 'underpriced', isUnderpriced: true, multiplierRange: '3x-4x', idealTicketMin: currentTicket * 3, idealTicketMax: currentTicket * 4, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% indica que o ticket esta 3x-4x abaixo do ideal.` };
  } else if (closeRate >= 60) {
    return { status: 'underpriced', isUnderpriced: true, multiplierRange: '2x-3x', idealTicketMin: currentTicket * 2, idealTicketMax: currentTicket * 3, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% indica que o ticket esta 2x-3x abaixo do ideal.` };
  } else if (closeRate >= 50) {
    return { status: 'underpriced', isUnderpriced: true, multiplierRange: '1x-2x', idealTicketMin: currentTicket * 1, idealTicketMax: currentTicket * 2, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% indica que o ticket esta 1x-2x abaixo do ideal.` };
  } else if (closeRate >= 40) {
    return { status: 'underpriced', isUnderpriced: true, multiplierRange: '1x-1.5x', idealTicketMin: currentTicket * 1, idealTicketMax: currentTicket * 1.5, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% indica que o ticket pode estar 1x-1.5x abaixo do ideal.` };
  } else if (closeRate >= 20) {
    return { status: 'correct', isUnderpriced: false, multiplierRange: '', idealTicketMin: currentTicket, idealTicketMax: currentTicket, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% indica que o ticket esta corretamente precificado.` };
  } else {
    return { status: 'low_conversion', isUnderpriced: false, multiplierRange: '', idealTicketMin: currentTicket, idealTicketMax: currentTicket, message: `Taxa de fechamento de ${closeRate.toFixed(0)}% esta abaixo de 20%. O processo comercial precisa melhorar.` };
  }
}

export interface Recommendation {
  priority: number;
  area: string;
  areaLabel: string;
  title: string;
  description: string;
  color: string;
}

export interface BiggestOpportunity {
  metricLabel: string;
  metricKey: string;
  currentValue: number;
  targetValue: number;
  revenueGainPercent: number;
  description: string;
}

export interface FunnelHealthScore {
  overallStatus: 'validated' | 'healthy' | 'attention' | 'critical';
  costPerMeetingHealthy: boolean;
  roasHealthy: boolean;
  meetingToRevenueRatio: number;
  message: string;
  details: string[];
  pricingAnalysis: PricingAnalysis;
  recommendations: Recommendation[];
  biggestOpportunity: BiggestOpportunity | null;
}

export function calculateFunnelHealth(
  results: GenericResults,
  config: FunnelTypeConfig
): FunnelHealthScore {
  const { costPerMeeting, revenuePerMeeting, roas, rates, averageTicket } = results;
  const ratio = costPerMeeting > 0 ? revenuePerMeeting / costPerMeeting : 0;
  const costPerMeetingHealthy = ratio >= 7;
  const roasHealthy = roas >= 7;

  // Close rate = last stage rate
  const lastStageKey = config.stages[config.stages.length - 1].key;
  const closeRate = rates[lastStageKey] ?? 0;
  const pricingAnalysis = analyzePricing(closeRate, averageTicket);

  const details: string[] = [];

  if (costPerMeetingHealthy) {
    details.push(`Faturamento por reuniao (R$${revenuePerMeeting.toFixed(2)}) e ${ratio.toFixed(1)}x maior que o Custo por Comparecimento (R$${costPerMeeting.toFixed(2)}). Meta: >= 7x.`);
  } else {
    details.push(`Faturamento por reuniao (R$${revenuePerMeeting.toFixed(2)}) e apenas ${ratio.toFixed(1)}x o Custo por Comparecimento (R$${costPerMeeting.toFixed(2)}). Meta: >= 7x.`);
  }

  if (roasHealthy) {
    details.push(`ROAS de ${roas.toFixed(2)}x esta acima do minimo recomendado de 7x.`);
  } else {
    details.push(`ROAS de ${roas.toFixed(2)}x esta abaixo do minimo recomendado de 7x.`);
  }

  // Check weak metrics
  const weakMetrics: string[] = [];
  for (const stage of config.stages) {
    if (!stage.benchmark) continue;
    const val = rates[stage.key];
    if (val !== undefined) {
      const status = getHealthStatus(stage, val);
      if (status === 'bad') weakMetrics.push(stage.benchmark.label);
    }
  }
  if (weakMetrics.length > 0) {
    details.push(`Metricas abaixo do benchmark: ${weakMetrics.join(', ')}.`);
  }

  // Overall status
  let overallStatus: FunnelHealthScore['overallStatus'];
  let message: string;

  if (costPerMeetingHealthy && roasHealthy) {
    overallStatus = 'validated';
    message = 'Funil validado economicamente. O modelo e viavel mesmo que algumas metricas secundarias estejam abaixo do benchmark.';
  } else if (costPerMeetingHealthy) {
    overallStatus = 'healthy';
    message = 'Funil saudavel. O custo por comparecimento esta dentro do ideal. Melhore o ROAS para maximizar resultados.';
  } else if (roasHealthy) {
    overallStatus = 'attention';
    message = 'ROAS saudavel, mas o custo por comparecimento precisa de atencao. Otimize as conversoes intermediarias.';
  } else {
    overallStatus = 'critical';
    message = 'Funil precisa de otimizacao urgente. Custo por comparecimento e ROAS estao abaixo do ideal.';
  }

  // Build recommendations (back-to-front)
  const recommendations: Recommendation[] = [];
  let priority = 1;

  // Pricing
  if (pricingAnalysis.isUnderpriced) {
    recommendations.push({
      priority: priority++,
      area: 'oferta',
      areaLabel: 'Precificacao',
      title: `Ticket provavelmente ${pricingAnalysis.multiplierRange} abaixo do ideal`,
      description: pricingAnalysis.message,
      color: 'amber',
    });
  }

  // Weak metrics (reverse order = back-to-front)
  const reversedStages = [...config.stages].reverse();
  for (const stage of reversedStages) {
    if (!stage.benchmark) continue;
    const val = rates[stage.key];
    if (val === undefined) continue;
    const status = getHealthStatus(stage, val);
    if (status === 'bad') {
      recommendations.push({
        priority: priority++,
        area: 'operacao',
        areaLabel: stage.benchmark.label,
        title: `${stage.benchmark.label} abaixo do benchmark (${val.toFixed(1)}%)`,
        description: stage.recommendationDescription ?? 'Otimize esta metrica para melhorar o funil.',
        color: 'red',
      });
    }
  }

  // Scenario summaries
  if (costPerMeetingHealthy && !roasHealthy) {
    recommendations.push({
      priority: priority++,
      area: 'comercial',
      areaLabel: 'Resumo',
      title: 'Marketing esta OK — foque na oferta e no comercial',
      description: 'O custo por comparecimento esta saudavel. O ROAS baixo indica que o problema esta na oferta (ticket medio) ou no processo comercial. Otimize de tras pra frente.',
      color: 'amber',
    });
  }
  if (!costPerMeetingHealthy && roasHealthy) {
    recommendations.push({
      priority: priority++,
      area: 'marketing',
      areaLabel: 'Resumo',
      title: 'Comercial esta OK — foque no pre-vendas e marketing',
      description: 'O ROAS esta saudavel, mas o custo por comparecimento esta alto. O processo comercial converte bem, mas o marketing e pre-vendas precisam ser mais eficientes.',
      color: 'blue',
    });
  }
  if (!costPerMeetingHealthy && !roasHealthy) {
    recommendations.push({
      priority: priority++,
      area: 'operacao',
      areaLabel: 'Resumo',
      title: 'Funil precisa de otimizacao completa — comece pela oferta',
      description: 'Tanto o custo por comparecimento quanto o ROAS estao abaixo do ideal. Otimize de tras pra frente: oferta, comercial, pre-vendas, marketing.',
      color: 'red',
    });
  }

  // Sustainability warnings
  const ctrVal = rates['clicks'];
  if (ctrVal !== undefined && ctrVal > 3) {
    recommendations.push({
      priority: priority++,
      area: 'marketing',
      areaLabel: 'Sustentabilidade do CTR',
      title: `CTR de ${ctrVal.toFixed(1)}% pode nao ser sustentavel`,
      description: 'Um CTR acima de 3% e dificil de manter a longo prazo. Otimize as outras metricas para nao depender de um CTR alto.',
      color: 'amber',
    });
  }

  // Biggest opportunity
  let biggestOpportunity: BiggestOpportunity | null = null;
  let bestGainPercent = 0;

  for (const stage of config.stages) {
    if (!stage.benchmark) continue;
    const currentVal = rates[stage.key];
    if (currentVal === undefined || currentVal <= 0) continue;
    const status = getHealthStatus(stage, currentVal);
    if (status === 'excellent' || status === 'good') continue;

    const targetVal = stage.benchmark.good.min;
    if (targetVal <= currentVal) continue;

    const gainPercent = ((targetVal / currentVal) - 1) * 100;
    if (gainPercent > bestGainPercent) {
      bestGainPercent = gainPercent;
      biggestOpportunity = {
        metricLabel: stage.benchmark.label,
        metricKey: stage.key,
        currentValue: currentVal,
        targetValue: targetVal,
        revenueGainPercent: gainPercent,
        description: `${stage.recommendationDescription ?? 'Otimize esta metrica.'} Ao levar para ${targetVal}%, a receita pode aumentar em ${gainPercent.toFixed(0)}%.`,
      };
    }
  }

  return {
    overallStatus,
    costPerMeetingHealthy,
    roasHealthy,
    meetingToRevenueRatio: ratio,
    message,
    details,
    pricingAnalysis,
    recommendations,
    biggestOpportunity,
  };
}
