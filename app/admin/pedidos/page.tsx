import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const rotuloStatus: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default async function AdminPedidos() {
  const supabase = await createClient();

  const { data: pedidosBrutos } = await supabase
    .from("orders")
    .select("id, user_id, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const idsUsuarios = [...new Set((pedidosBrutos ?? []).map((p) => p.user_id).filter(Boolean))];
  const { data: perfis } = idsUsuarios.length
    ? await supabase.from("profiles").select("id, nome_completo").in("id", idsUsuarios)
    : { data: [] };
  const nomePorId = new Map((perfis ?? []).map((p) => [p.id, p.nome_completo]));

  const pedidos = (pedidosBrutos ?? []).map((p) => ({
    ...p,
    nomeCliente: p.user_id ? nomePorId.get(p.user_id) ?? "—" : "—",
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Pedidos</h1>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8fa] text-left text-muted">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${pedido.id}`} className="font-medium text-foreground hover:text-brand">
                    #{pedido.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{pedido.nomeCliente}</td>
                <td className="px-4 py-3">
                  {pedido.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3">{rotuloStatus[pedido.status] ?? pedido.status}</td>
                <td className="px-4 py-3 text-muted">{new Date(pedido.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pedidos.length === 0 && <p className="px-4 py-8 text-center text-muted">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
