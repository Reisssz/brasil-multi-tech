import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Product, ProductCategory, ProductCategorySlug, ProductCondition, ProductVariant } from "@/lib/types";
import type { ProductIconKey } from "@/components/ui/ProductImage";

const ICONE_POR_CATEGORIA: Record<string, ProductIconKey> = {
  celulares: "phone",
  notebooks: "laptop",
  acessorios: "accessory",
  fones: "earbuds",
  "caixas-de-som": "speaker",
  smartwatches: "watch",
  carregadores: "charger",
};

/** Categorias sugeridas como combo ao lado de cada categoria principal. */
const COMPLEMENTOS_POR_CATEGORIA: Record<string, string[]> = {
  celulares: ["carregadores", "fones", "acessorios"],
  notebooks: ["acessorios", "fones"],
  smartwatches: ["acessorios", "carregadores"],
  fones: ["acessorios", "carregadores"],
  "caixas-de-som": ["acessorios", "carregadores"],
  carregadores: ["acessorios", "fones"],
  acessorios: ["fones", "carregadores"],
};

/**
 * `photos` guarda ou um nome de arquivo relativo a /public/products/ (fotos
 * de catálogo antigas, migradas do mock) ou uma URL absoluta do Supabase
 * Storage (fotos enviadas pelo admin). getMainPhoto/getPhotoAt em
 * lib/data/products.ts só sabem prefixar `/products/` — então aqui a gente
 * já entrega o valor pronto pro uso, sem precisar mexer nessas funções.
 */
type LinhaVariante = {
  id: string;
  color: string | null;
  color_hex: string;
  storage_gb: number | null;
  condition: string;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  photos: string[];
  sku: string | null;
  weight_grams: number;
  width_cm: number;
  height_cm: number;
  length_cm: number;
};

type LinhaProduto = {
  id: string;
  slug: string;
  brand: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  highlights: string[];
  warranty_months: number;
  free_shipping: boolean;
  ativo: boolean;
  category_id: string | null;
  categories: { slug: string; nome: string } | null;
  product_variants: LinhaVariante[];
};

const SELECT_PRODUTO_COMPLETO = `
  id, slug, brand, name, tagline, description, highlights, warranty_months,
  free_shipping, ativo, category_id,
  categories ( slug, nome ),
  product_variants ( id, color, color_hex, storage_gb, condition, price_cents,
    compare_at_cents, stock, photos, sku, weight_grams, width_cm, height_cm, length_cm )
`;

function mapearVariante(v: LinhaVariante): ProductVariant {
  return {
    id: v.id,
    color: v.color ?? "Padrão",
    colorHex: v.color_hex,
    storageGb: v.storage_gb ?? undefined,
    condition: v.condition as ProductCondition,
    priceCents: v.price_cents,
    compareAtCents: v.compare_at_cents ?? undefined,
    stock: v.stock,
    images: [],
    photos: v.photos ?? [],
    weightGrams: v.weight_grams,
    widthCm: v.width_cm,
    heightCm: v.height_cm,
    lengthCm: v.length_cm,
  };
}

function mapearProduto(row: LinhaProduto): Product {
  const categorySlug = (row.categories?.slug ?? "acessorios") as ProductCategorySlug;
  const icone = ICONE_POR_CATEGORIA[categorySlug] ?? "accessory";

  const variants = (row.product_variants ?? []).map((v) => {
    const variante = mapearVariante(v);
    // Fallback de ícone por categoria quando a variante ainda não tem foto real.
    variante.images = [icone];
    return variante;
  });

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand ?? "",
    name: row.name,
    category: categorySlug,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    warrantyMonths: row.warranty_months,
    freeShipping: row.free_shipping,
    rating: 0,
    reviewCount: 0,
    variants: variants.length > 0 ? variants : [placeholderVariant()],
    reviews: [],
  };
}

