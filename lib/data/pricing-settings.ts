import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIGURACAO_PARCELAMENTO_PADRAO, ConfiguracaoParcelamento } from "@/lib/pricing";

/**
 * Lê a configuração de parcelamento editável pelo admin (tabela
 * `pricing_settings`, linha única id=1). `cache()` evita repetir a consulta
 * pra cada componente que precisa do valor dentro do mesmo request.
 */
export const getConfiguracaoParcelamento = cache(async (): Promise<ConfiguracaoParcelamento> => {
  // Admin client: a tabela não tem policy de leitura pública, e o dado não é sensível.
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pricing_settings")
    .select("max_parcelas_sem_juros, max_parcelas_com_juros, juros_comprador_percent")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("[pricing-settings] falha ao buscar configuração, usando padrão:", error?.message);
    return CONFIGURACAO_PARCELAMENTO_PADRAO;
  }

  return {
    maxParcelasSemJuros: data.max_parcelas_sem_juros,
    maxParcelasComJuros: data.max_parcelas_com_juros,
    jurosCompradorPercent: (data.juros_comprador_percent ?? {}) as Record<number, number>,
  };
});
