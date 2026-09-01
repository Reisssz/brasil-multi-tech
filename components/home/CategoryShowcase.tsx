import Link from "next/link";
import { getCategoriesForShowcaseDb, getCategoryPhotoDb } from "@/lib/data/products-db";
import { formatBRL } from "@/lib/pricing";
import { ProductImage, ProductIconKey } from "../ui/ProductImage";
import { Reveal } from "../ui/Reveal";

export async function CategoryShowcase() {
  const categories = await getCategoriesForShowcaseDb();
  if (categories.length === 0) return null;

  const [featured, ...rest] = categories;
  const [featuredPhoto, ...restPhotos] = await Promise.all([
    getCategoryPhotoDb(featured.slug),
    ...rest.map((c) => getCategoryPhotoDb(c.slug)),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <Reveal className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">O que você prefere?</h2>
          <p className="text-muted mt-1">A escolha é sua — encontre o que precisa em segundos.</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 gap-4">
        <Reveal className="col-span-2 sm:col-span-3 lg:col-span-1 lg:row-span-2">
          <Link
            href={`/categoria/${featured.slug}`}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface border-2 border-brand/60 hover:border-brand shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] h-full transition-all"
          >
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground text-[11px] font-bold uppercase tracking-wide px-2.5 py-1">
              Mais procurado
            </span>
            <ProductImage
              icon={featured.image as ProductIconKey}
              photoSrc={featuredPhoto}
              tint="white"
              className="flex-1 min-h-[180px] lg:min-h-0 w-full"
            />
            <div className="p-5 flex items-end justify-between gap-2 bg-surface">
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-xl font-bold text-foreground">{featured.name}</span>
                <span className="text-sm text-muted">
                  a partir de <span className="font-semibold text-brand-dark">{formatBRL(featured.fromPrice)}</span>
                </span>
              </div>
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand text-brand-foreground shrink-0 transition-transform group-hover:translate-x-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        </Reveal>

        {rest.map((c, i) => (
          <Reveal key={c.slug} delay={i * 60}>
            <Link
              href={`/categoria/${c.slug}`}
              className="group flex flex-col rounded-2xl bg-surface border border-border hover:border-brand shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 active:scale-[0.98] transition-all overflow-hidden"
            >
              <ProductImage
                icon={c.image as ProductIconKey}
                photoSrc={restPhotos[i]}
                tint="white"
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
