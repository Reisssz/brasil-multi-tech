import { getResendClient, EMAIL_FROM } from "./resend";
import { formatBRL } from "@/lib/pricing";

/**
 * Envia uma cópia do contrato assinado pro cliente (item 05 do relatório:
 * "o cliente deverá receber o contrato pelo e-mail cadastrado" e "envio de
 * uma cópia assinada ao cliente"). Disparado por assinarContrato() em
 * app/vender/formulario/actions.ts assim que o aceite é registrado.
 *
 * Isso NÃO é uma plataforma de assinatura eletrônica de terceiros (tipo
 * ZapSign/Clicksign) — é um aceite eletrônico simples (nome digitado +
 * data/hora registrados no banco), com o texto do contrato já preenchido
 * automaticamente. Ver observação sobre plataforma de assinatura no
 * relatório — precisa de uma conta/API key pra integrar de verdade.
 */
export async function enviarEmailContrato(params: {
  paraEmail: string;
  nomeCliente: string;
  solicitacaoId: string;
  brand: string;
  model: string;
  storageGb: number | null;
  color: string | null;
  imei: string | null;
  valorCents: number;
  assinadoEm: string;
}) {
  if (process.env.FEATURE_EMAIL_VENDER_CONTRATO !== "true") {
    console.info("[email:vender-contrato] feature desativada — envio pulado.");
    return;
  }

  const { paraEmail, nomeCliente, solicitacaoId, brand, model, storageGb, color, imei, valorCents, assinadoEm } = params;
  const codigo = solicitacaoId.slice(0, 8).toUpperCase();
  const dataFormatada = new Date(assinadoEm).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f6;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">
            <tr>
              <td style="background-color:#14161a;padding:28px 32px;text-align:center;">
                <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
                  BRASIL <span style="color:#e0a300;">MULTI TECH</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#14161a;">Contrato de venda — cópia</h1>
                <p style="margin:0 0 20px 0;font-size:13px;color:#9a9ea8;">Solicitação #${codigo} · assinado em ${dataFormatada}</p>
                <div style="font-size:13px;line-height:1.7;color:#3f434b;">
                  <p style="margin:0 0 10px 0;">
                    Pelo presente termo, <strong>${escapeHtml(nomeCliente)}</strong> declara ser o legítimo
                    proprietário do aparelho <strong>${escapeHtml(brand)} ${escapeHtml(model)}${storageGb ? ` ${storageGb}GB` : ""}${color ? `, cor ${escapeHtml(color)}` : ""}</strong>${imei ? `, IMEI <strong>${escapeHtml(imei)}</strong>` : ""},
                    e concorda em vendê-lo à Brasil Multi Tech pelo valor de <strong>${formatBRL(valorCents)}</strong>,
                    com pagamento em até 10 dias corridos após o recebimento e a conferência do aparelho.
                  </p>
                  <p style="margin:0;">
                    As informações sobre o estado do aparelho fornecidas no formulário são declaradas verdadeiras
                    pelo vendedor, que está ciente de que o valor final pode ser ajustado caso a inspeção física
                    identifique divergências relevantes.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-size:11px;color:#9a9ea8;text-align:center;">
                  Guarde este e-mail como comprovante do acordo.<br />
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
      subject: `Contrato de venda #${codigo} — Brasil Multi Tech`,
      html,
    });
  } catch (erro) {
    console.error("[email:vender-contrato] falha ao enviar:", erro);
  }
}

function escapeHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
