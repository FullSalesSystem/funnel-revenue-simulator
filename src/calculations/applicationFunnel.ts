// ─────────────────────────────────────────────────────────────────────────────
// FUNIL DE APLICAÇÃO — Visão Completa
// Motor de cálculo: métricas absolutas, relativas e de custo + meta 7x,
// cenários de otimização e playbooks prontos.
// ─────────────────────────────────────────────────────────────────────────────

// ─── TIPOS BASE ──────────────────────────────────────────────────────────────

export type Tier = 'otimo' | 'bom' | 'aceitavel' | 'ruim';

export interface Benchmark {
  /** limite superior do "ruim" */
  bad: { max: number };
  acceptable?: { min: number; max: number };
  good: { min: number; max: number };
  excellent: { min: number };
}

export interface QuestionInput {
  id: number;
  /** quantas pessoas responderam esta pergunta */
  reached: number;
}

export interface ApplicationInputs {
  investment: number;
  averageTicket: number;
  impressions: number;
  clicks: number;
  pageViews: number;
  applicationStarts: number;
  questions: QuestionInput[];
  registrations: number;
  scheduled: number;
  attended: number;
  closed: number;
}

/**
 * PREMISSA DO FUNIL: metade dos leads qualificados tende a agendar.
 * Qualificados não são informados — são estimados: Qualificados = Agendamentos × 2.
 * A Taxa de Qualificação é calculada a partir dessa estimativa.
 */
export const QUALIFIED_TO_SCHEDULED_RATE = 50;

export function qualifiedFromScheduled(scheduled: number): number {
  return scheduled * (100 / QUALIFIED_TO_SCHEDULED_RATE);
}

// ─── DEFAULTS (exemplo realista para o cliente editar) ──────────────────────

export function getDefaultApplicationInputs(): ApplicationInputs {
  return {
    investment: 10000,
    averageTicket: 6000,
    impressions: 250000,
    clicks: 3750,
    pageViews: 2800,
    applicationStarts: 1100,
    questions: [
      { id: 1, reached: 1010 },
      { id: 2, reached: 930 },
      { id: 3, reached: 840 },
      { id: 4, reached: 750 },
      { id: 5, reached: 700 },
    ],
    registrations: 640,
    scheduled: 140,
    attended: 90,
    closed: 10,
  };
}

// ─── BENCHMARKS (bom vs ótimo) ───────────────────────────────────────────────

export interface RateMetricDef {
  key: RateKey;
  label: string;
  shortLabel: string;
  fromLabel: string;
  toLabel: string;
  benchmark: Benchmark;
  playbookKey: string;
  /** taxa fixada por premissa (não é medida nem entra como alavanca de otimização) */
  isAssumption?: boolean;
}

export type RateKey =
  | 'ctr'
  | 'connection'
  | 'start'
  | 'completion'
  | 'qualification'
  | 'scheduling'
  | 'attendance'
  | 'close';

export const RATE_DEFS: RateMetricDef[] = [
  {
    key: 'ctr',
    label: 'CTR (Taxa de Clique)',
    shortLabel: 'CTR',
    fromLabel: 'Impressões',
    toLabel: 'Cliques',
    benchmark: { bad: { max: 0.7 }, acceptable: { min: 0.7, max: 1.5 }, good: { min: 1.5, max: 3 }, excellent: { min: 3 } },
    playbookKey: 'ctr',
  },
  {
    key: 'connection',
    label: 'Taxa de Conexão (Página)',
    shortLabel: 'Conexão',
    fromLabel: 'Cliques',
    toLabel: 'Visualizações de Página',
    benchmark: { bad: { max: 60 }, good: { min: 60, max: 80 }, excellent: { min: 80 } },
    playbookKey: 'connection',
  },
  {
    key: 'start',
    label: 'Taxa de Início da Aplicação',
    shortLabel: 'Início Aplicação',
    fromLabel: 'Visualizações de Página',
    toLabel: 'Iniciaram a Aplicação',
    benchmark: { bad: { max: 20 }, acceptable: { min: 20, max: 35 }, good: { min: 35, max: 55 }, excellent: { min: 55 } },
    playbookKey: 'start',
  },
  {
    key: 'completion',
    label: 'Taxa de Conclusão da Aplicação',
    shortLabel: 'Conclusão',
    fromLabel: 'Iniciaram a Aplicação',
    toLabel: 'Cadastros',
    benchmark: { bad: { max: 30 }, acceptable: { min: 30, max: 50 }, good: { min: 50, max: 70 }, excellent: { min: 70 } },
    playbookKey: 'completion',
  },
  {
    key: 'qualification',
    label: 'Taxa de Qualificação',
    shortLabel: 'Qualificação',
    fromLabel: 'Cadastros',
    toLabel: 'Leads Qualificados',
    benchmark: { bad: { max: 20 }, acceptable: { min: 20, max: 35 }, good: { min: 35, max: 50 }, excellent: { min: 50 } },
    playbookKey: 'qualification',
  },
  {
    key: 'scheduling',
    label: 'Taxa de Agendamento',
    shortLabel: 'Agendamento',
    fromLabel: 'Leads Qualificados',
    toLabel: 'Reuniões Agendadas',
    benchmark: { bad: { max: 40 }, good: { min: 40, max: 70 }, excellent: { min: 70 } },
    playbookKey: 'scheduling',
    isAssumption: true,
  },
  {
    key: 'attendance',
    label: 'Taxa de Comparecimento',
    shortLabel: 'Comparecimento',
    fromLabel: 'Reuniões Agendadas',
    toLabel: 'Reuniões Realizadas',
    // benchmark do funil High-Ticket Direto (/simulator/high-ticket)
    benchmark: { bad: { max: 75 }, good: { min: 75, max: 90 }, excellent: { min: 90 } },
    playbookKey: 'attendance',
  },
  {
    key: 'close',
    label: 'Taxa de Fechamento',
    shortLabel: 'Fechamento',
    fromLabel: 'Reuniões Realizadas',
    toLabel: 'Fechamentos',
    // benchmark do funil High-Ticket Direto (/simulator/high-ticket)
    benchmark: { bad: { max: 20 }, good: { min: 20, max: 40 }, excellent: { min: 40 } },
    playbookKey: 'close',
  },
];

