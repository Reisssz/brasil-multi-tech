-- Barra promocional do topo do site, editável pelo admin. Linha única (id = 1).
create table if not exists public.promo_bar_settings (
  id smallint primary key default 1,
  ativo boolean not null default true,
  rotulo text not null default '5 ANOS BRASIL MULTI TECH',
  mensagens jsonb not null default '[
    "Comemore com a gente: ofertas especiais em todo o site",
    "8% de desconto à vista no Pix em todos os produtos",
    "Frete grátis nas compras acima de R$ 1.300",
    "Parcele em até {parcelas}x sem juros no cartão de crédito"
  ]'::jsonb,
  cta_texto text not null default 'APROVEITE AGORA',
  cta_href text not null default '/categoria/ofertas',
  updated_at timestamptz not null default now(),
  constraint promo_bar_settings_singleton check (id = 1)
);

alter table public.promo_bar_settings enable row level security;

insert into public.promo_bar_settings (id)
values (1)
on conflict (id) do nothing;
