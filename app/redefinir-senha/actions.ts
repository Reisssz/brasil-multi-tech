"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type EstadoRedefinirSenha = { erro?: string } | null;

export async function redefinirSenha(
  _estadoAnterior: EstadoRedefinirSenha,
  formData: FormData
): Promise<EstadoRedefinirSenha> {
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (novaSenha.length < 8) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (novaSenha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const supabase = await createClient();

  // O link do e-mail já autenticou uma sessão temporária de recuperação
  // (via /auth/confirm, type=recovery) — sem ela, não há como saber de
  // qual conta é essa troca de senha.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "Esse link expirou ou já foi usado. Solicite um novo link de redefinição." };
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    console.error("[redefinir-senha] falha ao atualizar senha:", error.message);
    return { erro: "Não foi possível redefinir sua senha. Tente novamente." };
  }

  redirect("/login?senhaRedefinida=1");
}
