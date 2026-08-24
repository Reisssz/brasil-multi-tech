import Link from "next/link";
import { ProductCategory } from "@/lib/types";
import { SITE, whatsappLink } from "@/lib/config";

export function Footer({ categories }: { categories: ProductCategory[] }) {
  return (
    <footer className="mt-16 bg-ink-2 text-ink-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 [&>div]:min-w-0">
        <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
          <span className="font-display text-lg font-bold text-ink-foreground">
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
              className="text-xs border border-ink-border rounded-full px-3 py-1.5 hover:border-brand hover:text-ink-foreground transition-colors"
            >
              {SITE.instagram}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-whatsapp hover:bg-whatsapp-dark text-whatsapp-foreground rounded-full px-3 py-1.5 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.5A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-ink-foreground mb-1">Categorias</span>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="text-sm hover:text-brand transition-colors">
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 min-w-0">
          <span className="text-sm font-semibold text-ink-foreground mb-1">Institucional</span>
          <Link href="/sobre" className="text-sm hover:text-brand transition-colors">Sobre nós</Link>
          <Link href="/contato" className="text-sm hover:text-brand transition-colors">Contato</Link>
          <Link href="/ajuda" className="text-sm hover:text-brand transition-colors">Central de ajuda</Link>
          <Link href="/garantia" className="text-sm hover:text-brand transition-colors">Garantia e trocas</Link>
          <Link href="/pedido/rastreio" className="text-sm hover:text-brand transition-colors">Rastrear pedido</Link>

          <span className="text-sm font-semibold text-ink-foreground mt-3 mb-1">Suporte ao cliente</span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-whatsapp hover:text-[#3ee881] transition-colors break-words font-medium">
            WhatsApp: {SITE.whatsappDisplay}
          </a>
          <a href={`tel:+55${SITE.phoneDisplay.replace(/\D/g, "")}`} className="text-sm hover:text-brand transition-colors break-words">
            Tel: {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.supportEmail}`} className="text-sm hover:text-brand transition-colors break-words">
            {SITE.supportEmail}
          </a>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-ink-foreground mb-1">Pagamento</span>
          <div className="flex flex-wrap gap-1.5">
            {["Pix", "Mercado Pago", "Visa", "Master", "Boleto"].map((p) => (
              <span key={p} className="text-[11px] font-medium bg-ink border border-ink-border rounded px-2 py-1">
                {p}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-ink-foreground mt-3 mb-1">Segurança</span>
          <span className="text-[11px] font-medium bg-ink border border-ink-border rounded px-2 py-1 w-fit">
            Site protegido com SSL
          </span>
        </div>
      </div>
      <div className="border-t border-ink-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 pb-24 sm:pb-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-center sm:text-left text-xs">
          <span>© {new Date().getFullYear()} Brasil Multi Tech. Todos os direitos reservados.</span>
          <span className="break-words">{SITE.address.line1}, {SITE.address.line2}</span>
        </div>
      </div>
    </footer>
  );
}
