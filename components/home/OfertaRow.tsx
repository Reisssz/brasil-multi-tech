import { Product } from "@/lib/types";
import { ProductCard } from "../product/ProductCard";
import { Reveal } from "../ui/Reveal";

/**
 * Fileira de produtos reutilizada pelas seções de oferta da home (Apple,
 * notebooks, ofertas do dia, garantia).
 *
 * Duas decisões aqui, ambas por bug já visto em produção:
 *
 * 1. flex-wrap alinhado à esquerda (justify-start): o título da seção e o
 *    primeiro card compartilham a mesma margem esquerda, como no layout de
 *    referência. Fileira incompleta sobra à direita mesmo — é o
 *    comportamento padrão de vitrine e mantém o alinhamento com o título.
 * 2. Gutter por padding no item + margem negativa no container, em vez de
 *    `gap` + `basis-[calc(...)]`: o calc deixava a fileira com exatamente
 *    100% da largura e o arredondamento sub-pixel do flexbox quebrava a
 *    linha (2 cards viravam 1 por fileira no mobile). Com porcentagem pura
 *    (w-1/2, w-1/3...) e o respiro por dentro da caixa, o número de cards
 *    por fileira é sempre exato.
 */
const ITEM = "flex w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 px-2 sm:px-2.5 pb-4 sm:pb-5";

export function OfertaRow({ titulo, subtitulo, produtos }: { titulo: string; subtitulo: string; produtos: Product[] }) {
  if (produtos.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-12 sm:py-14">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{titulo}</h2>
            <p className="text-muted mt-1">{subtitulo}</p>
          </div>
        </Reveal>
        <div className="flex flex-wrap justify-center -mx-2 sm:-mx-2.5 -mb-4 sm:-mb-5">
          {produtos.map((p, i) => (
            <Reveal key={p.id} delay={(i % 5) * 60} className={ITEM}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
