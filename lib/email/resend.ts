import { Resend } from "resend";

let cliente: Resend | null = null;

/**
 * Instancia o cliente só na hora do envio (nunca no carregamento do
 * módulo) — o construtor do Resend lança erro se RESEND_API_KEY estiver
 * ausente, e como esse módulo é importado pela rota do webhook, isso
 * derrubava o build inteiro na Netlify enquanto a chave não estava
 * configurada, mesmo com a feature desativada.
 */
export function getResendClient(): Resend {
  if (!cliente) {
    cliente = new Resend(process.env.RESEND_API_KEY);
  }
  return cliente;
}

// Precisa ser um remetente de um domínio verificado no Resend (dashboard >
// Domains > Add Domain, com os registros DNS apontados) — sem isso o envio
// falha.
export const EMAIL_FROM = process.env.RESEND_EMAIL_FROM ?? "Brasil Multi Tech <pedidos@brasilmultitech.com.br>";
