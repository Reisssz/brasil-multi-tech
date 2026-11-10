import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIGURACAO_BARRA_TOPO_PADRAO, ConfiguracaoBarraTopo } from "@/lib/promo-bar";

/** Barra promocional do topo editável pelo admin (tabela `promo_bar_settings`, linha única id=1). */
export const getConfiguracaoBarraTopo = cache(async (): Promise<ConfiguracaoBarraTopo> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_bar_settings")
    .select(
      "ativo, rotulo, mensagens, cta_texto, cta_href, imagem_url, imagem_largura, imagem_altura, cor_fundo, cor_texto, cor_destaque, cor_botao, cor_texto_botao"
    )
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
    imagemUrl: data.imagem_url ?? null,
    imagemLargura: data.imagem_largura ?? null,
    imagemAltura: data.imagem_altura ?? null,
    corFundo: data.cor_fundo ?? null,
    corTexto: data.cor_texto ?? null,
    corDestaque: data.cor_destaque ?? null,
    corBotao: data.cor_botao ?? null,
    corTextoBotao: data.cor_texto_botao ?? null,
  };
});
