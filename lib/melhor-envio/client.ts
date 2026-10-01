import { obterTokenValido } from "./oauth";
import { SITE } from "@/lib/config";

const BASE_URL = process.env.MELHOR_ENVIO_BASE_URL!;

/**
 * Erro estruturado da API do Melhor Envio — carrega os campos inválidos
 * (`errors`) para que quem chamar possa mostrar uma mensagem específica em
 * vez de "não foi possível calcular o frete".
 */
export class MelhorEnvioApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(status: number, corpo: { message?: string; errors?: Record<string, string[]> } | null) {
    super(corpo?.message ?? `Melhor Envio respondeu ${status}`);
    this.name = "MelhorEnvioApiError";
    this.status = status;
    this.errors = corpo?.errors ?? null;
  }

  /** Primeira mensagem de erro de campo, já traduzida para o que o usuário reconhece. */
  mensagemAmigavel(): string {
    if (this.errors?.postal_code) {
      // cep_origem inválido é problema de CONFIGURAÇÃO da loja (remetente),
      // não do CEP que o cliente digitou — nunca deve aparecer como se
      // fosse culpa do cliente.
      return "Não foi possível calcular o frete: o CEP de origem da loja está configurado incorretamente. Contate o suporte.";
    }
    if (this.errors) {
      const primeiraMsg = Object.values(this.errors)[0]?.[0];
      if (primeiraMsg) return primeiraMsg;
    }
    return this.message;
  }
}

export class MelhorEnvioTlsError extends Error {
  constructor() {
    super("A validação TLS do Melhor Envio falhou: certificado expirado na cadeia de confiança da rede.");
    this.name = "MelhorEnvioTlsError";
  }
}

function codigoDaCausa(erro: unknown): string | undefined {
  if (typeof erro !== "object" || erro === null || !("cause" in erro)) return undefined;
  const causa = erro.cause;
  if (typeof causa !== "object" || causa === null || !("code" in causa)) return undefined;
  return typeof causa.code === "string" ? causa.code : undefined;
}

async function melhorEnvioFetch<T>(path: string, init?: RequestInit, tentativa = 1): Promise<T> {
  const token = await obterTokenValido();

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}/api/v2${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT!,
        ...init?.headers,
      },
    });
  } catch (erroRede) {
    if (codigoDaCausa(erroRede) === "CERT_HAS_EXPIRED") {
      throw new MelhorEnvioTlsError();
    }

    // Falha de conexão (não é erro da API, é a requisição nem chegar lá) —
    // tenta mais uma vez antes de desistir, cobre soluços passageiros de
    // rede comuns em ambiente serverless.
    if (tentativa < 2) {
      console.warn("[melhor-envio] falha de rede, tentando novamente:", erroRede);
      return melhorEnvioFetch<T>(path, init, tentativa + 1);
    }
    throw erroRede;
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    console.error("[melhor-envio] erro na API:", resposta.status, corpo);
    throw new MelhorEnvioApiError(resposta.status, corpo);
  }

  return corpo as T;
}

/** Só o CEP de origem, validado — suficiente pra COTAR frete (calculate não exige nome/documento do remetente). */
function cepOrigemValidado() {
  const cepOrigem = SITE.address.zip.replace(/\D/g, "");

  if (cepOrigem.length !== 8) {
    // Falha cedo e com mensagem clara em vez de deixar a API do Melhor
    // Envio devolver "cep_origem está invalido" sem contexto nenhum.
    throw new Error(
      `CEP de origem inválido na configuração da loja (valor atual: "${SITE.address.zip}"). ` +
        "Configure um CEP real de 8 dígitos em lib/config.ts."
    );
  }

  return cepOrigem;
}

