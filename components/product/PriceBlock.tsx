import { formatBRL, getBestInstallmentHeadline } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  compareAtCents,
  size = "md",
}: {
  priceCents: number;
  compareAtCents?: number;
  size?: "sm" | "md" | "lg";
}) {
  const installment = getBestInstallmentHeadline(priceCents);
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col gap-0.5">
      {compareAtCents && compareAtCents > priceCents && (
        <span className="text-sm text-muted line-through tabular-nums">{formatBRL(compareAtCents)}</span>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-display ${priceTextSize} font-bold tabular-nums text-foreground`}>
          {formatBRL(priceCents)}
        </span>
      </div>
      <span className="text-xs text-muted tabular-nums">
        ou em até {installment.count}x de {formatBRL(installment.installmentCents)}
        {installment.interestFree ? " sem juros" : ""}
      </span>
    </div>
  );
}
