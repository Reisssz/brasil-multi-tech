import { SITE, whatsappLink } from "@/lib/config";

export const metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Fale com a gente</h1>
      <p className="text-muted mb-8">Atendimento rápido e personalizado, direto pelo WhatsApp.</p>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="group mb-4 flex items-center justify-between gap-4 rounded-2xl bg-whatsapp hover:bg-whatsapp-dark text-whatsapp-foreground p-6 shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/15 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.5A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
            </svg>
          </span>
          <div>
            <span className="text-xs uppercase tracking-wide text-white/80">Resposta mais rápida</span>
            <p className="font-bold text-lg">Falar agora no WhatsApp</p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform group-hover:translate-x-1">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-1">
          <span className="text-xs text-muted uppercase">Telefone</span>
          <span className="font-semibold text-foreground">{SITE.phoneDisplay}</span>
        </div>
        <a
          href={`mailto:${SITE.supportEmail}`}
          className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-1 hover:border-brand transition-colors"
        >
          <span className="text-xs text-muted uppercase">E-mail</span>
          <span className="font-semibold text-foreground break-all">{SITE.supportEmail}</span>
        </a>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-1 hover:border-brand transition-colors"
        >
          <span className="text-xs text-muted uppercase">Instagram</span>
          <span className="font-semibold text-foreground">{SITE.instagram}</span>
        </a>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="p-6">
          <h2 className="font-bold text-foreground mb-1">Nossa loja física</h2>
          <p className="text-sm text-muted leading-relaxed">
            {SITE.address.line1}
            <br />
            {SITE.address.line2}
            <br />
            CEP {SITE.address.zip}
          </p>
        </div>
        <iframe
          title="Localização da Brasil Multi Tech no mapa"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.zip}`
          )}&output=embed`}
          className="w-full h-64 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
