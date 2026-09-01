"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type EstadoCupom = { erro?: string } | null;

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

export async function criarCupom(_estadoAnterior: EstadoCupom, formData: FormData): Promise<EstadoCupom> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const descontoPercent = Number(formData.get("descontoPercent") ?? 0);
  const somentePrimeiraCompra = formData.get("somentePrimeiraCompra") === "on";
  const validadeBruta = String(formData.get("validade") ?? "").trim();
  const usosMaximosBruto = String(formData.get("usosMaximos") ?? "").trim();

  if (!codigo || codigo.length < 3) {
    return { erro: "Informe um código com pelo menos 3 caracteres." };
  }
  if (descontoPercent <= 0 || descontoPercent > 100) {
    return { erro: "O desconto precisa ser entre 1% e 100%." };
  }

  const { error } = await supabase.from("coupons").insert({
    codigo,
    desconto_percent: descontoPercent,
    somente_primeira_compra: somentePrimeiraCompra,
    validade: validadeBruta ? new Date(validadeBruta).toISOString() : null,
    usos_maximos: usosMaximosBruto ? Number(usosMaximosBruto) : null,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { erro: "Já existe um cupom com esse código." };
    }
    console.error("[admin/cupons] falha ao criar cupom:", error.message);
    return { erro: "Não foi possível criar o cupom." };
  }

  revalidatePath("/admin/cupons");
  return {};
}

export async function alternarCupom(cupomId: string, ativo: boolean) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;
  await supabase.from("coupons").update({ ativo, updated_at: new Date().toISOString() }).eq("id", cupomId);
  revalidatePath("/admin/cupons");
}

export async function removerCupom(cupomId: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;
  await supabase.from("coupons").delete().eq("id", cupomId);
  revalidatePath("/admin/cupons");
}
