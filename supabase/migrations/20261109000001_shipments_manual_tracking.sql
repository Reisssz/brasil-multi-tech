-- Rastreio informado manualmente pelo admin não tem etiqueta no Melhor Envio.
alter table public.shipments alter column melhor_envio_id drop not null;
