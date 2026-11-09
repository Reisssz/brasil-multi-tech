import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIGURACAO_FRETE_FIXO_PADRAO, ConfiguracaoFreteFixo } from "@/lib/shipping/frete-fixo";

/** Config de frete fixo editável pelo admin (tabela `shipping_settings`, linha única id=1). */
export const getConfiguracaoFreteFixo = cache(async (): Promise<ConfiguracaoFreteFixo> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("fixed_enabled, fixed_sul_cents, fixed_sudeste_cents, fixed_prazo_dias")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Sem a config, cai no cálculo automático do Melhor Envio (frete fixo desligado).
    console.error("[shipping-settings] falha ao buscar configuração, frete fixo desativado:", error?.message);
    return CONFIGURACAO_FRETE_FIXO_PADRAO;
  }

  return {
    ativo: data.fixed_enabled,
    sulCents: data.fixed_sul_cents,
    sudesteCents: data.fixed_sudeste_cents,
    prazoDias: data.fixed_prazo_dias,
  };
});
