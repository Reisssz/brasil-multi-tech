import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Ignora RLS — use SOMENTE em código de servidor que nunca roda no browser
 * (webhooks, jobs). Nunca importe em um Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
