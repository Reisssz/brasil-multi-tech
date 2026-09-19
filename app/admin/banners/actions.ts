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

export type EstadoBanner = { erro?: string } | null;

/**
 * Lê/grava sempre com o client admin (service role) — a tabela
 * banners_principais é nova neste projeto e ainda não tem policy de RLS
 * própria configurada no Supabase; o controle de acesso aqui é 100% feito
 * em código (verificarAdmin, chamado em toda ação abaixo), igual ao padrão
 * já usado em app/admin/vender/actions.ts para o bucket de documentos.
 */
export async function adicionarBannerPrincipal(_estadoAnterior: EstadoBanner, formData: FormData): Promise<EstadoBanner> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const imagemDesktopUrl = String(formData.get("imagemDesktopUrl") ?? "").trim();
  if (!imagemDesktopUrl) return { erro: "Envie a imagem principal (desktop) antes de salvar." };

  const href = String(formData.get("href") ?? "").trim() || null;
  const largura = Number(formData.get("imagemDesktopLargura") ?? 0) || null;
  const altura = Number(formData.get("imagemDesktopAltura") ?? 0) || null;
  const imagemMobileUrl = String(formData.get("imagemMobileUrl") ?? "").trim() || null;
  const larguraMobile = Number(formData.get("imagemMobileLargura") ?? 0) || null;
  const alturaMobile = Number(formData.get("imagemMobileAltura") ?? 0) || null;

  const supabaseAdmin = createAdminClient();
  const { data: maiorPosicao } = await supabaseAdmin
    .from("banners_principais")
    .select("posicao")
    .order("posicao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("banners_principais").insert({
    posicao: (maiorPosicao?.posicao ?? 0) + 1,
    ativo: true,
    href,
    imagem_desktop_url: imagemDesktopUrl,
    imagem_desktop_largura: largura,
    imagem_desktop_altura: altura,
    imagem_mobile_url: imagemMobileUrl,
    imagem_mobile_largura: larguraMobile,
    imagem_mobile_altura: alturaMobile,
  });

  if (error) {
    console.error("[admin/banners] falha ao salvar banner:", error.message);
    return { erro: "Não foi possível salvar o banner. Confira se a tabela banners_principais já foi criada no Supabase." };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return null;
}

export async function removerBannerPrincipal(id: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("banners_principais").delete().eq("id", id);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function alternarAtivoBannerPrincipal(id: string, ativo: boolean) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("banners_principais").update({ ativo: !ativo }).eq("id", id);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

/** Troca a posição do banner com o vizinho imediatamente anterior/seguinte (reordenar por setas ↑/↓). */
export async function moverBannerPrincipal(id: string, direcao: "up" | "down") {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  const supabaseAdmin = createAdminClient();
  const { data: banners } = await supabaseAdmin.from("banners_principais").select("id, posicao").order("posicao", { ascending: true });
  if (!banners) return;

  const indice = banners.findIndex((b) => b.id === id);
  const indiceVizinho = direcao === "up" ? indice - 1 : indice + 1;
  if (indice === -1 || indiceVizinho < 0 || indiceVizinho >= banners.length) return;

  const atual = banners[indice];
  const vizinho = banners[indiceVizinho];

  await Promise.all([
    supabaseAdmin.from("banners_principais").update({ posicao: vizinho.posicao }).eq("id", atual.id),
    supabaseAdmin.from("banners_principais").update({ posicao: atual.posicao }).eq("id", vizinho.id),
  ]);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}
