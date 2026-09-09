import Link from "next/link";
import { StarRating } from "../ui/StarRating";
import { SITE } from "@/lib/config";
import { products } from "@/lib/data/products";
import { Reveal } from "../ui/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Depoimentos() {
  const testimonials = products.flatMap((p) =>
    p.reviews.map((r) => ({ review: r, productName: `${p.brand} ${p.name}`, productSlug: p.slug }))
  );
  const featured = testimonials.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-14">
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
  );
}
