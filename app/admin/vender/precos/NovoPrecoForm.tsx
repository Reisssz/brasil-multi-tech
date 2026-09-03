"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarPrecoBase, type EstadoPreco } from "./actions";

const estadoInicial: EstadoPreco = null;

export function NovoPrecoForm() {
  const [estado, formAction, pending] = useActionState(criarPrecoBase, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !estado?.erro) formRef.current?.reset();
  }, [pending, estado]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 mb-8">
      <h2 className="font-bold text-foreground text-sm">Adicionar modelo</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Marca
          <input name="brand" placeholder="Ex: Apple" required className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Modelo
          <input name="model" placeholder="Ex: iPhone 16" required className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Valor-base (R$)
          <input name="valor" type="number" step="0.01" min={0.01} required placeholder="0,00" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" />
        </label>
      </div>

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold text-sm transition-colors w-fit px-6"
      >
        {pending ? "Adicionando…" : "Adicionar"}
      </button>
    </form>
  );
}
