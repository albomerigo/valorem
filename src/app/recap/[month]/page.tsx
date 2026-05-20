import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAllTransactions,
  fetchDeclinedSimulations,
  fetchGoals,
  loadDashboardData,
} from "@/lib/finance";
import { buildRecapData, parseMonthSlug } from "@/lib/recap";
import { RecapView } from "./recap-view";

export const metadata = {
  title: "Valorem · Recap mensile",
};

export default async function RecapPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: slug } = await params;
  const parsed = parseMonthSlug(slug);
  if (!parsed) notFound();

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

  // Free plan gate: only current month accessible
  const plan = dashboardData.profile.plan || "free";
  if (plan === "free") {
    const now = new Date();
    const currentSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (slug !== currentSlug) {
      redirect("/pricing");
    }
  }

  const recap = buildRecapData(
    parsed.year,
    parsed.month,
    allTransactions,
    declined,
    goals
  );

  return (
    <RecapView
      profile={dashboardData.profile}
      recap={recap}
      stats={dashboardData.stats}
    />
  );
}