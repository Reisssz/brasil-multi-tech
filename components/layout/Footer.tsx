import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { SITE, whatsappLink } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 bg-[#14161a] text-[#c9cbd1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
          <span className="text-lg font-extrabold text-white">
            BRASIL <span className="text-brand">MULTI TECH</span>
          </span>
          <p className="text-sm max-w-xs">
            {SITE.slogan} Celulares novos e seminovos, notebooks e acessórios com garantia, direto de
            Belém - PA para todo o Brasil.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-[#2a2d34] rounded-full px-3 py-1.5 hover:border-brand hover:text-white transition-colors"
            >
              {SITE.instagram}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-[#2a2d34] rounded-full px-3 py-1.5 hover:border-brand hover:text-white transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-white mb-1">Categorias</span>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="text-sm hover:text-brand transition-colors">
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-white mb-1">Institucional</span>
          <Link href="/sobre" className="text-sm hover:text-brand transition-colors">Sobre nós</Link>
          <Link href="/contato" className="text-sm hover:text-brand transition-colors">Contato</Link>
          <Link href="/ajuda" className="text-sm hover:text-brand transition-colors">Central de ajuda</Link>
          <Link href="/garantia" className="text-sm hover:text-brand transition-colors">Garantia e trocas</Link>
          <Link href="/pedido/rastreio" className="text-sm hover:text-brand transition-colors">Rastrear pedido</Link>
          <span className="text-sm">{SITE.supportEmail}</span>
          <span className="text-sm">{SITE.phoneDisplay}</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-white mb-1">Pagamento</span>
          <div className="flex flex-wrap gap-1.5">
            {["Pix", "Mercado Pago", "Visa", "Master", "Boleto"].map((p) => (
              <span key={p} className="text-[11px] font-medium bg-[#1d1f25] border border-[#2a2d34] rounded px-2 py-1">
                {p}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-white mt-3 mb-1">Segurança</span>
          <span className="text-[11px] font-medium bg-[#1d1f25] border border-[#2a2d34] rounded px-2 py-1 w-fit">
            Site protegido com SSL
          </span>
        </div>
      </div>
      <div className="border-t border-[#2a2d34]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs">
          <span>© {new Date().getFullYear()} Brasil Multi Tech. Todos os direitos reservados.</span>
          <span>{SITE.address.line1}, {SITE.address.line2}</span>
        </div>
      </div>
    </footer>
  );
}
