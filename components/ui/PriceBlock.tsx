import { formatBRL, getBestInstallmentHeadline, getPixPriceCents, PRICING_RULES } from "@/lib/pricing";

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
  const installment = getBestInstallmentHeadline(priceCents);
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col gap-0.5">
      {compareAtCents && compareAtCents > priceCents && (
        <span className="text-sm text-muted line-through tabular-nums">{formatBRL(compareAtCents)}</span>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`${priceTextSize} font-extrabold tabular-nums text-foreground`}>
          {formatBRL(pixPrice)}
        </span>
        <span className="inline-flex items-center rounded-full bg-success-light text-success text-xs font-semibold px-2 py-0.5">
          {PRICING_RULES.pixDiscountPercent}% no Pix
        </span>
      </div>
      <span className="text-xs text-muted tabular-nums">
        ou {formatBRL(priceCents)} em até {installment.count}x de {formatBRL(installment.installmentCents)}
        {installment.interestFree ? " sem juros" : ""}
      </span>
    </div>
  );
}
