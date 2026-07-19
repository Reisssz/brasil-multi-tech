import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "../product/ProductCard";
import { Reveal } from "../ui/Reveal";

export function FeaturedOffers() {
  const featured = getFeaturedProducts(8);
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Ofertas em destaque</h2>
            <p className="text-muted mt-1">Preço à vista no Pix ou parcelado sem pesar no bolso.</p>
          </div>
          <Link
            href="/categoria/ofertas"
            className="group text-sm font-semibold text-brand hover:text-brand-dark hidden sm:flex items-center gap-1"
          >
            Ver todas
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
