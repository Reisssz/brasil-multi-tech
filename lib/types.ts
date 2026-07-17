export type ProductCondition = "novo" | "seminovo";

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
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface InstallmentOption {
  count: number;
  label: string;
  interestFree: boolean;
  installmentCents: number;
  totalCents: number;
}
