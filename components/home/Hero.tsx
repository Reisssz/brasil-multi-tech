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
 * — ver lib/banners.ts) é pareado por
 * ordem com `banners`: o 1º mobile substitui o 1º principal só abaixo de
 * `sm`, o 2º substitui o 2º, e assim por diante. Slide sem par mobile usa a
 * imagem principal normalmente (cortada pelo object-cover).
 */
export function Hero({ banners, bannersMobile = [] }: { banners: Banner[]; bannersMobile?: Banner[] }) {
  const heroId = useId().replace(/[^a-zA-Z0-9]/g, "");
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

  // Proporção real de cada conjunto, lida no server a partir do primeiro
  // arquivo com dimensões conhecidas (lib/banners.ts) — troque a resolução
  // dos arquivos que o Hero se ajusta sozinho, sem editar este componente.
  // minHeight/maxHeight seguram os extremos: banner ilegível de tão baixo
  // (sem versão mobile própria) e banner gigante em telas ultrawide.
  const referencia = banners.find((b) => b.width && b.height);
  const ratio = referencia?.width && referencia?.height ? referencia.width / referencia.height : undefined;
  // Mobile pode vir embutido no próprio slide (cadastro pelo admin) ou de
  // um array separado pareado por ordem (modo antigo, pastas de arquivo).
  const slideComMobile = banners.find((b) => b.mobileWidth && b.mobileHeight);
  const pastaMobile = bannersMobile.find((b) => b.width && b.height);
  const ratioMobile = slideComMobile
    ? slideComMobile.mobileWidth! / slideComMobile.mobileHeight!
    : pastaMobile?.width && pastaMobile?.height
      ? pastaMobile.width / pastaMobile.height
      : undefined;

  // aspect-ratio vai pro <style> (classe), não pro style inline — inline
  // sempre vence regra de classe/media query, o que impediria a troca de
  // proporção no breakpoint mobile de ter efeito nenhum.
  const boxStyle = { minHeight: 220, maxHeight: 560 };
  const boxClassName = `relative overflow-hidden hero-box-${heroId} ${ratio ? "" : "aspect-video sm:aspect-2/1 lg:aspect-5/1"}`;

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

      {/* Proporção real do banner via classe (não inline — inline venceria
          a media query abaixo e a troca pro mobile nunca teria efeito).
          Com ratioMobile, abaixo de MOBILE_BREAKPOINT_PX a caixa casa com a
          imagem mobile que o <picture> já está exibindo nesse breakpoint. */}
      {ratio && (
        <style>{`
          .hero-box-${heroId} { aspect-ratio: ${ratio}; }
          ${
            ratioMobile
              ? `@media (max-width: ${MOBILE_BREAKPOINT_PX - 1}px) { .hero-box-${heroId} { aspect-ratio: ${ratioMobile}; } }`
              : ""
          }
        `}</style>
      )}

      {/* Full-bleed: o banner ocupa a largura inteira do site, na proporção
          real dos arquivos atuais (calculada acima, a partir das dimensões
          lidas no server). minHeight evita banner ilegível no mobile quando
          o arquivo é bem largo/baixo; maxHeight evita banner gigante em
          telas ultrawide. Sem dimensões conhecidas, cai no aspect-ratio de
          segurança (className condicional em boxClassName). */}
      <div className="relative w-full">
        <div className={boxClassName} style={boxStyle}>
          {/* Rolagem lateral simples: um track em flex que desliza no eixo X.
              Sem zoom/ken burns e sem crossfade — só o deslocamento. */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {banners.map((banner, i) => {
              // Mobile embutido no slide (cadastro pelo admin) tem prioridade;
              // sem isso, cai no pareamento por ORDEM do modo antigo (1º com
              // 1º, 2º com 2º...) — se não existir nenhum dos dois, o slide
              // usa a imagem principal normalmente.
              const srcMobile = banner.mobileSrc ?? bannersMobile[i]?.src;
              const img = (
                <picture>
                  {srcMobile && (
                    <source media={`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`} srcSet={srcMobile} />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element -- banner de marketing com dimensões definidas pelo time de design */}
                  <img
                    src={banner.src}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    className="w-full h-full object-cover"
                  />
                </picture>
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
