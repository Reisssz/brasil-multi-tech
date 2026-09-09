"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Banner } from "@/lib/banners";

const SLIDE_DURATION = 6000;

/**
 * Header principal — carrossel de banners soltos pelo time de marketing em
 * public/banners/banners-principal, lidos no server (page.tsx) e passados
 * aqui como prop porque este componente precisa ser client (autoplay,
 * swipe, teclado). Só o banner com "venda"/"vendas" no nome do arquivo é
 * clicável, levando pra /vender — os demais são só imagem.
 */
export function Hero({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const barRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  const goTo = useCallback(
    (i: number) => {
      setActive(((i % banners.length) + banners.length) % banners.length);
    },
    [banners.length]
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [active]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    let raf = 0;
    const start = performance.now() - elapsedRef.current;

    function tick(now: number) {
      const elapsed = now - start;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      const bar = barRefs.current[active];
      if (bar) bar.style.width = `${pct}%`;
      if (elapsed >= SLIDE_DURATION) {
        goTo(active + 1);
      } else {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, goTo, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, banners.length]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    setPaused(false);
    touchStartX.current = null;
    if (startX == null) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) next();
      else prev();
    }
  }

  if (banners.length === 0) return null;

  return (
    <section
      className="relative bg-ink overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 -translate-x-1/2 w-[130%] aspect-square rounded-full bg-brand/15 blur-[90px]"
      />

      {/* Full-bleed: o banner ocupa a largura inteira do site, sem coluna de
          conteúdo. A proporção acompanha a das imagens (1456x819 = 16:9) pra
          não sobrar vazio nas laterais nem cortar o topo/rodapé da arte — se
          os banners forem reexportados numa proporção mais larga (ex: 21:9),
          basta trocar o aspect abaixo pra reduzir a altura do hero. */}
      <div className="relative w-full">
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Rolagem lateral simples: um track em flex que desliza no eixo X.
              Sem zoom/ken burns e sem crossfade — só o deslocamento. */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {banners.map((banner, i) => {
              const img = (
                // eslint-disable-next-line @next/next/no-img-element -- banner de marketing com dimensões definidas pelo time de design
                <img
                  src={banner.src}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover"
                />
              );

              return (
                <div key={banner.src} className="w-full h-full shrink-0" aria-hidden={i !== active}>
                  {banner.href ? (
                    <Link
                      href={banner.href}
                      className="block w-full h-full cursor-pointer"
                      tabIndex={i === active ? 0 : -1}
                    >
                      {img}
                    </Link>
                  ) : (
                    img
                  )}
                </div>
              );
            })}
          </div>

          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Banner anterior"
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-brand hover:text-brand-foreground text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Próximo banner"
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-brand hover:text-brand-foreground text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Ir para banner ${i + 1}`}
                    className={`relative h-1.5 rounded-full overflow-hidden bg-white/40 transition-all ${
                      i === active ? "w-8" : "w-1.5 hover:bg-white/60"
                    }`}
                  >
                    {i === active && (
                      <span
                        ref={(el) => {
                          barRefs.current[i] = el;
                        }}
                        className="absolute inset-y-0 left-0 w-0 bg-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
