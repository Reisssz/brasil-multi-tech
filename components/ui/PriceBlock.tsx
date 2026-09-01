import { formatBRL } from "@/lib/pricing";

export function PriceBlock({
  priceCents,
  size = "md",
}: {
  priceCents: number;
  size?: "sm" | "md" | "lg";
}) {
  const priceTextSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`font-display ${priceTextSize} font-bold tabular-nums text-foreground`}>
          {formatBRL(priceCents)}
        </span>
      </div>
      {/* Parcelamento no cartão não é exibido aqui: quem processa é o
          Mercado Pago, e as opções/juros reais só aparecem na tela de
          pagamento dele — um número calculado por nós poderia não bater
          com o que o cliente realmente vê lá. */}
      <span className="text-xs text-muted">ou parcele no cartão de crédito</span>
    </div>
  );
}
