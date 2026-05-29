import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile, getMonthlyFreeBudget } from "@/lib/finance";
import { calculateValoremScore } from "@/lib/score";
import { ProfiloView } from "./profilo-view";

export default async function ProfiloPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const profile = await fetchUserProfile(supabase);
  if (!profile?.onboarded) redirect("/onboarding");

  // Fetch stats in parallel
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString().split("T")[0];

  const [txResult, declinedResult, catTxResult, fixedCostsResult, goalsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, transaction_date, amount, type"),
    supabase
      .from("declined_simulations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("transactions")
      .select("category, amount, type")
      .eq("type", "expense")
      .gte("transaction_date", threeMonthsAgoStr),
    supabase
      .from("fixed_costs")
      .select("id, name, amount"),
    supabase
      .from("goals")
      .select("id, target_amount, current_amount"),
  ]);

  const transactions = txResult.data || [];
  const totalTransactions = transactions.length;
  const fixedCosts = (fixedCostsResult.data || []) as { id: string; name: string; amount: number }[];
  const goals = (goalsResult.data || []) as { id: string; target_amount: number; current_amount: number }[];

  // Category distribution (last 3 months, expenses only)
  const catTransactions = catTxResult.data || [];
  const catTotals: Record<string, number> = {};
  for (const t of catTransactions) {
    const c = t.category || "Altro";
    catTotals[c] = (catTotals[c] || 0) + Number(t.amount);
  }
  const catTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCategory =
    sortedCats.length > 0 && catTotal > 0
      ? {
          name: sortedCats[0][0],
          amount: sortedCats[0][1],
          percent: Math.round((sortedCats[0][1] / catTotal) * 100),
          top3: sortedCats.slice(0, 3).map(([name, amount]) => ({
            name,
            amount,
            percent: Math.round((amount / catTotal) * 100),
          })),
        }
      : null;
  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthSet = new Set(
    transactions.map((t: { transaction_date: string }) =>
      t.transaction_date.slice(0, 7)
    )
  );
  const activeMonths = monthSet.size;
  const totalImpulsiResistiti = declinedResult.count ?? 0;

  // Valorem Score
  const scoreNow = new Date();
  const monthlyFree = getMonthlyFreeBudget(
    profile,
    fixedCosts.map((fc) => ({ ...fc, user_id: profile.id ?? "" }))
  );
  const currentMonthKey = `${scoreNow.getFullYear()}-${String(scoreNow.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense" && t.transaction_date.startsWith(currentMonthKey))
    .reduce((s, t) => s + Number(t.amount), 0);
  const savingsGoal = Number(profile.savings_goal ?? 0);
  const savingsPct =
    monthlyFree > 0 && savingsGoal > 0
      ? Math.min(100, Math.round((savingsGoal / monthlyFree) * 100))
      : 0;
  const goalsOnTrack = goals.filter(
    (g) => Number(g.current_amount) >= Number(g.target_amount)
  ).length;
  const valoremScore = calculateValoremScore({
    savingsPercent: savingsPct,
    trendVsLastMonth: 0,
    impulsiResistiti: totalImpulsiResistiti,
    totalSpent: currentMonthExpenses,
    monthlyFree,
    goalsOnTrack,
    totalGoals: goals.length,
    transactionCount: totalTransactions,
  });

  // Sparkline: last 6 months of expense spending
  const now = new Date();
  const monthlySpending: { month: string; label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("it-IT", { month: "short" });
    const amount = transactions
      .filter(
        (t: { type: string; transaction_date: string; amount: number }) =>
          t.type === "expense" && t.transaction_date.startsWith(key)
      )
      .reduce(
        (s: number, t: { amount: number }) => s + Number(t.amount),
        0
      );
    monthlySpending.push({ month: key, label, amount });
  }

  // Score history — last 6 months
  const scoreHistory: { month: string; score: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mSpent = transactions
      .filter((t) => t.type === "expense" && t.transaction_date.startsWith(key))
      .reduce((s, t) => s + Number(t.amount), 0);
    const mScore = calculateValoremScore({
      savingsPercent: savingsPct,
      trendVsLastMonth: 0,
      impulsiResistiti: 0,
      totalSpent: mSpent,
      monthlyFree,
      goalsOnTrack,
      totalGoals: goals.length,
      transactionCount: transactions.filter((t) => t.transaction_date.startsWith(key)).length,
    });
    if (mSpent > 0 || d.getMonth() === now.getMonth()) {
      scoreHistory.push({ month: key, score: mScore.score });
    }
  }

  return (
    <ProfiloView
      profile={profile}
      email={user.email ?? ""}
      memberSince={user.created_at}
      stats={{
        totalTransactions,
        activeMonths,
        totalSpent,
        totalImpulsiResistiti,
      }}
      monthlySpending={monthlySpending}
      topCategory={topCategory}
      valoremScore={valoremScore}
      scoreHistory={scoreHistory.length > 1 ? scoreHistory : undefined}
    />
  );
}
