"use client";

import { useState } from "react";
import { useParcelamentoConfig } from "@/components/providers/ParcelamentoConfigProvider";
import {
  calcularParcelamento,
  formatBRL,
  getPixPriceCents,
  melhorParcelaComJuros,
  melhorParcelaSemJuros,
  resolverConfigParcelamento,
} from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { FormasPagamentoModal } from "./FormasPagamentoModal";

export type ConfigCaixaPreco = Pick<
  Product,
  | "pixDescontoPercent"
  | "parcelamentoHabilitado"
  | "vendidosTexto"
  | "seloTexto"
  | "cupomPercent"
  | "parcelasSemJuros"
  | "parcelasComJuros"
  | "jurosMensalPercent"
>;

/** Bloco de preço da página do produto (e do preview no admin): selo, preços, parcelas, link do modal e cupom. */
export function PrecoDetalhe({
  priceCents,
  compareAtCents,
  config,
  marca,
  modelo,
  cor,
  photoSrc,
}: {
  priceCents: number;
  compareAtCents?: number;
  config: ConfigCaixaPreco;
  marca: string;
  modelo: string;
  cor: string;
  photoSrc?: string;
}) {
  const configGlobal = useParcelamentoConfig();
  const [modalAberto, setModalAberto] = useState(false);
  const [cupomMarcado, setCupomMarcado] = useState(false);

  const pixPriceCents = config.pixDescontoPercent ? getPixPriceCents(priceCents, config.pixDescontoPercent) : null;
  const temDesconto = !!compareAtCents && compareAtCents > priceCents;
  const percentDesconto = temDesconto ? Math.round((1 - priceCents / compareAtCents!) * 100) : null;

  // Sem parcelamento habilitado o cartão fica só à vista (1x).
  const opcoesCompletas = calcularParcelamento(priceCents, resolverConfigParcelamento(configGlobal, config));
  const opcoes = config.parcelamentoHabilitado ? opcoesCompletas : opcoesCompletas.slice(0, 1);
  const semJuros = config.parcelamentoHabilitado ? melhorParcelaSemJuros(opcoes) : undefined;
  const comJuros = config.parcelamentoHabilitado ? melhorParcelaComJuros(opcoes) : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {config.vendidosTexto && <p className="text-sm font-semibold text-foreground">{config.vendidosTexto}</p>}

      {config.seloTexto && (
        <span className="inline-flex w-fit items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-sm font-bold leading-none text-white">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M10 5.5V10l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {config.seloTexto}
        </span>
      )}

      {temDesconto && (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-muted/70 line-through">{formatBRL(compareAtCents!)}</span>
          <span className="rounded bg-brand px-1.5 py-0.5 text-sm font-bold text-brand-foreground">
            - {percentDesconto}%
          </span>
        </div>
      )}

      <span className="font-display text-4xl font-extrabold tabular-nums leading-tight text-foreground">
        {formatBRL(pixPriceCents ?? priceCents)}
      </span>

      {pixPriceCents !== null && (
        <>
          <span className="text-sm font-bold text-success">{config.pixDescontoPercent}% OFF no PIX</span>
          <span className="mt-2 flex items-center gap-2 text-xl font-bold tabular-nums text-muted/70">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor" />
              <path d="M2 9.5h20" stroke="#fff" strokeWidth="2" />
              <rect x="5" y="13" width="6" height="2" rx="1" fill="#fff" />
            </svg>
            {formatBRL(priceCents)} no cartão
          </span>
        </>
      )}

      {(semJuros || comJuros) && (
        <div className="flex flex-col text-sm tabular-nums text-foreground">
          {semJuros && (
            <span>
              Em {semJuros.count}x de {formatBRL(semJuros.installmentCents)} s/ juros
            </span>
          )}
          {comJuros && (
            <span>
              Ou {comJuros.count}x de {formatBRL(comJuros.installmentCents)} c/ juros
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="mt-3 w-fit text-sm font-medium text-blue-600 hover:underline"
      >
        Ver as formas de pagamento
      </button>

      {config.cupomPercent ? (
        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <svg width="40" height="26" viewBox="0 0 40 26" fill="none" className="shrink-0" aria-hidden="true">
            <path d="M3 2h26l8 11-8 11H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#2b2f33" />
            <circle cx="30" cy="13" r="2.4" fill="#fff" />
          </svg>
          <span className="flex-1 text-sm text-foreground">Cupom {config.cupomPercent}% OFF</span>
          <input
            type="checkbox"
            checked={cupomMarcado}
            onChange={(e) => setCupomMarcado(e.target.checked)}
            className="h-5 w-5 rounded border-border accent-brand"
          />
        </label>
      ) : null}

      <FormasPagamentoModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        priceCents={priceCents}
        pixPriceCents={pixPriceCents}
        pixDescontoPercent={config.pixDescontoPercent}
        opcoes={opcoes}
        marca={marca}
        modelo={modelo}
        cor={cor}
        photoSrc={photoSrc}
      />
    </div>
  );
}