function placeholderVariant(): ProductVariant {
  // Nunca deveria acontecer (produto sem nenhuma variante) — existe só para
  // os componentes que assumem `variants[0]` sempre existir não quebrarem.
  return {
    id: "sem-variante",
    color: "Padrão",
    colorHex: "#9aa0a6",
    condition: "novo",
    priceCents: 0,
    stock: 0,
    images: ["accessory"],
    photos: [],
  };
}

export async function getFeaturedProductsDb(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUTO_COMPLETO)
    .eq("ativo", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[products-db] getFeaturedProductsDb:", error.message);
    return [];
  }
  return (data as unknown as LinhaProduto[]).map(mapearProduto);
}

export async function getProductBySlugForMetadataDb(slug: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUTO_COMPLETO)
    .eq("slug", slug)
    .eq("ativo", true)
    .single();

  if (error || !data) return null;
  return mapearProduto(data as unknown as LinhaProduto);
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUTO_COMPLETO)
    .eq("slug", slug)
    .eq("ativo", true)
    .single();

  if (error || !data) return null;
  return mapearProduto(data as unknown as LinhaProduto);
}

export async function getProductsByCategoryDb(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase.from("products").select(SELECT_PRODUTO_COMPLETO).eq("ativo", true);

  if (categorySlug !== "ofertas") {
    const { data: categoria } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (!categoria) return [];
    query = query.eq("category_id", categoria.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("[products-db] getProductsByCategoryDb:", error.message);
    return [];
  }

  const produtos = (data as unknown as LinhaProduto[]).map(mapearProduto);

  if (categorySlug === "ofertas") {
    return produtos.filter((p) => p.variants.some((v) => v.compareAtCents && v.compareAtCents > v.priceCents));
  }
  return produtos;
}

export async function getRelatedProductsDb(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUTO_COMPLETO)
    .eq("ativo", true)
    .neq("id", product.id)
    .limit(limit);

  if (error) return [];
  return (data as unknown as LinhaProduto[]).map(mapearProduto);
}

export type SugestaoCombo = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  variantId: string;
  priceCents: number;
  compareAtCents: number | null;
  photoUrl: string | null;
  icone: ProductIconKey;
};

/**
 * Sugestão de combo: dado um conjunto de categorias já presentes no
 * carrinho/produto que o cliente está vendo, recomenda produtos de
 * categorias complementares (ex: celular → carregador, fone, acessório).
 * Nunca sugere um produto de uma categoria que o cliente já está levando,
 * nem repete um produto já no carrinho.
 */
