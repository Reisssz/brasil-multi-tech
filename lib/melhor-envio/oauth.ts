import { createAdminClient } from "@/lib/supabase/admin";

const AUTH_BASE_URL = process.env.MELHOR_ENVIO_BASE_URL!.includes("sandbox")
  ? "https://sandbox.melhorenvio.com.br"
  : "https://www.melhorenvio.com.br";

const SCOPES = [
  "cart-write",
  "cart-read",
  "shipping-calculate",
  "shipping-cancel",
  "shipping-checkout",
  "shipping-companies",
  "shipping-generate",
  "shipping-preview",
  "shipping-print",
  "shipping-share",
  "shipping-tracking",
  "ecommerce-shipping",
].join(" ");

export function urlDeAutorizacao(state: string) {
  const url = new URL("/oauth/authorize", AUTH_BASE_URL);
  url.searchParams.set("client_id", process.env.MELHOR_ENVIO_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.MELHOR_ENVIO_REDIRECT_URI!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function trocarCodigoPorToken(code: string) {
  const resposta = await fetch(`${AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
      client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
      redirect_uri: process.env.MELHOR_ENVIO_REDIRECT_URI,
      code,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao trocar code por token: ${resposta.status} ${await resposta.text()}`);
  }

  const dados = (await resposta.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  await salvarToken(dados);
  return dados;
}

async function renovarToken(refreshToken: string) {
  const resposta = await fetch(`${AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
      client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao renovar token: ${resposta.status} ${await resposta.text()}`);
  }

  const dados = (await resposta.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  await salvarToken(dados);
  return dados;
}

async function salvarToken(dados: { access_token: string; refresh_token: string; expires_in: number }) {
  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + dados.expires_in * 1000).toISOString();

  await supabase.from("melhor_envio_tokens").upsert({
    id: true,
    access_token: dados.access_token,
    refresh_token: dados.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
}

export async function obterTokenValido(): Promise<string> {
  const supabase = createAdminClient();

  const { data: registro } = await supabase
    .from("melhor_envio_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("id", true)
    .single();

  if (!registro) {
    throw new Error("Melhor Envio ainda não foi conectado. Acesse /admin/melhor-envio e autorize o app.");
  }

  const expiraEm = new Date(registro.expires_at).getTime();
  const margemUmDia = 24 * 60 * 60 * 1000;

  if (Date.now() > expiraEm - margemUmDia) {
    const renovado = await renovarToken(registro.refresh_token);
    return renovado.access_token;
  }

  return registro.access_token;
}
