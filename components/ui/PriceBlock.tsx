import { formatBRL, calcularParcelamento, melhorParcelaSemJuros, melhorParcelaComJuros, getPixPriceCents } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  size = "md",
  parcelamentoHabilitado = false,
  pixDescontoPercent,
}: {
  priceCents: number;
  size?: "sm" | "md" | "lg";
  parcelamentoHabilitado?: boolean;
  pixDescontoPercent?: number;
}) {
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const pixPriceCents = pixDescontoPercent ? getPixPriceCents(priceCents, pixDescontoPercent) : null;
  const opcoesParcelamento = parcelamentoHabilitado ? calcularParcelamento(priceCents) : [];
  const parcelaSemJuros = melhorParcelaSemJuros(opcoesParcelamento);
  const parcelaComJuros = melhorParcelaComJuros(opcoesParcelamento);

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
          parcelamento pra este produto, com a tabela real de taxas em
          lib/pricing.ts. */}
      {parcelaSemJuros ? (
        <span className="text-xs text-muted tabular-nums">
          até {parcelaSemJuros.count}x de {formatBRL(parcelaSemJuros.installmentCents)} sem juros
          {parcelaComJuros && <> ou {parcelaComJuros.count}x de {formatBRL(parcelaComJuros.installmentCents)} com juros</>}
        </span>
      ) : (
        <span className="text-xs text-muted">ou parcele no cartão de crédito</span>
      )}
    </div>
  );
}
