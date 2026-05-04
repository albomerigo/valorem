"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NewTransactionPayload = {
  merchant: string;
  category: string | null;
  amount: number;
  type: "expense" | "income";
  transactionDate: string; // formato "YYYY-MM-DD"
  recurring: boolean;
};

/**
 * Salva una nuova transazione nel database.
 * Ritorna {success: true} o {error: "..."}.
 */
export async function createTransaction(payload: NewTransactionPayload) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autenticato" };
  }

  if (payload.amount <= 0) {
    return { error: "L'importo deve essere maggiore di zero" };
  }

  if (!payload.merchant.trim()) {
    return { error: "Il nome del merchant è obbligatorio" };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    merchant: payload.merchant.trim(),
    category: payload.category,
    amount: payload.amount,
    type: payload.type,
    transaction_date: payload.transactionDate,
    recurring: payload.recurring,
  });

  if (error) {
    return { error: "Errore salvataggio: " + error.message };
  }

  // Fa sì che la dashboard si rinfreschi
  revalidatePath("/", "layout");
  return { success: true };
}
export async function updateTransaction(
  transactionId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const merchant = formData.get("merchant") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as "income" | "expense";
  const transaction_date = formData.get("transaction_date") as string;
  const recurring = formData.get("recurring") === "true";
  const notes = formData.get("notes") as string;

  if (!amount || !merchant || !category || !type || !transaction_date) {
    return { success: false, error: "Campi obbligatori mancanti" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      amount,
      merchant,
      category,
      type,
      transaction_date,
      recurring,
      notes,
    })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Errore update transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/attivita");

  return { success: true };
}
/**
 * Cancella una transazione (per il futuro, non usata in 4.6).
 */
export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}