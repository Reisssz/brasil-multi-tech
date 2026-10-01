alter table public.trade_in_requests
  add column if not exists has_invoice boolean;