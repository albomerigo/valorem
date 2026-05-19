import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile, fetchFixedCosts } from "@/lib/finance";
import { getCustomCategories } from "./categories-actions";
import { SettingsView } from "./settings-view";

export const metadata = {
  title: "Valorem · Setup vitale",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [profile, fixedCosts, customCategories] = await Promise.all([
    fetchUserProfile(supabase),
    fetchFixedCosts(supabase),
    getCustomCategories(),
  ]);

  if (!profile) redirect("/signin");
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <SettingsView
      profile={profile}
      fixedCosts={fixedCosts}
      customCategories={customCategories}
    />
  );
}