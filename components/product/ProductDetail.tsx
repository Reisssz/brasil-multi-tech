"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductCondition, ProductVariant } from "@/lib/types";
import { ProductIconKey } from "../ui/ProductImage";
import { ProductGallery } from "./ProductGallery";
import { StarRating } from "../ui/StarRating";
import { Badge } from "../ui/Badge";
import { PriceBlock } from "../ui/PriceBlock";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/lib/cart-context";
import { formatBRL } from "@/lib/pricing";
import { CONDITION_DETAILS, CONDITION_LABELS, isSeminovo, sortByCondition } from "@/lib/conditions";
import { ShippingEstimator } from "./ShippingEstimator";

const CATEGORY_LABELS: Record<Product["category"], string> = {
  celulares: "Celulares",
  notebooks: "Notebooks",
  acessorios: "Acessórios",
  fones: "Fones",
  "caixas-de-som": "Caixas de som",
  smartwatches: "Smartwatches",
  carregadores: "Carregadores",
};

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
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 pb-28 lg:pb-8">
      <nav aria-label="Você está aqui" className="flex items-center gap-1.5 text-xs text-muted mb-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/" className="hover:text-brand transition-colors shrink-0">Início</Link>
        <span className="shrink-0">›</span>
        <Link href={`/categoria/${product.category}`} className="hover:text-brand transition-colors shrink-0">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span className="shrink-0">›</span>
        <span className="shrink-0">{product.brand}</span>
        <span className="shrink-0">›</span>
        <span className="text-foreground font-medium shrink-0">{product.name}</span>
      </nav>

      {/* Layout em 3 colunas (foto | seletores | caixa de compra), espelhando
          referência de mercado: a caixa de compra (preço + botões) fica
          colada na foto desde o topo, em vez de empurrada pra baixo de todos
          os seletores — resolve "ver a foto e o botão de comprar sem rolar"
          de forma estrutural, não só encolhendo espaçamentos. */}
      <div className="grid lg:grid-cols-[340px_1fr_320px] gap-8 lg:gap-8">
        <ProductGallery
          images={activeVariant.images as ProductIconKey[]}
          photos={activeVariant.photos}
          accent={activeVariant.colorHex}
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
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
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
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
              <EntenderCondicoes conditions={conditions} selected={selectedCondition} onSelect={setSelectedCondition} />
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
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

        {/* Caixa de compra: fica ao lado da foto desde o carregamento da
            página (sticky no desktop), então preço + botão de comprar já
            aparecem visíveis junto com a foto, sem depender de rolar por
            todos os seletores de cor/capacidade/condição primeiro. */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start bg-surface lg:border lg:border-border rounded-xl lg:p-4">
          <PriceBlock
            priceCents={activeVariant.priceCents}
            compareAtCents={activeVariant.compareAtCents}
            size="lg"
            parcelamentoHabilitado={product.parcelamentoHabilitado}
            pixDescontoPercent={product.pixDescontoPercent}
          />

          <Link href="/ajuda" className="text-xs font-medium text-brand hover:underline w-fit">
            Ver as formas de pagamento
          </Link>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center border border-border rounded-lg h-10 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-full text-lg text-muted hover:text-foreground"
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeVariant.stock, q + 1))}
                className="w-8 h-full text-lg text-muted hover:text-foreground"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted">
              {activeVariant.stock > 5
                ? "Em estoque"
                : activeVariant.stock > 0
                ? `Últimas ${activeVariant.stock} unidades`
                : "Fora de estoque"}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={activeVariant.stock === 0}
            className="hidden sm:flex items-center justify-center rounded-lg bg-brand/85 hover:bg-brand text-brand-foreground font-bold h-11 text-sm transition-colors disabled:opacity-40"
          >
            {added ? "Adicionado ao carrinho ✓" : "Adicionar ao carrinho"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={activeVariant.stock === 0}
            className="hidden sm:flex items-center justify-center rounded-lg bg-brand hover:bg-brand-dark text-brand-foreground font-bold h-11 text-sm transition-colors disabled:opacity-40"
          >
            Comprar
          </button>

          {/* Lista de confiança: só afirmações que a loja de fato garante
              (ver /termos e /garantia) — nada de estatística inventada. */}
          <ul className="flex flex-col gap-2 pt-2 border-t border-border text-xs text-muted">
            <li className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0 text-success">
                <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Produto vendido e entregue por Brasil Multi Tech
            </li>
            <li className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path d="M10 2l6 2.5v5c0 4.4-2.6 7.6-6 8.5-3.4-.9-6-4.1-6-8.5v-5L10 2Z" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              Desbloqueado com {product.warrantyMonths} meses de garantia
            </li>
            <li className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path d="M5 2.5h10v15l-2.5-1.5L10 17.5 7.5 16 5 17.5v-15Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              Nota fiscal inclusa
            </li>
          </ul>

          <ShippingEstimator items={[{ productId: product.id, variantId: activeVariant.id, quantity }]} />
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

/**
 * Acordeão "Entender condições": explica o que muda entre os selos de
 * estado (tela/lateral/traseira/bateria/acessórios), com abas pra ver o
 * detalhe de cada condição sem precisar trocar a variante selecionada pra
 * compra — só quando o cliente clica numa aba aqui é que ela também vira a
 * condição selecionada acima (mesmo comportamento do seletor principal).
 */
function EntenderCondicoes({
  conditions,
  selected,
  onSelect,
}: {
  conditions: ProductCondition[];
  selected: ProductCondition;
  onSelect: (c: ProductCondition) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const detalhes = CONDITION_DETAILS[selected];

  const cartas = [
    { titulo: "Tela", texto: detalhes.tela, icone: IconeTela },
    { titulo: "Lateral", texto: detalhes.lateral, icone: IconeLateral },
    { titulo: "Traseira", texto: detalhes.traseira, icone: IconeTraseira },
    { titulo: "Bateria", texto: detalhes.bateria, icone: IconeBateria },
    { titulo: "Acessórios", texto: detalhes.acessorios, icone: IconeAcessorios },
  ];

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
        aria-expanded={aberto}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Entender condições
      </button>

      {aberto && (
        <div className="mt-3 rounded-xl border border-border bg-[#f7f8fa] p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Conheça a condição estética do aparelho:</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Cada selo indica o estado de conservação real do aparelho, verificado por nossa equipe técnica antes
              do anúncio. Escolha uma condição abaixo pra ver o que esperar de cada uma.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelect(c)}
                className={`rounded-lg border px-3 h-8 text-xs font-semibold transition-colors ${
                  selected === c
                    ? "border-brand text-brand bg-brand-light"
                    : "border-border text-foreground bg-surface hover:border-muted"
                }`}
              >
                {CONDITION_LABELS[c]}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {cartas.map(({ titulo, texto, icone: Icone }) => (
              <div key={titulo} className="flex items-start gap-2.5 rounded-lg bg-surface border border-border p-2.5">
                <Icone />
                <div>
                  <p className="text-xs font-semibold text-foreground">{titulo}</p>
                  <p className="text-xs text-muted leading-snug">{texto}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            Imagens ilustrativas. Fotos reais do aparelho ficam na galeria acima.
          </p>
        </div>
      )}
    </div>
  );
}

function IconeTela() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-brand mt-0.5">
      <rect x="4" y="2.5" width="12" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 15.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconeLateral() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-brand mt-0.5">
      <rect x="7" y="2.5" width="6" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 5v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconeTraseira() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-brand mt-0.5">
      <rect x="4" y="2.5" width="12" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconeBateria() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-brand mt-0.5">
      <rect x="2.5" y="6" width="14" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16.5 8.5h1.4v3h-1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconeAcessorios() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-brand mt-0.5">
      <path
        d="M6 10a4 4 0 0 1 4-4h4M14 10a4 4 0 0 1-4 4H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
