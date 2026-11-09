"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

export type EstadoConfiguracaoFrete = { erro?: string; sucesso?: boolean } | null;

const PRAZO_MAXIMO_DIAS = 60;

/** Aceita "29,90", "29.90" ou "1.299,90"; devolve centavos ou null se inválido. */
function reaisParaCentavos(valor: FormDataEntryValue | null): number | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim().replace(/\s/g, "").replace("R$", "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero < 0) return null;
  return Math.round(numero * 100);
}

export async function atualizarConfiguracaoFreteFixo(
  _estadoAnterior: EstadoConfiguracaoFrete,
  formData: FormData
): Promise<EstadoConfiguracaoFrete> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const sulCents = reaisParaCentavos(formData.get("sul"));
  const sudesteCents = reaisParaCentavos(formData.get("sudeste"));
  const prazoDias = Number(formData.get("prazoDias") ?? 0);

  if (sulCents === null) return { erro: "Informe um valor válido para a região Sul (use 0 para frete grátis)." };
  if (sudesteCents === null) return { erro: "Informe um valor válido para a região Sudeste (use 0 para frete grátis)." };
  if (!Number.isInteger(prazoDias) || prazoDias < 1 || prazoDias > PRAZO_MAXIMO_DIAS) {
    return { erro: `Informe um prazo de entrega válido (1 a ${PRAZO_MAXIMO_DIAS} dias úteis).` };
  }

  // Tabela sem policies de RLS: a escrita passa pelo service role, depois de checar que é admin.
  const { error } = await createAdminClient()
    .from("shipping_settings")
    .update({
      fixed_enabled: formData.get("ativo") === "on",
      fixed_sul_cents: sulCents,
      fixed_sudeste_cents: sudesteCents,
      fixed_prazo_dias: prazoDias,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin/frete] falha ao salvar configuração de frete fixo:", error.message);
    return { erro: "Não foi possível salvar a configuração." };
  }

  revalidatePath("/admin/frete");
  return { sucesso: true };
}
