import { formatBRL, getPixPriceCents, PRICING_RULES } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  compareAtCents,
  size = "md",
}: {
  priceCents: number;
  compareAtCents?: number;
  size?: "sm" | "md" | "lg";
}) {
  const pixPrice = getPixPriceCents(priceCents);
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col gap-0.5">
      {compareAtCents && compareAtCents > priceCents && (
        <span className="text-sm text-muted line-through tabular-nums">{formatBRL(compareAtCents)}</span>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-display ${priceTextSize} font-bold tabular-nums text-foreground`}>
          {formatBRL(pixPrice)}
        </span>
        {PRICING_RULES.pixDiscountPercent > 0 && (
          <span className="inline-flex items-center rounded-full bg-success-light text-success text-xs font-semibold px-2 py-0.5">
            {PRICING_RULES.pixDiscountPercent}% no Pix
          </span>
        )}
      </div>
      {/* Parcelamento no cartão não é exibido aqui: quem processa é o
          Mercado Pago, e as opções/juros reais só aparecem na tela de
          pagamento dele — um número calculado por nós poderia não bater
          com o que o cliente realmente vê lá. */}
      <span className="text-xs text-muted">ou parcele no cartão de crédito</span>
    </div>
  );
}
