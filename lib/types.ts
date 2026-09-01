import type { PlanoParcelamento } from "./pricing";

export type ProductCondition = "novo" | "excelente" | "muito-bom" | "bom" | "outlet";

export type ProductCategorySlug =
  | "celulares"
  | "notebooks"
  | "acessorios"
  | "fones"
  | "caixas-de-som"
  | "smartwatches"
  | "carregadores";

export interface ProductCategory {
  slug: ProductCategorySlug;
  name: string;
  shortLabel: string;
  image: string;
  fromPrice: number;
}

export interface ProductVariant {
  id: string;
  color: string;
  colorHex: string;
  storageGb?: number;
  condition: ProductCondition;
  priceCents: number;
  compareAtCents?: number;
  stock: number;
  images: string[];
  /** Real product photos, filenames relative to /products/. Falls back to the `images` icon set when absent. */
  photos?: string[];
  /** Dimensões da embalagem para cálculo de frete. Se ausentes, usa um fallback conservador. */
  weightGrams?: number;
  widthCm?: number;
  heightCm?: number;
  lengthCm?: number;
}

export interface ProductReview {
  id: string;
  author: string;
  city?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: ProductCategorySlug;
  tagline: string;
  description: string;
  highlights: string[];
  warrantyMonths: number;
  freeShipping: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  reviews: ProductReview[];
  /** Marcado manualmente pelo admin no cadastro — decide o que aparece nas vitrines de destaque (por categoria). */
  emDestaque: boolean;
  /** Opt-in por produto: quando true, mostra a prévia de parcelamento (ver lib/pricing.ts calcularParcelamento). */
  parcelamentoHabilitado: boolean;
  /** Opt-in por produto — só alguns produtos têm desconto no Pix. */
  pixDescontoPercent?: number;
  /** Config global (site_settings), anexada em toda consulta pra quem for calcular parcelamento não precisar buscar de novo. */
  planoParcelamento: PlanoParcelamento;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}
