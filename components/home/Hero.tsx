"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative bg-[#0d0b06]">
      <div className="relative mx-auto max-w-7xl aspect-[1893/616]">
        {slides.map((slide, i) => (
          <Link
            key={slide.photo}
            href={slide.href}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
            tabIndex={i === active ? 0 : -1}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- full pre-designed promo banner, not an optimizable content image */}
            <img src={slide.photo} alt={slide.alt} className="w-full h-full object-cover" />
          </Link>
        ))}

        <button
          onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
          aria-label="Banner anterior"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => setActive((a) => (a + 1) % slides.length)}
          aria-label="Próximo banner"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
