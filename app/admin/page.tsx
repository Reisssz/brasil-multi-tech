import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminHome() {
  const supabase = await createClient();

  const [{ count: totalProdutos }, { count: pedidosPendentes }, { count: pedidosPagos }, { count: semEstoque }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
      supabase.from("product_variants").select("*", { count: "exact", head: true }).eq("stock", 0),
    ]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Painel administrativo</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Cartao titulo="Produtos ativos" valor={totalProdutos ?? 0} />
        <Cartao titulo="Pedidos pendentes" valor={pedidosPendentes ?? 0} />
        <Cartao titulo="Pedidos pagos" valor={pedidosPagos ?? 0} />
        <Cartao titulo="Variantes sem estoque" valor={semEstoque ?? 0} alerta={(semEstoque ?? 0) > 0} />
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/admin/produtos"
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground hover:border-brand"
        >
          Gerenciar produtos
          <span className="text-muted">→</span>
        </Link>
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

function Cartao({ titulo, valor, alerta }: { titulo: string; valor: number; alerta?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{titulo}</p>
      <p className={`text-3xl font-bold ${alerta ? "text-red-600" : "text-foreground"}`}>{valor}</p>
    </div>
  );
}
