"use client";

import { useEffect, useState } from "react";
import { ComboSuggestionCard, type SugestaoComboView } from "@/components/product/ComboSuggestionCard";
import { useCart, resolveCartLine } from "@/lib/cart-context";

export function CheckoutComboSuggestions() {
  const { items } = useCart();
  const [sugestoes, setSugestoes] = useState<SugestaoComboView[]>([]);

  const chaveItens = items.map((i) => `${i.productId}:${i.quantity}`).join(",");

  useEffect(() => {
    if (items.length === 0) {
      setSugestoes([]);
      return;
    }

    const categorias = new Set<string>();
    const productIds: string[] = [];

    items.forEach((item) => {
      const { product } = resolveCartLine(item);
      if (product) {
        categorias.add(product.category);
        productIds.push(product.id);
      }
    });

    if (categorias.size === 0) return;

    fetch("/api/recomendacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categorias: Array.from(categorias), excluirProductIds: productIds }),
    })
      .then((r) => r.json())
      .then((dados) => setSugestoes(dados.sugestoes ?? []))
      .catch(() => setSugestoes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveItens]);

  if (sugestoes.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">Complete seu combo</h2>
      <p className="text-xs text-muted mb-4">Aproveite e leve junto:</p>
      <div className="grid grid-cols-2 gap-3">
        {sugestoes.map((s) => (
          <ComboSuggestionCard key={s.id} sugestao={s} />
        ))}
      </div>
    </div>
  );
}
