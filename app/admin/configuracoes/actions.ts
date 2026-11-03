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

export type EstadoConfiguracaoParcelamento = { erro?: string; sucesso?: boolean } | null;

const MAX_PARCELAS_PERMITIDO = 24;

export async function atualizarConfiguracaoParcelamento(
  _estadoAnterior: EstadoConfiguracaoParcelamento,
  formData: FormData
): Promise<EstadoConfiguracaoParcelamento> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const maxParcelasSemJuros = Number(formData.get("maxParcelasSemJuros") ?? 0);
  const maxParcelasComJuros = Number(formData.get("maxParcelasComJuros") ?? 0);

  if (!Number.isInteger(maxParcelasSemJuros) || maxParcelasSemJuros < 1 || maxParcelasSemJuros > MAX_PARCELAS_PERMITIDO) {
    return { erro: `Informe um número válido de parcelas sem juros (1 a ${MAX_PARCELAS_PERMITIDO}).` };
  }
  if (
    !Number.isInteger(maxParcelasComJuros) ||
    maxParcelasComJuros < maxParcelasSemJuros ||
    maxParcelasComJuros > MAX_PARCELAS_PERMITIDO
  ) {
    return {
      erro: `O máximo com juros precisa ser maior ou igual ao sem juros (até ${MAX_PARCELAS_PERMITIDO}).`,
    };
  }

  const jurosCompradorPercent: Record<number, number> = {};
  for (let n = maxParcelasSemJuros + 1; n <= maxParcelasComJuros; n++) {
    const valor = Number(formData.get(`juros_${n}`) ?? NaN);
    if (!Number.isFinite(valor) || valor < 0) {
      return { erro: `Informe um percentual de juros válido para ${n}x.` };
    }
    jurosCompradorPercent[n] = valor;
  }

  const { error } = await supabase
    .from("pricing_settings")
    .update({
      max_parcelas_sem_juros: maxParcelasSemJuros,
      max_parcelas_com_juros: maxParcelasComJuros,
      juros_comprador_percent: jurosCompradorPercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[admin/configuracoes] falha ao salvar configuração de parcelamento:", error.message);
    return { erro: "Não foi possível salvar a configuração." };
  }

  // "layout" invalida o root layout (que busca essa config) e todas as rotas sob ele.
  revalidatePath("/", "layout");
  return { sucesso: true };
}
