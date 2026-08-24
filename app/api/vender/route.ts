import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcularEstimativa, type RespostasEstimativa } from "@/lib/trade-in/pricing";

interface VenderBody extends RespostasEstimativa {
  color?: string;
  includesBox: boolean;
  includesCharger: boolean;
  notes?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as VenderBody | null;

  if (!body?.brand || !body.model || !body.contactName || !body.contactPhone || !body.contactEmail) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }

  const { valorEstimadoCents, precoBaseEncontrado } = calcularEstimativa(body);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: solicitacao, error } = await supabase
    .from("trade_in_requests")
    .insert({
      user_id: user?.id ?? null,
      brand: body.brand,
      model: body.model,
      storage_gb: body.storageGb ?? null,
      color: body.color ?? null,
      screen_condition: body.screenCondition,
      body_condition: body.bodyCondition,
      battery_health: body.batteryHealth,
      turns_on: body.turnsOn,
      broken_parts: body.brokenParts ?? [],
      replaced_parts: body.replacedParts ?? [],
      includes_box: body.includesBox,
      includes_charger: body.includesCharger,
      notes: body.notes ?? null,
      contact_name: body.contactName,
      contact_phone: body.contactPhone,
      contact_email: body.contactEmail,
      estimated_value_cents: valorEstimadoCents,
      status: "novo",
    })
    .select("id")
    .single();

  if (error || !solicitacao) {
    console.error("[vender] falha ao salvar solicitação:", error?.message);
    return NextResponse.json({ error: "Não foi possível enviar sua solicitação. Tente novamente." }, { status: 500 });
  }

  return NextResponse.json({
    id: solicitacao.id,
    valorEstimadoCents,
    precoBaseEncontrado,
  });
}
