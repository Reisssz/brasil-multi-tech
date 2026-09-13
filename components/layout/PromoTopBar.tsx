import Link from "next/link";

/**
 * Tarja promocional acima do TopBar — pedido do cliente com referência visual
 * do site exemplo (3 seções: destaque à esquerda, mensagem central, CTA à
 * direita). Texto usa temas que já existem de verdade no site (aniversário
 * de 5 anos, ofertas) em vez de inventar uma campanha/desconto novo — ajuste
 * o texto aqui quando a promoção mudar.
 */
export function PromoTopBar() {
  return (
    <Link
      href="/categoria/ofertas"
      className="hidden sm:flex items-stretch h-9 text-sm font-bold text-white overflow-hidden"
    >
      <span className="flex items-center gap-1.5 bg-brand-dark px-4 shrink-0 whitespace-nowrap">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        5 ANOS BRASIL MULTI TECH
      </span>
      <span className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand to-brand-dark px-4 min-w-0 whitespace-nowrap overflow-hidden">
        <span className="font-normal hidden md:inline">Comemore com a gente:</span>
        ofertas especiais em todo o site
      </span>
      <span className="flex items-center bg-blue-900 hover:bg-blue-950 px-4 shrink-0 whitespace-nowrap transition-colors">
        APROVEITE AGORA
      </span>
    </Link>
  );
}
