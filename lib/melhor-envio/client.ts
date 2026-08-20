import { obterTokenValido } from "./oauth";

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

async function melhorEnvioFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await obterTokenValido();

  const resposta = await fetch(`${BASE_URL}/api/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT!,
      ...init?.headers,
    },
  });

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    console.error("[melhor-envio] erro na API:", resposta.status, corpo);
    throw new MelhorEnvioApiError(resposta.status, corpo);
  }

  return corpo as T;
}

function enderecoRemetente() {
  const cepOrigem = (process.env.MELHOR_ENVIO_CEP_ORIGEM ?? "").replace(/\D/g, "");

  if (cepOrigem.length !== 8) {
    // Falha cedo e com mensagem clara em vez de deixar a API do Melhor
    // Envio devolver "cep_origem está invalido" sem contexto nenhum.
    throw new Error(
      `MELHOR_ENVIO_CEP_ORIGEM inválido ou não configurado (valor atual: "${process.env.MELHOR_ENVIO_CEP_ORIGEM ?? ""}"). ` +
        "Configure um CEP real de 8 dígitos nas variáveis de ambiente."
    );
  }

  return {
    postal_code: cepOrigem,
    address: process.env.MELHOR_ENVIO_ENDERECO_REMETENTE!,
    number: process.env.MELHOR_ENVIO_NUMERO_REMETENTE!,
    district: process.env.MELHOR_ENVIO_BAIRRO_REMETENTE!,
    city: process.env.MELHOR_ENVIO_CIDADE_REMETENTE!,
    state_abbr: process.env.MELHOR_ENVIO_UF_REMETENTE!,
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

export async function calcularFrete(cepDestino: string, itens: ItemParaFrete[]): Promise<OpcaoFrete[]> {
  const remetente = enderecoRemetente();

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
      from: { postal_code: remetente.postal_code },
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
    }),
  });

  return resultado
    .filter((servico) => !servico.error)
    .map((servico) => ({
      id: servico.id,
      nome: servico.name,
      transportadora: servico.company.name,
      precoOriginalCents: Math.round(Number(servico.price) * 100),
      precoComDescontoCents: Math.round(Number(servico.custom_price) * 100),
      prazoDias: servico.custom_delivery_time ?? servico.delivery_time,
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