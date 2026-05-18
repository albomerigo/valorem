import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loadDashboardData,
  fetchRecentTransactions,
  aggregateDailySpending,
  fetchGoals,
} from "@/lib/finance";
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

  // Carichiamo anche le transazioni delle ultime 4 settimane per il chart
  const [recentTransactions, goals] = await Promise.all([
    fetchRecentTransactions(supabase, 28),
    fetchGoals(supabase),
  ]);
  const dailyData = aggregateDailySpending(recentTransactions, 28);

  return (
    <Dashboard
      data={dashboardData}
      dailyData={dailyData}
      goalsCount={goals.length}
      goals={goals}
    />
  );
}