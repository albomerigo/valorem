"use server";

import { createClient } from "@/lib/supabase/server";

type ImportRow = {
  merchant: string;
  amount: number;
  type: "expense" | "income";
  transaction_date: string;
  category: string | null;
  notes: string | null;
  recurring: boolean;
};

export async function importTransactions(
  rows: ImportRow[]
): Promise<{ success: boolean; count?: number; duplicates?: number; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non autenticato" };
  if (rows.length === 0) return { success: false, error: "Nessuna transazione da importare" };

  // ── Rileva duplicati ──────────────────────────────────────────────────────────
  // Per ogni riga verifica se esiste già una transazione con stesso merchant + amount + date
  const toInsert: typeof rows = [];
  let duplicates = 0;

  for (const row of rows) {
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("merchant", row.merchant)
      .eq("amount", row.amount)
      .eq("transaction_date", row.transaction_date)
      .limit(1)
      .maybeSingle();

    if (existing) {
      duplicates++;
    } else {
      toInsert.push(row);
    }
  }

  if (toInsert.length === 0) {
    return { success: true, count: 0, duplicates };
  }

  const records = toInsert.map((r) => ({
    user_id: user.id,
    merchant: r.merchant,
    amount: r.amount,
    type: r.type,
    transaction_date: r.transaction_date,
    category: r.category,
    notes: r.notes,
    recurring: r.recurring,
  }));

  const { error } = await supabase.from("transactions").insert(records);

  if (error) return { success: false, error: error.message };
  return { success: true, count: records.length, duplicates };
}
