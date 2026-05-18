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
): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non autenticato" };
  if (rows.length === 0) return { success: false, error: "Nessuna transazione da importare" };

  const toInsert = rows.map((r) => ({
    user_id: user.id,
    merchant: r.merchant,
    amount: r.amount,
    type: r.type,
    transaction_date: r.transaction_date,
    category: r.category,
    notes: r.notes,
    recurring: r.recurring,
  }));

  const { error } = await supabase.from("transactions").insert(toInsert);

  if (error) return { success: false, error: error.message };
  return { success: true, count: toInsert.length };
}
