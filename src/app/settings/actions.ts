"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IncomeType, TimeMetric } from "@/lib/finance";

// ═══════════════════════════════════════════════════════════
//  SEZIONE 1 — PROFILO (nome + tipo reddito)
// ═══════════════════════════════════════════════════════════

export async function updateProfileInfo(payload: {
  name: string;
  incomeType: IncomeType;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (!payload.name.trim()) return { error: "Il nome non può essere vuoto" };

  const { error } = await supabase
    .from("users_profiles")
    .update({
      name: payload.name.trim(),
      income_type: payload.incomeType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
//  SEZIONE 2 — ECONOMIA (reddito + risparmio)
// ═══════════════════════════════════════════════════════════

export async function updateEconomics(payload: {
  monthlyIncome: number;
  savingsGoal: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (payload.monthlyIncome < 0)
    return { error: "Il reddito non può essere negativo" };
  if (payload.savingsGoal < 0)
    return { error: "L'obiettivo non può essere negativo" };

  const { error } = await supabase
    .from("users_profiles")
    .update({
      monthly_income: payload.monthlyIncome,
      savings_goal: payload.savingsGoal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
//  SEZIONE 3 — METRICA DEL TEMPO
// ═══════════════════════════════════════════════════════════

export async function updateTimeMetric(payload: {
  timeMetric: TimeMetric;
  monthlyHours: number | null;
  workDays: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { error } = await supabase
    .from("users_profiles")
    .update({
      time_metric: payload.timeMetric,
      monthly_hours: payload.timeMetric === "work_hours" ? payload.monthlyHours : null,
      work_days: payload.timeMetric === "work_days" ? payload.workDays : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════
//  SEZIONE 4 — COSTI FISSI (CRUD)
// ═══════════════════════════════════════════════════════════

export async function addFixedCost(payload: { name: string; amount: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (!payload.name.trim()) return { error: "Il nome è obbligatorio" };
  if (payload.amount <= 0) return { error: "L'importo deve essere maggiore di zero" };

  const { error } = await supabase.from("fixed_costs").insert({
    user_id: user.id,
    name: payload.name.trim(),
    amount: payload.amount,
  });

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateFixedCost(payload: {
  id: string;
  name: string;
  amount: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (!payload.name.trim()) return { error: "Il nome è obbligatorio" };
  if (payload.amount <= 0) return { error: "L'importo deve essere maggiore di zero" };

  const { error } = await supabase
    .from("fixed_costs")
    .update({ name: payload.name.trim(), amount: payload.amount })
    .eq("id", payload.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteFixedCost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("fixed_costs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
 
}
// ═══════════════════════════════════════════════════════════
//  SEZIONE 5 — MODALITÀ SAFE-TO-SPEND
// ═══════════════════════════════════════════════════════════

export async function updateSafeMode(mode: "aggressive" | "cautious" | "saving") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { error } = await supabase
    .from("users_profiles")
    .update({
      safe_mode: mode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}