import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/config";

export const metadata = { title: "Garantia, trocas e devolução" };

const sections = [
  {
    title: "Garantia Brasil Multi Tech",
    body:
      "Todos os produtos novos contam com garantia de fábrica somada à garantia estendida da Brasil Multi Tech. Aparelhos seminovos têm garantia de 6 meses cobrindo defeitos de fabricação e funcionamento, incluindo bateria, tela e câmeras — além da garantia legal de 90 dias prevista no Código de Defesa do Consumidor.",
  },
  {
    title: "O que a garantia cobre",
    body:
      "Defeitos de fabricação, mau funcionamento de componentes internos (bateria, tela, câmera, botões, conectores) e problemas de software originados de defeito de hardware.",
  },
  {
    title: "O que não é coberto",
    body:
      "Danos por queda ou mau uso (telas trincadas, por exemplo), danos por contato com líquido, desgaste natural da bateria, violação do lacre ou conserto por assistência não autorizada, vícios aparentes não relatados em até 7 dias do recebimento, e aparelhos com IMEI removido ou adulterado.",
  },
  {
    title: "Quando você pode pedir troca ou devolução",
    body:
      "Em duas situações: (1) arrependimento da compra, sem precisar de motivo, em até 7 dias corridos do recebimento — direito garantido em toda compra feita fora da loja física; ou (2) quando o aparelho apresenta um defeito coberto pela garantia (veja o que é coberto acima), a qualquer momento dentro do prazo de garantia.",
  },
  {
    title: "Prazos e condições",
    body:
      "Arrependimento: até 7 dias corridos após o recebimento. Defeito de fabricação: até 90 dias corridos (garantia legal) ou até 6 meses para aparelhos seminovos vendidos pela Brasil Multi Tech. Em ambos os casos, o produto deve estar completo, com todos os acessórios que acompanharam a entrega e, sempre que possível, a nota fiscal.",
  },
  {
    title: "Estado necessário do aparelho e dos acessórios",
    body:
      "O aparelho deve ser devolvido no mesmo estado em que foi recebido, sem danos causados por uso inadequado, com o número de série/IMEI intacto e legível — ele é conferido no recebimento da devolução para confirmar que é o mesmo aparelho enviado. Inclua a caixa, o carregador (quando enviado) e os demais itens recebidos.",
  },
  {
    title: "Como abrir uma solicitação",
    body:
      "Entre em contato pelo WhatsApp, telefone ou e-mail informando o número do pedido e o motivo (arrependimento ou defeito identificado, com fotos ou vídeo sempre que possível). Nossa equipe confirma os dados e te dá um número de acompanhamento para a solicitação.",
  },
  {
    title: "Como enviar o aparelho de volta",
    body:
      "Depois que a solicitação é confirmada, orientamos a forma de postagem — a logística reversa é organizada pela Brasil Multi Tech, sem custo para você nos casos previstos nesta política. Embale o aparelho com cuidado (de preferência na embalagem original) e use um método de envio com rastreamento; recomendamos isso porque a responsabilidade pelo aparelho durante o transporte de volta é de quem envia, até a entrega na Brasil Multi Tech.",
  },
  {
    title: "Como funciona a análise do aparelho",
    body:
      "Ao receber o aparelho, conferimos o IMEI e o estado de conservação e realizamos uma análise técnica para confirmar o defeito relatado (quando for o caso). Em caso de troca, o aparelho substituto só é enviado depois que o original chega e passa por essa conferência.",
  },
  {
    title: "Forma e prazo de restituição",
    body:
      "A Brasil Multi Tech tem até 7 dias corridos, a partir do recebimento do aparelho, para cadastrar a devolução e processar o reembolso. A restituição é feita pelo mesmo meio de pagamento usado na compra (ou Pix, quando combinado), incluindo o frete original quando exigido pela legislação, em até 15 dias úteis.",
  },
  {
    title: "Canais de atendimento",
    body: `WhatsApp ${SITE.whatsappDisplay}, telefone ${SITE.phoneDisplay}, e-mail ${SITE.supportEmail}, ou pessoalmente na loja física em ${SITE.address.line1}, ${SITE.address.line2}.`,
  },
];

export default function WarrantyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Garantia, trocas e devolução</h1>
      <p className="text-muted mb-8">
        Transparência do início ao fim: veja exatamente como funciona a nossa garantia e a política de trocas e
        devolução.
      </p>

      <div className="mb-8 rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-foreground">Precisa trocar ou devolver seu pedido?</h2>
          <p className="text-sm text-muted">Fale com a gente agora pelo WhatsApp e receba seu número de solicitação.</p>
        </div>
        <a
          href={whatsappLink("Olá! Quero solicitar uma troca ou devolução do meu pedido.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-whatsapp hover:bg-whatsapp-dark text-whatsapp-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0"
        >
          Solicitar troca ou devolução
        </a>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-bold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm text-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">
          Veja também os detalhes legais completos na página de <Link href="/termos" className="text-brand-dark font-semibold hover:underline underline-offset-2">Termos e Condições</Link>.
        </p>
        <Link
          href="/ajuda"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0 whitespace-nowrap"
        >
          Central de ajuda
        </Link>
      </div>
    </div>
  );
}
