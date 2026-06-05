import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { PrivacyView } from "./privacy-view";

export const metadata = { title: "Valorem · Privacy e dati" };

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");
  return <PrivacyView profile={profile} />;
}
