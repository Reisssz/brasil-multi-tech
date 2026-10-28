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
 * Regras de parcelamento do Checkout Pro (Mercado Pago) da loja — atualize
 * as duas constantes abaixo sempre que a condição mudar por lá (Seu negócio
 * → Taxas e parcelamento). São as únicas fontes da verdade pro cálculo de
 * parcelamento do site inteiro.
 *
 * De 1x a MAX_PARCELAS_SEM_JUROS ("Parcelado Vendedor"): o cliente paga
 * sempre o valor cheio, dividido em N vezes — quem absorve a taxa crescente
 * é a loja (não precisamos saber o percentual exato, o Mercado Pago cobra
 * isso da loja direto, sem repassar pro cliente).
 * De MAX_PARCELAS_SEM_JUROS + 1 até MAX_PARCELAS_COM_JUROS ("Parcelado
 * Emissor"): a loja recebe como se fosse à vista e quem paga os juros da
 * parcela extra é o comprador — o Mercado Pago/bandeira cobra e calcula
 * isso automaticamente na tela de pagamento; os valores abaixo são só pra
 * mostrar uma prévia fiel ao cliente ANTES de ele ser redirecionado pro
 * Mercado Pago.
 */
export const MAX_PARCELAS_SEM_JUROS = 10;
export const MAX_PARCELAS_COM_JUROS = 12;

const JUROS_COMPRADOR_PERCENT: Record<number, number> = {
  11: 20.66,
  12: 22.11,
};

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

/** Maior parcelamento sem juros (hoje, 10x) — o que aparece em destaque nos cards de produto. */
export function melhorParcelaSemJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => o.interestFree);
}

/** Maior parcelamento com juros do comprador (hoje, 12x). */
export function melhorParcelaComJuros(opcoes: OpcaoParcelamento[]): OpcaoParcelamento | undefined {
  return [...opcoes].reverse().find((o) => !o.interestFree);
}

/** Só usado quando o produto tem pixDescontoPercent configurado (opt-in, por produto). */
export function getPixPriceCents(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
