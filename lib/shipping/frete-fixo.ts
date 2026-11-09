export type ConfiguracaoFreteFixo = {
  ativo: boolean;
  sulCents: number;
  sudesteCents: number;
  prazoDias: number;
};

export const CONFIGURACAO_FRETE_FIXO_PADRAO: ConfiguracaoFreteFixo = {
  ativo: false,
  sulCents: 0,
  sudesteCents: 0,
  prazoDias: 7,
};
