import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";

const rotuloStatus: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

function iniciais(nome: string) {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default async function PaginaConta() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/conta");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome_completo, telefone, role, created_at")
    .eq("id", user.id)
    .single();

  const { data: pedidos } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const nomeCompleto = perfil?.nome_completo?.trim() || "Cliente Brasil Multi Tech";
  const primeiroNome = nomeCompleto.split(" ")[0];
  const totalPedidos = pedidos?.length ?? 0;
  const totalGasto = (pedidos ?? [])
    .filter((p) => p.status === "paid" || p.status === "shipped" || p.status === "delivered")
    .reduce((soma, p) => soma + p.total, 0);

  const memberSince = perfil?.created_at
    ? new Date(perfil.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Cartão de perfil */}
      <div className="mb-8 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground font-display text-xl font-bold">
            {iniciais(nomeCompleto)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold text-foreground truncate">{nomeCompleto}</h1>
            <p className="text-sm text-muted truncate">{user.email}</p>
            {memberSince && <p className="text-xs text-muted mt-0.5">Cliente desde {memberSince}</p>}
          </div>
        </div>

        {(perfil?.telefone || user.email) && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <span className="text-xs text-muted uppercase tracking-wide">E-mail</span>
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            </div>
            <div>
              <span className="text-xs text-muted uppercase tracking-wide">Telefone</span>
              <p className="text-sm font-medium text-foreground">{perfil?.telefone || "Não informado"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resumo rápido */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase tracking-wide">Pedidos feitos</p>
          <p className="font-display text-2xl font-bold text-foreground">{totalPedidos}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase tracking-wide">Total em compras</p>
          <p className="font-display text-2xl font-bold text-foreground">{formatBRL(Math.round(totalGasto * 100))}</p>
        </div>
      </div>

      {perfil?.role === "admin" && (
        <Link
          href="/admin"
          className="mb-6 block rounded-2xl bg-ink px-4 py-3 text-center font-semibold text-ink-foreground hover:bg-ink/90 transition-colors"
        >
          Painel administrativo
        </Link>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Meus pedidos</h2>
      <div className="mb-8 flex flex-col gap-2">
        {pedidos?.length ? (
          pedidos.map((pedido) => (
            <Link
              key={pedido.id}
              href={`/pedido/rastreio?id=${pedido.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:border-brand transition-colors"
            >
              <span className="font-medium text-foreground">#{pedido.id.slice(0, 8)}</span>
              <span className="text-muted">{rotuloStatus[pedido.status] ?? pedido.status}</span>
              <span className="font-semibold text-foreground">
                {formatBRL(Math.round(pedido.total * 100))}
              </span>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted mb-3">Você ainda não fez nenhum pedido.</p>
            <Link href="/categoria/ofertas" className="text-sm font-semibold text-brand-dark">
              Ver ofertas →
            </Link>
          </div>
        )}
      </div>

      <form action="/logout" method="post">
        <button
          type="submit"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-[#f7f8fa]"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
