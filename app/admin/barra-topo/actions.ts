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

export type EstadoBarraTopo = { erro?: string; sucesso?: boolean } | null;

const MAX_MENSAGENS = 10;
const MAX_TAMANHO_MENSAGEM = 120;

export async function atualizarBarraTopo(_estadoAnterior: EstadoBarraTopo, formData: FormData): Promise<EstadoBarraTopo> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const rotulo = String(formData.get("rotulo") ?? "").trim();
  const ctaTexto = String(formData.get("ctaTexto") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const mensagens = String(formData.get("mensagens") ?? "")
    .split("\n")
    .map((m) => m.trim())
    .filter(Boolean);

  if (mensagens.length === 0) return { erro: "Informe ao menos uma mensagem (ou desative a barra)." };
  if (mensagens.length > MAX_MENSAGENS) return { erro: `Use no máximo ${MAX_MENSAGENS} mensagens.` };
  if (mensagens.some((m) => m.length > MAX_TAMANHO_MENSAGEM)) {
    return { erro: `Cada mensagem pode ter até ${MAX_TAMANHO_MENSAGEM} caracteres.` };
  }
  if (rotulo.length > 40 || ctaTexto.length > 30) return { erro: "Rótulo (até 40) ou texto do botão (até 30) muito longo." };

  // Só caminhos internos ou http(s) — evita javascript: e afins no link da barra.
  if (ctaHref && !/^(\/(?!\/)|https?:\/\/)/.test(ctaHref)) {
    return { erro: "O link deve começar com / (página do site) ou https://." };
  }

  // Tabela sem policies de RLS: a escrita passa pelo service role, depois de checar que é admin.
  const { error } = await createAdminClient()
    .from("promo_bar_settings")
    .update({
      ativo: formData.get("ativo") === "on",
      rotulo,
      mensagens,
      cta_texto: ctaTexto,
      cta_href: ctaHref || "/",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin/barra-topo] falha ao salvar:", error.message);
    return { erro: "Não foi possível salvar a barra do topo." };
  }

  revalidatePath("/", "layout");
  return { sucesso: true };
}
