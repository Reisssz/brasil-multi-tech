"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Tarja promocional acima do TopBar. Mensagens giratórias usam só
 * políticas reais do site (nada de campanha/desconto inventado) — ajuste
 * aqui se alguma dessas condições mudar.
 */
const MENSAGENS: string[] = [
  "Comemore com a gente: ofertas especiais em todo o site",
  "8% de desconto à vista no Pix em todos os produtos",
  "Frete grátis nas compras acima de R$ 1.300",
  "Parcele em até 18x no cartão de crédito",
];

export function PromoTopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MENSAGENS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden sm:block bg-gradient-to-r from-brand-dark via-brand to-brand-dark text-white">
      {/* Fundo em degradê ocupa a largura toda da tela, mas o conteúdo fica
          preso ao mesmo max-w-7xl/padding do TopBar e do Header logo
          abaixo — assim o texto à esquerda e o CTA à direita alinham
          verticalmente com a logo e os ícones de utilidade do cabeçalho. */}
      <Link
        href="/categoria/ofertas"
        className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-9 flex items-stretch text-sm font-bold group"
      >
        <span className="flex items-center gap-1.5 pr-4 shrink-0 whitespace-nowrap border-r border-white/25">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2 6.5h12M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          5 ANOS BRASIL MULTI TECH
        </span>
        <span className="flex-1 flex items-center justify-center px-4 min-w-0 overflow-hidden relative">
          <span key={index} className="animate-fade-in-fast whitespace-nowrap truncate">
            {MENSAGENS[index]}
          </span>
        </span>
        <span className="flex items-center gap-1 pl-4 shrink-0 whitespace-nowrap border-l border-white/25 text-white/90 group-hover:text-white transition-colors">
          APROVEITE AGORA
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform group-hover:translate-x-0.5">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
