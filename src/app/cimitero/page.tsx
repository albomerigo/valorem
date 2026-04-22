import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchFixedCosts,
  fetchDeclinedSimulations,
  fetchCurrentMonthTransactions,
  loadDashboardData,
} from "@/lib/finance";
import { CimiteroView } from "./cimitero-view";

export const metadata = {
  title: "Valorem · Cimitero degli Impulsi",
};

export default async function CimiteroPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Usiamo loadDashboardData per avere stats complete (metrica tempo, ecc.)
  const [dashboardData, declined] = await Promise.all([
    loadDashboardData(supabase),
    fetchDeclinedSimulations(supabase),
  ]);

  if (!dashboardData.profile) redirect("/signin");
  if (!dashboardData.profile.onboarded) redirect("/onboarding");

  return (
    <CimiteroView
      profile={dashboardData.profile}
      declined={declined}
      stats={dashboardData.stats}
    />
  );
}