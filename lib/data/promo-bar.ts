import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIGURACAO_BARRA_TOPO_PADRAO, ConfiguracaoBarraTopo } from "@/lib/promo-bar";

/** Barra promocional do topo editável pelo admin (tabela `promo_bar_settings`, linha única id=1). */
export const getConfiguracaoBarraTopo = cache(async (): Promise<ConfiguracaoBarraTopo> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_bar_settings")
    .select("ativo, rotulo, mensagens, cta_texto, cta_href")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("[promo-bar] falha ao buscar configuração, usando padrão:", error?.message);
    return CONFIGURACAO_BARRA_TOPO_PADRAO;
  }

  return {
    ativo: data.ativo,
    rotulo: data.rotulo,
    mensagens: Array.isArray(data.mensagens) ? (data.mensagens as unknown[]).filter((m): m is string => typeof m === "string") : [],
    ctaTexto: data.cta_texto,
    ctaHref: data.cta_href,
  };
});
