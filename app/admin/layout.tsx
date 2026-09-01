import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  // O middleware já bloqueia não-admins; isto é uma segunda camada de defesa.
  if (perfil?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-surface px-4 py-6">
        <p className="mb-6 text-sm font-bold text-foreground">
          Admin — BRASIL <span className="text-brand">MULTI TECH</span>
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Visão geral</Link>
          <Link href="/admin/produtos" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Produtos</Link>
          <Link href="/admin/categorias" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Categorias</Link>
          <Link href="/admin/cupons" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Cupons</Link>
          <Link href="/admin/configuracoes" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Parcelamento</Link>
          <Link href="/admin/pedidos" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Pedidos</Link>
          <Link href="/admin/vender" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Venda de aparelhos</Link>
          <Link href="/admin/melhor-envio" className="rounded-lg px-3 py-2 hover:bg-[#f7f8fa]">Melhor Envio</Link>
          <Link href="/" className="mt-4 rounded-lg px-3 py-2 text-muted hover:bg-[#f7f8fa]">← Voltar à loja</Link>
        </nav>
      </aside>
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