/** Conversão da página (Cadastros / Visualizações) — métrica secundária de leitura */
export const PAGE_CONVERSION_BENCHMARK: Benchmark = {
  bad: { max: 5 },
  acceptable: { min: 5, max: 10 },
  good: { min: 10, max: 20 },
  excellent: { min: 20 },
};

/** Drop-off por pergunta — quanto MENOR, melhor */
export function getDropoffTier(dropPercent: number): Tier {
  if (dropPercent <= 5) return 'otimo';
  if (dropPercent <= 10) return 'bom';
  if (dropPercent <= 20) return 'aceitavel';
  return 'ruim';
}

export function getTier(benchmark: Benchmark, value: number): Tier {
  if (value >= benchmark.excellent.min) return 'otimo';
  if (value >= benchmark.good.min) return 'bom';
  if (benchmark.acceptable && value >= benchmark.acceptable.min) return 'aceitavel';
  return 'ruim';
}

export function getTierLabel(tier: Tier): string {
  switch (tier) {
    case 'otimo': return 'Ótimo';
    case 'bom': return 'Bom';
    case 'aceitavel': return 'Aceitável';
    case 'ruim': return 'Ruim';
  }
}

export function getTierColor(tier: Tier): string {
  switch (tier) {
    case 'otimo': return '#10b981';
    case 'bom': return '#3b82f6';
    case 'aceitavel': return '#f59e0b';
    case 'ruim': return '#ef4444';
  }
}

// ─── RESULTADOS ──────────────────────────────────────────────────────────────

export interface RateMetricResult extends RateMetricDef {
  value: number;
  tier: Tier;
}

export interface QuestionFlowRow {
  label: string;
  reached: number;
  /** % de quem iniciou a aplicação que chegou até aqui */
  retentionFromStart: number;
  /** % perdido em relação à etapa anterior */
  dropFromPrevious: number;
  tier: Tier;
  isWorst: boolean;
}

export interface CostMetric {
  key: string;
  label: string;
  value: number;
  /** custo máximo saudável para bater a meta 7x com os volumes atuais */
  maxForGoal: number | null;
  withinGoal: boolean | null;
}

export interface ApplicationResults {
  inputs: ApplicationInputs;
  /** Leads qualificados ESTIMADOS pela premissa (Agendamentos × 2) */
  qualified: number;
  rates: RateMetricResult[];
  ratesByKey: Record<RateKey, RateMetricResult>;
  pageConversionRate: number;
  pageConversionTier: Tier;
  overallConversion: number;
  questionFlow: QuestionFlowRow[];
  totalApplicationDrop: number;
  costs: CostMetric[];
  costsByKey: Record<string, CostMetric>;
  revenue: number;
  roas: number;
  revenuePerAttended: number;
  costPerAttended: number;
  metaRatio: number;
  metaOk: boolean;
  /** quanto a receita (ou o ratio) precisa multiplicar para chegar em 7x */
  gapMultiplier: number;
  idealInvestment: number;
}

const safeDiv = (a: number, b: number): number => (b > 0 ? a / b : 0);
const pct = (a: number, b: number): number => (b > 0 ? (a / b) * 100 : 0);

export const META_TARGET = 7;

