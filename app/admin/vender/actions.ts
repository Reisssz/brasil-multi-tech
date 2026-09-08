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

/**
 * O fluxo de venda (escolha da modalidade, assinatura do contrato, forma de
 * recebimento) é 100% automático — o cliente conduz tudo sozinho em
 * /vender/formulario (ver VenderWizard.tsx). A única ação manual que sobra
 * pro admin é marcar como "Concluído" depois de efetivamente enviar o
 * pagamento (Pix/transferência), já que não há integração de pagamento de
 * saída — isso continua sendo feito fora do sistema, no banco.
 */
export async function atualizarStatusVenda(solicitacaoId: string, status: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;
  await supabase.from("trade_in_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", solicitacaoId);
  revalidatePath("/admin/vender");
}

/**
 * O documento de identidade fica num bucket privado (documentos-venda) —
 * essa URL assinada é gerada sob demanda (só quando o admin clica em "Ver
 * documento"), expira em 5 minutos, e nunca fica pré-gerada pra
 * solicitações que ninguém abriu.
 */
export async function gerarUrlDocumento(solicitacaoId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { error: "Acesso negado." };

  const supabaseAdmin = createAdminClient();
  const { data: solicitacao } = await supabaseAdmin
    .from("trade_in_requests")
    .select("documento_selfie_path")
    .eq("id", solicitacaoId)
    .single();

  if (!solicitacao?.documento_selfie_path) {
    return { error: "Nenhum documento enviado para essa solicitação." };
  }

  const { data, error } = await supabaseAdmin.storage
    .from("documentos-venda")
    .createSignedUrl(solicitacao.documento_selfie_path, 300);

  if (error || !data) {
    console.error("[admin/vender] falha ao gerar URL do documento:", error?.message);
    return { error: "Não foi possível abrir o documento agora." };
  }

  return { url: data.signedUrl };
}
