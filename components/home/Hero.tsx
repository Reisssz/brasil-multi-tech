"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    href: "/categoria/notebooks",
    photo: "/banners/notebooks-dell.png",
    alt: "Notebooks Dell seminovos — até 4x sem juros, frete grátis acima de R$1.200",
  },
  {
    href: "/categoria/celulares",
    photo: "/banners/iphones-seminovos.png",
    alt: "iPhones seminovos — até 4x sem juros, frete grátis acima de R$1.200",
  },
];

const SLIDE_DURATION = 6000;

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);

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
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 -translate-x-1/2 w-[130%] aspect-square rounded-full bg-brand/15 blur-[90px]"
      />

      <div
        className="relative mx-auto max-w-7xl aspect-[16/10] sm:aspect-[21/9] lg:aspect-[1893/616]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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
              key={i === active ? `${i}-active` : `${i}-idle`}
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
                    barRefs.current[i] = el;
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
