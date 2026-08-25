"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function atualizarStatusVenda(solicitacaoId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("trade_in_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", solicitacaoId);
  revalidatePath("/admin/vender");
}

export async function definirValorFinal(solicitacaoId: string, formData: FormData) {
  const supabase = await createClient();
  const valor = Number(formData.get("valorFinal") ?? 0);
  if (valor <= 0) return;

  const expiraEm = new Date();
  expiraEm.setDate(expiraEm.getDate() + 7);

  await supabase
    .from("trade_in_requests")
    .update({
      final_value_cents: Math.round(valor * 100),
      status: "proposta_enviada",
      proposal_expires_at: expiraEm.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", solicitacaoId);

  revalidatePath("/admin/vender");
}
