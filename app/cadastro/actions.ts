"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type EstadoCadastro = { erro?: string } | null;

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventType: string,
  userId: string | null,
  metadata: Record<string, unknown> = {}
) {
  const headerList = await headers();
  await supabase.from("activity_logs").insert({
    user_id: userId,
    event_type: eventType,
    metadata,
    ip_address: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: headerList.get("user-agent") ?? null,
  });
}

export async function cadastrar(
  _estadoAnterior: EstadoCadastro,
  formData: FormData
): Promise<EstadoCadastro> {
  const nomeCompleto = String(formData.get("nomeCompleto") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const cpf = String(formData.get("cpf") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (!nomeCompleto || !email || !senha) {
    return { erro: "Preencha nome, e-mail e senha." };
  }
  if (senha.length < 8) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome_completo: nomeCompleto,
        telefone: telefone || null,
        cpf: cpf ? cpf.replace(/\D/g, "") : null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { erro: "Este e-mail já está cadastrado. Tente fazer login." };
    }
    return { erro: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  await logActivity(supabase, "signup", data.user?.id ?? null, { email });

  if (!data.session) {
    redirect("/cadastro/verifique-seu-email");
  }

  redirect("/conta");
}
