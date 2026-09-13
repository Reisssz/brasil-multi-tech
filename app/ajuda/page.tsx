import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { SITE, whatsappLink } from "@/lib/config";
import Link from "next/link";

export const metadata = { title: "Central de ajuda" };

const faqsComprar = [
  {
    question: "Quanto tempo leva para minha entrega chegar?",
    answer:
      "O prazo médio é de 3 a 10 dias úteis, dependendo da sua região. Assim que o pedido é enviado, você recebe o código de rastreamento por e-mail e pode acompanhar tudo na página de rastreamento.",
  },
  {
    question: "Posso parcelar no cartão de crédito?",
    answer:
      "Sim. O pagamento no cartão é processado pelo Mercado Pago, e as opções de parcelas — incluindo quais vêm sem juros — aparecem na tela de pagamento no momento da compra, de acordo com o seu cartão.",
  },
  {
    question: "O que significa um aparelho \"seminovo\"?",
    answer:
      "Aparelhos seminovos passam por um laudo técnico de 40 pontos, com bateria testada e reset de fábrica. Todos vêm com garantia e política de troca, assim como um aparelho novo.",
  },
  {
    question: "Como solicito troca ou devolução de uma compra?",
    answer:
      "Você tem até 7 dias corridos após o recebimento para se arrepender e pedir a devolução sem precisar de motivo, além da garantia contra defeitos. Peça pelo WhatsApp, telefone ou e-mail informando o número do pedido — veja todos os detalhes na página de Garantia, trocas e devolução.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer: "Aceitamos Pix, boleto bancário e cartão de crédito, processados com segurança pelo Mercado Pago.",
  },
];

const faqsVender = [
  {
    question: "Como vendo meu aparelho para a Brasil Multi Tech?",
    answer:
      "Preencha o formulário de venda com marca, modelo, armazenamento e o estado do aparelho (tela, carcaça e bateria). Você vê uma estimativa de valor na hora, e nossa equipe confirma os detalhes em seguida.",
  },
  {
    question: "Como funciona a avaliação do meu aparelho?",
    answer:
      "O valor inicial é calculado com base no que você informa no formulário. Depois de aceita a estimativa e recebido o aparelho, fazemos uma análise física para confirmar o estado real e validar o valor final.",
  },
  {
    question: "Como eu consulto ou aceito a oferta que recebi?",
    answer:
      "A estimativa aparece assim que você termina o formulário e fica registrada na sua conta. Você pode aceitar e seguir com o envio, ou recusar sem nenhum compromisso — uma oferta aceita vale por 10 dias.",
  },
  {
    question: "Como encontro o IMEI do meu aparelho?",
    answer:
      "No iPhone: Ajustes > Geral > Sobre. No Android: Configurações > Sobre o telefone > Status. Em qualquer aparelho, também funciona digitar *#06# no teclado de ligação — o IMEI também costuma estar na caixa original ou na etiqueta atrás do aparelho.",
  },
  {
    question: "Como preparo o aparelho antes de enviar?",
    answer:
      "Faça backup do que quiser manter, remova o chip e a capa/película, e apague seus dados e contas (veja a pergunta abaixo). Embale o aparelho com cuidado, de preferência na caixa original, seguindo as orientações que enviamos após aceitar a oferta.",
  },
  {
    question: "Como apago meus dados e removo contas vinculadas?",
    answer:
      "No iPhone, primeiro desative o Find My iPhone (Ajustes > [seu nome] > Buscar) e saia da conta Apple, depois vá em Ajustes > Geral > Transferir ou Redefinir iPhone > Apagar Conteúdo e Ajustes. No Android, remova sua conta Google e depois use Configurações > Sistema > Opções de redefinição > Restaurar dados de fábrica.",
  },
  {
    question: "Como funciona o envio do meu aparelho até vocês?",
    answer:
      "Depois que você aceita a oferta, te orientamos sobre a forma de envio ou entrega — sem nenhum custo para você. O prazo para o aparelho chegar até a Brasil Multi Tech é de até 15 dias corridos após a aceitação.",
  },
  {
    question: "Como acompanho minha solicitação de venda?",
    answer: "Pelo WhatsApp ou telefone, informando o número do seu pedido — nossa equipe atualiza você a cada etapa, do envio ao pagamento.",
  },
  {
    question: "Como funciona a análise técnica do aparelho?",
    answer:
      "Ao receber o aparelho, conferimos o IMEI e testamos o funcionamento geral, comparando com o que foi informado no formulário. Se encontrarmos alguma diferença, entramos em contato antes de qualquer decisão sobre o valor.",
  },
  {
    question: "Como e quando recebo o pagamento pela venda?",
    answer: "Via Pix ou transferência bancária, direto na sua conta, logo depois da confirmação do aparelho na análise física.",
  },
  {
    question: "Como falo com a Brasil Multi Tech?",
    answer: `Pelo WhatsApp ${SITE.whatsappDisplay}, telefone ${SITE.phoneDisplay}, e-mail ${SITE.supportEmail} ou na nossa loja física em Belém - PA. Veja todos os canais na página de contato.`,
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Central de ajuda</h1>
      <p className="text-muted mb-6">Tudo o que você precisa saber antes e depois de comprar ou vender.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-0.5 hover:border-whatsapp transition-colors"
        >
          <span className="text-xs text-muted uppercase">WhatsApp</span>
          <span className="font-semibold text-foreground text-sm">{SITE.whatsappDisplay}</span>
        </a>
        <a
          href={`tel:+55${SITE.phoneDisplay.replace(/\D/g, "")}`}
          className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-0.5 hover:border-brand transition-colors"
        >
          <span className="text-xs text-muted uppercase">Telefone</span>
          <span className="font-semibold text-foreground text-sm">{SITE.phoneDisplay}</span>
        </a>
        <a
          href={`mailto:${SITE.supportEmail}`}
          className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-0.5 hover:border-brand transition-colors"
        >
          <span className="text-xs text-muted uppercase">E-mail</span>
          <span className="font-semibold text-foreground text-sm break-all">{SITE.supportEmail}</span>
        </a>
      </div>

      <h2 className="font-display text-lg font-bold text-foreground mb-3">Vender seu aparelho</h2>
      <FaqAccordion items={faqsVender} />

      <h2 className="font-display text-lg font-bold text-foreground mb-3 mt-10">Comprar na Brasil Multi Tech</h2>
      <FaqAccordion items={faqsComprar} />

      <div className="mt-10 rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-foreground">Ainda tem dúvidas?</h2>
          <p className="text-sm text-muted">Fale com a gente pelos nossos canais de atendimento.</p>
        </div>
        <Link
          href="/contato"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0"
        >
          Ver contato
        </Link>
      </div>
    </div>
  );
}
