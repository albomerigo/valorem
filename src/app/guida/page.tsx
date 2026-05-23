import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { GuidaView } from "./guida-view";

export const metadata = {
  title: "Valorem · Guida",
};

export default async function GuidaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");

  return <GuidaView userName={profile.name || ""} />;
}
