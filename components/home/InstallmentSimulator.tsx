"use client";

import { useState } from "react";
import { products } from "@/lib/data/products";
import { getMinPriceCents } from "@/lib/data/products";
import { calculateInstallment, formatBRL, getPixPriceCents, PRICING_RULES } from "@/lib/pricing";
import { Reveal } from "../ui/Reveal";

export function InstallmentSimulator() {
  const [productId, setProductId] = useState(products[0].id);
  const [installments, setInstallments] = useState(10);

  const product = products.find((p) => p.id === productId) ?? products[0];
  const priceCents = getMinPriceCents(product);
  const pixPriceCents = getPixPriceCents(priceCents);
  const result = calculateInstallment(priceCents, installments);

  return (
    <section id="simulador" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 scroll-mt-20">
      <Reveal as="div" className="rounded-3xl bg-[#14161a] text-white overflow-hidden relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand/10 blur-[80px]"
        />
        <div className="grid lg:grid-cols-2 gap-10 p-6 sm:p-10">
          <div className="flex flex-col gap-4 min-w-0">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 text-brand text-xs font-semibold px-3 py-1.5">
              Simulador de parcelamento
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Escolha o produto e veja o valor da parcela na hora
            </h2>
            <p className="text-[#b9bbc2] text-sm max-w-md">
              Sem letras miúdas: o valor que aparece aqui é o mesmo que fecha no carrinho.
            </p>

            <label className="flex flex-col gap-1.5 mt-2 min-w-0">
              <span className="text-xs font-medium text-[#b9bbc2]">Produto</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full min-w-0 h-11 rounded-xl bg-white/10 border border-white/10 px-3 text-sm outline-none focus:border-brand"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="text-black">
                    {p.brand} {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 mt-1">
              <span className="text-xs font-medium text-[#b9bbc2]">
                Número de parcelas: <span className="text-white font-semibold">{installments}x</span>
              </span>
              <input
                type="range"
                min={1}
                max={PRICING_RULES.maxInstallments}
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="accent-[color:var(--brand)] w-full"
              />
              <div className="flex justify-between text-[11px] text-[#7d7f88]">
                <span>1x</span>
                <span>{PRICING_RULES.interestFreeUpTo}x sem juros</span>
                <span>{PRICING_RULES.maxInstallments}x</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="rounded-2xl bg-white text-foreground p-6 flex flex-col gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-transform duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Preço à vista no Pix</span>
                <span className="inline-flex items-center rounded-full bg-success-light text-success text-xs font-semibold px-2 py-0.5">
                  -{PRICING_RULES.pixDiscountPercent}%
                </span>
              </div>
              <span key={pixPriceCents} className="animate-fade-in-fast text-3xl font-extrabold tabular-nums">
                {formatBRL(pixPriceCents)}
              </span>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Parcelado no cartão</span>
                {result.interestFree && (
                  <span className="inline-flex items-center rounded-full bg-brand-light text-brand-dark text-xs font-semibold px-2 py-0.5">
                    sem juros
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  key={`${installments}-${result.installmentCents}`}
                  className="animate-fade-in-fast text-3xl font-extrabold tabular-nums"
                >
                  {installments}x {formatBRL(result.installmentCents)}
                </span>
              </div>
              <span className="text-xs text-muted tabular-nums">
                Total parcelado: {formatBRL(result.totalCents)}
                {!result.interestFree && " (com juros)"}
              </span>
            </div>
            <p className="text-[11px] text-[#7d7f88] leading-relaxed">
              Simulação para {product.brand} {product.name}, a partir de {formatBRL(priceCents)}. Condições
              sujeitas à análise e à forma de pagamento escolhida no checkout.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
