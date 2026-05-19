import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/finance";
import { ProfiloView } from "./profilo-view";

export default async function ProfiloPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const profile = await fetchUserProfile(supabase);
  if (!profile?.onboarded) redirect("/onboarding");

  // Fetch stats in parallel
  const [txResult, declinedResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, transaction_date, amount, type"),
    supabase
      .from("declined_simulations")
      .select("id", { count: "exact", head: true }),
  ]);

  const transactions = txResult.data || [];
  const totalTransactions = transactions.length;
  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthSet = new Set(
    transactions.map((t: { transaction_date: string }) =>
      t.transaction_date.slice(0, 7)
    )
  );
  const activeMonths = monthSet.size;
  const totalImpulsiResistiti = declinedResult.count ?? 0;

  // Sparkline: last 6 months of expense spending
  const now = new Date();
  const monthlySpending: { month: string; label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("it-IT", { month: "short" });
    const amount = transactions
      .filter(
        (t: { type: string; transaction_date: string; amount: number }) =>
          t.type === "expense" && t.transaction_date.startsWith(key)
      )
      .reduce(
        (s: number, t: { amount: number }) => s + Number(t.amount),
        0
      );
    monthlySpending.push({ month: key, label, amount });
  }

  return (
    <ProfiloView
      profile={profile}
      email={user.email ?? ""}
      memberSince={user.created_at}
      stats={{
        totalTransactions,
        activeMonths,
        totalSpent,
        totalImpulsiResistiti,
      }}
      monthlySpending={monthlySpending}
    />
  );
}
