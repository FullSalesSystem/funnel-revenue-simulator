'use client';

import React from 'react';

export const APPLY_URL = 'https://t7.aplicacao.fullsalessystem.com/';

const BONUSES: { title: string; detail: string }[] = [
  {
    title: 'Gravações de todos os dias do Desafio',
    detail: 'Reveja cada treino quando quiser, no seu ritmo.',
  },
  {
    title: 'Todos os prompts dos 5 dias',
    detail: 'Prontos para copiar, colar e usar na sua operação.',
  },
  {
    title: 'Todos os slides',
    detail: 'O material completo das aulas para consultar depois.',
  },
  {
    title: 'Ferramentas extras',
    detail: 'Como esta que você está usando agora — e outras que liberamos por dentro.',
  },
];

export default function ApplyCTA() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#FF063C]/30 bg-gradient-to-b from-[#FF063C]/[0.08] to-white/[0.02]">
      <div className="px-5 py-8 sm:px-10 sm:py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B8A]">
          Diagnóstico Comercial · Full Sales System
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Quer estruturar tudo isso e bater a meta todos os meses?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
          Esta ferramenta mostra onde o seu funil ganha e perde dinheiro. No diagnóstico comercial, nosso
          time olha os seus números com você e monta o caminho — funil, métricas e caixa estruturados —
          para a meta cair mês após mês, sem depender de sorte. Você só precisa preencher a aplicação:
          leva menos de 2 minutos e libera seu acesso a tudo isso e aos bônus abaixo.
        </p>

        {/* ── Bônus ── */}
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Aplicando, você recebe
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {BONUSES.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF063C]/15 text-[10px] font-bold text-[#FF6B8A]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">{b.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{b.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Botão ── */}
        <div className="mt-7 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF063C] px-8 py-4 text-sm font-bold tracking-tight text-white shadow-lg shadow-[#FF063C]/25 transition-all hover:bg-[#e0052f] hover:shadow-[#FF063C]/40 sm:w-auto"
          >
            Aplicar para o diagnóstico comercial
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="text-[11px] text-gray-500">
            Menos de 2 minutos · nosso time entra em contato com você
          </p>
        </div>
      </div>
    </section>
  );
}
