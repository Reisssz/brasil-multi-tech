-- Configuração de parcelamento editável pelo admin (linha única, id fixo em 1).
create table if not exists public.pricing_settings (
  id smallint primary key default 1,
  max_parcelas_sem_juros smallint not null default 10,
  max_parcelas_com_juros smallint not null default 12,
  juros_comprador_percent jsonb not null default '{"11": 20.66, "12": 22.11}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint pricing_settings_singleton check (id = 1)
);

insert into public.pricing_settings (id)
values (1)
on conflict (id) do nothing;

-- Descrição específica por variação (cor/condição/armazenamento). Quando
-- vazia, a página do produto usa a descrição geral do produto.
alter table public.product_variants
  add column if not exists description text;