export function calculateApplication(inputs: ApplicationInputs): ApplicationResults {
  const {
    investment, averageTicket, impressions, clicks, pageViews,
    applicationStarts, questions, registrations,
    scheduled, attended, closed,
  } = inputs;

  // Premissa: metade dos qualificados agenda → qualificados estimados a partir dos agendamentos
  const qualified = qualifiedFromScheduled(scheduled);

  // ── Taxas relativas (cada etapa vs anterior) ──
  const rateValues: Record<RateKey, number> = {
    ctr: pct(clicks, impressions),
    connection: pct(pageViews, clicks),
    start: pct(applicationStarts, pageViews),
    completion: pct(registrations, applicationStarts),
    qualification: pct(qualified, registrations),
    scheduling: QUALIFIED_TO_SCHEDULED_RATE,
    attendance: pct(attended, scheduled),
    close: pct(closed, attended),
  };

  const rates: RateMetricResult[] = RATE_DEFS.map((def) => ({
    ...def,
    value: rateValues[def.key],
    tier: getTier(def.benchmark, rateValues[def.key]),
  }));
  const ratesByKey = Object.fromEntries(rates.map((r) => [r.key, r])) as Record<RateKey, RateMetricResult>;

  const pageConversionRate = pct(registrations, pageViews);
  const pageConversionTier = getTier(PAGE_CONVERSION_BENCHMARK, pageConversionRate);
  const overallConversion = pct(closed, pageViews);

  // ── Drop-off das perguntas ──
  const questionFlow: QuestionFlowRow[] = [];
  let prev = applicationStarts;
  questions.forEach((q, i) => {
    const drop = prev > 0 ? Math.max(0, ((prev - q.reached) / prev) * 100) : 0;
    questionFlow.push({
      label: `Pergunta ${i + 1}`,
      reached: q.reached,
      retentionFromStart: pct(q.reached, applicationStarts),
      dropFromPrevious: drop,
      tier: getDropoffTier(drop),
      isWorst: false,
    });
    prev = q.reached;
  });
  // Envio final (última pergunta → cadastro concluído)
  if (questions.length > 0) {
    const drop = prev > 0 ? Math.max(0, ((prev - registrations) / prev) * 100) : 0;
    questionFlow.push({
      label: 'Envio final',
      reached: registrations,
      retentionFromStart: pct(registrations, applicationStarts),
      dropFromPrevious: drop,
      tier: getDropoffTier(drop),
      isWorst: false,
    });
  }
  let worstIdx = -1;
  let worstDrop = 0;
  questionFlow.forEach((row, i) => {
    if (row.dropFromPrevious > worstDrop) {
      worstDrop = row.dropFromPrevious;
      worstIdx = i;
    }
  });
  if (worstIdx >= 0 && worstDrop > 5) questionFlow[worstIdx].isWorst = true;
  const totalApplicationDrop = applicationStarts > 0
    ? Math.max(0, ((applicationStarts - registrations) / applicationStarts) * 100)
    : 0;

  // ── Receita e meta ──
  const revenue = closed * averageTicket;
  const roas = safeDiv(revenue, investment);
  const revenuePerAttended = safeDiv(revenue, attended);
  const costPerAttended = safeDiv(investment, attended);
  const metaRatio = costPerAttended > 0 ? revenuePerAttended / costPerAttended : 0;
  const metaOk = metaRatio >= META_TARGET;
  const gapMultiplier = metaRatio > 0 ? META_TARGET / metaRatio : 0;
  const idealInvestment = revenue / META_TARGET;

  // ── Custos por etapa ──
  const volumeByCostKey: Record<string, number> = {
    cpm: impressions / 1000,
    costPerImpression: impressions,
    cpc: clicks,
    costPerPageView: pageViews,
    costPerStart: applicationStarts,
    costPerLead: registrations,
    costPerQualified: qualified,
    costPerScheduled: scheduled,
    costPerAttended: attended,
    costPerClose: closed,
  };
  const costLabels: Record<string, string> = {
    cpm: 'CPM (custo por mil impressões)',
    costPerImpression: 'Custo por Impressão',
    cpc: 'CPC (custo por clique)',
    costPerPageView: 'Custo por Visualização de Página',
    costPerStart: 'Custo por Início de Aplicação',
    costPerLead: 'Custo por Lead (CPL)',
    costPerQualified: 'Custo por Lead Qualificado (CPLQ)',
    costPerScheduled: 'Custo por Reunião Agendada',
    costPerAttended: 'Custo por Reunião Realizada',
    costPerClose: 'Custo por Fechamento (CPA)',
  };

  const costs: CostMetric[] = Object.keys(volumeByCostKey).map((key) => {
    const vol = volumeByCostKey[key];
    const value = safeDiv(investment, vol);
    const maxForGoal = revenue > 0 && vol > 0 ? idealInvestment / vol : null;
    return {
      key,
      label: costLabels[key],
      value,
      maxForGoal,
      withinGoal: maxForGoal !== null ? value <= maxForGoal : null,
    };
  });
  const costsByKey = Object.fromEntries(costs.map((c) => [c.key, c]));

  return {
    inputs,
    qualified,
    rates,
    ratesByKey,
    pageConversionRate,
    pageConversionTier,
    overallConversion,
    questionFlow,
    totalApplicationDrop,
    costs,
    costsByKey,
    revenue,
    roas,
    revenuePerAttended,
    costPerAttended,
    metaRatio,
    metaOk,
    gapMultiplier,
    idealInvestment,
  };
}

// ─── CENÁRIOS (projeção mudando taxas) ───────────────────────────────────────

export interface ScenarioProjection {
  volumes: Record<RateKey, number>;
  registrations: number;
  qualified: number;
  scheduled: number;
  attended: number;
  closed: number;
  revenue: number;
  roas: number;
  metaRatio: number;
  costPerLead: number;
  costPerQualified: number;
  costPerScheduled: number;
  costPerAttended: number;
  costPerClose: number;
}

/**
 * Reconstrói o funil a partir das taxas, com overrides.
 * Mantém investimento e impressões fixos; volumes abaixo escalam em cadeia.
 */
