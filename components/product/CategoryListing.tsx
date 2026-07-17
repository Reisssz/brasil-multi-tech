"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { getMinPriceCents } from "@/lib/data/products";
import { formatBRL } from "@/lib/pricing";
import { ProductCard } from "./ProductCard";

type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "avaliacao";

export function CategoryListing({ products, title }: { products: Product[]; title: string }) {
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const storages = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.variants.map((v) => v.storageGb).filter(Boolean)))
      ).sort((a, b) => (a ?? 0) - (b ?? 0)) as number[],
    [products]
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("relevancia");

  function toggle<T>(list: T[], value: T, setter: (v: T[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedConditions.length && !p.variants.some((v) => selectedConditions.includes(v.condition)))
        return false;
      if (selectedStorages.length && !p.variants.some((v) => v.storageGb && selectedStorages.includes(v.storageGb)))
        return false;
      if (maxPrice !== null && getMinPriceCents(p) > maxPrice) return false;
      return true;
    });

    switch (sort) {
      case "menor-preco":
        result = [...result].sort((a, b) => getMinPriceCents(a) - getMinPriceCents(b));
        break;
      case "maior-preco":
        result = [...result].sort((a, b) => getMinPriceCents(b) - getMinPriceCents(a));
        break;
      case "avaliacao":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [products, selectedBrands, selectedConditions, selectedStorages, maxPrice, sort]);

  const priceCeilings = [50000, 100000, 200000, 500000];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{title}</h1>
        <span className="text-sm text-muted">{filtered.length} produtos encontrados</span>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="flex flex-col gap-6">
          {brands.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Marca</span>
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                    className="accent-[color:var(--brand)]"
                  />
                  {b}
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Condição</span>
            {["novo", "seminovo"].map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-muted cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(c)}
                  onChange={() => toggle(selectedConditions, c, setSelectedConditions)}
                  className="accent-[color:var(--brand)]"
                />
                {c}
              </label>
            ))}
          </div>

          {storages.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Armazenamento</span>
              {storages.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStorages.includes(s)}
                    onChange={() => toggle(selectedStorages, s, setSelectedStorages)}
                    className="accent-[color:var(--brand)]"
                  />
                  {s}GB
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Preço máximo</span>
            {priceCeilings.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="radio"
                  name="max-price"
                  checked={maxPrice === c}
                  onChange={() => setMaxPrice(c)}
                  className="accent-[color:var(--brand)]"
                />
                até {formatBRL(c)}
              </label>
            ))}
            <button
              onClick={() => setMaxPrice(null)}
              className="text-xs text-brand font-medium text-left mt-1 w-fit hover:text-brand-dark"
            >
              limpar filtro de preço
            </button>
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Ordenar por</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-brand"
              >
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
              Nenhum produto encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
