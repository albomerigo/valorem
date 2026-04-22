import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchGoals, loadDashboardData } from "@/lib/finance";
import { ObiettiviView } from "./obiettivi-view";

export const metadata = {
  title: "Valorem · Obiettivi",
};

export default async function ObiettiviPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [dashboardData, goals] = await Promise.all([
    loadDashboardData(supabase),
    fetchGoals(supabase),
  ]);

  if (!dashboardData.profile) redirect("/signin");
  if (!dashboardData.profile.onboarded) redirect("/onboarding");

  // Calcoliamo il risparmio mensile reale stimato
  // Base = savings_goal del profilo (quanto si è impegnato a risparmiare ogni mese)
  const monthlySavings = Number(dashboardData.profile.savings_goal);

  return (
    <ObiettiviView
      profile={dashboardData.profile}
      goals={goals}
      monthlySavings={monthlySavings}
      stats={dashboardData.stats}
    />
  );
}