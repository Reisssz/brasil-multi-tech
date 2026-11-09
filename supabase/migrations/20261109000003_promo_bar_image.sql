-- Imagem opcional que substitui os textos da barra do topo (ex: arte de campanha).
alter table public.promo_bar_settings
  add column if not exists imagem_url text,
  add column if not exists imagem_largura integer,
  add column if not exists imagem_altura integer;
