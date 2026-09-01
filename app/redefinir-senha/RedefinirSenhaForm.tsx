"use client";

import { useActionState } from "react";
import { redefinirSenha, type EstadoRedefinirSenha } from "./actions";

const estadoInicial: EstadoRedefinirSenha = null;

export function RedefinirSenhaForm() {
  const [estado, formAction, pending] = useActionState(redefinirSenha, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Nova senha
        <input
          name="novaSenha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Confirmar nova senha
        <input
          name="confirmarSenha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
        />
      </label>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-brand-foreground font-semibold text-sm transition-colors"
      >
        {pending ? "Salvando…" : "Redefinir senha"}
      </button>
    </form>
  );
}
