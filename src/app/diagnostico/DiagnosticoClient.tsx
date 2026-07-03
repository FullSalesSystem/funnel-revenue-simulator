"use client";

import { useEffect, useRef, useState } from "react";

type Sexo = "feminino" | "masculino";

type FormState = {
  consentimento: boolean;
  lead: {
    nome: string;
    email: string;
    whatsapp: string;
    idade: string;
    sexo: Sexo | "";
  };
  antropometria: {
    peso_kg: string;
    altura_cm: string;
    circunferencia_abdominal_cm: string;
    percentual_gordura: string;
  };
  marcadores: {
    glicemia_jejum: string;
    hba1c: string;
    insulina_jejum: string;
    homa_ir: string;
    tsh: string;
    t4_livre: string;
    vit_d: string;
    ferritina: string;
    pcr_us: string;
    cortisol_matinal: string;
    colesterol_total: string;
    hdl: string;
    ldl: string;
    triglicerides: string;
    testosterona_total: string;
    estradiol: string;
  };
  habitos: {
    sono_horas: string;
    qualidade_sono: string;
    nivel_estresse: string;
    padrao_alimentar: string;
    ingestao_proteica: string;
    frequencia_treino: string;
    tipo_treino: string;
    consumo_alcool: string;
    tentativas_anteriores: string;
    medicamentos: string;
    comorbidades: string;
    queixa_principal: string;
  };
};

type Obstaculo = {
  nome: string;
  severidade: "alta" | "media" | "baixa";
  explicacao: string;
  marcadores_relacionados: string[];
  referencias: string[];
};

type ReportResponse = {
  report: {
    resumo_clinico: string;
    classificacao_obstaculo_principal: string;
    obstaculos: Obstaculo[];
    prioridades_de_acao: string[];
    proximos_exames_sugeridos: string[];
    alertas_clinicos: string[];
  };
  doctor: { nome: string; crm: string; especialidade: string };
  referencias_expandidas: Record<string, string>;
  gerado_em: string;
};

const initialState: FormState = {
  consentimento: false,
  lead: { nome: "", email: "", whatsapp: "", idade: "", sexo: "" },
  antropometria: { peso_kg: "", altura_cm: "", circunferencia_abdominal_cm: "", percentual_gordura: "" },
  marcadores: {
    glicemia_jejum: "", hba1c: "", insulina_jejum: "", homa_ir: "",
    tsh: "", t4_livre: "", vit_d: "", ferritina: "", pcr_us: "",
    cortisol_matinal: "", colesterol_total: "", hdl: "", ldl: "",
    triglicerides: "", testosterona_total: "", estradiol: "",
  },
  habitos: {
    sono_horas: "", qualidade_sono: "", nivel_estresse: "", padrao_alimentar: "",
    ingestao_proteica: "", frequencia_treino: "", tipo_treino: "",
    consumo_alcool: "", tentativas_anteriores: "", medicamentos: "",
    comorbidades: "", queixa_principal: "",
  },
};

const STEPS = ["Início", "Você", "Corpo", "Exames", "Hábitos"] as const;

