"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center flex flex-col items-center gap-4">
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-success-light text-success">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h1 className="text-2xl font-extrabold text-foreground">Pedido confirmado!</h1>
      {id && (
        <p className="text-sm text-muted">
          Número do pedido: <span className="font-semibold text-foreground">{id}</span>
        </p>
      )}
      <p className="text-sm text-muted max-w-sm">
        Você vai receber a confirmação por e-mail. Acompanhe cada etapa da entrega na central de rastreamento.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {id && (
          <Link
            href={`/pedido/rastreio?id=${id}`}
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors"
          >
            Rastrear pedido
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border hover:border-brand font-semibold h-11 px-6 text-sm transition-colors"
        >
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
