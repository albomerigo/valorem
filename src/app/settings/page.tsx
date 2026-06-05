import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
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

  const profile = await fetchUserProfile(supabase);

  if (!profile) redirect("/signin");
  if (!profile.onboarded) redirect("/onboarding");

  return <SettingsView profile={profile} />;
}