export function DiagnosticoClient() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, loading, result]);

  function goNext(nextStep: number) {
    setStep(nextStep);
  }

  function updateLead<K extends keyof FormState["lead"]>(key: K, value: FormState["lead"][K]) {
    setForm((f) => ({ ...f, lead: { ...f.lead, [key]: value } }));
  }
  function updateAntropo<K extends keyof FormState["antropometria"]>(key: K, value: string) {
    setForm((f) => ({ ...f, antropometria: { ...f.antropometria, [key]: value } }));
  }
  function updateMarcador<K extends keyof FormState["marcadores"]>(key: K, value: string) {
    setForm((f) => ({ ...f, marcadores: { ...f.marcadores, [key]: value } }));
  }
  function updateHabito<K extends keyof FormState["habitos"]>(key: K, value: string) {
    setForm((f) => ({ ...f, habitos: { ...f.habitos, [key]: value } }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar avaliação.");
      setResult(data as ReportResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  if (result) return <ResultView data={result} />;

  if (loading) {
    return (
      <div ref={topRef} className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-emerald-500/30 border-t-emerald-400" />
        <h2 className="mt-8 text-2xl font-medium">Analisando seus dados…</h2>
        <p className="mt-3 text-white/60 text-sm max-w-md mx-auto">
          A inteligência clínica está cruzando seus marcadores e hábitos com a literatura
          científica. Isso costuma levar de 20 a 40 segundos.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-2xl mx-auto px-6 py-12">
      {step > 0 && (
        <div className="mb-10">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            {STEPS.map((label, i) => (
              <span key={label} className={i === step ? "text-emerald-400" : ""}>
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === 0 && <Step0Intro form={form} setForm={setForm} onNext={() => goNext(1)} />}
      {step === 1 && (
        <Step1Lead
          form={form}
          update={updateLead}
          onBack={() => goNext(0)}
          onNext={() => goNext(2)}
        />
      )}
      {step === 2 && (
        <Step2Antropo
          form={form}
          update={updateAntropo}
          onBack={() => goNext(1)}
          onNext={() => goNext(3)}
        />
      )}
      {step === 3 && (
        <Step3Marcadores
          form={form}
          update={updateMarcador}
          onBack={() => goNext(2)}
          onNext={() => goNext(4)}
        />
      )}
      {step === 4 && (
        <Step4Habitos
          form={form}
          update={updateHabito}
          onBack={() => goNext(3)}
          onSubmit={submit}
        />
      )}

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function Step0Intro({
  form,
  setForm,
  onNext,
}: {
  form: FormState;
  setForm: (updater: (f: FormState) => FormState) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!form.consentimento) {
      setError("Marque a caixa de consentimento abaixo para continuar.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="py-8">
      <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase mb-3">
        Avaliação Metabólica Personalizada
      </p>
      <h1 className="text-4xl md:text-5xl font-medium leading-tight">
        Descubra o que está travando o seu emagrecimento.
      </h1>
      <p className="mt-6 text-lg text-white/70 leading-relaxed">
        Responda algumas perguntas sobre seus exames de sangue e hábitos de vida. Em segundos,
        você receberá uma avaliação clínica baseada em literatura científica, identificando os
        principais obstáculos metabólicos ao seu emagrecimento.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-white/60">
        <li className="flex gap-3">
          <span className="text-emerald-400">▸</span>
          Análise cruzada de marcadores sanguíneos e hábitos
        </li>
        <li className="flex gap-3">
          <span className="text-emerald-400">▸</span>
          Referências de estudos publicados em cada hipótese levantada
        </li>
        <li className="flex gap-3">
          <span className="text-emerald-400">▸</span>
          Recomendações de exames complementares e próximos passos
        </li>
      </ul>

      <div className="mt-10 p-5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
        <strong className="text-white/80">Importante.</strong> Esta avaliação NÃO substitui
        consulta médica e NÃO é um diagnóstico. É uma análise educacional baseada em literatura
        científica que deve ser interpretada pelo seu médico de confiança. Seus dados são tratados
        de acordo com a LGPD e usados exclusivamente para gerar sua avaliação e contato sobre os
        serviços da clínica.
      </div>

      <label className="mt-6 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.consentimento}
          onChange={(e) => {
            setForm((f) => ({ ...f, consentimento: e.target.checked }));
            if (e.target.checked) setError(null);
          }}
          className="mt-1 w-4 h-4 accent-emerald-500"
        />
        <span className="text-sm text-white/70">
          Li e concordo com o uso dos meus dados para fins desta avaliação e contato sobre os
          serviços da clínica.
        </span>
      </label>

      <button
        type="button"
        onClick={handleClick}
        className="mt-8 w-full py-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors cursor-pointer"
      >
        Começar avaliação
      </button>
      {error && (
        <p className="mt-3 text-sm text-amber-300 text-center">{error}</p>
      )}
    </div>
  );
}

function Step1Lead({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState["lead"]>(key: K, value: FormState["lead"][K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function getError(): string | null {
    if (form.lead.nome.trim().length < 2) return "Preencha seu nome completo.";
    if (!/.+@.+\..+/.test(form.lead.email)) return "Informe um e-mail válido.";
    if (form.lead.whatsapp.replace(/\D/g, "").length < 10)
      return "WhatsApp precisa ter DDD + número (mínimo 10 dígitos).";
    if (form.lead.idade === "") return "Informe sua idade.";
    if (form.lead.sexo === "") return "Selecione o sexo biológico.";
    return null;
  }

  return (
    <StepContainer
      title="Identificação"
      subtitle="Precisamos saber quem você é para personalizar a avaliação e enviar o laudo."
      onBack={onBack}
      onNext={onNext}
      getError={getError}
    >
      <Field label="Nome completo">
        <input
          type="text"
          value={form.lead.nome}
          onChange={(e) => update("nome", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </Field>
      <Field label="E-mail">
        <input
          type="email"
          value={form.lead.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>
      <Field label="WhatsApp (com DDD)">
        <input
          type="tel"
          value={form.lead.whatsapp}
          onChange={(e) => update("whatsapp", e.target.value)}
          className={inputClass}
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Idade">
          <input
            type="number"
            value={form.lead.idade}
            onChange={(e) => update("idade", e.target.value)}
            className={inputClass}
            min={18}
            max={100}
          />
        </Field>
        <Field label="Sexo biológico">
          <select
            value={form.lead.sexo}
            onChange={(e) => update("sexo", e.target.value as Sexo)}
            className={inputClass}
          >
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
          </select>
        </Field>
      </div>
    </StepContainer>
  );
}

function Step2Antropo({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState["antropometria"]>(key: K, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function getError(): string | null {
    if (form.antropometria.peso_kg === "") return "Informe seu peso.";
    if (form.antropometria.altura_cm === "") return "Informe sua altura.";
    return null;
  }

  return (
    <StepContainer
      title="Antropometria"
      subtitle="Dados básicos sobre o seu corpo. Peso e altura são obrigatórios; o restante é opcional."
      onBack={onBack}
      onNext={onNext}
      getError={getError}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Peso (kg)">
          <input
            type="number"
            step="0.1"
            value={form.antropometria.peso_kg}
            onChange={(e) => update("peso_kg", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            type="number"
            value={form.antropometria.altura_cm}
            onChange={(e) => update("altura_cm", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Circunferência abdominal (cm) — opcional">
        <input
          type="number"
          step="0.1"
          value={form.antropometria.circunferencia_abdominal_cm}
          onChange={(e) => update("circunferencia_abdominal_cm", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Percentual de gordura estimado (%) — opcional">
        <input
          type="number"
          step="0.1"
          value={form.antropometria.percentual_gordura}
          onChange={(e) => update("percentual_gordura", e.target.value)}
          className={inputClass}
        />
      </Field>
    </StepContainer>
  );
}

function Step3Marcadores({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState["marcadores"]>(key: K, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <StepContainer
      title="Marcadores sanguíneos"
      subtitle="Tem exames recentes? Preencha o que tiver. Pode pular qualquer campo — a avaliação se adapta ao que estiver disponível."
      onBack={onBack}
      onNext={onNext}
    >
      <MarkerGroup title="Glicose e insulina">
        <MarkerField label="Glicemia de jejum (mg/dL)" value={form.marcadores.glicemia_jejum} onChange={(v) => update("glicemia_jejum", v)} />
        <MarkerField label="HbA1c (%)" value={form.marcadores.hba1c} onChange={(v) => update("hba1c", v)} />
        <MarkerField label="Insulina de jejum (µUI/mL)" value={form.marcadores.insulina_jejum} onChange={(v) => update("insulina_jejum", v)} />
        <MarkerField label="HOMA-IR" value={form.marcadores.homa_ir} onChange={(v) => update("homa_ir", v)} />
      </MarkerGroup>

      <MarkerGroup title="Tireoide">
        <MarkerField label="TSH (mUI/L)" value={form.marcadores.tsh} onChange={(v) => update("tsh", v)} />
        <MarkerField label="T4 livre (ng/dL)" value={form.marcadores.t4_livre} onChange={(v) => update("t4_livre", v)} />
      </MarkerGroup>

      <MarkerGroup title="Lipidograma">
        <MarkerField label="Colesterol total (mg/dL)" value={form.marcadores.colesterol_total} onChange={(v) => update("colesterol_total", v)} />
        <MarkerField label="HDL (mg/dL)" value={form.marcadores.hdl} onChange={(v) => update("hdl", v)} />
        <MarkerField label="LDL (mg/dL)" value={form.marcadores.ldl} onChange={(v) => update("ldl", v)} />
        <MarkerField label="Triglicérides (mg/dL)" value={form.marcadores.triglicerides} onChange={(v) => update("triglicerides", v)} />
      </MarkerGroup>

      <MarkerGroup title="Outros">
        <MarkerField label="Vitamina D 25-OH (ng/mL)" value={form.marcadores.vit_d} onChange={(v) => update("vit_d", v)} />
        <MarkerField label="Ferritina (ng/mL)" value={form.marcadores.ferritina} onChange={(v) => update("ferritina", v)} />
        <MarkerField label="PCR ultrassensível (mg/L)" value={form.marcadores.pcr_us} onChange={(v) => update("pcr_us", v)} />
        <MarkerField label="Cortisol matinal (µg/dL)" value={form.marcadores.cortisol_matinal} onChange={(v) => update("cortisol_matinal", v)} />
        <MarkerField label="Testosterona total (ng/dL)" value={form.marcadores.testosterona_total} onChange={(v) => update("testosterona_total", v)} />
        <MarkerField label="Estradiol (pg/mL)" value={form.marcadores.estradiol} onChange={(v) => update("estradiol", v)} />
      </MarkerGroup>
    </StepContainer>
  );
}

function Step4Habitos({
  form,
  update,
  onBack,
  onSubmit,
}: {
  form: FormState;
  update: <K extends keyof FormState["habitos"]>(key: K, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  function getError(): string | null {
    if (form.habitos.queixa_principal.trim().length < 6)
      return "Descreva brevemente sua queixa principal — esse campo é essencial para a avaliação.";
    return null;
  }

  return (
    <StepContainer
      title="Hábitos e histórico"
      subtitle="A parte mais importante. Hábitos influenciam tanto quanto exames — em alguns casos, mais."
      onBack={onBack}
      onNext={onSubmit}
      nextLabel="Gerar minha avaliação"
      getError={getError}
    >
      <Field label="Qual é a sua principal queixa relacionada ao emagrecimento? *">
        <textarea
          value={form.habitos.queixa_principal}
          onChange={(e) => update("queixa_principal", e.target.value)}
          className={`${inputClass} min-h-24`}
          placeholder="Ex: estou tentando emagrecer há 2 anos, perco peso e ganho de volta, sinto muito cansaço..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Horas de sono por noite">
          <select value={form.habitos.sono_horas} onChange={(e) => update("sono_horas", e.target.value)} className={inputClass}>
            <option value="">Selecione</option>
            <option value="menos_5">Menos de 5h</option>
            <option value="5_6">5 a 6h</option>
            <option value="6_7">6 a 7h</option>
            <option value="7_8">7 a 8h</option>
            <option value="mais_8">Mais de 8h</option>
          </select>
        </Field>
        <Field label="Qualidade do sono">
          <select value={form.habitos.qualidade_sono} onChange={(e) => update("qualidade_sono", e.target.value)} className={inputClass}>
            <option value="">Selecione</option>
            <option value="ruim">Ruim — acordo cansado</option>
            <option value="media">Média</option>
            <option value="boa">Boa</option>
            <option value="excelente">Excelente</option>
          </select>
        </Field>
      </div>

      <Field label="Nível de estresse percebido (últimos 6 meses)">
        <select value={form.habitos.nivel_estresse} onChange={(e) => update("nivel_estresse", e.target.value)} className={inputClass}>
          <option value="">Selecione</option>
          <option value="baixo">Baixo</option>
          <option value="moderado">Moderado</option>
          <option value="alto">Alto</option>
          <option value="muito_alto">Muito alto / crônico</option>
        </select>
      </Field>

      <Field label="Padrão alimentar atual">
        <select value={form.habitos.padrao_alimentar} onChange={(e) => update("padrao_alimentar", e.target.value)} className={inputClass}>
          <option value="">Selecione</option>
          <option value="sem_dieta">Sem dieta estruturada</option>
          <option value="low_carb">Low carb / cetogênica</option>
          <option value="jejum_intermitente">Jejum intermitente</option>
          <option value="mediterranea">Mediterrânea / equilibrada</option>
          <option value="restritiva">Restritiva (muito poucas calorias)</option>
          <option value="vegana_vegetariana">Vegana/vegetariana</option>
        </select>
      </Field>

      <Field label="Ingestão de proteína por dia (aproximadamente)">
        <select value={form.habitos.ingestao_proteica} onChange={(e) => update("ingestao_proteica", e.target.value)} className={inputClass}>
          <option value="">Selecione</option>
          <option value="baixa">Baixa — pouca carne/ovos/laticínios</option>
          <option value="media">Média — proteína em algumas refeições</option>
          <option value="alta">Alta — proteína em todas as refeições</option>
          <option value="nao_sei">Não sei estimar</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Frequência de treino">
          <select value={form.habitos.frequencia_treino} onChange={(e) => update("frequencia_treino", e.target.value)} className={inputClass}>
            <option value="">Selecione</option>
            <option value="sedentario">Sedentário</option>
            <option value="1_2">1-2x por semana</option>
            <option value="3_4">3-4x por semana</option>
            <option value="5_mais">5+ vezes por semana</option>
          </select>
        </Field>
        <Field label="Tipo de treino predominante">
          <select value={form.habitos.tipo_treino} onChange={(e) => update("tipo_treino", e.target.value)} className={inputClass}>
            <option value="">Selecione</option>
            <option value="nenhum">Nenhum</option>
            <option value="aerobico">Aeróbico (corrida, bike)</option>
            <option value="forca">Força / musculação</option>
            <option value="misto">Misto</option>
            <option value="hiit">HIIT / funcional</option>
          </select>
        </Field>
      </div>

      <Field label="Consumo de álcool semanal">
        <select value={form.habitos.consumo_alcool} onChange={(e) => update("consumo_alcool", e.target.value)} className={inputClass}>
          <option value="">Selecione</option>
          <option value="nenhum">Não bebo</option>
          <option value="leve">Até 3 doses/semana</option>
          <option value="moderado">4 a 7 doses/semana</option>
          <option value="alto">Mais de 7 doses/semana</option>
        </select>
      </Field>

      <Field label="Tentativas anteriores de emagrecer">
        <textarea
          value={form.habitos.tentativas_anteriores}
          onChange={(e) => update("tentativas_anteriores", e.target.value)}
          className={`${inputClass} min-h-20`}
          placeholder="Ex: já fiz low carb, contagem de calorias, jejum 16:8. Perco peso e ganho de volta."
        />
      </Field>

      <Field label="Medicamentos em uso (opcional)">
        <input
          type="text"
          value={form.habitos.medicamentos}
          onChange={(e) => update("medicamentos", e.target.value)}
          className={inputClass}
          placeholder="Ex: levotiroxina 50mcg, ACO, antidepressivo..."
        />
      </Field>

      <Field label="Comorbidades / condições conhecidas (opcional)">
        <input
          type="text"
          value={form.habitos.comorbidades}
          onChange={(e) => update("comorbidades", e.target.value)}
          className={inputClass}
          placeholder="Ex: hipotireoidismo, SOP, hipertensão, ansiedade..."
        />
      </Field>
    </StepContainer>
  );
}

function StepContainer({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  getError,
  nextLabel,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  getError?: () => string | null;
  nextLabel?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    const err = getError?.() ?? null;
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h2 className="text-3xl font-medium">{title}</h2>
      <p className="mt-2 text-white/60">{subtitle}</p>
      <div className="mt-8 space-y-5">{children}</div>
      <div className="mt-10 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors cursor-pointer"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors cursor-pointer"
        >
          {nextLabel ?? "Avançar"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-amber-300 text-center">{error}</p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function MarkerGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-white/40 mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function MarkerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/60 mb-1">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-md bg-white/5 border border-white/10 focus:border-emerald-500/60 focus:outline-none focus:bg-white/[0.07] text-white text-sm transition-colors";

function ResultView({ data }: { data: ReportResponse }) {
  const { report, doctor, referencias_expandidas, gerado_em } = data;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8 pb-6 border-b border-white/10">
        <p className="text-emerald-400 text-xs uppercase tracking-wide font-medium">
          Avaliação Metabólica
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-medium">
          {report.classificacao_obstaculo_principal}
        </h1>
        <p className="mt-4 text-xs text-white/40">
          Gerado em {new Date(gerado_em).toLocaleString("pt-BR")} • Validação:{" "}
          {doctor.nome} • {doctor.crm}
        </p>
      </div>

      <Section title="Resumo clínico">
        <p className="text-white/80 leading-relaxed">{report.resumo_clinico}</p>
      </Section>

      {report.alertas_clinicos.length > 0 && (
        <Section title="Sinais que merecem atenção">
          <div className="space-y-2">
            {report.alertas_clinicos.map((a, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-100 text-sm"
              >
                {a}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Obstáculos identificados">
        <div className="space-y-4">
          {report.obstaculos.map((o, i) => (
            <ObstaculoCard key={i} obstaculo={o} index={i + 1} />
          ))}
        </div>
      </Section>

      <Section title="Próximos passos prioritários">
        <ol className="space-y-2.5 list-decimal list-inside text-white/80">
          {report.prioridades_de_acao.map((p, i) => (
            <li key={i} className="leading-relaxed">
              {p}
            </li>
          ))}
        </ol>
      </Section>

      {report.proximos_exames_sugeridos.length > 0 && (
        <Section title="Exames complementares sugeridos">
          <ul className="space-y-2 text-white/80">
            {report.proximos_exames_sugeridos.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-400 shrink-0">▸</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {Object.keys(referencias_expandidas).length > 0 && (
        <Section title="Referências científicas">
          <ol className="space-y-1.5 text-xs text-white/50">
            {Object.entries(referencias_expandidas).map(([id, citation]) => (
              <li key={id}>
                <span className="text-white/70">{id}.</span> {citation}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <div className="mt-12 p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-xs uppercase tracking-wider text-emerald-300 mb-3">
          Validação clínica
        </p>
        <p className="text-lg font-medium">{doctor.nome}</p>
        <p className="text-sm text-white/60">{doctor.especialidade}</p>
        <p className="text-sm text-white/60">{doctor.crm}</p>
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Esta avaliação é uma análise educacional baseada em literatura científica e nos dados que
          você forneceu. Não substitui consulta médica nem constitui diagnóstico. Os achados aqui
          listados devem ser interpretados pelo seu médico, que considerará seu contexto completo
          antes de qualquer conduta terapêutica.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs uppercase tracking-wider text-white/40 mb-3 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function ObstaculoCard({ obstaculo, index }: { obstaculo: Obstaculo; index: number }) {
  const severityStyle = {
    alta: "bg-red-500/10 border-red-500/30 text-red-300",
    media: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    baixa: "bg-white/5 border-white/15 text-white/60",
  }[obstaculo.severidade];

  const severityLabel = {
    alta: "Severidade alta",
    media: "Severidade média",
    baixa: "Severidade baixa",
  }[obstaculo.severidade];

  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/40 mb-1">Obstáculo #{index}</p>
          <h3 className="text-lg font-medium text-white">{obstaculo.nome}</h3>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border ${severityStyle}`}>
          {severityLabel}
        </span>
      </div>
      <p className="mt-3 text-white/75 leading-relaxed text-sm">{obstaculo.explicacao}</p>
      {obstaculo.marcadores_relacionados.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {obstaculo.marcadores_relacionados.map((m, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
              {m}
            </span>
          ))}
        </div>
      )}
      {obstaculo.referencias.length > 0 && (
        <p className="mt-3 text-xs text-white/40">
          Referências: {obstaculo.referencias.join(", ")}
        </p>
      )}
    </div>
  );
}
