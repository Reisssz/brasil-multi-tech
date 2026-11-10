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

/** URL assinada para o navegador enviar a arte da barra direto ao Storage (sem passar o arquivo pela Server Action). */
export async function criarUrlUploadBarraTopo(nomeArquivo: string): Promise<{ path?: string; token?: string; erro?: string }> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const extensao = nomeArquivo.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "webp";
  const caminho = `barra-topo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const { data, error } = await createAdminClient().storage.from("banners").createSignedUploadUrl(caminho);
  if (error || !data) {
    console.error("[admin/barra-topo] falha ao gerar URL de upload:", error?.message);
    return { erro: 'Não foi possível preparar o upload. Confira se o bucket "banners" existe no Storage.' };
  }

  return { path: data.path, token: data.token };
}

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

  const imagemUrl = String(formData.get("imagemUrl") ?? "").trim() || null;
  const imagemLargura = Number(formData.get("imagemLargura") ?? 0) || null;
  const imagemAltura = Number(formData.get("imagemAltura") ?? 0) || null;

  // Cores só são gravadas com "personalizar" ligado; sempre #rrggbb para não permitir CSS arbitrário.
  const personalizar = formData.get("personalizar") === "on";
  const lerCor = (campo: string) => {
    const valor = String(formData.get(campo) ?? "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(valor) ? valor : null;
  };
  const cores = {
    cor_fundo: personalizar ? lerCor("corFundo") : null,
    cor_texto: personalizar ? lerCor("corTexto") : null,
    cor_destaque: personalizar ? lerCor("corDestaque") : null,
    cor_botao: personalizar ? lerCor("corBotao") : null,
    cor_texto_botao: personalizar ? lerCor("corTextoBotao") : null,
  };
  if (personalizar && Object.values(cores).some((c) => c === null)) {
    return { erro: "Escolha todas as cores da barra." };
  }

  if (imagemUrl) {
    const prefixoPermitido = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banners/barra-topo/`;
    if (!imagemUrl.startsWith(prefixoPermitido) || !imagemLargura || !imagemAltura) {
      return { erro: "Imagem inválida. Envie o arquivo novamente." };
    }
  }

  if (mensagens.length === 0 && !imagemUrl) return { erro: "Informe ao menos uma mensagem ou envie uma imagem (ou desative a barra)." };
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
      imagem_url: imagemUrl,
      imagem_largura: imagemUrl ? imagemLargura : null,
      imagem_altura: imagemUrl ? imagemAltura : null,
      ...cores,
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
