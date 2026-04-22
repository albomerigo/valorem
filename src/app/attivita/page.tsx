import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllTransactions, loadDashboardData } from "@/lib/finance";
import { AttivitaView } from "./attivita-view";

export const metadata = {
  title: "Valorem · Attività",
};

export default async function AttivitaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [dashboardData, allTransactions] = await Promise.all([
    loadDashboardData(supabase),
    fetchAllTransactions(supabase),
  ]);

  if (!dashboardData.profile) redirect("/signin");
  if (!dashboardData.profile.onboarded) redirect("/onboarding");

  return (
    <AttivitaView
      profile={dashboardData.profile}
      transactions={allTransactions}
      stats={dashboardData.stats}
    />
  );
}