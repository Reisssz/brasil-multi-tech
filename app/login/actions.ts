"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type EstadoLogin = { erro?: string } | null;

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

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const redirectPara = String(formData.get("redirectPara") ?? "/conta");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    await logActivity(supabase, "login_failed", null, { email });
    if (error.message.includes("Invalid login credentials")) {
      return { erro: "E-mail ou senha incorretos." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { erro: "Confirme seu e-mail antes de entrar." };
    }
    return { erro: "Não foi possível entrar. Tente novamente." };
  }

  await logActivity(supabase, "login", data.user.id, { email });
  redirect(redirectPara || "/conta");
}
