import Link from "next/link";
import { Product } from "@/lib/types";
import { getMainPhoto, getMinPriceCents } from "@/lib/data/products";
import { formatBRL, getInstallmentOptions, getPixPriceCents } from "@/lib/pricing";
import { CONDITION_LABELS, isSeminovo } from "@/lib/conditions";
import { ProductImage, ProductIconKey } from "../ui/ProductImage";
import { StarRating } from "../ui/StarRating";
import { Badge } from "../ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  // Feature the variant that matches the advertised "a partir de" price, so the
  // condition badge and the price shown never contradict each other.
  const mainVariant = product.variants.reduce((min, v) => (v.priceCents < min.priceCents ? v : min), product.variants[0]);
  const priceCents = getMinPriceCents(product);
  const pixPrice = getPixPriceCents(priceCents);
  const hasDiscount = product.variants.some((v) => v.compareAtCents && v.compareAtCents > v.priceCents);
  const discountPercent = hasDiscount
    ? Math.round(
        (1 -
          Math.min(...product.variants.map((v) => v.priceCents)) /
            Math.max(...product.variants.map((v) => v.compareAtCents ?? v.priceCents))) *
          100
      )
    : 0;

  const options = getInstallmentOptions(priceCents);
  const interestFreeOption = [...options].reverse().find((o) => o.interestFree) ?? options[0];
  const maxOption = options[options.length - 1];

  return (
    <Link
      href={`/produto/${product.slug}?variante=${mainVariant.id}`}
      className="group flex flex-col rounded-2xl bg-surface border border-border hover:border-brand/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
    >
      <div className="relative">
        <ProductImage
          icon={mainVariant.images[0] as ProductIconKey}
          photoSrc={getMainPhoto(mainVariant)}
          tint="brand"
          className="aspect-square w-full"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && <Badge tone="brand">-{discountPercent}% OFF</Badge>}
          {isSeminovo(mainVariant.condition) && <Badge tone="neutral">{CONDITION_LABELS[mainVariant.condition]}</Badge>}
        </div>
        {product.freeShipping && (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge tone="success">Frete grátis</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{product.brand}</span>
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-1.5 flex flex-col gap-0.5">
          {hasDiscount && mainVariant.compareAtCents && (
            <span className="text-xs text-muted line-through tabular-nums">{formatBRL(mainVariant.compareAtCents)}</span>
          )}
          <span className="text-[11px] text-muted">A partir de</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">{formatBRL(pixPrice)}</span>
            <span className="text-[11px] font-semibold text-success">no pix</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted tabular-nums">
          <svg width="14" height="14" viewBox="0 0 20 14" fill="none" className="shrink-0 text-muted">
            <rect x="1" y="1" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="4" width="18" height="2.4" fill="currentColor" />
          </svg>
          <span>
            Até {interestFreeOption.count}x de {formatBRL(interestFreeOption.installmentCents)} s/ juros
            {maxOption.count > interestFreeOption.count && (
              <> ou {maxOption.count}x de {formatBRL(maxOption.installmentCents)} c/ juros</>
            )}
          </span>
        </div>

        <span className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand text-brand-foreground font-bold text-sm h-10 group-hover:bg-brand-dark transition-colors">
          COMPRAR
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}