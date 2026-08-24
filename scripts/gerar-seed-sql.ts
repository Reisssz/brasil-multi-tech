import { categories } from "../lib/data/categories";
import { products } from "../lib/data/products";

function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJsonArray(arr: string[]): string {
  return `'${JSON.stringify(arr).replace(/'/g, "''")}'::jsonb`;
}

const linhas: string[] = [];

linhas.push("-- ===== CATEGORIAS =====");
categories.forEach((c, i) => {
  linhas.push(
    `insert into public.categories (slug, nome, short_label, ordem) values (${sqlString(c.slug)}, ${sqlString(
      c.name
    )}, ${sqlString(c.shortLabel)}, ${i}) on conflict (slug) do update set nome = excluded.nome, short_label = excluded.short_label, ordem = excluded.ordem;`
  );
});

linhas.push("");
linhas.push("-- ===== PRODUTOS E VARIANTES =====");

products.forEach((p) => {
  linhas.push(
    `insert into public.products (slug, brand, name, category_id, tagline, description, highlights, warranty_months, free_shipping, ativo)
     values (
       ${sqlString(p.slug)}, ${sqlString(p.brand)}, ${sqlString(p.name)},
       (select id from public.categories where slug = ${sqlString(p.category)}),
       ${sqlString(p.tagline)}, ${sqlString(p.description)}, ${sqlJsonArray(p.highlights)},
       ${p.warrantyMonths}, ${p.freeShipping}, true
     )
     on conflict (slug) do update set
       brand = excluded.brand, name = excluded.name, category_id = excluded.category_id,
       tagline = excluded.tagline, description = excluded.description, highlights = excluded.highlights,
       warranty_months = excluded.warranty_months, free_shipping = excluded.free_shipping, ativo = true;`
  );

  p.variants.forEach((v) => {
    const photos = v.photos ?? [];
    linhas.push(
      `insert into public.product_variants (product_id, color, color_hex, storage_gb, condition, price_cents, compare_at_cents, stock, photos, sku)
       values (
         (select id from public.products where slug = ${sqlString(p.slug)}),
         ${sqlString(v.color)}, ${sqlString(v.colorHex)}, ${v.storageGb ?? "null"}, ${sqlString(v.condition)},
         ${v.priceCents}, ${v.compareAtCents ?? "null"}, ${v.stock}, ${sqlJsonArray(photos)}, ${sqlString(v.id)}
       )
       on conflict (sku) do update set
         price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents,
         stock = excluded.stock, photos = excluded.photos;`
    );
  });
});

console.log(linhas.join("\n"));
