import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { removerProduto, reativarProduto } from "./actions";

export default async function AdminProdutos() {
  const supabase = await createClient();

  const { data: produtosBrutos } = await supabase
    .from("products")
    .select(
      "id, name, brand, ativo, categories ( nome ), product_variants ( price_cents, stock, photos )"
    )
    .order("created_at", { ascending: false });

  const produtos = (produtosBrutos ?? []).map((p) => ({
    ...p,
    categoriaNome: Array.isArray(p.categories) ? p.categories[0]?.nome : (p.categories as { nome: string } | null)?.nome,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand hover:bg-brand-dark px-5 text-sm font-semibold text-brand-foreground transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8fa] text-left text-muted">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço (a partir de)</th>
              <th className="px-4 py-3">Estoque total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => {
              const precos = produto.product_variants.map((v) => v.price_cents);
              const precoMinimo = precos.length > 0 ? Math.min(...precos) : 0;
              const estoqueTotal = produto.product_variants.reduce((s, v) => s + v.stock, 0);
              const foto = produto.product_variants.find((v) => v.photos?.[0])?.photos?.[0];

              return (
                <tr key={produto.id} className="border-t border-border">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f0f1f4] flex items-center justify-center text-[10px] text-muted">
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={/^https?:\/\//.test(foto) ? foto : `/products/${foto}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "sem foto"
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/produtos/${produto.id}`} className="font-medium text-foreground hover:text-brand">
                        {produto.name}
                      </Link>
                      <p className="text-xs text-muted">{produto.brand}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{produto.categoriaNome ?? "—"}</td>
                  <td className="px-4 py-3">
                    {(precoMinimo / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={estoqueTotal === 0 ? "text-red-600 font-semibold" : ""}>{estoqueTotal}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        produto.ativo ? "bg-success-light text-success" : "bg-[#eef0f3] text-muted"
                      }`}
                    >
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {produto.ativo ? (
                      <form action={removerProduto.bind(null, produto.id)}>
                        <button type="submit" className="text-xs text-red-500 hover:underline">
                          Remover
                        </button>
                      </form>
                    ) : (
                      <form action={reativarProduto.bind(null, produto.id)}>
                        <button type="submit" className="text-xs text-brand-dark hover:underline">
                          Reativar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {produtos.length === 0 && (
          <p className="px-4 py-8 text-center text-muted">Nenhum produto cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
