import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAllTransactions,
  fetchDeclinedSimulations,
  fetchGoals,
  loadDashboardData,
} from "@/lib/finance";
import { buildRecapData, formatMonthSlug } from "@/lib/recap";
import type { RecapData } from "@/lib/recap";
import { StoricoView } from "./storico-view";

export const metadata = {
  title: "Valorem · Storico",
};

export type MonthEntry = { slug: string; recap: RecapData };

export default async function StoricoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [dashboardData, allTransactions, declined, goals] = await Promise.all([
    loadDashboardData(supabase),
    fetchAllTransactions(supabase),
    fetchDeclinedSimulations(supabase),
    fetchGoals(supabase),
  ]);

  if (!dashboardData.profile) redirect("/signin");
  if (!dashboardData.profile.onboarded) redirect("/onboarding");

  // Ricava i mesi univoci dalle transazioni
  const monthSet = new Set<string>();
  for (const tx of allTransactions) {
    const d = new Date(tx.transaction_date);
    monthSet.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }

  // Costruisce recap per ogni mese, ordinati dal più recente al più vecchio
  const entries = Array.from(monthSet)
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      return { year: y, month: m };
    })
    .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month));

  const recaps: MonthEntry[] = entries.map(({ year, month }) => ({
    slug: formatMonthSlug(year, month),
    recap: buildRecapData(year, month, allTransactions, declined, goals),
  }));

  return <StoricoView profile={dashboardData.profile} recaps={recaps} />;
}
