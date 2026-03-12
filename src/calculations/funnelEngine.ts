export interface FunnelInputs {
  impressions: number;
  cpm: number;
  mediaCost: number;
  ctr: number;
  connectionRate: number;
  pageConversionRate: number;
  checkoutConversionRate: number;
  appointmentRate: number;
  showUpRate: number;
  closeRate: number;
  averageTicket: number;
}

export interface FunnelVolumes {
  impressions: number;
  clicks: number;
  pageLoads: number;
  checkoutStarts: number;
  appointmentPurchases: number;
  consultationsAttended: number;
  treatmentsClosed: number;
}

export interface FunnelRates {
  ctr: number;
  connectionRate: number;
  pageConversionRate: number;
  checkoutConversionRate: number;
  appointmentRate: number;
  showUpRate: number;
  closeRate: number;
  funnelConversionRate: number;
}

export interface FunnelFinancials {
  cpm: number;
  cpc: number;
  costPerPage: number;
  costPerCheckout: number;
  costPerAppointment: number;
  costPerConsultation: number;
  cpa: number;
}

export interface FunnelRevenue {
  averageTicket: number;
  revenuePerClick: number;
  revenuePerConsultation: number;
  revenuePerMeeting: number;
}

export interface FunnelIndicators {
  totalRevenue: number;
  roas: number;
  revenueByStage: {
    stage: string;
    revenue: number;
  }[];
  totalFunnelConversion: number;
}

export interface FunnelResults {
  volumes: FunnelVolumes;
  rates: FunnelRates;
  financials: FunnelFinancials;
  revenue: FunnelRevenue;
  indicators: FunnelIndicators;
  mediaCost: number;
}

export function getDefaultInputs(): FunnelInputs {
  return {
    impressions: 10000,
    cpm: 100,
    mediaCost: 1000,
    ctr: 1.5,
    connectionRate: 75,
    pageConversionRate: 10,
    checkoutConversionRate: 35,
    appointmentRate: 100,
    showUpRate: 60,
    closeRate: 30,
    averageTicket: 3000,
  };
}

export function calculateFunnel(inputs: FunnelInputs): FunnelResults {
  const {
    impressions,
    mediaCost,
    ctr,
    connectionRate,
    pageConversionRate,
    checkoutConversionRate,
    appointmentRate,
    showUpRate,
    closeRate,
    averageTicket,
  } = inputs;

  // Volumes
  const clicks = impressions * (ctr / 100);
  const pageLoads = clicks * (connectionRate / 100);
  const checkoutStarts = pageLoads * (pageConversionRate / 100);
  const appointmentPurchases = checkoutStarts * (checkoutConversionRate / 100);
  const consultationsAttended = appointmentPurchases * (appointmentRate / 100) * (showUpRate / 100);
  const treatmentsClosed = consultationsAttended * (closeRate / 100);

  const volumes: FunnelVolumes = {
    impressions,
    clicks,
    pageLoads,
    checkoutStarts,
    appointmentPurchases,
    consultationsAttended,
    treatmentsClosed,
  };

  // Rates
  const funnelConversionRate = clicks > 0 ? (treatmentsClosed / clicks) * 100 : 0;

  const rates: FunnelRates = {
    ctr,
    connectionRate,
    pageConversionRate,
    checkoutConversionRate,
    appointmentRate,
    showUpRate,
    closeRate,
    funnelConversionRate,
  };

  // Financials
  const cpm = impressions > 0 ? (mediaCost / impressions) * 1000 : 0;
  const cpc = clicks > 0 ? mediaCost / clicks : 0;
  const costPerPage = pageLoads > 0 ? mediaCost / pageLoads : 0;
  const costPerCheckout = checkoutStarts > 0 ? mediaCost / checkoutStarts : 0;
  const costPerAppointment = appointmentPurchases > 0 ? mediaCost / appointmentPurchases : 0;
  const costPerConsultation = consultationsAttended > 0 ? mediaCost / consultationsAttended : 0;
  const cpa = treatmentsClosed > 0 ? mediaCost / treatmentsClosed : 0;

  const financials: FunnelFinancials = {
    cpm,
    cpc,
    costPerPage,
    costPerCheckout,
    costPerAppointment,
    costPerConsultation,
    cpa,
  };

  // Revenue
  const totalRevenue = treatmentsClosed * averageTicket;
  const revenuePerClick = clicks > 0 ? totalRevenue / clicks : 0;
  const revenuePerConsultation = consultationsAttended > 0 ? totalRevenue / consultationsAttended : 0;
  const revenuePerMeeting = consultationsAttended > 0 ? totalRevenue / consultationsAttended : 0;

  const revenue: FunnelRevenue = {
    averageTicket,
    revenuePerClick,
    revenuePerConsultation,
    revenuePerMeeting,
  };

  // Indicators
  const roas = mediaCost > 0 ? totalRevenue / mediaCost : 0;

  const revenueByStage = [
    { stage: 'Impressoes', revenue: 0 },
    { stage: 'Cliques', revenue: revenuePerClick * clicks },
    { stage: 'Pagina', revenue: pageLoads > 0 ? totalRevenue / pageLoads * pageLoads : 0 },
    { stage: 'Checkout', revenue: checkoutStarts > 0 ? totalRevenue / checkoutStarts * checkoutStarts : 0 },
    { stage: 'Agendamento', revenue: appointmentPurchases > 0 ? totalRevenue / appointmentPurchases * appointmentPurchases : 0 },
    { stage: 'Consulta', revenue: consultationsAttended > 0 ? totalRevenue / consultationsAttended * consultationsAttended : 0 },
    { stage: 'Venda', revenue: totalRevenue },
  ];

  const indicators: FunnelIndicators = {
    totalRevenue,
    roas,
    revenueByStage,
    totalFunnelConversion: funnelConversionRate,
  };

  return {
    volumes,
    rates,
    financials,
    revenue,
    indicators,
    mediaCost,
  };
}
