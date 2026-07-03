'use client';

import { useMemo, useState } from 'react';
import {
  ApplicationInputs,
  calculateApplication,
  getDefaultApplicationInputs,
} from '@/calculations/applicationFunnel';
import DataPanel from '@/components/application/DataPanel';
import MetaHero from '@/components/application/MetaHero';
import FunnelBoard from '@/components/application/FunnelBoard';
import QuestionDropoff from '@/components/application/QuestionDropoff';
import MetricsTable from '@/components/application/MetricsTable';
import QualificationCard from '@/components/application/QualificationCard';
import GoalPlan from '@/components/application/GoalPlan';
import MetaPlanner from '@/components/application/MetaPlanner';
import ApplyCTA, { APPLY_URL } from '@/components/application/ApplyCTA';

export default function AplicacaoPage() {
  const [inputs, setInputs] = useState<ApplicationInputs>(() => getDefaultApplicationInputs());

  const results = useMemo(() => calculateApplication(inputs), [inputs]);

  const warnings = useMemo(() => buildWarnings(inputs), [inputs]);

  const handleChange = (field: keyof ApplicationInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (id: number, value: number) => {
    setInputs((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, reached: value } : q)),
    }));
  };

  const handleAddQuestion = () => {
    setInputs((prev) => {
      const nextId = prev.questions.length > 0 ? Math.max(...prev.questions.map((q) => q.id)) + 1 : 1;
      const last = prev.questions[prev.questions.length - 1];
      return {
        ...prev,
        questions: [...prev.questions, { id: nextId, reached: last ? last.reached : prev.applicationStarts }],
      };
    });
  };

  const handleRemoveQuestion = (id: number) => {
    setInputs((prev) =>
      prev.questions.length > 1
        ? { ...prev, questions: prev.questions.filter((q) => q.id !== id) }
        : prev
    );
  };

  const handleReset = () => setInputs(getDefaultApplicationInputs());

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0f1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <circle cx="12" cy="12" r="4.5" strokeWidth={2} />
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Funil de Aplicação — Visão Completa
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Métricas absolutas, relativas e de custo · meta: faturamento por reunião ≥ 7x o custo
              </p>
            </div>
          </div>
          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-[#FF063C] px-4 py-2 text-xs font-bold tracking-tight text-white transition-colors hover:bg-[#e0052f]"
          >
            Quero meu diagnóstico
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Painel de dados */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
              <DataPanel
                inputs={inputs}
                onChange={handleChange}
                onQuestionChange={handleQuestionChange}
                onAddQuestion={handleAddQuestion}
                onRemoveQuestion={handleRemoveQuestion}
                onReset={handleReset}
                warnings={warnings}
              />
            </div>
          </div>

          {/* Dashboard */}
          <div className="space-y-6 lg:col-span-9">
            <MetaHero results={results} />
            <MetaPlanner results={results} />
            <FunnelBoard results={results} />
            <QuestionDropoff results={results} />
            <QualificationCard results={results} />
            <MetricsTable results={results} />
            <GoalPlan results={results} />
            <ApplyCTA />
          </div>
        </div>
      </div>
    </main>
  );
}

function buildWarnings(inputs: ApplicationInputs): string[] {
  const w: string[] = [];
  const check = (cond: boolean, msg: string) => cond && w.push(msg);

  check(inputs.clicks > inputs.impressions, 'Cliques maiores que impressões.');
  check(inputs.pageViews > inputs.clicks, 'Visualizações de página maiores que cliques.');
  check(inputs.applicationStarts > inputs.pageViews, 'Inícios de aplicação maiores que visualizações.');
  check(inputs.registrations > inputs.applicationStarts, 'Cadastros maiores que inícios de aplicação.');
  check(inputs.qualified > inputs.registrations, 'Qualificados maiores que cadastros.');
  check(inputs.scheduled > inputs.qualified, 'Agendamentos maiores que leads qualificados.');
  check(inputs.attended > inputs.scheduled, 'Comparecimentos maiores que agendamentos.');
  check(inputs.closed > inputs.attended, 'Fechamentos maiores que reuniões realizadas.');

  let prev = inputs.applicationStarts;
  inputs.questions.forEach((q, i) => {
    check(q.reached > prev, `Pergunta ${i + 1} com mais respostas que a etapa anterior.`);
    prev = q.reached;
  });
  if (inputs.questions.length > 0) {
    check(
      inputs.registrations > inputs.questions[inputs.questions.length - 1].reached,
      'Cadastros maiores que as respostas da última pergunta.'
    );
  }
  return w;
}
