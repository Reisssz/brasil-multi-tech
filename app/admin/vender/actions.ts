"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  await supabase.from("trade_in_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", solicitacaoId);
  revalidatePath("/admin/vender");
}
