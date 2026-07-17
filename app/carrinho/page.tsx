"use client";

import Link from "next/link";
import { useCart, resolveCartLine } from "@/lib/cart-context";
import { formatBRL, getPixPriceCents } from "@/lib/pricing";
import { getMainPhoto } from "@/lib/data/products";
import { ProductImage, ProductIconKey } from "@/components/ui/ProductImage";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center flex flex-col items-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-muted">
          <path
            d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="21" r="1.4" fill="currentColor" />
          <circle cx="18" cy="21" r="1.4" fill="currentColor" />
        </svg>
        <h1 className="text-xl font-bold text-foreground">Seu carrinho está vazio</h1>
        <p className="text-sm text-muted">Explore nossas ofertas e encontre o produto ideal para você.</p>
        <Link
          href="/categoria/ofertas"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors"
        >
          Ver ofertas
        </Link>
      </div>
    );
  }

  const pixTotal = getPixPriceCents(totalCents);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Meu carrinho</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const { product, variant } = resolveCartLine(item);
            if (!product || !variant) return null;
            return (
              <div key={item.variantId} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
                <ProductImage
                  icon={variant.images[0] as ProductIconKey}
                  photoSrc={getMainPhoto(variant)}
                  accent={variant.colorHex}
                  className="w-20 h-20 rounded-xl shrink-0"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-muted uppercase">{product.brand}</span>
                      <h2 className="text-sm font-semibold text-foreground">{product.name}</h2>
                      <span className="text-xs text-muted">
                        {variant.color}
                        {variant.storageGb ? ` · ${variant.storageGb}GB` : ""} ·{" "}
                        <span className="capitalize">{variant.condition}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-muted hover:text-red-600 shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-border rounded-lg h-9">
                      <button
                        onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-full text-muted hover:text-foreground"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        className="w-8 h-full text-muted hover:text-foreground"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {formatBRL(variant.priceCents * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 h-fit">
          <h2 className="text-sm font-semibold text-foreground">Resumo do pedido</h2>
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBRL(totalCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-success font-medium">
            <span>Desconto no Pix</span>
            <span className="tabular-nums">-{formatBRL(totalCents - pixTotal)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total no Pix</span>
            <span className="tabular-nums">{formatBRL(pixTotal)}</span>
          </div>
          <span className="text-xs text-muted">ou {formatBRL(totalCents)} parcelado no cartão</span>
          <Link
            href="/checkout"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 text-sm transition-colors"
          >
            Ir para o checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
