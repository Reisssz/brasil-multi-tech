import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const steps = [
  {
    n: "1",
    title: "Escolha o produto",
    text: "Navegue pelos smartphones, notebooks e acessórios com preço e parcelamento sempre visíveis.",
    icon: (
      <path
        d="M9 3h6M12 3v11M6 8l-3 8a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-3-8H6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    n: "2",
    title: "Compre online com segurança",
    text: "Finalize sozinho pelo carrinho, com Pix, boleto ou cartão parcelado — processado pelo Mercado Pago.",
    icon: (
      <path
        d="M4 4h16v12H8l-4 4V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
  {
    n: "3",
    title: "Receba com garantia",
    text: "Aparelho testado, embalado com cuidado e entregue para todo o Brasil, com garantia de verdade.",
    icon: (
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z M9.5 12l1.8 1.8L15 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <Reveal className="text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Como funciona a compra</h2>
        <p className="text-muted mt-1">Simples, rápido e do jeito que for melhor para você.</p>
      </Reveal>

      <div className="grid sm:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 100} className="relative rounded-2xl bg-surface border border-border p-6 flex flex-col items-center text-center gap-3">
            <span className="absolute top-4 right-4 font-display text-3xl font-bold text-border select-none">
              {s.n}
            </span>
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-light text-brand-dark">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                {s.icon}
              </svg>
            </span>
            <h3 className="font-bold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{s.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200} className="mt-8 flex items-center justify-center">
        <Link
          href="/categoria/ofertas"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 px-7 w-full sm:w-auto transition-colors active:scale-95"
        >
          Ver produtos
        </Link>
      </Reveal>
    </section>
  );
}
