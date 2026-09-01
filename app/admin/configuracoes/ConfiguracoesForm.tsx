"use client";

import { useActionState } from "react";
import { salvarConfiguracoesParcelamento, type EstadoConfiguracoes } from "./actions";

const estadoInicial: EstadoConfiguracoes = null;

export function ConfiguracoesForm({
  maxInstallments,
  taxaCartaoAvista,
  taxaCartao2a6x,
  taxaCartao7a12x,
  taxaCartao13a18x,
  taxaPix,
  taxaBoleto,
  taxaParcelamento2x,
  taxaParcelamento13a18x,
}: {
  maxInstallments: number;
  taxaCartaoAvista: number;
  taxaCartao2a6x: number;
  taxaCartao7a12x: number;
  taxaCartao13a18x: number;
  taxaPix: number;
  taxaBoleto: number;
  taxaParcelamento2x: number;
  taxaParcelamento13a18x: number;
}) {
  const [estado, formAction, pending] = useActionState(salvarConfiguracoesParcelamento, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-bold text-foreground text-sm mb-3">O que o cliente vê</h2>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Máximo de parcelas oferecidas (sempre sem juros pro cliente)
          <input
            name="maxInstallments"
            type="number"
            min={1}
            max={24}
            defaultValue={maxInstallments}
            required
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand max-w-[160px]"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-bold text-foreground text-sm mb-1">Suas taxas Mercado Pago (só referência)</h2>
        <p className="text-xs text-muted mb-4">Não aparece pro cliente — é só pra você acompanhar seu custo por venda.</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <CampoTaxa label="Cartão à vista (%)" name="taxaCartaoAvista" defaultValue={taxaCartaoAvista} />
          <CampoTaxa label="Cartão 2x a 6x (%)" name="taxaCartao2a6x" defaultValue={taxaCartao2a6x} />
          <CampoTaxa label="Cartão 7x a 12x (%)" name="taxaCartao7a12x" defaultValue={taxaCartao7a12x} />
          <CampoTaxa label="Cartão 13x a 18x (%)" name="taxaCartao13a18x" defaultValue={taxaCartao13a18x} />
          <CampoTaxa label="Pix (%)" name="taxaPix" defaultValue={taxaPix} />
          <CampoTaxa label="Boleto (R$ fixo)" name="taxaBoleto" defaultValue={taxaBoleto} />
        </div>

        <p className="text-xs text-muted mt-4 mb-1">
          Parcelamento vendedor — taxa somada à taxa por venda (2,99%) pra oferecer parcelas sem juros:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <CampoTaxa label="Oferecer 2x (%)" name="taxaParcelamento2x" defaultValue={taxaParcelamento2x} />
          <CampoTaxa label="Oferecer 13x a 18x (%)" name="taxaParcelamento13a18x" defaultValue={taxaParcelamento13a18x} />
        </div>
      </div>

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>}
      {estado?.salvo && <p className="rounded-lg bg-success-light px-3 py-2 text-sm text-success">Salvo!</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold text-sm transition-colors w-fit px-6"
      >
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}

function CampoTaxa({ label, name, defaultValue }: { label: string; name: string; defaultValue: number }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
      {label}
      <input
        name={name}
        type="number"
        step="0.01"
        min={0}
        defaultValue={defaultValue}
        required
        className="h-10 rounded-lg border border-border px-2.5 text-sm text-foreground outline-none focus:border-brand"
      />
    </label>
  );
}
