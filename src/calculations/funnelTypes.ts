export interface StageConfig {
  key: string;
  label: string;
  rateLabel: string;
  costLabel: string;
  defaultRate: number;
  benchmark?: {
    label: string;
    bad: { max: number };
    acceptable?: { min: number; max: number };
    good: { min: number; max: number };
    excellent: { min: number };
  };
  recommendationDescription?: string;
}

export interface FunnelTypeConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  stages: StageConfig[];
  defaultMediaCost: number;
  defaultCpm: number;
  defaultAverageTicket: number;
  hasLowTicket: boolean;
  lowTicketLabel?: string;
  defaultLowTicket?: number;
  lowTicketStageKey?: string;
  meetingStageKey: string;
}

// ─── 1. HIGH-TICKET DIRETO ──────────────────────────────────────────────────
export const highTicketConfig: FunnelTypeConfig = {
  id: 'high-ticket',
  name: 'High-Ticket Direto',
  subtitle: 'Agendamento direto para reuniao de vendas',
  description: 'Funil classico de trafego pago levando para pagina de captura, agendamento de reuniao/consulta e fechamento high-ticket.',
  stages: [
    {
      key: 'clicks',
      label: 'Cliques',
      rateLabel: 'CTR',
      costLabel: 'CPC',
      defaultRate: 1.5,
      benchmark: {
        label: 'CTR (Taxa de Clique)',
        bad: { max: 0.7 },
        acceptable: { min: 0.7, max: 1.5 },
        good: { min: 1.5, max: 3 },
        excellent: { min: 3 },
      },
      recommendationDescription: 'Melhore criativos, copy e segmentacao dos anuncios para aumentar a taxa de clique.',
    },
    {
      key: 'pageLoads',
      label: 'Pagina Carregada',
      rateLabel: 'Conexao',
      costLabel: 'Custo/Pag',
      defaultRate: 75,
      benchmark: {
        label: 'Taxa de Conexao (Pagina)',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Otimize a velocidade de carregamento da pagina e revise o dominio/hospedagem.',
    },
    {
      key: 'leads',
      label: 'Cadastro / Lead',
      rateLabel: 'Conv. Pagina',
      costLabel: 'Custo/Lead',
      defaultRate: 10,
      benchmark: {
        label: 'Conversao da Pagina (Cadastro)',
        bad: { max: 5 },
        acceptable: { min: 5, max: 10 },
        good: { min: 10, max: 20 },
        excellent: { min: 20 },
      },
      recommendationDescription: 'Revise a copy, o formulario e a proposta de valor da pagina de captura.',
    },
    {
      key: 'appointments',
      label: 'Agendamento',
      rateLabel: 'Agendamento',
      costLabel: 'Custo/Agend',
      defaultRate: 35,
      benchmark: {
        label: 'Taxa de Agendamento',
        bad: { max: 10 },
        good: { min: 10, max: 20 },
        excellent: { min: 20 },
      },
      recommendationDescription: 'Melhore o processo do pre-vendedor: velocidade de contato com o lead, script de qualificacao, abordagem e follow-up.',
    },
    {
      key: 'consultations',
      label: 'Reuniao / Consulta',
      rateLabel: 'Comparecim.',
      costLabel: 'Custo/Comp',
      defaultRate: 60,
      benchmark: {
        label: 'Taxa de Comparecimento',
        bad: { max: 75 },
        good: { min: 75, max: 90 },
        excellent: { min: 90 },
      },
      recommendationDescription: 'Implemente lembretes (WhatsApp, SMS, email) e reduza o tempo entre agendamento e consulta.',
    },
    {
      key: 'sales',
      label: 'Venda Fechada',
      rateLabel: 'Fechamento',
      costLabel: 'CPA',
      defaultRate: 30,
      benchmark: {
        label: 'Taxa de Fechamento',
        bad: { max: 20 },
        good: { min: 20, max: 40 },
        excellent: { min: 40 },
      },
      recommendationDescription: 'Revise o script de vendas, tratamento de objecoes e a proposta comercial.',
    },
  ],
  defaultMediaCost: 1000,
  defaultCpm: 100,
  defaultAverageTicket: 3000,
  hasLowTicket: false,
  meetingStageKey: 'consultations',
};

// ─── 2. WEBINAR ─────────────────────────────────────────────────────────────
export const webinarConfig: FunnelTypeConfig = {
  id: 'webinar',
  name: 'Webinar',
  subtitle: 'Captacao, webinar ao vivo e aplicacao',
  description: 'Funil de webinar com captacao de leads, comparecimento ao vivo, pitch com aplicacao, agendamento de reuniao e fechamento high-ticket.',
  stages: [
    {
      key: 'clicks',
      label: 'Cliques',
      rateLabel: 'CTR',
      costLabel: 'CPC',
      defaultRate: 1.5,
      benchmark: {
        label: 'CTR (Taxa de Clique)',
        bad: { max: 0.7 },
        acceptable: { min: 0.7, max: 1.5 },
        good: { min: 1.5, max: 3 },
        excellent: { min: 3 },
      },
      recommendationDescription: 'Melhore criativos, copy e segmentacao dos anuncios.',
    },
    {
      key: 'pageLoads',
      label: 'Pagina Carregada',
      rateLabel: 'Conexao',
      costLabel: 'Custo/Pag',
      defaultRate: 75,
      benchmark: {
        label: 'Taxa de Conexao (Pagina)',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Otimize velocidade da pagina e hospedagem.',
    },
    {
      key: 'leads',
      label: 'Inscritos',
      rateLabel: 'Conv. Pagina',
      costLabel: 'Custo/Inscrito',
      defaultRate: 15,
      benchmark: {
        label: 'Conversao da Pagina (Inscricao)',
        bad: { max: 8 },
        acceptable: { min: 8, max: 15 },
        good: { min: 15, max: 30 },
        excellent: { min: 30 },
      },
      recommendationDescription: 'Revise a copy, urgencia e proposta de valor da pagina de inscricao do webinar.',
    },
    {
      key: 'webinarAttendees',
      label: 'Presentes no Webinar',
      rateLabel: 'Comparec. Webinar',
      costLabel: 'Custo/Presente',
      defaultRate: 30,
      benchmark: {
        label: 'Taxa de Comparecimento no Webinar',
        bad: { max: 15 },
        acceptable: { min: 15, max: 25 },
        good: { min: 25, max: 40 },
        excellent: { min: 40 },
      },
      recommendationDescription: 'Envie lembretes (WhatsApp, email, SMS). Reduza o tempo entre inscricao e o evento. Crie antecipacao com conteudo pre-webinar.',
    },
    {
      key: 'applications',
      label: 'Aplicacoes',
      rateLabel: 'Taxa Aplicacao',
      costLabel: 'Custo/Aplicacao',
      defaultRate: 15,
      benchmark: {
        label: 'Taxa de Aplicacao (no Webinar)',
        bad: { max: 5 },
        acceptable: { min: 5, max: 10 },
        good: { min: 10, max: 20 },
        excellent: { min: 20 },
      },
      recommendationDescription: 'Melhore o pitch, a oferta e o CTA no webinar. Crie urgencia e escassez para a aplicacao.',
    },
    {
      key: 'appointments',
      label: 'Agendamento',
      rateLabel: 'Agendamento',
      costLabel: 'Custo/Agend',
      defaultRate: 60,
      benchmark: {
        label: 'Taxa de Agendamento (pos-aplicacao)',
        bad: { max: 40 },
        good: { min: 40, max: 70 },
        excellent: { min: 70 },
      },
      recommendationDescription: 'Entre em contato rapido com quem aplicou. Melhore o script de triagem e agendamento.',
    },
    {
      key: 'consultations',
      label: 'Comparecimento Reuniao',
      rateLabel: 'Comparecim.',
      costLabel: 'Custo/Comp',
      defaultRate: 70,
      benchmark: {
        label: 'Taxa de Comparecimento na Reuniao',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Lembretes automaticos, confirmacao de presenca e reducao do tempo entre agendamento e reuniao.',
    },
    {
      key: 'sales',
      label: 'Venda Fechada',
      rateLabel: 'Fechamento',
      costLabel: 'CPA',
      defaultRate: 25,
      benchmark: {
        label: 'Taxa de Fechamento',
        bad: { max: 15 },
        good: { min: 15, max: 30 },
        excellent: { min: 30 },
      },
      recommendationDescription: 'Revise o script de vendas, tratamento de objecoes e proposta comercial.',
    },
  ],
  defaultMediaCost: 2000,
  defaultCpm: 80,
  defaultAverageTicket: 5000,
  hasLowTicket: false,
  meetingStageKey: 'consultations',
};

// ─── 3. ISCA PAGA ───────────────────────────────────────────────────────────
export const iscaPagaConfig: FunnelTypeConfig = {
  id: 'isca-paga',
  name: 'Isca Paga',
  subtitle: 'Venda de ticket baixo + SDR para high-ticket',
  description: 'Funil de isca paga onde o lead compra um produto de ticket baixo e depois um SDR entra em contato para agendar uma reuniao de vendas high-ticket.',
  stages: [
    {
      key: 'clicks',
      label: 'Cliques',
      rateLabel: 'CTR',
      costLabel: 'CPC',
      defaultRate: 1.5,
      benchmark: {
        label: 'CTR (Taxa de Clique)',
        bad: { max: 0.7 },
        acceptable: { min: 0.7, max: 1.5 },
        good: { min: 1.5, max: 3 },
        excellent: { min: 3 },
      },
      recommendationDescription: 'Melhore criativos, copy e segmentacao dos anuncios.',
    },
    {
      key: 'pageLoads',
      label: 'Pagina Carregada',
      rateLabel: 'Conexao',
      costLabel: 'Custo/Pag',
      defaultRate: 75,
      benchmark: {
        label: 'Taxa de Conexao (Pagina)',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Otimize velocidade da pagina e hospedagem.',
    },
    {
      key: 'purchases',
      label: 'Compradores (Ticket Baixo)',
      rateLabel: 'Conv. Venda',
      costLabel: 'Custo/Compra',
      defaultRate: 3,
      benchmark: {
        label: 'Taxa de Conversao (Venda Ticket Baixo)',
        bad: { max: 1 },
        acceptable: { min: 1, max: 2 },
        good: { min: 2, max: 5 },
        excellent: { min: 5 },
      },
      recommendationDescription: 'Revise a pagina de vendas, a oferta, o preco do ticket baixo e os elementos de prova social.',
    },
    {
      key: 'sdrContacts',
      label: 'Contatos SDR',
      rateLabel: 'Taxa Contato',
      costLabel: 'Custo/Contato',
      defaultRate: 70,
      benchmark: {
        label: 'Taxa de Contato do SDR',
        bad: { max: 50 },
        good: { min: 50, max: 75 },
        excellent: { min: 75 },
      },
      recommendationDescription: 'Aumente a velocidade de contato do SDR (idealmente nas primeiras 2h apos a compra). Melhore o script de abordagem.',
    },
    {
      key: 'appointments',
      label: 'Agendamento',
      rateLabel: 'Agendamento',
      costLabel: 'Custo/Agend',
      defaultRate: 40,
      benchmark: {
        label: 'Taxa de Agendamento',
        bad: { max: 20 },
        good: { min: 20, max: 45 },
        excellent: { min: 45 },
      },
      recommendationDescription: 'Melhore o script de qualificacao e agendamento do SDR. Crie urgencia para marcar a reuniao.',
    },
    {
      key: 'consultations',
      label: 'Comparecimento',
      rateLabel: 'Comparecim.',
      costLabel: 'Custo/Comp',
      defaultRate: 65,
      benchmark: {
        label: 'Taxa de Comparecimento',
        bad: { max: 55 },
        good: { min: 55, max: 75 },
        excellent: { min: 75 },
      },
      recommendationDescription: 'Lembretes automaticos e confirmacao de presenca. Reduza o tempo entre agendamento e reuniao.',
    },
    {
      key: 'sales',
      label: 'Venda High-Ticket',
      rateLabel: 'Fechamento',
      costLabel: 'CPA',
      defaultRate: 25,
      benchmark: {
        label: 'Taxa de Fechamento',
        bad: { max: 15 },
        good: { min: 15, max: 30 },
        excellent: { min: 30 },
      },
      recommendationDescription: 'Revise o script de vendas, tratamento de objecoes e proposta comercial.',
    },
  ],
  defaultMediaCost: 1500,
  defaultCpm: 90,
  defaultAverageTicket: 4000,
  hasLowTicket: true,
  lowTicketLabel: 'Ticket Baixo (Isca)',
  defaultLowTicket: 47,
  lowTicketStageKey: 'purchases',
  meetingStageKey: 'consultations',
};

// ─── 4. ISCA GRATUITA ───────────────────────────────────────────────────────
export const iscaGratuitaConfig: FunnelTypeConfig = {
  id: 'isca-gratuita',
  name: 'Isca Gratuita',
  subtitle: 'Lead magnet gratuito + agendamento',
  description: 'Funil de isca gratuita (ebook, checklist, aula) onde o lead baixa o material e depois e agendado para uma reuniao de vendas high-ticket.',
  stages: [
    {
      key: 'clicks',
      label: 'Cliques',
      rateLabel: 'CTR',
      costLabel: 'CPC',
      defaultRate: 1.5,
      benchmark: {
        label: 'CTR (Taxa de Clique)',
        bad: { max: 0.7 },
        acceptable: { min: 0.7, max: 1.5 },
        good: { min: 1.5, max: 3 },
        excellent: { min: 3 },
      },
      recommendationDescription: 'Melhore criativos, copy e segmentacao dos anuncios.',
    },
    {
      key: 'pageLoads',
      label: 'Pagina Carregada',
      rateLabel: 'Conexao',
      costLabel: 'Custo/Pag',
      defaultRate: 75,
      benchmark: {
        label: 'Taxa de Conexao (Pagina)',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Otimize velocidade da pagina e hospedagem.',
    },
    {
      key: 'leads',
      label: 'Leads (Download)',
      rateLabel: 'Conv. Download',
      costLabel: 'Custo/Lead',
      defaultRate: 20,
      benchmark: {
        label: 'Conversao da Pagina (Download)',
        bad: { max: 10 },
        acceptable: { min: 10, max: 20 },
        good: { min: 20, max: 35 },
        excellent: { min: 35 },
      },
      recommendationDescription: 'Revise a copy, a promessa da isca e o formulario da pagina de captura.',
    },
    {
      key: 'appointments',
      label: 'Agendamento',
      rateLabel: 'Agendamento',
      costLabel: 'Custo/Agend',
      defaultRate: 15,
      benchmark: {
        label: 'Taxa de Agendamento',
        bad: { max: 5 },
        acceptable: { min: 5, max: 10 },
        good: { min: 10, max: 20 },
        excellent: { min: 20 },
      },
      recommendationDescription: 'Melhore a sequencia de nurturing pos-download. Agilize o contato do SDR/pre-vendas para converter leads em agendamentos.',
    },
    {
      key: 'consultations',
      label: 'Comparecimento',
      rateLabel: 'Comparecim.',
      costLabel: 'Custo/Comp',
      defaultRate: 60,
      benchmark: {
        label: 'Taxa de Comparecimento',
        bad: { max: 50 },
        good: { min: 50, max: 70 },
        excellent: { min: 70 },
      },
      recommendationDescription: 'Lembretes automaticos e confirmacao. Reduza o tempo entre agendamento e reuniao.',
    },
    {
      key: 'sales',
      label: 'Venda High-Ticket',
      rateLabel: 'Fechamento',
      costLabel: 'CPA',
      defaultRate: 25,
      benchmark: {
        label: 'Taxa de Fechamento',
        bad: { max: 15 },
        good: { min: 15, max: 30 },
        excellent: { min: 30 },
      },
      recommendationDescription: 'Revise o script de vendas, tratamento de objecoes e proposta comercial.',
    },
  ],
  defaultMediaCost: 1000,
  defaultCpm: 80,
  defaultAverageTicket: 3000,
  hasLowTicket: false,
  meetingStageKey: 'consultations',
};

// ─── 5. DESAFIO PAGO ────────────────────────────────────────────────────────
export const desafioPagoConfig: FunnelTypeConfig = {
  id: 'desafio-pago',
  name: 'Desafio Pago',
  subtitle: 'Evento online de varios dias + aplicacao + high-ticket',
  description: 'Funil de desafio pago (evento online de varios dias) com venda de ticket baixo, participacao, pitch para aplicacao, agendamento e fechamento high-ticket.',
  stages: [
    {
      key: 'clicks',
      label: 'Cliques',
      rateLabel: 'CTR',
      costLabel: 'CPC',
      defaultRate: 1.5,
      benchmark: {
        label: 'CTR (Taxa de Clique)',
        bad: { max: 0.7 },
        acceptable: { min: 0.7, max: 1.5 },
        good: { min: 1.5, max: 3 },
        excellent: { min: 3 },
      },
      recommendationDescription: 'Melhore criativos, copy e segmentacao dos anuncios.',
    },
    {
      key: 'pageLoads',
      label: 'Pagina Carregada',
      rateLabel: 'Conexao',
      costLabel: 'Custo/Pag',
      defaultRate: 75,
      benchmark: {
        label: 'Taxa de Conexao (Pagina)',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Otimize velocidade da pagina e hospedagem.',
    },
    {
      key: 'purchases',
      label: 'Compradores (Desafio)',
      rateLabel: 'Conv. Venda',
      costLabel: 'Custo/Compra',
      defaultRate: 3,
      benchmark: {
        label: 'Taxa de Conversao (Venda Desafio)',
        bad: { max: 1 },
        acceptable: { min: 1, max: 2 },
        good: { min: 2, max: 5 },
        excellent: { min: 5 },
      },
      recommendationDescription: 'Revise a pagina de vendas do desafio, a oferta, o preco e os elementos de prova social e urgencia.',
    },
    {
      key: 'participants',
      label: 'Participantes Ativos',
      rateLabel: 'Participacao',
      costLabel: 'Custo/Partic.',
      defaultRate: 50,
      benchmark: {
        label: 'Taxa de Participacao no Desafio',
        bad: { max: 30 },
        acceptable: { min: 30, max: 45 },
        good: { min: 45, max: 65 },
        excellent: { min: 65 },
      },
      recommendationDescription: 'Melhore o onboarding, gamificacao, comunidade e lembretes diarios para manter os participantes engajados ao longo dos dias.',
    },
    {
      key: 'applications',
      label: 'Aplicacoes',
      rateLabel: 'Taxa Aplicacao',
      costLabel: 'Custo/Aplicacao',
      defaultRate: 15,
      benchmark: {
        label: 'Taxa de Aplicacao (Pitch no Desafio)',
        bad: { max: 5 },
        acceptable: { min: 5, max: 10 },
        good: { min: 10, max: 20 },
        excellent: { min: 20 },
      },
      recommendationDescription: 'Melhore o pitch, a oferta e o CTA no desafio. Crie urgencia e escassez para a aplicacao.',
    },
    {
      key: 'appointments',
      label: 'Agendamento',
      rateLabel: 'Agendamento',
      costLabel: 'Custo/Agend',
      defaultRate: 60,
      benchmark: {
        label: 'Taxa de Agendamento (pos-aplicacao)',
        bad: { max: 40 },
        good: { min: 40, max: 70 },
        excellent: { min: 70 },
      },
      recommendationDescription: 'Entre em contato rapido com quem aplicou. Melhore o script de triagem e agendamento.',
    },
    {
      key: 'consultations',
      label: 'Comparecimento',
      rateLabel: 'Comparecim.',
      costLabel: 'Custo/Comp',
      defaultRate: 70,
      benchmark: {
        label: 'Taxa de Comparecimento na Reuniao',
        bad: { max: 60 },
        good: { min: 60, max: 80 },
        excellent: { min: 80 },
      },
      recommendationDescription: 'Lembretes automaticos e confirmacao de presenca. Reduza o tempo entre agendamento e reuniao.',
    },
    {
      key: 'sales',
      label: 'Venda High-Ticket',
      rateLabel: 'Fechamento',
      costLabel: 'CPA',
      defaultRate: 25,
      benchmark: {
        label: 'Taxa de Fechamento',
        bad: { max: 15 },
        good: { min: 15, max: 30 },
        excellent: { min: 30 },
      },
      recommendationDescription: 'Revise o script de vendas, tratamento de objecoes e proposta comercial.',
    },
  ],
  defaultMediaCost: 3000,
  defaultCpm: 80,
  defaultAverageTicket: 6000,
  hasLowTicket: true,
  lowTicketLabel: 'Ticket do Desafio',
  defaultLowTicket: 97,
  lowTicketStageKey: 'purchases',
  meetingStageKey: 'consultations',
};

// ─── REGISTRY ───────────────────────────────────────────────────────────────
export const funnelConfigs: FunnelTypeConfig[] = [
  highTicketConfig,
  webinarConfig,
  iscaPagaConfig,
  iscaGratuitaConfig,
  desafioPagoConfig,
];

export function getFunnelConfig(id: string): FunnelTypeConfig | undefined {
  return funnelConfigs.find((c) => c.id === id);
}
