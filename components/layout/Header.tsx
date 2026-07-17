"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "../ui/Logo";
import { SearchBar } from "./SearchBar";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/data/categories";
import { whatsappLink } from "@/lib/config";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-muted/70 group-hover:text-brand transition-colors">
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const { totalCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 h-20">
          <Logo />

          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-dark text-brand-foreground px-5 h-11 text-sm font-bold transition-colors shadow-[0_2px_8px_rgba(224,163,0,0.35)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.5A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
              </svg>
              Fale com um consultor
            </a>

            <Link
              href="/carrinho"
              className="relative inline-flex items-center justify-center rounded-full w-11 h-11 border border-border hover:border-brand transition-colors"
              aria-label="Carrinho"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="21" r="1.4" fill="currentColor" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[19px] h-[19px] px-1 rounded-full bg-brand text-brand-foreground text-[11px] font-bold">
                  {totalCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden inline-flex items-center justify-center rounded-full w-11 h-11 border border-border"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 h-11 -mt-1 border-t border-border/70 text-sm">
          <Link href="/categoria/ofertas" className="group flex items-center gap-1 text-foreground font-semibold">
            Categorias
            <Chevron />
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="group flex items-center gap-1 text-muted hover:text-brand-dark font-medium transition-colors"
            >
              {c.shortLabel}
              <Chevron />
            </Link>
          ))}
          <Link href="/categoria/ofertas" className="text-brand-dark font-semibold ml-auto">
            Ofertas
          </Link>
          <Link href="/sobre" className="text-muted hover:text-brand-dark font-medium transition-colors">
            Sobre nós
          </Link>
          <Link href="/contato" className="text-muted hover:text-brand-dark font-medium transition-colors">
            Contato
          </Link>
        </nav>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-4">
          <SearchBar />
          <div className="flex flex-col gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-foreground border-b border-border/60"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/sobre"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-foreground border-b border-border/60"
            >
              Sobre nós
            </Link>
            <Link
              href="/contato"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-foreground border-b border-border/60"
            >
              Contato
            </Link>
          </div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground h-11 text-sm font-semibold"
          >
            Fale com um consultor
          </a>
        </div>
      )}
    </header>
  );
}
