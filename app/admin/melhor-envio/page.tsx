import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { urlDeAutorizacao } from "@/lib/melhor-envio/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ConectarMelhorEnvio({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  const { sucesso, erro } = await searchParams;

  const supabase = createAdminClient();
  const { data: tokenAtual } = await supabase
    .from("melhor_envio_tokens")
    .select("expires_at")
    .eq("id", true)
    .maybeSingle();

  async function iniciarConexao() {
    "use server";
    const state = crypto.randomUUID();
    (await cookies()).set("melhor_envio_oauth_state", state, { httpOnly: true, maxAge: 600, path: "/" });
    redirect(urlDeAutorizacao(state));
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Melhor Envio</h1>

      {sucesso && (
        <p className="mb-4 rounded-lg bg-success-light px-3 py-2 text-sm text-success">
          Conectado com sucesso!
        </p>
      )}
      {erro && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Não foi possível conectar: {erro}</p>}

      {tokenAtual ? (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Status</p>
          <p className="font-semibold text-success">Conectado</p>
          <p className="text-xs text-muted">
            Token válido até {new Date(tokenAtual.expires_at).toLocaleString("pt-BR")}
          </p>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted">
          Conecte sua conta Melhor Envio para habilitar cálculo de frete, compra de etiqueta e rastreio.
        </p>
      )}

      <form action={iniciarConexao}>
        <button
          type="submit"
          className="w-full inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold text-sm transition-colors"
        >
          {tokenAtual ? "Reconectar" : "Conectar Melhor Envio"}
        </button>
      </form>
    </div>
  );
}
