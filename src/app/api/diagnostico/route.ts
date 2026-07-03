import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, OUTPUT_SCHEMA, getDoctorInfo, REFERENCE_MAP } from "./prompt";
import { saveLead } from "./leads";

export const runtime = "nodejs";
export const maxDuration = 60;

type Obstaculo = {
  nome: string;
  severidade: "alta" | "media" | "baixa";
  explicacao: string;
  marcadores_relacionados: string[];
  referencias: string[];
};

type ReportPayload = {
  resumo_clinico: string;
  classificacao_obstaculo_principal: string;
  obstaculos: Obstaculo[];
  prioridades_de_acao: string[];
  proximos_exames_sugeridos: string[];
  alertas_clinicos: string[];
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ausente no servidor. Configure .env.local." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const lead = body.lead as { nome?: string; email?: string; whatsapp?: string } | undefined;
  if (!lead?.nome || !lead?.email || !lead?.whatsapp) {
    return NextResponse.json(
      { error: "Campos obrigatórios: nome, email, whatsapp." },
      { status: 400 },
    );
  }

  const userPrompt = buildUserPrompt(body);

  const client = new Anthropic({ apiKey });

  let report: ReportPayload;
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: OUTPUT_SCHEMA,
      },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      throw new Error("Nenhum bloco de texto na resposta do modelo.");
    }

    report = JSON.parse(textBlock.text) as ReportPayload;
  } catch (err) {
    console.error("[diagnostico] erro na chamada Anthropic:", err);
    const message =
      err instanceof Anthropic.APIError
        ? `Erro da API (${err.status}): ${err.message}`
        : err instanceof Error
          ? err.message
          : "Erro desconhecido ao gerar avaliação.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const doctor = getDoctorInfo();
  const referencias_expandidas = expandReferences(report.obstaculos);

  try {
    await saveLead({
      timestamp: new Date().toISOString(),
      nome: lead.nome,
      email: lead.email,
      whatsapp: lead.whatsapp,
      payload: body,
      report_summary: report.resumo_clinico,
    });
  } catch (err) {
    console.error("[diagnostico] falha ao salvar lead:", err);
  }

  return NextResponse.json({
    report,
    doctor,
    referencias_expandidas,
    gerado_em: new Date().toISOString(),
  });
}

function expandReferences(obstaculos: Obstaculo[]): Record<string, string> {
  const ids = new Set<string>();
  for (const o of obstaculos) {
    for (const r of o.referencias) ids.add(r);
  }
  const out: Record<string, string> = {};
  for (const id of ids) {
    if (REFERENCE_MAP[id]) out[id] = REFERENCE_MAP[id];
  }
  return out;
}

