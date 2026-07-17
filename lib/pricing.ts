import { InstallmentOption } from "./types";

/** Global commercial rules — in production these come from the admin panel / pricing service. */
export const PRICING_RULES = {
  pixDiscountPercent: 8,
  maxInstallments: 18,
  interestFreeUpTo: 10,
  monthlyInterestRate: 0.0199,
  minInstallmentCents: 5000,
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

/**
 * Price-based (not future-value) amortization: for interest-bearing terms, the
 * monthly installment is priceCents split with compound interest applied to the
 * outstanding balance, which is the standard "Tabela Price" used by BR retailers.
 */
export function calculateInstallment(
  priceCents: number,
  installments: number,
  interestFreeUpTo: number = PRICING_RULES.interestFreeUpTo,
  monthlyInterestRate: number = PRICING_RULES.monthlyInterestRate
): { installmentCents: number; totalCents: number; interestFree: boolean } {
  if (installments <= interestFreeUpTo) {
    const installmentCents = Math.round(priceCents / installments);
    return { installmentCents, totalCents: installmentCents * installments, interestFree: true };
  }

  const i = monthlyInterestRate;
  const factor = i / (1 - Math.pow(1 + i, -installments));
  const installmentCents = Math.round(priceCents * factor);
  return { installmentCents, totalCents: installmentCents * installments, interestFree: false };
}

export function getInstallmentOptions(
  priceCents: number,
  maxInstallments: number = PRICING_RULES.maxInstallments,
  interestFreeUpTo: number = PRICING_RULES.interestFreeUpTo,
  minInstallmentCents: number = PRICING_RULES.minInstallmentCents
): InstallmentOption[] {
  const options: InstallmentOption[] = [];
  for (let n = 1; n <= maxInstallments; n++) {
    const { installmentCents, totalCents, interestFree } = calculateInstallment(
      priceCents,
      n,
      interestFreeUpTo
    );
    if (n > 1 && installmentCents < minInstallmentCents) break;
    options.push({
      count: n,
      label: interestFree ? `${n}x sem juros` : `${n}x com juros`,
      interestFree,
      installmentCents,
      totalCents,
    });
  }
  return options;
}

export function getBestInstallmentHeadline(priceCents: number): InstallmentOption {
  const options = getInstallmentOptions(priceCents);
  return options[options.length - 1];
}
