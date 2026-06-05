import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { PersonalizzazioneView } from "./personalizzazione-view";

export const metadata = { title: "Valorem · Personalizzazione" };

export default async function PersonalizzazionePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");
  return <PersonalizzazioneView profile={profile} />;
}
