-- Frete fixo por região (Sul e Sudeste), editável pelo admin. Linha única (id = 1).
-- Valores em centavos. Com RLS ligado e sem policies, só o service role acessa.
create table if not exists public.shipping_settings (
  id smallint primary key default 1,
  fixed_enabled boolean not null default false,
  fixed_sul_cents integer not null default 0 check (fixed_sul_cents >= 0),
  fixed_sudeste_cents integer not null default 0 check (fixed_sudeste_cents >= 0),
  fixed_prazo_dias smallint not null default 7 check (fixed_prazo_dias >= 1),
  updated_at timestamptz not null default now(),
  constraint shipping_settings_singleton check (id = 1)
);

alter table public.shipping_settings enable row level security;

insert into public.shipping_settings (id)
values (1)
on conflict (id) do nothing;
