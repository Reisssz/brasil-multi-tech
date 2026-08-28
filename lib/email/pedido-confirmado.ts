import { resend, EMAIL_FROM } from "./resend";
import { formatBRL } from "@/lib/pricing";

type ItemPedido = {
  nome: string;
  cor?: string | null;
  quantidade: number;
};

/**
 * E-mail de confirmação de pedido, disparado pelo webhook do Mercado Pago
 * assim que o pagamento é aprovado (ver app/api/mercadopago/webhook/route.ts).
 * Falha no envio nunca deve derrubar o webhook — só logamos o erro, porque
 * o pedido já foi confirmado de verdade no banco independente do e-mail.
 */
export async function enviarEmailPedidoConfirmado(params: {
  paraEmail: string;
  nomeCliente: string;
  pedidoId: string;
  itens: ItemPedido[];
  totalCents: number;
}) {
  // Feature flag: desativado por padrão enquanto o domínio de envio não
  // está verificado no Resend / o time não validou o e-mail em produção.
  // Pra ativar, defina FEATURE_EMAIL_PEDIDO_CONFIRMADO=true no ambiente.
  if (process.env.FEATURE_EMAIL_PEDIDO_CONFIRMADO !== "true") {
    console.info("[email:pedido-confirmado] feature desativada (FEATURE_EMAIL_PEDIDO_CONFIRMADO !== \"true\") — envio pulado.");
    return;
  }

  const { paraEmail, nomeCliente, pedidoId, itens, totalCents } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const numeroPedido = pedidoId.slice(0, 8).toUpperCase();
  const primeiroNome = nomeCliente.trim().split(" ")[0] || nomeCliente;
  const linkRastreio = `${siteUrl}/pedido/rastreio?id=${pedidoId}`;

  const linhasItens = itens
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:13px;color:#14161a;">
            ${item.quantidade}x ${escapeHtml(item.nome)}${item.cor ? ` — ${escapeHtml(item.cor)}` : ""}
          </td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f6;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">

            <tr>
              <td style="background-color:#14161a;padding:28px 32px;text-align:center;">
                <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
                  BRASIL <span style="color:#e0a300;">MULTI TECH</span>
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#14161a;">
                  Pagamento confirmado, ${escapeHtml(primeiroNome)}!
                </h1>
                <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#5b5f6a;">
                  Recebemos a confirmação do pagamento do seu pedido. Já estamos preparando tudo para o envio.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" style="background-color:#fafafa;border-radius:12px;padding:16px 18px;">
                  <tr>
                    <td style="font-size:12px;color:#9a9ea8;padding-bottom:4px;">Número do pedido</td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;font-weight:700;color:#14161a;padding-bottom:10px;">#${numeroPedido}</td>
                  </tr>
                  <tr><td>${linhasItens}</td></tr>
                  <tr>
                    <td style="padding-top:12px;font-size:14px;font-weight:700;color:#14161a;">
                      Total: ${formatBRL(totalCents)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 32px 32px;text-align:center;">
                <a href="${linkRastreio}"
                   style="display:inline-block;background-color:#e0a300;color:#14161a;text-decoration:none;
                          font-weight:700;font-size:14px;padding:14px 32px;border-radius:999px;">
                  Acompanhar meu pedido
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-size:11px;color:#9a9ea8;text-align:center;">
                  Dúvidas sobre o pedido? Fale com a gente pela Central de Ajuda.<br />
                  © Brasil Multi Tech — todos os direitos reservados.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: paraEmail,
      subject: `Pedido confirmado #${numeroPedido} — Brasil Multi Tech`,
      html,
    });
  } catch (erro) {
    console.error("[email:pedido-confirmado] falha ao enviar:", erro);
  }
}

function escapeHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
