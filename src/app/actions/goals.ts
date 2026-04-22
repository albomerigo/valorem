"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateGoalPayload = {
  title: string;
  targetAmount: number;
  emoji?: string;
  category?: string;
  deadline?: string | null;
};

export async function createGoal(payload: CreateGoalPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (!payload.title.trim()) return { error: "Il titolo è obbligatorio" };
  if (payload.targetAmount <= 0)
    return { error: "L'importo deve essere maggiore di zero" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: payload.title.trim(),
    target_amount: payload.targetAmount,
    emoji: payload.emoji || "🎯",
    category: payload.category || "travel",
    deadline: payload.deadline || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateGoalAmount(payload: {
  id: string;
  currentAmount: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  // Recuperiamo il goal per vedere se raggiunto
  const { data: goal } = await supabase
    .from("goals")
    .select("target_amount")
    .eq("id", payload.id)
    .single();

  const target = goal ? Number(goal.target_amount) : 0;
  const newStatus =
    payload.currentAmount >= target ? "completed" : "active";

  const { error } = await supabase
    .from("goals")
    .update({
      current_amount: payload.currentAmount,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}