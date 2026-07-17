import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "../product/ProductCard";

export function FeaturedOffers() {
  const featured = getFeaturedProducts(8);
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Ofertas em destaque</h2>
            <p className="text-muted mt-1">Preço à vista no Pix ou parcelado sem pesar no bolso.</p>
          </div>
          <Link href="/categoria/ofertas" className="text-sm font-semibold text-brand hover:text-brand-dark hidden sm:block">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
