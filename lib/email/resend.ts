import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Precisa ser um remetente de um domínio verificado no Resend (dashboard >
// Domains > Add Domain, com os registros DNS apontados) — sem isso o envio
// falha.
export const EMAIL_FROM = process.env.RESEND_EMAIL_FROM ?? "Brasil Multi Tech <pedidos@brasilmultitech.com.br>";
