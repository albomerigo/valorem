import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { AbbonamentoView } from "./abbonamento-view";

export const metadata = { title: "Valorem · Abbonamento" };

export default async function AbbonamentoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");
  return <AbbonamentoView profile={profile} />;
}
