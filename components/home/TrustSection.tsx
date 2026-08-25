import Link from "next/link";
import { StarRating } from "../ui/StarRating";
import { SITE } from "@/lib/config";
import { products } from "@/lib/data/products";
import { Reveal } from "../ui/Reveal";

const stats = [
  { value: `${(SITE.devicesDelivered / 1000).toFixed(0)}mil+`, label: "aparelhos entregues" },
  { value: `${(SITE.happyCustomers / 1000).toFixed(0)}mil+`, label: "clientes satisfeitos" },
  { value: "6 meses", label: "de garantia em todos os produtos" },
  { value: "7 dias", label: "para troca sem burocracia" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TrustSection() {
  const testimonials = products.flatMap((p) =>
    p.reviews.map((r) => ({ review: r, productName: `${p.brand} ${p.name}`, productSlug: p.slug }))
  );
  const featured = testimonials.slice(0, 6);

  return (
    <>
      <section className="relative bg-ink overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-brand/10 blur-[100px]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:divide-x sm:divide-ink-border">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 60}
              className="flex flex-col gap-1 sm:px-6 first:sm:pl-0"
            >
              <span className="font-display text-2xl sm:text-3xl font-bold text-brand tabular-nums">{s.value}</span>
              <span className="text-xs sm:text-sm text-ink-muted">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Quem compra, recomenda</h2>
            <p className="text-muted mt-1">Avaliações reais de clientes verificados.</p>
          </div>
          <StarRating rating={SITE.averageRating} size="md" />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(({ review: r, productName, productSlug }, i) => (
            <Reveal
              key={r.id}
              delay={(i % 3) * 70}
              className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-light text-brand-dark text-xs font-bold shrink-0">
                  {initials(r.author)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{r.author}</span>
                  <span className="text-xs text-muted">{r.city ?? (r.verified ? "Compra verificada" : "Cliente")}</span>
                </div>
              </div>
              <StarRating rating={r.rating} />
              <p className="text-sm text-muted leading-relaxed">{r.comment}</p>
              <Link
                href={`/produto/${productSlug}`}
                className="text-xs font-semibold text-brand-dark hover:underline underline-offset-2 mt-auto pt-1"
              >
                Produto escolhido: {productName}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