export function projectScenario(
  results: ApplicationResults,
  overrides: Partial<Record<RateKey, number>>,
  ticketOverride?: number
): ScenarioProjection {
  const { inputs, ratesByKey } = results;
  const ticket = ticketOverride ?? inputs.averageTicket;
  const rate = (k: RateKey) => (overrides[k] ?? ratesByKey[k].value) / 100;

  const clicks = inputs.impressions * rate('ctr');
  const pageViews = clicks * rate('connection');
  const starts = pageViews * rate('start');
  const registrations = starts * rate('completion');
  const qualified = registrations * rate('qualification');
  const scheduled = qualified * rate('scheduling');
  const attended = scheduled * rate('attendance');
  const closed = attended * rate('close');

  const revenue = closed * ticket;
  const roas = safeDiv(revenue, inputs.investment);

  return {
    volumes: {
      ctr: clicks,
      connection: pageViews,
      start: starts,
      completion: registrations,
      qualification: qualified,
      scheduling: scheduled,
      attendance: attended,
      close: closed,
    },
    registrations,
    qualified,
    scheduled,
    attended,
    closed,
    revenue,
    roas,
    metaRatio: roas,
    costPerLead: safeDiv(inputs.investment, registrations),
    costPerQualified: safeDiv(inputs.investment, qualified),
    costPerScheduled: safeDiv(inputs.investment, scheduled),
    costPerAttended: safeDiv(inputs.investment, attended),
    costPerClose: safeDiv(inputs.investment, closed),
  };
}

// ─── ALAVANCAS PARA A META ───────────────────────────────────────────────────

export type Feasibility = 'ja-bateu' | 'realista' | 'agressivo' | 'inviavel';

export interface Lever {
  key: RateKey | 'ticket';
  label: string;
  isRate: boolean;
  currentValue: number;
  tier: Tier | null;
  goodTarget: number | null;
  excellentTarget: number | null;
  /** projeção com a alavanca no nível "ótimo" (só faz sentido se atual < ótimo) */
  atExcellent: ScenarioProjection | null;
  ratioAtExcellent: number | null;
  /** valor necessário para bater a meta SÓ com essa alavanca */
  soloRequired: number;
  soloFeasibility: Feasibility;
  playbookKey: string;
}

export function computeLevers(results: ApplicationResults): Lever[] {
  const { ratesByKey, metaRatio, inputs } = results;
  const levers: Lever[] = [];

  for (const def of RATE_DEFS) {
    if (def.isAssumption) continue; // premissa fixa não é alavanca
    const r = ratesByKey[def.key];
    const excellentTarget = def.benchmark.excellent.min;
    const goodTarget = def.benchmark.good.min;
    const belowExcellent = r.value < excellentTarget;

    const atExcellent = belowExcellent
      ? projectScenario(results, { [def.key]: excellentTarget })
      : null;

    // ratio é linear na taxa: required = atual × (7 / ratioAtual)
    const soloRequired = metaRatio > 0 ? r.value * (META_TARGET / metaRatio) : Infinity;
    let soloFeasibility: Feasibility;
    if (metaRatio >= META_TARGET) soloFeasibility = 'ja-bateu';
    else if (soloRequired <= excellentTarget) soloFeasibility = 'realista';
    else if (soloRequired <= 100) soloFeasibility = 'agressivo';
    else soloFeasibility = 'inviavel';

    levers.push({
      key: def.key,
      label: def.label,
      isRate: true,
      currentValue: r.value,
      tier: r.tier,
      goodTarget,
      excellentTarget,
      atExcellent,
      ratioAtExcellent: atExcellent?.metaRatio ?? null,
      soloRequired,
      soloFeasibility,
      playbookKey: def.playbookKey,
    });
  }

  // Ticket médio como alavanca
  const ticketRequired = metaRatio > 0 ? inputs.averageTicket * (META_TARGET / metaRatio) : Infinity;
  levers.push({
    key: 'ticket',
    label: 'Ticket Médio',
    isRate: false,
    currentValue: inputs.averageTicket,
    tier: null,
    goodTarget: null,
    excellentTarget: null,
    atExcellent: null,
    ratioAtExcellent: null,
    soloRequired: ticketRequired,
    soloFeasibility: metaRatio >= META_TARGET ? 'ja-bateu' : 'realista',
    playbookKey: 'ticket',
  });

  // Ordena pelo maior ganho de ratio no cenário "ótimo"
  return levers.sort((a, b) => (b.ratioAtExcellent ?? 0) - (a.ratioAtExcellent ?? 0));
}

/** Cenário com TODAS as taxas em pelo menos "bom" / "ótimo" (não rebaixa o que já está acima) */
export function projectAllAt(results: ApplicationResults, level: 'good' | 'excellent'): ScenarioProjection {
  const overrides: Partial<Record<RateKey, number>> = {};
  for (const def of RATE_DEFS) {
    const current = results.ratesByKey[def.key].value;
    const target = level === 'good' ? def.benchmark.good.min : def.benchmark.excellent.min;
    overrides[def.key] = def.isAssumption ? current : Math.max(current, target);
  }
  return projectScenario(results, overrides);
}

// ─── ANÁLISE DE PRECIFICAÇÃO (lógica herdada do simulador) ───────────────────

export interface PricingAnalysis {
  isUnderpriced: boolean;
  multiplierRange: string;
  message: string;
}

