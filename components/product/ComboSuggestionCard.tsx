"use client";

import Link from "next/link";
import { ProductImage, ProductIconKey } from "@/components/ui/ProductImage";
import { formatBRL } from "@/lib/pricing";
import { useCart } from "@/lib/cart-context";

export type SugestaoComboView = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  photoUrl: string | null;
  icone: string;
  /** id da variante mais barata em estoque — necessário pra adicionar direto ao carrinho */
  variantId: string;
};

export function ComboSuggestionCard({ sugestao }: { sugestao: SugestaoComboView }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden">
      <Link href={`/produto/${sugestao.slug}`}>
        <ProductImage
          icon={sugestao.icone as ProductIconKey}
          photoSrc={sugestao.photoUrl ?? undefined}
          tint="brand"
          className="aspect-square w-full"
        />
      </Link>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-[11px] text-muted uppercase">{sugestao.brand}</span>
        <Link href={`/produto/${sugestao.slug}`} className="text-xs font-semibold text-foreground line-clamp-2 min-h-[2em]">
          {sugestao.name}
        </Link>
        <span className="text-sm font-bold text-foreground tabular-nums">{formatBRL(sugestao.priceCents)}</span>
        <button
          onClick={() => addItem(sugestao.id, sugestao.variantId, 1)}
          className="mt-1 inline-flex items-center justify-center rounded-lg border border-brand text-brand hover:bg-brand-light font-semibold h-8 text-xs transition-colors"
        >
          + Adicionar ao combo
        </button>
      </div>
    </div>
  );
}
