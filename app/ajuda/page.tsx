import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PRICING_RULES } from "@/lib/pricing";
import { whatsappLink } from "@/lib/config";

const faqs = [
  {
    question: "Quanto tempo leva para minha entrega chegar?",
    answer:
      "O prazo médio é de 3 a 10 dias úteis, dependendo da sua região. Assim que o pedido é enviado, você recebe o código de rastreamento por e-mail e pode acompanhar tudo na página de rastreamento.",
  },
  {
    question: "Como funciona o desconto no Pix?",
    answer: `Pagando via Pix você recebe ${PRICING_RULES.pixDiscountPercent}% de desconto automático no valor total da compra, aplicado direto no checkout, sem cupom.`,
  },
  {
    question: `Posso parcelar em até ${PRICING_RULES.maxInstallments}x?`,
    answer: `Sim. Compras no cartão de crédito podem ser parceladas em até ${PRICING_RULES.maxInstallments}x, sendo as primeiras ${PRICING_RULES.interestFreeUpTo}x sem juros.`,
  },
  {
    question: "O que significa um aparelho \"seminovo\"?",
    answer:
      "Aparelhos seminovos passam por um laudo técnico de 40 pontos, com bateria testada e reset de fábrica. Todos vêm com garantia e política de troca, assim como um aparelho novo.",
  },
  {
    question: "Como faço para trocar ou devolver um produto?",
    answer:
      "Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução sem custo, além da garantia. Veja todos os detalhes na página de Garantia e trocas.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer: "Aceitamos Pix, boleto bancário e cartão de crédito, processados com segurança pelo Mercado Pago.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Central de ajuda</h1>
      <p className="text-muted mb-8">Tudo o que você precisa saber antes e depois da compra.</p>
      <FaqAccordion items={faqs} />

      <div className="mt-10 rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-foreground">Ainda tem dúvidas?</h2>
          <p className="text-sm text-muted">Fale agora com um consultor pelo WhatsApp.</p>
        </div>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