/** Endereço completo do remetente — só é exigido de verdade na COMPRA da etiqueta (/me/cart), não na cotação. */
function enderecoRemetente() {
  const cepOrigem = cepOrigemValidado();

  const nome = process.env.MELHOR_ENVIO_NOME_REMETENTE ?? SITE.name;
  const documento = (process.env.MELHOR_ENVIO_DOCUMENTO_REMETENTE ?? "").replace(/\D/g, "");

  if (!nome) {
    // O cálculo de frete não precisa disso, mas a COMPRA da etiqueta exige
    // — sem essa checagem, o erro só aparece na hora de gerar a etiqueta,
    // sem contexto nenhum de qual variável está faltando.
    throw new Error(
      "MELHOR_ENVIO_NOME_REMETENTE não configurado. Configure o nome de quem está enviando (pessoa física ou razão social) nas variáveis de ambiente."
    );
  }

  return {
    name: nome,
    document: documento || undefined,
    postal_code: cepOrigem,
    address: SITE.address.street,
    number: SITE.address.number,
    complement: SITE.address.complement,
    district: SITE.address.district,
    city: SITE.address.city,
    state_abbr: SITE.address.state,
    country_id: "BR",
  };
}

export type ItemParaFrete = {
  nome: string;
  quantidade: number;
  valorUnitarioCents: number;
  larguraCm: number;
  alturaCm: number;
  comprimentoCm: number;
  pesoKg: number;
};

export type OpcaoFrete = {
  id: number;
  nome: string;
  transportadora: string;
  precoOriginalCents: number;
  precoComDescontoCents: number;
  prazoDias: number;
};

export type ServicoDescartado = {
  id: number;
  nome: string;
  motivo: string;
};

// Fallback conservador para itens sem dimensões cadastradas (celular embalado).
const FALLBACK_DIMENSOES = { larguraCm: 15, alturaCm: 8, comprimentoCm: 20, pesoKg: 0.4 };

export function dimensoesDaVariante(v: {
  weightGrams?: number;
  widthCm?: number;
  heightCm?: number;
  lengthCm?: number;
}) {
  return {
    larguraCm: v.widthCm ?? FALLBACK_DIMENSOES.larguraCm,
    alturaCm: v.heightCm ?? FALLBACK_DIMENSOES.alturaCm,
    comprimentoCm: v.lengthCm ?? FALLBACK_DIMENSOES.comprimentoCm,
    pesoKg: v.weightGrams ? v.weightGrams / 1000 : FALLBACK_DIMENSOES.pesoKg,
  };
}

// IDs de serviço padrão dos Correios na Melhor Envio — pedimos os dois
// explicitamente para garantir que PAC apareça como opção, não só SEDEX
// (que costuma ser o único retornado quando não especificamos `services`).
const SERVICO_PAC = 1;
const SERVICO_SEDEX = 2;

export async function calcularFrete(
  cepDestino: string,
  itens: ItemParaFrete[]
): Promise<{ opcoes: OpcaoFrete[]; descartados: ServicoDescartado[] }> {
  const cepOrigem = cepOrigemValidado();

  const resultado = await melhorEnvioFetch<
    Array<{
      id: number;
      name: string;
      company: { name: string };
      price: string;
      custom_price: string;
      delivery_time: number;
      custom_delivery_time: number;
      error?: string;
    }>
  >("/me/shipment/calculate", {
    method: "POST",
    body: JSON.stringify({
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      products: itens.map((item, indice) => ({
        id: String(indice),
        width: item.larguraCm,
        height: item.alturaCm,
        length: item.comprimentoCm,
        weight: item.pesoKg,
        insurance_value: item.valorUnitarioCents / 100,
        quantity: item.quantidade,
      })),
      // Sem este campo, a API só devolve os serviços que ELA decide (às
      // vezes só SEDEX). Pedindo os dois explicitamente, PAC também é
      // calculado sempre que a transportadora atender o trecho.
      services: `${SERVICO_PAC},${SERVICO_SEDEX}`,
    }),
  });

  const comErro = resultado.filter((servico) => servico.error);
  if (comErro.length > 0) {
    console.warn(
      "[melhor-envio] serviço(s) descartado(s) por erro:",
      comErro.map((s) => `${s.name} (id ${s.id}): ${s.error}`).join(" | ")
    );
  }

  const validos = resultado.filter((servico) => !servico.error);

  if (validos.length === 0 && resultado.length > 0) {
    // Nenhuma opção veio sem erro — em vez do genérico "não foi possível
    // calcular", agregamos o motivo real de cada serviço (ex: "PAC: peso
    // excede o limite", "SEDEX: CEP não atendido"), que ajuda demais a
    // diagnosticar sem precisar ficar catando log depois.
    const motivos = resultado.map((s) => `${s.name}: ${s.error}`).join(" | ");
    throw new MelhorEnvioApiError(422, { message: motivos, errors: { servicos: [motivos] } });
  }

  return {
    opcoes: validos.map((servico) => ({
      id: servico.id,
      nome: servico.name,
      transportadora: servico.company.name,
      precoOriginalCents: Math.round(Number(servico.price) * 100),
      precoComDescontoCents: Math.round(Number(servico.custom_price) * 100),
      prazoDias: servico.custom_delivery_time ?? servico.delivery_time,
    })),
    descartados: comErro.map((servico) => ({
      id: servico.id,
      nome: servico.name,
      motivo: servico.error!,
    })),
  };
}

