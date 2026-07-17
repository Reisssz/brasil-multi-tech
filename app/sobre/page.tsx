import { SITE, whatsappLink } from "@/lib/config";

export const metadata = { title: "Sobre nós" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Sobre a Brasil Multi Tech</h1>
      <p className="text-muted mb-8">{SITE.slogan}</p>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-bold text-foreground mb-2">Quem somos</h2>
          <p className="text-sm text-muted leading-relaxed">
            A Brasil Multi Tech é uma loja especializada em smartphones e tecnologia, com {SITE.yearsInBusiness}{" "}
            anos de mercado e loja física em Belém - PA. Trabalhamos com iPhone, Xiaomi, Samsung, Realme,
            Motorola, smartwatches, fones Bluetooth e acessórios premium, sempre com preços acessíveis,
            garantia de verdade e facilidade no pagamento — inclusive para quem está negativado ou não tem
            cartão de crédito.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-bold text-foreground mb-2">O que oferecemos</h2>
          <ul className="flex flex-col gap-2">
            {[
              "Smartphones com garantia",
              "Parcelamento facilitado",
              "Aprovação para negativados",
              "Acessórios premium com qualidade e garantia",
              "Assistência técnica (troca de tela e bateria)",
              "Atendimento rápido e personalizado",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 text-success shrink-0">
                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-foreground">Visite nossa loja física</h2>
            <p className="text-sm text-muted">{SITE.address.line1}, {SITE.address.line2}</p>
          </div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
