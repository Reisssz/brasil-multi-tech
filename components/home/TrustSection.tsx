import { SITE } from "@/lib/config";
import { Reveal } from "../ui/Reveal";

const stats = [
  { value: `${(SITE.devicesDelivered / 1000).toFixed(0)}mil+`, label: "aparelhos entregues" },
  { value: `${(SITE.happyCustomers / 1000).toFixed(0)}mil+`, label: "clientes satisfeitos" },
  { value: "6 meses", label: "de garantia em todos os produtos" },
  { value: "7 dias", label: "para troca sem burocracia" },
];

export function TrustSection() {
  return (
    <section className="relative bg-ink overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-brand/10 blur-[100px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:divide-x sm:divide-ink-border">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60} className="flex flex-col gap-1 sm:px-6 first:sm:pl-0">
            <span className="font-display text-2xl sm:text-3xl font-bold text-brand tabular-nums">{s.value}</span>
            <span className="text-xs sm:text-sm text-ink-muted">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
