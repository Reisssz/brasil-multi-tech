import Link from "next/link";
import { getVitrineDb, getOfertasAppleDb } from "@/lib/data/products-db";
import { ProductCard } from "../product/ProductCard";
import { Reveal } from "../ui/Reveal";

const GRID_5_COLUNAS = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5";

export async function FeaturedOffers() {
  const [ofertasApple, vitrine] = await Promise.all([getOfertasAppleDb(5), getVitrineDb(10)]);

  if (ofertasApple.length === 0 && vitrine.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 flex flex-col gap-12">
        {ofertasApple.length > 0 && (
          <div>
            <Reveal className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Ofertas Apple</h2>
                <p className="text-muted mt-1">iPhones com desconto ativo agora.</p>
              </div>
            </Reveal>
            <div className={GRID_5_COLUNAS}>
              {ofertasApple.map((p, i) => (
                <Reveal key={p.id} delay={(i % 5) * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {vitrine.length > 0 && (
          <div>
            <Reveal className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Ofertas em destaque</h2>
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
            <div className={GRID_5_COLUNAS}>
              {vitrine.map((p, i) => (
                <Reveal key={p.id} delay={(i % 5) * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
