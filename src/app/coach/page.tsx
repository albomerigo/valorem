import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardData } from "@/lib/finance";
import { CoachView } from "./coach-view";

export const metadata = {
  title: "Valorem · AI Coach",
};

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const data = await loadDashboardData(supabase);

  if (!data.profile) redirect("/signin");
  if (!data.profile.onboarded) redirect("/onboarding");

  return (
    <CoachView
      profile={data.profile}
      stats={data.stats}
      transactions={data.transactions}
      plan={data.profile.plan ?? "free"}
    />
  );
}
