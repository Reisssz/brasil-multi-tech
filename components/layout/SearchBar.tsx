"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data/products";
import { formatBRL } from "@/lib/pricing";
import { getMinPriceCents } from "@/lib/data/products";

export function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  function goToProduct(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/produto/${slug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results[0]) goToProduct(results[0].slug);
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="site-search">
          Buscar produtos
        </label>
        <div className="flex items-center gap-2 rounded-full bg-[#f0f1f4] border border-transparent focus-within:border-brand focus-within:bg-white transition-colors px-4 h-11">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-muted shrink-0">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            id="site-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Buscar iPhone, fone, carregador..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </form>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl bg-surface border border-border shadow-[var(--shadow-card-hover)] overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              onMouseDown={() => goToProduct(p.slug)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-[#f7f8fa] transition-colors"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{p.name}</span>
                <span className="text-xs text-muted">{p.brand}</span>
              </span>
              <span className="text-sm font-semibold text-brand tabular-nums">
                {formatBRL(getMinPriceCents(p))}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
