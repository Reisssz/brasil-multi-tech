"use client";

import { useState } from "react";
import { formatBRL, getInstallmentOptions } from "@/lib/pricing";

export function ProductInstallments({ priceCents }: { priceCents: number }) {
  const options = getInstallmentOptions(priceCents);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
      >
        <span>Calculadora de parcelas</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-border max-h-56 overflow-y-auto">
          {options.map((o) => (
            <div key={o.count} className="flex items-center justify-between px-4 py-2 text-sm border-b border-border/60 last:border-0">
              <span className="text-foreground">
                {o.count}x de <span className="font-semibold tabular-nums">{formatBRL(o.installmentCents)}</span>
              </span>
              <span className={`text-xs ${o.interestFree ? "text-success" : "text-muted"}`}>
                {o.interestFree ? "sem juros" : `total ${formatBRL(o.totalCents)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
