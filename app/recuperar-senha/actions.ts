"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoRecuperarSenha = { erro?: string; enviado?: boolean } | null;

export async function solicitarRecuperacaoSenha(
  _estadoAnterior: EstadoRecuperarSenha,
  formData: FormData
): Promise<EstadoRecuperarSenha> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { erro: "Informe seu e-mail." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
  });

  if (error) {
    console.error("[recuperar-senha] falha ao solicitar redefinição:", error.message);
  }

  // Sempre retorna "enviado", mesmo se o e-mail não existir na base — não
  // revelamos se um e-mail tem conta ou não, senão esse formulário vira uma
  // forma de descobrir quem é cliente da loja.
  return { enviado: true };
}
