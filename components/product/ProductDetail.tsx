"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/lib/types";
import { ProductIconKey } from "../ui/ProductImage";
import { ProductGallery } from "./ProductGallery";
import { StarRating } from "../ui/StarRating";
import { Badge } from "../ui/Badge";
import { PriceBlock } from "../ui/PriceBlock";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/lib/cart-context";
import { formatBRL } from "@/lib/pricing";
import { CONDITION_LABELS, isSeminovo, sortByCondition } from "@/lib/conditions";
import { ShippingEstimator } from "./ShippingEstimator";

export function ProductDetail({
  product,
  related,
  comboSlot,
  initialVariantId,
}: {
  product: Product;
  related: Product[];
  comboSlot?: React.ReactNode;
  initialVariantId?: string;
}) {
  // Se o cliente veio de um card que anunciava um preço específico (ex: o
  // preço "a partir de" mostrado é sempre o da variante mais barata —
  // normalmente outlet), a página de produto tem que abrir já mostrando
  // ESSA variante selecionada. Sem isso, ela caía sempre em variants[0],
  // que normalmente é "excelente" — mais caro que o preço anunciado no
  // card, confundindo o cliente.
  const varianteInicial =
    (initialVariantId && product.variants.find((v) => v.id === initialVariantId)) || product.variants[0];

  const [selectedColor, setSelectedColor] = useState(varianteInicial.color);
  const [selectedStorage, setSelectedStorage] = useState<number | undefined>(varianteInicial.storageGb);
  const [selectedCondition, setSelectedCondition] = useState(varianteInicial.condition);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const colors = useMemo(
    () => Array.from(new Map(product.variants.map((v) => [v.color, v.colorHex])).entries()),
    [product]
  );
  const storages = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.storageGb).filter(Boolean))) as number[],
    [product]
  );
  const conditions = useMemo(
    () => sortByCondition(Array.from(new Set(product.variants.map((v) => v.condition)))),
    [product]
  );

  function variantForCondition(condition: (typeof conditions)[number]) {
    return product.variants.find((v) => v.color === selectedColor && v.condition === condition);
  }

  const activeVariant: ProductVariant =
    product.variants.find(
      (v) =>
        v.color === selectedColor &&
        (v.storageGb ?? undefined) === selectedStorage &&
        v.condition === selectedCondition
    ) ?? product.variants[0];

  function pickColor(color: string) {
    setSelectedColor(color);
    const match = product.variants.find((v) => v.color === color);
    if (match) {
      setSelectedStorage(match.storageGb);
      setSelectedCondition(match.condition);
    }
  }

  function handleAddToCart() {
    addItem(product.id, activeVariant.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(product.id, activeVariant.id, quantity);
    router.push("/carrinho");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-28 lg:pb-8">
      <div className="grid lg:grid-cols-2 gap-10">
        <ProductGallery
          images={activeVariant.images as ProductIconKey[]}
          photos={activeVariant.photos}
          accent={activeVariant.colorHex}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">{product.brand}</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
            <p className="text-sm text-muted">{product.tagline}</p>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </div>

          <div className="flex flex-wrap gap-2">
            {isSeminovo(activeVariant.condition) && (
              <Badge tone="neutral">{CONDITION_LABELS[activeVariant.condition]} · revisado</Badge>
            )}
            <Badge tone="success">Garantia {product.warrantyMonths} meses</Badge>
            {product.freeShipping && <Badge tone="brand">Frete grátis</Badge>}
          </div>

          <PriceBlock
            priceCents={activeVariant.priceCents}
            size="lg"
            parcelamentoHabilitado={product.parcelamentoHabilitado}
            planoParcelamento={product.planoParcelamento}
            pixDescontoPercent={product.pixDescontoPercent}
          />

          {colors.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Cor: <span className="text-muted font-normal">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {colors.map(([color, hex]) => (
                  <button
                    key={color}
                    onClick={() => pickColor(color)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-brand scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={color}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {storages.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Armazenamento</span>
              <div className="flex gap-2 flex-wrap">
                {storages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStorage(s)}
                    className={`rounded-lg border px-3.5 h-9 text-sm font-medium transition-colors ${
                      selectedStorage === s
                        ? "border-brand text-brand bg-brand-light"
                        : "border-border text-foreground hover:border-muted"
                    }`}
                  >
                    {s}GB
                  </button>
                ))}
              </div>
            </div>
          )}

          {conditions.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Condição: <span className="text-muted font-normal">{CONDITION_LABELS[selectedCondition]}</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {conditions.map((c) => {
                  const variant = variantForCondition(c);
                  const unavailable = !variant;
                  const outOfStock = !!variant && variant.stock === 0;
                  const disabled = unavailable || outOfStock;
                  const active = selectedCondition === c && !!variant;
                  return (
                    <button
                      key={c}
                      onClick={() => variant && !outOfStock && setSelectedCondition(c)}
                      disabled={disabled}
                      title={unavailable ? `Indisponível na cor ${selectedColor}` : undefined}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-center transition-colors ${
                        disabled
                          ? "border-border text-muted/50 cursor-not-allowed"
                          : active
                          ? "border-brand text-brand bg-brand-light"
                          : "border-border text-foreground hover:border-muted"
                      }`}
                    >
                      <span className="text-sm font-semibold">{CONDITION_LABELS[c]}</span>
                      <span className="text-xs tabular-nums">
                        {unavailable ? "—" : outOfStock ? "Esgotado" : formatBRL(variant.priceCents)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <span className="text-xs text-muted">
            {activeVariant.stock > 5
              ? "Em estoque"
              : activeVariant.stock > 0
              ? `Últimas ${activeVariant.stock} unidades`
              : "Fora de estoque"}
          </span>

          <ShippingEstimator items={[{ productId: product.id, variantId: activeVariant.id, quantity }]} />

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg h-11">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-full text-lg text-muted hover:text-foreground"
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeVariant.stock, q + 1))}
                className="w-9 h-full text-lg text-muted hover:text-foreground"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={activeVariant.stock === 0}
              className="hidden sm:flex flex-1 items-center justify-center rounded-lg bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 text-sm transition-colors disabled:opacity-40"
            >
              Comprar agora
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={activeVariant.stock === 0}
            className="hidden sm:flex items-center justify-center rounded-lg border-2 border-brand text-brand hover:bg-brand-light font-semibold h-11 text-sm transition-colors disabled:opacity-40"
          >
            {added ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}
          </button>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-sm font-semibold text-foreground">Destaques</span>
            <ul className="flex flex-col gap-1.5">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 text-success shrink-0">
                    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {comboSlot}

      <div className="grid lg:grid-cols-2 gap-10 mt-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">Descrição</h2>
          <p className="text-sm text-muted leading-relaxed">{product.description}</p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground">Avaliações ({product.reviewCount})</h2>
          <div className="flex flex-col gap-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{r.author}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-foreground mb-5">Produtos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-surface border-t border-border p-3 flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-bold tabular-nums text-foreground">
            {formatBRL(activeVariant.priceCents)}
          </span>
          <span className="text-[11px] text-muted">à vista</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={activeVariant.stock === 0}
          className="flex-1 flex items-center justify-center rounded-full bg-brand text-brand-foreground font-semibold h-11 text-sm disabled:opacity-40"
        >
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );
}
