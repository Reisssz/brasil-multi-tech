"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

export type EstadoPreco = { erro?: string } | null;

export async function criarPrecoBase(_estadoAnterior: EstadoPreco, formData: FormData): Promise<EstadoPreco> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);

  if (!brand || !model) return { erro: "Preencha marca e modelo." };
  if (valor <= 0) return { erro: "Informe um valor válido." };

  const { error } = await supabase.from("trade_in_base_prices").insert({
    brand,
    model,
    valor_cents: Math.round(valor * 100),
  });

  if (error) {
    if (error.code === "23505") return { erro: "Já existe um preço cadastrado pra essa marca/modelo." };
    console.error("[admin/vender/precos] falha ao criar:", error.message);
    return { erro: "Não foi possível salvar." };
  }

  revalidatePath("/admin/vender/precos");
  return {};
}

export async function atualizarPrecoBase(id: string, formData: FormData) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  const valor = Number(formData.get("valor") ?? 0);
  if (valor <= 0) return;

  await supabase
    .from("trade_in_base_prices")
    .update({ valor_cents: Math.round(valor * 100), updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/vender/precos");
}

export async function removerPrecoBase(id: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  await supabase.from("trade_in_base_prices").delete().eq("id", id);
  revalidatePath("/admin/vender/precos");
}
