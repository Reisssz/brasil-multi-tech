alter table public.trade_in_requests
  add column if not exists shipping_method text,
  add column if not exists shipping_tracking_code text,
  add column if not exists process_stage text;