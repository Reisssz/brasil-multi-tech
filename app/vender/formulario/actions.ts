"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { calcularOfertas, type OfferType, type RespostasEstimativa } from "@/lib/trade-in/pricing";

type EnviarSolicitacaoInput = RespostasEstimativa & {
  category: string;
  color?: string;
  offerType: OfferType;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

export async function enviarSolicitacao(
  input: EnviarSolicitacaoInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "login_required" };
  }

  const { agoraCents, maisValorCents } = calcularOfertas(input);
  const valorEscolhidoCents = input.offerType === "agora" ? agoraCents : maisValorCents;

  const { data, error } = await supabase
    .from("trade_in_requests")
    .insert({
      user_id: user.id,
      category: input.category,
      brand: input.brand,
      model: input.model,
      storage_gb: input.storageGb ?? null,
      color: input.color ?? null,
      turns_on: input.turnsOn,
      faz_recebe_ligacoes: input.fazRecebeLigacoes,
      wifi_bluetooth_ok: input.wifiBluetoothOk,
      marcas_de_uso: input.marcasDeUso,
      traseira_lateral_danificada: input.traseiraLateralDanificada,
      tela_danificada: input.telaDanificada,
      biometria_funciona: input.biometriaFunciona,
      camera_com_problema: input.cameraComProblema,
      saude_bateria: input.saudeBateria,
      peca_nao_genuina: input.pecaNaoGenuina,
      includes_box: input.includesBox ?? false,
      includes_charger: input.includesCharger ?? false,
      offer_type: input.offerType,
      estimated_value_cents: valorEscolhidoCents,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      status: "novo",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[vender/formulario] falha ao enviar solicitação:", error?.message);
    return { error: "Não foi possível enviar sua solicitação. Tente novamente." };
  }

  revalidatePath("/vender/formulario");
  return { id: data.id };
}

async function buscarSolicitacaoPropria(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { erro: "Você precisa estar logado." as const };

  const { data: solicitacao } = await supabase
    .from("trade_in_requests")
    .select("id, user_id, status, contract_accepted_at, payment_method")
    .eq("id", id)
    .single();

  if (!solicitacao || solicitacao.user_id !== user.id) {
    return { erro: "Solicitação não encontrada." as const };
  }

  return { solicitacao };
}

export async function responderProposta(id: string, aceitar: boolean): Promise<{ error?: string }> {
  const resultado = await buscarSolicitacaoPropria(id);
  if ("erro" in resultado) return { error: resultado.erro };
  if (resultado.solicitacao.status !== "proposta_enviada") {
    return { error: "Essa solicitação não tem uma proposta pendente." };
  }

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("trade_in_requests")
    .update({
      status: aceitar ? "aceito" : "recusado",
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/vender/formulario");
  return {};
}

export async function assinarContrato(id: string, nomeCompleto: string): Promise<{ error?: string }> {
  if (nomeCompleto.trim().length < 3) {
    return { error: "Informe seu nome completo." };
  }

  const resultado = await buscarSolicitacaoPropria(id);
  if ("erro" in resultado) return { error: resultado.erro };
  if (resultado.solicitacao.status !== "aceito") {
    return { error: "Essa solicitação ainda não foi aceita." };
  }

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("trade_in_requests")
    .update({
      contract_accepted_name: nomeCompleto.trim(),
      contract_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/vender/formulario");
  return {};
}

export async function definirRecebimento(
  id: string,
  metodo: "pix" | "transferencia",
  detalhes: string
): Promise<{ error?: string }> {
  if (detalhes.trim().length < 4) {
    return { error: metodo === "pix" ? "Informe uma chave Pix válida." : "Informe os dados bancários." };
  }

  const resultado = await buscarSolicitacaoPropria(id);
  if ("erro" in resultado) return { error: resultado.erro };
  if (resultado.solicitacao.status !== "aceito" || !resultado.solicitacao.contract_accepted_at) {
    return { error: "Assine o contrato antes de escolher como receber." };
  }

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("trade_in_requests")
    .update({
      payment_method: metodo,
      payment_pix_key: metodo === "pix" ? detalhes.trim() : null,
      payment_bank_details: metodo === "transferencia" ? detalhes.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/vender/formulario");
  return {};
}
