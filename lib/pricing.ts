export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * A loja opera no modelo "Parcelado Vendedor" do Mercado Pago: o cliente
 * NUNCA paga juros ao escolher mais parcelas — o total é sempre o mesmo,
 * dividido em N vezes. Quem absorve o custo crescente por faixa de parcela
 * é a loja (ver as taxas reais em /admin/configuracoes, mp_taxa_*). Por
 * isso esse tipo só precisa do limite de parcelas — não existe "taxa de
 * juros do cliente" pra modelar.
 */
export type PlanoParcelamento = {
  maxInstallments: number;
};

export type OpcaoParcelamento = {
  count: number;
  installmentCents: number;
  totalCents: number;
  interestFree: boolean;
};

export function calcularParcelamento(priceCents: number, plano: PlanoParcelamento): OpcaoParcelamento[] {
  const opcoes: OpcaoParcelamento[] = [];

  for (let n = 1; n <= plano.maxInstallments; n++) {
    const installmentCents = Math.round(priceCents / n);
    opcoes.push({ count: n, installmentCents, totalCents: installmentCents * n, interestFree: true });
  }

  return opcoes;
}

/** A maior parcela oferecida (todas são sem juros nesse modelo). */
export function melhorParcelaSemJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return opcoes[opcoes.length - 1];
}

/** Só usado quando o produto tem pixDescontoPercent configurado (opt-in, por produto). */
export function getPixPriceCents(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
