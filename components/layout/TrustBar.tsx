import { PRICING_RULES } from "@/lib/pricing";

const items = [
  {
    label: "Frete para todo o Brasil",
    icon: (
      <path d="M3 12h13l-3-4h4l4 4v5H3v-5Z M3 12v5 M9 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M16.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    ),
  },
  {
    label: `Até ${PRICING_RULES.maxInstallments}x sem complicação`,
    icon: <path d="M3 7h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z M3 10h18 M7 14h4" />,
  },
  {
    label: "Aprovação facilitada para negativados",
    icon: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z M9.5 12l1.8 1.8L15 10" />,
  },
  {
    label: `${PRICING_RULES.pixDiscountPercent}% de desconto pagando no Pix`,
    icon: <path d="M12 2l3 3-3 3-3-3 3-3Z M12 16l3 3-3 3-3-3 3-3Z M2 12l3-3 3 3-3 3-3-3Z M16 12l3-3 3 3-3 3-3-3Z" />,
  },
];

export function TrustBar() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                {item.icon}
              </svg>
              <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
