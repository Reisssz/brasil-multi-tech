import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Variante = {
  id: string;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  photos: string[] | null;
  sku: string | null;
  condition: string;
};

type Produto = {
  id: string;
  name: string;
  brand: string | null;
  ativo: boolean;
  product_variants: Variante[];
};

/**
 * Painel de apoio ao item 4 do relatório técnico ("revisão de todos os
 * aparelhos cadastrados e valores reais") — não substitui a conferência
 * manual de cada aparelho, só destaca automaticamente os casos mais comuns
 * de cadastro incompleto/inconsistente pra facilitar essa revisão:
 * possíveis duplicados, produtos sem preço/variação, variação sem foto ou
 * sem código (SKU) e preço promocional que não é de fato um desconto.
 */
export default async function AuditoriaProdutos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, ativo, product_variants ( id, price_cents, compare_at_cents, stock, photos, sku, condition )")
    .order("name", { ascending: true });

  const produtos = (data ?? []) as unknown as Produto[];

  const semVariantes = produtos.filter((p) => p.product_variants.length === 0);
  const semPreco = produtos.filter(
    (p) => p.product_variants.length > 0 && p.product_variants.every((v) => !v.price_cents || v.price_cents <= 0)
  );
  const semFoto = produtos.flatMap((p) =>
    p.product_variants.filter((v) => !v.photos || v.photos.length === 0).map((v) => ({ produto: p, variante: v }))
  );
  const semSku = produtos.flatMap((p) =>
    p.product_variants.filter((v) => !v.sku).map((v) => ({ produto: p, variante: v }))
  );
  const precoPromoInvalido = produtos.flatMap((p) =>
    p.product_variants
      .filter((v) => v.compare_at_cents != null && v.compare_at_cents <= v.price_cents)
      .map((v) => ({ produto: p, variante: v }))
  );

  const grupos = new Map<string, Produto[]>();
  for (const p of produtos) {
    const chave = `${(p.brand ?? "").trim().toLowerCase()}|${p.name.trim().toLowerCase()}`;
    grupos.set(chave, [...(grupos.get(chave) ?? []), p]);
  }
  const possiveisDuplicados = Array.from(grupos.values()).filter((grupo) => grupo.length > 1);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Auditoria de cadastro</h1>
          <p className="text-sm text-muted mt-1">
            {produtos.length} aparelhos cadastrados no total. Use esta lista como ponto de partida pra revisão do
            item 4 do relatório — ela não substitui a conferência manual de preço/estoque real de cada aparelho.
          </p>
        </div>
        <Link href="/admin/produtos" className="text-sm font-semibold text-brand-dark hover:underline shrink-0">
          ← Voltar
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <Secao
          titulo="Possíveis cadastros duplicados"
          vazio="Nenhum nome+marca repetido encontrado."
          quantidade={possiveisDuplicados.length}
        >
          {possiveisDuplicados.map((grupo) => (
            <div key={grupo[0].id} className="rounded-xl bg-[#fff8ec] border border-[#f0d9a6] px-3 py-2 text-sm">
              <span className="font-semibold text-foreground">
                {grupo[0].brand} {grupo[0].name}
              </span>{" "}
              <span className="text-muted">— {grupo.length} cadastros:</span>{" "}
              {grupo.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <Link href={`/admin/produtos/${p.id}`} className="text-brand-dark hover:underline">
                    {p.ativo ? "ativo" : "inativo"}
                  </Link>
                </span>
              ))}
            </div>
          ))}
        </Secao>

        <Secao
          titulo="Produtos sem nenhuma variação cadastrada"
          vazio="Todos os produtos têm ao menos uma variação."
          quantidade={semVariantes.length}
        >
          {semVariantes.map((p) => (
            <LinhaProduto key={p.id} produto={p} />
          ))}
        </Secao>

        <Secao
          titulo="Produtos sem preço válido em nenhuma variação"
          vazio="Todos os produtos têm ao menos uma variação com preço."
          quantidade={semPreco.length}
        >
          {semPreco.map((p) => (
            <LinhaProduto key={p.id} produto={p} />
          ))}
        </Secao>

        <Secao
          titulo="Variações sem foto cadastrada"
          vazio="Todas as variações têm ao menos uma foto."
          quantidade={semFoto.length}
        >
          {semFoto.map(({ produto, variante }) => (
            <LinhaVariante key={variante.id} produto={produto} variante={variante} detalhe="sem foto" />
          ))}
        </Secao>

        <Secao
          titulo="Variações sem código (SKU) cadastrado"
          vazio="Todas as variações têm código cadastrado."
          quantidade={semSku.length}
        >
          {semSku.map(({ produto, variante }) => (
            <LinhaVariante key={variante.id} produto={produto} variante={variante} detalhe="sem código" />
          ))}
        </Secao>

        <Secao
          titulo="Preço \u201cde\u201d menor ou igual ao preço \u201cpor\u201d (desconto inválido)"
          vazio="Nenhuma variação com preço promocional inconsistente."
          quantidade={precoPromoInvalido.length}
        >
          {precoPromoInvalido.map(({ produto, variante }) => (
            <LinhaVariante
              key={variante.id}
              produto={produto}
              variante={variante}
              detalhe={`de ${formatCents(variante.compare_at_cents)} por ${formatCents(variante.price_cents)}`}
            />
          ))}
        </Secao>
      </div>
    </div>
  );
}

function formatCents(cents: number | null) {
  return ((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Secao({
  titulo,
  quantidade,
  vazio,
  children,
}: {
  titulo: string;
  quantidade: number;
  vazio: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-foreground mb-3">
        {titulo} <span className="text-muted font-normal">({quantidade})</span>
      </h2>
      {quantidade === 0 ? <p className="text-sm text-muted">{vazio}</p> : <div className="flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function LinhaProduto({ produto }: { produto: Produto }) {
  return (
    <Link
      href={`/admin/produtos/${produto.id}`}
      className="flex items-center justify-between rounded-xl bg-[#f7f8fa] px-3 py-2 text-sm hover:bg-[#eef0f3] transition-colors"
    >
      <span className="font-medium text-foreground">
        {produto.brand} {produto.name}
      </span>
      <span className={`text-xs ${produto.ativo ? "text-muted" : "text-red-500"}`}>{produto.ativo ? "Ativo" : "Inativo"}</span>
    </Link>
  );
}

function LinhaVariante({ produto, variante, detalhe }: { produto: Produto; variante: Variante; detalhe: string }) {
  return (
    <Link
      href={`/admin/produtos/${produto.id}`}
      className="flex items-center justify-between rounded-xl bg-[#f7f8fa] px-3 py-2 text-sm hover:bg-[#eef0f3] transition-colors"
    >
      <span className="font-medium text-foreground">
        {produto.brand} {produto.name} <span className="text-muted font-normal">({variante.condition})</span>
      </span>
      <span className="text-xs text-muted">{detalhe}</span>
    </Link>
  );
}
