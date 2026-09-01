"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRecuperacaoSenha, type EstadoRecuperarSenha } from "./actions";

const estadoInicial: EstadoRecuperarSenha = null;

export default function RecuperarSenhaPage() {
  const [estado, formAction, pending] = useActionState(solicitarRecuperacaoSenha, estadoInicial);

  if (estado?.enviado) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-light text-success mb-4 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="font-display text-xl font-bold text-foreground mb-2">Confira seu e-mail</h1>
        <p className="text-sm text-muted">
          Se esse e-mail tiver uma conta na Brasil Multi Tech, você vai receber um link para redefinir sua senha
          em instantes.
        </p>
        <Link href="/login" className="mt-6 text-sm font-semibold text-brand-dark">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Recuperar senha</h1>
      <p className="text-sm text-muted mb-8">
        Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
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

        {estado?.erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-brand-foreground font-semibold text-sm transition-colors"
        >
          {pending ? "Enviando…" : "Enviar link de recuperação"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-brand-dark">
          Entrar
        </Link>
      </p>
    </div>
  );
}
