import React from 'react';
import Link from 'next/link';
import { funnelConfigs } from '@/calculations/funnelTypes';

const icons: Record<string, React.ReactNode> = {
  'high-ticket': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'webinar': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  'isca-paga': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  'isca-gratuita': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'desafio-pago': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
};

const gradients: Record<string, string> = {
  'high-ticket': 'from-blue-500 to-emerald-500',
  'webinar': 'from-purple-500 to-pink-500',
  'isca-paga': 'from-amber-500 to-orange-500',
  'isca-gratuita': 'from-cyan-500 to-blue-500',
  'desafio-pago': 'from-red-500 to-amber-500',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0b0f1a]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Funnel Revenue Simulator
              </h1>
              <p className="text-sm text-gray-500">
                Simulador inteligente de funis de vendas high-ticket
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Funnel selector */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Ferramenta principal: Funil de Aplicacao */}
        <Link
          href="/aplicacao"
          className="group relative overflow-hidden block mb-10 rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.08] via-white/[0.03] to-transparent p-6 sm:p-7 transition-all duration-300 hover:border-indigo-400/40"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M6 9h12M9 14h6M11 19h2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Funil de Aplicacao — Visao Completa
                </h3>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-300">
                  Principal
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                Acompanhe o funil inteiro com dados reais: metricas absolutas, relativas e de custo em cada etapa,
                drop-off pergunta a pergunta, meta de 7x no custo por reuniao e plano de otimizacao com acoes prontas.
              </p>
            </div>
            <div className="hidden sm:block opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">Ou simule por tipo de funil</h2>
          <p className="text-sm text-gray-500">
            Selecione o modelo de funil que mais se aproxima da sua operacao para simular receita, custos e diagnosticar gargalos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funnelConfigs.map((config) => (
            <Link
              key={config.id}
              href={`/simulator/${config.id}`}
              className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:bg-white/[0.05]"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${gradients[config.id] ?? 'from-blue-500 to-emerald-500'} opacity-40 group-hover:opacity-80 transition-opacity`} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[config.id] ?? 'from-blue-500 to-emerald-500'} flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                {icons[config.id]}
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-white mb-1 group-hover:text-white/90">
                {config.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {config.subtitle}
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {config.description}
              </p>

              {/* Stage count */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                  {config.stages.length} etapas
                </span>
                {config.hasLowTicket && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    + ticket baixo
                  </span>
                )}
              </div>

              {/* Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
