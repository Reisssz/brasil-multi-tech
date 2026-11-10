-- Cores personalizadas da barra do topo (hex #rrggbb). Nulo = visual padrão do site.
alter table public.promo_bar_settings
  add column if not exists cor_fundo text,
  add column if not exists cor_texto text,
  add column if not exists cor_destaque text,
  add column if not exists cor_botao text,
  add column if not exists cor_texto_botao text;