export function analyzeTicketPricing(closeRate: number): PricingAnalysis {
  if (closeRate >= 80) return { isUnderpriced: true, multiplierRange: '3x–4x', message: `Fechamento de ${closeRate.toFixed(0)}% indica que o ticket está 3x–4x abaixo do que o mercado pagaria.` };
  if (closeRate >= 60) return { isUnderpriced: true, multiplierRange: '2x–3x', message: `Fechamento de ${closeRate.toFixed(0)}% indica que o ticket está 2x–3x abaixo do ideal.` };
  if (closeRate >= 50) return { isUnderpriced: true, multiplierRange: '1x–2x', message: `Fechamento de ${closeRate.toFixed(0)}% indica espaço para subir o ticket em até 2x.` };
  if (closeRate >= 40) return { isUnderpriced: true, multiplierRange: '1x–1,5x', message: `Fechamento de ${closeRate.toFixed(0)}% sugere que o ticket pode subir até 1,5x.` };
  if (closeRate >= 20) return { isUnderpriced: false, multiplierRange: '', message: `Fechamento de ${closeRate.toFixed(0)}% indica precificação correta para o momento.` };
  return { isUnderpriced: false, multiplierRange: '', message: `Fechamento de ${closeRate.toFixed(0)}% está abaixo de 20% — antes de mexer no preço, conserte o processo comercial.` };
}

// ─── PLANEJADOR DE META (engenharia reversa a partir do faturamento-alvo) ────
// Benchmarks de referência: os mesmos usados no funil High-Ticket Direto
// (/simulator/high-ticket), adaptados às etapas do funil de aplicação.

export type PlanLevel = 'atual' | 'bom' | 'otimo';

export interface GoalStageRequirement {
  key: string;
  label: string;
  /** volume atual informado pelo cliente */
  today: number;
  /** volume necessário para a meta neste cenário */
  required: number;
  /** required / today (0 quando today = 0) */
  multiplier: number;
}

export interface GoalScenario {
  level: PlanLevel;
  label: string;
  sublabel: string;
  /** false quando alguma taxa = 0 impede reconstruir o funil */
  feasible: boolean;
  stages: GoalStageRequirement[];
  /** investimento estimado comprando as impressões necessárias ao CPM atual */
  requiredInvestment: number | null;
  investmentMultiplier: number | null;
  costPerAttended: number | null;
  revenuePerAttended: number;
  metaRatio: number | null;
  metaOk: boolean | null;
}

export interface GoalAdjustment {
  key: RateKey;
  label: string;
  shortLabel: string;
  playbookKey: string;
  current: number;
  tier: Tier;
  benchmark: Benchmark;
  targetGood: number;
  targetExcellent: number;
  /** R$ de investimento economizado por mês se SÓ esta taxa for ao piso do "ótimo" */
  investmentSaved: number | null;
  /** redução % das impressões necessárias no mesmo movimento */
  impressionsReduction: number | null;
}

export interface GoalPlanResult {
  revenueGoal: number;
  ticket: number;
  closesNeeded: number;
  /** receita real entregue pelos fechamentos arredondados p/ cima */
  planRevenue: number;
  cpm: number | null;
  scenarios: GoalScenario[];
  /** métricas abaixo do "ótimo", ordenadas pela economia que geram */
  adjustments: GoalAdjustment[];
}

const PLAN_STAGE_LABELS: { key: string; label: string }[] = [
  { key: 'impressions', label: 'Impressões' },
  { key: 'clicks', label: 'Cliques' },
  { key: 'pageViews', label: 'Visualizações de Página' },
  { key: 'starts', label: 'Inícios de Aplicação' },
  { key: 'registrations', label: 'Cadastros' },
  { key: 'qualified', label: 'Leads Qualificados' },
  { key: 'scheduled', label: 'Reuniões Agendadas' },
  { key: 'attended', label: 'Reuniões Realizadas' },
  { key: 'closed', label: 'Fechamentos' },
];

/** Taxas do cenário: atuais, ou elevadas ao piso do bench (nunca rebaixa o que já está acima) */
function ratesAtLevel(results: ApplicationResults, level: PlanLevel): Record<RateKey, number> {
  const out = {} as Record<RateKey, number>;
  for (const def of RATE_DEFS) {
    const current = results.ratesByKey[def.key].value;
    if (level === 'atual' || def.isAssumption) out[def.key] = current;
    else {
      const floor = level === 'bom' ? def.benchmark.good.min : def.benchmark.excellent.min;
      out[def.key] = Math.max(current, floor);
    }
  }
  return out;
}

/** Reconstrói o funil de trás pra frente a partir dos fechamentos necessários */
function volumesForCloses(closesNeeded: number, rates: Record<RateKey, number>): Record<string, number> | null {
  const chain: RateKey[] = ['close', 'attendance', 'scheduling', 'qualification', 'completion', 'start', 'connection', 'ctr'];
  if (chain.some((k) => rates[k] <= 0)) return null;
  const attended = closesNeeded / (rates.close / 100);
  const scheduled = attended / (rates.attendance / 100);
  const qualified = scheduled / (rates.scheduling / 100);
  const registrations = qualified / (rates.qualification / 100);
  const starts = registrations / (rates.completion / 100);
  const pageViews = starts / (rates.start / 100);
  const clicks = pageViews / (rates.connection / 100);
  const impressions = clicks / (rates.ctr / 100);
  return { impressions, clicks, pageViews, starts, registrations, qualified, scheduled, attended, closed: closesNeeded };
}

