"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Plan = "free" | "premium" | "pro";

/**
 * Legge il piano attivo dell'utente corrente da users_profiles.
 * Ritorna "free" come default finché il dato non è disponibile.
 */
export function usePlan(): { plan: Plan; loading: boolean } {
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("users_profiles")
      .select("plan")
      .single()
      .then(({ data }) => {
        if (data?.plan && ["free", "premium", "pro"].includes(data.plan)) {
          setPlan(data.plan as Plan);
        }
        setLoading(false);
      });
  }, []);

  return { plan, loading };
}
