"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cadastrar, type EstadoCadastro } from "./actions";

const estadoInicial: EstadoCadastro = null;

export default function PaginaCadastro() {
  const [estado, formAction, pending] = useActionState(cadastrar, estadoInicial);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Criar conta</h1>
      <p className="text-sm text-muted mb-8">
        Cadastre-se para comprar e acompanhar seus pedidos.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <Campo label="Nome completo" name="nomeCompleto" type="text" autoComplete="name" required />
        <Campo label="E-mail" name="email" type="email" autoComplete="email" required />
        <Campo label="Telefone (opcional)" name="telefone" type="tel" autoComplete="tel" />
        <Campo label="CPF (opcional)" name="cpf" type="text" inputMode="numeric" />
        <Campo label="Senha" name="senha" type="password" autoComplete="new-password" required minLength={8} />
        <Campo label="Confirmar senha" name="confirmarSenha" type="password" autoComplete="new-password" required minLength={8} />

        {estado?.erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-brand-foreground font-semibold text-sm transition-colors"
        >
          {pending ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-brand-dark">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Campo({
  label,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        {...props}
        className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
