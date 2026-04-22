import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase per il BROWSER (lato client).
 * Usato nei componenti con "use client" (es. form di login, hover, click).
 * Le chiavi sono caricate da .env.local tramite process.env.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}