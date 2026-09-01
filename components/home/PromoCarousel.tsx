"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "../ui/Reveal";

const cards = [
  {
    title: "Celulares seminovos",
    subtitle: "Revisados e com garantia, prontos pra usar",
    href: "/categoria/celulares",
    photo: "/products/iphone13-midnight-1.webp",
  },
  {
    title: "Notebooks com garantia",
    subtitle: "Desempenho e economia para o seu dia a dia",
    href: "/categoria/notebooks",
    photo: "/products/dell-i3-seminovo-1.webp",
  },
  {
    title: "Venda seu aparelho",
    subtitle: "Transforme o celular parado em dinheiro",
    href: "/vender",
    photo: "/products/iphone11-white-1.webp",
  },
  {
    title: "Acessórios essenciais",
    subtitle: "Carregadores, power banks e muito mais",
    href: "/categoria/acessorios",
    photo: "/products/peining-charger20w-1.jpeg",
  },
  {
    title: "Android por menos",
    subtitle: "Ótimo custo-benefício em marcas confiáveis",
    href: "/categoria/celulares",
    photo: "/products/redmi-note-cores-1.webp",
  },
];

const SLIDE_DURATION = 4500;

export function PromoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((i: number) => {
    setActive(((i % cards.length) + cards.length) % cards.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(active + 1), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [active, paused, goTo]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[active] as HTMLElement | undefined;
    if (track && card) {
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }, [active]);

  return (
    <section className="bg-surface border-y border-border py-10 overflow-hidden">
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between mb-5">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Fique de olho</h2>
        <div className="flex items-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para o anúncio ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-brand" : "w-1.5 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </Reveal>

      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group relative shrink-0 snap-start flex w-[78%] xs:w-[60%] sm:w-[42%] lg:w-[30%] aspect-[16/10] rounded-2xl overflow-hidden bg-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative promo artwork, not an optimizable content image */}
            <img
              src={c.photo}
              alt=""
              className="absolute inset-0 w-full h-full object-contain p-6 opacity-95 transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col">
              <span className="font-display text-base sm:text-lg font-bold text-white leading-tight">{c.title}</span>
              <span className="text-xs sm:text-sm text-white/80">{c.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
