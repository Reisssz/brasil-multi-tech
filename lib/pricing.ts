/**
 * Regras comerciais globais. As taxas/parcelas do cartão de crédito NÃO
 * entram aqui de propósito: quem processa o cartão é o Mercado Pago
 * (Checkout Pro), e não temos acesso às taxas reais dos emissores para
 * exibir um número confiável no site — mostrar uma simulação nossa correria
 * o risco de prometer um valor diferente do que o Mercado Pago realmente
 * cobra. A seleção de parcelas acontece na tela de pagamento do Mercado
 * Pago, com as opções e juros reais de cada cartão.
 */
export const PRICING_RULES = {
  pixDiscountPercent: 0,
};

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function getPixPriceCents(
  priceCents: number,
  discountPercent: number = PRICING_RULES.pixDiscountPercent
): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
