import { getResendClient, EMAIL_FROM } from "./resend";
import { formatBRL } from "@/lib/pricing";
import { SITE } from "@/lib/config";

/**
 * E-mail com as instruções de postagem, disparado assim que o cliente
 * escolhe a forma de recebimento (ver definirRecebimento em
 * app/vender/formulario/actions.ts) — item 02 do relatório de ajustes.
 *
 * Não geramos uma etiqueta de postagem paga (isso exigiria integrar
 * coleta reversa via Melhor Envio, ainda não construído) — o código de
 * referência abaixo substitui a etiqueta: o cliente escreve esse código
 * no pacote, e a equipe identifica a solicitação por ele na chegada.
 */
export async function enviarEmailInstrucoesEnvio(params: {
  paraEmail: string;
  nomeCliente: string;
  solicitacaoId: string;
  brand: string;
  model: string;
  valorCents: number;
}) {
  if (process.env.FEATURE_EMAIL_VENDER_INSTRUCOES !== "true") {
    console.info("[email:vender-instrucoes] feature desativada — envio pulado.");
    return;
  }

  const { paraEmail, nomeCliente, solicitacaoId, brand, model, valorCents } = params;
  const primeiroNome = nomeCliente.trim().split(" ")[0] || nomeCliente;
  const codigo = solicitacaoId.slice(0, 8).toUpperCase();

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
                  Falta só enviar o aparelho, ${escapeHtml(primeiroNome)}!
                </h1>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#5b5f6a;">
                  Recebemos sua confirmação da venda do <strong>${escapeHtml(brand)} ${escapeHtml(model)}</strong>
                  por <strong>${formatBRL(valorCents)}</strong>. Assim que o aparelho chegar e conferirmos que
                  está de acordo com o combinado, o pagamento é liberado.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" style="background-color:#fafafa;border-radius:12px;padding:16px 18px;">
                  <tr><td style="font-size:12px;color:#9a9ea8;padding-bottom:4px;">Código de referência (escreva no pacote)</td></tr>
                  <tr><td style="font-size:20px;font-weight:700;color:#14161a;letter-spacing:1px;">#${codigo}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#14161a;">Como enviar:</p>
                <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:#5b5f6a;">
                  <li>Embale o aparelho com cuidado (de preferência na caixa original ou com plástico bolha).</li>
                  <li>Escreva o código <strong>#${codigo}</strong> em um papel dentro da caixa.</li>
                  <li>Envie via Correios ou transportadora de sua preferência para o endereço abaixo.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px;">
                <table role="presentation" width="100%" style="background-color:#fafafa;border-radius:12px;padding:16px 18px;">
                  <tr><td style="font-size:12px;color:#9a9ea8;padding-bottom:4px;">Endereço de entrega</td></tr>
                  <tr><td style="font-size:13px;color:#14161a;line-height:1.5;">${escapeHtml(SITE.address.line1)}<br/>${escapeHtml(SITE.address.line2)}<br/>CEP ${escapeHtml(SITE.address.zip)}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-size:11px;color:#9a9ea8;text-align:center;">
                  Dúvidas? Fale com a gente pelo WhatsApp.<br />
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
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: paraEmail,
      subject: `Instruções para enviar seu aparelho — código #${codigo}`,
      html,
    });
  } catch (erro) {
    console.error("[email:vender-instrucoes] falha ao enviar:", erro);
  }
}

function escapeHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
