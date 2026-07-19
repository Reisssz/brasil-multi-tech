"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    href: "/categoria/notebooks",
    photo: "/banners/notebooks-dell.png",
    alt: "Notebooks Dell seminovos — até 4x sem juros, frete grátis acima de R$1.200",
    productPhoto: "/products/dell-i3-seminovo-1.webp",
    eyebrow: "Notebooks",
    titleTop: "DELL",
    titleBottom: "SEMI NOVOS",
    subtitle: "Desempenho, qualidade e economia para o seu dia a dia!",
    badge1: "Até 4x sem juros",
    badge2: "Frete grátis acima de R$1.200",
  },
  {
    href: "/categoria/celulares",
    photo: "/banners/iphones-seminovos.png",
    alt: "iPhones seminovos — até 4x sem juros, frete grátis acima de R$1.200",
    productPhoto: "/products/iphone13-midnight-1.webp",
    eyebrow: "iPhones",
    titleTop: "SEMI",
    titleBottom: "NOVOS",
    subtitle: "Qualidade, confiança e o melhor preço!",
    badge1: "Até 4x sem juros",
    badge2: "Frete grátis acima de R$1.200",
  },
];

const SLIDE_DURATION = 6000;

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const barRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const goTo = useCallback((i: number) => {
    setActive(((i % slides.length) + slides.length) % slides.length);
  }, []);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [active]);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    const start = performance.now() - elapsedRef.current;

    function tick(now: number) {
      const elapsed = now - start;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      const desktopBar = barRefs.current[`d${active}`];
      if (desktopBar) desktopBar.style.width = `${pct}%`;
      if (elapsed >= SLIDE_DURATION) {
        goTo(active + 1);
      } else {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

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

  return (
    <section
      className="relative bg-[#0d0b06] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 -translate-x-1/2 w-[130%] aspect-square rounded-full bg-brand/15 blur-[90px]"
      />

      {/* Mobile: real markup hero, tall and content-driven — no crop, no letterbox */}
      <div className="sm:hidden relative min-h-[600px] flex flex-col px-5 pt-7 pb-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_60%,rgba(224,163,0,0.12)_100%)]"
        />
        {slides.map((slide, i) => (
          <div
            key={slide.href}
            className="flex flex-col flex-1 transition-opacity duration-500 ease-out"
            style={{
              display: i === active ? "flex" : "none",
            }}
            aria-hidden={i !== active}
          >
            <span className="animate-fade-in-fast inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-wide px-3 py-1.5">
              {slide.eyebrow}
            </span>

            <h1 className="animate-fade-in-fast mt-3 text-[2.55rem] leading-[0.95] font-extrabold text-white">
              {slide.titleTop}
              <br />
              <span className="text-brand">{slide.titleBottom}</span>
            </h1>

            <p className="animate-fade-in-fast mt-3 text-sm text-[#d8dae0] max-w-[85%]">{slide.subtitle}</p>

            <div className="animate-fade-in-fast mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-black/40 text-white text-xs font-semibold px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand shrink-0">
                  <rect x="3" y="7" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M3 10.5h18" stroke="currentColor" strokeWidth="1.7" />
                </svg>
                {slide.badge1}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-black/40 text-white text-xs font-semibold px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-brand shrink-0">
                  <path
                    d="M3 12h13l-3-4h4l4 4v5H3v-5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
                {slide.badge2}
              </span>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-[180px] mt-4">
              <div
                aria-hidden
                className="pointer-events-none absolute w-48 h-48 rounded-full bg-brand/25 blur-[60px]"
              />
              <div
                key={i === active ? `${i}-active` : `${i}-idle`}
                className={`relative w-[62%] max-w-[220px] aspect-square rounded-[28px] bg-gradient-to-br from-white to-[#eef0f3] shadow-[0_20px_45px_rgba(0,0,0,0.45)] p-4 -rotate-2 ${
                  i === active ? "animate-pop-in animate-float-y" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- product cutout photo sized dynamically inside a fixed-ratio card */}
                <img src={slide.productPhoto} alt="" className="w-full h-full object-contain" />
              </div>
            </div>

            <Link
              href={slide.href}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 transition-colors active:scale-95"
            >
              Ver ofertas
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        ))}

        <div className="relative flex justify-center gap-2 pt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-brand" : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop / tablet: full pre-designed promo banner artwork */}
      <div
        className="hidden sm:block relative mx-auto max-w-7xl aspect-[21/9] lg:aspect-[1893/616]"
      >
        {slides.map((slide, i) => (
          <Link
            key={slide.photo}
            href={slide.href}
            className="absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
            tabIndex={i === active ? 0 : -1}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- full pre-designed promo banner, not an optimizable content image */}
            <img
              key={i === active ? `${i}-active-d` : `${i}-idle-d`}
              src={slide.photo}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className={`w-full h-full object-contain ${i === active ? "animate-kenburns" : ""}`}
            />
          </Link>
        ))}

        <button
          onClick={prev}
          aria-label="Banner anterior"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-brand hover:text-brand-foreground text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Próximo banner"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-brand hover:text-brand-foreground text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className={`relative h-1.5 rounded-full overflow-hidden bg-white/30 transition-all ${
                i === active ? "w-8" : "w-1.5 hover:bg-white/50"
              }`}
            >
              {i === active && (
                <span
                  ref={(el) => {
                    barRefs.current[`d${i}`] = el;
                  }}
                  className="absolute inset-y-0 left-0 w-0 bg-white"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
