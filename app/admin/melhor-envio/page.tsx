import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") redirect("/");

  const [{ count: pedidosPendentes }, { count: pedidosPagos }] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Painel administrativo</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Pedidos pendentes</p>
          <p className="text-3xl font-bold text-foreground">{pedidosPendentes ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Pedidos pagos</p>
          <p className="text-3xl font-bold text-foreground">{pedidosPagos ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/admin/melhor-envio"
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:border-brand"
        >
          Conectar / gerenciar Melhor Envio
          <span className="text-muted">→</span>
        </Link>
      </div>
    </div>
  );
}