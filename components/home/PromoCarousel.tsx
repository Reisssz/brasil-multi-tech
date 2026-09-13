"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "../ui/Reveal";
import type { Banner } from "@/lib/banners";

const SLIDE_DURATION = 4500;

/**
 * "Fique de olho" — esteira de banners promocionais soltos pelo time de
 * marketing em public/banners (banner1, banner2, ...), lidos no server
 * (page.tsx) e passados aqui como prop porque este componente precisa ser
 * client (estado do carrossel/auto-scroll). Banners com "venda"/"vendas"
 * no nome do arquivo levam pra /vender; os demais não são clicáveis.
 *
 * O track fica DENTRO da mesma coluna (max-w-7xl + px-4/sm:px-6) usada
 * pelas outras seções — antes ele era full-bleed e começava 80px à
 * esquerda de todo o resto do site.
 */
export function PromoCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => {
      setActive(((i % banners.length) + banners.length) % banners.length);
    },
    [banners.length]
  );

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const id = setInterval(() => goTo(active + 1), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [active, paused, goTo, banners.length]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[active] as HTMLElement | undefined;
    if (track && card) {
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }, [active]);

  if (banners.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Fique de olho</h2>
          {banners.length > 1 && (
            <div className="flex items-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir para o banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-6 bg-brand" : "w-1.5 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </Reveal>

        <div className="relative">
          <div
            ref={trackRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {banners.map((banner) => {
              const wrapperClassName =
                "group shrink-0 snap-start w-[85%] sm:w-[calc(50%_-_10px)] lg:w-[calc(33.333%_-_14px)] overflow-hidden";
              const img = (
                // eslint-disable-next-line @next/next/no-img-element -- banner de marketing com dimensões definidas pelo time de design
                <img
                  src={banner.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              );
              return banner.href ? (
                <Link key={banner.src} href={banner.href} className={`${wrapperClassName} cursor-pointer`}>
                  <div className="aspect-[16/9]">{img}</div>
                </Link>
              ) : (
                <div key={banner.src} className={wrapperClassName}>
                  <div className="aspect-[16/9]">{img}</div>
                </div>
              );
            })}
          </div>

          {banners.length > 1 && (
            <>
              <button
                onClick={() => goTo(active - 1)}
                aria-label="Banner anterior"
                className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-border shadow-[var(--shadow-card)] text-foreground hover:bg-brand hover:text-brand-foreground hover:border-brand transition-all hover:scale-110 active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => goTo(active + 1)}
                aria-label="Próximo banner"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-border shadow-[var(--shadow-card)] text-foreground hover:bg-brand hover:text-brand-foreground hover:border-brand transition-all hover:scale-110 active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
