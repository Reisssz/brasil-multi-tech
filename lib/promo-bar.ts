export type ConfiguracaoBarraTopo = {
  ativo: boolean;
  rotulo: string;
  /** Aceita {parcelas}, trocado pelo máximo de parcelas sem juros configurado em /admin/configuracoes. */
  mensagens: string[];
  ctaTexto: string;
  ctaHref: string;
  /** Arte de campanha; quando definida, substitui rótulo/mensagens/botão e a barra inteira vira link para `ctaHref`. */
  imagemUrl: string | null;
  imagemLargura: number | null;
  imagemAltura: number | null;
};

export const CONFIGURACAO_BARRA_TOPO_PADRAO: ConfiguracaoBarraTopo = {
  ativo: true,
  rotulo: "5 ANOS BRASIL MULTI TECH",
  mensagens: [
    "Comemore com a gente: ofertas especiais em todo o site",
    "8% de desconto à vista no Pix em todos os produtos",
    "Frete grátis nas compras acima de R$ 1.300",
    "Parcele em até {parcelas}x sem juros no cartão de crédito",
  ],
  ctaTexto: "APROVEITE AGORA",
  ctaHref: "/categoria/ofertas",
  imagemUrl: null,
  imagemLargura: null,
  imagemAltura: null,
};
