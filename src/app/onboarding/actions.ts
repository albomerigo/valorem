"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IncomeType, TimeMetric } from "@/lib/finance";

export type OnboardingPayload = {
  name: string;
  incomeType: IncomeType;
  monthlyIncome: number;
  monthlyHours: number | null;
  workDays: number | null;
  timeMetric: TimeMetric;
  savingsGoal: number;
  fixedCosts: { name: string; amount: number }[];
};

/**
 * Salva tutti i dati di onboarding dell'utente:
 * - Aggiorna users_profiles (nome, tipo reddito, importi, metrica tempo, onboarded=true)
 * - Inserisce le righe in fixed_costs
 */
export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autenticato" };
  }

  // 1. Aggiorna profilo
  const { error: profileError } = await supabase
    .from("users_profiles")
    .update({
      name: payload.name,
      income_type: payload.incomeType,
      monthly_income: payload.monthlyIncome,
      monthly_hours: payload.monthlyHours,
      work_days: payload.workDays,
      time_metric: payload.timeMetric,
      savings_goal: payload.savingsGoal,
      onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Errore salvataggio profilo: " + profileError.message };
  }

  // 2. Inserisci costi fissi validi
  const validCosts = payload.fixedCosts.filter(
    (c) => c.name.trim() !== "" && c.amount > 0
  );

  if (validCosts.length > 0) {
    const { error: costsError } = await supabase.from("fixed_costs").insert(
      validCosts.map((c) => ({
        user_id: user.id,
        name: c.name.trim(),
        amount: c.amount,
      }))
    );

    if (costsError) {
      return { error: "Errore salvataggio costi: " + costsError.message };
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}