"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type EstadoConfiguracoes = { erro?: string; salvo?: boolean } | null;

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

function numero(formData: FormData, campo: string) {
  return Number(String(formData.get(campo) ?? "0").replace(",", "."));
}

export async function salvarConfiguracoesParcelamento(
  _estadoAnterior: EstadoConfiguracoes,
  formData: FormData
): Promise<EstadoConfiguracoes> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const maxInstallments = Number(formData.get("maxInstallments") ?? 1);

  if (maxInstallments < 1 || maxInstallments > 24) {
    return { erro: "Máximo de parcelas deve ser entre 1 e 24." };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      parcelamento_max_installments: maxInstallments,
      mp_taxa_cartao_avista_percent: numero(formData, "taxaCartaoAvista"),
      mp_taxa_cartao_2a6x_percent: numero(formData, "taxaCartao2a6x"),
      mp_taxa_cartao_7a12x_percent: numero(formData, "taxaCartao7a12x"),
      mp_taxa_cartao_13a18x_percent: numero(formData, "taxaCartao13a18x"),
      mp_taxa_pix_percent: numero(formData, "taxaPix"),
      mp_taxa_boleto_reais: numero(formData, "taxaBoleto"),
      mp_taxa_parcelamento_2x_percent: numero(formData, "taxaParcelamento2x"),
      mp_taxa_parcelamento_13a18x_percent: numero(formData, "taxaParcelamento13a18x"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    console.error("[admin/configuracoes] falha ao salvar:", error.message);
    return { erro: "Não foi possível salvar. Confira se sua conta é admin." };
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  return { salvo: true };
}
