import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { ImportView } from "./import-view";

export const metadata = {
  title: "Valorem · Importa Transazioni",
};

export default async function ImportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");
  if (!profile.onboarded) redirect("/onboarding");

  return <ImportView userName={profile.name || "ospite"} />;
}
