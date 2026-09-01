"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type EstadoProduto = { erro?: string } | null;

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

/**
 * Extrai as variações do formulário, mantendo o ÍNDICE ORIGINAL de cada
 * linha (antes do filtro por preço válido) — é esse índice que liga cada
 * variação aos seus campos de foto (varianteFotosExistentes_N), então
 * precisa sobreviver ao filtro.
 *
 * As fotos já chegam como URLs (varianteFotosExistentes_N) — o upload para
 * o Storage acontece direto no navegador (ver FormularioProduto.tsx), não
 * mais aqui. Enviar o arquivo binário pela Server Action quebrava em
 * produção com um erro de runtime da hospedagem em corpos multipart
 * grandes; como só texto passa por aqui agora, esse problema não existe.
 */
function extrairVariantes(formData: FormData) {
  const cores = formData.getAll("varianteCor") as string[];
  const coresHex = formData.getAll("varianteCorHex") as string[];
  const storages = formData.getAll("varianteStorage") as string[];
  const condicoes = formData.getAll("varianteCondicao") as string[];
  const precos = formData.getAll("variantePreco") as string[];
  const estoques = formData.getAll("varianteEstoque") as string[];
  const skus = formData.getAll("varianteSku") as string[];

  return cores
    .map((cor, i) => ({
      indiceOriginal: i,
      color: cor || null,
      color_hex: coresHex[i] || "#9aa0a6",
      storage_gb: storages[i] ? Number(storages[i]) : null,
      condition: condicoes[i] || "novo",
      price_cents: Math.round(Number(precos[i] ?? 0) * 100),
      stock: Number(estoques[i] ?? 0),
      sku: skus[i] || null,
      photos: formData.getAll(`varianteFotosExistentes_${i}`) as string[],
    }))
    .filter((v) => v.price_cents > 0);
}

export async function criarProduto(_estadoAnterior: EstadoProduto, formData: FormData): Promise<EstadoProduto> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const brand = String(formData.get("brand") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((h) => h.trim())
    .filter(Boolean);
  const warrantyMonths = Number(formData.get("warrantyMonths") ?? 12);
  const freeShipping = formData.get("freeShipping") === "on";

  const variantes = extrairVariantes(formData);

  if (!name || !categoryId || variantes.length === 0) {
    return { erro: "Preencha nome, categoria e ao menos uma variação com preço." };
  }

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: produto, error } = await supabase
    .from("products")
    .insert({
      slug,
      name,
      brand,
      category_id: categoryId,
      tagline,
      description,
      highlights,
      warranty_months: warrantyMonths,
      free_shipping: freeShipping,
      ativo: true,
    })
    .select("id")
    .single();

  if (error || !produto) {
    console.error("[admin/produtos] falha ao criar produto:", error?.message);
    return { erro: "Não foi possível salvar o produto." };
  }

  const { error: erroVariantes } = await supabase.from("product_variants").insert(
    variantes.map(({ indiceOriginal: _indiceOriginal, ...v }) => ({
      ...v,
      product_id: produto.id,
      sku: v.sku || `v-${slug}-${Math.random().toString(36).slice(2, 8)}`,
    }))
  );

  if (erroVariantes) {
    console.error("[admin/produtos] falha ao criar variantes:", erroVariantes.message);
    return { erro: "Produto criado, mas houve erro ao salvar as variações." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function atualizarProduto(
  produtoId: string,
  _estadoAnterior: EstadoProduto,
  formData: FormData
): Promise<EstadoProduto> {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return { erro: "Acesso negado." };

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const brand = String(formData.get("brand") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((h) => h.trim())
    .filter(Boolean);
  const warrantyMonths = Number(formData.get("warrantyMonths") ?? 12);
  const freeShipping = formData.get("freeShipping") === "on";
  const ativo = formData.get("ativo") === "on";

  if (!name || !categoryId) {
    return { erro: "Preencha nome e categoria." };
  }

  const { data: produtoAtual } = await supabase.from("products").select("slug").eq("id", produtoId).single();

  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand,
      category_id: categoryId,
      tagline,
      description,
      highlights,
      warranty_months: warrantyMonths,
      free_shipping: freeShipping,
      ativo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", produtoId);

  if (error) {
    console.error("[admin/produtos] falha ao atualizar produto:", error.message);
    return { erro: "Não foi possível salvar as alterações." };
  }

  // Variantes: a forma mais simples e segura de sincronizar uma lista
  // editável de variações é substituir todas — pedidos antigos não são
  // afetados porque guardam um snapshot em orders.items, não uma referência
  // viva à variante.
  const variantes = extrairVariantes(formData);

  if (variantes.length > 0) {
    await supabase.from("product_variants").delete().eq("product_id", produtoId);

    const { error: erroVariantes } = await supabase.from("product_variants").insert(
      variantes.map(({ indiceOriginal: _indiceOriginal, ...v }) => ({
        ...v,
        product_id: produtoId,
        sku: v.sku || `v-${produtoAtual?.slug ?? produtoId}-${Math.random().toString(36).slice(2, 8)}`,
      }))
    );

    if (erroVariantes) {
      console.error("[admin/produtos] falha ao atualizar variantes:", erroVariantes.message);
      return { erro: "Produto salvo, mas houve erro ao atualizar as variações." };
    }
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function removerProduto(produtoId: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  // Soft delete: mantém o produto no banco (histórico de pedidos antigos
  // continua íntegro), só some da loja.
  await supabase.from("products").update({ ativo: false }).eq("id", produtoId);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function reativarProduto(produtoId: string) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  await supabase.from("products").update({ ativo: true }).eq("id", produtoId);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