export function planForGoal(results: ApplicationResults, revenueGoal: number): GoalPlanResult {
  const { inputs } = results;
  const ticket = inputs.averageTicket;
  const closesNeeded = ticket > 0 ? Math.ceil(revenueGoal / ticket) : 0;
  const planRevenue = closesNeeded * ticket;
  const cpm = inputs.impressions > 0 && inputs.investment > 0
    ? (inputs.investment / inputs.impressions) * 1000
    : null;

  const todayByKey: Record<string, number> = {
    impressions: inputs.impressions,
    clicks: inputs.clicks,
    pageViews: inputs.pageViews,
    starts: inputs.applicationStarts,
    registrations: inputs.registrations,
    qualified: results.qualified,
    scheduled: inputs.scheduled,
    attended: inputs.attended,
    closed: inputs.closed,
  };

  const buildScenario = (level: PlanLevel, label: string, sublabel: string): GoalScenario => {
    const rates = ratesAtLevel(results, level);
    const volumes = closesNeeded > 0 ? volumesForCloses(closesNeeded, rates) : null;
    if (!volumes) {
      return {
        level, label, sublabel, feasible: false, stages: [],
        requiredInvestment: null, investmentMultiplier: null,
        costPerAttended: null, revenuePerAttended: 0, metaRatio: null, metaOk: null,
      };
    }
    const stages: GoalStageRequirement[] = PLAN_STAGE_LABELS.map(({ key, label: stageLabel }) => ({
      key,
      label: stageLabel,
      today: todayByKey[key],
      required: volumes[key],
      multiplier: todayByKey[key] > 0 ? volumes[key] / todayByKey[key] : 0,
    }));
    const requiredInvestment = cpm !== null ? (volumes.impressions / 1000) * cpm : null;
    const costPerAttended = requiredInvestment !== null ? requiredInvestment / volumes.attended : null;
    const revenuePerAttended = planRevenue / volumes.attended;
    const metaRatio = costPerAttended !== null && costPerAttended > 0 ? revenuePerAttended / costPerAttended : null;
    return {
      level, label, sublabel, feasible: true, stages,
      requiredInvestment,
      investmentMultiplier: requiredInvestment !== null && inputs.investment > 0 ? requiredInvestment / inputs.investment : null,
      costPerAttended, revenuePerAttended, metaRatio,
      metaOk: metaRatio !== null ? metaRatio >= META_TARGET : null,
    };
  };

  const scenarios = [
    buildScenario('atual', 'Com suas taxas atuais', 'nenhuma otimização, só mais volume'),
    buildScenario('bom', 'Taxas no Bom', 'cada taxa em pelo menos o piso do "bom"'),
    buildScenario('otimo', 'Taxas no Ótimo', 'cada taxa em pelo menos o piso do "ótimo"'),
  ];

  // Ajustes: quanto cada taxa abaixo do "ótimo" economiza se for a única otimizada
  const baseRates = ratesAtLevel(results, 'atual');
  const baseVolumes = closesNeeded > 0 ? volumesForCloses(closesNeeded, baseRates) : null;
  const adjustments: GoalAdjustment[] = [];
  for (const def of RATE_DEFS) {
    if (def.isAssumption) continue; // premissa fixa não entra como ajuste
    const r = results.ratesByKey[def.key];
    const targetExcellent = def.benchmark.excellent.min;
    if (r.value >= targetExcellent) continue;
    let investmentSaved: number | null = null;
    let impressionsReduction: number | null = null;
    if (baseVolumes) {
      const withFix = volumesForCloses(closesNeeded, { ...baseRates, [def.key]: targetExcellent });
      if (withFix) {
        impressionsReduction = baseVolumes.impressions > 0
          ? (1 - withFix.impressions / baseVolumes.impressions) * 100
          : null;
        investmentSaved = cpm !== null
          ? ((baseVolumes.impressions - withFix.impressions) / 1000) * cpm
          : null;
      }
    }
    adjustments.push({
      key: def.key,
      label: def.label,
      shortLabel: def.shortLabel,
      playbookKey: def.playbookKey,
      current: r.value,
      tier: r.tier,
      benchmark: def.benchmark,
      targetGood: def.benchmark.good.min,
      targetExcellent,
      investmentSaved,
      impressionsReduction,
    });
  }
  adjustments.sort((a, b) => (b.investmentSaved ?? -1) - (a.investmentSaved ?? -1));

  return { revenueGoal, ticket, closesNeeded, planRevenue, cpm, scenarios, adjustments };
}

// ─── PLAYBOOKS (textos prontos de otimização) ────────────────────────────────

export interface Playbook {
  key: string;
  title: string;
  diagnosis: string;
  actions: string[];
}

