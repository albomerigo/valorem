import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile, fetchAllTransactions } from "@/lib/finance";
import { RicorrentiView } from "./ricorrenti-view";

export const metadata = {
  title: "Valorem · Spese Ricorrenti",
};

export default async function RicorrentiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [profile, allTransactions] = await Promise.all([
    fetchUserProfile(supabase),
    fetchAllTransactions(supabase),
  ]);

  if (!profile) redirect("/signin");
  if (!profile.onboarded) redirect("/onboarding");

  const recurring = allTransactions.filter((t) => t.recurring);

  return <RicorrentiView profile={profile} recurring={recurring} />;
}
