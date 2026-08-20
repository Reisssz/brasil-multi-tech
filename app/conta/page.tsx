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

export default async function PaginaConta() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/conta");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome_completo, role")
    .eq("id", user.id)
    .single();

  const { data: pedidos } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        Olá, {perfil?.nome_completo?.split(" ")[0] ?? "cliente"}
      </h1>

      {perfil?.role === "admin" && (
        <Link
          href="/admin"
          className="mb-6 block rounded-2xl bg-ink px-4 py-3 text-center font-semibold text-ink-foreground"
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
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium text-foreground">#{pedido.id.slice(0, 8)}</span>
              <span className="text-muted">{rotuloStatus[pedido.status] ?? pedido.status}</span>
              <span className="font-semibold text-foreground">
                {formatBRL(Math.round(pedido.total * 100))}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted">Você ainda não fez nenhum pedido.</p>
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