export const PLAYBOOKS: Record<string, Playbook> = {
  ctr: {
    key: 'ctr',
    title: 'Como otimizar o CTR',
    diagnosis:
      'O CTR mede a força do criativo e da promessa no feed. CTR baixo = anúncio invisível ou promessa fraca; você paga o leilão inteiro e leva poucos cliques.',
    actions: [
      'Suba 3 a 5 criativos novos por semana e mate sem dó os que ficarem abaixo de 1% de CTR após ~2.000 impressões.',
      'Teste ângulos diferentes de hook (dor, curiosidade, prova, inimigo comum) — não variações do mesmo criativo.',
      'Nos vídeos, os 3 primeiros segundos decidem tudo: comece com a dor ou o resultado, nunca com apresentação.',
      'Use especificidade na headline: número, prazo e resultado ("R$ 47 mil em 30 dias com 1 funil") em vez de promessa genérica.',
      'Teste formato UGC (gravado no celular, cara de conteúdo) contra o criativo produzido — em aplicação, UGC costuma vencer.',
      'Revise a segmentação: público muito frio ou muito amplo derruba CTR. Priorize lookalike de compradores e envolvimento.',
    ],
  },
  connection: {
    key: 'connection',
    title: 'Como otimizar a Taxa de Conexão',
    diagnosis:
      'Conexão é quantos cliques viram página carregada. Perda aqui é dinheiro queimado antes de qualquer copy: é problema técnico, não de persuasão.',
    actions: [
      'Garanta carregamento em menos de 3 segundos no 4G — teste no PageSpeed Insights com foco em mobile.',
      'Comprima imagens (WebP), remova scripts desnecessários e adie tudo que não é essencial para o primeiro paint.',
      'Elimine redirecionamentos intermediários entre o anúncio e a página (encurtadores, UTM builders que redirecionam).',
      'Use hospedagem com CDN (Vercel, Cloudflare) em vez de servidor compartilhado lento.',
      'Teste a página dentro do navegador do Instagram/Facebook (in-app browser) — é lá que a maioria dos cliques acontece.',
    ],
  },
  start: {
    key: 'start',
    title: 'Como otimizar o Início da Aplicação',
    diagnosis:
      'Mede quantos visitantes clicam para começar a aplicação. Baixo = a página não convence que vale a pena aplicar, ou o botão não é óbvio.',
    actions: [
      'Coloque promessa + CTA acima da dobra: o visitante precisa entender a oferta e ver o botão sem rolar.',
      'Garanta congruência total entre o anúncio e a página (mesma promessa, mesmo visual) — quebra de expectativa mata o início.',
      'Troque CTA genérico ("Enviar", "Continuar") por CTA de valor ("Quero minha análise gratuita", "Aplicar para a mentoria").',
      'Mostre o que acontece depois de aplicar (passo 1, 2, 3) para reduzir o medo do compromisso.',
      'Adicione prova social perto do botão: depoimento curto, número de clientes, logos.',
      'Reduza distração: página de aplicação não precisa de menu, footer cheio de links nem seções institucionais.',
    ],
  },
  completion: {
    key: 'completion',
    title: 'Como otimizar a Conclusão da Aplicação (drop-off das perguntas)',
    diagnosis:
      'Mede quem começou e terminou a aplicação. O relatório de drop-off por pergunta mostra exatamente onde as pessoas desistem — otimize pergunta a pergunta, não o formulário inteiro.',
    actions: [
      'Comece pelas perguntas mais fáceis (nome, área de atuação) e deixe as sensíveis (faturamento, telefone) para o final — compromisso progressivo.',
      'Uma pergunta por tela, com barra de progresso visível ("3 de 7").',
      'Corte toda pergunta que não muda a decisão de qualificar: cada pergunta a mais é imposto sobre a conversão.',
      'Ative autoavanço em perguntas de múltipla escolha (sem precisar clicar em "próximo").',
      'Na pergunta com maior drop-off, teste: reescrever o enunciado, transformar campo aberto em múltipla escolha, ou movê-la de posição.',
      'No mobile, use o teclado certo para cada campo (numérico para telefone, e-mail com @) e evite campos longos de digitação.',
    ],
  },
  qualification: {
    key: 'qualification',
    title: 'Como otimizar a Taxa de Qualificação',
    diagnosis:
      'Mede quantos cadastros são leads com perfil real de compra. Taxa baixa = você está pagando para atrair curioso. O problema quase sempre está ANTES do formulário: promessa e tráfego.',
    actions: [
      'Revise a promessa do anúncio: promessa muito fácil ("renda extra", "sem investir nada") atrai desqualificado em massa.',
      'Ancore o investimento na página ou no anúncio ("mentoria a partir de R$ X mil") para filtrar antes do cadastro.',
      'Endureça as perguntas de qualificação: faturamento atual, capacidade de investimento, momento do negócio.',
      'Direcione o criativo para o avatar certo: fale a linguagem de quem já tem negócio/renda, não do iniciante.',
      'Crie públicos lookalike a partir de COMPRADORES (não de leads) e exclua públicos que historicamente não qualificam.',
      'Se a taxa está alta demais (acima de 70%), o filtro pode estar frouxo — cheque se o time comercial concorda com o critério.',
    ],
  },
  scheduling: {
    key: 'scheduling',
    title: 'Como otimizar a Taxa de Agendamento',
    diagnosis:
      'Mede quantos leads qualificados viram reunião marcada. É a métrica mais sensível a VELOCIDADE: lead qualificado esfria em horas, não em dias.',
    actions: [
      'Speed-to-lead: primeiro contato em até 5 minutos após a aplicação multiplica a taxa de conexão com o lead.',
      'Coloque o calendário na própria página de obrigado — o lead agenda sozinho no pico do interesse, sem esperar contato.',
      'Cadência multicanal nas primeiras 48h: WhatsApp + ligação + áudio, não apenas uma mensagem.',
      'Ofereça 2 ou 3 horários específicos ("terça 10h ou quarta 15h?") em vez de mandar link aberto de agenda.',
      'Dê motivo e valor à reunião no script: "sessão de diagnóstico do seu funil", nunca "bater um papo".',
      'Registre motivo de não agendamento (sem resposta, sem interesse, sem dinheiro) para atacar a causa certa.',
    ],
  },
  attendance: {
    key: 'attendance',
    title: 'Como otimizar a Taxa de Comparecimento',
    diagnosis:
      'Mede quantas reuniões marcadas acontecem. No-show é o vazamento mais caro do fundo do funil: você já pagou pelo lead, pela qualificação e pelo agendamento.',
    actions: [
      'Cadência de lembretes: confirmação na hora, véspera (24h), 3h antes e 15min antes — com link da chamada em todos.',
      'Peça confirmação ativa ("responda SIM para confirmar") na véspera; quem não responde recebe ligação.',
      'Agende para no máximo 48h depois do contato — cada dia de espera derruba o comparecimento.',
      'Envie um vídeo curto de pré-frame do especialista ("o que vamos ver na sua sessão") logo após o agendamento.',
      'Reagende no-shows imediatamente, no mesmo dia, enquanto o lead ainda está quente.',
      'Crie custo de saída: material para o lead preencher/assistir antes da reunião aumenta o compromisso.',
    ],
  },
  close: {
    key: 'close',
    title: 'Como otimizar a Taxa de Fechamento',
    diagnosis:
      'Mede quantas reuniões realizadas viram contrato. Abaixo de 15%, o problema costuma ser script e condução; entre 15% e 30% é refinamento; acima de 40–50%, seu ticket provavelmente está barato.',
    actions: [
      'Estruture a call em diagnóstico → implicação → solução: a oferta só entra depois que a dor foi verbalizada pelo lead.',
      'Mapeie as 5 objeções mais frequentes (preço, tempo, cônjuge, "vou pensar", momento) e tenha resposta ensaiada para cada uma.',
      'Grave todas as calls e revise 2 por semana com o time — fechamento sobe no detalhe, não na teoria.',
      'Adicione redução de risco na oferta: garantia condicional, entrada menor, bônus de implementação.',
      'Implemente follow-up estruturado de 7 dias para os "vou pensar" — boa parte dos fechamentos vem depois da call.',
      'Qualifique de novo no início da call (orçamento e decisor presentes) para não gastar reunião com quem não pode comprar.',
    ],
  },
  ticket: {
    key: 'ticket',
    title: 'Como otimizar o Ticket Médio',
    diagnosis:
      'O ticket multiplica todo o resto do funil: dobrar o ticket dobra o faturamento por reunião sem precisar de um lead a mais. Fechamento alto demais é o sintoma clássico de ticket barato.',
    actions: [
      'Se a taxa de fechamento está acima de 40–50%, suba o preço — o mercado está dizendo que aceita pagar mais.',
      'Empilhe valor na oferta: implementação, acompanhamento, comunidade e bônus com valor percebido claro.',
      'Crie um tier premium (done-with-you ou done-for-you) para capturar os 10–20% que pagariam 2–3x mais.',
      'Venda pelo retorno, não pelo esforço: ancore o preço no resultado que o cliente busca (ex.: "meta de +R$ 50 mil/mês").',
      'Facilite o SIM sem baratear: parcelamento inteligente e condição de entrada, mantendo o valor cheio.',
      'Teste aumentos graduais (10–20%) a cada turma/mês e acompanhe o impacto real na taxa de fechamento.',
    ],
  },
};

