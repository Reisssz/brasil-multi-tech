import Link from "next/link";
import { SITE } from "@/lib/config";

export const metadata = { title: "Termos e Condições" };

type Secao = { id: string; title: string; paragraphs: string[]; list?: string[] };

const secoes: Secao[] = [
  {
    id: "quem-somos",
    title: "1. Quem somos e o que é este documento",
    paragraphs: [
      "Este documento disciplina o acesso ao site www.brasilmultitech.com.br (\"Site\") e as operações realizadas pelos canais oficiais da Brasil Multi Tech. A continuidade da navegação ou a conclusão de uma transação implica ciência destes Termos, observada a legislação aplicável.",
      "29.853.621 CRISTIAN BRASIL DE FREITAS, empresário individual, inscrito no CNPJ/MF sob o nº 29.853.621/0001-08, nome fantasia BRASIL MULTI TECH, com sede em Rua Conselheiro João Alfredo, nº 236, térreo, Loja C26, Campina, Belém/PA, CEP 66013-000 (\"Brasil Multi Tech\").",
      "O Site destina-se a comercializar e/ou realizar trocas de smartphones e tablets novos, usados e seminovos (\"Produtos\"), bem como divulgar anúncios, pesquisas e outras informações relativas ao mercado de aparelhos eletrônicos.",
      `Dúvidas ou comentários podem ser enviados para ${SITE.supportEmail}, pelo telefone ${SITE.phoneDisplay} ou pelos canais oficiais indicados no rodapé deste Site.`,
    ],
  },
  {
    id: "uso-do-site",
    title: "2. Uso do site e conduta do interessado",
    paragraphs: [
      "O acesso ao Site e todas as operações nele realizadas são regidos por estes Termos, aplicáveis a toda pessoa que acessar o Site (\"Interessado\"), inclusive para comprar, vender ou trocar Produtos, ou para realizar qualquer pesquisa relacionada.",
      "Ao acessar o Site, o Interessado concorda com estas condições e se responsabiliza, com exclusividade, por todos os atos praticados no Site ou a ele relacionados. Recomendamos manter uma cópia destes Termos para referência futura.",
      "O Interessado deve usar o Site apenas para os fins a que se destina, para uso pessoal e não comercial. Não é permitido, entre outras condutas:",
    ],
    list: [
      "Enviar arquivos corrompidos, com vírus, ou conteúdo erótico, discriminatório, difamatório ou que faça apologia a crime, violência ou uso de drogas;",
      "Enviar informações falsas, sigilosas, de titularidade de terceiros ou que possam confundir outro Interessado, nem assumir a identidade de outra pessoa;",
      "Utilizar os dados publicados no Site para finalidade diferente da compra, venda ou troca de um Produto anunciado;",
      "Baixar, reproduzir, distribuir ou alterar o Site ou qualquer conteúdo nele publicado (inclusive fotografias), fora do uso pessoal normal de navegação e compra;",
      "Criar links para o Site sem autorização prévia por escrito, ou praticar qualquer ato que possa causar prejuízo ao Site, à Brasil Multi Tech ou a terceiros.",
    ],
  },
  {
    id: "propriedade-intelectual",
    title: "3. Propriedade intelectual e disponibilidade do site",
    paragraphs: [
      "Pertencem à Brasil Multi Tech todos os direitos intelectuais sobre o Site — software, identidade visual, bases de dados e demais conteúdos criados por ela ou por terceiros a seu pedido. As marcas exibidas no Site não podem ser usadas por qualquer Interessado sob nenhuma forma.",
      "O Site pode conter links para sites de terceiros, que não são de titularidade da Brasil Multi Tech nem estão sob seu controle; a Brasil Multi Tech não se responsabiliza pelas informações, operações ou conteúdos neles disponibilizados.",
      "A Brasil Multi Tech emprega esforços razoáveis para manter a precisão das informações do Site, mas não garante que o Site estará livre de erros, indisponibilidades ou que atenderá integralmente às necessidades do Interessado. Estes Termos e as funcionalidades do Site podem ser alterados a qualquer momento, valendo a partir da publicação da alteração.",
      "A Brasil Multi Tech pode suspender ou cancelar, a qualquer momento e sem aviso prévio, a conta ou o pedido de um Interessado em caso de descumprimento destes Termos, impossibilidade de verificar a identidade do Interessado, indícios de fraude, ou conduta capaz de causar danos a terceiros.",
    ],
  },
  {
    id: "cadastro",
    title: "4. Cadastro e responsabilidade do usuário",
    paragraphs: [
      "Para navegar, ver preços e condições dos Produtos, não é necessário cadastro. Para finalizar uma compra, venda ou troca, e para ver detalhes de pagamento e entrega, o cadastro é obrigatório, com preenchimento de nome e e-mail.",
      "As informações do cadastro são tratadas conforme a Política de Privacidade da Brasil Multi Tech e a legislação aplicável (LGPD). O uso dos dados para comunicações comerciais depende de base legal adequada e, quando necessário, de consentimento — sempre com meios de oposição ou cancelamento disponíveis ao titular. O Interessado é responsável pela exatidão dos dados fornecidos.",
      "Ao se cadastrar, o Interessado pode optar por receber a newsletter da Brasil Multi Tech; o cancelamento pode ser feito a qualquer momento pelo link no próprio e-mail.",
      `Para cancelar o cadastro ou um pedido, o Interessado deve contatar a Brasil Multi Tech pelo e-mail ${SITE.supportEmail}, telefone ${SITE.phoneDisplay} ou demais canais oficiais.`,
    ],
  },
  {
    id: "comprar",
    title: "5. Como funciona a compra de um Produto",
    paragraphs: [
      "A Brasil Multi Tech é parte em todo contrato de compra feito pelo Site. O pagamento do valor total é recebido antes da confirmação do pedido; após o recebimento, um e-mail é enviado ao Interessado confirmando nome, número do pedido e valor total — essa confirmação formaliza o contrato entre as partes.",
      "Caso um erro ou imprecisão de preço seja identificado após a compra, a Brasil Multi Tech entra em contato pelo e-mail cadastrado para informar o valor correto e confirmar a continuidade do pedido ou seu cancelamento.",
      "Se o Produto não estiver disponível em estoque no momento da compra, o valor debitado é integralmente reembolsado em até 15 dias úteis, conforme a forma de pagamento (cartão ou boleto), sem compensação adicional além do reembolso.",
      "Os Produtos são testados por profissionais capacitados e classificados como Excelente, Muito Bom, Bom ou Outlet, conforme o estado de conservação descrito no próprio anúncio. Quando adquirido junto ao Produto, o único acessório que pode acompanhá-lo é um carregador alternativo (compatível, mas não original de fábrica, exceto recursos turbo/fast charge).",
      "Todo Produto durável tem garantia legal de 90 dias contados do recebimento, além de eventual garantia contratual informada na oferta (a Brasil Multi Tech pratica 6 meses de garantia para aparelhos seminovos — veja a página de Garantia, trocas e devolução). O direito de arrependimento em compras feitas fora do estabelecimento pode ser exercido em até 7 dias corridos do recebimento. Recomendamos guardar a nota fiscal e o número IMEI do aparelho.",
      "Não são considerados defeito de fabricação, para fins de garantia:",
    ],
    list: [
      "Danos por mau uso, como telas quebradas ou trincadas;",
      "Danos por testes, instalação, alteração ou conserto feito por assistência técnica não autorizada dentro do prazo de garantia;",
      "Vícios aparentes e de fácil constatação não relatados em até 7 dias do recebimento;",
      "Produtos com lacre rompido ou número de série removido, adulterado ou ilegível;",
      "Danos por contato com líquidos;",
      "Redução aceitável da vida útil da bateria;",
      "Roubo ou furto do aparelho.",
    ],
  },
  {
    id: "entrega-devolucao",
    title: "6. Entrega, trocas e devoluções (compra)",
    paragraphs: [
      "Os Produtos são enviados por correio ou transportadora contratada, com prazo variável conforme a localidade; a entrega é acompanhada de recibo a ser assinado pelo Interessado ou pessoa autorizada. Em caso de atraso, a Brasil Multi Tech entra em contato para dar o devido esclarecimento.",
      "O direito de arrependimento em compras feitas fora do estabelecimento pode ser exercido em até 7 dias corridos do recebimento, mediante solicitação pelos canais oficiais. O Produto deve ser devolvido com todos os itens recebidos e sem danos por uso inadequado; a restituição abrange os valores pagos, inclusive o frete original quando exigido pela legislação, com logística reversa orientada pela empresa e sem custo indevido ao consumidor.",
      "Recomenda-se usar um método seguro de envio na devolução — a Brasil Multi Tech não se responsabiliza por perdas ou danos no trajeto de volta. O número IMEI é conferido na devolução para garantir que o aparelho retornado é o mesmo enviado. A Brasil Multi Tech tem até 7 dias corridos para cadastrar a devolução recebida e processar o reembolso; em caso de troca, o aparelho substituto só é enviado após o recebimento do original.",
      "Mais detalhes práticos — prazos, condição exigida do aparelho, como abrir uma solicitação e acompanhar o processo — estão na página de Garantia, trocas e devolução.",
    ],
  },
  {
    id: "vender",
    title: "7. Como funciona a venda do seu aparelho",
    paragraphs: [
      "O Interessado pode vender um aparelho usado ou seminovo depois de receber uma estimativa de valor (\"Oferta\") da Brasil Multi Tech pelo Site, respondendo perguntas sobre modelo, armazenamento e estado de conservação. O Interessado garante que o aparelho foi adquirido por meios lícitos, que é seu legítimo proprietário e que tem capacidade para vendê-lo, sem ônus, bloqueios ou direitos de terceiros pendentes sobre ele.",
      "Depois de aceita a Oferta original, o aparelho deve ser recebido pela Brasil Multi Tech em até 15 dias para inspeção; passado esse prazo sem o recebimento, a Oferta é automaticamente revogada. As orientações de embalagem e envio informadas pela Brasil Multi Tech devem ser seguidas para evitar danos no transporte.",
      "Na inspeção, a Brasil Multi Tech pode aceitar ou rejeitar o Produto — por exemplo, se o estado de conservação, a funcionalidade ou os itens recebidos não corresponderem ao informado na avaliação, se houver indício de que as informações do pedido de venda são falsas, ou se o Produto chegar danificado. Também pode propor uma Oferta revisada nesses casos, que o Interessado é livre para aceitar ou recusar.",
      "Se o Produto for rejeitado ou a nova Oferta for recusada, ele é devolvido ao Interessado por transportadora; a partir da postagem da devolução, o risco de perda do aparelho no trajeto de volta passa a ser do Interessado, que também arca com o custo desse envio quando aplicável.",
      "Os aparelhos vendidos são classificados como Bom, Defeituoso ou Quebrado/com problemas funcionais — definições detalhadas ficam disponíveis na etapa de avaliação. Ao aceitar a Oferta, a titularidade do aparelho passa à Brasil Multi Tech; caso o Produto seja devolvido por qualquer motivo, a titularidade permanece com o Interessado. Toda Oferta é pessoal, intransferível e não reembolsável a outro Interessado.",
    ],
  },
  {
    id: "requisitos-venda",
    title: "8. Requisitos, dados e pagamento na venda",
    paragraphs: [
      "Para vender um Produto, o Interessado deve: se cadastrar no Site; informar dados verdadeiros e atualizados sobre si e sobre o aparelho; cumprir estes Termos e a legislação aplicável; realizar a transação em nome próprio; e ter capacidade jurídica para transferir a titularidade do Produto.",
      "É responsabilidade exclusiva do Interessado, antes de enviar o aparelho: remover contas e bloqueios de segurança (como Find My iPhone/iCloud, conta Google ou bloqueio de operadora), encerrar linhas ou serviços vinculados ao aparelho, e fazer backup e apagar todos os dados pessoais armazenados nele. A Brasil Multi Tech remove os dados encontrados no Produto antes de revendê-lo, mas não se responsabiliza por dados remanescentes ou por perdas decorrentes deles.",
      "O pagamento pela venda é feito por Pix ou transferência bancária para conta de titularidade do próprio Interessado, no prazo informado na Oferta, após confirmação da identidade, da titularidade do Produto e da regularidade dos dados bancários. Dados incorretos ou desatualizados podem impedir ou atrasar o pagamento, sem responsabilidade da Brasil Multi Tech pelo atraso decorrente.",
      "A Brasil Multi Tech define, a seu critério, quais Produtos são elegíveis para compra e pode encerrar essa elegibilidade a qualquer momento, sem afetar Ofertas já aceitas — que permanecem válidas por 10 dias. Erros de preço ou de informação identificados antes do pagamento podem ser corrigidos, e uma nova Oferta pode ser emitida; o Interessado é sempre livre para aceitá-la ou recusá-la.",
    ],
  },
  {
    id: "privacidade",
    title: "9. Privacidade e comunicação eletrônica",
    paragraphs: [
      "A proteção da privacidade dos Interessados é levada a sério pela Brasil Multi Tech. Os dados pessoais coletados são tratados conforme a Política de Privacidade do Site e a legislação aplicável (LGPD), incluindo finalidade, segurança, compartilhamento, retenção e o exercício dos direitos do titular (acesso, correção e exclusão dos seus dados, entre outros).",
      "Ao usar o Site, o Interessado concorda em se relacionar eletronicamente com a Brasil Multi Tech, que pode enviar avisos e informações importantes sobre suas transações para o e-mail cadastrado. É responsabilidade do Interessado manter e-mail e endereço postal atualizados e verificar se mensagens da Brasil Multi Tech não estão sendo bloqueadas por filtros de spam.",
    ],
  },
  {
    id: "responsabilidade",
    title: "10. Responsabilidades, indenização e disposições finais",
    paragraphs: [
      "Na máxima extensão permitida por lei, a Brasil Multi Tech não responde por danos indiretos ou lucros cessantes decorrentes de uso indevido do Site ou de fato imputável exclusivamente ao Interessado ou a terceiro — sem prejuízo dos direitos do consumidor que não podem ser afastados por contrato.",
      "O Interessado responde pelos prejuízos comprovadamente causados à Brasil Multi Tech ou a terceiros em razão de fraude, ato ilícito, violação destes Termos ou uso indevido de sua conta, assegurados o contraditório e a ampla defesa.",
      "Estes Termos são regidos pela legislação brasileira; eventuais controvérsias são resolvidas no foro legalmente competente, inclusive o do domicílio do consumidor quando aplicável, sem prejuízo de meios administrativos e extrajudiciais de solução de conflitos. A tolerância a eventual descumprimento não representa renúncia ao direito de exigi-lo depois.",
    ],
  },
  {
    id: "canais-oficiais",
    title: "11. Canais oficiais",
    paragraphs: [
      `As vendas e o atendimento da Brasil Multi Tech acontecem só pelos canais oficiais: o Site ${SITE.domain}, o WhatsApp ${SITE.whatsappDisplay}, o telefone ${SITE.phoneDisplay} e a loja física em ${SITE.address.line1}, ${SITE.address.line2}, CEP ${SITE.address.zip}. A Brasil Multi Tech não se responsabiliza por compras feitas em páginas, perfis ou números de terceiros que não sejam identificados oficialmente pela empresa.`,
    ],
  },
];

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Termos e Condições</h1>
      <p className="text-muted mb-1">
        Uso do site, compra, venda, troca e avaliação de aparelhos eletrônicos.
      </p>
      <p className="text-xs text-muted mb-8">Última atualização: 31 de agosto de 2026.</p>

      <nav aria-label="Sumário" className="rounded-2xl border border-border bg-surface p-5 mb-8">
        <span className="text-sm font-semibold text-foreground">Nesta página</span>
        <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {secoes.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-brand-dark hover:underline underline-offset-2">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-5">
        {secoes.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-bold text-foreground mb-3">{s.title}</h2>
            <div className="flex flex-col gap-3">
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-muted leading-relaxed">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="flex flex-col gap-2 mt-1">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted leading-relaxed">
                      <span className="mt-2 w-1 h-1 rounded-full bg-muted shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-foreground">Ficou com alguma dúvida sobre estes Termos?</h2>
          <p className="text-sm text-muted">Fale com a gente pelos nossos canais oficiais de atendimento.</p>
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
