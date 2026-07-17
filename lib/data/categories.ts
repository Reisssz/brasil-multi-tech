import { ProductCategory } from "../types";

export const categories: ProductCategory[] = [
  {
    slug: "celulares",
    name: "Celulares",
    shortLabel: "Celulares",
    image: "phone",
    fromPrice: 111672,
  },
  {
    slug: "notebooks",
    name: "Notebooks e tablets",
    shortLabel: "Notebooks",
    image: "laptop",
    fromPrice: 149900,
  },
  {
    slug: "fones",
    name: "Fones de ouvido",
    shortLabel: "Fones",
    image: "earbuds",
    fromPrice: 14900,
  },
  {
    slug: "caixas-de-som",
    name: "Caixas de som",
    shortLabel: "Caixas de som",
    image: "speaker",
    fromPrice: 19900,
  },
  {
    slug: "smartwatches",
    name: "Smartwatches",
    shortLabel: "Smartwatches",
    image: "watch",
    fromPrice: 29900,
  },
  {
    slug: "carregadores",
    name: "Carregadores e power banks",
    shortLabel: "Carregadores",
    image: "charger",
    fromPrice: 6900,
  },
  {
    slug: "acessorios",
    name: "Acessórios",
    shortLabel: "Acessórios",
    image: "accessory",
    fromPrice: 4900,
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
