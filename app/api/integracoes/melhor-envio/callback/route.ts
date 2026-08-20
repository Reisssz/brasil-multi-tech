import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trocarCodigoPorToken } from "@/lib/melhor-envio/oauth";

/**
 * URL de callback (redirect_uri) do app Melhor Envio. Cadastre EXATAMENTE:
 *   https://www.brasilmultitech.com.br/api/integracoes/melhor-envio/callback
 * em Integrações > Área Dev > seu aplicativo > "URL de redirecionamento".
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const erroRecebido = request.nextUrl.searchParams.get("error");

  const cookieStore = await cookies();
  const stateEsperado = cookieStore.get("melhor_envio_oauth_state")?.value;
  cookieStore.delete("melhor_envio_oauth_state");

  const urlBase = process.env.NEXT_PUBLIC_SITE_URL!;

  if (erroRecebido) {
    return NextResponse.redirect(`${urlBase}/admin/melhor-envio?erro=${encodeURIComponent("autorização negada")}`);
  }

  if (!code || !state || state !== stateEsperado) {
    return NextResponse.redirect(
      `${urlBase}/admin/melhor-envio?erro=${encodeURIComponent("requisição inválida ou expirada, tente novamente")}`
    );
  }

  try {
    await trocarCodigoPorToken(code);
    return NextResponse.redirect(`${urlBase}/admin/melhor-envio?sucesso=1`);
  } catch (erro) {
    console.error("[melhor-envio-oauth] falha na troca de token:", erro);
    return NextResponse.redirect(`${urlBase}/admin/melhor-envio?erro=${encodeURIComponent("falha ao conectar")}`);
  }
}
