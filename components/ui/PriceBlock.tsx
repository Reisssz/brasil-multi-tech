import { formatBRL, calcularParcelamento, melhorParcelaSemJuros, melhorParcelaComJuros, getPixPriceCents } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  compareAtCents,
  size = "md",
  parcelamentoHabilitado = false,
  pixDescontoPercent,
}: {
  priceCents: number;
  /** Preço "de" riscado, quando o produto está com desconto de promoção (distinto do desconto pix). */
  compareAtCents?: number;
  size?: "sm" | "md" | "lg";
  parcelamentoHabilitado?: boolean;
  pixDescontoPercent?: number;
}) {
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const pixPriceCents = pixDescontoPercent ? getPixPriceCents(priceCents, pixDescontoPercent) : null;
  const temDesconto = !!compareAtCents && compareAtCents > priceCents;
  const percentDesconto = temDesconto ? Math.round((1 - priceCents / compareAtCents!) * 100) : null;
  const opcoesParcelamento = parcelamentoHabilitado ? calcularParcelamento(priceCents) : [];
  const parcelaSemJuros = melhorParcelaSemJuros(opcoesParcelamento);
  const parcelaComJuros = melhorParcelaComJuros(opcoesParcelamento);

  return (
    <div className="flex flex-col gap-0.5">
      {temDesconto && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted line-through tabular-nums">{formatBRL(compareAtCents!)}</span>
          <span className="inline-flex items-center rounded bg-red-50 text-red-600 text-xs font-bold px-1.5 py-0.5">
            -{percentDesconto}%
          </span>
        </div>
      )}
      <span className={`font-display ${priceTextSize} font-bold tabular-nums text-foreground`}>
        {formatBRL(pixPriceCents ?? priceCents)}
      </span>
      {pixPriceCents && (
        <span className="text-success text-sm font-semibold">{pixDescontoPercent}% OFF no Pix</span>
      )}
      {pixPriceCents && (
        <span className="flex items-center gap-1.5 text-xs text-muted tabular-nums mt-1">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <rect x="2.5" y="5" width="15" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2.5 8.2h15" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {formatBRL(priceCents)} no cartão
        </span>
      )}
      {/* Fora daqui (checkout, valor cobrado de verdade) quem processa é o
          Mercado Pago — essa prévia só aparece quando o admin habilitou o
          parcelamento pra este produto, com a tabela real de taxas em
          lib/pricing.ts. */}
      {parcelaSemJuros ? (
        <span className="text-xs text-muted tabular-nums">
          Em {parcelaSemJuros.count}x de {formatBRL(parcelaSemJuros.installmentCents)} s/ juros
          {parcelaComJuros && <> ou {parcelaComJuros.count}x de {formatBRL(parcelaComJuros.installmentCents)} c/ juros</>}
        </span>
      ) : (
        <span className="text-xs text-muted">ou parcele no cartão de crédito</span>
      )}
    </div>
  );
}
