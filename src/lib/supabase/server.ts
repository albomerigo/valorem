import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase per il SERVER (Server Components e API routes).
 * Gestisce automaticamente i cookie di sessione per mantenere l'utente loggato.
 * Usato per fetch iniziali delle pagine e per proteggere route private.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se chiamato da un Server Component, setAll può fallire.
            // Questo è gestito dal middleware che rinfresca le sessioni.
          }
        },
      },
    }
  );
}