export type StatusRastreio = {
  melhorEnvioId: string;
  tracking: string | null;
  status: string | null;
};

/**
 * Consulta o status/código de rastreio de uma ou mais etiquetas já geradas.
 * Retorna um item por ID pedido, mesmo quando a Melhor Envio ainda não
 * atribuiu o tracking (tracking vem null nesse caso — normal logo após a
 * postagem, a transportadora demora pra devolver o código).
 */
export async function buscarStatusRastreio(melhorEnvioIds: string[]): Promise<StatusRastreio[]> {
  if (melhorEnvioIds.length === 0) return [];

  const resultado = await melhorEnvioFetch<{
    [id: string]: { tracking?: string | null; status?: string };
  }>("/me/shipment/tracking", {
    method: "POST",
    body: JSON.stringify({ orders: melhorEnvioIds }),
  });

  return melhorEnvioIds.map((id) => ({
    melhorEnvioId: id,
    tracking: resultado[id]?.tracking ?? null,
    status: resultado[id]?.status ?? null,
  }));
}

export type DadosCompraEtiqueta = {
  servicoId: number;
  destinatario: {
    nome: string;
    documento: string;
    telefone: string;
    email: string;
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    complemento?: string;
  };
  itens: ItemParaFrete[];
  valorSeguradoTotalCents: number;
};

export async function comprarEtiqueta(dados: DadosCompraEtiqueta) {
  const itemCarrinho = await melhorEnvioFetch<{ id: string; price: string }>("/me/cart", {
    method: "POST",
    body: JSON.stringify({
      service: dados.servicoId,
      from: enderecoRemetente(),
      to: {
        name: dados.destinatario.nome,
        document: dados.destinatario.documento,
        phone: dados.destinatario.telefone,
        email: dados.destinatario.email,
        postal_code: dados.destinatario.cep,
        address: dados.destinatario.endereco,
        number: dados.destinatario.numero,
        district: dados.destinatario.bairro,
        city: dados.destinatario.cidade,
        state_abbr: dados.destinatario.uf,
        country_id: "BR",
      },
      products: dados.itens.map((item) => ({
        name: item.nome,
        quantity: item.quantidade,
        unitary_value: item.valorUnitarioCents / 100,
      })),
      volumes: dados.itens.map((item) => ({
        height: item.alturaCm,
        width: item.larguraCm,
        length: item.comprimentoCm,
        weight: item.pesoKg,
      })),
      options: {
        insurance_value: dados.valorSeguradoTotalCents / 100,
        receipt: false,
        own_hand: false,
        non_commercial: true,
      },
    }),
  });

  await melhorEnvioFetch("/me/shipment/checkout", {
    method: "POST",
    body: JSON.stringify({ orders: [itemCarrinho.id] }),
  });

  const geracao = await melhorEnvioFetch<{ [id: string]: { status: string; tracking?: string } }>(
    "/me/shipment/generate",
    { method: "POST", body: JSON.stringify({ orders: [itemCarrinho.id] }) }
  );

  return {
    melhorEnvioId: itemCarrinho.id,
    precoFreteCents: Math.round(Number(itemCarrinho.price) * 100),
    status: geracao[itemCarrinho.id]?.status ?? "generated",
    tracking: geracao[itemCarrinho.id]?.tracking ?? null,
  };
}