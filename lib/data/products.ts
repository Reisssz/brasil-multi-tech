import { Product } from "../types";

function makeReviews(seed: string): Product["reviews"] {
  const pool = [
    {
      author: "Camila R.",
      city: "Belém - PA",
      rating: 5 as const,
      comment: "Chegou antes do prazo e o aparelho parece novo. Recomendo demais.",
    },
    {
      author: "Diego A.",
      city: "Ananindeua - PA",
      rating: 5 as const,
      comment: "Já é o segundo que compro aqui, garantia realmente funciona.",
    },
    {
      author: "Fernanda L.",
      city: "Marituba - PA",
      rating: 4 as const,
      comment: "Bateria durou menos do que eu esperava, mas o suporte resolveu rápido.",
    },
    {
      author: "Bruno S.",
      city: "Belém - PA",
      rating: 5 as const,
      comment: "Preço no Pix compensou muito, veio com nota fiscal e acessórios originais.",
    },
  ];
  return pool.map((r, i) => ({
    id: `${seed}-review-${i}`,
    date: new Date(2026, 5 - i, 10 + i).toISOString(),
    verified: true,
    ...r,
  }));
}

export const products: Product[] = [
  {
    id: "p-iphone-11",
    slug: "iphone-11-seminovo",
    brand: "Apple",
    name: "iPhone 11",
    category: "celulares",
    tagline: "Seminovo com selo de qualidade e garantia de 12 meses",
    description:
      "iPhone 11 revisado por técnicos certificados, com bateria testada e reset completo de fábrica. Aparelho desbloqueado para qualquer operadora.",
    highlights: [
      "Bateria com no mínimo 85% de capacidade",
      "Tela e câmera testadas em laudo de 40 pontos",
      "Acompanha cabo de carregamento",
    ],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.7,
    reviewCount: 268,
    variants: [
      {
        id: "v-iphone11-white-64-seminovo",
        color: "Branco",
        colorHex: "#f2f1ec",
        storageGb: 64,
        condition: "seminovo",
        priceCents: 111672,
        compareAtCents: 139900,
        stock: 16,
        images: ["phone", "phone", "phone"],
        photos: [
          "iphone11-white-1.webp",
          "iphone11-white-2.webp",
          "iphone11-white-3.webp",
          "iphone11-white-4.webp",
        ],
      },
    ],
    reviews: makeReviews("iphone-11"),
  },
  {
    id: "p-iphone-11-pro-max",
    slug: "iphone-11-pro-max-seminovo",
    brand: "Apple",
    name: "iPhone 11 Pro Max",
    category: "celulares",
    tagline: "Seminovo, câmera tripla, tela grande",
    description:
      "iPhone 11 Pro Max seminovo com sistema de câmera tripla de 12MP, tela Super Retina XDR e bateria testada. Revisado por técnicos certificados.",
    highlights: ["Câmera tripla 12MP", "Bateria testada acima de 85%", "Garantia de 12 meses"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.8,
    reviewCount: 94,
    variants: [
      {
        id: "v-iphone11promax-gray-256-seminovo",
        color: "Cinza espacial",
        colorHex: "#4b4d50",
        storageGb: 256,
        condition: "seminovo",
        priceCents: 219900,
        compareAtCents: 269900,
        stock: 5,
        images: ["phone", "phone"],
        photos: ["iphone11promax-gray-1.jpeg"],
      },
    ],
    reviews: makeReviews("iphone-11-pro-max"),
  },
  {
    id: "p-iphone-12",
    slug: "iphone-12-seminovo",
    brand: "Apple",
    name: "iPhone 12",
    category: "celulares",
    tagline: "Seminovo revisado, tela OLED e 5G",
    description:
      "iPhone 12 seminovo com tela Super Retina XDR OLED, conectividade 5G e bateria testada. Aparelho revisado e desbloqueado.",
    highlights: ["Conectividade 5G", "Tela OLED Super Retina", "Garantia de 12 meses"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.8,
    reviewCount: 156,
    variants: [
      {
        id: "v-iphone12-black-128-seminovo",
        color: "Preto",
        colorHex: "#1c1c1e",
        storageGb: 128,
        condition: "seminovo",
        priceCents: 156552,
        compareAtCents: 189900,
        stock: 9,
        images: ["phone", "phone"],
        photos: ["iphone12-black-1.png"],
      },
    ],
    reviews: makeReviews("iphone-12"),
  },
  {
    id: "p-iphone-13",
    slug: "iphone-13-seminovo",
    brand: "Apple",
    name: "iPhone 13",
    category: "celulares",
    tagline: "Seminovo com selo de qualidade e garantia de 12 meses",
    description:
      "iPhone 13 revisado por técnicos certificados, com bateria testada acima de 85% de capacidade e reset completo de fábrica. Aparelho desbloqueado para qualquer operadora.",
    highlights: [
      "Bateria com no mínimo 85% de capacidade",
      "Tela e câmera testadas em laudo de 40 pontos",
      "Acompanha cabo USB-C original",
    ],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.8,
    reviewCount: 312,
    variants: [
      {
        id: "v-iphone13-midnight-128-seminovo",
        color: "Meia-noite",
        colorHex: "#1c1e26",
        storageGb: 128,
        condition: "seminovo",
        priceCents: 192632,
        compareAtCents: 249900,
        stock: 14,
        images: ["phone", "phone", "phone"],
        photos: [
          "iphone13-midnight-1.webp",
          "iphone13-midnight-2.webp",
          "iphone13-midnight-3.webp",
          "iphone13-midnight-4.webp",
        ],
      },
      {
        id: "v-iphone13-blue-256-seminovo",
        color: "Azul",
        colorHex: "#4f6d9a",
        storageGb: 256,
        condition: "seminovo",
        priceCents: 219900,
        compareAtCents: 269900,
        stock: 6,
        images: ["phone", "phone"],
      },
    ],
    reviews: makeReviews("iphone-13"),
  },
  {
    id: "p-galaxy-s23",
    slug: "galaxy-s23-seminovo",
    brand: "Samsung",
    name: "Galaxy S23",
    category: "celulares",
    tagline: "Seminovo revisado, câmera de 50MP e tela 120Hz",
    description:
      "Galaxy S23 seminovo com verificação de 40 pontos, tela Dynamic AMOLED 120Hz e desempenho Snapdragon 8 Gen 2.",
    highlights: ["Testado em 40 pontos de qualidade", "Sem riscos visíveis a 30cm", "Garantia de 12 meses"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.7,
    reviewCount: 145,
    variants: [
      {
        id: "v-s23-green-256-seminovo",
        color: "Verde",
        colorHex: "#8a9a7e",
        storageGb: 256,
        condition: "seminovo",
        priceCents: 247192,
        compareAtCents: 299900,
        stock: 11,
        images: ["phone", "phone"],
      },
    ],
    reviews: makeReviews("galaxy-s23"),
  },
  {
    id: "p-redmi-note",
    slug: "redmi-note-novo",
    brand: "Xiaomi",
    name: "Redmi Note",
    category: "celulares",
    tagline: "Novo, lacrado, disponível em várias cores",
    description:
      "Redmi Note com tela AMOLED de alta taxa de atualização, câmera de alta resolução e carregamento rápido. Disponível em várias cores. Ideal para quem busca desempenho sem gastar muito.",
    highlights: ["Tela AMOLED", "Carregamento rápido", "Lacrado com nota fiscal"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.6,
    reviewCount: 98,
    variants: [
      {
        id: "v-redminote-preto-128-novo",
        color: "Preto",
        colorHex: "#20232a",
        storageGb: 128,
        condition: "novo",
        priceCents: 129900,
        compareAtCents: 149900,
        stock: 20,
        images: ["phone", "phone"],
        photos: ["redmi-note-cores-1.webp"],
      },
    ],
    reviews: makeReviews("redmi-note"),
  },
  {
    id: "p-realme",
    slug: "realme-novo",
    brand: "Realme",
    name: "Realme",
    category: "celulares",
    tagline: "Novo, lacrado, câmera tripla",
    description:
      "Smartphone Realme novo e lacrado, com câmera tripla, design premium e ótimo custo-benefício.",
    highlights: ["Câmera tripla", "Design premium", "Lacrado com nota fiscal"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.5,
    reviewCount: 47,
    variants: [
      {
        id: "v-realme-rosa-128-novo",
        color: "Rosa",
        colorHex: "#e7c3ce",
        storageGb: 128,
        condition: "novo",
        priceCents: 139900,
        stock: 10,
        images: ["phone", "phone"],
        photos: ["realme-cores-1.webp"],
      },
      {
        id: "v-realme-azul-128-novo",
        color: "Azul-marinho",
        colorHex: "#232a45",
        storageGb: 128,
        condition: "novo",
        priceCents: 139900,
        stock: 8,
        images: ["phone", "phone"],
        photos: ["realme-cores-1.webp"],
      },
    ],
    reviews: makeReviews("realme"),
  },
  {
    id: "p-dell-i3",
    slug: "notebook-dell-i3-seminovo",
    brand: "Dell",
    name: "Notebook Dell (Intel Core i3)",
    category: "notebooks",
    tagline: "Seminovo revisado, ideal para trabalho e estudos",
    description:
      "Notebook Dell seminovo com processador Intel Core i3 de 7ª geração, revisado e testado. Ótimo custo-benefício para o dia a dia, trabalho remoto e estudos.",
    highlights: ["Intel Core i3 7ª geração", "Revisado e testado", "Garantia de 12 meses"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.6,
    reviewCount: 41,
    variants: [
      {
        id: "v-dell-i3-preto-seminovo",
        color: "Preto",
        colorHex: "#1d1d1f",
        condition: "seminovo",
        priceCents: 149900,
        compareAtCents: 189900,
        stock: 6,
        images: ["laptop", "laptop"],
        photos: ["dell-i3-seminovo-1.webp", "dell-i3-seminovo-2.webp", "dell-i3-seminovo-3.webp"],
      },
    ],
    reviews: makeReviews("dell-i3"),
  },
  {
    id: "p-acer-aspire",
    slug: "acer-aspire-novo",
    brand: "Acer",
    name: "Acer Aspire 3",
    category: "notebooks",
    tagline: "Novo, ideal para trabalho e estudos",
    description:
      "Notebook Acer Aspire 3 novo, com bom desempenho para o dia a dia, home office e estudos. Lacrado com nota fiscal.",
    highlights: ["Leve e portátil", "Ótimo para o dia a dia", "Lacrado com nota fiscal"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.5,
    reviewCount: 33,
    variants: [
      {
        id: "v-acer-aspire-prata-novo",
        color: "Prata",
        colorHex: "#c7c9cc",
        condition: "novo",
        priceCents: 259900,
        stock: 7,
        images: ["laptop", "laptop"],
        photos: ["acer-aspire-1.webp"],
      },
    ],
    reviews: makeReviews("acer-aspire"),
  },
  {
    id: "p-redmi-pad-2",
    slug: "redmi-pad-2-novo",
    brand: "Xiaomi",
    name: "Redmi Pad 2",
    category: "notebooks",
    tagline: "Tablet novo, tela grande, lacrado",
    description:
      "Tablet Redmi Pad 2 novo e lacrado, com tela grande, ótima autonomia de bateria e desempenho equilibrado para vídeo, estudo e trabalho.",
    highlights: ["Tela grande de alta resolução", "Ótima autonomia de bateria", "Lacrado com nota fiscal"],
    warrantyMonths: 12,
    freeShipping: true,
    rating: 4.6,
    reviewCount: 28,
    variants: [
      {
        id: "v-redmipad2-cinza-novo",
        color: "Cinza",
        colorHex: "#6b6d72",
        condition: "novo",
        priceCents: 149900,
        stock: 12,
        images: ["laptop", "laptop"],
        photos: ["redmi-pad-2-1.png"],
      },
    ],
    reviews: makeReviews("redmi-pad-2"),
  },
  {
    id: "p-fone-bluetooth",
    slug: "fone-bluetooth-novo",
    brand: "Brasil Multi Tech",
    name: "Fone Bluetooth Premium",
    category: "fones",
    tagline: "Sem fio, cancelamento de ruído, lacrado",
    description:
      "Fone de ouvido Bluetooth com cancelamento de ruído, boa autonomia de bateria e conforto para uso prolongado.",
    highlights: ["Cancelamento de ruído", "Boa autonomia de bateria", "Lacrado com nota fiscal"],
    warrantyMonths: 6,
    freeShipping: false,
    rating: 4.5,
    reviewCount: 87,
    variants: [
      {
        id: "v-fonebt-preto-novo",
        color: "Preto",
        colorHex: "#161616",
        condition: "novo",
        priceCents: 14900,
        compareAtCents: 19900,
        stock: 30,
        images: ["earbuds", "earbuds"],
      },
    ],
    reviews: makeReviews("fone-bluetooth"),
  },
  {
    id: "p-caixa-de-som",
    slug: "caixa-de-som-bluetooth-novo",
    brand: "Brasil Multi Tech",
    name: "Caixa de Som Bluetooth",
    category: "caixas-de-som",
    tagline: "Portátil, à prova d'água, som potente",
    description: "Caixa de som Bluetooth portátil, resistente à água, com boa autonomia de bateria.",
    highlights: ["Resistente à água", "Boa autonomia de bateria", "Portátil"],
    warrantyMonths: 6,
    freeShipping: false,
    rating: 4.5,
    reviewCount: 52,
    variants: [
      {
        id: "v-caixasom-preto-novo",
        color: "Preto",
        colorHex: "#1a1a1a",
        condition: "novo",
        priceCents: 19900,
        stock: 18,
        images: ["speaker", "speaker"],
      },
    ],
    reviews: makeReviews("caixa-de-som"),
  },
  {
    id: "p-smartwatch",
    slug: "smartwatch-novo",
    brand: "Brasil Multi Tech",
    name: "Smartwatch Fitness",
    category: "smartwatches",
    tagline: "Monitor de saúde e notificações no pulso",
    description:
      "Smartwatch com monitor de frequência cardíaca, notificações do celular e diversos modos esportivos.",
    highlights: ["Monitor de frequência cardíaca", "Notificações do celular", "Resistente à água"],
    warrantyMonths: 6,
    freeShipping: true,
    rating: 4.4,
    reviewCount: 39,
    variants: [
      {
        id: "v-smartwatch-preto-novo",
        color: "Preto",
        colorHex: "#232323",
        condition: "novo",
        priceCents: 29900,
        stock: 16,
        images: ["watch", "watch"],
      },
    ],
    reviews: makeReviews("smartwatch"),
  },
  {
    id: "p-peining-powerbank",
    slug: "power-bank-peining-10000mah",
    brand: "Peining",
    name: "Power Bank 10000mAh com cabos integrados",
    category: "carregadores",
    tagline: "Carregamento rápido, cabos embutidos, display digital",
    description:
      "Power bank de 10.000mAh com cabos Lightning, USB-C e micro-USB já integrados, display digital de carga e certificação Anatel.",
    highlights: ["10.000mAh", "Cabos integrados (Lightning, USB-C, micro-USB)", "Display digital de carga"],
    warrantyMonths: 6,
    freeShipping: false,
    rating: 4.6,
    reviewCount: 64,
    variants: [
      {
        id: "v-peining-powerbank10000-preto-novo",
        color: "Preto",
        colorHex: "#1c1c1c",
        condition: "novo",
        priceCents: 8900,
        compareAtCents: 11900,
        stock: 40,
        images: ["charger", "charger"],
        photos: ["peining-powerbank-1.jpeg"],
      },
    ],
    reviews: makeReviews("peining-powerbank"),
  },
  {
    id: "p-peining-charger",
    slug: "carregador-peining-20w",
    brand: "Peining",
    name: "Carregador 20W + Cabo USB-C/Lightning",
    category: "carregadores",
    tagline: "Carregamento rápido para iPhone, com cabo incluso",
    description:
      "Kit carregador de parede 20W com entrada USB-C e USB-A, acompanhado de cabo USB-C para Lightning para carregamento rápido do iPhone.",
    highlights: ["20W de potência", "Cabo USB-C/Lightning incluso", "Compatível com carregamento rápido"],
    warrantyMonths: 6,
    freeShipping: false,
    rating: 4.5,
    reviewCount: 58,
    variants: [
      {
        id: "v-peining-charger20w-branco-novo",
        color: "Branco",
        colorHex: "#f4f4f4",
        condition: "novo",
        priceCents: 6900,
        stock: 50,
        images: ["charger", "charger"],
        photos: ["peining-charger20w-1.jpeg", "peining-charger20w-2.jpeg"],
      },
    ],
    reviews: makeReviews("peining-charger"),
  },
  {
    id: "p-hub-usbc",
    slug: "hub-usb-c-7-em-1",
    brand: "Brasil Multi Tech",
    name: "Hub USB-C 7 em 1",
    category: "acessorios",
    tagline: "HDMI 4K, leitor de cartão e 3 portas USB",
    description:
      "Hub USB-C com saída HDMI 4K, leitor de cartão SD/TF e três portas USB 3.0, ideal para notebooks.",
    highlights: ["Saída HDMI 4K", "3 portas USB 3.0", "Leitor de cartão SD/TF"],
    warrantyMonths: 6,
    freeShipping: false,
    rating: 4.5,
    reviewCount: 21,
    variants: [
      {
        id: "v-hub7em1-cinza-novo",
        color: "Cinza espacial",
        colorHex: "#5b5e66",
        condition: "novo",
        priceCents: 15900,
        stock: 24,
        images: ["accessory", "accessory"],
      },
    ],
    reviews: makeReviews("hub-usbc"),
  },
  {
    id: "p-capinha-magsafe",
    slug: "capinha-magsafe-transparente",
    brand: "Brasil Multi Tech",
    name: "Capinha MagSafe Transparente",
    category: "acessorios",
    tagline: "Compatível com carregamento MagSafe",
    description:
      "Capinha transparente com ímãs compatíveis com MagSafe, proteção contra quedas de até 2 metros.",
    highlights: ["Compatível com MagSafe", "Proteção antiqueda 2m", "Não amarela com o tempo"],
    warrantyMonths: 3,
    freeShipping: false,
    rating: 4.3,
    reviewCount: 143,
    variants: [
      {
        id: "v-capinha-transparente-novo",
        color: "Transparente",
        colorHex: "#eef0f2",
        condition: "novo",
        priceCents: 4900,
        stock: 80,
        images: ["accessory", "accessory"],
      },
    ],
    reviews: makeReviews("capinha-magsafe"),
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit);
}

export function getFeaturedProducts(limit = 8) {
  return products.filter((p) => p.variants.some((v) => v.compareAtCents)).slice(0, limit);
}

export function getMinPriceCents(product: Product) {
  return Math.min(...product.variants.map((v) => v.priceCents));
}

export function getMainPhoto(variant: Product["variants"][number]): string | undefined {
  return variant.photos?.[0] ? `/products/${variant.photos[0]}` : undefined;
}

export function getPhotoAt(variant: Product["variants"][number], index: number): string | undefined {
  return variant.photos?.[index] ? `/products/${variant.photos[index]}` : undefined;
}

/** First real photo found among a category's products, used for category tiles/showcases. */
export function getCategoryPhoto(category: string): string | undefined {
  for (const product of products) {
    if (product.category !== category) continue;
    for (const variant of product.variants) {
      const photo = getMainPhoto(variant);
      if (photo) return photo;
    }
  }
  return undefined;
}
