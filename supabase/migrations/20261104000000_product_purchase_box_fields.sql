-- Informações da caixa de compra editáveis por produto (todas opcionais).
-- Parcelas/juros nulos = usa a configuração global de pricing_settings.
alter table public.products
  add column if not exists vendidos_texto text,
  add column if not exists selo_texto text,
  add column if not exists cupom_percent numeric,
  add column if not exists parcelas_sem_juros smallint,
  add column if not exists parcelas_com_juros smallint,
  add column if not exists juros_mensal_percent numeric;
