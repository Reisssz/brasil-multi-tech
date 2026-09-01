import { formatBRL, calcularParcelamento, melhorParcelaSemJuros, getPixPriceCents, type PlanoParcelamento } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  size = "md",
  parcelamentoHabilitado = false,
  planoParcelamento,
  pixDescontoPercent,
}: {
  priceCents: number;
  size?: "sm" | "md" | "lg";
  parcelamentoHabilitado?: boolean;
  planoParcelamento?: PlanoParcelamento;
  pixDescontoPercent?: number;
}) {
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const pixPriceCents = pixDescontoPercent ? getPixPriceCents(priceCents, pixDescontoPercent) : null;
  const melhorParcela =
    parcelamentoHabilitado && planoParcelamento
      ? melhorParcelaSemJuros(calcularParcelamento(priceCents, planoParcelamento))
      : null;

  return (
    <div className="flex flex-col gap-0.5">
      {pixPriceCents && (
        <span className="text-sm text-muted line-through tabular-nums">{formatBRL(priceCents)}</span>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-display ${priceTextSize} font-bold tabular-nums text-foreground`}>
          {formatBRL(pixPriceCents ?? priceCents)}
        </span>
        {pixPriceCents && (
          <span className="inline-flex items-center rounded-full bg-success-light text-success text-xs font-semibold px-2 py-0.5">
            {pixDescontoPercent}% no Pix
          </span>
        )}
      </div>
      {/* Fora daqui (checkout, valor cobrado de verdade) quem processa é o
          Mercado Pago — essa prévia só aparece quando o admin habilitou o
          parcelamento pra este produto, com os números reais configurados
          em /admin/configuracoes. */}
      {melhorParcela ? (
        <span className="text-xs text-muted tabular-nums">
          ou em até {melhorParcela.count}x de {formatBRL(melhorParcela.installmentCents)}
          {melhorParcela.interestFree ? " sem juros" : " com juros"}
        </span>
      ) : (
        <span className="text-xs text-muted">ou parcele no cartão de crédito</span>
      )}
    </div>
  );
}
