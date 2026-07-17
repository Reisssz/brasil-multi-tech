import { SITE, whatsappLink } from "@/lib/config";

export const metadata = { title: "Contato" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Fale com a gente</h1>
      <p className="text-muted mb-8">Atendimento rápido e personalizado, direto pelo WhatsApp.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-1 hover:border-brand transition-colors"
        >
          <span className="text-xs text-muted uppercase">WhatsApp</span>
          <span className="font-semibold text-foreground">Clique para conversar</span>
        </a>
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

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-bold text-foreground mb-1">Nossa loja física</h2>
        <p className="text-sm text-muted leading-relaxed">
          {SITE.address.line1}
          <br />
          {SITE.address.line2}
          <br />
          CEP {SITE.address.zip}
        </p>
      </div>
    </div>
  );
}
