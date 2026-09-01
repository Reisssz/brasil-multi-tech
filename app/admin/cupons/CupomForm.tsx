"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarCupom, type EstadoCupom } from "./actions";

const estadoInicial: EstadoCupom = null;

export function CupomForm() {
  const [estado, formAction, pending] = useActionState(criarCupom, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !estado?.erro) formRef.current?.reset();
  }, [pending, estado]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 mb-8">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Código do cupom
          <input
            name="codigo"
            placeholder="Ex: BEMVINDO10"
            required
            className="h-11 rounded-lg border border-border px-3 text-sm uppercase outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Desconto (%)
          <input
            name="descontoPercent"
            type="number"
            min={1}
            max={100}
            placeholder="Ex: 10"
            required
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Validade (opcional)
          <input
            name="validade"
            type="date"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Limite de usos (opcional)
          <input
            name="usosMaximos"
            type="number"
            min={1}
            placeholder="Deixe em branco para ilimitado"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="somentePrimeiraCompra" defaultChecked className="accent-[color:var(--brand)]" />
        Só vale para a primeira compra do cliente
      </label>

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold text-sm transition-colors w-fit px-6"
      >
        {pending ? "Criando…" : "Criar cupom"}
      </button>
    </form>
  );
}
