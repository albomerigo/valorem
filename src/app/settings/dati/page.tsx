import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile, fetchFixedCosts } from "@/lib/finance";
import { getCustomCategories } from "../categories-actions";
import { DatiView } from "./dati-view";

export const metadata = { title: "Valorem · Dati finanziari" };

export default async function DatiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const [profile, fixedCosts, customCategories] = await Promise.all([
    fetchUserProfile(supabase),
    fetchFixedCosts(supabase),
    getCustomCategories(),
  ]);
  if (!profile) redirect("/signin");
  return <DatiView profile={profile} fixedCosts={fixedCosts} customCategories={customCategories} />;
}
