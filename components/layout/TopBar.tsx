import Link from "next/link";
import { SITE } from "@/lib/config";

export function TopBar() {
  return (
    <div className="hidden sm:block bg-[#14161a] text-[#d7d9de] text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-9 flex items-center justify-between">
        <span className="font-medium">
          Especialistas em smartphones com garantia — aprovação facilitada para negativados!
        </span>
        <div className="flex items-center gap-5">
          <Link href="/ajuda" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2.5 14c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Atendimento
          </Link>
          <Link href="/pedido/rastreio" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 5.5 8 2l6 3.5v5L8 14l-6-3.5v-5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M2 5.5 8 9l6-3.5M8 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            Meus pedidos
          </Link>
          <div className="flex items-center gap-3 border-l border-white/15 pl-4">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
