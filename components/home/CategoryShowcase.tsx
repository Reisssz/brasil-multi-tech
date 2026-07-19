import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { getCategoryPhoto } from "@/lib/data/products";
import { formatBRL } from "@/lib/pricing";
import { ProductImage, ProductIconKey } from "../ui/ProductImage";
import { Reveal } from "../ui/Reveal";

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <Reveal className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">O que você prefere?</h2>
          <p className="text-muted mt-1">A escolha é sua — encontre o que precisa em segundos.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 60}>
            <Link
              href={`/categoria/${c.slug}`}
              className="group flex flex-col rounded-2xl bg-surface border border-border hover:border-brand shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 active:scale-[0.98] transition-all overflow-hidden"
            >
              <ProductImage
                icon={c.image as ProductIconKey}
                photoSrc={getCategoryPhoto(c.slug)}
                className="aspect-[4/3] w-full"
              />
              <div className="p-4 flex flex-col gap-0.5">
                <span className="font-semibold text-foreground text-sm group-hover:text-brand-dark transition-colors">
                  {c.name}
                </span>
                <span className="text-xs text-muted">
                  a partir de <span className="font-semibold text-brand-dark">{formatBRL(c.fromPrice)}</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
