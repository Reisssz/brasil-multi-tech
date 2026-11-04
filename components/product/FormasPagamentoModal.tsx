"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatBRL, OpcaoParcelamento } from "@/lib/pricing";

export function FormasPagamentoModal({
  open,
  onClose,
  priceCents,
  pixPriceCents,
  pixDescontoPercent,
  opcoes,
  marca,
  modelo,
  cor,
  photoSrc,
}: {
  open: boolean;
  onClose: () => void;
  priceCents: number;
  pixPriceCents: number | null;
  pixDescontoPercent?: number;
  opcoes: OpcaoParcelamento[];
  marca: string;
  modelo: string;
  cor: string;
  photoSrc?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxSemJuros = opcoes.filter((o) => o.interestFree).length;

  // Portal: a caixa de compra é sticky (cria stacking context) e deixaria o modal atrás do header do site.
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="formas-pagamento-titulo"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex shrink-0 items-center justify-between bg-brand px-5 py-3.5 sm:px-7 sm:py-4">
          <h2 id="formas-pagamento-titulo" className="font-display text-xl font-bold text-brand-foreground">
            Formas de pagamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-brand-foreground hover:bg-black/10"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto bg-[#f0f0f0] p-4 sm:p-6 md:grid-cols-[1fr_280px] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex shrink-0 items-center justify-center gap-2 border-b-[3px] border-brand px-4 py-3 text-base font-semibold text-foreground">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-brand">
                <rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor" />
                <path d="M2 9.5h20" stroke="#fff" strokeWidth="2" />
                <rect x="5" y="13" width="6" height="2" rx="1" fill="#fff" />
              </svg>
              Cartão de Crédito
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-2">
              <span className="text-xs font-semibold text-brand-dark">
                Use seu cartão{maxSemJuros > 1 ? ` • Até ${maxSemJuros}x sem juros` : ""}
              </span>
              <BandeirasCartao />
            </div>

            <div className="flex shrink-0 items-center justify-between border-y border-border px-5 py-2 text-sm font-semibold text-foreground">
              <span>Parcelas</span>
              <span className="pr-3 text-xs">TOTAL</span>
            </div>

            <ul className="max-h-[260px] min-h-[120px] flex-1 overflow-y-auto md:max-h-none">
              {opcoes.map((o) => (
                <li
                  key={o.count}
                  className="flex items-center gap-3 border-b border-border px-5 py-2 text-sm tabular-nums text-foreground last:border-0"
                >
                  <span className="w-[8.5rem] shrink-0">
                    {o.count}x de {formatBRL(o.installmentCents)}
                  </span>
                  <span className={`flex-1 text-xs ${o.interestFree ? "text-success" : "text-muted"}`}>
                    {o.interestFree
                      ? "(sem juros)"
                      : o.monthlyRatePercent !== undefined
                      ? `(${o.monthlyRatePercent.toFixed(2)}% ao mês)`
                      : "(com juros)"}
                  </span>
                  <span className="shrink-0 pr-1">{formatBRL(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-brand">
                  <path d="M12 1.5l4.5 4.5-4.5 4.5L7.5 6 12 1.5Zm0 11l4.5 4.5L12 21.5 7.5 17 12 12.5ZM1.5 12L6 7.5 10.5 12 6 16.5 1.5 12Zm12 0L18 7.5l4.5 4.5-4.5 4.5L13.5 12Z" />
                </svg>
                PIX
              </span>
              <span className="text-sm font-semibold text-brand-dark">Melhor oferta</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <ul className="flex flex-col gap-1 text-sm font-medium text-foreground">
                {["Pagamento instantâneo", "Sem juros", "Melhor preço"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-1">
                {pixPriceCents !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>
                      de <span className="text-base line-through">{formatBRL(priceCents)}</span>
                    </span>
                    <span className="rounded-full bg-success px-2.5 py-1 text-xs font-bold text-white">
                      {pixDescontoPercent}% OFF
                    </span>
                  </div>
                )}
                <p className="text-xl font-bold tabular-nums text-brand-dark">
                  {formatBRL(pixPriceCents ?? priceCents)}{" "}
                  <span className="text-sm font-semibold">no PIX</span>
                </p>
              </div>

              {photoSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt={modelo} className="mx-auto min-h-[80px] w-auto max-w-full flex-1 object-contain" />
              )}

              <dl className="flex shrink-0 flex-col items-center gap-0.5 text-center text-xs text-foreground">
                <dt className="text-muted">Marca:</dt>
                <dd className="font-medium">{marca || "—"}</dd>
                <dt className="text-muted">Modelo:</dt>
                <dd className="font-medium">{modelo || "—"}</dd>
                <dt className="text-muted">Cor:</dt>
                <dd className="font-medium">{cor || "—"}</dd>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}

function BandeirasCartao() {
  return (
    <span className="flex items-center gap-2" aria-hidden="true">
      <span className="text-[11px] font-black italic tracking-tight text-[#1a1f71]">VISA</span>
      <span className="flex items-center">
        <span className="h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
        <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
      <span className="rounded bg-foreground px-1 text-[10px] font-bold lowercase leading-4 text-white">elo</span>
    </span>
  );
}
