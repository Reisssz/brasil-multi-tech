export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export type OpcaoParcelamento = {
  count: number;
  installmentCents: number;
  totalCents: number;
  interestFree: boolean;
};

/**
 * Regras de parcelamento do Checkout Pro (Mercado Pago) da loja. Editáveis
 * pelo admin em /admin/configuracoes (tabela `pricing_settings`, ver
 * lib/data/pricing-settings.ts) — os valores abaixo são só o fallback usado
 * quando a configuração não pôde ser lida do banco.
 *
 * De 1x até maxParcelasSemJuros ("Parcelado Vendedor"): o cliente paga
 * sempre o valor cheio, dividido em N vezes — quem absorve a taxa crescente
 * é a loja (não precisamos saber o percentual exato, o Mercado Pago cobra
 * isso da loja direto, sem repassar pro cliente).
 * De maxParcelasSemJuros + 1 até maxParcelasComJuros ("Parcelado Emissor"):
 * a loja recebe como se fosse à vista e quem paga os juros da parcela extra
 * é o comprador — o Mercado Pago/bandeira cobra e calcula isso
 * automaticamente na tela de pagamento; os valores em jurosCompradorPercent
 * são só pra mostrar uma prévia fiel ao cliente ANTES de ele ser
 * redirecionado pro Mercado Pago.
 */
export type ConfiguracaoParcelamento = {
  maxParcelasSemJuros: number;
  maxParcelasComJuros: number;
  jurosCompradorPercent: Record<number, number>;
};

export const CONFIGURACAO_PARCELAMENTO_PADRAO: ConfiguracaoParcelamento = {
  maxParcelasSemJuros: 10,
  maxParcelasComJuros: 12,
  jurosCompradorPercent: { 11: 20.66, 12: 22.11 },
};

/** Todas as opções de parcelamento (sem juros + com juros) pro valor informado, na ordem de 1x até o máximo. */
export function calcularParcelamento(
  priceCents: number,
  config: ConfiguracaoParcelamento = CONFIGURACAO_PARCELAMENTO_PADRAO
): OpcaoParcelamento[] {
  const opcoes: OpcaoParcelamento[] = [];

  for (let n = 1; n <= config.maxParcelasSemJuros; n++) {
    const installmentCents = Math.round(priceCents / n);
    opcoes.push({ count: n, installmentCents, totalCents: installmentCents * n, interestFree: true });
  }

  for (let n = config.maxParcelasSemJuros + 1; n <= config.maxParcelasComJuros; n++) {
    const juros = config.jurosCompradorPercent[n] ?? 0;
    const totalCents = Math.round(priceCents * (1 + juros / 100));
    const installmentCents = Math.round(totalCents / n);
    opcoes.push({ count: n, installmentCents, totalCents, interestFree: false });
  }

  return opcoes;
}

/** Maior parcelamento sem juros — o que aparece em destaque nos cards de produto. */
export function melhorParcelaSemJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => o.interestFree);
}

/** Maior parcelamento com juros do comprador. */
export function melhorParcelaComJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => !o.interestFree);
}

/** Só usado quando o produto tem pixDescontoPercent configurado (opt-in, por produto). */
export function getPixPriceCents(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
