"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Banner } from "@/lib/banners";

const SLIDE_DURATION = 6000;
/** Mesmo corte do Tailwind `sm` — abaixo disso troca pra imagem/proporção mobile. */
const MOBILE_BREAKPOINT_PX = 640;

/**
 * Header principal — carrossel de banners soltos pelo time de marketing em
 * public/banners/banners-principal, lidos no server (page.tsx) e passados
 * aqui como prop porque este componente precisa ser client (autoplay,
 * swipe, teclado). Só o banner com "venda"/"vendas" no nome do arquivo é
 * clicável, levando pra /vender — os demais são só imagem.
 *
 * `bannersMobile` (opcional, public/banners/banner-mobile ou banners-mobile
 * — ver lib/banners.ts) é pareado por ordem com `banners`. Cada imagem usa
 * sua proporção intrínseca pra preencher a largura sem corte ou bordas.
 */
export function Hero({ banners, bannersMobile = [] }: { banners: Banner[]; bannersMobile?: Banner[] }) {
  const heroId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const barRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const mobileBanners = banners.flatMap((banner, index) => {
    const src = banner.mobileSrc ?? bannersMobile[index]?.src;
    if (!src) return [];
    return [{
      ...banner,
      src,
      width: banner.mobileSrc ? banner.mobileWidth : bannersMobile[index]?.width,
      height: banner.mobileSrc ? banner.mobileHeight : bannersMobile[index]?.height,
    }];
  });
  const slides = isMobile ? mobileBanners : banners;
  const activeSlide = slides.length > 0 ? active % slides.length : 0;

  useEffect(() => {
    const breakpoint = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const atualizarViewport = () => setIsMobile(breakpoint.matches);
    atualizarViewport();
    breakpoint.addEventListener("change", atualizarViewport);
    return () => breakpoint.removeEventListener("change", atualizarViewport);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (slides.length === 0) return;
      setActive(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );
  const next = useCallback(() => goTo(activeSlide + 1), [activeSlide, goTo]);
  const prev = useCallback(() => goTo(activeSlide - 1), [activeSlide, goTo]);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [active, isMobile]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    let raf = 0;
    const start = performance.now() - elapsedRef.current;

    function tick(now: number) {
      const elapsed = now - start;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      const bar = barRefs.current[activeSlide];
      if (bar) bar.style.width = `${pct}%`;
      if (elapsed >= SLIDE_DURATION) {
        goTo(activeSlide + 1);
      } else {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, activeSlide, paused, goTo, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, slides.length]);

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

  if (slides.length === 0) return null;

  const bannerAtivo = slides[active];
  const ratioDesktop =
    bannerAtivo.width && bannerAtivo.height ? bannerAtivo.width / bannerAtivo.height : 16 / 9;
  const boxClassName = `relative w-full overflow-hidden hero-box-${heroId}`;

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

      <style>{`
        .hero-box-${heroId} { aspect-ratio: ${ratioDesktop}; }
      `}</style>

      <div className="relative w-full">
        <div className={boxClassName}>
          {/* Rolagem lateral simples: um track em flex que desliza no eixo X.
              Sem zoom/ken burns e sem crossfade — só o deslocamento. */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((banner, i) => {
              // Mobile embutido no slide (cadastro pelo admin) tem prioridade;
              // banners sem versão mobile não entram na sequência mobile.
              const srcMobile = isMobile ? undefined : banner.mobileSrc ?? bannersMobile[i]?.src;
              const img = (
                <picture className="block h-full w-full">
                  {srcMobile && (
                    <source media={`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`} srcSet={srcMobile} />
                  )}
                  <img
                    src={banner.src}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    className={`w-full h-full object-cover ${!isMobile && !srcMobile ? "max-sm:hidden" : ""}`}
                  />
                </picture>
              );

              return (
                <div key={banner.src} className="w-full h-full shrink-0" aria-hidden={i !== activeSlide}>
                  {banner.href ? (
                    <Link
                      href={banner.href}
                      className="block w-full h-full cursor-pointer"
                      tabIndex={i === activeSlide ? 0 : -1}
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

          {slides.length > 1 && (
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
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Ir para banner ${i + 1}`}
                    className={`relative h-1.5 rounded-full overflow-hidden bg-white/40 transition-all ${
                      i === activeSlide ? "w-8" : "w-1.5 hover:bg-white/60"
                    }`}
                  >
                    {i === activeSlide && (
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
