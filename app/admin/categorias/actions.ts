"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function criarCategoria(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const shortLabel = String(formData.get("shortLabel") ?? "").trim() || nome;
  if (!nome) return;

  const supabase = await createClient();
  await supabase.from("categories").insert({ nome, slug: slugify(nome), short_label: shortLabel });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function removerCategoria(categoriaId: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoriaId);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
