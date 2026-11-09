import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Clientes" };

const POR_PAGINA = 30;

function formatarCpf(cpf: unknown) {
  const digitos = typeof cpf === "string" ? cpf.replace(/\D/g, "") : "";
  if (digitos.length !== 11) return digitos || "—";
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatarData(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

export default async function AdminClientes({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const { pagina } = await searchParams;
  const paginaAtual = Math.max(1, Number.parseInt(pagina ?? "1", 10) || 1);

  // A leitura de e-mail/CPF usa service role; por isso a checagem de admin é refeita aqui, sem depender só do layout.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: perfilAdmin } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (perfilAdmin?.role !== "admin") notFound();

  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const { data: perfis, count } = await supabase
    .from("profiles")
    .select("id, nome_completo, telefone, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(inicio, inicio + POR_PAGINA - 1);

  const ids = (perfis ?? []).map((p) => p.id);
  const supabaseAdmin = createAdminClient();

  const [contas, { data: pedidos }] = await Promise.all([
    Promise.all(ids.map((id) => supabaseAdmin.auth.admin.getUserById(id))),
    ids.length ? supabase.from("orders").select("user_id").in("user_id", ids) : Promise.resolve({ data: [] }),
  ]);

  const contaPorId = new Map(contas.map((c) => [c.data.user?.id, c.data.user]));
  const pedidosPorId = new Map<string, number>();
  for (const p of pedidos ?? []) {
    if (p.user_id) pedidosPorId.set(p.user_id, (pedidosPorId.get(p.user_id) ?? 0) + 1);
  }

  const total = count ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-sm text-muted">{total} cadastro{total === 1 ? "" : "s"}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8fa] text-left text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Último acesso</th>
              <th className="px-4 py-3 text-right">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {(perfis ?? []).map((p) => {
              const conta = contaPorId.get(p.id);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.nome_completo || "—"}
                    {p.role === "admin" && (
                      <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-dark">admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {conta?.email ?? "—"}
                    {conta && !conta.email_confirmed_at && (
                      <span className="ml-2 text-[10px] font-semibold text-amber-600">não confirmado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.telefone || "—"}</td>
                  <td className="px-4 py-3 text-muted tabular-nums">{formatarCpf(conta?.user_metadata?.cpf)}</td>
                  <td className="px-4 py-3 text-muted">{formatarData(p.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{formatarData(conta?.last_sign_in_at)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{pedidosPorId.get(p.id) ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(perfis ?? []).length === 0 && <p className="px-4 py-8 text-center text-muted">Nenhum cliente cadastrado ainda.</p>}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {paginaAtual > 1 ? (
            <Link href={`/admin/clientes?pagina=${paginaAtual - 1}`} className="font-medium text-brand-dark hover:underline">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Página {paginaAtual} de {totalPaginas}
          </span>
          {paginaAtual < totalPaginas ? (
            <Link href={`/admin/clientes?pagina=${paginaAtual + 1}`} className="font-medium text-brand-dark hover:underline">
              Próxima →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
