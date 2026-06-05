import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loadDashboardData,
  fetchRecentTransactions,
  aggregateDailySpending,
  fetchGoals,
} from "@/lib/finance";
import { fetchValoremScore } from "@/lib/score-server";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const dashboardData = await loadDashboardData(supabase);

  if (!dashboardData.profile?.onboarded) {
    redirect("/onboarding");
  }

  const [recentTransactions, goals, valoremScore] = await Promise.all([
    fetchRecentTransactions(supabase, 28),
    fetchGoals(supabase),
    fetchValoremScore(supabase, user.id),
  ]);
  const dailyData = aggregateDailySpending(recentTransactions, 28);

  return (
    <Dashboard
      data={dashboardData}
      dailyData={dailyData}
      goalsCount={goals.length}
      goals={goals}
      valoremScore={valoremScore}
    />
  );
}