// ─── STATUS GERAL ────────────────────────────────────────────────────────────

export interface OverallHealth {
  status: 'validado' | 'quase-la' | 'atencao' | 'critico';
  title: string;
  message: string;
}

export function getOverallHealth(results: ApplicationResults): OverallHealth {
  const { metaRatio, ratesByKey } = results;
  const weakCount = results.rates.filter((r) => r.tier === 'ruim').length;

  if (metaRatio >= META_TARGET) {
    return {
      status: 'validado',
      title: 'Meta batida — funil validado economicamente',
      message: weakCount > 0
        ? `Cada real investido volta ${metaRatio.toFixed(1)}x em faturamento por reunião. Ainda há ${weakCount} métrica(s) no vermelho: otimizá-las agora é lucro composto, não sobrevivência.`
        : `Cada real investido volta ${metaRatio.toFixed(1)}x. Hora de ESCALAR o investimento mantendo as métricas — a meta segue válida em qualquer volume.`,
    };
  }
  if (metaRatio >= 5) {
    return {
      status: 'quase-la',
      title: 'Quase lá — faltam poucos pontos para a meta',
      message: `A relação está em ${metaRatio.toFixed(1)}x de 7x. Uma única alavanca no nível "ótimo" costuma resolver — veja o plano abaixo, priorizado por impacto.`,
    };
  }
  if (metaRatio >= 3) {
    return {
      status: 'atencao',
      title: 'Funil operante, mas longe da meta',
      message: `Relação de ${metaRatio.toFixed(1)}x contra a meta de 7x. Será preciso combinar 2–3 alavancas (fundo do funil primeiro: fechamento, ticket, comparecimento). O plano abaixo mostra o caminho.`,
    };
  }
  const closeTier = ratesByKey.close.tier;
  return {
    status: 'critico',
    title: 'Funil abaixo do ponto de equilíbrio saudável',
    message: closeTier === 'ruim'
      ? `Relação de ${metaRatio.toFixed(1)}x. Comece pelo fundo: a taxa de fechamento está no vermelho e é a alavanca que mais devolve resultado por ponto melhorado.`
      : `Relação de ${metaRatio.toFixed(1)}x. Otimize de trás para frente — fechamento, ticket e comparecimento antes de mexer em tráfego.`,
  };
}
