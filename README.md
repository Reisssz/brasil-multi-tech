# Brasil Multi Tech

E-commerce de celulares (novos e seminovos), notebooks e acessórios. Next.js (App Router) + TypeScript
+ Tailwind CSS v4, seguindo o briefing de posicionamento tipo Trocafone com identidade visual própria
(fundo claro, laranja como cor de marca).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## O que já está implementado

- **Home completa**: header com busca/autocomplete, hero com banner rotativo, barra de confiança,
  vitrine de categorias, ofertas em destaque, **simulador de parcelamento interativo**, seção de prova
  social/avaliações e footer.
- **Listagem por categoria** (`/categoria/[slug]`, incluindo `/categoria/ofertas`) com filtros de marca,
  condição, armazenamento e preço, mais ordenação.
- **Página de produto** (`/produto/[slug]`) com galeria com zoom, seletor de cor/armazenamento/condição,
  calculadora de parcelas, avaliações, produtos relacionados, dados estruturados `schema.org/Product`
  para SEO e barra fixa de compra no mobile.
- **Carrinho** (`/carrinho`) e **checkout em accordion** (`/checkout`: dados → entrega → pagamento) com
  Pix (desconto automático), boleto e cartão parcelado.
- **Rastreamento de pedido** (`/pedido/rastreio`), **central de ajuda/FAQ** (`/ajuda`) e **garantia e
  trocas** (`/garantia`).
- SEO técnico: metadata por página, `sitemap.xml`, `robots.txt`, JSON-LD de produto.

## O que é mock/local (e o que falta para produção)

Não há credenciais de serviços externos configuradas neste ambiente, então os pontos de integração
foram implementados como uma camada clara e isolada, pronta para ser trocada por serviços reais:

| Área | Estado atual | Para produção |
|---|---|---|
| Catálogo de produtos | `lib/data/products.ts` e `lib/data/categories.ts` (mock, em memória) | Migrar para Supabase/Firebase com tabelas de produto/variante/estoque |
| Imagens de produto | Placeholders SVG neutros gerados em `components/ui/ProductImage.tsx` | Substituir por fotos reais + `next/image` com CDN |
| Carrinho | `lib/cart-context.tsx`, `useSyncExternalStore` + `localStorage` | Pode seguir client-side, ou sincronizar com conta do usuário |
| Pedidos / rastreio | `lib/orders.ts`, gerados e lidos do `localStorage` do navegador | Persistir em banco real, com status atualizado via webhook |
| Pagamento | Stubs em `app/api/mercadopago/*` (comentários com os próximos passos) | Integrar SDK oficial do Mercado Pago (Checkout Pro ou Transparente) |
| Busca | Filtro client-side simples em `components/layout/SearchBar.tsx` | Trocar por Algolia/Meilisearch para autocomplete indexado |
| Painel administrativo | Não implementado | Criar área `/admin` para gestão de estoque, preços e pedidos |

Regras comerciais (desconto Pix, parcelas sem juros, juros das parcelas acima do limite) ficam
centralizadas em `lib/pricing.ts` (`PRICING_RULES`) — ajustar ali para mudar as condições globais.

## Estrutura

```
app/                rotas (App Router)
components/
  home/              seções da home (hero, vitrine, simulador, prova social)
  layout/            header, footer, barra de confiança, busca
  product/           card, galeria, listagem com filtros, detalhe do produto
  ui/                primitivos (logo, badge, rating, preço, faq, imagem de produto)
lib/
  data/              catálogo mock (produtos e categorias)
  pricing.ts         formatação de moeda, Pix, parcelamento
  cart-context.tsx   carrinho (client-side)
  orders.ts          pedidos mock (client-side)
  config.ts          constantes do site (WhatsApp, métricas, etc.)
```
