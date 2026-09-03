"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { buildCatalogo, calcularOfertas, type OfferType, type RespostasEstimativa } from "@/lib/trade-in/pricing";
import { enviarEmailInstrucoesEnvio } from "@/lib/email/vender-instrucoes-envio";
import { enviarEmailContrato } from "@/lib/email/vender-contrato";

type EnviarSolicitacaoInput = RespostasEstimativa & {
  category: string;
  color?: string;
  imei: string;
  offerType: OfferType;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

const REGEX_IMEI = /^\d{15}$/;

async function buscarCatalogoPrecos() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("trade_in_base_prices").select("brand, model, valor_cents");
  return buildCatalogo(data ?? []);
}

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

  // Item 03: IMEI obrigatório, validado no servidor — nunca confiamos só na
  // checagem do formulário no navegador.
  if (!REGEX_IMEI.test(input.imei)) {
    return { error: "Informe um IMEI válido, com 15 números." };
  }

  const catalogo = await buscarCatalogoPrecos();
  const { agoraCents, maisValorCents } = calcularOfertas(input, catalogo);
  const valorEscolhidoCents = input.offerType === "agora" ? agoraCents : maisValorCents;

  // O cliente já escolheu a modalidade e viu o valor ANTES de enviar (ele
  // seleciona o card na etapa "Oferta") — não existe contraproposta nem
  // aprovação manual de admin depois disso, então o envio já é a
  // aceitação: o registro nasce em "aceito" e segue direto pra etapa de
  // assinatura do contrato (ver effectiveStep em VenderWizard.tsx).
  const agora = new Date().toISOString();

  const { data, error } = await supabase
    .from("trade_in_requests")
    .insert({
      user_id: user.id,
      category: input.category,
      brand: input.brand,
      model: input.model,
      storage_gb: input.storageGb ?? null,
      color: input.color ?? null,
      imei: input.imei,
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
      final_value_cents: valorEscolhidoCents,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      status: "aceito",
      responded_at: agora,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[vender/formulario] falha ao enviar solicitação:", error?.message);
    if (error?.message.includes("imei")) {
      return { error: "IMEI inválido — confira se digitou os 15 números corretamente." };
    }
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
    .select("id, user_id, status, contract_accepted_at, payment_method, brand, model, storage_gb, color, imei, final_value_cents, estimated_value_cents, contact_name, contact_email")
    .eq("id", id)
    .single();

  if (!solicitacao || solicitacao.user_id !== user.id) {
    return { erro: "Solicitação não encontrada." as const };
  }

  return { solicitacao };
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

  const assinadoEm = new Date().toISOString();
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("trade_in_requests")
    .update({
      contract_accepted_name: nomeCompleto.trim(),
      contract_accepted_at: assinadoEm,
      updated_at: assinadoEm,
    })
    .eq("id", id);

  // Item 05: cópia do contrato (já preenchido automaticamente) por e-mail.
  const s = resultado.solicitacao;
  await enviarEmailContrato({
    paraEmail: s.contact_email,
    nomeCliente: nomeCompleto.trim(),
    solicitacaoId: id,
    brand: s.brand,
    model: s.model,
    storageGb: s.storage_gb,
    color: s.color,
    imei: s.imei,
    valorCents: s.final_value_cents ?? s.estimated_value_cents ?? 0,
    assinadoEm,
  });

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

  // Item 02: instruções de postagem automáticas por e-mail assim que a
  // forma de recebimento é confirmada.
  const s = resultado.solicitacao;
  await enviarEmailInstrucoesEnvio({
    paraEmail: s.contact_email,
    nomeCliente: s.contact_name,
    solicitacaoId: id,
    brand: s.brand,
    model: s.model,
    valorCents: s.final_value_cents ?? s.estimated_value_cents ?? 0,
  });

  revalidatePath("/vender/formulario");
  return {};
}
