import Link from "next/link";
import { ProductCategory } from "@/lib/types";
import { SITE, whatsappLink } from "@/lib/config";

const METODOS_PAGAMENTO = [
  {
    label: "Cartão de crédito",
    icon: (
      <>
        <rect x="2.5" y="5" width="15" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 8.2h15" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  {
    label: "Pix",
    icon: (
      <path
        d="M10 3.5 13 6.5 10 9.5 7 6.5 10 3.5Z M10 10.5 13 13.5 10 16.5 7 13.5 10 10.5Z M3.5 10 6.5 7 6.5 13 3.5 10Z M16.5 10 13.5 13 13.5 7 16.5 10Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Boleto",
    icon: (
      <path
        d="M2.5 4v12M5 4v12M6.8 4v12M9 4v12M9.8 4v12M12 4v12M14.5 4v12M17.5 4v12"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    ),
  },
];

export function Footer({ categories }: { categories: ProductCategory[] }) {
  return (
    <footer className="mt-16 bg-ink-2 text-ink-muted">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-8">
        <span className="text-sm font-semibold text-ink-foreground">Formas de pagamento</span>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-3">
          {METODOS_PAGAMENTO.map((m) => (
            <span key={m.label} className="flex items-center gap-2.5 text-sm">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ink border border-ink-border text-brand shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {m.icon}
                </svg>
              </span>
              {m.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted border border-ink-border rounded-full px-3 py-1.5">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 7V4.8a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Site protegido com SSL
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 mt-8 border-t border-ink-border grid grid-cols-2 md:grid-cols-5 gap-8 [&>div]:min-w-0">
        <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
          <span className="font-display text-lg font-bold text-ink-foreground">
            BRASIL <span className="text-brand">MULTI TECH</span>
          </span>
          <p className="text-sm max-w-xs">
            {SITE.slogan} Celulares novos e seminovos, notebooks e acessórios com garantia, direto de
            Belém - PA para todo o Brasil.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold bg-whatsapp hover:bg-whatsapp-dark text-whatsapp-foreground rounded-full px-3 py-1.5 transition-colors mt-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.5A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
            </svg>
            WhatsApp
          </a>
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
          <span className="text-sm font-semibold text-ink-foreground mb-1">Brasil Multi Tech</span>
          <Link href="/sobre" className="text-sm hover:text-brand transition-colors">Sobre nós</Link>
          <Link href="/confiavel" className="text-sm hover:text-brand transition-colors">Brasil Multi Tech é confiável?</Link>
          <Link href="/ajuda" className="text-sm hover:text-brand transition-colors">Dúvidas frequentes</Link>
          <Link href="/termos" className="text-sm hover:text-brand transition-colors">Termos e condições de uso</Link>
          <Link href="/garantia" className="text-sm hover:text-brand transition-colors">Trocas e devoluções</Link>
          <Link href="/vender" className="text-sm hover:text-brand transition-colors">Venda com a gente</Link>
          <Link href="/pedido/rastreio" className="text-sm hover:text-brand transition-colors">Rastrear pedido</Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-ink-foreground mb-1">Atendimento</span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-whatsapp hover:text-[#3ee881] transition-colors break-words font-medium">
            WhatsApp: {SITE.whatsappDisplay}
          </a>
          <a href={`tel:+55${SITE.phoneDisplay.replace(/\D/g, "")}`} className="text-sm hover:text-brand transition-colors break-words">
            Tel: {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.supportEmail}`} className="text-sm hover:text-brand transition-colors break-words">
            {SITE.supportEmail}
          </a>
          <Link href="/contato" className="text-sm hover:text-brand transition-colors">Fale conosco</Link>

          <span className="text-sm font-semibold text-ink-foreground mt-3 mb-1">Redes sociais</span>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-border hover:border-brand hover:text-brand transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-ink-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-5 pb-24 sm:pb-5 flex flex-col gap-1.5 text-center sm:text-left text-xs">
          <span className="break-words">
            BRASIL MULTI TECH — CRISTIAN BRASIL DE FREITAS · CNPJ 29.853.621/0001-08 · {SITE.address.line1},{" "}
            {SITE.address.line2}
          </span>
          <span className="flex flex-wrap items-center justify-center sm:justify-start gap-x-1.5">
            © {new Date().getFullYear()} Brasil Multi Tech. Todos os direitos reservados. ·{" "}
            <Link href="/contato" className="hover:text-brand transition-colors underline underline-offset-2">
              Atendimento ao cliente
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
