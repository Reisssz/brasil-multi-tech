"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  variantId: string;
};

type ProdutoBase = {
  id: string;
  variantId: string;
  name: string;
  priceCents: number;
  photoUrl: string | null;
  icone: string;
};

/**
 * Combo estilo "Aproveite e complete seu celular" da Trocafone: o cliente
 * marca quais acessórios quer levar junto (cartões com borda destacada
 * quando selecionados), vê a soma total em tempo real e compra tudo de
 * uma vez com um único botão.
 */
export function ComboKit({ produtoBase, sugestoes }: { produtoBase: ProdutoBase; sugestoes: SugestaoComboView[] }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [processando, setProcessando] = useState(false);

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const itensSelecionados = useMemo(
    () => sugestoes.filter((s) => selecionados.has(s.id)),
    [sugestoes, selecionados]
  );

  const somaCents = produtoBase.priceCents + itensSelecionados.reduce((soma, s) => soma + s.priceCents, 0);

  function comprarKit() {
    setProcessando(true);
    addItem(produtoBase.id, produtoBase.variantId, 1);
    itensSelecionados.forEach((s) => addItem(s.id, s.variantId, 1));
    router.push("/carrinho");
  }

  if (sugestoes.length === 0) return null;

  return (
    <div className="mt-14 border-t border-border pt-10">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">Aproveite e complete seu pedido</h2>
      <p className="text-sm text-muted mb-6">Marque o que você também quer levar e compre tudo de uma vez.</p>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {sugestoes.map((s) => {
            const ativo = selecionados.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => alternar(s.id)}
                className={`relative flex flex-col shrink-0 w-36 rounded-xl border-2 bg-surface overflow-hidden text-left transition-colors ${
                  ativo ? "border-brand" : "border-border"
                }`}
              >
                {ativo && (
                  <span className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-brand text-brand-foreground">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <ProductImage
                  icon={s.icone as ProductIconKey}
                  photoSrc={s.photoUrl ?? undefined}
                  tint="white"
                  className="aspect-square w-full"
                />
                <div className="flex flex-col gap-0.5 p-2.5">
                  <span className="text-xs font-semibold text-foreground line-clamp-2 min-h-[2em]">{s.name}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{formatBRL(s.priceCents)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <ProductImage icon={produtoBase.icone as ProductIconKey} photoSrc={produtoBase.photoUrl ?? undefined} className="w-14 h-14 rounded-lg shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted">Produto principal</p>
              <p className="text-sm font-semibold text-foreground line-clamp-2">{produtoBase.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm border-t border-border pt-3">
            <div className="flex justify-between text-muted">
              <span>Produto</span>
              <span className="tabular-nums">{formatBRL(produtoBase.priceCents)}</span>
            </div>
            {itensSelecionados.map((s) => (
              <div key={s.id} className="flex justify-between text-muted">
                <span className="truncate pr-2">+ {s.name}</span>
                <span className="tabular-nums shrink-0">{formatBRL(s.priceCents)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline border-t border-border pt-3">
            <span className="text-sm font-medium text-foreground">Soma dos itens</span>
            <span className="font-display text-xl font-bold text-foreground tabular-nums">{formatBRL(somaCents)}</span>
          </div>

          <button
            onClick={comprarKit}
            disabled={processando}
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-bold text-sm transition-colors"
          >
            {itensSelecionados.length > 0 ? "Comprar kit completo" : "Comprar produto"}
          </button>

          {itensSelecionados.length === 0 && (
            <p className="text-xs text-muted text-center">Marque os itens acima para montar seu kit.</p>
          )}
        </div>
      </div>
    </div>
  );
}