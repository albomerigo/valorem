import { SupabaseClient } from "@supabase/supabase-js";
import { calculateValoremScore } from "./score";

export async function fetchValoremScore(supabase: SupabaseClient, userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .split("T")[0];

  const [txResult, lastMonthTxResult, declinedResult, goalsResult, profileResult] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("amount, type, category, transaction_date")
        .eq("user_id", userId)
        .gte("transaction_date", monthStart),
      supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", userId)
        .gte("transaction_date", lastMonthStart)
        .lte("transaction_date", lastMonthEnd),
      supabase
        .from("declined_simulations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart),
      supabase
        .from("goals")
        .select("target_amount, current_amount")
        .eq("user_id", userId),
      supabase
        .from("users_profiles")
        .select("monthly_income, monthly_hours, time_metric, work_days, savings_goal")
        .eq("id", userId)
        .single(),
    ]);

  const txs = txResult.data || [];
  const lastMonthTxs = lastMonthTxResult.data || [];
  const profile = profileResult.data;

  const totalSpent = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const lastMonthSpent = lastMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const impulsiResistiti = declinedResult.count || 0;

  const monthlyIncome = profile?.monthly_income || 0;
  const savingsGoal = profile?.savings_goal || 0;
  const monthlyFree = Math.max(0, monthlyIncome - savingsGoal);

  const savingsPercent =
    monthlyFree > 0
      ? Math.min(100, Math.max(0, ((monthlyFree - totalSpent) / monthlyFree) * 100))
      : 0;
  const trendVsLastMonth =
    lastMonthSpent > 0
      ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0;

  const goals = (goalsResult.data || []) as {
    target_amount: number;
    current_amount: number;
  }[];
  const goalsOnTrack = goals.filter(
    (g) => Number(g.current_amount) >= Number(g.target_amount) * 0.5
  ).length;

  return calculateValoremScore({
    savingsPercent,
    trendVsLastMonth,
    impulsiResistiti,
    totalSpent,
    monthlyFree,
    goalsOnTrack,
    totalGoals: goals.length,
    transactionCount: txs.length,
  });
}
