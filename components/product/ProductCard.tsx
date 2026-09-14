import Link from "next/link";
import { Product } from "@/lib/types";
import { getMainPhoto, getMinPriceCents } from "@/lib/data/products";
import { formatBRL, calcularParcelamento, melhorParcelaSemJuros, melhorParcelaComJuros, getPixPriceCents } from "@/lib/pricing";
import { CONDITION_LABELS, isSeminovo } from "@/lib/conditions";
import { ProductImage, ProductIconKey } from "../ui/ProductImage";
import { Badge } from "../ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  // Feature the variant that matches the advertised "a partir de" price, so the
  // condition badge and the price shown never contradict each other.
  const mainVariant = product.variants.reduce((min, v) => (v.priceCents < min.priceCents ? v : min), product.variants[0]);
  const priceCents = getMinPriceCents(product);
  const pixPriceCents = product.pixDescontoPercent ? getPixPriceCents(priceCents, product.pixDescontoPercent) : null;
  const temDesconto = !!mainVariant.compareAtCents && mainVariant.compareAtCents > mainVariant.priceCents;
  const opcoesParcelamento = product.parcelamentoHabilitado ? calcularParcelamento(priceCents) : [];
  const parcelaSemJuros = melhorParcelaSemJuros(opcoesParcelamento);
  const parcelaComJuros = melhorParcelaComJuros(opcoesParcelamento);

  return (
    <Link
      href={`/produto/${product.slug}?variante=${mainVariant.id}`}
      className="group flex flex-col bg-surface border border-border hover:border-brand/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
    >
      <div className="relative">
        <ProductImage
          icon={mainVariant.images[0] as ProductIconKey}
          photoSrc={getMainPhoto(mainVariant)}
          tint="white"
          className="aspect-[5/4] w-full"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {temDesconto && <Badge tone="success">Super Oferta</Badge>}
          {isSeminovo(mainVariant.condition) && <Badge tone="neutral">{CONDITION_LABELS[mainVariant.condition]}</Badge>}
        </div>
        {product.freeShipping && (
          <div className="absolute bottom-2 left-2">
            <Badge tone="success">Frete grátis</Badge>
          </div>
        )}
      </div>
      {/* flex-1 + h-full: quando o flex-wrap da fileira estica os cards pra
          bater com o mais alto (produto com mais linha de texto, parcela
          com juros etc.), essa coluna precisa crescer junto — senão o
          "Comprar" fica no meio do card com espaço em branco sobrando
          embaixo. mt-auto no botão garante que ele sempre gruda no rodapé,
          mesmo quando o card fica mais alto que o conteúdo pede. */}
      <div className="flex flex-1 flex-col gap-1 p-2.5 h-full">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 min-h-[2.3em]">
          {product.name}
        </h3>

        {/* Sem linha de preço riscado aqui: só existe uma versão de preço
            no card (o "a partir de" já é o preço com pix quando o produto
            tem desconto pix), pra manter a mesma quantidade de linhas —
            e portanto o mesmo alinhamento entre cards — tenha o produto
            frete grátis/desconto ou não. */}
        <div className="mt-1 flex flex-col gap-0.5">
          <span className="text-[11px] text-muted leading-tight">A partir de</span>
          <span className="font-display text-lg font-bold tabular-nums text-brand leading-tight">
            {formatBRL(pixPriceCents ?? priceCents)}
          </span>
          <span className="text-[11px] text-muted leading-tight min-h-[1.2em]">{pixPriceCents ? "no pix" : " "}</span>
          <span className="flex items-center gap-1 text-[10.5px] text-muted tabular-nums leading-snug min-h-[2.4em]">
            {parcelaSemJuros && (
              <>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="shrink-0 self-start mt-0.5">
                  <rect x="2.5" y="5" width="15" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2.5 8.2h15" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span>
                  Até {parcelaSemJuros.count}x de {formatBRL(parcelaSemJuros.installmentCents)} s/ juros
                  {parcelaComJuros && <> ou {parcelaComJuros.count}x de {formatBRL(parcelaComJuros.installmentCents)} c/ juros</>}
                </span>
              </>
            )}
          </span>
        </div>

        <span className="mt-auto pt-1.5 inline-flex items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm h-9 group-hover:bg-brand-dark transition-colors">
          Comprar
        </span>
      </div>
    </Link>
  );
}