export async function getComboSuggestionsDb(
  categoriasBase: string[],
  excluirProductIds: string[] = [],
  limit = 3
): Promise<SugestaoCombo[]> {
  const categoriasComplementares = new Set<string>();
  for (const cat of categoriasBase) {
    (COMPLEMENTOS_POR_CATEGORIA[cat] ?? []).forEach((c) => {
      if (!categoriasBase.includes(c)) categoriasComplementares.add(c);
    });
  }

  if (categoriasComplementares.size === 0) return [];

  const supabase = createAdminClient();

  const { data: categorias } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", Array.from(categoriasComplementares));

  const idsCategorias = (categorias ?? []).map((c) => c.id);
  if (idsCategorias.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, brand, category_id, categories ( slug ),
       product_variants ( id, price_cents, compare_at_cents, stock, photos )`
    )
    .eq("ativo", true)
    .in("category_id", idsCategorias)
    .not(
      "id",
      "in",
      `(${(excluirProductIds.length > 0 ? excluirProductIds : ["00000000-0000-0000-0000-000000000000"]).join(",")})`
    )
    .limit(limit * 3);

  if (error || !data) {
    console.error("[products-db] getComboSuggestionsDb:", error?.message);
    return [];
  }

  const sugestoes = (data as unknown as LinhaProduto[])
    .map((row) => {
      const variantesComEstoque = (row.product_variants ?? []).filter((v) => v.stock > 0);
      const variante = variantesComEstoque.sort((a, b) => a.price_cents - b.price_cents)[0];
      if (!variante) return null;

      const categorySlug = row.categories?.slug ?? "acessorios";
      const foto = variante.photos?.[0];

      const sugestao: SugestaoCombo = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brand: row.brand ?? "",
        category: categorySlug,
        variantId: variante.id,
        priceCents: variante.price_cents,
        compareAtCents: variante.compare_at_cents,
        photoUrl: foto ? (/^https?:\/\//.test(foto) ? foto : `/products/${foto}`) : null,
        icone: ICONE_POR_CATEGORIA[categorySlug] ?? "accessory",
      };
      return sugestao;
    })
    .filter((s): s is SugestaoCombo => s !== null)
    .slice(0, limit);

  return sugestoes;
}

export async function getCategoryNameBySlugDb(slug: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("categories").select("nome").eq("slug", slug).single();
  return data?.nome ?? null;
}

export type CategoriaDb = {
  id: string;
  slug: string;
  nome: string;
  shortLabel: string | null;
  image: string | null;
  fromPriceCents: number;
};

export async function getCategoriesDb(): Promise<CategoriaDb[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, nome, short_label, image, from_price_cents")
    .order("ordem");

  if (error) {
    console.error("[products-db] getCategoriesDb:", error.message);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    shortLabel: c.short_label,
    image: c.image,
    fromPriceCents: c.from_price_cents,
  }));
}

/**
 * Mesmo dado de getCategoriesDb(), mas já no formato `ProductCategory`
 * (lib/types.ts) que os componentes de vitrine (CategoryShowcase, Header,
 * Footer) já esperavam do mock — só troca a fonte, não o contrato.
 */
export async function getCategoriesForShowcaseDb(): Promise<ProductCategory[]> {
  const supabase = await createClient();

  const { data: categorias, error } = await supabase
    .from("categories")
    .select("slug, nome, short_label")
    .order("ordem");

  if (error || !categorias) return [];

  const { data: variantes } = await supabase
    .from("product_variants")
    .select("price_cents, products!inner ( category_id, ativo, categories ( slug ) )")
    .eq("products.ativo", true);

  const menorPrecoPorSlug = new Map<string, number>();
  (variantes ?? []).forEach((v) => {
    const produtosRel = Array.isArray(v.products) ? v.products[0] : v.products;
    const categoriasRel = produtosRel?.categories;
    const slug = Array.isArray(categoriasRel) ? categoriasRel[0]?.slug : (categoriasRel as { slug: string } | null)?.slug;
    if (!slug) return;
    const atual = menorPrecoPorSlug.get(slug);
    if (atual === undefined || v.price_cents < atual) menorPrecoPorSlug.set(slug, v.price_cents);
  });

  return categorias.map((c) => ({
    slug: c.slug as ProductCategorySlug,
    name: c.nome,
    shortLabel: c.short_label ?? c.nome,
    image: ICONE_POR_CATEGORIA[c.slug] ?? "accessory",
    fromPrice: menorPrecoPorSlug.get(c.slug) ?? 0,
  }));
}

/** Primeira foto real encontrada entre os produtos de uma categoria (para os tiles de vitrine). */
export async function getCategoryPhotoDb(categorySlug: string): Promise<string | undefined> {
  const supabase = await createClient();

  const { data: categoria } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
  if (!categoria) return undefined;

  const { data } = await supabase
    .from("product_variants")
    .select("photos, products!inner ( category_id, ativo )")
    .eq("products.category_id", categoria.id)
    .eq("products.ativo", true)
    .limit(20);

  for (const row of data ?? []) {
    const foto = (row as { photos: string[] }).photos?.[0];
    if (foto) return /^https?:\/\//.test(foto) ? foto : `/products/${foto}`;
  }
  return undefined;
}
export async function getAllActiveProductsForCache(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select(SELECT_PRODUTO_COMPLETO).eq("ativo", true);

  if (error) {
    console.error("[products-db] getAllActiveProductsForCache:", error.message);
    return [];
  }
  return (data as unknown as LinhaProduto[]).map(mapearProduto);
}