function buildUserPrompt(body: Record<string, unknown>): string {
  const lead = body.lead as Record<string, unknown> | undefined;
  const antropo = body.antropometria as Record<string, unknown> | undefined;
  const marcadores = body.marcadores as Record<string, unknown> | undefined;
  const habitos = body.habitos as Record<string, unknown> | undefined;

  const linhas: string[] = ["# Dados do paciente", ""];

  if (lead) {
    linhas.push("## Identificação");
    linhas.push(`- Nome: ${lead.nome ?? "—"}`);
    linhas.push(`- Idade: ${lead.idade ?? "—"} anos`);
    linhas.push(`- Sexo biológico: ${lead.sexo ?? "—"}`);
    linhas.push("");
  }

  if (antropo) {
    linhas.push("## Antropometria");
    const peso = antropo.peso_kg as number | undefined;
    const altura = antropo.altura_cm as number | undefined;
    linhas.push(`- Peso: ${peso ?? "—"} kg`);
    linhas.push(`- Altura: ${altura ?? "—"} cm`);
    if (peso && altura) {
      const imc = peso / Math.pow(altura / 100, 2);
      linhas.push(`- IMC calculado: ${imc.toFixed(1)} kg/m²`);
    }
    if (antropo.circunferencia_abdominal_cm) {
      linhas.push(`- Circunferência abdominal: ${antropo.circunferencia_abdominal_cm} cm`);
    }
    if (antropo.percentual_gordura) {
      linhas.push(`- Percentual de gordura estimado: ${antropo.percentual_gordura}%`);
    }
    linhas.push("");
  }

  if (marcadores && Object.values(marcadores).some((v) => v !== "" && v != null)) {
    linhas.push("## Marcadores sanguíneos");
    const labels: Record<string, string> = {
      glicemia_jejum: "Glicemia de jejum (mg/dL)",
      hba1c: "HbA1c (%)",
      insulina_jejum: "Insulina de jejum (µUI/mL)",
      homa_ir: "HOMA-IR",
      tsh: "TSH (mUI/L)",
      t4_livre: "T4 livre (ng/dL)",
      vit_d: "Vitamina D 25-OH (ng/mL)",
      ferritina: "Ferritina (ng/mL)",
      pcr_us: "PCR ultrassensível (mg/L)",
      cortisol_matinal: "Cortisol matinal (µg/dL)",
      colesterol_total: "Colesterol total (mg/dL)",
      hdl: "HDL (mg/dL)",
      ldl: "LDL (mg/dL)",
      triglicerides: "Triglicérides (mg/dL)",
      testosterona_total: "Testosterona total (ng/dL)",
      estradiol: "Estradiol (pg/mL)",
    };
    for (const [key, label] of Object.entries(labels)) {
      const value = marcadores[key];
      if (value !== "" && value != null) {
        linhas.push(`- ${label}: ${value}`);
      }
    }
    linhas.push("");
  } else {
    linhas.push("## Marcadores sanguíneos");
    linhas.push("- Paciente não trouxe exames laboratoriais.");
    linhas.push(
      "(Levar isso em conta: parte das hipóteses dependerá de exames, sinalize quais sugerir.)",
    );
    linhas.push("");
  }

  if (habitos) {
    linhas.push("## Hábitos e histórico");
    if (habitos.sono_horas) linhas.push(`- Horas de sono por noite: ${habitos.sono_horas}`);
    if (habitos.qualidade_sono) linhas.push(`- Qualidade do sono: ${habitos.qualidade_sono}`);
    if (habitos.nivel_estresse) linhas.push(`- Nível de estresse percebido: ${habitos.nivel_estresse}`);
    if (habitos.padrao_alimentar) linhas.push(`- Padrão alimentar atual: ${habitos.padrao_alimentar}`);
    if (habitos.ingestao_proteica) linhas.push(`- Ingestão proteica diária estimada: ${habitos.ingestao_proteica}`);
    if (habitos.frequencia_treino) linhas.push(`- Frequência de treino: ${habitos.frequencia_treino}`);
    if (habitos.tipo_treino) linhas.push(`- Tipo de treino: ${habitos.tipo_treino}`);
    if (habitos.consumo_alcool) linhas.push(`- Consumo de álcool: ${habitos.consumo_alcool}`);
    if (habitos.tentativas_anteriores) linhas.push(`- Tentativas anteriores de emagrecer: ${habitos.tentativas_anteriores}`);
    if (habitos.medicamentos) linhas.push(`- Medicamentos em uso: ${habitos.medicamentos}`);
    if (habitos.comorbidades) linhas.push(`- Comorbidades relatadas: ${habitos.comorbidades}`);
    if (habitos.queixa_principal) linhas.push(`- Queixa principal: ${habitos.queixa_principal}`);
    linhas.push("");
  }

  linhas.push("# Tarefa");
  linhas.push(
    "Gere a avaliação metabólica seguindo rigorosamente o schema JSON. Use apenas as referências da base de evidências (IDs REF-N). Não invente exames, nem dados que não foram informados.",
  );

  return linhas.join("\n");
}
