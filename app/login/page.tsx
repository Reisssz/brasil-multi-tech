"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { entrar, type EstadoLogin } from "./actions";

const estadoInicial: EstadoLogin = null;

function FormularioLogin() {
  const [estado, formAction, pending] = useActionState(entrar, estadoInicial);
  const searchParams = useSearchParams();
  const redirectPara = searchParams.get("redirect") ?? "/conta";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Entrar</h1>
      <p className="text-sm text-muted mb-8">Acesse sua conta Brasil Multi Tech.</p>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="redirectPara" value={redirectPara} />

        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Senha
          <input
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>

        <div className="text-right text-sm">
          <Link href="/recuperar-senha" className="text-brand-dark">
            Esqueceu a senha?
          </Link>
        </div>

        {estado?.erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-brand-foreground font-semibold text-sm transition-colors"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-dark">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
