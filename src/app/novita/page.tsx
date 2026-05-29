import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { NovitaView } from "./novita-view";

export const metadata = {
  title: "Valorem · Novità",
  description: "Gli ultimi aggiornamenti e nuove funzionalità di Valorem.",
};

export default async function NovitaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");

  return <NovitaView userName={profile.name || ""} />;
}
