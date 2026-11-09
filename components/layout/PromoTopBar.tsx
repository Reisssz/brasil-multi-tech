"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ConfiguracaoBarraTopo } from "@/lib/promo-bar";

/** Tarja promocional acima do TopBar; textos e link são editados em /admin/barra-topo. */
export function PromoTopBar({
  config,
  maxParcelasSemJuros,
}: {
  config: ConfiguracaoBarraTopo;
  maxParcelasSemJuros: number;
}) {
  const mensagens = config.mensagens.map((m) => m.replaceAll("{parcelas}", String(maxParcelasSemJuros)));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (mensagens.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % mensagens.length), 4000);
    return () => clearInterval(id);
  }, [mensagens.length]);

  if (!config.ativo) return null;

  if (config.imagemUrl && config.imagemLargura && config.imagemAltura) {
    return (
      <div className="hidden sm:block bg-black">
        <Link href={config.ctaHref || "/"} className="block">
          <Image
            src={config.imagemUrl}
            width={config.imagemLargura}
            height={config.imagemAltura}
            alt={mensagens[0] ?? "Promoção"}
            sizes="100vw"
            priority
            className="w-full h-auto"
          />
        </Link>
      </div>
    );
  }

  if (mensagens.length === 0) return null;

  return (
    <div className="hidden sm:block bg-gradient-to-r from-brand-dark via-brand to-brand-dark text-white">
      {/* Fundo em degradê ocupa a largura toda da tela, mas o conteúdo fica
          preso ao mesmo max-w-7xl/padding do TopBar e do Header logo
          abaixo — assim o texto à esquerda e o CTA à direita alinham
          verticalmente com a logo e os ícones de utilidade do cabeçalho. */}
      <Link
        href={config.ctaHref || "/"}
        className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-9 flex items-stretch text-sm font-bold group"
      >
        {config.rotulo && (
          <span className="flex items-center gap-1.5 pr-4 shrink-0 whitespace-nowrap border-r border-white/25">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 6.5h12M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {config.rotulo}
          </span>
        )}
        <span className="flex-1 flex items-center justify-center px-4 min-w-0 overflow-hidden relative">
          <span key={index} className="animate-fade-in-fast whitespace-nowrap truncate">
            {mensagens[index % mensagens.length]}
          </span>
        </span>
        {config.ctaTexto && (
          <span className="flex items-center gap-1 pl-4 shrink-0 whitespace-nowrap border-l border-white/25 text-white/90 group-hover:text-white transition-colors">
            {config.ctaTexto}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform group-hover:translate-x-0.5">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </Link>
    </div>
  );
}
