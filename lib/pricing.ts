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
 * Tabela real de taxas do Checkout Pro (Mercado Pago) da loja, pra uma venda
 * com recebimento na hora — copiada de "Seu negócio → Taxas e parcelamento"
 * na conta Mercado Pago da Brasil Multi Tech. Atualize os dois objetos
 * abaixo sempre que a taxa mudar por lá; são as únicas fontes da verdade
 * pro cálculo de parcelamento do site inteiro.
 *
 * De 1x a 6x ("Parcelado Vendedor"): o cliente paga sempre o valor cheio,
 * dividido em N vezes — quem absorve a taxa crescente é a loja.
 * De 7x a 18x ("Parcelado Emissor"): a loja recebe como se fosse à vista
 * (mesma taxa do 1x, 4,98%) e quem paga os juros da parcela extra é o
 * comprador — o Mercado Pago/bandeira cobra e calcula isso automaticamente
 * na tela de pagamento; os valores abaixo são só pra mostrar uma prévia
 * fiel ao cliente ANTES de ele ser redirecionado pro Mercado Pago.
 */
const TAXA_LOJA_SEM_JUROS_PERCENT: Record<number, number> = {
  1: 4.98,
  2: 7.51,
  3: 9.6,
  4: 11.67,
  5: 13.64,
  6: 14.94,
};

const JUROS_COMPRADOR_PERCENT: Record<number, number> = {
  7: 16.72,
  8: 16.73,
  9: 19.69,
  10: 20.65,
  11: 20.66,
  12: 22.11,
  13: 23.04,
  14: 24.45,
  15: 25.83,
  16: 27.2,
  17: 28.58,
  18: 29.99,
};

export const MAX_PARCELAS_SEM_JUROS = Math.max(...Object.keys(TAXA_LOJA_SEM_JUROS_PERCENT).map(Number));
export const MAX_PARCELAS_COM_JUROS = Math.max(...Object.keys(JUROS_COMPRADOR_PERCENT).map(Number));

/** Todas as opções de parcelamento (sem juros + com juros) pro valor informado, na ordem de 1x até o máximo. */
export function calcularParcelamento(priceCents: number): OpcaoParcelamento[] {
  const opcoes: OpcaoParcelamento[] = [];

  for (let n = 1; n <= MAX_PARCELAS_SEM_JUROS; n++) {
    const installmentCents = Math.round(priceCents / n);
    opcoes.push({ count: n, installmentCents, totalCents: installmentCents * n, interestFree: true });
  }

  for (let n = MAX_PARCELAS_SEM_JUROS + 1; n <= MAX_PARCELAS_COM_JUROS; n++) {
    const juros = JUROS_COMPRADOR_PERCENT[n];
    const totalCents = Math.round(priceCents * (1 + juros / 100));
    const installmentCents = Math.round(totalCents / n);
    opcoes.push({ count: n, installmentCents, totalCents, interestFree: false });
  }

  return opcoes;
}

/** Maior parcelamento sem juros (hoje, 6x) — o que aparece em destaque nos cards de produto. */
export function melhorParcelaSemJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => o.interestFree);
}

/** Maior parcelamento com juros do comprador (hoje, 18x). */
export function melhorParcelaComJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => !o.interestFree);
}

/** Só usado quando o produto tem pixDescontoPercent configurado (opt-in, por produto). */
export function getPixPriceCents(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
