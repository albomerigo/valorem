import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { AccountView } from "./account-view";

export const metadata = { title: "Valorem · Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const profile = await fetchUserProfile(supabase);
  if (!profile) redirect("/signin");
  return <AccountView profile={profile} email={user.email ?? ""} />;
}
